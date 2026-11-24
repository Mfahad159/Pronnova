// Recording rules shared by the browser recorder and the server (SRS 2.5 audio quality, 3.3.7).
export const RECORDING = {
  minMs: 500, // shorter = "too short, record again"
  maxMs: 15_000, // auto-stop; matches settings.recording.max_seconds
  maxBytes: 1_048_576, // = recordings bucket file_size_limit (1 MB)
  minBytes: 1_000, // smaller is almost certainly empty
  silenceLevel: 0.02, // peak RMS below this = "we couldn't hear you"
} as const;

/** Container types we accept, best first. Safari/iOS records mp4; Chrome/Firefox/Edge webm or ogg. */
export const RECORDING_MIME_PREFERENCE = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"] as const;

const EXT: Record<string, string> = { "audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/wav": "wav", "audio/x-wav": "wav", "audio/mpeg": "mp3" };

/** "audio/webm;codecs=opus" → "audio/webm". */
export const baseMime = (mime: string) => mime.split(";")[0].trim().toLowerCase();

export const isAllowedAudio = (mime: string) => baseMime(mime) in EXT;

export const audioExtension = (mime: string) => EXT[baseMime(mime)] ?? "webm";

/** Problem with a finished recording, or null. Same check runs in the browser and on the server. */
export function recordingProblem(r: { bytes: number; durationMs: number; mime: string }): string | null {
  if (!isAllowedAudio(r.mime)) return "This audio format isn't supported. Please try another browser.";
  if (r.durationMs < RECORDING.minMs || r.bytes < RECORDING.minBytes) return "That was too short. Tap record and read the whole text.";
  if (r.durationMs > RECORDING.maxMs + 1_000) return "That was too long. Keep it under 15 seconds.";
  if (r.bytes > RECORDING.maxBytes) return "The recording is too large. Please record again.";
  return null;
}

/** Normalised key for per-word error stats: lower case, letters/apostrophes only. "Brother's," → "brother's". */
export const wordUnit = (word: string) => word.toLowerCase().replace(/[^\p{L}']/gu, "");
