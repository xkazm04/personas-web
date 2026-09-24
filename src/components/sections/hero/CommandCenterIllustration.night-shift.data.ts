import type { BrandKey } from "@/lib/brand-theme";

/**
 * Night shift - data and dial geometry.
 *
 * Four DISCRETE scheduled runs on one 24h dial. Nothing here runs "always": the
 * dial is empty between the four slots, and the copy states where the runs
 * happen (this machine, while the app is open). The app's Schedules surface
 * says the same thing: "Missed runs are recovered automatically on startup".
 *
 * Connector name/label/colour/icon mirror `src/data/connectors.ts`. They are
 * copied, not imported: that catalogue is ~1600 lines of prose and the hero is
 * the first chunk a visitor parses (see the note in `Hero.tsx`).
 */

export interface ShiftConnector {
  name: string;
  label: string;
  color: string;
  icon: string;
}

export const CONNECTORS = {
  stripe: { name: "stripe", label: "Stripe", color: "#635BFF", icon: "stripe" },
  googleDrive: { name: "google_drive", label: "Google Drive", color: "#1FA463", icon: "google-drive" },
  gmail: { name: "gmail", label: "Gmail", color: "#EA4335", icon: "gmail" },
  slack: { name: "slack", label: "Slack", color: "#4A154B", icon: "slack" },
  linear: { name: "linear", label: "Linear", color: "#5E6AD2", icon: "linear" },
} satisfies Record<string, ShiftConnector>;

export interface ShiftRun {
  /** Hour of day, 0-24, fractional minutes. */
  hour: number;
  time: string;
  persona: string;
  brand: BrandKey;
  connectors: ShiftConnector[];
  /** What the run left behind (sample). */
  result: string;
  /** Upcoming runs only: what is waiting. */
  pending?: string;
  /** Real per-trigger "unattended" mode in the app: hold for approval. */
  approval?: boolean;
}

// Ordered as the night plays: 22:00 -> 02:00 -> 06:30 -> (now 07:10) -> 08:00.
export const RUNS: ShiftRun[] = [
  {
    hour: 22,
    time: "22:00",
    persona: "Cost report",
    brand: "amber",
    connectors: [CONNECTORS.stripe],
    result: "Spend summary saved locally",
  },
  {
    hour: 2,
    time: "02:00",
    persona: "Backup digest",
    brand: "blue",
    connectors: [CONNECTORS.googleDrive],
    result: "Backups checked, digest written",
  },
  {
    hour: 6.5,
    time: "06:30",
    persona: "Inbox triage",
    brand: "cyan",
    connectors: [CONNECTORS.gmail],
    result: "Mail sorted, 3 replies drafted",
  },
  {
    hour: 8,
    time: "08:00",
    persona: "Standup notes",
    brand: "purple",
    connectors: [CONNECTORS.slack, CONNECTORS.linear],
    result: "Posted to #standup",
    pending: "Waits for your OK",
    approval: true,
  },
];

/** The night the hand sweeps: you left at 21:30, it is now 07:10. */
export const AWAY_FROM = 21.5;
export const NOW = 7 + 10 / 60;
/** Hours swept, crossing midnight. */
export const SPAN = (NOW + 24 - AWAY_FROM) % 24;

/** Hours elapsed since AWAY_FROM for a run, crossing midnight. */
export const offsetOf = (hour: number) => (hour + 24 - AWAY_FROM) % 24;

/** How many runs the hand has passed after `elapsed` hours of the sweep. */
export function runsPassed(elapsed: number): number {
  return RUNS.filter((r) => offsetOf(r.hour) <= elapsed).length;
}

/** "07:10" from an hour of day, rounded down to 10 minutes. */
export function clockLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  // Round to whole minutes first: 31.1666.. h * 60 lands a hair under 1870.
  const mins = Math.floor(Math.round(h * 60) / 10) * 10;
  return `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

// ── Dial geometry (viewBox units = px at the rendered size) ─────────────────
export const VB = 232;
export const C = VB / 2;
export const R = 84;

export const degOf = (hour: number) => (hour / 24) * 360;

export function polar(r: number, hour: number) {
  const a = (hour / 24) * Math.PI * 2;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
}

/** Clockwise arc on radius r from hour a to hour b (crossing midnight is fine). */
export function arcPath(r: number, a: number, b: number): string {
  const span = (b + 24 - a) % 24;
  const p1 = polar(r, a);
  const p2 = polar(r, b);
  const large = span > 12 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

/** Text anchor for a label placed INSIDE the ring at `hour` (reads toward the centre). */
export function innerAnchor(hour: number): "start" | "middle" | "end" {
  const s = Math.sin((hour / 24) * Math.PI * 2);
  if (s > 0.55) return "end";
  if (s < -0.55) return "start";
  return "middle";
}
