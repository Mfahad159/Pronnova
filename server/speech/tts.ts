import "server-only";
import { createHash } from "node:crypto";
import { getDb } from "@/server/db/client";
import { engineTimeoutMs, engineUrl } from "./python";

// Reference voice from the Pronnova engine (Kokoro, ADR-010), cached in the private "tts" bucket.
// Key = hash(text + voice + speed): the same word is generated once and then served by signed URL.
// The engine stays stateless; only this server talks to it.

const BUCKET = "tts";
export type TtsSpeed = "normal" | "slow";
const MAX_TEXT = 300;

/** Must match the engine's TTS_VOICE, or cached files would be filed under the wrong voice. */
export const ttsVoice = () => process.env.TTS_VOICE ?? "af_heart";

export function ttsKey(text: string, speed: TtsSpeed, voice = ttsVoice()): string {
  const clean = text.trim().replace(/\s+/g, " ");
  const hash = createHash("sha256").update(`${clean}\u0000${voice}\u0000${speed}`).digest("hex").slice(0, 32);
  return `${voice}/${hash}.mp3`;
}

async function sign(path: string, expiresIn: number): Promise<string | null> {
  const { data, error } = await (await getDb()).storage.from(BUCKET).createSignedUrl(path, expiresIn);
  return error || !data ? null : data.signedUrl;
}

async function exists(path: string): Promise<boolean> {
  const [folder, name] = path.split("/");
  const { data, error } = await (await getDb()).storage.from(BUCKET).list(folder, { search: name, limit: 1 });
  return !error && !!data?.some((f) => f.name === name);
}

/** Calls the engine and stores the mp3. Throws if the engine is down (caller decides what to do). */
async function generate(text: string, speed: TtsSpeed, path: string): Promise<void> {
  const base = engineUrl();
  if (!base) throw new Error("ENGINE_URL is not set");
  const started = Date.now();
  const res = await fetch(new URL("/tts", base), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, speed }),
    signal: AbortSignal.timeout(engineTimeoutMs()),
  });
  if (!res.ok) throw new Error(`engine /tts returned ${res.status}`);
  const mp3 = await res.blob();
  const { error } = await (await getDb()).storage.from(BUCKET).upload(path, mp3, { contentType: "audio/mpeg", upsert: true });
  if (error) throw new Error(`tts upload failed: ${error.message}`);
  console.info(`[engine] /tts "${text.slice(0, 40)}" (${speed}) generated + cached in ${Date.now() - started} ms`);
}

/** Signed URL for the reference audio; generates and caches it on a miss. null = not available. */
export async function getTtsUrl(text: string, speed: TtsSpeed, expiresIn = 3600): Promise<string | null> {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean || clean.length > MAX_TEXT) return null;
  const path = ttsKey(clean, speed);
  if (!(await exists(path))) {
    try {
      await generate(clean, speed, path);
    } catch (err) {
      console.warn("[engine] tts unavailable:", (err as Error).message);
      return null;
    }
  }
  return sign(path, expiresIn);
}

/** Background job after a material is saved: make sure every item has normal + slow audio. */
export async function pregenerateTts(texts: string[]): Promise<void> {
  for (const text of new Set(texts.map((t) => t.trim()).filter(Boolean))) {
    for (const speed of ["normal", "slow"] as const) {
      const path = ttsKey(text, speed);
      try {
        if (!(await exists(path))) await generate(text, speed, path);
      } catch (err) {
        console.warn("[engine] tts pre-generation skipped:", (err as Error).message);
        return; // engine down: stop here; on-demand generation fills the gaps later
      }
    }
  }
}
