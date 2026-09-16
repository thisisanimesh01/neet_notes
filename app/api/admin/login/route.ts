import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { createAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { checkLoginRateLimit, getClientIp, recordFailedLogin, recordSuccessfulLogin } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Check rate limit before processing login attempt
    const rateLimit = checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${rateLimit.remainingMinutes} minute(s).`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds ?? 900),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      recordFailedLogin(ip);
      return NextResponse.json({ error: "Invalid username or password format." }, { status: 400 });
    }

    // 2. Verify admin credentials using ADMIN_PASSWORD_HASH (bcrypt)
    const valid = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
    if (!valid) {
      recordFailedLogin(ip);
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    // 3. Reset failed attempts on success
    recordSuccessfulLogin(ip);

    // 4. Create signed, HttpOnly, SameSite, Secure admin session
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Admin Login] Error:", error);
    return NextResponse.json({ error: "An error occurred during authentication." }, { status: 500 });
  }
}
