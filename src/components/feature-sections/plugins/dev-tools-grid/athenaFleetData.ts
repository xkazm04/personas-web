/**
 * Data + clock for the "fleet under Athena's watch" visual, mirroring the
 * desktop companion docs (personas/docs/features/companion): the floating
 * Athena orb, fleet-session approvals she can resolve on-policy, and the
 * guided-walkthrough choreography (orb glides to a surface, the surface
 * glows, a caption narrates beside her).
 *
 * One deterministic CYCLE, three acts:
 *   1. spawn   — a 4×4 grid of Claude CLI sessions fills in waves,
 *   2. churn   — sessions change status on their own clocks: three block on
 *                questions, one goes stale,
 *   3. triage  — Athena's orb glides cell to cell and answers every blocker
 *                herself; the whole fleet lands green with zero human
 *                interruptions. Loop.
 */

export const GRID = 4;
export const CYCLE = 24;

export type CellState =
  | "hidden"
  | "spawning"
  | "working"
  | "awaiting"
  | "stale"
  | "resolving"
  | "done";

export interface FleetCellDef {
  name: string;
  /** Spawn wave: 1 → 4 → 16 over the first ticks. */
  spawnTick: number;
  /** Tick the session finishes its task. */
  doneAt: number;
  /** Tick the session blocks (a question, or it goes quiet). */
  needsAt?: number;
  needKind?: "ask" | "stale";
  /** The question the session is blocked on. */
  ask?: string;
}

export const CELLS: FleetCellDef[] = [
  { name: "auth-refactor", spawnTick: 0, doneAt: 15 },
  { name: "flaky-tests", spawnTick: 1, doneAt: 18, needsAt: 5, needKind: "ask", ask: "Quarantine 3 flaky tests?" },
  { name: "i18n-sweep", spawnTick: 1, doneAt: 16 },
  { name: "p99-latency", spawnTick: 1, doneAt: 18 },
  { name: "v0.4-release", spawnTick: 2, doneAt: 20, needsAt: 7, needKind: "stale" },
  { name: "pg-upgrade", spawnTick: 2, doneAt: 17 },
  { name: "api-docs", spawnTick: 2, doneAt: 19 },
  { name: "ui-polish", spawnTick: 2, doneAt: 16 },
  { name: "db-indexes", spawnTick: 2, doneAt: 20 },
  { name: "lint-sweep", spawnTick: 2, doneAt: 18 },
  { name: "sec-audit", spawnTick: 2, doneAt: 19 },
  { name: "a11y-pass", spawnTick: 2, doneAt: 19, needsAt: 6, needKind: "ask", ask: "Apply the focus-ring fix?" },
  { name: "dep-bumps", spawnTick: 2, doneAt: 20 },
  { name: "changelog", spawnTick: 2, doneAt: 17 },
  { name: "perf-budget", spawnTick: 2, doneAt: 21, needsAt: 8, needKind: "ask", ask: "Raise the LCP budget?" },
  { name: "og-images", spawnTick: 2, doneAt: 21 },
];

export interface OrbStop {
  cell: number;
  arrive: number;
  depart: number;
  /** Caption narrated beside the orb while she resolves the cell. */
  caption: string;
}

/** Athena's triage route — attention-order, one blocked cell at a time. */
export const ORB_STOPS: OrbStop[] = [
  { cell: 1, arrive: 9, depart: 11, caption: "✓ approved — quarantine 3" },
  { cell: 11, arrive: 11, depart: 13, caption: "✓ approved — focus-ring fix" },
  { cell: 4, arrive: 13, depart: 15, caption: "⚡ nudged — release resumed" },
  { cell: 14, arrive: 15, depart: 17, caption: "✓ answered — keep 2.5s budget" },
];

const STOP_BY_CELL = new Map(ORB_STOPS.map((s) => [s.cell, s]));

/** Where the orb rests between triage runs — amid the fleet. */
export const DOCK = { x: 50, y: 50 };

/** Center of a grid cell in container percent coordinates. */
export function cellCenter(i: number): { x: number; y: number } {
  const col = i % GRID;
  const row = Math.floor(i / GRID);
  return { x: (col + 0.5) * (100 / GRID), y: (row + 0.5) * (100 / GRID) };
}

/** The cell's state at a phase tick (phase = tick % CYCLE). */
export function stateAt(i: number, phase: number): CellState {
  const cell = CELLS[i];
  if (phase < cell.spawnTick) return "hidden";
  if (phase === cell.spawnTick) return "spawning";
  if (phase >= cell.doneAt) return "done";
  if (cell.needsAt !== undefined && phase >= cell.needsAt) {
    const stop = STOP_BY_CELL.get(i);
    if (!stop || phase < stop.arrive) {
      return cell.needKind === "stale" ? "stale" : "awaiting";
    }
    if (phase < stop.depart) return "resolving";
    // Resolved by Athena → back to working until doneAt.
  }
  return "working";
}

/** Orb position + activity at a phase tick. */
export function orbAt(phase: number): {
  x: number;
  y: number;
  resolving: boolean;
  caption: string | null;
} {
  for (const stop of ORB_STOPS) {
    if (phase >= stop.arrive && phase < stop.depart) {
      return { ...cellCenter(stop.cell), resolving: true, caption: stop.caption };
    }
  }
  return { ...DOCK, resolving: false, caption: null };
}

/** The cell's second line — what it's doing, in one short phrase. */
export function cellStatusText(state: CellState, ask?: string): string {
  switch (state) {
    case "spawning":
      return "spawning…";
    case "awaiting":
      return ask ?? "needs an answer";
    case "stale":
      return "quiet for 4m";
    case "resolving":
      return "Athena responding…";
    case "done":
      return "✓ done";
    default:
      return "working…";
  }
}
