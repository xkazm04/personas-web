import { NextRequest } from "next/server";
import {
  OrchestratorConfigError,
  validateOrchestratorUrl,
} from "@/lib/orchestrator-config";

/**
 * Same-origin proxy for every orchestrator REST call.
 *
 * The team API key MUST NOT reach the browser bundle, so the client calls
 * `/api/orchestrator/<path>` and this handler attaches the key server-side
 * (preferring the server-only `TEAM_API_KEY`, falling back to the legacy
 * `NEXT_PUBLIC_TEAM_API_KEY` during migration). The user's own Supabase
 * session token is forwarded from the `X-User-Token` header when present.
 */
function orchestratorKey(): string | undefined {
  return process.env.TEAM_API_KEY ?? process.env.NEXT_PUBLIC_TEAM_API_KEY;
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

  const targetPath = "/" + path.map(encodeURIComponent).join("/");
  const url = new URL(targetPath, base);
  url.search = req.nextUrl.search;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = orchestratorKey();
  if (key) headers["Authorization"] = `Bearer ${key}`;
  const userToken = req.headers.get("x-user-token");
  if (userToken) headers["X-User-Token"] = userToken;

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
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
    },
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
