import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import * as proxyRoute from "./[...path]/route";
import { GET, POST } from "./[...path]/route";
import { DESKTOP_SHAPES } from "./desktopShapes";
import { createSessionVerifier, VERIFIED_TTL_MS } from "./userSession";

const AUTH = { url: "https://ref.supabase.co/", anonKey: "anon-key" };

function authFetch(status: number) {
  return vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response("{}", { status }));
}

describe("createSessionVerifier", () => {
  it("asks Supabase Auth about the token with the anon key", async () => {
    const fetchImpl = authFetch(200);
    const verify = createSessionVerifier({ fetchImpl, config: () => AUTH });
    expect(await verify("jwt-1")).toBe("verified");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://ref.supabase.co/auth/v1/user");
    expect(init?.headers).toEqual({ apikey: "anon-key", Authorization: "Bearer jwt-1" });
  });

  it("refuses a missing or oversized token without a network call", async () => {
    const fetchImpl = authFetch(200);
    const verify = createSessionVerifier({ fetchImpl, config: () => AUTH });
    expect(await verify(null)).toBe("missing");
    expect(await verify("   ")).toBe("missing");
    expect(await verify("x".repeat(8193))).toBe("rejected");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("is unavailable, not verified, when Supabase is not configured or cannot answer", async () => {
    expect(await createSessionVerifier({ fetchImpl: authFetch(200), config: () => null })("jwt")).toBe("unavailable");
    expect(await createSessionVerifier({ fetchImpl: authFetch(500), config: () => AUTH })("jwt")).toBe("unavailable");
    expect(await createSessionVerifier({ fetchImpl: authFetch(429), config: () => AUTH })("jwt")).toBe("unavailable");
    const offline = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await createSessionVerifier({ fetchImpl: offline, config: () => AUTH })("jwt")).toBe("unavailable");
  });

  it("rejects a token Auth refuses, and never remembers a refusal", async () => {
    const fetchImpl = authFetch(401);
    const verify = createSessionVerifier({ fetchImpl, config: () => AUTH });
    expect(await verify("forged")).toBe("rejected");
    expect(await verify("forged")).toBe("rejected");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(await createSessionVerifier({ fetchImpl: authFetch(403), config: () => AUTH })("bad")).toBe("rejected");
  });

  it("remembers a verified token for the TTL, then asks again", async () => {
    let t = 1_000;
    const fetchImpl = authFetch(200);
    const verify = createSessionVerifier({ fetchImpl, config: () => AUTH, now: () => t });
    await verify("jwt-2");
    t += VERIFIED_TTL_MS - 1;
    expect(await verify("jwt-2")).toBe("verified");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    t += 2;
    expect(await verify("jwt-2")).toBe("verified");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe("orchestrator proxy", () => {
  const ENV = {
    NEXT_PUBLIC_ORCHESTRATOR_URL: "https://orch.test",
    TEAM_API_KEY: "team-secret",
    NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  };
  const saved: Record<string, string | undefined> = {};
  let upstream: { url: string; init?: RequestInit }[];
  let upstreamReply: () => Response;

  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) {
      saved[k] = process.env[k];
      process.env[k] = v;
    }
    upstream = [];
    upstreamReply = () => Response.json({ ok: true });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.startsWith("https://ref.supabase.co/auth/v1/user")) {
          const auth = (init?.headers as Record<string, string>).Authorization;
          return new Response("{}", { status: auth.startsWith("Bearer live-") ? 200 : 401 });
        }
        upstream.push({ url, init });
        return upstreamReply();
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

  const call = (handler: typeof GET, path: string[], headers: Record<string, string> = {}, init: { method?: string; body?: string } = {}) =>
    handler(new NextRequest(`https://personas.so/api/orchestrator/${path.join("/")}`, { headers, ...init }), {
      params: Promise.resolve({ path }),
    });

  it("refuses an anonymous caller before the team key goes anywhere", async () => {
    const res = await call(POST, ["personas", "p1", "execute"], {}, { method: "POST", body: "{}" });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthenticated" });
    expect(upstream).toHaveLength(0);
  });

  it("refuses a token Supabase does not recognise", async () => {
    const res = await call(GET, ["personas"], { "X-User-Token": "forged-token" });
    expect(res.status).toBe(401);
    expect(upstream).toHaveLength(0);
  });

  it("fails closed when Supabase Auth is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const res = await call(GET, ["personas"], { "X-User-Token": "live-unconfigured" });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "auth_unavailable" });
    expect(upstream).toHaveLength(0);
  });

  it("attaches the team key and forwards the user token for a verified session", async () => {
    const res = await call(GET, ["personas"], { "X-User-Token": "live-user-1" });
    expect(res.status).toBe(200);
    expect(upstream).toHaveLength(1);
    expect(upstream[0].url).toBe("https://orch.test/personas");
    expect(upstream[0].init?.headers).toMatchObject({ Authorization: "Bearer team-secret", "X-User-Token": "live-user-1" });
  });

  it("never lets a path leave the orchestrator's origin", async () => {
    for (const path of [["", "evil.test", "steal"], ["..", "admin"], ["personas", "."]]) {
      const res = await call(GET, path, { "X-User-Token": "live-user-4" });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "bad_path" });
    }
    expect(upstream).toHaveLength(0);
  });

  it("encodes each segment and keeps the query string", async () => {
    const req = new NextRequest("https://personas.so/api/orchestrator/a%2Fb/%2F%2Fevil.test?limit=5", {
      headers: { "X-User-Token": "live-user-5" },
    });
    await GET(req, { params: Promise.resolve({ path: ["a/b", "//evil.test"] }) });
    expect(upstream.map((u) => u.url)).toEqual(["https://orch.test/a%2Fb/%2F%2Fevil.test?limit=5"]);
  });

  it("serves a non-JSON upstream body as inert text, never as markup on this origin", async () => {
    for (const type of ["text/html; charset=utf-8", "image/svg+xml", "application/xhtml+xml", "application/json-seq, text/html"]) {
      upstreamReply = () => new Response("<script>alert(document.domain)</script>", { headers: { "Content-Type": type } });
      const res = await call(GET, ["personas"], { "X-User-Token": "live-user-2" });
      expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("Content-Security-Policy")).toContain("sandbox");
      expect(await res.text()).toBe("<script>alert(document.domain)</script>");
    }
  });

  it("passes JSON types through, and labels an untyped body JSON as before", async () => {
    upstreamReply = () => new Response("{}", { status: 422, headers: { "Content-Type": "application/problem+json" } });
    let res = await call(GET, ["personas"], { "X-User-Token": "live-user-3" });
    expect(res.status).toBe(422);
    expect(res.headers.get("Content-Type")).toBe("application/problem+json");
    upstreamReply = () => new Response(new TextEncoder().encode('{"a":1}'));
    res = await call(GET, ["personas"], { "X-User-Token": "live-user-3" });
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(await res.json()).toEqual({ a: 1 });
  });
});

describe("orchestrator proxy with ORCHESTRATOR_TARGET=desktop", () => {
  const ENV = {
    NEXT_PUBLIC_ORCHESTRATOR_URL: "http://localhost:9420",
    ORCHESTRATOR_TARGET: "desktop",
    NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  };
  const saved: Record<string, string | undefined> = {};
  let upstream: string[];

  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) {
      saved[k] = process.env[k];
      process.env[k] = v;
    }
    upstream = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.startsWith("https://ref.supabase.co/auth/v1/user")) {
          const auth = (init?.headers as Record<string, string>).Authorization;
          return new Response("{}", { status: auth.startsWith("Bearer live-") ? 200 : 401 });
        }
        upstream.push(url);
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

  const send = (method: string, path: string[]) =>
    proxyRoute[method as "GET"](
      new NextRequest(`https://personas.so/api/orchestrator/${path.join("/")}`, {
        method,
        headers: { "X-User-Token": "live-desktop" },
        body: method === "GET" ? undefined : "{}",
      }),
      { params: Promise.resolve({ path }) },
    );

  const concrete = (pattern: string) => {
    const [method, p] = pattern.split(" ");
    return { method, path: p.split("/").filter(Boolean).map((s) => (s.startsWith(":") ? "id-1" : s)) };
  };

  it("answers every not_on_desktop shape with a typed 501 and forwards nothing", async () => {
    for (const [key, shape] of Object.entries(DESKTOP_SHAPES)) {
      if (shape.served !== "not_on_desktop") continue;
      const { method, path } = concrete(key);
      const res = await send(method, path);
      expect(res.status, key).toBe(501);
      expect(await res.json()).toEqual({ error: "not_on_desktop", method, path: "/" + path.join("/") });
    }
    expect(upstream).toHaveLength(0);
  });

  it("forwards every desktop shape to the same path", async () => {
    let n = 0;
    for (const [key, shape] of Object.entries(DESKTOP_SHAPES)) {
      if (shape.served !== "desktop") continue;
      const { method, path } = concrete(key);
      const res = await send(method, path);
      expect(res.status, key).toBe(200);
      expect(upstream[n++]).toBe(`http://localhost:9420/${path.join("/")}`);
    }
    expect(n).toBeGreaterThan(0);
  });

  it("answers an unknown path with 501 and does not forward it", async () => {
    const res = await send("GET", ["api", "mystery"]);
    expect(res.status).toBe(501);
    expect(await res.json()).toMatchObject({ error: "not_on_desktop" });
    expect(upstream).toHaveLength(0);
  });

  it("still answers an unauthenticated call with 401 first", async () => {
    const res = await GET(new NextRequest("https://personas.so/api/orchestrator/api/mystery"), {
      params: Promise.resolve({ path: ["api", "mystery"] }),
    });
    expect(res.status).toBe(401);
  });

  it("does not shape-check when the target is unset", async () => {
    delete process.env.ORCHESTRATOR_TARGET;
    const res = await send("GET", ["api", "mystery"]);
    expect(res.status).toBe(200);
    expect(upstream).toEqual(["http://localhost:9420/api/mystery"]);
  });
});
