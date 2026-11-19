import { NextRequest, NextResponse } from "next/server";
import { assessmentService } from "@/server/services/assessmentService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const response = await assessmentService.retryEvaluation(attemptId);
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Retry queue failure";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
