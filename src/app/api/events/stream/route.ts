import { NextRequest } from "next/server";
import { getOptionalEnv } from "@/lib/server/env";

/**
 * SSE proxy endpoint that connects to the orchestrator's event stream
 * and forwards events to the browser. In production this proxies
 * /api/events/stream from the orchestrator; in dev it's unused since
 * the client mock handles it.
 */
export async function GET(req: NextRequest) {
  const orchestratorUrl = getOptionalEnv("NEXT_PUBLIC_ORCHESTRATOR_URL");
  if (!orchestratorUrl) {
    return new Response("Orchestrator URL not configured", { status: 503 });
  }

  const streamUrl = new URL("/api/events/stream", orchestratorUrl);

  // Forward auth headers
  const apiKey = getOptionalEnv("NEXT_PUBLIC_TEAM_API_KEY");
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
    // Client disconnected mid-flight (most often during reconnect storms)
    // — not a real failure, don't bother the client with a body it can't
    // parse and don't pollute Sentry with non-actionable noise.
    if (
      err instanceof DOMException && err.name === "AbortError"
      || (err as { name?: string } | null)?.name === "AbortError"
    ) {
      return new Response(null, { status: 499 });
    }
    // Any other error (DNS failure, ECONNREFUSED, TLS) is a real upstream
    // unreachable. Return a structured 502 the EventSource onerror path
    // can branch on, and never surface the orchestrator hostname.
    return new Response(
      JSON.stringify({ error: "upstream_unreachable" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!upstream.ok || !upstream.body) {
    // Clamp out-of-range upstream statuses (some Node fetch impls return
    // 0 when no response was assembled) — Response throws RangeError on
    // anything outside 200-599, which would otherwise surface as an
    // opaque 500 and drive an EventSource reconnect storm.
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

  // Wrap the upstream body in a heartbeat-injecting ReadableStream.
  // Without periodic traffic, idle SSE connections silently die behind
  // load balancers / corporate proxies / CDNs (typical idle timeouts:
  // 30-60s). The browser sees the connection close and reconnects
  // forever; the dashboard's ConnectionStatusIndicator stays "Connected"
  // because EventSource fires no error event when the close arrives
  // cleanly. A 25s `: keep-alive` comment line keeps any hop awake and
  // is filtered out by the EventSource parser (lines starting with `:`
  // are comments per the SSE spec).
  const encoder = new TextEncoder();
  const upstreamBody = upstream.body;
  const heartbeatStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamBody.getReader();
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          // controller already closed; stop the timer in the finally below
        }
      }, 25_000);
      const onAbort = () => {
        clearInterval(heartbeat);
        void reader.cancel().catch(() => {});
      };
      // Tear down promptly on client disconnect so heartbeats don't
      // keep firing into a closed controller and leak the upstream
      // socket beyond the request lifetime.
      req.signal.addEventListener("abort", onAbort, { once: true });
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch {
        // Upstream errored mid-stream — close cleanly so the browser
        // can decide whether to reconnect.
      } finally {
        clearInterval(heartbeat);
        req.signal.removeEventListener("abort", onAbort);
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(heartbeatStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
