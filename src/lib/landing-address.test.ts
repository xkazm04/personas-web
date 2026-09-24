import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LANDING_SECTIONS } from "./constants";
import {
  ARRIVAL_BUDGET_MS,
  REASSERT_MS,
  isUserScrollIntent,
  pickWaitlistPlatform,
  resolveLandingAddress,
  step,
  type ArrivalState,
} from "./landing-address";

/**
 * The home page's address space: `/#download`, `/#faq`, `#download-section`...
 *
 * Most home sections are `ssr: false` and viewport-gated, so their ids are not
 * in the DOM at first paint. The browser's fragment scroll and Next's
 * layout-router both give up on a missing id, which dropped every cross-page
 * "Download free" click at the top of the hero. `landing-address.ts` is the one
 * resolver for that address space; the arrival hook drives the pure `step()`
 * table below against the live DOM.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const SRC_ROOT = path.join(REPO_ROOT, "src");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}
const rel = (full: string) => path.relative(REPO_ROOT, full).replaceAll("\\", "/");

describe("resolveLandingAddress", () => {
  it("resolves a declared address to its always-present wrapper and inner section", () => {
    expect(resolveLandingAddress("#download")).toMatchObject({
      id: "download",
      wrapperSelector: '[data-scroll-anchor="download"]',
      innerId: "download",
    });
  });

  it("treats the external wrapper ids as aliases of the declared address", () => {
    expect(resolveLandingAddress("#download-section")?.id).toBe("download");
    expect(resolveLandingAddress("#tools")?.id).toBe("use-cases");
    expect(resolveLandingAddress("#playground")?.id).toBe("playground-split");
  });

  it("returns null for anything outside the declared address space", () => {
    expect(resolveLandingAddress("#features")).toBeNull();
    expect(resolveLandingAddress("")).toBeNull();
    expect(resolveLandingAddress("#")).toBeNull();
    // flow-composer / event-bus keep their own state in the hash - never hijack it.
    expect(resolveLandingAddress("#flow=abc")).toBeNull();
  });

  it("guard: every LANDING_SECTIONS id resolves to a wrapper page.tsx actually emits", () => {
    const page = read("src/app/page.tsx");
    const emitted = new Set([...page.matchAll(/anchorId:\s*"([^"]+)"/g)].map((m) => m[1]));
    for (const { id } of LANDING_SECTIONS) {
      const address = resolveLandingAddress(`#${id}`);
      expect(address, id).not.toBeNull();
      if (id === "hero") {
        // The hero is SSR'd into an always-present `<div id="hero">`.
        expect(page).toMatch(/<div id="hero"/);
        expect(address!.wrapperSelector).toBe("#hero");
      } else {
        expect(emitted.has(id), `page.tsx emits data-scroll-anchor="${id}"`).toBe(true);
        expect(address!.wrapperSelector).toBe(`[data-scroll-anchor="${id}"]`);
      }
    }
  });

  it("guard: every page.tsx wrapperId that differs from its anchorId is an alias of it", () => {
    const page = read("src/app/page.tsx");
    const pairs = [...page.matchAll(/wrapperId:\s*"([^"]+)",\s*anchorId:\s*"([^"]+)"/g)];
    expect(pairs.length).toBeGreaterThan(0);
    for (const [, wrapperId, anchorId] of pairs) {
      expect(resolveLandingAddress(`#${wrapperId}`)?.id, `#${wrapperId}`).toBe(anchorId);
    }
  });

  it("get-started's id is emitted once: the always-present wrapper holds it, the mounted section does not", () => {
    // Two elements with id="get-started" is invalid HTML, and getElementById /
    // a native `#get-started` jump silently pick whichever comes first.
    const page = read("src/app/page.tsx");
    const wrapperEmits = [...page.matchAll(/wrapperId:\s*"get-started"/g)].length;
    const sectionEmits = walk(path.join(SRC_ROOT, "components", "sections")).reduce(
      (n, file) => n + [...readFileSync(file, "utf8").matchAll(/\bid="get-started"/g)].length,
      0,
    );
    expect({ wrapperEmits, sectionEmits }).toEqual({ wrapperEmits: 1, sectionEmits: 0 });
  });

  it("finds the mounted get-started section by its heading label, not by an id the wrapper owns", () => {
    const address = resolveLandingAddress("#get-started")!;
    expect(address.wrapperSelector).toBe('[data-scroll-anchor="get-started"]');
    expect(address.innerSelector).toBe(
      '[data-scroll-anchor="get-started"] [aria-labelledby="get-started-heading"]',
    );
    // ...and that label is really what the section carries.
    expect(read("src/components/sections/get-started/index.tsx")).toMatch(
      /<SectionWrapper aria-labelledby="get-started-heading">/,
    );
  });

  it("pricing's id is emitted once: the always-present wrapper holds it, the mounted section does not", () => {
    // Same bug class as get-started: page.tsx's wrapper and the Pricing
    // SectionWrapper both rendered id="pricing".
    const page = read("src/app/page.tsx");
    const wrapperEmits = [...page.matchAll(/wrapperId:\s*"pricing"/g)].length;
    const sectionEmits = walk(path.join(SRC_ROOT, "components", "sections")).reduce(
      (n, file) => n + [...readFileSync(file, "utf8").matchAll(/\bid="pricing"/g)].length,
      0,
    );
    expect({ wrapperEmits, sectionEmits }).toEqual({ wrapperEmits: 1, sectionEmits: 0 });
  });

  it("finds the mounted pricing section by its heading label, not by an id the wrapper owns", () => {
    const address = resolveLandingAddress("#pricing")!;
    expect(address.wrapperSelector).toBe('[data-scroll-anchor="pricing"]');
    expect(address.innerSelector).toBe('[data-scroll-anchor="pricing"] [aria-labelledby="compare-heading"]');
    // ...and that label is really what the section carries, on the heading it names.
    const section = read("src/components/sections/pricing/index.tsx");
    expect(section).toMatch(/<SectionWrapper aria-labelledby="compare-heading">/);
    expect(section).toMatch(/<SectionIntro\s+id="compare-heading"/);
  });

  it("guard: every inner section id is rendered by some home section", () => {
    const ids = new Set<string>();
    for (const file of walk(path.join(SRC_ROOT, "components", "sections"))) {
      for (const m of readFileSync(file, "utf8").matchAll(/\bid="([^"]+)"/g)) ids.add(m[1]);
    }
    for (const { id } of LANDING_SECTIONS) {
      if (id === "hero") continue;
      const { innerId } = resolveLandingAddress(`#${id}`)!;
      expect(ids.has(innerId), `a section renders id="${innerId}"`).toBe(true);
    }
  });
});

describe("arrival step() transition table", () => {
  const base = { innerMounted: false, userScrolled: false, layoutShifted: false, elapsedMs: 100 };

  it("seeking with the section not yet mounted keeps the wrapper in view", () => {
    expect(step("seeking", base)).toEqual({ state: "seeking", action: "scroll-wrapper" });
  });

  it("seeking lands as soon as the inner section mounts", () => {
    expect(step("seeking", { ...base, innerMounted: true })).toEqual({
      state: "landed",
      action: "scroll-inner-and-focus",
    });
  });

  it("a reader who scrolls cancels the arrival", () => {
    expect(step("seeking", { ...base, userScrolled: true })).toEqual({ state: "cancelled", action: "none" });
    expect(step("seeking", { ...base, userScrolled: true, innerMounted: true })).toEqual({
      state: "cancelled",
      action: "none",
    });
    // After landing, the reader taking over simply ends the re-assert window.
    expect(step("landed", { ...base, userScrolled: true, layoutShifted: true })).toEqual({
      state: "done",
      action: "none",
    });
  });

  it("the script's own scrollIntoView never cancels the arrival", () => {
    // Our scroll produces `scroll` events only; those are not reader intent.
    expect(isUserScrollIntent({ type: "scroll" })).toBe(false);
    // So a tick that observed movement but no intent keeps seeking.
    expect(step("seeking", { ...base, userScrolled: isUserScrollIntent({ type: "scroll" }) })).toEqual({
      state: "seeking",
      action: "scroll-wrapper",
    });
    // Reader intent is wheel / touch / scroll keys / pointer (scrollbar drag).
    expect(isUserScrollIntent({ type: "wheel" })).toBe(true);
    expect(isUserScrollIntent({ type: "touchmove" })).toBe(true);
    expect(isUserScrollIntent({ type: "pointerdown" })).toBe(true);
    expect(isUserScrollIntent({ type: "keydown", key: "PageDown" })).toBe(true);
    expect(isUserScrollIntent({ type: "keydown", key: " " })).toBe(true);
    expect(isUserScrollIntent({ type: "keydown", key: "Tab" })).toBe(false);
  });

  it("gives up once the time budget is spent", () => {
    expect(step("seeking", { ...base, elapsedMs: ARRIVAL_BUDGET_MS + 1 })).toEqual({
      state: "exhausted",
      action: "none",
    });
  });

  it("re-asserts the landing when the layout shifts inside the window (reserve-and-re-assert)", () => {
    expect(step("landed", { ...base, innerMounted: true, layoutShifted: true, elapsedMs: REASSERT_MS - 1 })).toEqual({
      state: "landed",
      action: "reassert-inner",
    });
    expect(step("landed", { ...base, innerMounted: true, elapsedMs: 10 })).toEqual({ state: "landed", action: "none" });
    expect(step("landed", { ...base, innerMounted: true, layoutShifted: true, elapsedMs: REASSERT_MS + 1 })).toEqual({
      state: "done",
      action: "none",
    });
  });

  it("terminal states stay terminal", () => {
    for (const s of ["cancelled", "exhausted", "done"] as ArrivalState[]) {
      expect(step(s, { ...base, innerMounted: true, layoutShifted: true })).toEqual({ state: s, action: "none" });
    }
  });
});

describe("coverage guard: every home link resolves", () => {
  it("every '/#x' literal in src and every in-page '#x' href in the home sections resolves", () => {
    const misses: string[] = [];
    const homeFiles = new Set(
      [...walk(path.join(SRC_ROOT, "components", "sections")), path.join(SRC_ROOT, "app", "page.tsx")].map(rel),
    );
    for (const file of walk(SRC_ROOT)) {
      const r = rel(file);
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          for (const m of line.matchAll(/["'`]\/#([A-Za-z][\w-]*)["'`]/g)) {
            if (!resolveLandingAddress(`#${m[1]}`)) misses.push(`${r}:${i + 1} /#${m[1]}`);
          }
          if (homeFiles.has(r) && /\bhref\b/.test(line)) {
            for (const m of line.matchAll(/["'`]#([A-Za-z][\w-]*)["'`]/g)) {
              if (!resolveLandingAddress(`#${m[1]}`)) misses.push(`${r}:${i + 1} #${m[1]}`);
            }
          }
        });
    }
    expect(misses).toEqual([]);
  });

  it("guard: ScrollMap delegates to the resolver instead of its own selector", () => {
    const src = read("src/components/ScrollMap.tsx");
    expect(src).toMatch(/resolveLandingAddress/);
    expect(src).not.toMatch(/data-scroll-anchor/);
  });
});

describe("pickWaitlistPlatform", () => {
  const platforms = [
    { key: "windows" as const, label: "Windows" },
    { key: "macos" as const, label: "macOS" },
    { key: "linux" as const, label: "Linux" },
  ];

  it("picks the visitor's own platform instead of platforms[0]", () => {
    expect(pickWaitlistPlatform("macos", platforms)).toBe(platforms[1]);
    expect(pickWaitlistPlatform("windows", platforms)).toBe(platforms[0]);
    expect(pickWaitlistPlatform("linux", platforms)).toBe(platforms[2]);
  });
});
