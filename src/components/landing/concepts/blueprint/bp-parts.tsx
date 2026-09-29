"use client";

import type { CSSProperties } from "react";
import { useConceptFigure, type FigureApi } from "../useConceptFigure";

/** Blueprint figures have one state, `run`: plotted (on) or blank sheet (off). */
export const BP_RUN = ["run"] as const;
type Run = (typeof BP_RUN)[number];

/** The blank frame is held for a beat before the plot starts, so the reset is never mistaken for the plot. */
const runScript = (api: FigureApi<Run>) => [300, () => api.add("run")];

export function useBpRun() {
  return useConceptFigure<Run>({ all: BP_RUN, script: runScript });
}

/** Inline timing for a plotted stroke (`--ln-d` delay, `--ln-t` duration), in seconds. */
export const at = (delay: number, dur?: number): CSSProperties =>
  ({ "--ln-d": `${delay}s`, ...(dur ? { "--ln-t": `${dur}s` } : {}) }) as CSSProperties;

type Dir = "r" | "l" | "u" | "d";
const HEAD: Record<Dir, string> = {
  r: "l-10-3.6v7.2z",
  l: "l10-3.6v7.2z",
  d: "l-3.6-10h7.2z",
  u: "l-3.6 10h7.2z",
};

/** A solid arrowhead whose tip is at (x, y). It fades in when the stroke it ends has been drawn. */
export function Arrow({ x, y, dir, delay }: { x: number; y: number; dir: Dir; delay: number }) {
  return <path className="ln-bp-k ln-bp-f" style={at(delay)} d={`M${x} ${y}${HEAD[dir]}`} />;
}

/** The mark of Personas as a construction: quadrant fill, circle, stem, tail. Zero-sized, referenced by id. */
export function BpDefs() {
  return (
    <svg className="ln-bpf ln-bp-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="bp-mk" viewBox="16 4 72 106">
          <path d="M58 34V10A24 24 0 0 1 82 34ZM58 34H34A24 24 0 0 0 58 58Z" fill="currentColor" />
          <circle cx="58" cy="34" r="24" fill="none" stroke="currentColor" strokeWidth="5.4" />
          <path d="M34 7.3V94" fill="none" stroke="currentColor" strokeWidth="5.4" />
          <path d="M23.5 104.5L44.5 83.5" fill="none" stroke="currentColor" strokeWidth="4.3" />
        </symbol>
        <pattern id="bp-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="var(--bp-ink)" fillOpacity=".07" />
          <path d="M0 0V7" stroke="var(--bp-ink)" strokeWidth="1.1" strokeOpacity=".6" />
        </pattern>
      </defs>
    </svg>
  );
}

/** Touch-width hint: below 760px the plate scrolls sideways so the drawing keeps a readable size. */
export function BpPan({ text }: { text: string }) {
  return <span className="ln-bp-pan">{text}</span>;
}
