/**
 * In-memory, per-IP rate limiting for the votes endpoint. Resets on deploy.
 * IP is used only transiently here — never persisted to disk or database.
 */

import { isRateLimited as isSharedRateLimited } from "@/lib/server/rate-limit";

export function isRateLimited(ip: string): boolean {
  return isSharedRateLimited({
    namespace: "votes",
    key: ip,
    limit: 20,
    windowMs: 60_000,
  });
}
