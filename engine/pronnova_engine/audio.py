"""Audio input: decode anything with ffmpeg → 16 kHz mono float32, trim silence, check quality.

`trim_silence` and `check_quality` are pure numpy (unit-tested with synthetic signals);
`decode` shells out to ffmpeg (the binary bundled by imageio-ffmpeg, or FFMPEG_BINARY).
"""

from __future__ import annotations

import os
import subprocess
from dataclasses import dataclass

import numpy as np

SR = 16_000
FRAME = 400  # 25 ms
HOP = 160  # 10 ms


@dataclass(frozen=True)
class QualityRules:
    # Brief: < 0.5 s of speech is rejected. A quick single word can be ~0.4 s: MIN_SPEECH_S lowers it.
    min_speech_s: float = float(os.environ.get("MIN_SPEECH_S", "0.5"))
    # A frame counts as speech above this level (dBFS, RMS). Quiet rooms sit around -60.
    speech_dbfs: float = -42.0
    # Even the loudest part of the clip below this → "too_quiet" (mic muted or far away).
    min_peak_dbfs: float = -35.0
    pad_s: float = 0.15  # keep a little audio around the speech when trimming


def ffmpeg_binary() -> str:
    env = os.environ.get("FFMPEG_BINARY")
    if env:
        return env
    try:
        import imageio_ffmpeg  # bundled ffmpeg.exe, no system install needed

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:  # pragma: no cover - falls back to PATH
        return "ffmpeg"


def decode(data: bytes) -> np.ndarray:
    """Any container/codec ffmpeg understands (webm/opus, wav, mp3, m4a) → float32 mono 16 kHz."""
    proc = subprocess.run(
        [ffmpeg_binary(), "-hide_banner", "-loglevel", "error", "-i", "pipe:0", "-ac", "1", "-ar", str(SR), "-f", "f32le", "pipe:1"],
        input=data,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        raise ValueError(f"could not decode audio: {proc.stderr.decode(errors='ignore').strip()[:200]}")
    return np.frombuffer(proc.stdout, dtype=np.float32).copy()


def frame_dbfs(x: np.ndarray) -> np.ndarray:
    if len(x) < FRAME:
        x = np.pad(x, (0, FRAME - len(x)))
    n = 1 + (len(x) - FRAME) // HOP
    idx = np.arange(FRAME)[None, :] + HOP * np.arange(n)[:, None]
    rms = np.sqrt(np.mean(x[idx] ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms + 1e-12)


def trim_silence(x: np.ndarray, rules: QualityRules = QualityRules()) -> tuple[np.ndarray, float]:
    """Cut leading/trailing silence. Returns (trimmed audio, seconds of speech frames)."""
    db = frame_dbfs(x)
    voiced = np.where(db > rules.speech_dbfs)[0]
    if len(voiced) == 0:
        return x[:0], 0.0
    pad = int(rules.pad_s * SR)
    start = max(0, voiced[0] * HOP - pad)
    end = min(len(x), voiced[-1] * HOP + FRAME + pad)
    speech_s = (voiced[-1] - voiced[0] + 1) * HOP / SR
    return x[start:end], speech_s


def check_quality(x: np.ndarray, rules: QualityRules = QualityRules()) -> tuple[bool, str | None, np.ndarray]:
    """→ (ok, reason, trimmed audio). reason: no_speech | too_quiet | too_short."""
    if len(x) == 0:
        return False, "no_speech", x
    db = frame_dbfs(x)
    peak = float(db.max())
    if peak < rules.min_peak_dbfs:
        # Nothing loud at all: silence (very low) or a mic that is far away / muted.
        return False, ("no_speech" if peak < rules.speech_dbfs else "too_quiet"), x[:0]
    trimmed, speech_s = trim_silence(x, rules)
    if speech_s == 0.0:
        return False, "no_speech", trimmed
    if speech_s < rules.min_speech_s:
        return False, "too_short", trimmed
    return True, None, trimmed
