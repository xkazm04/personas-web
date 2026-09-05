import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOURS_BY_ID, type TourStep } from "@/lib/tour-script";

/**
 * Anchor-contract gate for the guided tour.
 *
 * The tour aims a spotlight at selectors it hard-codes — `[data-tour-diagram]`
 * anchors for the diagrams it narrates, and `[data-trigger-id]` /
 * `[data-card-id]` / `[data-lab-tab]` / `[data-plugin-key]` targets its timed
 * `actions` click to drive those diagrams. Nothing connects those strings to
 * the components that carry them. Rename a card id, move a diagram, drop a lab
 * tab, and the tour keeps running: the spotlight lands on empty page while the
 * narration confidently describes something that is no longer there. A tour
 * pointing at a moved element is worse than no tour, because it teaches a
 * falsehood with the full authority of the product's own chrome.
 *
 * This is that missing connection — a derived manifest, never a hand-kept list.
 * Selectors are read out of the live step objects (and, for `actions`, out of
 * the action bodies via `Function.prototype.toString`) so a step added tomorrow
 * is covered the moment it is written. Matching is on the attribute NAME and
 * VALUE, so source formatting, quote style and JSX attribute order cannot break
 * it.
 *
 * Deliberately NOT checked here:
 *
 * - **Runtime geometry.** Whether the anchor is visible, scrolled to, or
 *   spotlighted correctly is `e2e/tour.spec.ts`'s job. This gate only asserts
 *   the identifiers exist in source.
 * - **`scrollTarget` element ids** (`#tools`, `#pipelines`, `#vision`,
 *   `#download-section`). Those ids are not written on any element: the
 *   homepage composes sections from a table in `src/app/page.tsx` that passes
 *   `wrapperId: "tools"` into `SectionWrapper`. Verifying them would mean
 *   either matching the bare word `"tools"` anywhere in `src/` (which also hits
 *   unrelated guide tags, so it could never fail) or hard-coding knowledge of
 *   the `wrapperId` prop. Both are worse than saying so out loud. Attribute-form
 *   `scrollTarget`s — the dashboard steps — ARE checked, since those are real
 *   selectors.
 * - **Unreferenced anchors.** Some anchors exist in components that no step
 *   points at (`dashboard-health`, `dashboard-incidents`, `dashboard-ticker`,
 *   `command-center`). That is slack for future steps, not a defect, so it is
 *   reported as information and never fails.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const SRC_ROOT = path.join(REPO_ROOT, "src");
const TOUR_SCRIPT = "src/lib/tour-script.ts";
const SELF = path.relative(REPO_ROOT, fileURLToPath(import.meta.url)).replaceAll("\\", "/");

// ---------------------------------------------------------------------------
// The source index the gate resolves against.
// ---------------------------------------------------------------------------

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Every source file except the tour script itself and this spec — otherwise the
 * selector literals in `tour-script.ts` would satisfy their own contract and the
 * gate would pass on a repo with zero anchors left in it.
 */
const SOURCES: { rel: string; text: string }[] = walk(SRC_ROOT)
  .map((file) => ({
    rel: path.relative(REPO_ROOT, file).replaceAll("\\", "/"),
    text: readFileSync(file, "utf8"),
  }))
  .filter(({ rel }) => rel !== TOUR_SCRIPT && rel !== SELF);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");

// ---------------------------------------------------------------------------
// Extraction — derived from the live step objects, never hand-maintained.
// ---------------------------------------------------------------------------

interface SelectorRef {
  /** The raw selector as the tour uses it, e.g. `[data-card-id="lab"]`. */
  selector: string;
  /** Human-readable "which step, which field" label for the failure message. */
  step: string;
}

/**
 * Quoted string literals inside a snippet of source (an action body).
 * Escapes are unwound, because the transform that hands us `run.toString()` is
 * free to re-quote `'[data-card-id="lab"]'` as `"[data-card-id=\"lab\"]"`.
 */
function stringLiterals(source: string): string[] {
  const out: string[] = [];
  for (const m of source.matchAll(/(["'`])((?:[^\\]|\\.)*?)\1/g)) {
    out.push(m[2].replace(/\\(.)/g, "$1"));
  }
  return out;
}

function refsForStep(tourId: string, step: TourStep): SelectorRef[] {
  const at = (field: string) => `${tourId} tour, step "${step.id}" (${field})`;
  const refs: SelectorRef[] = [{ selector: step.spotlightTarget, step: at("spotlightTarget") }];
  // Attribute-form scroll targets only; see the header note on element ids.
  if (step.scrollTarget.startsWith("[")) {
    refs.push({ selector: step.scrollTarget, step: at("scrollTarget") });
  }
  (step.spotlightSequence ?? []).forEach((cue, i) => {
    refs.push({ selector: cue.target, step: at(`spotlightSequence[${i}] @${cue.atMs}ms`) });
  });
  // Action targets are only visible in the action body. Reading the string
  // literals out of `run.toString()` (rather than matching on the helper's
  // name) survives any renaming or transform of the helpers themselves.
  (step.actions ?? []).forEach((action, i) => {
    for (const literal of stringLiterals(action.run.toString())) {
      refs.push({ selector: literal, step: at(`actions[${i}] @${action.atMs}ms`) });
    }
  });
  return refs;
}

const ALL_REFS: SelectorRef[] = Object.entries(TOURS_BY_ID).flatMap(([tourId, steps]) =>
  steps.flatMap((step) => refsForStep(tourId, step)),
);

const ATTRIBUTE_REFS = ALL_REFS.filter((r) => /^\[[\w-]+\s*=/.test(r.selector));
/** Non-selector literals — today only the `clickByText` label. */
const TEXT_REFS = ALL_REFS.filter((r) => !r.selector.startsWith("["));

// ---------------------------------------------------------------------------
// Resolution.
// ---------------------------------------------------------------------------

function parse(selector: string): { attr: string; value: string } {
  const m = /^\[\s*([\w-]+)\s*=\s*["']?(.*?)["']?\s*\]$/.exec(selector);
  if (!m) throw new Error(`Unparseable attribute selector: ${selector}`);
  return { attr: m[1], value: m[2] };
}

/**
 * Resolve one `[attr="value"]` selector against the source tree.
 *
 * Two tiers, because half these anchors are written literally in JSX and half
 * are data-driven:
 *
 * 1. **Literal** — `attr="value"` / `attr='value'` / `attr={"value"}`, in any
 *    whitespace or quote style.
 * 2. **Data-driven** — the attribute is bound to an expression
 *    (`data-card-id={card.id}`). The property the binding ends in (`id`) is
 *    read off the binding itself, then the value must exist as that property in
 *    a data literal (`id: "credential-vault"`). So deleting the card from
 *    `vision-grid/data.ts` still fails this gate, which is the case that
 *    matters.
 */
function resolve(attr: string, value: string): { ok: boolean; how: string } {
  const literal = new RegExp(`${escape(attr)}\\s*=\\s*\\{?\\s*(["'])${escape(value)}\\1`);
  const hit = SOURCES.find((s) => literal.test(s.text));
  if (hit) return { ok: true, how: `literal in ${hit.rel}` };

  const binding = new RegExp(`${escape(attr)}\\s*=\\s*\\{([^}]+)\\}`, "g");
  const props = new Set<string>();
  const carriers = new Set<string>();
  for (const s of SOURCES) {
    for (const m of s.text.matchAll(binding)) {
      carriers.add(s.rel);
      const tail = m[1].trim().split(".").pop() ?? "";
      if (/^[A-Za-z_$][\w$]*$/.test(tail)) props.add(tail);
    }
  }
  if (props.size === 0) {
    return { ok: false, how: `no element in src/ carries a "${attr}" attribute at all` };
  }
  for (const prop of props) {
    const dataLiteral = new RegExp(`\\b${escape(prop)}\\s*:\\s*(["'])${escape(value)}\\1`);
    const source = SOURCES.find((s) => dataLiteral.test(s.text));
    if (source) {
      const carrier = [...carriers][0];
      return { ok: true, how: `data-driven via ${carrier} → ${prop}: "${value}" in ${source.rel}` };
    }
  }
  return {
    ok: false,
    how:
      `"${attr}" is bound dynamically (${[...carriers].join(", ")}) but no data record defines ` +
      `${[...props].map((p) => `${p}: "${value}"`).join(" or ")}`,
  };
}

// ---------------------------------------------------------------------------

describe("tour anchor manifest", () => {
  it("extracts a non-empty manifest from the tour scripts", () => {
    // Guards the guard. If extraction breaks — a step shape change, an action
    // body the literal scan cannot read — this fails loudly rather than
    // silently checking nothing. Floors sit just under today's counts.
    expect(
      ATTRIBUTE_REFS.length,
      "No attribute selectors extracted from TOURS_BY_ID — the extraction in this file has drifted from the step shape.",
    ).toBeGreaterThanOrEqual(35);
    expect(
      new Set(ATTRIBUTE_REFS.map((r) => r.selector)).size,
      "Fewer unique anchors than expected — either steps were removed or extraction broke.",
    ).toBeGreaterThanOrEqual(30);
    expect(SOURCES.length).toBeGreaterThan(100);
  });

  it.each(ATTRIBUTE_REFS.map((r) => ({ ...r, ...parse(r.selector) })))(
    "$selector ($step) resolves to a real element",
    ({ selector, step: stepLabel, attr, value }) => {
      const { ok, how } = resolve(attr, value);
      expect(
        ok,
        `The tour aims at ${selector} but nothing in src/ provides it.\n` +
          `  Referenced by: ${stepLabel}\n` +
          `  Attribute:     ${attr}="${value}"\n` +
          `  Why it failed: ${how}\n` +
          `  Fix: restore the anchor on the element the step describes, or point the step at the anchor that replaced it (src/lib/tour-script.ts).`,
      ).toBe(true);
    },
  );

  it.each(TEXT_REFS)(
    "clickByText literal $selector still exists as on-screen copy",
    ({ selector, step: stepLabel }) => {
      // `clickByText` matches on rendered text, not an attribute, so it cannot
      // be resolved the way an anchor can. It is still checked rather than
      // dropped: the literal must appear inside a string in some source file.
      // Weaker than an anchor match — it cannot prove the string reaches a
      // button — but it does catch the rename that silently turns the step's
      // click into a no-op.
      const inStringLiteral = new RegExp(`(["'\`])(?:[^\\\\]|\\\\.)*?${escape(selector)}`);
      const hit = SOURCES.find((s) => inStringLiteral.test(s.text));
      expect(
        hit,
        `${stepLabel} clicks the control labelled "${selector}", but that text appears in no source file under src/.\n` +
          `  The step's action would silently do nothing. Update the literal in src/lib/tour-script.ts to match the current label.`,
      ).toBeDefined();
    },
  );

  // The counts live in the test NAME, not only in a console line: vitest
  // swallows console output unless --disable-console-intercept is passed, and a
  // gate whose size is invisible is a gate nobody notices going to zero.
  it(`checked ${ALL_REFS.length} selector references (${new Set(ALL_REFS.map((r) => r.selector)).size} unique) and reports unreferenced anchors as information`, () => {
    const defined = new Set<string>();
    for (const s of SOURCES) {
      for (const m of s.text.matchAll(/data-tour-diagram\s*=\s*\{?\s*(["'])(.*?)\1/g)) {
        defined.add(m[2]);
      }
    }
    const referenced = new Set(
      ATTRIBUTE_REFS.map((r) => parse(r.selector))
        .filter((p) => p.attr === "data-tour-diagram")
        .map((p) => p.value),
    );
    const unreferenced = [...defined].filter((a) => !referenced.has(a)).sort();
    // Never fails: an unused anchor is slack for a future step, not a defect.
    // The count is surfaced so a growing pile of dead anchors stays visible.
    console.info(
      `[tour anchors] ${referenced.size} diagram anchors referenced by steps, ` +
        `${ATTRIBUTE_REFS.length} selector references checked ` +
        `(${new Set(ATTRIBUTE_REFS.map((r) => r.selector)).size} unique). ` +
        (unreferenced.length
          ? `Defined but unreferenced: ${unreferenced.join(", ")}.`
          : "Every defined anchor is referenced."),
    );
    expect(defined.size).toBeGreaterThan(0);
  });
});
