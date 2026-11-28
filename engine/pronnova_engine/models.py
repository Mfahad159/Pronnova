"""Model wrappers: loaded ONCE at startup, kept in memory, warmed up with a dummy input.

- Heard phonemes: facebook/wav2vec2-lv-60-espeak-cv-ft (CTC over espeak IPA, greedy decode).
- Expected phonemes: phonemizer + espeak-ng (DLL/data from espeakng-loader, no system install).
- Voice: Kokoro-82M (kokoro package), 24 kHz. Text → phonemes with espeak-ng (misaki's EspeakG2P),
  NOT Kokoro's default English front-end: that one loads a spaCy model whose compiled files Windows
  Smart App Control blocks on our laptops. espeak is also what the expected phonemes use.
One lock serialises GPU work (FYP-1: one user at a time; no queueing beyond that).
"""

from __future__ import annotations

import logging
import threading
import time

import numpy as np

from . import config  # noqa: F401  (sets HF_HOME before transformers is imported)
from .audio import SR
from .config import ASR_MODEL, TTS_REPO, settings

log = logging.getLogger("pronnova.engine")
TTS_SR = 24_000


def pick_device() -> str:
    import torch

    if settings.device == "cpu":
        return "cpu"
    if settings.device == "cuda":
        return "cuda"
    return "cuda" if torch.cuda.is_available() else "cpu"


def make_phonemizer(lang: str):
    """espeak-ng backend for phonemizer, using the espeak-ng bundled by espeakng-loader."""
    import espeakng_loader
    from phonemizer.backend import EspeakBackend
    from phonemizer.backend.espeak.wrapper import EspeakWrapper

    EspeakWrapper.set_library(espeakng_loader.get_library_path())
    if hasattr(EspeakWrapper, "set_data_path"):
        EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
    return EspeakBackend(lang, preserve_punctuation=False, with_stress=True, language_switch="remove-flags")


class Engine:
    def __init__(self) -> None:
        import torch
        from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForCTC, Wav2Vec2PhonemeCTCTokenizer, Wav2Vec2Processor

        self.lock = threading.Lock()
        self.device = pick_device()
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32
        t0 = time.perf_counter()
        # do_phonemize=False: the tokenizer only DECODES model output here. (Its text phonemizer check
        # looks for the "phonemizer" package; we ship "phonemizer-fork", which Kokoro needs.)
        self.processor = Wav2Vec2Processor(
            feature_extractor=Wav2Vec2FeatureExtractor.from_pretrained(ASR_MODEL),
            tokenizer=Wav2Vec2PhonemeCTCTokenizer.from_pretrained(ASR_MODEL, do_phonemize=False),
        )
        self.asr = Wav2Vec2ForCTC.from_pretrained(ASR_MODEL, torch_dtype=self.dtype).to(self.device).eval()
        self.phonemizer = make_phonemizer(settings.espeak_lang)
        from huggingface_hub import hf_hub_download
        from kokoro import KModel
        from misaki.espeak import EspeakG2P

        self.tts = KModel(repo_id=TTS_REPO).to(self.device).eval()
        self.tts_g2p = EspeakG2P(language="en-gb" if settings.tts_lang_code == "b" else "en-us")
        self.tts_voice = settings.tts_voice
        self.voice_pack = torch.load(hf_hub_download(TTS_REPO, f"voices/{self.tts_voice}.pt"), weights_only=True)
        log.info("models loaded on %s in %.1fs", self.device, time.perf_counter() - t0)
        self.warm_up()

    def warm_up(self) -> None:
        t0 = time.perf_counter()
        self.heard_phonemes(np.zeros(SR, dtype=np.float32))
        self.expected_phonemes(["hello"])
        self.synthesize("Hello.", 1.0)
        log.info("warm-up done in %.1fs", time.perf_counter() - t0)

    # ── Phonemes ────────────────────────────────────────────────────────────
    def heard_phonemes(self, audio16k: np.ndarray) -> str:
        """Greedy CTC decode → space-separated espeak IPA (normalised later)."""
        import torch

        inputs = self.processor(audio16k, sampling_rate=SR, return_tensors="pt")
        values = inputs.input_values.to(self.device, dtype=self.dtype)
        with self.lock, torch.inference_mode():
            logits = self.asr(values).logits
        ids = torch.argmax(logits, dim=-1)
        return self.processor.batch_decode(ids)[0]

    def expected_phonemes(self, words: list[str]) -> list[str]:
        """One IPA string per word (word boundaries kept)."""
        from phonemizer.separator import Separator

        with self.lock:
            out = self.phonemizer.phonemize(words, separator=Separator(phone=" ", word="|", syllable=""), strip=True, njobs=1)
        # One word per entry, so "|" only shows up if espeak splits a word (e.g. "can't"): drop it.
        return [o.replace("|", " ").strip() for o in out]

    # ── Voice ───────────────────────────────────────────────────────────────
    def synthesize(self, text: str, speed: float) -> np.ndarray:
        """Text → 24 kHz float32. Long text is split into sentences (Kokoro takes ≤ 510 phonemes)."""
        import re

        import torch

        chunks: list[np.ndarray] = []
        sentences = [t for t in re.split(r"(?<=[.!?])\s+", text.strip()) if t] or [text]
        with self.lock, torch.inference_mode():
            for sentence in sentences:
                ps, _ = self.tts_g2p(sentence)
                ps = ps[:500]
                if not ps:
                    continue
                audio = self.tts(ps, self.voice_pack[len(ps) - 1], speed)
                chunks.append(audio.detach().cpu().numpy())
        return np.concatenate(chunks).astype(np.float32) if chunks else np.zeros(0, dtype=np.float32)
