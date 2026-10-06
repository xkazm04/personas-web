import type { BrandKey } from "@/lib/brand-theme";
import type { AgentId } from "@/components/feature-sections/observability-deck/types";

/* V3 "On the record": geometry (viewBox units), the stylised log the printer
 * prints (one line per run, looping), and the arithmetic of a monotonic clock:
 * which line is printing, how far the paper has advanced, the day's totals. */

export const W = 1200;
export const H = 600;

export const FLEET = { x: 0, w: 250, y0: 76, h: 68, gap: 8 } as const;
/** The paper runs from y 0 to the slot at y = TAPE.h; stamps hang in a margin right of it. */
export const TAPE = { x: 404, w: 366, h: 520, margin: 124 } as const;
export const PRINTER = { x: 370, y: 512, w: 434, h: 88 } as const;
export const STATEMENT = { x: 906, w: 294 } as const;
export const LH = 46;
export const STEP_S = 1.7;
export const PRINT = 0.35; // share of a step the paper spends moving

export const AGENTS: { id: AgentId; brand: BrandKey; baseSpend: number }[] = [
  { id: "prReviewer", brand: "emerald", baseSpend: 3.1 },
  { id: "emailTriage", brand: "cyan", baseSpend: 1.4 },
  { id: "slackDigest", brand: "purple", baseSpend: 0.8 },
  { id: "deployMonitor", brand: "amber", baseSpend: 1.9 },
  { id: "docIndexer", brand: "rose", baseSpend: 2.2 },
  { id: "meetingNotes", brand: "blue", baseSpend: 1.2 },
];

export type Stamp = "failed" | "retried" | "approved" | "needsYou";
export type LineKey =
  | "reviewPr" | "sorted" | "checked" | "digest" | "spike" | "rollback" | "indexed" | "standup"
  | "drafted" | "post" | "repost" | "filed" | "merged" | "synced" | "actions" | "archived";

export interface Line {
  key: LineKey;
  agent: number;
  tool: string;
  cost: number;
  stamp?: Stamp;
}

export const LINES: Line[] = [
  { key: "reviewPr", agent: 0, tool: "github", cost: 0.09 },
  { key: "sorted", agent: 1, tool: "gmail", cost: 0.02 },
  { key: "checked", agent: 3, tool: "vercel", cost: 0.01 },
  { key: "digest", agent: 2, tool: "slack", cost: 0.03 },
  { key: "spike", agent: 3, tool: "sentry", cost: 0.04, stamp: "needsYou" },
  { key: "rollback", agent: 3, tool: "vercel", cost: 0.02, stamp: "approved" },
  { key: "indexed", agent: 4, tool: "notion", cost: 0.06 },
  { key: "standup", agent: 5, tool: "google-calendar", cost: 0.05 },
  { key: "drafted", agent: 1, tool: "gmail", cost: 0.03 },
  { key: "post", agent: 0, tool: "slack", cost: 0, stamp: "failed" },
  { key: "repost", agent: 0, tool: "slack", cost: 0.01, stamp: "retried" },
  { key: "filed", agent: 4, tool: "google-drive", cost: 0.02 },
  { key: "merged", agent: 0, tool: "github", cost: 0.01, stamp: "approved" },
  { key: "synced", agent: 2, tool: "linear", cost: 0.02 },
  { key: "actions", agent: 5, tool: "notion", cost: 0.03 },
  { key: "archived", agent: 1, tool: "gmail", cost: 0.01 },
];

export const N = LINES.length;
/** Rest frame (reduced motion): 13 lines printed, stamps in view. */
export const REST_S = 12.98 * STEP_S;

const easeOut = (v: number) => 1 - (1 - v) ** 3;

/** Paper advance within the current lap, in lines (0..N); lines print in steps. */
export function paperPos(seconds: number): number {
  const raw = seconds / STEP_S;
  const whole = Math.floor(raw);
  const frac = raw - whole;
  return (whole % N) + easeOut(Math.min(1, frac / PRINT));
}

/** Absolute number of lines printed (a line counts once the paper has moved it out). */
export const printed = (seconds: number) => Math.floor(seconds / STEP_S + 1 - PRINT);

/** The step's parts: `whole` = the line printing now, `frac` = progress through the step. */
export function stepOf(seconds: number): { whole: number; frac: number } {
  const raw = seconds / STEP_S;
  const whole = Math.floor(raw);
  return { whole, frac: raw - whole };
}

/** Sum `pick` over the first `count` lines of the endless log. */
export function sumLines(count: number, pick: (l: Line) => number): number {
  const laps = Math.floor(count / N);
  let total = laps * LINES.reduce((s, l) => s + pick(l), 0);
  for (let j = 0; j < count - laps * N; j += 1) total += pick(LINES[j]);
  return total;
}

/** The clock time on line `abs` of the log (09:02 + 6 min a line, stylised). */
export function lineTime(abs: number): string {
  const day = 24 * 60;
  const m = (((9 * 60 + 2 + abs * 6) % day) + day) % day;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export const fleetY = (i: number) => FLEET.y0 + i * (FLEET.h + FLEET.gap);
export const cableEnd = (i: number) => ({ x: PRINTER.x + 2, y: PRINTER.y + 26 + i * 8 });
