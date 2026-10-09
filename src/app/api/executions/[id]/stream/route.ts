import { NextRequest } from "next/server";
import { verifySession } from "@/app/api/orchestrator/userSession";
import {
  OrchestratorConfigError,
  validateOrchestratorUrl,
} from "@/lib/orchestrator-config";

/**
 * SSE proxy that relays an execution's live output stream from the
 * orchestrator to the browser.
 *
 * The team API key carries the orchestrator's full authority, so it is
 * attached only for a caller whose X-User-Token Supabase verifies as a live
 * session (`userSession.ts`). An anonymous caller gets 401 and nothing
 * leaves this server. The desktop serves no stream, so with
 * ORCHESTRATOR_TARGET=desktop the route answers 501 not_on_desktop.
 * EventSource sends no token, so the browser falls back to polling until a
 * transport that carries the session exists.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

  if (process.env.ORCHESTRATOR_TARGET === "desktop") {
    return Response.json(
      {
        error: "not_on_desktop",
        method: "GET",
        path: `/api/executions/${id}/stream`,
      },
      { status: 501 },
    );
  }

  if (id === "" || id === "." || id === "..") {
    return Response.json({ error: "bad_path" }, { status: 400 });
  }
  const streamUrl = new URL(`/api/executions/${encodeURIComponent(id)}/stream`, base);
  if (streamUrl.origin !== new URL(base).origin) {
    return Response.json({ error: "bad_path" }, { status: 400 });
  }

  const apiKey = process.env.TEAM_API_KEY ?? process.env.NEXT_PUBLIC_TEAM_API_KEY;
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "X-User-Token": userToken,
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  let upstream: Response;
  try {
    upstream = await fetch(streamUrl.toString(), {
      headers,
      signal: req.signal,
    });
  } catch (err) {
    // Client disconnected mid-flight (most often during EventSource
    // reconnect storms) — return 499 with no body. Don't pollute Sentry
    // with the AbortError; the client already knows it aborted.
    if (
      (err instanceof DOMException && err.name === "AbortError") ||
      (err as { name?: string } | null)?.name === "AbortError"
    ) {
      return new Response(null, { status: 499 });
    }
    // Any other error (DNS, ECONNREFUSED, TLS) is real upstream
    // unreachable. Return a JSON 502 the EventSource onerror path can
    // branch on, and never surface the orchestrator hostname.
    return new Response(
      JSON.stringify({ error: "upstream_unreachable" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Normalize the upstream status before forwarding. The Response
  // constructor throws RangeError on values outside 200-599, so a 1xx
  // (informational) or 0 (some Node fetch impls when the response was
  // never assembled) blew up here and produced an unhandled 500 with no
  // body — which EventSource then interpreted as "connection died,
  // reconnect immediately", driving an infinite reconnect storm.
  if (!upstream.ok || !upstream.body) {
    const safeStatus =
      upstream.status >= 200 && upstream.status < 600 ? upstream.status : 502;
    return new Response(
      JSON.stringify({ error: "upstream_unreachable" }),
      {
        status: safeStatus,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
