<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pronnova — Rules for AI agents

Pronnova: English pronunciation practice and assessment web app for Pakistani school students (Class 6–10), with a teacher dashboard. Source of truth for requirements: `Pronnova_SRS_Updated_28_oct.docx`. Read the Markdown copy `docs/srs.md` instead (search for the UC-xx or section you need).

## Read order (save tokens)
1. `docs/index.md` — map of all docs. Always first.
2. `docs/codebase-index.md` — map of every folder, route, API, table. Open only the files it points you to.
3. The doc for your task (architecture, design, a spec). Nothing else.

Do not scan the whole repo. If the index is wrong or missing something, fix the index in the same change.

## Rules
1. **Spec first.** Check the SRS use case (UC-xx) and any file in `specs/` before building a feature.
2. **Small changes.** Build only the asked scope. No unrelated refactors.
3. **No new dependencies without asking.** Stack choices live in `docs/stack-options.md` and `docs/decisions/`.
4. **Secrets stay on the server.** Never commit `.env*`. Never call Supabase with the service key from the browser.
5. **Keep docs in sync.** When you add, move or rename a file, route, API or table, update `docs/codebase-index.md`. When behaviour or setup changes, update `docs/team-guide.md`.
6. **Flag conflicts.** If SRS, docs, code or design disagree, make a sensible call, write it in `docs/index.md` → "Open conflicts", and tell the user.
7. **Honest reporting.** Don't say tests pass unless you ran them.

## Next.js note
When the app is scaffolded, Next.js writes its own agent rules block into this file. Read the matching guide in `node_modules/next/dist/docs/` before writing Next.js code — the installed version may differ from what you know.

## Skills
Approved agent skills and UI resources: `docs/agent-skills.md`.
