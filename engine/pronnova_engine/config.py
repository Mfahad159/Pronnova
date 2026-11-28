"""Settings from environment variables (and an optional engine/.env file, never committed).

ENGINE_PORT=8001            port uvicorn listens on (run.py)
ENGINE_DEVICE=auto          auto | cuda | cpu   (auto = CUDA if torch.cuda.is_available())
TTS_VOICE=af_heart          Kokoro voice; af_* / am_* = American English (lang "a", phonemes en-us)
ESPEAK_LANG=en-us           espeak voice for the expected phonemes (match the TTS accent)
SCORE_EXCELLENT_MIN=85      class thresholds (FYP-1 scope: ≥85 / 70–84 / <70)
SCORE_GOOD_MIN=70
INSERTION_PENALTY=10        points off a word per inserted sound
HF_HOME=engine/.hf-cache    where models are stored (download_models.py fills it)
HF_HUB_OFFLINE=1            after downloading: never touch the network
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

ENGINE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    env = ENGINE_DIR / ".env"
    if not env.exists():
        return
    for line in env.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()
# Models live inside the project (offline demo), unless HF_HOME is set explicitly.
os.environ.setdefault("HF_HOME", str(ENGINE_DIR / ".hf-cache"))

ASR_MODEL = "facebook/wav2vec2-lv-60-espeak-cv-ft"
TTS_REPO = "hexgrad/Kokoro-82M"


@dataclass(frozen=True)
class Settings:
    port: int = int(os.environ.get("ENGINE_PORT", "8001"))
    device: str = os.environ.get("ENGINE_DEVICE", "auto")
    tts_voice: str = os.environ.get("TTS_VOICE", "af_heart")
    espeak_lang: str = os.environ.get("ESPEAK_LANG", "en-us")
    excellent_min: float = float(os.environ.get("SCORE_EXCELLENT_MIN", "85"))
    good_min: float = float(os.environ.get("SCORE_GOOD_MIN", "70"))
    insertion_penalty: float = float(os.environ.get("INSERTION_PENALTY", "10"))

    @property
    def tts_lang_code(self) -> str:
        # Kokoro: "a" = American English, "b" = British English. Voice prefix tells which.
        return "b" if self.tts_voice.startswith(("bf_", "bm_")) else "a"


settings = Settings()
