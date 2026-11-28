# Pronnova Speech Engine

Scores a child's recording against the expected text, sound by sound, and speaks the reference words. A small Python web service on `http://localhost:8001`, called **only** by the Node server (never by the browser). Decision record: `docs/decisions/010-pronnova-speech-engine.md`.

| Job | Model (free, pretrained) |
|---|---|
| Reference voice | Kokoro-82M (`kokoro`), voice `af_heart` (American English) |
| Expected sounds | `phonemizer` + espeak-ng, `en-us` (matches the voice) |
| Heard sounds | `facebook/wav2vec2-lv-60-espeak-cv-ft` (CTC, espeak IPA, Apache-2.0) |

## Setup on Windows (what we ran on the demo laptop)
1. **Python 3.12** (64-bit). PyTorch and Kokoro don't support 3.13+ yet. Check with `py -0p`.
2. Create the virtual environment inside `engine/`:
   ```powershell
   py -3.12 -m venv .venv
   ```
   ```powershell
   .venv\Scripts\python -m pip install --upgrade pip
   ```
3. **PyTorch with CUDA 12.1** (RTX 3050; needs an NVIDIA driver ≥ 531, check with `nvidia-smi`). On a PC without an NVIDIA GPU use `--index-url https://download.pytorch.org/whl/cpu` instead:
   ```powershell
   .venv\Scripts\python -m pip install torch==2.5.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu121
   ```
4. Everything else (pinned):
   ```powershell
   .venv\Scripts\python -m pip install -r requirements.txt
   ```
5. **espeak-ng and ffmpeg**: nothing to install. `espeakng-loader` ships the espeak-ng DLL + data and `imageio-ffmpeg` ships `ffmpeg.exe`, both inside the venv.
   *Optional system install instead:* install espeak-ng from its GitHub releases (`.msi`) and set `PHONEMIZER_ESPEAK_LIBRARY=C:\Program Files\eSpeak NG\libespeak-ng.dll`; install ffmpeg (`winget install Gyan.FFmpeg`) and set `FFMPEG_BINARY` to `ffmpeg.exe`.
6. **Download the models once** (~1.5 GB into `engine/.hf-cache`), so the demo works offline:
   ```powershell
   .venv\Scripts\python scripts\download_models.py
   ```
7. Optional `engine/.env` (never committed):
   ```
   ENGINE_PORT=8001
   ENGINE_DEVICE=auto
   TTS_VOICE=af_heart
   ESPEAK_LANG=en-us
   HF_HUB_OFFLINE=1
   ```
8. **Run it** (first start loads + warms the models, ~20–40 s):
   ```powershell
   .venv\Scripts\python run.py
   ```
   Check: open `http://localhost:8001/health` → `{"ok": true, "device": "cuda", ...}`.
9. In the web app's `.env.local`: `ENGINE_URL=http://localhost:8001`, `ENGINE_TIMEOUT_MS=10000`, `TTS_VOICE=af_heart` (must match the engine's voice: it is part of the audio cache key).

## Endpoints
- `GET /health` → `{ ok, device, models_loaded, engine_version, error }`
- `POST /tts` `{ text, speed: "normal" | "slow" }` → `audio/mpeg` (slow = 0.75×). Stateless; Node caches the file.
- `POST /score` multipart `audio` (webm/opus, wav, mp3, m4a) + `reference_text` →
  ```json
  { "overall": 87.5, "class": "Excellent",
    "words": [{ "text": "think", "score": 87.5,
                "phonemes": [{ "expected": "θ", "heard": "t", "status": "near" }, …] }],
    "tricky_sounds": [{ "phoneme": "θ", "count": 1 }],
    "audio_quality": { "ok": true },
    "heard_phonemes": "t ɪ ŋ k", "engine_version": "pronnova-engine-0.1.0",
    "timings": { "decode_ms": …, "asr_ms": …, "total_ms": … } }
  ```
  Unclear audio → `audio_quality: { ok: false, reason: "too_quiet" | "too_short" | "no_speech" }` and no score.

## How scoring works
1. ffmpeg decodes any input to 16 kHz mono; leading/trailing silence is trimmed by energy (25 ms frames).
2. Less than 0.5 s of speech, nothing loud enough, or no speech at all → rejected (no score).
3. Expected sounds: espeak-ng phonemises the reference text word by word (word boundaries kept).
4. Heard sounds: wav2vec2 greedy CTC decode.
5. Both go through `phonemes.normalize` (one symbol set: stress and length marks removed, `ɡ→g`, `r→ɹ`, `ɾ→t`, `ᵻ→ɪ`, `ɐ→ə`, `ɚ→ə ɹ`, glottal stop ignored, diphthongs/affricates as single tokens).
6. Weighted Needleman–Wunsch: exact = 1, near pair (`near_pairs.json`) = 0.5, substitution/deletion/insertion = 0.
7. Word = mean credit × 100 − 10 per inserted sound; overall = mean of words weighted by phoneme count; Excellent ≥ 85, Good 70–84, Average < 70 (`SCORE_EXCELLENT_MIN`, `SCORE_GOOD_MIN`).
8. `tricky_sounds` = expected sounds marked sub / del / near, counted.

## Tests
33 unit tests (normalisation, alignment, scoring, thresholds, audio quality; no models) + 6 integration tests (real models): **39 passed** on the RTX 3050.
```powershell
.venv\Scripts\python -m pytest tests\test_unit.py
```
```powershell
.venv\Scripts\python scripts\make_fixtures.py
```
```powershell
.venv\Scripts\python -m pytest tests\test_integration.py -s
```
Latency (engine running): `.venv\Scripts\python scripts\benchmark.py --runs 20`.

## Measured (2026-11-28, RTX 3050 6 GB laptop, Windows 11)
| | p50 | p95 |
|---|---|---|
| `/score`, 15 s clip, **GPU** (engine only) | 136 ms | 146 ms |
| `/score`, 15 s clip, **GPU** (HTTP round trip) | 309 ms | 348 ms |
| `/score`, 15 s clip, **CPU** (engine only) | 1 428 ms | 1 504 ms |
| `/score`, 15 s clip, **CPU** (HTTP round trip) | 1 660 ms | 1 758 ms |

Start-up: models load in ~2.4 s and warm up in ~2.2 s (GPU). GPU memory in use: ~2.5 GB of 6 GB. In the app, feedback appeared 3.3–4.9 s after pressing Send (dev server, includes upload and saving) — inside the 10 s target. `scripts/benchmark.py` reproduces the table.

## Windows notes
- **Smart App Control** (Windows 11) blocks a compiled spaCy file, which Kokoro's default English front-end loads. The engine therefore gives Kokoro **espeak-ng phonemes** (misaki `EspeakG2P`) instead — no spaCy model needed, nothing to turn off.
- The wav2vec2 phoneme tokenizer is loaded with `do_phonemize=False` (it only decodes); its text phonemizer check looks for the `phonemizer` package, while we ship `phonemizer-fork` (needed by Kokoro).
- Hugging Face warns that the cache can't use symlinks without Developer Mode: harmless (files are copied).
- `run.py` switches the console to UTF-8 so IPA symbols in the logs don't crash on cp1252.

## Phoneme symbols that needed mapping
Expected (espeak) and heard (wav2vec2) symbols differ; `phonemes.py` maps them to one set:
- stress `ˈ ˌ` and length `ː` removed on both sides (so `iː` = `i`; near pairs are normalised the same way);
- `ɡ→g`, `r→ɹ`, `ɫ→l`, `ɾ→t` (US flap), `ᵻ→ɪ`, `ɐ→ə`, `e→ɛ` (but `eɪ` stays a diphthong), `ɚ→ə ɹ`, `ɝ→ɜ ɹ`; glottal stop `ʔ` and modifiers `ʰ ʲ ʷ` dropped;
- diphthongs and affricates (`aɪ eɪ ɔɪ aʊ oʊ əʊ ɪə ɛə ʊə tʃ dʒ`) are single tokens whether written glued or space-separated.
- **Not mapped:** the model sometimes outputs vowels English doesn't use (e.g. `ø` was heard for /ɪ/ in a slow synthetic "tink"); they simply count as substitutions.

## Limitations (for the FYP-1 report)
1. **Not validated on children.** Checked only with synthetic speech (Kokoro) and Chrome's fake microphone. wav2vec2 was fine-tuned on adult CommonVoice speech; children's and Pakistani-accented voices may score lower. The 85 / 70 thresholds need calibration with real Class 1 recordings (out of scope).
2. **One "correct" pronunciation.** Expected sounds come from espeak `en-us` only; other valid accents (British, Pakistani English) can be marked as errors. Words are phonemised one at a time, so connected-speech forms (weak "the" /ðə/ vs /ði/) aren't modelled.
3. **Greedy CTC is noisy on short or unclear audio.** It can add or swap sounds (a slow synthetic "tink" was heard as "a t ø ŋ g" → 28 %); insertions cost 10 points each.
4. **Minimum speech length.** Clips with < 0.5 s of speech are rejected as too short, as briefed — a quickly said single word can be ~0.4 s. `MIN_SPEECH_S` lowers the limit.
5. **No word-level recognition.** If a child says a completely different word, it shows up as sound errors, not as "you said X" (Whisper/word ASR is out of scope).
6. **One request at a time** (a lock around the GPU); fine for one student, not for a classroom at once.
7. **TTS front-end.** Because of Smart App Control, Kokoro reads espeak phonemes instead of its dictionary front-end, so a few words may sound slightly less natural.
