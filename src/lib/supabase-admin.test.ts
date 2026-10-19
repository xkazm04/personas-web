import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * The admin client fails closed on a production deployment that has no
 * service-role key, instead of quietly handing back the anon client (whose
 * writes need the permissive RLS that leaves voter emails readable).
 */

const capture = vi.fn();
const anonClient = { anon: true };

vi.mock("@/lib/sentry-pii", () => ({ captureExceptionScrubbed: capture }));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => anonClient,
  SUPABASE_FETCH_TIMEOUT_MS: 10_000,
  timedFetch: () => fetch,
}));

const PUBLIC = {
  NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
};

function env(vars: Record<string, string>) {
  for (const [k, v] of Object.entries(vars)) vi.stubEnv(k, v);
}

/** A fresh module, so its once-per-process client and flags start clean. */
async function load() {
  return import("./supabase-admin");
}

describe("getSupabaseAdmin", () => {
  beforeEach(() => {
    vi.resetModules();
    capture.mockClear();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    env({ ...PUBLIC, SUPABASE_SERVICE_ROLE_KEY: "", VERCEL_ENV: "" });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("refuses on a production deployment without the service-role key, and reports it once", async () => {
    env({ NODE_ENV: "production" });
    const { getSupabaseAdmin, AdminUnavailableError } = await load();
    await expect(getSupabaseAdmin()).rejects.toBeInstanceOf(AdminUnavailableError);
    await expect(getSupabaseAdmin()).rejects.toBeInstanceOf(AdminUnavailableError);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture.mock.calls[0][1]).toMatchObject({ tags: { reason: "service-role-missing" } });
  });

  it("refuses on Vercel production, and falls back on a Vercel preview", async () => {
    env({ NODE_ENV: "production", VERCEL_ENV: "production" });
    let mod = await load();
    await expect(mod.getSupabaseAdmin()).rejects.toBeInstanceOf(mod.AdminUnavailableError);

    vi.resetModules();
    env({ VERCEL_ENV: "preview" });
    mod = await load();
    expect(await mod.getSupabaseAdmin()).toBe(anonClient);
  });

  it("keeps the anon fallback in development, with a warning", async () => {
    env({ NODE_ENV: "development" });
    const { getSupabaseAdmin } = await load();
    expect(await getSupabaseAdmin()).toBe(anonClient);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(capture).not.toHaveBeenCalled();
  });

  it("uses the service-role client in production when the key is set", async () => {
    env({ NODE_ENV: "production", SUPABASE_SERVICE_ROLE_KEY: "service-key" });
    const { getSupabaseAdmin } = await load();
    const client = await getSupabaseAdmin();
    expect(client).not.toBe(anonClient);
    expect(capture).not.toHaveBeenCalled();
  });

  it("turns the refusal into a 503 store_unavailable for a route", async () => {
    env({ NODE_ENV: "production" });
    const { getSupabaseAdminOrRefusal } = await load();
    const res = await getSupabaseAdminOrRefusal();
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(503);
    expect(await (res as Response).json()).toMatchObject({ code: "store_unavailable" });
  });

  it("makes GET /api/votes answer 503 store_unavailable instead of reading through anon", async () => {
    env({ NODE_ENV: "production" });
    const { GET } = await import("@/app/api/votes/route");
    const res = await GET(new NextRequest("https://personas.so/api/votes?voterId=v_3f9a2c7e1b4d8f60"));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "The store is temporarily unavailable",
      code: "store_unavailable",
    });
  });
});
