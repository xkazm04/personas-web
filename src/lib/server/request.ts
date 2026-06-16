import "server-only";
import { createHash } from "crypto";
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

  // No trusted IP source. Collapsing every anonymous client into a single
  // `"unknown"` bucket means one client (or normal traffic) exhausts the
  // *global* per-IP limit and locks everyone else out. Instead, derive a
  // coarse per-client key from stable request headers so distinct clients
  // land in distinct buckets. This is best-effort entropy and trivially
  // spoofable, so it is NOT used for trust/identity — only to avoid a global
  // self-DoS. Real cross-instance limiting needs a shared store (Redis/DB).
  const fingerprintSource = [
    req.headers.get("user-agent") ?? "",
    req.headers.get("accept-language") ?? "",
    req.headers.get("accept-encoding") ?? "",
    // Untrusted XFF/real-ip: useless for identity here, fine as entropy.
    req.headers.get("x-forwarded-for") ?? "",
    req.headers.get("x-real-ip") ?? "",
  ].join("|");
  if (fingerprintSource.replace(/\|/g, "") === "") return "unknown";
  const fp = createHash("sha256").update(fingerprintSource).digest("hex");
  return `fp:${fp.slice(0, 16)}`;
}

function tooLarge(): { ok: false; response: NextResponse } {
  return {
    ok: false,
    response: NextResponse.json({ error: "Payload too large" }, { status: 413 }),
  };
}

function invalidJson(): { ok: false; response: NextResponse } {
  return {
    ok: false,
    response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
  };
}

function concatChunks(chunks: Uint8Array[], total: number): Uint8Array {
  if (chunks.length === 1) return chunks[0];
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export async function parseJsonBody<T>(
  req: NextRequest,
  options?: { maxBytes?: number },
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  const maxBytes = options?.maxBytes;

  // Fast pre-check: a declared Content-Length over the cap lets us reject
  // early. But a missing or understated header must NOT be a way to skip the
  // cap (Transfer-Encoding: chunked sends no Content-Length), so the streaming
  // read below enforces the real ceiling against the actual bytes received.
  if (maxBytes !== undefined) {
    const header = req.headers.get("content-length");
    if (header !== null) {
      const len = Number(header);
      if (!Number.isFinite(len) || len > maxBytes) return tooLarge();
    }
  }

  // When no cap is requested (or there's no readable body), defer to the
  // platform JSON parser.
  if (maxBytes === undefined || !req.body) {
    try {
      return { ok: true, data: (await req.json()) as T };
    } catch {
      return invalidJson();
    }
  }

  // Read the stream ourselves so we can abort the moment the running total
  // exceeds maxBytes, regardless of what Content-Length claimed.
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return tooLarge();
      }
      chunks.push(value);
    }
  } catch {
    return invalidJson();
  }

  const raw = new TextDecoder().decode(concatChunks(chunks, total));
  if (raw.trim() === "") return invalidJson();
  try {
    return { ok: true, data: JSON.parse(raw) as T };
  } catch {
    return invalidJson();
  }
}

export function jsonError(
  error: string,
  status: number,
  headers?: HeadersInit,
): NextResponse {
  return NextResponse.json({ error }, { status, headers });
}
