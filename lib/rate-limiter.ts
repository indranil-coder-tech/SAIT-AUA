/**
 * Simple in-memory rate limiter & cooldown tracker.
 * Does not require Redis or external paid services.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, maxRequests: number, windowSeconds: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Clean old expired records periodically
  if (rateLimitMap.size > 10000) {
    rateLimitMap.forEach((v, k) => {
      if (now > v.resetAt) {
        rateLimitMap.delete(k);
      }
    });
  }

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}
