export interface ValidatedAttemptPayload {
  exerciseId: string;
  durationMs: number;
  audioBlob: Blob;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function validateAttemptFormData(
  formData: FormData
): Promise<ValidationResult<ValidatedAttemptPayload>> {
  const audioEntry = formData.get("audio");
  if (!audioEntry || !(audioEntry instanceof Blob)) {
    return {
      success: false,
      error: "Audio recording file is required and must be a valid audio payload.",
    };
  }

  if (audioEntry.size < 50) {
    return {
      success: false,
      error: "Audio payload is empty or too short to analyze.",
    };
  }

  const exerciseIdEntry = formData.get("exerciseId");
  const exerciseId =
    typeof exerciseIdEntry === "string" && exerciseIdEntry.trim().length > 0
      ? exerciseIdEntry.trim()
      : "default";

  const durationMsEntry = formData.get("durationMs");
  const parsedDuration = Number(durationMsEntry);
  const durationMs = Number.isFinite(parsedDuration) && parsedDuration >= 0 ? parsedDuration : 0;

  return {
    success: true,
    data: {
      exerciseId,
      durationMs,
      audioBlob: audioEntry,
    },
  };
}
