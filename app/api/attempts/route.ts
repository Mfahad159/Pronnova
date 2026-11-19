import { NextRequest, NextResponse } from "next/server";
import { assessmentService } from "@/server/services/assessmentService";
import { validateAttemptFormData } from "@/server/validators/attemptValidator";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const validation = await validateAttemptFormData(formData);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error ?? "Invalid attempt payload" },
        { status: 400 }
      );
    }

    const { exerciseId, durationMs, audioBlob } = validation.data;
    const result = await assessmentService.evaluateAttempt(
      exerciseId,
      durationMs,
      audioBlob
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal assessment failure";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
