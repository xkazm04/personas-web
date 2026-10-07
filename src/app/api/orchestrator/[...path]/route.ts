import { NextRequest } from "next/server";
import {
  OrchestratorConfigError,
  validateOrchestratorUrl,
} from "@/lib/orchestrator-config";
import { verifySession } from "../userSession";

/**
 * Same-origin proxy for every orchestrator REST call.
 *
 * The team API key MUST NOT reach the browser bundle, so the client calls
 * `/api/orchestrator/<path>` and this handler attaches the key server-side
 * (preferring the server-only `TEAM_API_KEY`, falling back to the legacy
 * `NEXT_PUBLIC_TEAM_API_KEY` during migration). The key carries the
 * orchestrator's full authority, so it is attached only for a caller whose
 * `X-User-Token` Supabase verifies as a live session (`userSession.ts`); that
 * token is forwarded too.
 */
function orchestratorKey(): string | undefined {
  return process.env.TEAM_API_KEY ?? process.env.NEXT_PUBLIC_TEAM_API_KEY;
}

const JSON_TYPE = /^application\/(?:[\w.+-]+\+)?json\s*(?:;|$)/i;

/**
 * Headers for a relayed answer. The proxy answers on the app's own origin, the
 * one that holds a paired phone's signing key (PHASE2-SPEC 3.5), under a site
 * CSP that allows inline script: an HTML or SVG body relayed here would run as
 * this origin. The orchestrator is a JSON API, so only a JSON type passes
 * through, anything else is served as inert text, and the answer may not be
 * sniffed, framed or run.
 */
function relayHeaders(upstreamType: string | null): Record<string, string> {
  const json = upstreamType === null || JSON_TYPE.test(upstreamType.trim());
  return {
    "Content-Type": json ? (upstreamType ?? "application/json") : "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; sandbox",
  };
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  let base: string;
  try {
    base = validateOrchestratorUrl(process.env.NEXT_PUBLIC_ORCHESTRATOR_URL);
  } catch (err) {
    if (err instanceof OrchestratorConfigError) {
      return Response.json({ error: "orchestrator_not_configured" }, { status: 503 });
    }
    throw err;
  }

  const userToken = req.headers.get("x-user-token");
  const session = await verifySession(userToken);
  if (session === "unavailable") {
    return Response.json({ error: "auth_unavailable" }, { status: 503 });
  }
  if (session !== "verified" || !userToken) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  const targetPath = "/" + path.map(encodeURIComponent).join("/");
  const url = new URL(targetPath, base);
  url.search = req.nextUrl.search;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Token": userToken,
  };
  const key = orchestratorKey();
  if (key) headers["Authorization"] = `Bearer ${key}`;

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: body || undefined,
      signal: req.signal,
    });
  } catch (err) {
    if ((err as { name?: string } | null)?.name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    // Never surface the orchestrator hostname to the client.
    return Response.json({ error: "upstream_unreachable" }, { status: 502 });
  }

  const respBody = await upstream.text();
  // Response() throws on a status outside 200-599 (some fetch impls yield 0).
  const safeStatus =
    upstream.status >= 200 && upstream.status < 600 ? upstream.status : 502;
  return new Response(respBody || null, {
    status: safeStatus,
    headers: relayHeaders(upstream.headers.get("Content-Type")),
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: Ctx) {
  return proxy(req, (await params).path);
}
