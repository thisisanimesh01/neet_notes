/**
 * In-memory rate limiter for sensitive authentication endpoints (e.g. admin login).
 * Enforces a maximum number of failed attempts within a sliding time window.
 */

interface RateLimitEntry {
  failedAttempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

// Map IP -> RateLimitEntry
const rateLimitMap = new Map<string, RateLimitEntry>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes window

/**
 * Extracts client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Checks if the given IP address is currently allowed to attempt login.
 */
export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingMinutes?: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  // If currently locked out
  if (entry.lockedUntil > now) {
    const remainingMs = entry.lockedUntil - now;
    return {
      allowed: false,
      remainingMinutes: Math.ceil(remainingMs / (60 * 1000)),
      retryAfterSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  // If window expired, clean up entry
  if (now - entry.lastAttempt > WINDOW_DURATION_MS) {
    rateLimitMap.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Records a failed login attempt for the given IP address.
 */
export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) ?? {
    failedAttempts: 0,
    lockedUntil: 0,
    lastAttempt: now,
  };

  entry.failedAttempts += 1;
  entry.lastAttempt = now;

  if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  rateLimitMap.set(ip, entry);
}

/**
 * Clears failed attempts upon a successful login.
 */
export function recordSuccessfulLogin(ip: string) {
  rateLimitMap.delete(ip);
}
