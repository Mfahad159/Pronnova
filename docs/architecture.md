# Architecture

## 1. Overview

Pronnova is a Next.js web app backed by Supabase and a separate Python Speech Engine. The browser records audio. Next.js server code stores it, calls the Speech Engine, and saves results.

```
+--------------------------------------------------------+
|  Browser: /student/*  and  /teacher/*                  |
|  (Client Components: recorder, interactive UI)         |
+---------------------------+----------------------------+
                            |
+---------------------------v----------------------------+
|  Next.js server                                        |
|  - Server Components (pages, data loading)             |
|  - Route Handlers (orchestration, all secrets)         |
+------+---------------------+---------------------+-----+
       |                     |                     |
       v                     v                     v
+-------------+     +------------------+   +------------------+
|  Supabase   |     |  Speech Engine   |   | External AI      |
|  PostgreSQL |     |  (Python)        |   | service          |
|  Storage    |     |  ASR, alignment, |   | (suggestions,    |
|  Auth: not  |     |  scoring         |   |  FYP-2)          |
|  in FYP-1   |     +------------------+   +------------------+
+-------------+
```

## 2. Components

### Frontend (Next.js App Router)
- Next.js with React 19, TypeScript, Tailwind CSS.
- Server Components by default for pages, layouts, and data loading.
- `"use client"` only for interactive controls and browser audio recording.
- Local React state. Zustand only once store conventions are final.
- Student pages under `/student/*`, teacher pages under `/teacher/*`.

### Database and storage (Supabase)
- PostgreSQL for content, attempts, and word results.
- Storage bucket (private) for recorded audio. Server hands out short-lived signed URLs.
- Authentication is out of FYP-1 (ADR-003). It is planned for FYP-2.

### Speech Engine (Python service)
- Takes audio and reference text. Returns transcript, per-word scores, and optional sound-level results.
- Called only from Route Handlers. Contract in `specs/fyp1-implementation-plan.md`.
- A mock mode (`SPEECH_ENGINE=mock`) lets the web app run without the service.

### External AI service (FYP-2)
- Generates personalized suggestions from a student's repeated errors. Called from server code only.

## 3. Rules

- **Server-first:** keep components as Server Components unless they need browser APIs or client state.
- **No auth in FYP-1:** do not add login, sign-up, sessions, or auth libraries. Roles are separated by route and seeded demo identities.
- **Server-only data access:** the browser never talks to Supabase directly. Route Handlers use the service key. RLS stays on with no anon policies.
- **Secrets:** AI keys, Supabase service key, and Speech Engine URL live in server env vars only.
- **Modular logic:** audio handling, scoring, and data access live in `lib/`. No duplication in pages or handlers.
- **Don't lose attempts:** if assessment fails, keep the attempt and audio and show a retry message (SRS 3.3.7).
- **Latency:** feedback within 10 seconds of submit (SRS 3.3.3). Measure it when choosing the speech model.