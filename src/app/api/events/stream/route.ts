import { NextRequest } from "next/server";

/**
 * SSE proxy endpoint that connects to the orchestrator's event stream
 * and forwards events to the browser. In production this proxies
 * /api/events/stream from the orchestrator; in dev it's unused since
 * the client mock handles it.
 */
export async function GET(req: NextRequest) {
  const orchestratorUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL;
  if (!orchestratorUrl) {
    return new Response("Orchestrator URL not configured", { status: 503 });
  }

  const streamUrl = new URL("/api/events/stream", orchestratorUrl);

  // Forward auth headers
  const apiKey = process.env.NEXT_PUBLIC_TEAM_API_KEY;
  const userToken = req.headers.get("x-user-token");
  const headers: Record<string, string> = { Accept: "text/event-stream" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  if (userToken) headers["X-User-Token"] = userToken;

  const upstream = await fetch(streamUrl.toString(), {
    headers,
    signal: req.signal,
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Failed to connect to event stream", {
      status: upstream.status,
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
