import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import type * as UserSession from "./userSession";

/**
 * Proves the session gate in front of the team key would be noticed if it
 * quietly broke, the same question requestMutants.test.ts asks of the request
 * helpers.
 *
 * docs/decisions/2026-10-07-proxy-key-session-gated.md lends `TEAM_API_KEY`
 * only to a caller whose Supabase session verifies, and
 * docs/decisions/2026-10-09-sse-session-gate-and-production-no-eval.md puts
 * both streams behind the same verifier. Every one of those routes trusts
 * `createSessionVerifier`'s verdict. A flipped branch here lends the key to
 * anyone: a missing Supabase config read as "verified", a refusal remembered
 * as a pass, a 5xx from Auth taken as a yes. The suite below drives the
 * verifier with a fake Auth endpoint and a fake clock, and every mutant must
 * fail it.
 *
 * Each mutant is transpiled in memory and evaluated as CommonJS in this
 * context, with `server-only` stubbed and `@/lib/server/env` answering
 * nothing (the suite injects its own config). Nothing is written to disk.
 *
 * The kill ratio is a ratchet: it is 1 (every mutant killed) and may not go
 * down. A refactor that removes a mutation's target fails "every mutation
 * still applies"; move the mutation to the new code rather than deleting it.
 * Left out on purpose: the Auth timeout (a fake endpoint never hangs, so a
 * longer or shorter timeout is equivalent here) and `res.body?.cancel()`
 * (it frees a socket and changes no verdict).
 */

const SOURCE = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "userSession.ts"), "utf8");
const MIN_KILL_RATIO = 1;

type UserSessionModule = typeof UserSession;

/** One targeted edit: `find` must occur exactly once in userSession.ts. */
const MUTANTS: { name: string; find: string; replace: string }[] = [
  // the token itself
  { name: "missing token sent to Auth", find: `if (!t) return "missing";`, replace: `` },
  { name: "blank token not trimmed", find: `const t = token?.trim();`, replace: `const t = token ?? undefined;` },
  { name: "oversized token sent to Auth", find: `if (t.length > MAX_TOKEN_LENGTH) return "rejected";`, replace: `` },
  { name: "token at the length cap refused", find: `t.length > MAX_TOKEN_LENGTH`, replace: `t.length >= MAX_TOKEN_LENGTH` },
  // no Supabase, no key
  { name: "no Supabase verifies everyone", find: `if (!auth) return "unavailable";`, replace: `if (!auth) return "verified";` },
  // the remembered verdict
  { name: "remembered verdict never expires", find: `if (until > now()) return "verified";`, replace: `return "verified";` },
  { name: "remembered verdict outlives its TTL by a tick", find: `until > now()`, replace: `until >= now()` },
  { name: "verified token not remembered", find: `remembered.set(key, now() + VERIFIED_TTL_MS);`, replace: `` },
  {
    name: "refusal remembered as a pass",
    find: `if (res.status >= 400 && res.status < 500 && res.status !== 429) return "rejected";`,
    replace: `remembered.set(key, now() + VERIFIED_TTL_MS); if (res.status >= 400 && res.status < 500 && res.status !== 429) return "rejected";`,
  },
  { name: "remembered set never evicts", find: `if (oldest !== undefined) remembered.delete(oldest);`, replace: `` },
  // what Auth answered
  { name: "network failure verifies", find: `} catch {`, replace: `} catch { return "verified";` },
  { name: "4xx read as unavailable", find: `if (res.status >= 400 && res.status < 500 && res.status !== 429) return "rejected";`, replace: `` },
  { name: "429 read as a refusal", find: ` && res.status !== 429`, replace: `` },
  { name: "5xx verifies", find: `if (!res.ok) return "unavailable";`, replace: `` },
  // what is sent to Auth
  { name: "trailing slash kept on the Auth URL", find: String.raw`auth.url.replace(/\/+$/, "")`, replace: `auth.url` },
  { name: "token sent without Bearer", find: "Authorization: `Bearer ${t}`", replace: "Authorization: t" },
  { name: "anon key not sent", find: `apikey: auth.anonKey,`, replace: `apikey: "",` },
];

/** Transpiles `source` and evaluates it as a fresh module. */
function load(source: string): UserSessionModule {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const requireStub = (id: string): unknown => {
    if (id === "server-only") return {};
    if (id === "@/lib/server/env") return { getOptionalEnv: () => undefined };
    throw new Error(`userSession mutant imports an unexpected module: ${id}`);
  };
  const mod = { exports: {} as Record<string, unknown> };
  const factory = vm.runInThisContext(`(function (exports, require, module) {\n${outputText}\n})`) as (
    exports: Record<string, unknown>,
    require: (id: string) => unknown,
    module: { exports: Record<string, unknown> },
  ) => void;
  factory(mod.exports, requireStub, mod);
  return mod.exports as unknown as UserSessionModule;
}

const CONFIG = { url: "https://sb.test/", anonKey: "anon-key" };

/** A fake Supabase Auth: answers `status` (or throws), records every call. */
function fakeAuth(initial: number | "throw") {
  let status = initial;
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), headers: (init?.headers ?? {}) as Record<string, string> });
    const current = status;
    if (current === "throw") throw new Error("auth unreachable");
    return new Response(null, { status: current });
  }) as typeof fetch;
  const answer = (next: number | "throw") => {
    status = next;
  };
  return { fetchImpl, calls, answer };
}

/** Known behaviour of the verifier; returns the names of checks a build got wrong. */
async function rejectionSuite(m: UserSessionModule): Promise<string[]> {
  const wrong: string[] = [];
  const check = async (name: string, ok: () => Promise<boolean>) => {
    let passed = false;
    try {
      passed = await ok();
    } catch {
      passed = false;
    }
    if (!passed) wrong.push(name);
  };
  const verifier = (auth: ReturnType<typeof fakeAuth>, clock = { t: 1_000 }, config: () => typeof CONFIG | null = () => CONFIG) =>
    m.createSessionVerifier({ fetchImpl: auth.fetchImpl, now: () => clock.t, config });

  await check("no token is missing, and Auth is not asked", async () => {
    const auth = fakeAuth(200);
    const verify = verifier(auth);
    return (await verify(null)) === "missing" && (await verify("   ")) === "missing" && auth.calls.length === 0;
  });
  await check("a token over the cap is rejected unasked", async () => {
    const auth = fakeAuth(200);
    return (await verifier(auth)("x".repeat(8193))) === "rejected" && auth.calls.length === 0;
  });
  await check("a token at the cap is asked about", async () => (await verifier(fakeAuth(200))("x".repeat(8192))) === "verified");
  await check("no Supabase config verifies nobody", async () => (await verifier(fakeAuth(200), { t: 1_000 }, () => null)("tok")) === "unavailable");

  await check("Auth is asked at the trimmed URL with the anon key and a bearer token", async () => {
    const auth = fakeAuth(200);
    const verdict = await verifier(auth)("  tok  ");
    const call = auth.calls[0];
    return (
      verdict === "verified" &&
      call.url === "https://sb.test/auth/v1/user" &&
      call.headers.apikey === "anon-key" &&
      call.headers.Authorization === "Bearer tok"
    );
  });
  await check("a 401 is rejected", async () => (await verifier(fakeAuth(401))("tok")) === "rejected");
  await check("a 429 is unavailable, not a refusal", async () => (await verifier(fakeAuth(429))("tok")) === "unavailable");
  await check("a 503 is unavailable", async () => (await verifier(fakeAuth(503))("tok")) === "unavailable");
  await check("an unreachable Auth is unavailable", async () => (await verifier(fakeAuth("throw"))("tok")) === "unavailable");

  await check("a verified token is remembered inside the TTL", async () => {
    const auth = fakeAuth(200);
    const clock = { t: 1_000 };
    const verify = verifier(auth, clock);
    await verify("tok");
    auth.answer(401);
    clock.t += m.VERIFIED_TTL_MS - 1;
    return (await verify("tok")) === "verified" && auth.calls.length === 1;
  });
  await check("a remembered verdict ends at the TTL", async () => {
    const auth = fakeAuth(200);
    const clock = { t: 1_000 };
    const verify = verifier(auth, clock);
    await verify("tok");
    auth.answer(401);
    clock.t += m.VERIFIED_TTL_MS;
    return (await verify("tok")) === "rejected";
  });
  await check("a refusal is never remembered", async () => {
    const auth = fakeAuth(401);
    const verify = verifier(auth);
    const first = await verify("tok");
    const second = await verify("tok");
    return first === "rejected" && second === "rejected" && auth.calls.length === 2;
  });
  await check("the oldest remembered token is evicted past the cap", async () => {
    const auth = fakeAuth(200);
    const verify = verifier(auth);
    for (let i = 0; i <= 1000; i++) await verify(`tok-${i}`);
    auth.answer(401);
    return (await verify("tok-0")) === "rejected";
  });
  return wrong;
}

describe("session verifier mutation ratchet", () => {
  it("every mutation still applies to exactly one place in userSession.ts", () => {
    for (const m of MUTANTS) expect(SOURCE.split(m.find).length - 1, m.name).toBe(1);
  });

  it("the unmutated verifier passes the rejection suite (the harness is sound)", async () => {
    expect(await rejectionSuite(load(SOURCE))).toEqual([]);
  });

  it.each(MUTANTS.map((m, i): [string, number] => [m.name, i]))("kills the mutant: %s", async (_name, i) => {
    const m = MUTANTS[i];
    const wrong = await rejectionSuite(load(SOURCE.replace(m.find, m.replace)));
    expect(wrong.length, `${m.name} survived the rejection suite`).toBeGreaterThan(0);
  });

  it(`kills at least ${MIN_KILL_RATIO * 100}% of mutants`, async () => {
    let killed = 0;
    for (const m of MUTANTS) {
      if ((await rejectionSuite(load(SOURCE.replace(m.find, m.replace)))).length > 0) killed++;
    }
    expect(killed / MUTANTS.length).toBeGreaterThanOrEqual(MIN_KILL_RATIO);
  });
});
