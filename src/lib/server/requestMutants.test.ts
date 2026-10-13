import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse, type NextRequest } from "next/server";
import type * as RequestHelpers from "./request";

/**
 * Proves the request helpers' guards would be noticed if they quietly broke,
 * the same question rateLimitMutants.test.ts asks of the limiter.
 *
 * request.ts is the other half of every write route's trust boundary: the IP
 * that keys the rate limit (getClientIp), the body cap and parse that stand in
 * front of every handler (parseJsonBody), and the refusal shapes clients
 * branch on (jsonError, apiError). A flipped trust gate there mints a fresh
 * rate-limit bucket per forged header; an off-by-one in the cap lets a chunked
 * body past it. request.test.ts pins the trust ladder's happy paths; the suite
 * below adds the edges a mutant hides in (the exact cap, a non-numeric
 * Content-Length, a body split across chunks) and every mutant must fail it.
 *
 * Each mutant is transpiled in memory and evaluated as CommonJS in this
 * context, with `server-only` stubbed and `crypto` / `next/server` resolved to
 * the real modules. Nothing is written to disk.
 *
 * The kill ratio is a ratchet: it is 1 (every mutant killed) and may not go
 * down. A refactor that removes a mutation's target fails "every mutation
 * still applies"; move the mutation to the new code rather than deleting it.
 * Left out on purpose: dropping the empty-body check (JSON.parse rejects
 * whitespace anyway, so that mutant is equivalent) and the uncapped `req.json()`
 * branch (its only alternative reads the same bytes the same way).
 */

const SOURCE = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "request.ts"), "utf8");
const MIN_KILL_RATIO = 1;

type RequestModule = typeof RequestHelpers;

/** One targeted edit: `find` must occur exactly once in request.ts. */
const MUTANTS: { name: string; find: string; replace: string }[] = [
  // getClientIp: the trust ladder
  { name: "platform IP ignored", find: `if (platformIp) return platformIp;`, replace: `` },
  { name: "Vercel header trusted off-platform", find: `if (process.env.VERCEL === "1" || trustProxy) {`, replace: `if (true) {` },
  { name: "Vercel detection never matches", find: `process.env.VERCEL === "1"`, replace: `process.env.VERCEL === "true"` },
  { name: "Vercel header last hop taken", find: `return vercelForwarded.split(",")[0]?.trim() || "unknown";`, replace: `return vercelForwarded.split(",").pop()?.trim() || "unknown";` },
  { name: "TRUST_PROXY accepts any value", find: `process.env.TRUST_PROXY === "true"`, replace: `!!process.env.TRUST_PROXY` },
  { name: "proxy headers trusted without TRUST_PROXY", find: `if (trustProxy) {`, replace: `if (true) {` },
  { name: "x-real-ip skipped under TRUST_PROXY", find: `if (realIp) return realIp;`, replace: `` },
  { name: "x-forwarded-for last hop taken", find: `return xff.split(",")[0]?.trim() || "unknown";`, replace: `return xff.split(",").pop()?.trim() || "unknown";` },
  { name: "fingerprint ignores user-agent", find: `req.headers.get("user-agent") ?? "",`, replace: `"",` },
  { name: "no-signal guard removed", find: `if (fingerprintSource.replace(/\\|/g, "") === "") return "unknown";`, replace: `` },
  { name: "fingerprint collapsed to one bucket", find: "return `fp:${fp.slice(0, 16)}`;", replace: `return "unknown";` },
  // parseJsonBody: the cap and the parse
  { name: "declared length not checked", find: `if (!Number.isFinite(len) || len > maxBytes) return tooLarge();`, replace: `` },
  { name: "declared length refuses the exact cap", find: `len > maxBytes`, replace: `len >= maxBytes` },
  { name: "non-numeric Content-Length accepted", find: `!Number.isFinite(len) || `, replace: `` },
  { name: "streamed bytes not capped", find: `if (total > maxBytes) {`, replace: `if (false) {` },
  { name: "streamed cap refuses the exact cap", find: `total > maxBytes`, replace: `total >= maxBytes` },
  { name: "chunks dropped", find: `chunks.push(value);`, replace: `` },
  { name: "chunks overwrite each other", find: `offset += chunk.byteLength;`, replace: `` },
  { name: "too-large answers 400", find: `{ error: "Payload too large" }, { status: 413 }`, replace: `{ error: "Payload too large" }, { status: 400 }` },
  { name: "invalid JSON answers 422", find: `{ error: "Invalid JSON" }, { status: 400 }`, replace: `{ error: "Invalid JSON" }, { status: 422 }` },
  // jsonError / apiError: the refusal shapes
  { name: "jsonError status pinned to 500", find: `return NextResponse.json({ error }, { status, headers });`, replace: `return NextResponse.json({ error }, { status: 500, headers });` },
  { name: "apiError drops its code", find: `return NextResponse.json({ error, code }, { status, headers });`, replace: `return NextResponse.json({ error }, { status, headers });` },
];

/** Transpiles `source` and evaluates it as a fresh module. */
function load(source: string): RequestModule {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const requireStub = (id: string): unknown => {
    if (id === "server-only") return {};
    if (id === "crypto") return { createHash };
    if (id === "next/server") return { NextResponse };
    throw new Error(`request mutant imports an unexpected module: ${id}`);
  };
  const mod = { exports: {} as Record<string, unknown> };
  const factory = vm.runInThisContext(`(function (exports, require, module) {\n${outputText}\n})`) as (
    exports: Record<string, unknown>,
    require: (id: string) => unknown,
    module: { exports: Record<string, unknown> },
  ) => void;
  factory(mod.exports, requireStub, mod);
  return mod.exports as unknown as RequestModule;
}

/** Header lookup over lowercase keys, so no Headers guard can drop Content-Length. */
const headersOf = (h: Record<string, string>) => ({ get: (name: string) => h[name.toLowerCase()] ?? null });

const ipReq = (ip: string | null, h: Record<string, string> = {}) =>
  ({ ip, headers: headersOf(h) }) as unknown as NextRequest;

/** A request whose body arrives as the given chunks, in order. */
function bodyReq(chunks: string[], h: Record<string, string> = {}): NextRequest {
  const queue = chunks.map((c) => new TextEncoder().encode(c));
  const body = {
    getReader: () => ({
      read: async () => {
        const value = queue.shift();
        return value ? { done: false, value } : { done: true, value: undefined };
      },
      cancel: async () => undefined,
    }),
  };
  return { headers: headersOf(h), body, json: async () => JSON.parse(chunks.join("")) } as unknown as NextRequest;
}

function setEnv(vercel?: string, trustProxy?: string): void {
  if (vercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = vercel;
  if (trustProxy === undefined) delete process.env.TRUST_PROXY;
  else process.env.TRUST_PROXY = trustProxy;
}

/** Known behaviour of the helpers; returns the names of checks a build got wrong. */
async function rejectionSuite(m: RequestModule): Promise<string[]> {
  const wrong: string[] = [];
  const check = (name: string, ok: boolean) => {
    if (!ok) wrong.push(name);
  };
  const saved = { vercel: process.env.VERCEL, trustProxy: process.env.TRUST_PROXY };
  try {
    setEnv();
    check("platform IP wins over headers", m.getClientIp(ipReq("9.9.9.9", { "x-forwarded-for": "1.2.3.4" })) === "9.9.9.9");
    check(
      "Vercel header ignored off-platform",
      m.getClientIp(ipReq(null, { "x-vercel-forwarded-for": "6.6.6.6" })) === "unknown",
    );
    check("no signals at all is unknown", m.getClientIp(ipReq(null)) === "unknown");
    const a = m.getClientIp(ipReq(null, { "user-agent": "UA/1.0" }));
    const b = m.getClientIp(ipReq(null, { "user-agent": "UA/2.0" }));
    check("fingerprint has its shape", /^fp:[0-9a-f]{16}$/.test(a));
    check("distinct agents land in distinct buckets", a !== b);

    setEnv("1");
    check(
      "Vercel header first hop on Vercel",
      m.getClientIp(ipReq(null, { "x-vercel-forwarded-for": "6.6.6.6, 7.7.7.7" })) === "6.6.6.6",
    );

    setEnv(undefined, "false");
    check(
      "TRUST_PROXY needs the literal true",
      m.getClientIp(ipReq(null, { "x-real-ip": "5.5.5.5" })).startsWith("fp:"),
    );

    setEnv(undefined, "true");
    check(
      "x-real-ip first under TRUST_PROXY",
      m.getClientIp(ipReq(null, { "x-real-ip": "5.5.5.5", "x-forwarded-for": "4.4.4.4" })) === "5.5.5.5",
    );
    check(
      "x-forwarded-for first hop under TRUST_PROXY",
      m.getClientIp(ipReq(null, { "x-forwarded-for": "4.4.4.4, 8.8.8.8" })) === "4.4.4.4",
    );
  } finally {
    setEnv(saved.vercel, saved.trustProxy);
  }

  const cap = { maxBytes: 10 };
  const statusOf = (r: { ok: true } | { ok: false; response: NextResponse }) => (r.ok ? 200 : r.response.status);

  const declaredOver = await m.parseJsonBody(bodyReq(["{}"], { "content-length": "1000" }), cap);
  check("declared length over the cap is 413", statusOf(declaredOver) === 413);

  const declaredExact = await m.parseJsonBody<{ a: number }>(bodyReq(['{"a":1234}'], { "content-length": "10" }), cap);
  check("declared length at the cap is read", declaredExact.ok && declaredExact.data.a === 1234);

  const declaredJunk = await m.parseJsonBody(bodyReq(["{}"], { "content-length": "abc" }), cap);
  check("non-numeric Content-Length is 413", statusOf(declaredJunk) === 413);

  const streamedOver = await m.parseJsonBody(bodyReq(['{"a":"', 'xxxxxxxxxx"}']), cap);
  check("streamed bytes over the cap are 413", statusOf(streamedOver) === 413);

  const streamedExact = await m.parseJsonBody<{ a: number }>(bodyReq(['{"a":', "1234}"]), cap);
  check("two chunks totalling the cap are joined and read", streamedExact.ok && streamedExact.data.a === 1234);

  const notJson = await m.parseJsonBody(bodyReq(["not json"]), { maxBytes: 100 });
  check("unparseable body is 400", statusOf(notJson) === 400);

  check("jsonError keeps its status", m.jsonError("nope", 404).status === 404);
  const refusal = m.apiError("slow down", "rate_limited", 429);
  const refusalBody = (await refusal.json()) as { error?: string; code?: string };
  check("apiError carries status and code", refusal.status === 429 && refusalBody.code === "rate_limited");

  return wrong;
}

describe("request helpers mutation ratchet", () => {
  it("every mutation still applies to exactly one place in request.ts", () => {
    for (const m of MUTANTS) expect(SOURCE.split(m.find).length - 1, m.name).toBe(1);
  });

  it("the unmutated helpers pass the rejection suite (the harness is sound)", async () => {
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
