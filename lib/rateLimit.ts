/**
 * Minimal in-memory rate limiter to deter spammy repeated submissions.
 * Note: this resets whenever the server process restarts and is per-instance,
 * so on multi-instance/serverless deployments prefer a shared store (e.g. Redis)
 * for stronger guarantees. This is enough to stop naive automated spam.
 */
const hits = new Map<string, { count: number; windowStart: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}
