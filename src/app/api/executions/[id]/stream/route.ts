import { NextRequest } from "next/server";

/**
 * SSE proxy that forwards an execution's live output stream from the
 * orchestrator to the browser. EventSource cannot send custom headers,
 * so the team API key is attached server-side; the optional user token
 * is forwarded if the caller passed it via the proxy headers.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL;
  if (!orchestratorUrl) {
    return new Response("Orchestrator URL not configured", { status: 503 });
  }

  const streamUrl = new URL(
    `/api/executions/${encodeURIComponent(id)}/stream`,
    orchestratorUrl,
  );

  const apiKey = process.env.TEAM_API_KEY ?? process.env.NEXT_PUBLIC_TEAM_API_KEY;
  const userToken = req.headers.get("x-user-token");
  const headers: Record<string, string> = { Accept: "text/event-stream" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  if (userToken) headers["X-User-Token"] = userToken;

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
