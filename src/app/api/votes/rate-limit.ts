/**
 * In-memory, per-IP rate limiting for the votes endpoint. Resets on deploy.
 * IP is used only transiently here — never persisted to disk or database.
 */

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}
