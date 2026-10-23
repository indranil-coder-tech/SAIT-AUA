import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { updateQuestionStatus, deleteQuestion } from "@/lib/db";
import { QuestionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Question ID is required." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const status = body?.status as QuestionStatus;

    if (!status || !["pending", "answered", "hidden"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value. Must be 'pending', 'answered', or 'hidden'." },
        { status: 400 }
      );
    }

    const updated = await updateQuestionStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Question not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Question status marked as ${status}.`,
    });
  } catch (error) {
    console.error("[api/admin/questions/[id]] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update question status." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Question ID is required." }, { status: 400 });
    }

    const deleted = await deleteQuestion(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Question not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    console.error("[api/admin/questions/[id]] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete question." },
      { status: 500 }
    );
  }
}
