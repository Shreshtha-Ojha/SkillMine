/**
 * Purpose
 * -------
 * In-process token-bucket rate limiter for API routes that call expensive
 * external services (Gemini, PDF processing) or sensitive operations (login).
 *
 * Responsibilities
 * - Track request counts per arbitrary string key (typically `"routeName:IP"`).
 * - Refill tokens at a configurable rate and reject requests that exceed capacity.
 *
 * Used by
 * - /api/users/login — brute-force protection.
 * - /api/interview/ask and /api/interview/feedback — Gemini cost control.
 * - /api/ats/process — limits expensive LLM resume analysis per IP.
 *
 * Interview Talking Points
 * - Token bucket is chosen over fixed-window counters because it smooths bursts:
 *   a user who waits 30s gets some tokens back rather than hitting a hard wall.
 * - Limits are enforced server-side because client-side enforcement is trivially
 *   bypassed. Any limit logic in the browser is UX, not security.
 *
 * TODO: Replace this in-memory map with Redis (e.g. Upstash) so rate limits are
 * consistent across all Vercel serverless instances. Currently, a user can bypass
 * limits by hitting different cold-start instances.
 */

type Bucket = { tokens: number; last: number };
const BUCKETS: Map<string, Bucket> = new Map();

/**
 * Checks whether a request is within the rate limit for the given key.
 *
 * Why token bucket over fixed-window:
 * Fixed windows allow a burst of `capacity` requests at the window boundary
 * (e.g. all 10 at 00:59 and all 10 again at 01:00). Token bucket distributes
 * capacity smoothly over time and is fairer to legitimate burst users.
 *
 * @param key       Unique string identifying the limiter (e.g. `"login:192.168.1.1"`).
 * @param capacity  Max tokens (requests) allowed per refill period.
 * @param refillMs  Milliseconds between full refills.
 * @returns true if the request is allowed; false if the bucket is empty (rate limited).
 */
export function allowRequest(key: string, capacity = 10, refillMs = 60_000) {
  const now = Date.now();
  let b = BUCKETS.get(key);
  if (!b) {
    b = { tokens: capacity, last: now };
    BUCKETS.set(key, b);
  }
  // refill
  const elapsed = now - b.last;
  const refillTokens = Math.floor(elapsed / refillMs) * capacity;
  if (refillTokens > 0) {
    b.tokens = Math.min(capacity, b.tokens + refillTokens);
    b.last = now;
  }
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}

export default { allowRequest };
