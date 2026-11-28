import { getTtsUrl, type TtsSpeed } from "@/server/speech/tts";

/**
 * GET /api/tts?text=cat&speed=normal|slow → { url } (signed, 1 h) for the engine's reference voice.
 * Cached by hash(text + voice + speed); generated on a cache miss. 503 → the browser falls back to
 * its own voice. The browser never calls the engine directly.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const text = (params.get("text") ?? "").trim();
  const speed: TtsSpeed = params.get("speed") === "slow" ? "slow" : "normal";
  if (!text || text.length > 300) return Response.json({ error: "Text must be 1–300 characters." }, { status: 400 });
  const url = await getTtsUrl(text, speed);
  if (!url) return Response.json({ error: "The reference voice isn't available right now." }, { status: 503 });
  return Response.json({ url }, { headers: { "Cache-Control": "private, max-age=600" } });
}
