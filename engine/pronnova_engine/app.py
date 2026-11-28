"""HTTP API. Called ONLY by the Node backend (never the browser).

GET  /health → { ok, device, models_loaded, engine_version }
POST /tts    { text, speed: "normal" | "slow" } → audio/mpeg (stateless; Node caches it)
POST /score  multipart: audio (webm/opus/wav/mp3), reference_text → scores (see README)
"""

from __future__ import annotations

import logging
import re
import subprocess
import time
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from . import ENGINE_VERSION
from .audio import check_quality, decode, ffmpeg_binary
from .config import settings
from .phonemes import normalize
from .scoring import Thresholds, WordInput, score_words

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("pronnova.engine")

STATE: dict = {"engine": None, "error": None}
THRESHOLDS = Thresholds(settings.excellent_min, settings.good_min, settings.insertion_penalty)
WORD_RE = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)*|\d+")
MAX_TEXT = 300


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        from .models import Engine

        STATE["engine"] = Engine()
    except Exception as err:  # keep serving /health so Node can see what's wrong
        log.exception("model loading failed")
        STATE["error"] = str(err)
    yield


app = FastAPI(title="Pronnova Speech Engine", version=ENGINE_VERSION, lifespan=lifespan)


def engine():
    if STATE["engine"] is None:
        raise HTTPException(status_code=503, detail=f"models not loaded: {STATE['error'] or 'starting'}")
    return STATE["engine"]


@app.get("/health")
def health():
    e = STATE["engine"]
    return {
        "ok": e is not None,
        "device": e.device if e else None,
        "models_loaded": e is not None,
        "engine_version": ENGINE_VERSION,
        "error": STATE["error"],
    }


# ── TTS ──────────────────────────────────────────────────────────────────────
class TtsRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT)
    speed: str = Field(default="normal", pattern="^(normal|slow)$")


def to_mp3(audio: np.ndarray, sr: int) -> bytes:
    proc = subprocess.run(
        [ffmpeg_binary(), "-hide_banner", "-loglevel", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "pipe:0",
         "-codec:a", "libmp3lame", "-b:a", "64k", "-f", "mp3", "pipe:1"],
        input=audio.astype(np.float32).tobytes(),
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0 or not proc.stdout:
        raise RuntimeError("mp3 encoding failed")
    return proc.stdout


@app.post("/tts")
def tts(req: TtsRequest):
    from .models import TTS_SR

    t0 = time.perf_counter()
    audio = engine().synthesize(req.text.strip(), 0.75 if req.speed == "slow" else 1.0)
    if audio.size == 0:
        raise HTTPException(status_code=422, detail="nothing to say")
    mp3 = to_mp3(audio, TTS_SR)
    log.info("tts %r speed=%s %.0f ms (%.1fs audio)", req.text[:40], req.speed, (time.perf_counter() - t0) * 1000, audio.size / TTS_SR)
    return Response(content=mp3, media_type="audio/mpeg", headers={"X-Engine-Version": ENGINE_VERSION})


# ── Scoring ──────────────────────────────────────────────────────────────────
@app.post("/score")
async def score(audio: UploadFile = File(...), reference_text: str = Form(...)):
    timings: dict[str, float] = {}
    t0 = time.perf_counter()
    words = WORD_RE.findall(reference_text or "")
    if not words or len(reference_text) > MAX_TEXT:
        raise HTTPException(status_code=422, detail="reference_text must contain 1–300 characters of words")
    data = await audio.read()
    eng = engine()

    try:
        wav = decode(data)
    except ValueError as err:
        raise HTTPException(status_code=422, detail=str(err)) from err
    timings["decode_ms"] = (time.perf_counter() - t0) * 1000

    ok, reason, trimmed = check_quality(wav)
    if not ok:
        timings["total_ms"] = (time.perf_counter() - t0) * 1000
        log.info("score %r rejected: %s (%.0f ms)", reference_text[:40], reason, timings["total_ms"])
        return JSONResponse({"overall": None, "class": None, "words": [], "tricky_sounds": [],
                             "audio_quality": {"ok": False, "reason": reason}, "heard_phonemes": "",
                             "engine_version": ENGINE_VERSION, "timings": timings})

    t1 = time.perf_counter()
    expected_raw = eng.expected_phonemes(words)
    timings["phonemize_ms"] = (time.perf_counter() - t1) * 1000
    t2 = time.perf_counter()
    heard_raw = eng.heard_phonemes(trimmed)
    timings["asr_ms"] = (time.perf_counter() - t2) * 1000

    t3 = time.perf_counter()
    result = score_words([WordInput(w, normalize(p)) for w, p in zip(words, expected_raw)], normalize(heard_raw), t=THRESHOLDS)
    timings["align_ms"] = (time.perf_counter() - t3) * 1000
    timings["total_ms"] = (time.perf_counter() - t0) * 1000
    log.info("score %r -> %.1f %s | %s", reference_text[:40], result.overall, result.cls,
             " ".join(f"{k}={v:.0f}" for k, v in timings.items()))
    return {
        "overall": result.overall,
        "class": result.cls,
        "words": result.words,
        "tricky_sounds": result.tricky_sounds,
        "audio_quality": {"ok": True},
        "heard_phonemes": " ".join(normalize(heard_raw)),
        "engine_version": ENGINE_VERSION,
        "timings": timings,
        "speech_seconds": round(len(trimmed) / 16000, 2),
    }
