import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  verifyAdminPin,
  isAuthenticated,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({
    success: true,
    authenticated: authed,
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "admin-client";

    // Rate limiting: 10 attempts per 3 minutes
    const rateCheck = checkRateLimit(`login-${ip}`, 10, 180);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Please wait ${rateCheck.retryAfter} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const pin = typeof body?.pin === "string" ? body.pin.trim() : "";

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Please enter the admin PIN." },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPin(pin);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect PIN. Please try again." },
        { status: 401 }
      );
    }

    // Generate secure session token and set cookie
    const token = createSessionToken();
    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful.",
    });
  } catch (error) {
    console.error("[api/admin/auth] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication system error." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearAdminSessionCookie();
  return NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
}
