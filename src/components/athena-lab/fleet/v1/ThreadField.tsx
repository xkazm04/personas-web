"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import type { FieldLayout } from "./layout";
import { branchPaths, intakePath, mergePaths, trunkPath } from "./threads";

/**
 * The branching itself - this scene's whole motion language.
 *
 * Threads DRAW rather than appear (`pathLength` 0 -> 1), one per tick, so the
 * eye follows a single hand-off at a time. A bright packet then rides each
 * live thread: the phrase travelling out to its task, the answer travelling
 * home. A finished thread brightens, gains a soft bloom underneath, and stays,
 * so at the end of the loop the whole structure is lit - the argument in one
 * frame.
 *
 * Evolved from the live section: the viewBox is the scene's own design px, so
 * strokes keep one width at every size (the live 100x100 stretched them), and
 * the ink ramps along the direction of travel, faint where the work is still
 * an idea and firm where it comes back as an answer.
 */

const BASE_W = 1.6;
const SPARK_W = 3.2;
const DRAW = { duration: 0.75, ease: "easeInOut" } as const;
const RIDE = { duration: 1.6, repeat: Infinity, ease: "easeInOut" } as const;

function Thread({
  d,
  drawn,
  live,
  done,
  stroke,
  reduced,
}: {
  d: string;
  drawn: boolean;
  live: boolean;
  done: boolean;
  stroke: string;
  reduced: boolean;
}) {
  return (
    <>
      {/* Bloom - only once the hand-off has landed */}
      <motion.path
        d={d}
        fill="none"
        stroke={tint("cyan", 40)}
        strokeWidth={7}
        strokeLinecap="round"
        style={{ filter: "blur(5px)" }}
        initial={false}
        animate={{ opacity: done ? 0.55 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={BASE_W}
        strokeLinecap="round"
        style={{ opacity: done ? 1 : 0.6 }}
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : DRAW}
      />
      {live && !reduced && (
        <motion.path
          d={d}
          fill="none"
          stroke={BRAND_VAR.cyan}
          strokeWidth={SPARK_W}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${tint("cyan", 80)})` }}
          initial={{ pathLength: 0.1, pathOffset: 0, opacity: 0 }}
          animate={{ pathLength: 0.1, pathOffset: [0, 0.9], opacity: [0, 1, 1, 0] }}
          transition={RIDE}
        />
      )}
    </>
  );
}

export default function ThreadField({
  layout: L,
  request,
  tasks,
  result,
  gathered,
  reduced,
}: {
  layout: FieldLayout;
  request: ModuleStage;
  tasks: ModuleStage[];
  result: ModuleStage;
  gathered: boolean;
  reduced: boolean;
}) {
  const uid = useId();
  const intake = useMemo(() => intakePath(L), [L]);
  const branches = useMemo(() => branchPaths(L), [L]);
  const merges = useMemo(() => mergePaths(L), [L]);
  const trunk = useMemo(() => trunkPath(L), [L]);
  const sent = atStage(request, "chosen");
  const answered = atStage(result, "chosen");
  const ink = `url(#${uid}-ink)`;
  const wide = L.axis === "x";

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox={`0 0 ${L.w} ${L.h}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${uid}-ink`}
          gradientUnits="userSpaceOnUse"
          x1={wide ? L.branch.x : 0}
          y1={wide ? 0 : L.branch.y}
          x2={wide ? L.result.x : 0}
          y2={wide ? 0 : L.result.y}
        >
          <stop offset="0%" stopColor={tint("cyan", 34)} />
          <stop offset="100%" stopColor={tint("cyan", 72)} />
        </linearGradient>
      </defs>

      <Thread d={intake} drawn={sent} live={sent && !atStage(tasks[0], "shell")} done={sent} stroke={ink} reduced={reduced} />

      {branches.map((d, i) => (
        <Thread
          key={`b${i}`}
          d={d}
          drawn={atStage(tasks[i], "shell")}
          live={atStage(tasks[i], "shell") && !atStage(tasks[i], "chosen")}
          done={atStage(tasks[i], "chosen")}
          stroke={ink}
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
          stroke={ink}
          reduced={reduced}
        />
      ))}

      <Thread d={trunk} drawn={atStage(result, "shell")} live={atStage(result, "shell") && !answered} done={answered} stroke={ink} reduced={reduced} />

      {/* The node every answer comes back to - it closes once they all have */}
      <motion.circle
        cx={L.merge.x}
        cy={L.merge.y}
        r={5}
        fill={BRAND_VAR.cyan}
        initial={false}
        animate={{ opacity: gathered ? 1 : 0, scale: gathered ? 1 : 0.3 }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          filter: `drop-shadow(0 0 6px ${tint("cyan", 80)})`,
        }}
      />
    </svg>
  );
}
