import type { CaseId } from "../shared/cases";
import { TOOL_ICON } from "../shared/cases";

/* The run circuit, in a 760 x 400 viewBox: a schedule starts the agent, the
 * agent works through three real tools, and the tools feed the report. */

export const VIEW = { w: 760, h: 400 } as const;

export type NodeId = "schedule" | "agent" | "gmail" | "slack" | "notion" | "report";

export interface ChipNode {
  id: NodeId;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Real connector logo (public/tools), else a drawn glyph. */
  logo?: string;
}

export const NODES: ChipNode[] = [
  { id: "schedule", x: 70, y: 200, w: 104, h: 84 },
  { id: "agent", x: 250, y: 200, w: 128, h: 112 },
  { id: "gmail", x: 470, y: 72, w: 104, h: 84, logo: TOOL_ICON.gmail },
  { id: "slack", x: 470, y: 200, w: 104, h: 84, logo: TOOL_ICON.slack },
  { id: "notion", x: 470, y: 328, w: 104, h: 84, logo: TOOL_ICON.notion },
  { id: "report", x: 670, y: 200, w: 104, h: 84 },
];

/** Product and brand names on the chips: proper nouns, not copy. */
export const BRAND_LABEL = { gmail: "Gmail", slack: "Slack", notion: "Notion", model: "Claude" } as const;

export interface Trace {
  id: string;
  d: string;
}

export const TRACES: Trace[] = [
  { id: "sched", d: "M 122 200 L 186 200" },
  { id: "gmail", d: "M 314 184 L 370 184 L 370 72 L 418 72" },
  { id: "slack", d: "M 314 200 L 418 200" },
  { id: "notion", d: "M 314 216 L 370 216 L 370 328 L 418 328" },
  { id: "out-gmail", d: "M 522 72 L 584 72 L 584 186 L 618 186" },
  { id: "out-slack", d: "M 522 200 L 618 200" },
  { id: "out-notion", d: "M 522 328 L 584 328 L 584 214 L 618 214" },
];

/** The four failures v1 cycles through (the broken-setup case lives in v2). */
export const V1_CASES: readonly CaseId[] = ["rateLimit", "timeout", "overload", "login"];

/** Where each failure breaks the circuit: the trace, the chip it hurts, the break point. */
export const BREAKS: Record<string, { trace: string; node: NodeId; x: number; y: number }> = {
  rateLimit: { trace: "slack", node: "slack", x: 395, y: 200 },
  timeout: { trace: "notion", node: "notion", x: 370, y: 274 },
  overload: { trace: "sched", node: "agent", x: 154, y: 200 },
  login: { trace: "gmail", node: "gmail", x: 370, y: 126 },
};

/** Phases of one failure: running, detect, diagnose, fix, done. */
export const PHASES = 5;
const PHASE_MS = [1500, 1900, 2100, 2700, 3000];
export const stepMs = (step: number) => PHASE_MS[step % PHASES];
export const LOOP = V1_CASES.length * PHASES;
/** Server render and reduced motion: the first failure, healed. */
export const FINAL_STEP = PHASES - 1;
