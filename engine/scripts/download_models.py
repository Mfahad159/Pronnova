"""Download every model once, so the engine (and the demo) works offline afterwards.

    .venv\\Scripts\\python scripts\\download_models.py

Fills engine/.hf-cache (or $HF_HOME): wav2vec2 phoneme model (~1.3 GB), Kokoro-82M + the chosen voice
(~330 MB). Then set HF_HUB_OFFLINE=1.
(No spaCy model: the engine gives Kokoro espeak phonemes instead, see models.py.)
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pronnova_engine.config import ASR_MODEL, TTS_REPO, settings  # noqa: E402  (sets HF_HOME)


def main() -> None:
    from huggingface_hub import hf_hub_download, snapshot_download

    print(f"-> {ASR_MODEL}")
    snapshot_download(ASR_MODEL, allow_patterns=["*.json", "*.txt", "*.bin", "*.safetensors"])
    print(f"-> {TTS_REPO} (model + voice {settings.tts_voice})")
    hf_hub_download(TTS_REPO, "config.json")
    hf_hub_download(TTS_REPO, "kokoro-v1_0.pth")
    hf_hub_download(TTS_REPO, f"voices/{settings.tts_voice}.pt")
    print("OK: all models downloaded. You can now set HF_HUB_OFFLINE=1.")


if __name__ == "__main__":
    main()
