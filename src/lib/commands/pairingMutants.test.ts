import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";
import * as envelope from "./envelope";
import type * as PairingModule from "./pairing";
import type * as SentryPiiModule from "../sentry-pii";

/**
 * Proves the pairing-link guards would be noticed if they quietly broke, the
 * same question requestMutants.test.ts asks of the request helpers.
 *
 * A `#pair=<id>.<secret>` link carries the secret that lets a phone pair with
 * the desktop, and the paired phone then holds a signing key. The decision
 * record docs/decisions/2026-10-09-pairing-link-and-team-key-hardening.md names
 * where that secret must not survive: the router URL (takePairFragment scrubs
 * with a null state, so Next's patch syncs the router), Sentry message text,
 * the Sentry request URL, and breadcrumb data (sentry-pii). It also names what
 * a pairing link must be (parsePairFragment). Each mutant below undoes one of
 * those checks, and the suite must catch every one.
 *
 * Each mutant is transpiled in memory and evaluated as CommonJS in this
 * context, with `@sentry/nextjs` stubbed (only captureExceptionScrubbed uses
 * it) and `./envelope` resolved to the real module. Nothing is written to disk.
 *
 * The kill ratio is a ratchet: it is 1 (every mutant killed) and may not go
 * down. A refactor that removes a mutation's target fails "every mutation
 * still applies"; move the mutation to the new code rather than deleting it.
 * Left out on purpose: running the `pair=` pass after the UUID pass (PAIR_RE
 * still matches `pair=[id:…].<secret>` whole, so that mutant is equivalent),
 * and the replace-confirmation in controllerStore, which is UI state that
 * pairing.test.ts and its own suite pin.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCES = {
  pairing: fs.readFileSync(path.join(HERE, "pairing.ts"), "utf8"),
  sentryPii: fs.readFileSync(path.join(HERE, "..", "sentry-pii.ts"), "utf8"),
};
type Target = keyof typeof SOURCES;
const MIN_KILL_RATIO = 1;

/** One targeted edit: `find` must occur exactly once in the target file. */
const MUTANTS: { name: string; target: Target; find: string; replace: string }[] = [
  // takePairFragment: the secret leaves the URL at once, router included
  { name: "fragment left on the URL", target: "pairing", find: `history.replaceState(null, "", loc.pathname + loc.search);`, replace: `` },
  { name: "router state passed through", target: "pairing", find: `history.replaceState(null,`, replace: `history.replaceState({ __NA: true },` },
  { name: "fragment kept in the replaced URL", target: "pairing", find: `loc.pathname + loc.search);`, replace: `loc.pathname + loc.search + loc.hash);` },
  { name: "malformed pairing fragment not scrubbed", target: "pairing", find: `if (!loc.hash.startsWith("#pair=")) return null;`, replace: `if (!loc.hash.startsWith("#pair=") || !parsePairFragment(loc.hash)) return null;` },
  { name: "every fragment scrubbed", target: "pairing", find: `if (!loc.hash.startsWith("#pair=")) return null;`, replace: `` },
  // parsePairFragment: what a pairing link is
  { name: "pairing id not checked as a UUID", target: "pairing", find: `if (!UUID.test(pairingId)) return null;`, replace: `` },
  { name: "secret length not checked", target: "pairing", find: `if (fromBase64Url(secret).length !== 32) return null;`, replace: `` },
  { name: "trailing text after the secret accepted", target: "pairing", find: `([A-Za-z0-9_-]+)$/`, replace: `([A-Za-z0-9_-]+)/` },
  // sentry-pii: the secret does not reach an event
  { name: "pair= pass dropped from message text", target: "sentryPii", find: `result = result.replace(PAIR_RE, "pair=[redacted]");`, replace: `` },
  { name: "pair= pass case-sensitive", target: "sentryPii", find: "/pair=[^\\s&#\"'`]*/gi", replace: "/pair=[^\\s&#\"'`]*/g" },
  { name: "request URL keeps its fragment", target: "sentryPii", find: `if (hash !== -1) event.request.url = event.request.url.slice(0, hash);`, replace: `` },
  { name: "breadcrumb string data not scrubbed", target: "sentryPii", find: `breadcrumb.data[key] = scrubPii(val);`, replace: `breadcrumb.data[key] = val;` },
];

/** Transpiles `source` and evaluates it as a fresh module. */
function load(source: string): Record<string, unknown> {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const requireStub = (id: string): unknown => {
    if (id === "./envelope") return envelope;
    if (id === "@sentry/nextjs") return {};
    throw new Error(`pairing mutant imports an unexpected module: ${id}`);
  };
  const mod = { exports: {} as Record<string, unknown> };
  const factory = vm.runInThisContext(`(function (exports, require, module) {\n${outputText}\n})`) as (
    exports: Record<string, unknown>,
    require: (id: string) => unknown,
    module: { exports: Record<string, unknown> },
  ) => void;
  factory(mod.exports, requireStub, mod);
  return mod.exports;
}

type Modules = { pairing: typeof PairingModule; sentryPii: typeof SentryPiiModule };

function build(mutant?: { target: Target; find: string; replace: string }): Modules {
  const source = (t: Target) => (mutant && mutant.target === t ? SOURCES[t].replace(mutant.find, mutant.replace) : SOURCES[t]);
  return {
    pairing: load(source("pairing")) as unknown as typeof PairingModule,
    sentryPii: load(source("sentryPii")) as unknown as typeof SentryPiiModule,
  };
}

const ID = "123e4567-e89b-42d3-a456-426614174000";
/** 43 base64url characters: exactly 32 bytes. */
const SECRET = "A".repeat(43);
const LINK = `#pair=${ID}.${SECRET}`;

function historySpy() {
  const calls: unknown[][] = [];
  const history = {
    replaceState: (...args: unknown[]) => {
      calls.push(args);
    },
  } as unknown as Pick<History, "replaceState">;
  return { calls, history };
}

/** Known behaviour of the pairing path; returns the names of checks a build got wrong. */
function rejectionSuite({ pairing, sentryPii }: Modules): string[] {
  const wrong: string[] = [];
  const check = (name: string, ok: () => boolean) => {
    let passed = false;
    try {
      passed = ok();
    } catch {
      passed = false;
    }
    if (!passed) wrong.push(name);
  };

  check("a pairing link is taken off the URL with a null state, query kept", () => {
    const { calls, history } = historySpy();
    const taken = pairing.takePairFragment({ hash: LINK, pathname: "/dashboard/settings", search: "?tab=phone" }, history);
    return (
      taken?.pairingId === ID &&
      taken.secret === SECRET &&
      calls.length === 1 &&
      calls[0][0] === null &&
      calls[0][2] === "/dashboard/settings?tab=phone"
    );
  });
  check("a malformed pairing fragment is still scrubbed", () => {
    const { calls, history } = historySpy();
    const taken = pairing.takePairFragment({ hash: "#pair=junk", pathname: "/dashboard/settings", search: "" }, history);
    return taken === null && calls.length === 1;
  });
  check("an ordinary fragment is left alone", () => {
    const { calls, history } = historySpy();
    return pairing.takePairFragment({ hash: "#faq", pathname: "/guide", search: "" }, history) === null && calls.length === 0;
  });
  check("a pairing id that is not a UUID is refused", () => pairing.parsePairFragment(`#pair=not-a-uuid.${SECRET}`) === null);
  check("a secret that is not 32 bytes is refused", () => pairing.parsePairFragment(`#pair=${ID}.${"A".repeat(22)}`) === null);
  check("text after the secret is refused", () => pairing.parsePairFragment(`${LINK}&x=1`) === null);

  check("message text loses the pairing secret", () => {
    const out = sentryPii.scrubPii(`opened /dashboard/settings${LINK}`);
    return !out.includes(SECRET) && out.includes("pair=[redacted]");
  });
  check("an upper-case PAIR= loses its secret too", () => !sentryPii.scrubPii(`opened /dashboard/settings#PAIR=${ID}.${SECRET}`).includes(SECRET));
  check("the event request URL is cut at the fragment", () => {
    const event = { request: { url: `https://personas.test/dashboard/settings${LINK}` } } as unknown as ErrorEvent;
    return sentryPii.scrubEvent(event).request?.url === "https://personas.test/dashboard/settings";
  });
  check("breadcrumb string data loses the pairing secret", () => {
    const crumb = { category: "navigation", data: { navigatedTo: `/dashboard/settings${LINK}` } } as Breadcrumb;
    return !String(sentryPii.scrubBreadcrumb(crumb).data?.navigatedTo).includes(SECRET);
  });
  return wrong;
}

describe("pairing link mutation ratchet", () => {
  it("every mutation still applies to exactly one place in its file", () => {
    for (const m of MUTANTS) expect(SOURCES[m.target].split(m.find).length - 1, m.name).toBe(1);
  });

  it("the unmutated pairing path passes the rejection suite (the harness is sound)", () => {
    expect(rejectionSuite(build())).toEqual([]);
  });

  it.each(MUTANTS.map((m, i): [string, number] => [m.name, i]))("kills the mutant: %s", (_name, i) => {
    const m = MUTANTS[i];
    expect(rejectionSuite(build(m)).length, `${m.name} survived the rejection suite`).toBeGreaterThan(0);
  });

  it(`kills at least ${MIN_KILL_RATIO * 100}% of mutants`, () => {
    let killed = 0;
    for (const m of MUTANTS) if (rejectionSuite(build(m)).length > 0) killed++;
    expect(killed / MUTANTS.length).toBeGreaterThanOrEqual(MIN_KILL_RATIO);
  });
});
