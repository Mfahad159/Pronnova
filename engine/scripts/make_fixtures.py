"""Make the 3 sample WAVs in tests/fixtures (16 kHz mono) with the engine's own voice:

  correct.wav     "She sells sea shells."          (reference: She sells sea shells)
  one_wrong.wav   "She sells tea shells."          (reference: She sells sea shells → "sea" is wrong)
  silence.wav     2 s of near-silence              (→ audio_quality no_speech)
  think_as_tink.wav  "tink"                        (reference: think → θ flagged)

Synthetic speech is clean, so it scores higher than a child would; it checks the pipeline, not accuracy.
    .venv\\Scripts\\python scripts\\make_fixtures.py
"""

import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pronnova_engine.audio import SR, decode  # noqa: E402
from pronnova_engine.models import TTS_SR, Engine  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "tests" / "fixtures"


def resample(x: np.ndarray, sr_in: int) -> np.ndarray:
    # Through ffmpeg (same path as real uploads): float32 wav bytes → decode() at 16 kHz.
    import io

    buf = io.BytesIO()
    sf.write(buf, x, sr_in, format="WAV", subtype="FLOAT")
    return decode(buf.getvalue())


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    eng = Engine()
    # "tink" at 0.75x: at normal speed the voice says it in 0.44 s, under the 0.5 s minimum.
    for name, text, speed in [("correct", "She sells sea shells.", 1.0), ("one_wrong", "She sells tea shells.", 1.0), ("think_as_tink", "tink.", 0.75)]:
        audio = resample(eng.synthesize(text, speed), TTS_SR)
        pad = np.zeros(int(0.4 * SR), dtype=np.float32)
        sf.write(OUT / f"{name}.wav", np.concatenate([pad, audio, pad]), SR, subtype="PCM_16")
        print("wrote", name, f"{len(audio) / SR:.2f}s")
    rng = np.random.default_rng(1)
    sf.write(OUT / "silence.wav", (1e-4 * rng.standard_normal(2 * SR)).astype(np.float32), SR, subtype="PCM_16")
    print("wrote silence")


if __name__ == "__main__":
    main()
