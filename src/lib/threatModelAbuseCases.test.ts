import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server";
import * as orchestratorRoute from "@/app/api/orchestrator/[...path]/route";
import * as eventsStreamRoute from "@/app/api/events/stream/route";
import * as executionStreamRoute from "@/app/api/executions/[id]/stream/route";

/**
 * Runs the attacks in docs/threat-model.md § Abuse cases.
 *
 * threatModelAuthGate.test.ts proves the key-lending routes refuse a caller
 * with no live session. This spec plays the attacker who looks for a way
 * around that: a session smuggled in another header, headers the caller hopes
 * get relayed, an execution id built to leave its path, and an upstream that
 * answers with markup or names its host. Each table row is run against every
 * route it names. A row without a drill below fails, and so does a drill
 * without a row. Global fetch is stubbed, so nothing leaves the test.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const THREAT_MODEL = readFileSync(path.join(REPO_ROOT, "docs", "threat-model.md"), "utf8");

function sectionOf(heading: string): string {
  return THREAT_MODEL.split(new RegExp(`^## ${heading}\\s*$`, "m"))[1]?.split(/^## /m)[0] ?? "";
}

/** First-column route keys of § Routes. */
const routeKeys = sectionOf("Routes")
  .split(/\r?\n/)
  .map((line) => /^\|\s*`([^`]+)`\s*\|/.exec(line)?.[1])
  .filter((key): key is string => key !== undefined);

interface AbuseRow {
  id: string;
  routes: string[];
}

/** Case id and the routes its Routes cell names. */
const abuseRows: AbuseRow[] = sectionOf("Abuse cases")
  .split(/\r?\n/)
  .map((line) => /^\|\s*`([^`]+)`\s*\|([^|]*)\|/.exec(line))
  .filter((m): m is RegExpExecArray => m !== null)
  .map((m) => ({ id: m[1], routes: Array.from(m[2].matchAll(/`([^`]+)`/g), (r) => r[1]) }));

const ORCH = "https://orch.test";
const SUPABASE_AUTH = "https://ref.supabase.co/auth/v1/user";
const LIVE = "live-abuse-caller";
const TEAM_AUTH = "Bearer team-secret";

const ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_ORCHESTRATOR_URL: ORCH,
  TEAM_API_KEY: "team-secret",
  NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  ORCHESTRATOR_TARGET: undefined,
};

type Handler = (req: NextRequest, ctx: { params: Promise<unknown> }) => Promise<Response>;
const getOf = (module: object): Handler => (module as Record<string, Handler>).GET;

/** How to call a route, and what a well-behaved call sends upstream. */
interface Target {
  handler: Handler;
  url: string;
  params: unknown;
  upstream: string;
  upstreamHeaders: Record<string, string>;
}

const SSE_HEADERS = { Accept: "text/event-stream", "X-User-Token": LIVE, Authorization: TEAM_AUTH };

const TARGETS: Record<string, Target> = {
  "orchestrator/[...path]": {
    handler: getOf(orchestratorRoute),
    url: "https://personas.so/api/orchestrator/personas",
    params: { path: ["personas"] },
    upstream: `${ORCH}/personas`,
    upstreamHeaders: { "Content-Type": "application/json", "X-User-Token": LIVE, Authorization: TEAM_AUTH },
  },
  "events/stream": {
    handler: getOf(eventsStreamRoute),
    url: "https://personas.so/api/events/stream",
    params: {},
    upstream: `${ORCH}/api/events/stream`,
    upstreamHeaders: SSE_HEADERS,
  },
  "executions/[id]/stream": {
    handler: getOf(executionStreamRoute),
    url: "https://personas.so/api/executions/exec-1/stream",
    params: { id: "exec-1" },
    upstream: `${ORCH}/api/executions/exec-1/stream`,
    upstreamHeaders: SSE_HEADERS,
  },
};

const MARKUP = "<script>alert(document.domain)</script>";

let upstreamCalls: { url: string; init?: RequestInit }[] = [];
let authCalls: string[] = [];
let reply: () => Response = () => new Response("data: hello\n\n", { headers: { "Content-Type": "text/event-stream" } });

const send = (t: Target, headers: Record<string, string>, over: { url?: string; params?: unknown } = {}) =>
  t.handler(new NextRequest(over.url ?? t.url, { headers }), { params: Promise.resolve(over.params ?? t.params) });

const DRILLS: Record<string, (t: Target) => Promise<void>> = {
  "session-from-authorization": async (t) => {
    const res = await send(t, { Authorization: `Bearer ${LIVE}` });
    expect(res.status).toBe(401);
    expect(authCalls).toEqual([]);
    expect(upstreamCalls).toEqual([]);
  },

  "oversized-token": async (t) => {
    const res = await send(t, { "X-User-Token": `live-${"x".repeat(8192)}` });
    expect(res.status).toBe(401);
    expect(authCalls).toEqual([]);
    expect(upstreamCalls).toEqual([]);
  },

  "caller-headers-not-relayed": async (t) => {
    const res = await send(t, {
      "X-User-Token": LIVE,
      Authorization: "Bearer caller-chosen-key",
      Cookie: "sb-access-token=caller",
      "X-Forwarded-Host": "evil.test",
    });
    await res.text();
    expect(res.status).toBe(200);
    expect(upstreamCalls).toHaveLength(1);
    expect(upstreamCalls[0].url).toBe(t.upstream);
    expect(upstreamCalls[0].init?.headers).toEqual(t.upstreamHeaders);
  },

  "execution-id-escape": async (t) => {
    for (const id of ["../../admin", "%2e%2e", "//evil.test", "a?x=1#frag", "..%2f"]) {
      upstreamCalls = [];
      const res = await send(t, { "X-User-Token": LIVE }, { params: { id } });
      await res.text();
      expect(upstreamCalls.length, id).toBeLessThanOrEqual(1);
      for (const call of upstreamCalls) {
        const url = new URL(call.url);
        expect(url.origin, id).toBe(ORCH);
        expect(url.search, id).toBe("");
        expect(url.hash, id).toBe("");
        const segments = url.pathname.split("/");
        expect(segments, id).toHaveLength(5);
        expect([segments[1], segments[2], segments[4]], id).toEqual(["api", "executions", "stream"]);
        expect(decodeURIComponent(segments[3]), id).toBe(id);
      }
    }
  },

  "stream-query-dropped": async (t) => {
    const res = await send(t, { "X-User-Token": LIVE }, { url: `${t.url}?upstream=https://evil.test&token=stolen` });
    await res.text();
    expect(upstreamCalls.map((c) => c.url)).toEqual([t.upstream]);
  },

  "sse-error-body-not-relayed": async (t) => {
    reply = () => new Response(MARKUP, { status: 500, headers: { "Content-Type": "text/html" } });
    const res = await send(t, { "X-User-Token": LIVE });
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(await res.json()).toEqual({ error: "upstream_unreachable" });
  },

  "sse-answer-is-never-markup": async (t) => {
    reply = () => new Response(MARKUP, { headers: { "Content-Type": "text/html" } });
    const res = await send(t, { "X-User-Token": LIVE });
    await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("Cache-Control")).toBe("no-cache, no-transform");
  },

  "unreachable-hides-host": async (t) => {
    reply = () => {
      throw new TypeError("fetch failed: getaddrinfo ENOTFOUND orch.test");
    };
    const res = await send(t, { "X-User-Token": LIVE });
    const body = await res.text();
    expect(res.status).toBe(502);
    expect(JSON.parse(body)).toEqual({ error: "upstream_unreachable" });
    expect(body).not.toContain("orch.test");
  },
};

describe("docs/threat-model.md § Abuse cases", () => {
  it("lists cases, each naming routes from § Routes", () => {
    expect(abuseRows.length).toBeGreaterThan(0);
    for (const row of abuseRows) {
      expect(row.routes.length, row.id).toBeGreaterThan(0);
      for (const route of row.routes) expect(routeKeys, `${row.id} names ${route}`).toContain(route);
    }
  });

  it("has a drill for every case and a case for every drill", () => {
    expect(abuseRows.map((r) => r.id).sort()).toEqual(Object.keys(DRILLS).sort());
  });

  it("has a harness for every route a case names", () => {
    const named = new Set(abuseRows.flatMap((r) => r.routes));
    for (const route of named) expect(Object.keys(TARGETS), route).toContain(route);
  });
});

describe("abuse cases hold in code", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) {
      saved[k] = process.env[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    upstreamCalls = [];
    authCalls = [];
    reply = () => new Response("data: hello\n\n", { headers: { "Content-Type": "text/event-stream" } });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.startsWith(SUPABASE_AUTH)) {
          const auth = (init?.headers as Record<string, string>).Authorization;
          authCalls.push(auth);
          return new Response("{}", { status: auth.startsWith("Bearer live-") ? 200 : 401 });
        }
        upstreamCalls.push({ url, init });
        return reply();
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

  const cases = abuseRows.flatMap((r) => r.routes.map((route): [string, string] => [r.id, route]));

  it.each(cases)("%s against %s", async (id, route) => {
    const drill = DRILLS[id];
    const target = TARGETS[route];
    expect(drill, `no drill for ${id}`).toBeDefined();
    expect(target, `no harness for ${route}`).toBeDefined();
    await drill(target);
  });
});
