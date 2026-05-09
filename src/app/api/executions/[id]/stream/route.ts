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
    return new Response("Failed to connect to execution stream", {
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
