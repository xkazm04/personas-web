"use client";

import { motion } from "framer-motion";
import type { CellState } from "@/components/feature-sections/plugins/dev-tools-grid/athenaFleetData";
import { TONE, mixC } from "./fleetTone";

/**
 * One Claude Code session, drawn as a lit tile: a state-coloured edge, the
 * session name, what it is doing (wraps, never truncates) and a progress rail
 * that fills as the session works - so the fleet's progress IS the picture.
 */
export default function FleetCell({
  name,
  state,
  status,
  progress,
  run,
}: {
  name: string;
  state: CellState;
  status: string;
  progress: number;
  run: boolean;
}) {
  const hidden = state === "hidden";
  const tone = TONE[state];
  const lit = state === "awaiting" || state === "resolving";
  return (
    <div
      className="relative flex min-w-0 flex-col justify-center overflow-hidden rounded-xl border px-3 py-2 transition-[border-color,background,opacity] duration-500"
      style={{
        opacity: hidden ? 0.35 : 1,
        borderStyle: hidden ? "dashed" : "solid",
        borderColor: hidden ? mixC("var(--foreground)", 10) : mixC(tone.c, lit ? 60 : 24),
        background: hidden
          ? "transparent"
          : `linear-gradient(140deg, ${mixC(tone.c, state === "done" ? 16 : 9)}, ${mixC("var(--foreground)", 2)} 70%)`,
        boxShadow: lit ? `0 0 22px ${mixC(tone.c, 30)}, inset 0 1px 0 ${mixC(tone.c, 30)}` : undefined,
      }}
    >
      <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r-full" style={{ background: hidden ? "transparent" : tone.c }} />
      {!hidden && (
        <>
          <span className="flex min-w-0 items-center gap-1.5 font-mono text-[12px] font-semibold leading-tight text-foreground/90">
            <motion.span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: tone.c }}
              animate={tone.pulse && run ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={tone.pulse && run ? { duration: 1.1, repeat: Infinity } : { duration: 0 }}
            />
            {name}
          </span>
          <span className="mt-0.5 text-[12px] leading-snug" style={{ color: `color-mix(in srgb, ${tone.c} 55%, var(--foreground))` }}>
            {status}
          </span>
          <span aria-hidden="true" className="absolute inset-x-3 bottom-1.5 h-[2px] rounded-full" style={{ background: mixC("var(--foreground)", 8) }}>
            <span
              className="block h-full rounded-full transition-[width] duration-[1200ms] ease-linear"
              style={{ width: `${Math.round(progress * 100)}%`, background: tone.c }}
            />
          </span>
        </>
      )}
    </div>
  );
}
