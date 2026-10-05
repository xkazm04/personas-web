import { seeded } from "../shared/motion";

/* V2 "Open any run": three stylised runs, each a trace of steps on its own
 * clock (seconds), and the day's strip of runs they are picked from. Labels are
 * `t.featuresLab.observe.v2.runs[run].steps[key]`; tools are real catalog marks. */

export const W = 1200;
export const H = 600;

export const STRIP = { x0: 176, x1: 1188, y: 34, base: 84, n: 52 } as const;
export const PANEL = { x: 0, y: 116, w: 800, h: 484 } as const;
export const CARD = { x: 826, y: 116, w: 374, h: 484 } as const;
export const HEAD_H = 58;
export const AXIS_Y = PANEL.y + HEAD_H + 16;
export const ROWS_Y = AXIS_Y + 16;
export const LABEL_X = 20;
export const BAR = { x0: 300, x1: 776, h: 22 } as const;

export type Kind = "trigger" | "model" | "tool" | "review" | "memory" | "retry";
export type Status = "ok" | "failed" | "retried" | "approved" | "alert";

export interface Step {
  key: string;
  kind: Kind;
  /** A /public/tools mark, or null for a model call / memory (drawn glyph). */
  tool: string | null;
  at: number;
  dur: number;
  cost: number;
  tokens: number;
  status: Status;
}

export interface Run {
  id: "pr" | "deploy" | "email";
  agent: "prReviewer" | "deployMonitor" | "emailTriage";
  /** Seconds on the run's clock. */
  total: number;
  /** Where the strip shows it. */
  slot: number;
  /** The step a still frame (and the end of a play) settles on. */
  highlight: number;
  steps: Step[];
}

const s = (key: string, kind: Kind, tool: string | null, at: number, dur: number, cost = 0, tokens = 0, status: Status = "ok"): Step => ({ key, kind, tool, at, dur, cost, tokens, status });

export const RUNS: Run[] = [
  {
    id: "pr",
    agent: "prReviewer",
    total: 9.6,
    slot: 14,
    highlight: 4,
    steps: [
      s("opened", "trigger", "github", 0, 0.15),
      s("read", "model", null, 0.2, 2.6, 0.04, 12400),
      s("fetch", "tool", "github", 2.9, 0.7),
      s("write", "model", null, 3.7, 2.1, 0.05, 8100),
      s("post", "tool", "slack", 5.9, 0.5, 0, 0, "failed"),
      s("retry", "retry", "slack", 6.9, 0.4, 0, 0, "retried"),
      s("approve", "review", null, 7.4, 1.8, 0, 0, "approved"),
      s("merge", "tool", "github", 9.25, 0.3, 0.02),
    ],
  },
  {
    id: "deploy",
    agent: "deployMonitor",
    total: 8.6,
    slot: 31,
    highlight: 5,
    steps: [
      s("check", "trigger", null, 0, 0.15),
      s("deploys", "tool", "vercel", 0.2, 0.8),
      s("errors", "tool", "sentry", 1.1, 0.9, 0, 0, "alert"),
      s("diagnose", "model", null, 2.1, 2.4, 0.06, 15200),
      s("commit", "tool", "github", 4.6, 0.6),
      s("rollback", "review", null, 5.3, 1.6, 0, 0, "approved"),
      s("revert", "tool", "vercel", 7.0, 1.2, 0.01),
      s("notify", "tool", "slack", 8.25, 0.3),
    ],
  },
  {
    id: "email",
    agent: "emailTriage",
    total: 3.2,
    slot: 45,
    highlight: 2,
    steps: [
      s("received", "trigger", "gmail", 0, 0.12),
      s("classify", "model", null, 0.15, 1.1, 0.01, 2300),
      s("file", "tool", "google-drive", 1.35, 0.6),
      s("remember", "memory", null, 2.0, 0.3),
      s("notify", "tool", "slack", 2.4, 0.4),
      s("archive", "tool", "gmail", 2.85, 0.25),
    ],
  },
];

export const runCost = (r: Run) => r.steps.reduce((sum, st) => sum + st.cost, 0);

/** The step under the playhead (`t` 0..1 of the run); at rest, the highlight. */
export function stepAt(r: Run, t: number): number {
  if (t >= 1) return r.highlight;
  const sec = t * r.total;
  let idx = 0;
  r.steps.forEach((st, i) => {
    if (st.at <= sec) idx = i;
  });
  return idx;
}

export type Outcome = "ok" | "failed" | "review";
const rnd = seeded(482);
/** The day's runs in the strip: an outcome and a height (duration) each. */
export const STRIP_RUNS: { outcome: Outcome; h: number }[] = Array.from({ length: STRIP.n }, (_, i) => {
  const run = RUNS.find((r) => r.slot === i);
  const roll = rnd();
  const outcome: Outcome = run ? (run.id === "email" ? "ok" : run.id === "pr" ? "failed" : "review") : roll < 0.08 ? "failed" : roll < 0.15 ? "review" : "ok";
  return { outcome, h: run ? 46 : 14 + Math.round(rnd() * 30) };
});

export const stripX = (i: number) => STRIP.x0 + (i + 0.5) * ((STRIP.x1 - STRIP.x0) / STRIP.n);
export const barScale = (r: Run) => (BAR.x1 - BAR.x0) / r.total;
export const rowH = (r: Run) => Math.min(50, (H - 14 - ROWS_Y) / r.steps.length);
