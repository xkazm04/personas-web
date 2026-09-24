/**
 * Data for the hero "contact sheet" illustration: the personas build flow's
 * 3x3 sheet (the sentence in the centre, eight frames that develop into the
 * persona it describes).
 *
 * Shape mirrors the app (read-only reference, not imported):
 * - the eight frames and their order/colours are the app's glyph dimensions
 *   (`features/shared/glyph/dimMeta.ts` + `persona-sigil/dimLabel.ts`), numbered
 *   01..08 clockwise from the top the way `contactSheet/cinema/sheetModel.ts`
 *   places them where their sigil petal points;
 * - the connector nouns are copied from `src/data/connectors.ts` (label, brand
 *   colour, icon file) rather than imported, so the hero chunk does not pull the
 *   whole connector catalogue into the client (see `Hero.tsx`).
 * The values on each frame are an obviously sample persona.
 */

export type FrameKind = "week" | "steps" | "apps" | "message" | "review" | "memory" | "event" | "error";

export interface SheetConnector {
  label: string;
  color: string;
  icon: string;
}

export interface SheetFrame {
  kind: FrameKind;
  /** App dimension label (DIM_LABEL). */
  label: string;
  /** App dimension colour (DIM_META), data-driven. */
  color: string;
  /** [column, row], 1-based grid lines: the cell the frame's petal points at. */
  cell: [number, number];
  /** Clockwise angle from 12 o'clock (PETAL_ANGLES). */
  angle: number;
  caption: string;
}

export const SENTENCE = "Every morning, triage my inbox and draft replies";
export const PERSONA_NAME = "Inbox triage";

export const GMAIL: SheetConnector = { label: "Gmail", color: "#EA4335", icon: "gmail" };
export const GOOGLE_CALENDAR: SheetConnector = { label: "Google Calendar", color: "#4285F4", icon: "google-calendar" };

export const TASK_STEPS = ["Read", "Sort", "Draft"];
export const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export const FRAMES: SheetFrame[] = [
  { kind: "week", label: "When", color: "#fbbf24", cell: [2, 1], angle: 0, caption: "Daily at 08:00" },
  { kind: "steps", label: "What", color: "#a78bfa", cell: [3, 1], angle: 45, caption: "Read, sort, draft" },
  { kind: "apps", label: "Apps", color: "#22d3ee", cell: [3, 2], angle: 90, caption: "Gmail, Calendar" },
  { kind: "message", label: "Messages", color: "#60a5fa", cell: [3, 3], angle: 135, caption: "In-app summary" },
  { kind: "review", label: "Review", color: "#fb7185", cell: [2, 3], angle: 180, caption: "You approve sends" },
  { kind: "memory", label: "Memory", color: "#c084fc", cell: [1, 3], angle: 225, caption: "Learns your tone" },
  { kind: "event", label: "Events", color: "#2dd4bf", cell: [1, 2], angle: 270, caption: "Signals when done" },
  { kind: "error", label: "Errors", color: "#fb923c", cell: [1, 1], angle: 315, caption: "Retry, then tell you" },
];

/** Grid tracks (fr) — the centre column/row is wider so the sentence can breathe. */
export const COLS = [1, 1.4, 1];
export const ROWS = [1, 1.2, 1];

/** Beats: frame i develops once step > i; the persona is named at FULL_STEP. */
export const FULL_STEP = FRAMES.length + 1;

/** `color` at `pct`% over transparent. */
export const mix = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
