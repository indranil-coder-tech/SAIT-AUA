import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { fetchQuestions } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const format = request.nextUrl.searchParams.get("format") || "json";
    const questions = await fetchQuestions({ includeHidden: true });

    if (format === "csv") {
      const headers = ["Sequence", "ID", "Status", "Created At", "Question"];
      const rows = questions.map((q) => {
        const escapedQ = `"${q.question.replace(/"/g, '""')}"`;
        return [q.sequence_number || "", q.id, q.status, q.created_at, escapedQ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\r\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sait-questions-backup-${Date.now()}.csv"`,
        },
      });
    }

    // Default JSON backup
    const jsonContent = JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        total_count: questions.length,
        questions,
      },
      null,
      2
    );

    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="sait-questions-backup-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("[api/admin/export] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export question backup." },
      { status: 500 }
    );
  }
}
