import { NextRequest, NextResponse } from "next/server";
import { updateCurrentQuestion, fetchSessionState } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const questionId = body?.questionId === null ? null : String(body?.questionId || "");

    const updated = await updateCurrentQuestion(questionId || null);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[api/display/spotlight] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update spotlight question." },
      { status: 500 }
    );
  }
}
