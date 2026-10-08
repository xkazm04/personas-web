/**
 * The stylized day the /m2 dial tells: which hour each tool shift, Athena moment, agent run and
 * pricing beat sits at. Times only; every word lives in `mobileLanding2Copy` (src/i18n/pending/mobileLanding2.ts).
 */
import { hhmm } from "./geometry";

export const TOOL_IDS = ["gmail", "slack", "github", "drive", "jira", "notion", "stripe"] as const;
export type ToolId = (typeof TOOL_IDS)[number];

/** Each tool's shift on the dial, in hours. */
export const TOOL_HOURS: Record<ToolId, number> = {
  gmail: 9.5,
  slack: 10.75,
  github: 12,
  drive: 13.25,
  jira: 14.5,
  notion: 15.75,
  stripe: 17,
};
export const TOOLS = TOOL_IDS.map((id) => ({ id, hour: TOOL_HOURS[id], time: hhmm(TOOL_HOURS[id]) }));

/**
 * The wash a tool tints its active chip and its card with. It is the tool's own colour, except
 * where that colour is purple (GitHub, Stripe): the owner ruled out purple fills, so those two
 * take their second brand colour.
 */
export const TOOL_WASH: Record<ToolId, string> = {
  gmail: "var(--c-gmail-a)",
  slack: "var(--c-slack-a)",
  github: "var(--c-github-b)",
  drive: "var(--c-drive-a)",
  jira: "var(--c-jira-a)",
  notion: "var(--c-notion-a)",
  stripe: "var(--c-stripe-c)",
};

/** Athena's night: 22:00, 23:30, 02:10, 07:30 (hours run past 24 so the dial keeps turning forward). */
export const MOMENT_HOURS = [22, 23.5, 26 + 10 / 60, 31.5];
export const MOMENT_TIMES = MOMENT_HOURS.map(hhmm);

/** The agent's own runs on the inner ring. */
export const RUN_HOURS = [11 + 20 / 60, 15.75, 26 + 10 / 60, 32];
export const RUN_TIMES = RUN_HOURS.map(hhmm);
/** Bead colour per run (cyan, emerald, purple dot, amber). */
export const RUN_COLORS = ["var(--bead-1)", "var(--bead-2)", "var(--bead-3)", "var(--bead-4)"];

/** Day one: install at 09:00, say what you want at 09:05, connect tools at 09:10. */
export const STEP_TIMES = ["09:00", "09:05", "09:10"];

/** The pricing chapter's four beats, from the morning digest into the next day. */
export const PRICE_HOURS = [32, 35.5, 39, 41];

/** Where a run goes: your computer, Claude Code, Anthropic, at these angles on the band. */
export const NODES = [
  { a: -40, art: "M-13 -10h26v17h-26zM-7 13h14M0 7v6" },
  { a: 0, art: "M-11 -8l8 8-8 8M1 9h11" },
  { a: 40, art: "M-14 9h19a7 7 0 0 0 1.5-13.8A10 10 0 0 0 -13 -3 7 7 0 0 0 -14 9z" },
];

/** Your day around the dial: [id, from hour, to hour]. */
export const DAY_PARTS = [
  ["asleep", -0.85, 6.85],
  ["coffee", 7.05, 8.85],
  ["meet", 9.45, 11.85],
  ["lunch", 12.05, 12.95],
  ["focus", 13.15, 17.4],
  ["home", 17.8, 22.8],
] as const;
export type DayPartId = (typeof DAY_PARTS)[number][0];

/** The three steps the CTA's mini clocks show: 9:00, 9:05, 9:15. */
export const CTA_FACES = [
  { h: 9, m: 0 },
  { h: 9, m: 5 },
  { h: 9, m: 15 },
];

/** The hour the calendar reminder is set for. */
export const REMINDER_HOUR = 9;
export const REMINDER_MINUTES = 15;
