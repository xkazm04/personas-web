/**
 * Shared in-memory, per-IP rate limiter.
 *
 * ── Why this module returns a result object, not a boolean ──────────────
 * This function used to return a bare `boolean`. Five routes wrapped it in
 * five locally-named helpers, and each wrapper's caller had to *remember*
 * which direction the boolean pointed. One of them (the waitlist route) got
 * it backwards and branched on the negation, so within every window the first
 * N requests were refused with 429 and every request after the limit was
 * admitted — the limiter ran inverted, in production, silently.
 *
 * A bare boolean whose name does not carry its direction is the defect. So:
 *   - `checkRateLimit` returns a named result (`allowed`), never a boolean.
 *   - `rateLimitGuard` returns the refusal *response*, or `null` to proceed.
 *     There is no polarity left for a caller to guess: the only non-null
 *     value it can produce IS the 429.
 * Do not add a boolean-returning wrapper back. `if (limited)` and
 * `if (!limited)` are both compile-clean, which is exactly how this got here.
 *
 * ── Scope of protection ─────────────────────────────────────────────────
 * State is a process-local `Map`. It is reset on every cold start and is not
 * shared between serverless instances or between `next start` workers, so N
 * warm instances allow up to N x `limit` in aggregate. This bounds casual
 * abuse and accidental client retry storms; it is NOT a defence against a
 * distributed attacker. Real cross-instance limiting needs a shared store
 * (Redis / Postgres) and belongs at the edge.
 *
 * IPs are used only as transient bucket keys here and are never persisted.
 */

import "server-only";
import { apiError } from "./request";
import type { NextResponse } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let cleanupStarted = false;

function cleanupExpiredBuckets(now = Date.now()) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

function ensureCleanup() {
  if (cleanupStarted || typeof setInterval === "undefined") return;
  cleanupStarted = true;
  const timer = setInterval(() => cleanupExpiredBuckets(), 5 * 60_000);
  timer.unref?.();
}

export interface RateLimitOptions {
  namespace: string;
  key: string;
  /** Max requests admitted per window. The (limit+1)th is refused. */
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  /**
   * `true` when the request is within budget and MUST be served.
   * `false` when it must be refused with 429. The field name states the
   * direction so a caller cannot invert it without reading a wrong word.
   */
  allowed: boolean;
  /** Epoch ms at which this key's window resets and the budget refills. */
  resetAt: number;
  /** Whole seconds until `resetAt`, minimum 1 — the `Retry-After` value. */
  retryAfterSeconds: number;
}

/**
 * Count this request against `namespace:key` and report whether it may be
 * served. Calling this HAS a side effect: it consumes one unit of budget.
 * Call it exactly once per request, at the top of the handler.
 */
export function checkRateLimit({
  namespace,
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  ensureCleanup();
  const now = Date.now();
  const bucketKey = `${namespace}:${key}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(bucketKey, { count: 1, resetAt });
    return { allowed: true, resetAt, retryAfterSeconds: secondsUntil(resetAt, now) };
  }

  bucket.count += 1;
  return {
    allowed: bucket.count <= limit,
    resetAt: bucket.resetAt,
    retryAfterSeconds: secondsUntil(bucket.resetAt, now),
  };
}

function secondsUntil(resetAt: number, now: number): number {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}

/**
 * The single door every rate-limited route goes through.
 *
 * Returns the 429 refusal to return immediately, or `null` when the request
 * is within budget and the handler should continue:
 *
 *     const refusal = rateLimitGuard({ namespace: "votes", key: ip, limit: 20, windowMs: 60_000 });
 *     if (refusal) return refusal;
 *
 * Every route refusing through this helper produces the *same* refusal shape
 * — status 429, body `{ error, code: "rate_limited" }`, and a `Retry-After`
 * header derived from the real window reset rather than a hardcoded guess.
 */
export function rateLimitGuard(options: RateLimitOptions): NextResponse | null {
  const result = checkRateLimit(options);
  if (result.allowed) return null;
  return apiError("Too many requests", "rate_limited", 429, {
    "Retry-After": String(result.retryAfterSeconds),
  });
}
