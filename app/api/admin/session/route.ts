import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  fetchSessionState,
  updateCurrentQuestion,
  navigateNextQuestion,
  navigatePreviousQuestion,
  resetSessionData,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await fetchSessionState();
    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    console.error("[api/admin/session] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch session state." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const action = body?.action;

    switch (action) {
      case "set": {
        const questionId = body?.questionId === null ? null : String(body?.questionId);
        const updated = await updateCurrentQuestion(questionId);
        return NextResponse.json({ success: true, data: updated });
      }
      case "next": {
        const updated = await navigateNextQuestion();
        return NextResponse.json({ success: true, data: updated });
      }
      case "prev": {
        const updated = await navigatePreviousQuestion();
        return NextResponse.json({ success: true, data: updated });
      }
      case "clear": {
        const updated = await updateCurrentQuestion(null);
        return NextResponse.json({ success: true, data: updated });
      }
      case "reset": {
        await resetSessionData();
        const updated = await fetchSessionState();
        return NextResponse.json({
          success: true,
          data: updated,
          message: "Session questions successfully reset.",
        });
      }
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action. Supported: 'set', 'next', 'prev', 'clear', 'reset'." },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[api/admin/session] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update session state." },
      { status: 500 }
    );
  }
}
