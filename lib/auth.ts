import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sait_admin_session";
const SESSION_DURATION_HOURS = 12;

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "sait-secret-key-development-fallback-do-not-use-in-prod-xyz123";
}

export function getExpectedPin(): string {
  return process.env.ADMIN_PIN || "sait2025";
}

/**
 * Creates a cryptographically signed session token:
 * format: "issuedAt.expiry.signature"
 */
export function createSessionToken(): string {
  const issuedAt = Date.now();
  const expiry = issuedAt + SESSION_DURATION_HOURS * 60 * 60 * 1000;
  const payload = `${issuedAt}.${expiry}`;
  const hmac = crypto.createHmac("sha256", getSessionSecret());
  hmac.update(payload);
  const signature = hmac.digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Verifies a session token string
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [issuedAtStr, expiryStr, signature] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) {
    return false; // Expired
  }

  const payload = `${issuedAtStr}.${expiryStr}`;
  const hmac = crypto.createHmac("sha256", getSessionSecret());
  hmac.update(payload);
  const expectedSig = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/**
 * Checks if the current Next.js request has a valid admin session cookie
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Sets the admin session cookie on the response
 */
export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
  });
}

/**
 * Clears the admin session cookie
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
