import { NextRequest, NextResponse } from "next/server";
import { fetchQuestions, createQuestion, fetchSessionState, isUsingSupabaseBackend } from "@/lib/db";
import { sanitizeQuestionText } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limiter";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const admin = await isAuthenticated();
    const searchParams = request.nextUrl.searchParams;
    const requestedHidden = searchParams.get("includeHidden") === "true";

    // Enforce server-side authorization: Reject unauthenticated requests attempting to view hidden questions
    if (requestedHidden && !admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required to access hidden questions." },
        { status: 401 }
      );
    }

    const includeHidden = admin && requestedHidden;
    const questions = await fetchQuestions({ includeHidden });
    const session = await fetchSessionState();

    // For public audiences, ensure hidden question is never exposed in the spotlight
    if (!admin && session.current_question?.status === "hidden") {
      session.current_question = null;
      session.current_question_id = null;
    }

    return NextResponse.json({
      success: true,
      data: {
        questions,
        session,
        isSupabase: isUsingSupabaseBackend(),
      },
    });
  } catch (error) {
    console.error("[api/questions] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch question queue." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = (forwarded ? forwarded.split(",")[0].trim() : null) || "anonymous-client";

    // 1. Rate-limiting check: allows up to 60 submissions every 30 seconds
    // to support high-concurrency auditorium/college Wi-Fi NAT environments
    const rateCheck = checkRateLimit(`submit-${ip}`, 60, 30);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `You're submitting questions too quickly. Please wait ${rateCheck.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    // 2. Honeypot check (hidden field to trap automated spambots)
    if (body.website || body.company || body.honeypot) {
      // Return 200 silently so bots don't know they were discarded
      return NextResponse.json(
        { success: true, message: "Your question is in! 🎉" },
        { status: 200 }
      );
    }

    // 3. Question sanitization and validation
    const { valid, text, error } = sanitizeQuestionText(body.question, 500);
    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    // 4. Persist to database (no personal data or IP stored)
    const newQuestion = await createQuestion(text);

    return NextResponse.json(
      {
        success: true,
        data: newQuestion,
        message: "Your question is in! 🎉 Thanks for asking. Keep the curiosity coming.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/questions] POST error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while saving your question. Please try again." },
      { status: 500 }
    );
  }
}
