# Stack options (free tiers)

Checked against official pages on **2026-11-24**. Limits change often — open the link and verify before you rely on a number. "Not stated" = the page didn't say; check before relying on it.

What Pronnova needs: web app + API, Postgres with relations (ER diagram), private audio storage, (later) auth with 2 roles, word + phoneme pronunciation scoring in ≤ 10 s, an LLM for suggestions (SRS names Gemini), a voice for "play correct pronunciation", ~50 concurrent users at evaluation.

## 1. Web hosting (Next.js app + API routes)
| Option | Free limits | When you cross them | Fit | Drawbacks | Source |
|---|---|---|---|---|---|
| **Vercel Hobby** | 100 GB transfer/mo, 1M function calls/mo, 4 h active CPU/mo, functions up to 300 s, **4.5 MB request body** | Hard caps; Hobby can't buy more usage | Best Next.js support. 15 s audio ≈ 0.1–0.3 MB, fits the 4.5 MB cap | Hobby is meant for personal/non-commercial use (check Terms); no team seats | [pricing](https://vercel.com/pricing), [limits](https://vercel.com/docs/functions/limitations) |
| Netlify Free | 300 credits/mo (≈ 15 GB bandwidth at 20 credits/GB) | Not stated on pricing page | Works with Next.js | Credit model is hard to predict | [pricing](https://www.netlify.com/pricing/) |
| Cloudflare Workers/Pages | 100k requests/day, **10 ms CPU** per request, 128 MB memory | Error 1027 / 1102, no billing on free | Fast, generous requests | 10 ms CPU and Next.js-on-Workers adapter add friction | [pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) |

## 2. Database
| Option | Free limits | When you cross them | Fit | Drawbacks | Source |
|---|---|---|---|---|---|
| **Supabase Free** | 500 MB DB, 2 active projects | Not stated for Free (no charges on Free) | Postgres + Storage + Auth in one; matches ER diagram | **Paused after 1 week of no activity** (unpause in dashboard) | [pricing](https://supabase.com/pricing), [billing](https://supabase.com/docs/guides/platform/billing-on-supabase) |
| Neon Free | 1 GB/project, 100 CU-hours/mo, 5 GB egress, never paused (scales to zero after 5 min) | Writes blocked over storage; compute suspended over CU/egress until next month | Plain Postgres, good | Need separate file storage; built-in auth is newer | [pricing](https://neon.com/pricing) |
| Firebase Spark | Firestore 1 GiB, 50k reads/day, 20k writes/day | Not stated | Easy realtime | NoSQL — poor fit for our relational ER model; **Cloud Storage needs paid Blaze plan** | [pricing](https://firebase.google.com/pricing) |
| MongoDB Atlas M0 | 512 MB, 100 ops/s, paused after 30 days idle | Throttled | — | NoSQL, no backups on free | [pricing](https://www.mongodb.com/pricing), [limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/) |

## 3. File storage (recordings)
| Option | Free limits | When you cross them | Fit | Drawbacks | Source |
|---|---|---|---|---|---|
| **Supabase Storage** | 1 GB, 5 GB egress, 50 MB max file | Not stated for Free | Same project, private buckets + signed URLs | 1 GB ≈ 5,000–10,000 short clips — fine for FYP | [pricing](https://supabase.com/pricing) |
| Cloudflare R2 | 10 GB-month, 1M writes, 10M reads, free egress | **Billed** (needs card) | Big headroom | Another service + card on file | [pricing](https://developers.cloudflare.com/r2/pricing/) |

## 4. Auth (FYP-2)
| Option | Free limits | When you cross them | Fit | Drawbacks | Source |
|---|---|---|---|---|---|
| **Supabase Auth** | 50,000 monthly active users | — | Same DB; roles via `profiles.role` + RLS | Tied to Supabase | [pricing](https://supabase.com/pricing) |
| Clerk Hobby | 50,000 monthly retained users | 1-month grace, then Pro $25/mo | Polished UI | Clerk branding, 7-day sessions, no MFA; user data lives outside our DB | [pricing](https://clerk.com/pricing) |

## 5. Pronunciation scoring (the core)
| Option | Free limits | When you cross them | Fit | Drawbacks | Source |
|---|---|---|---|---|---|
| **Azure Pronunciation Assessment** (F0) | 5 audio hours/mo (billed as speech-to-text); **1 concurrent request** | 429 throttling; after free hours, not stated | Gives word + **phoneme** accuracy out of the box — closest to SRS 3.2.4 (alignment + GOP-style) | Black box; 1 concurrent call on F0 | [pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/), [quotas](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-services-quotas-and-limits) |
| Azure for Students | **$100 credit, no card**, 12 months (renews while a student) | Subscription disabled when credit ends unless you upgrade | Lets us use paid S0 tier (more concurrency) for the final evaluation | One account per student | [students](https://azure.microsoft.com/en-us/free/students) |
| Own Python engine (Whisper/wav2vec2 + Montreal Forced Aligner + GOP) | Free software; cost is hosting | — | Matches the SRS research goal exactly; we own the scoring | Weeks of work; needs 2+ GB RAM; hard to hit 10 s on free CPU | [MFA docs](https://montreal-forced-aligner.readthedocs.io/) |
| Groq Whisper (ASR only) | ~20 req/min, 2k/day (page may show Developer-plan numbers) | 429 | Fast transcript | **No pronunciation scores** — only text | [rate limits](https://console.groq.com/docs/rate-limits) |
| Deepgram / AssemblyAI (ASR only) | $200 / $50 one-time credit, no card | Pay-as-you-go | Good transcripts | **No pronunciation scores** | [Deepgram](https://deepgram.com/pricing), [AssemblyAI](https://www.assemblyai.com/pricing) |

### Hosting the own Python engine
| Option | Free limits | Drawbacks | Source |
|---|---|---|---|
| Hugging Face Spaces | CPU Basic 2 vCPU / 16 GB | **Docker/Gradio CPU Spaces now need PRO** to create; free accounts get 2 ZeroGPU Gradio Spaces; sleeps when idle | [overview](https://huggingface.co/docs/hub/spaces-overview), [pricing](https://huggingface.co/pricing) |
| Render Free | 750 h/mo | Sleeps after 15 min (≈1 min wake-up → breaks the 10 s goal); RAM not stated; suspended when hours run out | [docs](https://render.com/docs/free) |
| Google Cloud Run | Has a free tier | Couldn't read numbers on 2026-11-24 — verify; needs billing account | [pricing](https://cloud.google.com/run/pricing) |
| Team laptop + tunnel | Free | Only works while the laptop is on — fine for demos | — |

## 6. LLM for suggestions (FYP-2)
| Option | Free limits | When you cross them | Fit | Drawbacks | Source |
|---|---|---|---|---|---|
| **Gemini API free tier** | Per-model limits shown in AI Studio | 429 RESOURCE_EXHAUSTED | Named in SRS | **Free-tier content may be used to improve Google's products** → send only words/sounds, never names | [pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) |
| Groq LLMs | e.g. 30 req/min, 1k/day | 429 | Very fast | Not the SRS choice | [rate limits](https://console.groq.com/docs/rate-limits) |
| Template fallback | Free | — | Required anyway (SRS 2.5, `suggestions.source = template`) | Less personal | — |

## 7. "Play correct pronunciation" (voice)
| Option | Free limits | Fit | Drawbacks | Source |
|---|---|---|---|---|
| **Browser speech (Web Speech API)** | Free, no key | Instant, works offline-ish | Voice quality varies by device | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) |
| Azure Neural TTS | 0.5M characters/mo | Same Azure account; UK + US voices | Extra calls | [pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/) |
| Google Cloud TTS | Has a free tier | Couldn't read numbers — verify | Needs billing account | [pricing](https://cloud.google.com/text-to-speech/pricing) |

## Confirmed stack (2026-11-24, see `decisions/001-stack.md`)
| Need | Pick | One-line reason |
|---|---|---|
| Web app + API | **Next.js on Vercel Hobby** | Best Next.js host, free, our audio fits the 4.5 MB limit |
| DB + storage + (later) auth | **Supabase Free** | One service covers Postgres, private audio and auth; fits the ER diagram |
| Scoring — app track | **Azure Pronunciation Assessment**, behind our engine interface, with a **mock** for dev | Only free option that gives phoneme scores today |
| Scoring — research track (**built in parallel**) | Own Python engine in `engine/`, same contract, swapped in via `SPEECH_ENGINE=python` | Meets the SRS research goal without blocking the app |
| Suggestions (FYP-2) | **Gemini free tier + template fallback** | SRS choice; fallback is required anyway |
| Correct pronunciation audio | **Browser speech first**, Azure TTS if quality is poor | Free with no setup |

Risks to watch: Supabase 1-week pause (visit or ping the project weekly), Azure F0 = 1 call at a time (use Azure for Students credit on S0 for the final eval), Gemini free data use (send no student identity).
