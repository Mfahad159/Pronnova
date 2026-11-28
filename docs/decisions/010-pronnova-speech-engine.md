# ADR-010: Pronnova Speech Engine (phoneme scoring + reference voice), new engine contract

## Status
Accepted (2026-11-28, team brief). Supersedes the response shape frozen in ADR-005 (the rules of ADR-005 still hold: one contract, versioned results).

## Context
The app scored attempts with a mock. The team wants a real, free, offline engine on the demo laptop (RTX 3050 6 GB, 16 GB RAM), with reliable fallbacks and the UC-04/UC-06 rules intact: save first, never lose an attempt, Retry re-scores the same audio.

## Decision
- **Service:** `engine/` — Python 3.12, FastAPI + uvicorn on `http://localhost:8001`, called ONLY by the Node server. Models load once at start-up, are warmed up, and one lock serialises GPU work. CUDA if available, else CPU (`ENGINE_DEVICE`).
- **Models (free, pretrained, no training):** Kokoro-82M (voice `af_heart`, American English); phonemizer + espeak-ng `en-us` for expected phonemes; `facebook/wav2vec2-lv-60-espeak-cv-ft` (Apache-2.0) for heard phonemes. espeak-ng and ffmpeg come from pip (`espeakng-loader`, `imageio-ffmpeg`): no system install.
- **Scoring (pure, unit-tested):** both phoneme sequences are normalised to one symbol set (stress and length marks removed, multi-character symbols tokenised the same way); weighted Needleman–Wunsch alignment (match 1, near pair 0.5 from `near_pairs.json`, else 0); word score = mean credit × 100 − 10 per inserted sound; overall = word scores weighted by phoneme count; Excellent ≥ 85, Good 70–84, Average < 70.
- **Audio quality:** < 0.5 s of speech, too quiet, or no speech → `audio_quality.ok = false`, no score. The attempt is stored as **`rejected`** (new status, migration 0005) and the student records again.
- **Contract (`POST /score`):** `{ overall, class, words[{ text, score, phonemes[{ expected, heard, status }] }], tricky_sounds[{ phoneme, count }], audio_quality, engine_version }`. Node maps it in `server/speech/python.ts` → `ScoreResult` (+ `audioQuality`, `trickySounds`, word/phoneme `status`).
- **Storage:** word and phoneme statuses + positions are saved (0005); `complete_attempt` keeps one transaction for results + `error_stats` (words and phonemes). `scoring_version` = `v2`.
- **TTS:** `POST /tts` returns MP3. Node caches it in a private `tts` bucket under `hash(text + voice + speed)` and serves signed URLs (`GET /api/tts`). Every item is generated in the background after a material is saved (`after()`); missing words are generated on demand. The browser voice is only a fallback.
- **Failures:** timeout (`ENGINE_TIMEOUT_MS`, default 10 s), engine down or an error → the attempt stays `failed` with **Try checking again** (re-scores the stored audio). The mock scorer is no longer in the app; it lives in `tests/doubles/` as a test double.

## Consequences
- The engine must be running for scoring; `engine/README.md` has the Windows setup and `scripts/download_models.py` makes the demo work offline.
- Out of scope (not built): Whisper/word ASR, accent tips, teacher calibration, AI suggestions, fine-tuning, streaming, multi-user GPU queueing.
- Known limits are listed in `engine/README.md` → Limitations (for the FYP-1 report).
- **Landing demo** (added 2026-11-28): the "Apple" demo is scored live by the same engine through `POST /api/demo/score` (fixed word, no database writes); the last 5 tries are kept in the browser's localStorage only.
