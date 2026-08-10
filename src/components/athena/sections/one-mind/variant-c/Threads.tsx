"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { arc, sourcePath, trunk, type FieldLayout } from "./layout";
import { BREATH } from "./parts";

/**
 * Every line in the scene, and the direction they all run.
 *
 * The section's whole motion argument is in the arrows: six threads draw
 * INWARD, from the conversations into her, and exactly one runs back out —
 * her into the conversation you are standing in. A page that has spent four
 * sections fanning work outward arrives, here, somewhere.
 *
 * Threads DRAW rather than appear (`pathLength` 0 -> 1), two per tick, so the
 * eye follows what is being handed over instead of being given a spray. A
 * short bright segment then rides each one home (`pathOffset`) — that is the
 * conversation giving up what it holds. Once the answer is complete the beads
 * stop: the closing section earns its stillness by actually being still.
 *
 * The hairlines are the last thing drawn and the last thing to leave, because
 * they are the section's most load-bearing image: each line of her answer
 * stays physically joined to the conversation it came from, and it is still
 * joined in the final held frame. Nothing she says is unsourced, argued
 * without a single word of copy.
 *
 * The SVG deliberately does NOT lock its aspect ratio: its 100x100 viewBox is
 * the same percent space every card is positioned in, so a thread can never
 * miss what it leaves from. It renders BEHIND the cards, so a thread crossing
 * one simply goes behind it.
 */

const BASE_W = 0.3;
const HAIR_W = 0.16;
const SPARK_W = 0.7;
const DRAW = { duration: 0.8, ease: "easeInOut" } as const;
const RIDE = { duration: 1.6, repeat: Infinity, ease: "easeInOut" } as const;

function Thread({
  d,
  drawn,
  flowing,
  width,
  stroke,
  dim,
  reduced,
}: {
  d: string;
  drawn: boolean;
  flowing: boolean;
  width: number;
  stroke: string;
  dim: number;
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
        style={{ opacity: dim }}
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : DRAW}
      />
      {flowing && !reduced && (
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
  sourced,
  together,
  reduced,
}: {
  layout: FieldLayout;
  cards: ModuleStage[];
  /** Beads are riding home — the beat between the ask and the last line. */
  gathering: boolean;
  trunkDrawn: boolean;
  answering: boolean;
  sourced: boolean;
  together: boolean;
  reduced: boolean;
}) {
  const uid = useId();
  const gathers = useMemo(
    () => layout.cards.map((_, i) => arc(layout.exits[i], layout.her, layout.bows[i])),
    [layout],
  );
  const stem = useMemo(() => trunk(layout), [layout]);
  const hairs = useMemo(() => layout.sources.map((_, i) => sourcePath(layout, i)), [layout]);

  return (
    <motion.svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      initial={false}
      animate={{ opacity: together && !reduced ? [1, 0.72, 1] : 1 }}
      transition={together && !reduced ? BREATH : { duration: 0.4 }}
      aria-hidden="true"
    >
      <defs>
        {/* One field-wide ramp: faintest out at the edges where a conversation
            is still only its own, firmest at the centre where it is hers. */}
        <radialGradient id={`${uid}-ink`} cx="50%" cy={`${layout.her.y}%`} r="62%">
          <stop offset="0%" stopColor={tint("cyan", 66)} />
          <stop offset="100%" stopColor={tint("cyan", 24)} />
        </radialGradient>
      </defs>

      {gathers.map((d, i) => (
        <Thread
          key={`g${i}`}
          d={d}
          drawn={atStage(cards[i], "chosen")}
          flowing={atStage(cards[i], "chosen") && gathering}
          width={BASE_W}
          stroke={`url(#${uid}-ink)`}
          dim={0.85}
          reduced={reduced}
        />
      ))}

      <Thread
        d={stem}
        drawn={trunkDrawn}
        flowing={answering}
        width={BASE_W * 1.5}
        stroke={`url(#${uid}-ink)`}
        dim={1}
        reduced={reduced}
      />

      {hairs.map((d, i) => (
        <Thread
          key={`h${i}`}
          d={d}
          drawn={sourced}
          flowing={false}
          width={HAIR_W}
          stroke={tint("cyan", 48)}
          dim={0.9}
          reduced={reduced}
        />
      ))}
    </motion.svg>
  );
}
