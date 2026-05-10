import "server-only";
import { NextRequest, NextResponse } from "next/server";

/**
 * Resolve the client IP for rate-limit keys and abuse attribution.
 *
 * Headers like `X-Forwarded-For` are attacker-controlled when the request
 * reaches the server without a trusted proxy in front (preview deploys
 * without Vercel's edge, anyone bypassing the CDN, or platforms where the
 * header is unauthenticated). Reading the *first* XFF hop is the worst
 * case — it's whatever the attacker put in the header, so it trivially
 * defeats per-IP rate limits and skews analytics.
 *
 * Order of trust (most → least):
 *   1. `req.ip`                     — set by the platform (Vercel sets this
 *                                     to the actual TCP-connecting client).
 *   2. `x-vercel-forwarded-for`     — set by Vercel's edge; a single trusted
 *                                     value.
 *   3. `x-real-ip`                  — conventional reverse-proxy "last hop
 *                                     client" header. Only trust if proxy
 *                                     is explicitly trusted via env var.
 *   4. `x-forwarded-for` (leftmost) — only when `TRUST_PROXY=true`. The
 *                                     leftmost is the original client *if*
 *                                     all upstream hops are trusted.
 *
 * Returns `"unknown"` if no source produces a value. Callers using this for
 * security-relevant decisions (rate limit, abuse) should treat that case
 * conservatively (e.g. apply the same rate-limit bucket as a single IP).
 */
export function getClientIp(req: NextRequest): string {
  const platformIp = (req as { ip?: string | null }).ip;
  if (platformIp) return platformIp;

  const vercelForwarded = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) return vercelForwarded.split(",")[0]?.trim() || "unknown";

  const trustProxy = process.env.TRUST_PROXY === "true";
  if (trustProxy) {
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp;
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}

export async function parseJsonBody<T>(
  req: NextRequest,
  options?: { maxBytes?: number },
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  const maxBytes = options?.maxBytes;
  if (maxBytes !== undefined) {
    const header = req.headers.get("content-length");
    if (header !== null) {
      const len = Number(header);
      if (!Number.isFinite(len) || len > maxBytes) {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "Payload too large" },
            { status: 413 },
          ),
        };
      }
    }
  }
  try {
    return { ok: true, data: (await req.json()) as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}

export function jsonError(
  error: string,
  status: number,
  headers?: HeadersInit,
): NextResponse {
  return NextResponse.json({ error }, { status, headers });
}
