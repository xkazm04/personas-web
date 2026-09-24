import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOOP_DECIDERS, resolveLoop, resolveTicker, loopTransition } from "./loop-gate";

/**
 * Contract for the visualizers' loop gate (src/lib/motion/loop-gate.ts +
 * src/hooks/useLoopGate.ts).
 *
 * The pure half pins the merge: a closed decider list, a disjunction of vetoes,
 * and the partial-merge fallback (in-view abstains when nothing has answered).
 * The source-scan half pins adoption: the three visualizer section directories
 * may not re-derive a pause rule of their own - no framer `useReducedMotion`,
 * no bare `repeat: Infinity`, no private IntersectionObserver, and no SMIL loop
 * without a pause call. A new raw gate there turns this suite red.
 */

const running = { stillPreferred: false, tabHidden: false, inView: true } as const;

describe("resolveLoop - one merged verdict over a closed decider list", () => {
  it("the decider list is closed and written down", () => {
    expect(LOOP_DECIDERS).toEqual(["preference", "foreground", "in-view", "user"]);
  });

  it("runs when no decider objects", () => {
    expect(resolveLoop(running)).toEqual({ run: true, vetoedBy: [] });
  });

  it("preference vetoes", () => {
    expect(resolveLoop({ ...running, stillPreferred: true })).toEqual({
      run: false,
      vetoedBy: ["preference"],
    });
  });

  it("foreground vetoes a hidden tab", () => {
    expect(resolveLoop({ ...running, tabHidden: true })).toEqual({
      run: false,
      vetoedBy: ["foreground"],
    });
  });

  it("in-view vetoes a scrolled-past surface", () => {
    expect(resolveLoop({ ...running, inView: false })).toEqual({
      run: false,
      vetoedBy: ["in-view"],
    });
  });

  it("partial merge: in-view abstains when no observer has answered", () => {
    expect(resolveLoop({ ...running, inView: null })).toEqual({ run: true, vetoedBy: [] });
  });

  it("the user's stop is a decider like the others", () => {
    const verdict = resolveLoop({ ...running, userStopped: true });
    expect(verdict.run).toBe(false);
    expect(verdict.vetoedBy).toContain("user");
  });

  it("reports every objecting decider, in list order", () => {
    expect(
      resolveLoop({ stillPreferred: true, tabHidden: true, inView: false, userStopped: true }),
    ).toEqual({ run: false, vetoedBy: ["preference", "foreground", "in-view", "user"] });
  });

  it("guard: the Lanes delivery dot still stops off-screen", () => {
    expect(resolveLoop({ stillPreferred: false, tabHidden: false, inView: false }).run).toBe(false);
  });
});

describe("resolveTicker - data feeds: preference abstains", () => {
  it("a reduced-motion visitor still gets live numbers", () => {
    expect(resolveTicker({ ...running, stillPreferred: true }).run).toBe(true);
  });

  it("a hidden tab stops the feed even while in view", () => {
    expect(resolveTicker({ ...running, tabHidden: true })).toEqual({
      run: false,
      vetoedBy: ["foreground"],
    });
  });

  it("off-screen stops the feed", () => {
    expect(resolveTicker({ ...running, inView: false }).run).toBe(false);
  });
});

describe("loopTransition - the only place an infinite repeat is written", () => {
  it("a stopped loop settles to rest instead of repeating", () => {
    const t = loopTransition(false, { duration: 2 });
    expect(t.repeat).not.toBe(Infinity);
    expect(t.duration).toBe(0);
  });

  it("a running loop repeats forever and keeps its spec", () => {
    const t = loopTransition(true, { duration: 2, ease: "linear", repeatDelay: 0.5 });
    expect(t).toEqual({ duration: 2, ease: "linear", repeatDelay: 0.5, repeat: Infinity });
  });
});

// ── Source scans ───────────────────────────────────────────────────────────

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..", "..");
const SECTION_DIRS = ["orchestration-hub", "event-bus-showcase", "platform-layers"].map((d) =>
  path.join(REPO_ROOT, "src", "components", "sections", d),
);
const HOOK_FILE = path.join(REPO_ROOT, "src", "hooks", "useLoopGate.ts");

/** Blank out comments so prose about the rule is not mistaken for code. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, lead: string) => lead);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

function scan(pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const file of SECTION_DIRS.flatMap((d) => walk(d))) {
    const rel = path.relative(REPO_ROOT, file).replaceAll("\\", "/");
    stripComments(readFileSync(file, "utf8"))
      .split("\n")
      .forEach((line, i) => {
        if (pattern.test(line)) hits.push(`${rel}:${i + 1}`);
      });
  }
  return hits;
}

function readStripped(file: string): string {
  return stripComments(readFileSync(file, "utf8"));
}

describe("adoption - the visualizer sections read the gate, not the raw inputs", () => {
  it("no framer useReducedMotion (SSR-unsafe, not live) in the three section dirs", () => {
    expect(scan(/\buseReducedMotion\b/)).toEqual([]);
  });

  it("no bare `repeat: Infinity` outside loop-gate.ts", () => {
    expect(scan(/repeat\s*:[^,}\n]*\bInfinity\b/)).toEqual([]);
  });

  it("no private IntersectionObserver in the three section dirs", () => {
    expect(scan(/\bIntersectionObserver\b/)).toEqual([]);
  });

  it("every SMIL loop file pauses its timeline on the gate's verdict", () => {
    const smil = SECTION_DIRS.flatMap((d) => walk(d)).filter((f) =>
      /repeatCount\s*=\s*["']indefinite["']/.test(readStripped(f)),
    );
    expect(smil.length).toBeGreaterThan(0);
    // Either pauses directly, or hands its loop-gate `run` to useSvgTimelineGate.
    const unpaused = smil
      .filter((f) => {
        const src = readStripped(f);
        return !/\.pauseAnimations\s*\(/.test(src) && !/useSvgTimelineGate\s*\(\s*\w+\s*,\s*run\s*\)/.test(src);
      })
      .map((f) => path.relative(REPO_ROOT, f).replaceAll("\\", "/"));
    expect(unpaused).toEqual([]);
    // ...and the helper really does both halves.
    const hook = readStripped(HOOK_FILE);
    expect(hook).toMatch(/\.pauseAnimations\s*\(\s*\)/);
    expect(hook).toMatch(/\.unpauseAnimations\s*\(\s*\)/);
  });

  it("useLoopGate composes the live primitives instead of observing on its own", () => {
    const hook = readStripped(HOOK_FILE);
    expect(hook).toMatch(/import\s*\{[^}]*\buseIsVisible\b[^}]*\}\s*from\s*["']\.\/useIsVisible["']/);
    expect(hook).toMatch(/import\s*\{[^}]*\buseStillMotion\b[^}]*\}\s*from\s*["']\.\/useStillMotion["']/);
    expect(hook).not.toMatch(/\bIntersectionObserver\b/);
  });

  it("guard: HubRing gates props, not elements, on the motion preference", () => {
    const ring = readStripped(
      path.join(REPO_ROOT, "src", "components", "sections", "orchestration-hub", "HubRing.tsx"),
    );
    expect(ring).not.toMatch(/\breduced\s*\?\s*\(/);
    expect(ring).not.toMatch(/!\s*reduced\s*&&/);
  });
});
