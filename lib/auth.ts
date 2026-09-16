import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "neet_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSessionSecret(): string {
  // Use ADMIN_PASSWORD_HASH as the HMAC signing secret (never exposed to client).
  // In production, ADMIN_PASSWORD_HASH is always set on the server.
  const secret =
    process.env.ADMIN_PASSWORD_HASH?.trim() ||
    process.env.RAZORPAY_KEY_SECRET?.trim() ||
    "neet-notes-fallback-internal-secret-2027";
  return secret;
}

function createHmacSignature(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

/**
 * Verify admin credentials.
 * In production:
 * - ADMIN_USERNAME and ADMIN_PASSWORD_HASH are the only credentials required.
 * - ADMIN_PASSWORD (plaintext) is NOT required or expected in production environment variables.
 * - Compares password against ADMIN_PASSWORD_HASH using bcrypt.
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === "production";
  const expectedUsername = process.env.ADMIN_USERNAME?.trim();
  const expectedHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (isProduction) {
    if (!expectedUsername || !expectedHash) {
      console.error("[Auth] ADMIN_USERNAME or ADMIN_PASSWORD_HASH is not set in production.");
      return false;
    }
  }

  const normalizedInput = username.trim();
  const targetUser = expectedUsername;

  if (!targetUser || normalizedInput !== targetUser) {
    return false;
  }

  // 1. Primary authentication: bcrypt hash comparison (production standard)
  if (expectedHash) {
    try {
      return await bcrypt.compare(password, expectedHash);
    } catch (err) {
      console.error("[Auth] bcrypt comparison error:", err);
      return false;
    }
  }

  // 2. Development-only fallback: only if running locally without a hash
  if (!isProduction && process.env.ADMIN_PASSWORD) {
    return password === process.env.ADMIN_PASSWORD.trim();
  }

  return false;
}

/**
 * Creates an HttpOnly, Secure, SameSite session cookie with a cryptographically signed HMAC token.
 */
export async function createAdminSession() {
  const cookieStore = await cookies();
  const timestamp = Date.now().toString();
  const payload = `admin_${timestamp}`;
  const signature = createHmacSignature(payload);
  const token = `${payload}.${signature}`;

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Invalidates the admin session by removing the cookie.
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Validates the admin session cookie server-side using HMAC signature and timestamp.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return false;
  }

  // Backwards compatibility for dev mode if static string was present
  if (process.env.NODE_ENV !== "production" && token === "authenticated") {
    return true;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;
  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = createHmacSignature(payload);
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expectedSignature, "hex");

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  // Check timestamp (must be within 8 hours)
  const match = payload.match(/^admin_(\d+)$/);
  if (!match) {
    return false;
  }

  const issuedAt = parseInt(match[1], 10);
  const maxAgeMs = SESSION_MAX_AGE_SECONDS * 1000;
  if (Date.now() - issuedAt > maxAgeMs) {
    return false;
  }

  return true;
}
