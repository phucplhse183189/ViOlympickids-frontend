/**
 * Shared in-memory cache cho Leaderboard.
 * TTL 60 giây mỗi lessonId.
 */

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

const TTL_MS = 60_000; // 60 giây

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}
