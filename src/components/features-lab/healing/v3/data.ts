import { TOOL_ICON, type CaseId } from "../shared/cases";

/* The storyboard: one run ("Morning digest", four steps), followed through
 * four shots by a camera. Each failure breaks a different step. */

export type StepKey = "read" | "summarise" | "save" | "post";

export const STEPS: { key: StepKey; icon?: string }[] = [
  { key: "read", icon: TOOL_ICON.gmail },
  { key: "summarise" },
  { key: "save", icon: TOOL_ICON.notion },
  { key: "post", icon: TOOL_ICON.slack },
];

/** The four failures the storyboard follows, and the step each one breaks. */
export const V3_CASES: readonly CaseId[] = ["rateLimit", "timeout", "overload", "login"];
export const FAILING_STEP: Record<CaseId, number> = { rateLimit: 3, timeout: 2, overload: 1, setup: 2, login: 0 };

/** Panels in reading order: top-left, top-right, bottom-left, bottom-right. */
export const PANEL_POS = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
] as const;

/** Camera beats per failure: overview, then shots 1-4. */
export const BEATS = 5;
const BEAT_MS = [2600, 3200, 3200, 3800, 4000];
export const beatMs = (step: number) => BEAT_MS[step % BEATS];
export const LOOP = V3_CASES.length * BEATS;
export const FOCUS_SCALE = 1.85;
