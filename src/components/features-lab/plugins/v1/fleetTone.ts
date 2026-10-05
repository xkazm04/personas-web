import type { CellState } from "@/components/feature-sections/plugins/dev-tools-grid/athenaFleetData";
import { CELLS } from "@/components/feature-sections/plugins/dev-tools-grid/athenaFleetData";

/** One colour per session state, all theme tokens (the live grid used raw hex). */
export const TONE: Record<CellState, { c: string; pulse: boolean }> = {
  hidden: { c: "var(--foreground)", pulse: false },
  spawning: { c: "var(--brand-cyan)", pulse: true },
  working: { c: "var(--status-info)", pulse: false },
  awaiting: { c: "var(--brand-purple)", pulse: true },
  stale: { c: "var(--brand-amber)", pulse: false },
  resolving: { c: "var(--brand-cyan)", pulse: true },
  done: { c: "var(--brand-emerald)", pulse: false },
};

export const mixC = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

/** How far a session is through its task at a phase tick, 0..1 (drives the cell's progress rail). */
export function progressAt(i: number, phase: number): number {
  const cell = CELLS[i];
  if (phase <= cell.spawnTick) return 0;
  if (phase >= cell.doneAt) return 1;
  return (phase - cell.spawnTick) / (cell.doneAt - cell.spawnTick);
}
