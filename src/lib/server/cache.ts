/**
 * Purpose
 * -------
 * Lightweight in-memory TTL cache for server-side data that is expensive to
 * fetch repeatedly within a short window (e.g. external coding platform stats,
 * community counts, pricing settings).
 *
 * Responsibilities
 * - Store arbitrary values keyed by string with a configurable TTL.
 * - Lazily evict stale entries on read rather than with a background sweep,
 *   which avoids timer overhead in a serverless environment.
 *
 * Used by
 * - External profile fetch routes (GitHub, LeetCode, Codeforces) to avoid
 *   hammering third-party APIs on every page load.
 * - /api/community/stats — aggregation query cached to reduce DB load.
 *
 * Interview Talking Points
 * - Lazy eviction is chosen over setInterval sweeps because serverless functions
 *   can be killed at any time; a background timer would leak across invocations
 *   unpredictably and wouldn't survive a cold start anyway.
 * - This cache is per-instance — two warm serverless instances cache independently.
 *   For cross-instance consistency, use a shared cache like Upstash Redis.
 *
 * TODO: Replace with Redis for cross-instance consistency and to survive
 * serverless cold starts without re-fetching immediately.
 */

// simple in-memory cache with TTL (suitable for single-instance server)
type CacheEntry<T> = { value: T; expiresAt: number };

const CACHE: Map<string, CacheEntry<any>> = new Map();

export function setCache<T>(key: string, value: T, ttlMs = 5 * 60 * 1000) {
  CACHE.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function getCache<T>(key: string): T | null {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(key);
    return null;
  }
  return entry.value as T;
}

export function clearCache(key?: string) {
  if (key) CACHE.delete(key);
  else CACHE.clear();
}

export default { setCache, getCache, clearCache };
