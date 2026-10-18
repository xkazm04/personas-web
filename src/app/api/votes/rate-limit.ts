/**
 * In-memory, per-IP rate limiting for the votes endpoint. Resets on deploy.
 * IP is used only transiently here — never persisted to disk or database.
 */

import type { NextResponse } from "next/server";
import { rateLimitGuard } from "@/lib/server/rate-limit";

/** Returns the 429 to send, or `null` to serve the request. */
export function rateLimit(ip: string): NextResponse | null {
  return rateLimitGuard({
    namespace: "votes",
    key: ip,
    limit: 20,
    windowMs: 60_000,
  });
}

/**
 * The GET's budget. A bucket of its own, so reading the counts never spends
 * the caller's voting budget.
 */
export function rateLimitRead(ip: string): NextResponse | null {
  return rateLimitGuard({
    namespace: "votes-read",
    key: ip,
    limit: 60,
    windowMs: 60_000,
  });
}
