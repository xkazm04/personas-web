import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server";
import { GET as streamGET } from "@/app/api/events/stream/route";
import { GET as proxyGET } from "@/app/api/orchestrator/[...path]/route";

/**
 * Drills docs/degraded-dependencies.md, the runbook for "Supabase or the
 * orchestrator is down".
 *
 * The routes' own specs cover the configuration answers (503 when env is
 * missing, 501 on the desktop target). This spec covers the outage half the
 * README's "degrades gracefully" claim rests on: the orchestrator unreachable,
 * answering an error, or dropping the stream mid-session, and a client abort.
 * It also holds the runbook's failure table to the code. Each row's status and
 * `error` code must still appear in the route file the row cites.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const RUNBOOK = "docs/degraded-dependencies.md";

const ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_ORCHESTRATOR_URL: "https://orch.test",
  TEAM_API_KEY: "team-secret",
  NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  ORCHESTRATOR_TARGET: undefined,
};

interface Row {
  route: string;
  status: number;
  code: string;
}

/** The failure table: `| Failure | Route | Status | error | ... |`, rows that cite a route file. */
function runbookRows(): Row[] {
  const rows: Row[] = [];
  for (const line of readFileSync(path.join(ROOT, RUNBOOK), "utf8").split(/\r?\n/)) {
    const cells = line.split("|").map((c) => c.trim());
    const route = /^`(src\/app\/api\/[^`]+\/route\.ts)`$/.exec(cells[2] ?? "");
    const code = /^`([^`]+)`$/.exec(cells[4] ?? "");
    if (!route || !code || !/^\d{3}$/.test(cells[3] ?? "")) continue;
    rows.push({ route: route[1], status: Number(cells[3]), code: code[1] });
  }
  return rows;
}

describe("degraded-dependencies runbook", () => {
  const rows = runbookRows();

  it("has a failure table that covers both orchestrator routes", () => {
    const routes = new Set(rows.map((r) => r.route));
    expect(routes.has("src/app/api/events/stream/route.ts")).toBe(true);
    expect(routes.has("src/app/api/orchestrator/[...path]/route.ts")).toBe(true);
  });

  it.each(rows.map((r): [string, number, string] => [r.route, r.status, r.code]))(
    "%s still answers %i %s",
    (route, status, code) => {
      const source = readFileSync(path.join(ROOT, route), "utf8");
      expect(source, `${route} no longer returns error "${code}"`).toContain(`error: "${code}"`);
      expect(source, `${route} no longer returns status ${status}`).toContain(`status: ${status}`);
    },
  );
});

describe("orchestrator outage drill", () => {
  const saved: Record<string, string | undefined> = {};
  let orchestrator: (url: string) => Promise<Response>;

  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) {
      saved[k] = process.env[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    orchestrator = async () => new Response("data: hello\n\n");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("https://ref.supabase.co/auth/v1/user")) return new Response("{}", { status: 200 });
        return orchestrator(url);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  const stream = (token: string) =>
    streamGET(new NextRequest("https://personas.so/api/events/stream", { headers: { "X-User-Token": token } }));
  const proxy = (token: string) =>
    proxyGET(new NextRequest("https://personas.so/api/orchestrator/api/personas", { headers: { "X-User-Token": token } }), {
      params: Promise.resolve({ path: ["api", "personas"] }),
    });

  const unreachable = async (): Promise<Response> => {
    throw new TypeError("fetch failed: getaddrinfo ENOTFOUND orch.test");
  };

  it("stream: an unreachable orchestrator is a 502 that never names the host", async () => {
    orchestrator = unreachable;
    const res = await stream("live-drill-stream-down");
    expect(res.status).toBe(502);
    const body = await res.text();
    expect(JSON.parse(body)).toEqual({ error: "upstream_unreachable" });
    expect(body).not.toContain("orch.test");
  });

  it("proxy: an unreachable orchestrator is a 502 that never names the host", async () => {
    orchestrator = unreachable;
    const res = await proxy("live-drill-proxy-down");
    expect(res.status).toBe(502);
    const body = await res.text();
    expect(JSON.parse(body)).toEqual({ error: "upstream_unreachable" });
    expect(body).not.toContain("orch.test");
  });

  it("stream: an orchestrator error status is passed on as upstream_unreachable, not a stream", async () => {
    orchestrator = async () => new Response("overloaded", { status: 503 });
    const res = await stream("live-drill-stream-503");
    expect(res.status).toBe(503);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(await res.json()).toEqual({ error: "upstream_unreachable" });
  });

  it("stream: a mid-session drop closes cleanly and keeps what already arrived", async () => {
    const encoder = new TextEncoder();
    let sent = false;
    orchestrator = async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          pull(controller) {
            if (sent) {
              controller.error(new Error("connection reset"));
              return;
            }
            sent = true;
            controller.enqueue(encoder.encode("event: event\ndata: before-drop\n\n"));
          },
        }),
        { headers: { "Content-Type": "text/event-stream" } },
      );
    const res = await stream("live-drill-stream-drop");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("data: before-drop");
  });

  it("stream and proxy: a client abort is a bodyless 499, not an outage", async () => {
    orchestrator = async () => {
      throw new DOMException("The operation was aborted.", "AbortError");
    };
    const fromStream = await stream("live-drill-stream-abort");
    expect(fromStream.status).toBe(499);
    expect(await fromStream.text()).toBe("");
    const fromProxy = await proxy("live-drill-proxy-abort");
    expect(fromProxy.status).toBe(499);
    expect(await fromProxy.text()).toBe("");
  });
});
