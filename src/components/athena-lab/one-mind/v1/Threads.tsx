"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { arc, sourcePath, trunk, type FieldLayout } from "./layout";
import { BREATH } from "../shared/parts";

/**
 * Every line in the scene, and the direction they all run: six threads draw
 * INWARD to her, one runs back out into the conversation you are in, and
 * three hairlines join each line of her answer to where she heard it.
 *
 * Threads DRAW (`pathLength`), then a bright bead rides each one home
 * (`pathOffset`) - the conversation handing over what it holds, landing as a
 * light in her ring. Beads ride only while the scene clock runs, and stop for
 * good once the answer is complete: the closing section is actually still.
 *
 * New here: each hairline draws on the SAME beat as the line it belongs to,
 * so the claim and its source arrive as one gesture instead of being joined
 * up afterwards.
 *
 * The 100x100 viewBox is the same percent space every card is placed in
 * (aspect not locked), so a thread can never miss what it leaves from.
 */

const BASE_W = 0.3;
const HAIR_W = 0.22;
const SPARK_W = 0.75;
const DRAW = { duration: 0.8, ease: "easeInOut" } as const;
const RIDE = { duration: 1.6, repeat: Infinity, ease: "easeInOut" } as const;

function Thread({
  d,
  drawn,
  flowing,
  width,
  stroke,
  reduced,
}: {
  d: string;
  drawn: boolean;
  flowing: boolean;
  width: number;
  stroke: string;
  reduced: boolean;
}) {
  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : DRAW}
      />
      {flowing && (
        <motion.path
          d={d}
          fill="none"
          stroke={BRAND_VAR.cyan}
          strokeWidth={SPARK_W}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 70)})` }}
          initial={{ pathLength: 0.11, pathOffset: 0, opacity: 0 }}
          animate={{ pathLength: 0.11, pathOffset: [0, 0.89], opacity: [0, 1, 1, 0] }}
          transition={RIDE}
        />
      )}
    </>
  );
}

export default function Threads({
  layout,
  cards,
  gathering,
  trunkDrawn,
  answering,
  rowsIn,
  together,
  reduced,
  running,
}: {
  layout: FieldLayout;
  cards: ModuleStage[];
  gathering: boolean;
  trunkDrawn: boolean;
  answering: boolean;
  rowsIn: number;
  together: boolean;
  reduced: boolean;
  running: boolean;
}) {
  const uid = useId();
  const gathers = useMemo(
    () => layout.cards.map((_, i) => arc(layout.exits[i], layout.her, layout.bows[i])),
    [layout],
  );
  const stem = useMemo(() => trunk(layout), [layout]);
  const hairs = useMemo(() => layout.sources.map((_, i) => sourcePath(layout, i)), [layout]);
  const breathing = together && running;

  return (
    <motion.svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      initial={false}
      animate={{ opacity: breathing ? [1, 0.72, 1] : 1 }}
      transition={breathing ? BREATH : { duration: 0.4 }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-ink`} cx={`${layout.her.x}%`} cy={`${layout.her.y}%`} r="70%">
          <stop offset="0%" stopColor={tint("cyan", 72)} />
          <stop offset="100%" stopColor={tint("cyan", 22)} />
        </radialGradient>
      </defs>

      {gathers.map((d, i) => (
        <Thread
          key={`g${i}`}
          d={d}
          drawn={atStage(cards[i], "chosen")}
          flowing={atStage(cards[i], "chosen") && gathering && running}
          width={BASE_W}
          stroke={`url(#${uid}-ink)`}
          reduced={reduced}
        />
      ))}

      <Thread
        d={stem}
        drawn={trunkDrawn}
        flowing={answering && running}
        width={BASE_W * 1.6}
        stroke={`url(#${uid}-ink)`}
        reduced={reduced}
      />

      {hairs.map((d, i) => (
        <Thread
          key={`h${i}`}
          d={d}
          drawn={rowsIn > i}
          flowing={false}
          width={HAIR_W}
          stroke={tint("cyan", 62)}
          reduced={reduced}
        />
      ))}
    </motion.svg>
  );
}
