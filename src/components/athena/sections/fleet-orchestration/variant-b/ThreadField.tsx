"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import type { FieldLayout } from "./layout";
import { branchPaths, mergePaths, trunkPath } from "./threads";

/**
 * The branching itself — this variant's whole motion language.
 *
 * Threads DRAW rather than appear (`pathLength` 0 → 1), one per tick, so the
 * eye follows a single hand-off at a time instead of being handed a spray. A
 * short bright segment then rides each live thread (`pathOffset`) — that is
 * the phrase descending into its task on the way out, and the answer coming
 * home on the way back. A finished thread brightens and stays: at the end of
 * the loop the whole structure is lit, which is the argument in one frame.
 *
 * The SVG deliberately does NOT lock its aspect ratio: its 100×100 viewBox is
 * the same percent space every card is positioned in, so a thread can never
 * miss what it feeds. The cost is that stroke width scales with the field
 * (thicker on the vertical runs, thinner on the horizontal ones) — which on a
 * hand-drawn-feeling diagram reads as ink, not as a defect. It renders BEHIND
 * the cards, so a thread that passes under a panel simply goes behind it.
 */

const BASE_W = 0.32;
const SPARK_W = 0.75;
const DRAW = { duration: 0.75, ease: "easeInOut" } as const;
const RIDE = { duration: 1.7, repeat: Infinity, ease: "easeInOut" } as const;

function Thread({
  d,
  drawn,
  live,
  done,
  stroke,
  reduced,
  delay = 0,
}: {
  d: string;
  drawn: boolean;
  live: boolean;
  done: boolean;
  stroke: string;
  reduced: boolean;
  delay?: number;
}) {
  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={BASE_W}
        strokeLinecap="round"
        style={{ opacity: done ? 1 : 0.55 }}
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : { ...DRAW, delay: drawn ? delay : 0 }}
      />
      {live && !reduced && (
        <motion.path
          d={d}
          fill="none"
          stroke={BRAND_VAR.cyan}
          strokeWidth={SPARK_W}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 70)})` }}
          initial={{ pathLength: 0.12, pathOffset: 0, opacity: 0 }}
          animate={{ pathLength: 0.12, pathOffset: [0, 0.88], opacity: [0, 1, 1, 0] }}
          transition={RIDE}
        />
      )}
    </>
  );
}

export default function ThreadField({
  layout,
  tasks,
  result,
  gathered,
  reduced,
}: {
  layout: FieldLayout;
  tasks: ModuleStage[];
  result: ModuleStage;
  gathered: boolean;
  reduced: boolean;
}) {
  const uid = useId();
  const branches = useMemo(() => branchPaths(layout), [layout]);
  const merges = useMemo(() => mergePaths(layout), [layout]);
  const trunk = useMemo(() => trunkPath(layout), [layout]);
  const answered = atStage(result, "chosen");

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* One field-wide vertical ramp: threads read faintest where the work
            is still an idea and firmest where it comes back as an answer. */}
        <linearGradient id={`${uid}-ink`} gradientUnits="userSpaceOnUse" x1="0" y1="18" x2="0" y2="96">
          <stop offset="0%" stopColor={tint("cyan", 26)} />
          <stop offset="100%" stopColor={tint("cyan", 62)} />
        </linearGradient>
      </defs>

      {branches.map((d, i) => (
        <Thread
          key={`b${i}`}
          d={d}
          drawn={atStage(tasks[i], "shell")}
          live={atStage(tasks[i], "shell") && !atStage(tasks[i], "chosen")}
          done={atStage(tasks[i], "chosen")}
          stroke={`url(#${uid}-ink)`}
          reduced={reduced}
        />
      ))}

      {merges.map((d, i) => (
        <Thread
          key={`m${i}`}
          d={d}
          drawn={atStage(tasks[i], "chosen")}
          live={atStage(tasks[i], "chosen") && !answered}
          done={answered}
          stroke={`url(#${uid}-ink)`}
          reduced={reduced}
        />
      ))}

      <Thread
        d={trunk}
        drawn={atStage(result, "shell")}
        live={atStage(result, "shell") && !answered}
        done={answered}
        stroke={`url(#${uid}-ink)`}
        reduced={reduced}
      />

      {/* The node every answer comes back to — it closes once they all have. */}
      <motion.circle
        cx={layout.merge.x}
        cy={layout.merge.y}
        r={0.9}
        fill={BRAND_VAR.cyan}
        initial={false}
        animate={{ opacity: gathered ? 1 : 0, scale: gathered ? 1 : 0.3 }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        style={{
          transformBox: "view-box",
          transformOrigin: `${layout.merge.x}px ${layout.merge.y}px`,
          filter: `drop-shadow(0 0 3px ${tint("cyan", 70)})`,
        }}
      />
    </svg>
  );
}
