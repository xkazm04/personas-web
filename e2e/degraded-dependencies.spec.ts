import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Drills docs/degraded-dependencies.md against the built app, end to end.
 *
 * src/lib/degradationDrill.test.ts runs the stream and proxy handlers
 * in-process with the orchestrator failing. This spec asks the question it
 * cannot: does the app that `next build && next start` serves, with neither
 * dependency configured, answer the way the runbook says? It is the README's
 * "boots with no env vars" promise, held over HTTP.
 *
 * Only the rows a server with no configuration can reach are drilled here:
 * the `orchestrator_not_configured` 503s and "Supabase absent entirely".
 * The 502, `auth_unavailable` and 501 rows need an orchestrator URL that is
 * set but failing, so they stay with the in-process drill.
 *
 * Each group skips itself when the dependency IS configured, from the
 * environment or from a dotenv file `next start` would load, because then the
 * fallback is not what the server is running. CI sets neither.
 */

const DOTENV_FILES = [".env", ".env.local", ".env.production", ".env.production.local"];

/** True when `name` has a non-empty value for the server under test. */
function configured(name: string): boolean {
  if (process.env[name]) return true;
  const line = new RegExp(`^\\s*${name}\\s*=\\s*\\S`, "m");
  return DOTENV_FILES.some((file) => {
    const full = path.join(process.cwd(), file);
    return fs.existsSync(full) && line.test(fs.readFileSync(full, "utf8"));
  });
}

test.describe("orchestrator not configured", () => {
  test.skip(configured("NEXT_PUBLIC_ORCHESTRATOR_URL"), "an orchestrator URL is configured");

  test("the live event stream answers 503 orchestrator_not_configured", async ({ request }) => {
    const res = await request.get("/api/events/stream");
    expect(res.status()).toBe(503);
    expect(await res.json()).toEqual({ error: "orchestrator_not_configured" });
  });

  test("the orchestrator proxy answers 503 orchestrator_not_configured, for reads and writes", async ({ request }) => {
    const read = await request.get("/api/orchestrator/personas");
    expect(read.status()).toBe(503);
    expect(await read.json()).toEqual({ error: "orchestrator_not_configured" });

    const write = await request.post("/api/orchestrator/personas", { data: { name: "drill" } });
    expect(write.status()).toBe(503);
    expect(await write.json()).toEqual({ error: "orchestrator_not_configured" });
  });
});

test.describe("Supabase absent entirely", () => {
  test.skip(
    // Mirrors hasSupabaseEnv() in src/lib/server/env.ts: both or the file store.
    configured("NEXT_PUBLIC_SUPABASE_URL") && configured("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    "Supabase is configured",
  );

  test("roadmap voting reads through the file store instead of erroring", async ({ request }) => {
    const res = await request.get("/api/votes?voterId=drill-voter");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { counts?: unknown; userVotes?: unknown; shipped?: unknown };
    expect(typeof body.counts).toBe("object");
    expect(Array.isArray(body.userVotes)).toBe(true);
    expect(Array.isArray(body.shipped)).toBe(true);
  });
});
