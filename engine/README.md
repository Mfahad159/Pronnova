# Pronnova Speech Engine (Python)

Research track, built in parallel with the web app (`docs/decisions/001-stack.md`). Not started yet.

## Job
Take a recording + the reference text and return word and phoneme scores in the **exact** shape in `docs/architecture.md` → Speech Engine contract. The web app calls it through `server/speech/python.ts` when `SPEECH_ENGINE=python`.

## Endpoint
`POST /score` (multipart form): `audio` (webm/opus or wav, ≤ 15 s), `reference_text`, optional `reference_phonemes`.
Response: JSON with `recognized_text`, `score`, `words[]`, `phonemes[]`, `model_version`, `raw`. Must answer in **under 8 s** (the app times out there to keep feedback under 10 s).

## Plan (see `specs/fyp1-scope.md` → Engine track)
1. Test clips in `eval/`
2. ASR (Whisper or wav2vec2)
3. Forced alignment (e.g. Montreal Forced Aligner)
4. GOP-style phoneme scores → word scores → overall score
5. Wrap in a small web server (e.g. FastAPI) exposing `/score`
6. Compare with Azure on `eval/` clips

Pick libraries in a short decision record (`docs/decisions/`) before installing them.

## Run locally
Fill in once the server exists (Python version, `pip install -r requirements.txt`, start command, port). Then set `SPEECH_ENGINE=python` and `SPEECH_ENGINE_URL=http://localhost:<port>` in the web app's `.env.local`.
