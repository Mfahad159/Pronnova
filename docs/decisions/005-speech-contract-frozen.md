# ADR-005: Speech Engine contract is frozen

## Status
Accepted (2026-11-24, end of Phase 3). **Response shape superseded by ADR-010 (2026-11-28)**; the rules below still apply.

## Context
The app now stores real attempts. Two scorers are being built in parallel (Azure, our own Python engine — ADR-001). If the result shape keeps changing, stored attempts and the engine work drift apart.

## Decision
- The contract in `architecture.md` → "Speech Engine contract" (`server/speech/types.ts`: `ScoreRequest` / `ScoreResult`) is **frozen**. Every engine (`mock`, `azure`, `python`) returns exactly that shape.
- The app (not the engine) decides the classification (`lib/scoring.ts`) and stores `model_version` = `<engine>:<engine's version>` and `scoring_version` (`SCORING_VERSION` in `server/services/attempts.ts`, now `v1`).
- Changing the contract needs a new ADR, a version bump, and updates to all three adapters.

## Consequences
- The Python engine team can build against a fixed target (`POST /score`, `engine/README.md`).
- Old attempts stay comparable: every row says which engine and scoring rules produced it.
