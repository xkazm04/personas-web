import type { Connector } from "@/data/connectors";

/**
 * Data for the hero's "persona-card" illustration: one sample persona, drawn the
 * way the desktop app's persona card draws it, and its latest run.
 *
 * CONNECTORS are real catalogue entries. Their name/label/color/icon are copied
 * from `src/data/connectors.ts` (keyed by `name`, checked against the `Connector`
 * type) instead of imported, because importing the catalogue from a client
 * component pulls ~1600 lines of prose into the hero's first chunk - the reason
 * `Hero.tsx` reduces it to counts on the server.
 *
 * STAGES are the app's real execution pipeline (`src/lib/execution/pipeline.ts`
 * in the personas app, `PIPELINE_STAGES` + `STAGE_META[...].label`), in order.
 * Durations are SAMPLE values for one plausible run, not measurements.
 */

type TileConnector = Pick<Connector, "name" | "label" | "color" | "icon">;

export const PERSONA = {
  name: "Inbox triage",
  /** What the user typed: the persona's plain-language description. */
  description: "Every weekday at 8, sort my inbox, draft replies, and file bug reports in Linear.",
  trigger: "Every weekday 08:00",
  lastRun: "today 08:00",
  spend: "$0.04",
} as const;

export const CONNECTORS: readonly TileConnector[] = [
  { name: "gmail", label: "Gmail", color: "#EA4335", icon: "gmail" },
  { name: "google_calendar", label: "Google Calendar", color: "#4285F4", icon: "google-calendar" },
  { name: "linear", label: "Linear", color: "#5E6AD2", icon: "linear" },
  { name: "slack", label: "Slack", color: "#4A154B", icon: "slack" },
];

export interface Stage {
  key: string;
  label: string;
  /** The app's `STAGE_META[...].simpleLabel`: what a running execution says. */
  simple: string;
  /** Sample duration of this stage in ms. */
  ms: number;
  /** Animation beat for this stage in ms (how long it is "active" on screen). */
  beat: number;
}

export const STAGES: readonly Stage[] = [
  { key: "initiate", label: "Initiate", simple: "Starting up...", ms: 12, beat: 200 },
  { key: "validate", label: "Validate", simple: "Checking configuration...", ms: 40, beat: 200 },
  { key: "create_record", label: "Create Record", simple: "Preparing workspace...", ms: 18, beat: 200 },
  { key: "spawn_engine", label: "Spawn Engine", simple: "Connecting to AI...", ms: 900, beat: 320 },
  { key: "stream_output", label: "Stream Output", simple: "Processing data...", ms: 38400, beat: 1500 },
  { key: "finalize_status", label: "Finalize Status", simple: "Wrapping up...", ms: 120, beat: 260 },
  { key: "frontend_complete", label: "Frontend Complete", simple: "Done!", ms: 30, beat: 200 },
];

export const TOTAL_MS = STAGES.reduce((sum, s) => sum + s.ms, 0);

/** Waterfall geometry, the way the app's StageBar computes it (min width 0.5%). */
export const BARS = STAGES.map((s, i) => {
  const start = STAGES.slice(0, i).reduce((sum, p) => sum + p.ms, 0);
  return {
    left: (start / TOTAL_MS) * 100,
    width: Math.max((s.ms / TOTAL_MS) * 100, 0.5),
  };
});

export function formatMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export const RESULT = ["3 replies drafted", "1 bug filed", "digest sent to Slack"] as const;

/** Beat before stage 1: the schedule fires. */
export const TRIGGER_BEAT = 500;
/** Step values: 0 = trigger fired, i+1 = stage i active, STAGES.length+1 = done. */
export const DONE_STEP = STAGES.length + 1;
