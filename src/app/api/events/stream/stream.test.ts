import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { UPSTREAM_TIMEOUT_MS } from "@/app/api/orchestrator/upstreamDeadline";
import { GET } from "./route";

const ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_ORCHESTRATOR_URL: "https://orch.test",
  TEAM_API_KEY: "team-secret",
  NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  ORCHESTRATOR_TARGET: undefined,
};

describe("/api/events/stream", () => {
  const saved: Record<string, string | undefined> = {};
  let upstream: { url: string; init?: RequestInit }[];
  let hangUpstream: boolean;

  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) {
      saved[k] = process.env[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    upstream = [];
    hangUpstream = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.startsWith("https://ref.supabase.co/auth/v1/user")) {
          const auth = (init?.headers as Record<string, string>).Authorization;
          return new Response("{}", { status: auth.startsWith("Bearer live-") ? 200 : 401 });
        }
        upstream.push({ url, init });
        if (hangUpstream) {
          // An orchestrator that never sends headers: settles only on abort.
          return new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
          });
        }
        return new Response("data: hello\n\n", { headers: { "Content-Type": "text/event-stream" } });
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

  const URL = "https://personas.so/api/events/stream";
  const get = (headers: Record<string, string> = {}) =>
    GET(new NextRequest(URL, { headers }));

  it("refuses an anonymous caller and never calls fetch", async () => {
    const res = await get();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthenticated" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses a token Supabase does not recognise and never calls the orchestrator", async () => {
    const res = await get({ "X-User-Token": "forged-ev" });
    expect(res.status).toBe(401);
    expect(upstream).toHaveLength(0);
  });

  it("answers 503 auth_unavailable when Supabase is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const res = await get({ "X-User-Token": "live-ev-unconfigured" });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "auth_unavailable" });
    expect(upstream).toHaveLength(0);
  });

  it("answers 503 orchestrator_not_configured when the URL is unset", async () => {
    delete process.env.NEXT_PUBLIC_ORCHESTRATOR_URL;
    const res = await get({ "X-User-Token": "live-ev-nourl" });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "orchestrator_not_configured" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 501 not_on_desktop for a verified token when the target is the desktop", async () => {
    process.env.ORCHESTRATOR_TARGET = "desktop";
    const res = await get({ "X-User-Token": "live-ev-desktop" });
    expect(res.status).toBe(501);
    expect(await res.json()).toMatchObject({ error: "not_on_desktop", method: "GET" });
    expect(upstream).toHaveLength(0);
  });

  it("calls the orchestrator once with the key and user token for a verified session", async () => {
    const res = await get({ "X-User-Token": "live-ev-ok" });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(upstream).toHaveLength(1);
    expect(upstream[0].url).toBe("https://orch.test/api/events/stream");
    expect(upstream[0].init?.headers).toMatchObject({
      Accept: "text/event-stream",
      Authorization: "Bearer team-secret",
      "X-User-Token": "live-ev-ok",
    });
    expect(await res.text()).toContain("data: hello");
  });

  it("sends no Authorization header when only the legacy NEXT_PUBLIC_TEAM_API_KEY is set", async () => {
    delete process.env.TEAM_API_KEY;
    process.env.NEXT_PUBLIC_TEAM_API_KEY = "legacy-secret";
    try {
      const res = await get({ "X-User-Token": "live-ev-legacy" });
      expect(res.status).toBe(200);
      expect(upstream).toHaveLength(1);
      expect(upstream[0].init?.headers).not.toHaveProperty("Authorization");
    } finally {
      delete process.env.NEXT_PUBLIC_TEAM_API_KEY;
    }
  });

  it("answers 504 upstream_timeout when the orchestrator never sends headers", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      hangUpstream = true;
      const pending = get({ "X-User-Token": "live-ev-hang" });
      await vi.waitFor(() => expect(upstream).toHaveLength(1));
      await vi.advanceTimersByTimeAsync(UPSTREAM_TIMEOUT_MS);
      const res = await pending;
      expect(res.status).toBe(504);
      expect(await res.json()).toEqual({ error: "upstream_timeout" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("drops the deadline once the stream is open, so a live stream is never cut", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
    try {
      const res = await get({ "X-User-Token": "live-ev-open" });
      expect(res.status).toBe(200);
      await vi.advanceTimersByTimeAsync(UPSTREAM_TIMEOUT_MS * 2);
      expect(upstream[0].init?.signal?.aborted).toBe(false);
      await res.body?.cancel();
    } finally {
      vi.useRealTimers();
    }
  });
});
