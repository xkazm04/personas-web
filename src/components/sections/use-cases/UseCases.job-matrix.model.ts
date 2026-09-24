"use client";

import { useCallback, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { tools } from "./data";

/**
 * Job matrix - shared model. Every number shown is derived from `data.ts`:
 * the tool count and the job count are counted, never typed.
 */

export const TOOL_COUNT = tools.length;
export const JOB_COLS = Math.max(...tools.map((t) => t.useCases.length));
export const JOB_COUNT = tools.reduce((n, t) => n + t.useCases.length, 0);

/** The one persona every row belongs to. A sample identity, drawn in app style. */
export const PERSONA = {
  name: "Chief of staff",
  color: BRAND_VAR.purple,
  bg: tint("purple", 8),
  border: tint("purple", 20),
  strong: tint("purple", 55),
} as const;

/** Beat length of the one-time sweep: the persona's colour runs down the tools. */
export const ROW_BEAT_S = 0.11;

export interface Cell {
  row: number;
  col: number;
}

const noop = () => () => {};

/** False on the server and during hydration, true after: arms client-only motion. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

/**
 * Roving focus over the tools x jobs grid. `active` is the chosen cell (click or
 * keyboard focus); `preview` is a hovered cell. The readout shows the preview
 * when there is one, otherwise the chosen cell.
 */
export function useMatrixNav() {
  const [active, setActive] = useState<Cell>({ row: 0, col: 0 });
  const [preview, setPreview] = useState<Cell | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = useCallback((row: number, col: number) => {
    const r = Math.min(Math.max(row, 0), TOOL_COUNT - 1);
    const maxCol = tools[r].useCases.length - 1;
    const c = Math.min(Math.max(col, 0), maxCol);
    setActive({ row: r, col: c });
    refs.current[r * JOB_COLS + c]?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const { row, col } = active;
      const next: Record<string, [number, number]> = {
        ArrowDown: [row + 1, col],
        ArrowUp: [row - 1, col],
        ArrowRight: [row, col + 1],
        ArrowLeft: [row, col - 1],
        Home: [row, 0],
        End: [row, JOB_COLS - 1],
      };
      const target = next[e.key];
      if (!target) return;
      e.preventDefault();
      move(target[0], target[1]);
    },
    [active, move],
  );

  const register = useCallback((index: number, node: HTMLButtonElement | null) => {
    refs.current[index] = node;
  }, []);

  const shown = preview ?? active;
  const tool = tools[shown.row];
  const job = tool.useCases[shown.col];

  return { active, setActive, preview, setPreview, register, onKeyDown, shown, tool, job };
}
