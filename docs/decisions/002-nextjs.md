# ADR-002: Next.js Framework Adoption

## Status
Accepted. Supersedes the frontend part of ADR-001.

## Context
Pronnova was originally outlined with a generic React setup. During project initialization, the frontend was scaffolded with Next.js (App Router, React 19, TypeScript, Tailwind CSS).

The application requires:
- Clear separation between server-rendered content and client-side interactive audio recording.
- Route Handlers that talk to Supabase and the Speech Engine without exposing keys to the browser.
- Routing and layouts for separate Student and Teacher areas.

## Decision
Adopt Next.js (App Router) as the web framework, using TypeScript and Tailwind CSS.

## Consequences 
- **Structure:** Application code lives under `app/` using Next.js conventions (`layout.tsx`, `page.tsx`, route groups).
- **Component boundaries:** Audio recording and other interactive components use `"use client"`. Pages, layouts, and data loading stay Server Components.
- **Backend role:** Route Handlers call Supabase and the Python Speech Engine (ADR-001). Secrets stay server-side.
- **Skills registry:** `next-best-practices` moves to "install when the phase starts".
- **State:** React hooks for local state. Zustand only once store conventions are final.
