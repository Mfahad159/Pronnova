"""Latency of POST /score on 15-second clips against a RUNNING engine (p50 / p95).

    .venv\\Scripts\\python scripts\\benchmark.py --runs 20 [--url http://127.0.0.1:8001]

Builds one 15 s clip (the engine's own voice reading a long sentence, padded to 15 s), then times
round trips the way Node calls the engine (multipart upload, wav). Start the engine with
ENGINE_DEVICE=cuda or ENGINE_DEVICE=cpu to measure each.
"""

import argparse
import io
import statistics
import time

import httpx
import numpy as np
import soundfile as sf

TEXT = ("The little duck went to the pond with her mother to swim in the cool water, "
        "and my friend and I like to read a big book about animals after school.")


def make_clip(url: str) -> bytes:
    mp3 = httpx.post(f"{url}/tts", json={"text": TEXT, "speed": "slow"}, timeout=120).content
    # Decode the mp3 through the engine's own ffmpeg path, then pad/cut to exactly 15 s.
    from pronnova_engine.audio import SR, decode

    x = decode(mp3)
    x = np.concatenate([x, np.zeros(max(0, 15 * SR - len(x)), dtype=np.float32)])[: 15 * SR]
    buf = io.BytesIO()
    sf.write(buf, x, SR, format="WAV", subtype="PCM_16")
    return buf.getvalue()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://127.0.0.1:8001")
    ap.add_argument("--runs", type=int, default=20)
    a = ap.parse_args()
    health = httpx.get(f"{a.url}/health", timeout=10).json()
    clip = make_clip(a.url)
    times, engine_ms = [], []
    for i in range(a.runs + 1):
        t0 = time.perf_counter()
        r = httpx.post(f"{a.url}/score", files={"audio": ("clip.wav", clip, "audio/wav")}, data={"reference_text": TEXT}, timeout=60)
        dt = (time.perf_counter() - t0) * 1000
        r.raise_for_status()
        if i == 0:
            continue  # first call after start-up is not representative
        times.append(dt)
        engine_ms.append(r.json()["timings"]["total_ms"])
    q = statistics.quantiles(times, n=100)
    print(f"device={health['device']} runs={a.runs} clip=15s")
    print(f"round trip  p50={statistics.median(times):.0f} ms  p95={q[94]:.0f} ms  max={max(times):.0f} ms")
    print(f"engine only p50={statistics.median(engine_ms):.0f} ms  p95={statistics.quantiles(engine_ms, n=100)[94]:.0f} ms")


if __name__ == "__main__":
    main()
