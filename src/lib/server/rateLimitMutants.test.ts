import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import * as request from "./request";
import type * as RateLimit from "./rate-limit";

/**
 * Proves the limiter's tests would notice a quiet regression, not only that
 * the limiter passes them today.
 *
 * rate-limit.ts is the trust boundary every write route goes through, and it
 * already shipped once inverted (see its header). rate-limit.test.ts pins the
 * direction; this spec asks the harder question the gate-script mutant specs
 * (aiChangeGateMutants, agentReworkMutants) ask of the scripts: if one rule
 * were broken (a flipped comparison, an off-by-one, a collapsed bucket key, a
 * window that never refills), would anything fail?
 *
 * The scripts are plain .mjs and are imported from a temp dir. This module is
 * TypeScript behind `server-only`, so each mutant is transpiled in memory and
 * evaluated as CommonJS in this context (so vitest's fake Date applies), with
 * `server-only` stubbed and `./request` resolved to the real module. Nothing is
 * written to disk.
 *
 * The kill ratio is a ratchet: it is 1 (every mutant killed) and may not go
 * down. A refactor that removes a mutation's target fails "every mutation
 * still applies"; move the mutation to the new code rather than deleting it.
 * Two mutants (retry floor removed, reset boundary made inclusive) are only
 * reachable at the exact reset instant, which rate-limit.test.ts does not
 * visit; the rejection suite below does.
 */

const SOURCE = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "rate-limit.ts"), "utf8");
const MIN_KILL_RATIO = 1;

type Limiter = typeof RateLimit;

/** One targeted edit: `find` must occur exactly once in the limiter's source. */
const MUTANTS: { name: string; find: string; replace: string }[] = [
  { name: "polarity inverted", find: `allowed: bucket.count <= limit,`, replace: `allowed: bucket.count > limit,` },
  { name: "admits limit-1", find: `bucket.count <= limit`, replace: `bucket.count < limit` },
  { name: "admits limit+1", find: `bucket.count <= limit`, replace: `bucket.count <= limit + 1` },
  { name: "a new window starts at zero", find: `{ count: 1, resetAt }`, replace: `{ count: 0, resetAt }` },
  { name: "requests in a window are not counted", find: `bucket.count += 1;`, replace: `` },
  { name: "window never refills", find: `if (!bucket || now > bucket.resetAt) {`, replace: `if (!bucket) {` },
  { name: "reset boundary made inclusive", find: `if (!bucket || now > bucket.resetAt) {`, replace: `if (!bucket || now >= bucket.resetAt) {` },
  { name: "window twice as long", find: `const resetAt = now + windowMs;`, replace: `const resetAt = now + windowMs * 2;` },
  { name: "bucket keyed by namespace only", find: "const bucketKey = `${namespace}:${key}`;", replace: "const bucketKey = namespace;" },
  { name: "bucket keyed by IP only", find: "const bucketKey = `${namespace}:${key}`;", replace: "const bucketKey = key;" },
  { name: "Retry-After rounds down", find: `Math.ceil((resetAt - now) / 1000)`, replace: `Math.floor((resetAt - now) / 1000)` },
  { name: "Retry-After floor removed", find: `Math.max(1, Math.ceil((resetAt - now) / 1000))`, replace: `Math.ceil((resetAt - now) / 1000)` },
  { name: "guard polarity inverted", find: `if (result.allowed) return null;`, replace: `if (!result.allowed) return null;` },
  { name: "guard Retry-After hardcoded", find: `String(result.retryAfterSeconds)`, replace: `"60"` },
];

/** Transpiles `source` and evaluates it, so each call gets its own bucket Map. */
function load(source: string): Limiter {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const requireStub = (id: string): unknown => {
    if (id === "server-only") return {};
    if (id === "./request") return request;
    throw new Error(`rate-limit mutant imports an unexpected module: ${id}`);
  };
  const mod = { exports: {} as Record<string, unknown> };
  const factory = vm.runInThisContext(`(function (exports, require, module) {\n${outputText}\n})`) as (
    exports: Record<string, unknown>,
    require: (id: string) => unknown,
    module: { exports: Record<string, unknown> },
  ) => void;
  factory(mod.exports, requireStub, mod);
  return mod.exports as unknown as Limiter;
}

/** Known behaviour of the limiter; returns the names of checks a build got wrong. */
function rejectionSuite(m: Limiter): string[] {
  const wrong: string[] = [];
  const check = (name: string, ok: boolean) => {
    if (!ok) wrong.push(name);
  };
  vi.useFakeTimers();
  try {
    const dir = { namespace: "dir", key: "1.2.3.4", limit: 3, windowMs: 60_000 };
    const verdicts = Array.from({ length: 5 }, () => m.checkRateLimit(dir).allowed);
    check("exactly `limit` admitted, then refused", JSON.stringify(verdicts) === JSON.stringify([true, true, true, false, false]));

    const one = { limit: 1, windowMs: 60_000 };
    m.checkRateLimit({ namespace: "keys", key: "a", ...one });
    check("another IP has its own bucket", m.checkRateLimit({ namespace: "keys", key: "b", ...one }).allowed);
    check("another namespace has its own bucket", m.checkRateLimit({ namespace: "keys-2", key: "a", ...one }).allowed);

    const w = { namespace: "window", key: "x", limit: 1, windowMs: 60_000 };
    const first = m.checkRateLimit(w);
    check("a new window reports the full window", first.allowed && first.retryAfterSeconds === 60);
    vi.advanceTimersByTime(29_500);
    const mid = m.checkRateLimit(w);
    check("refused mid-window, Retry-After rounded up", !mid.allowed && mid.retryAfterSeconds === 31 && mid.resetAt === first.resetAt);
    vi.advanceTimersByTime(30_500);
    const edge = m.checkRateLimit(w);
    check("still refused at the reset instant, Retry-After 1", !edge.allowed && edge.retryAfterSeconds === 1);
    vi.advanceTimersByTime(1);
    check("refilled once the window has passed", m.checkRateLimit(w).allowed);

    const g = { namespace: "guard", key: "x", limit: 1, windowMs: 60_000 };
    check("guard lets a request within budget through", m.rateLimitGuard(g) === null);
    vi.advanceTimersByTime(15_000);
    const refusal = m.rateLimitGuard(g);
    check("guard refuses over budget with 429", refusal?.status === 429);
    check("guard Retry-After comes from the window", refusal?.headers.get("Retry-After") === "45");
  } finally {
    vi.useRealTimers();
  }
  return wrong;
}

describe("rate-limit mutation ratchet", () => {
  it("every mutation still applies to exactly one place in the limiter", () => {
    for (const m of MUTANTS) expect(SOURCE.split(m.find).length - 1, m.name).toBe(1);
  });

  it("the unmutated limiter passes the rejection suite (the harness is sound)", () => {
    expect(rejectionSuite(load(SOURCE))).toEqual([]);
  });

  it.each(MUTANTS.map((m, i): [string, number] => [m.name, i]))("kills the mutant: %s", (_name, i) => {
    const m = MUTANTS[i];
    expect(rejectionSuite(load(SOURCE.replace(m.find, m.replace))).length, `${m.name} survived the rejection suite`).toBeGreaterThan(0);
  });

  it(`kills at least ${MIN_KILL_RATIO * 100}% of mutants`, () => {
    const killed = MUTANTS.filter((m) => rejectionSuite(load(SOURCE.replace(m.find, m.replace))).length > 0).length;
    expect(killed / MUTANTS.length).toBeGreaterThanOrEqual(MIN_KILL_RATIO);
  });
});
