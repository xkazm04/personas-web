import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server";
import * as orchestratorRoute from "@/app/api/orchestrator/[...path]/route";
import * as eventsStreamRoute from "@/app/api/events/stream/route";
import * as executionStreamRoute from "@/app/api/executions/[id]/stream/route";

/**
 * Turns the docs/threat-model.md route table into behaviour.
 *
 * threatModelCoverage.test.ts proves every route has a row. This spec proves
 * the rows are true:
 *   - every row whose caller gate names `verifySession` really refuses, for
 *     every method the row lists, an anonymous caller and a forged token
 *     (401) and fails closed when Supabase Auth is unconfigured (503), and the
 *     team key never leaves the server on any of those calls;
 *   - a route whose source reads `TEAM_API_KEY` or calls `verifySession` has a
 *     row that says so, and a row that claims a gate has code behind it;
 *   - the Methods column matches the handlers the route exports.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const API_ROOT = path.join(REPO_ROOT, "src", "app", "api");
const THREAT_MODEL = readFileSync(path.join(REPO_ROOT, "docs", "threat-model.md"), "utf8");

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

interface Row {
  route: string;
  methods: string[];
  gate: string;
  secret: string;
}

function routeRows(): Row[] {
  const section = THREAT_MODEL.split(/^## Routes\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const rows: Row[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = /^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/.exec(line);
    if (!m) continue;
    rows.push({
      route: m[1],
      methods: HTTP_METHODS.filter((v) => new RegExp(`\\b${v}\\b`).test(m[2])),
      gate: m[3],
      secret: m[4],
    });
  }
  return rows;
}

const routeSource = (route: string) => readFileSync(path.join(API_ROOT, route, "route.ts"), "utf8");

/**
 * The session-gated routes, with how to call each. A new gated row fails
 * "has a harness for every gated row" until it is added here.
 */
type Handler = (req: NextRequest, ctx: { params: Promise<unknown> }) => Promise<Response>;
const GATED: Record<string, { module: object; url: string; params: unknown }> = {
  "orchestrator/[...path]": {
    module: orchestratorRoute,
    url: "https://personas.so/api/orchestrator/personas/p1",
    params: { path: ["personas", "p1"] },
  },
  "events/stream": { module: eventsStreamRoute, url: "https://personas.so/api/events/stream", params: {} },
  "executions/[id]/stream": {
    module: executionStreamRoute,
    url: "https://personas.so/api/executions/exec-1/stream",
    params: { id: "exec-1" },
  },
};

const ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_ORCHESTRATOR_URL: "https://orch.test",
  TEAM_API_KEY: "team-secret",
  NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  ORCHESTRATOR_TARGET: undefined,
};

const rows = routeRows();
const gatedRows = rows.filter((r) => /verifySession/.test(r.gate));

describe("docs/threat-model.md § Routes holds in code", () => {
  it("finds the session-gated rows", () => {
    expect(gatedRows.length).toBeGreaterThan(0);
  });

  it("has a harness for every gated row", () => {
    expect(gatedRows.map((r) => r.route).sort()).toEqual(Object.keys(GATED).sort());
  });

  const byRoute = rows.map((r): [string, Row] => [r.route, r]);

  it.each(byRoute)("%s: the Methods column matches the exported handlers", (route, row) => {
    const src = routeSource(route);
    const exported = HTTP_METHODS.filter((v) => new RegExp(`export (async )?function ${v}\\b|export const ${v}\\b`).test(src));
    expect(row.methods, `fix the Methods cell of ${route}`).toEqual(exported);
  });

  it.each(byRoute)("%s: the gate and secret cells agree with the source", (route, row) => {
    const src = routeSource(route);
    const readsTeamKey = /process\.env\.TEAM_API_KEY\b/.test(src);
    const callsVerify = /\bverifySession\(/.test(src);
    expect(/TEAM_API_KEY/.test(row.secret), `${route}: Secret cell vs process.env.TEAM_API_KEY`).toBe(readsTeamKey);
    expect(/verifySession/.test(row.gate), `${route}: Caller gate cell vs verifySession()`).toBe(callsVerify);
    // The team key is only ever held behind a verified session.
    if (readsTeamKey) expect(callsVerify, `${route} reads TEAM_API_KEY without verifySession`).toBe(true);
  });
});

describe("session-gated routes refuse callers without a live session", () => {
  const saved: Record<string, string | undefined> = {};
  let calls: { url: string; init?: RequestInit }[];

  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) {
      saved[k] = process.env[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    calls = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push({ url, init });
        if (url.startsWith("https://ref.supabase.co/auth/v1/user")) return new Response("{}", { status: 401 });
        return Response.json({ ok: true });
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

  const invoke = (route: string, method: string, headers: Record<string, string>) => {
    const { module, url, params } = GATED[route];
    const handler = (module as Record<string, Handler>)[method];
    const body = method === "GET" ? undefined : "{}";
    return handler(new NextRequest(url, { method, headers, body }), { params: Promise.resolve(params) });
  };

  /** Only Supabase Auth may have been asked, and never with the team key. */
  const expectNothingLeft = (label: string) => {
    const upstream = calls.filter((c) => !c.url.startsWith("https://ref.supabase.co/"));
    expect(upstream, `${label} reached the orchestrator`).toEqual([]);
    expect(JSON.stringify(calls.map((c) => c.init?.headers ?? null)), `${label} sent the team key`).not.toContain("team-secret");
  };

  const cases = gatedRows.flatMap((r) => r.methods.map((m): [string, string] => [r.route, m]));

  it.each(cases)("%s %s: anonymous caller gets 401", async (route, method) => {
    const res = await invoke(route, method, {});
    expect(res.status).toBe(401);
    expectNothingLeft(`${method} ${route} (anonymous)`);
  });

  it.each(cases)("%s %s: a token Supabase rejects gets 401", async (route, method) => {
    const res = await invoke(route, method, { "X-User-Token": `forged-${route}-${method}` });
    expect(res.status).toBe(401);
    expectNothingLeft(`${method} ${route} (forged token)`);
  });

  it.each(cases)("%s %s: fails closed with 503 when Supabase Auth is unconfigured", async (route, method) => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const res = await invoke(route, method, { "X-User-Token": `unverifiable-${route}-${method}` });
    expect(res.status).toBe(503);
    expectNothingLeft(`${method} ${route} (auth unconfigured)`);
  });
});
