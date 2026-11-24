# ADR-001: Technology stack

## Status
**Accepted** (2026-11-24, confirmed by the team). See `../stack-options.md` for the comparison.

## Context
New project in `D:\FYP_1F` (the old prototype in `D:\FYP_1\pronnova` is reference only). `Pronnova_mds` named React + Supabase. The old prototype moved to Next.js. SRS 3.3.8 asks for separate frontend, backend and Speech Engine modules. Budget is zero.

## Decision
- Next.js (App Router, React, TypeScript, Tailwind, shadcn/ui) on Vercel Hobby.
- Supabase Free: Postgres, private Storage, Auth in FYP-2.
- Speech Engine behind one interface, **two tracks built in parallel**:
  - `azure` (Azure Pronunciation Assessment): the app uses this first, so features aren't blocked.
  - `python` (own engine: ASR + forced alignment + GOP): one teammate builds it against the same contract. When it is good enough, flip `SPEECH_ENGINE=python`.
  - `mock`: fake scores for UI work and offline dev.
- Gemini free tier + template fallback for suggestions (FYP-2).
- Browser speech (Web Speech API) to play the correct pronunciation; Azure TTS only if quality is poor.
- Zustand only for the recording session state.

## Consequences
- Backend = Next.js API routes; Speech Engine is a separate module (satisfies 3.3.8).
- Engine can be swapped without touching pages.
- Free-tier limits and risks listed in `stack-options.md`.
