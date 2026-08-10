"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { genFor, scrapBars } from "./data";
import { scrapRect, type FieldLayout } from "./layout";
import { Slot } from "./parts";

/**
 * The working surface — what she is talking from right now.
 *
 * Every scrap here is REWRITTEN in place rather than pushed along a belt, and
 * that is the honest picture: this layer is rebuilt constantly out of the
 * recent conversation, it is plentiful, and it is not the record. A third of
 * the surface turns over on every talking tick, staggered by an authored
 * offset so it churns instead of striping.
 *
 * A scrap is two bar-stacks crossfading against each other, one per
 * generation parity. Nothing mounts or unmounts, so the point a stream leaves
 * from is fixed for the whole loop even while the thing it leaves from is
 * being rewritten under it.
 *
 * Two things never change across the loop, and both are load-bearing: the rate
 * (the surface at the end of the loop churns exactly as fast as at the start —
 * the growth is all downstream) and the count (it never gets fuller).
 */

function Bars({ widths, lit }: { widths: readonly number[]; lit: boolean }) {
  return (
    <span className="flex h-full w-full flex-col justify-center gap-1.5 px-2">
      {widths.map((w, i) => (
        <span
          key={i}
          className="block h-1 rounded-full duration-500 transition-[background-color]"
          style={{ width: `${w}%`, backgroundColor: tint("cyan", lit ? 62 : 38) }}
        />
      ))}
    </span>
  );
}

function Scrap({
  layout,
  i,
  solid,
  gen,
  feeding,
  resting,
  reduced,
}: {
  layout: FieldLayout;
  i: number;
  solid: boolean;
  gen: number;
  /** This scrap is the one a thing on the shelf came from, this beat. */
  feeding: boolean;
  resting: boolean;
  reduced: boolean;
}) {
  const parity = gen % 2;
  return (
    <Slot
      rect={scrapRect(layout, i)}
      solid={solid}
      waiting={false}
      reduced={reduced}
      round="rounded-lg"
      className="overflow-hidden"
      style={{
        borderColor: tint("cyan", feeding ? 62 : resting ? 12 : 24),
        backgroundColor: tint("cyan", feeding ? 12 : resting ? 3 : 6),
        boxShadow: feeding ? brandShadow("cyan", 14, 40) : "none",
      }}
    >
      {[0, 1].map((p) => (
        <motion.span
          key={p}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: p === parity ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.45, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Bars widths={scrapBars(i, p === parity ? gen : gen - 1)} lit={feeding} />
        </motion.span>
      ))}
    </Slot>
  );
}

export default function Working({
  layout,
  stage,
  talkTicks,
  sources,
  resting,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  talkTicks: number;
  /** Which scraps are lit as the source of something landing on the shelf. */
  sources: readonly number[];
  resting: boolean;
  reduced: boolean;
}) {
  const solid = atStage(stage, "body");
  return (
    <>
      {Array.from({ length: layout.scraps }, (_, i) => (
        <Scrap
          key={i}
          layout={layout}
          i={i}
          solid={solid}
          gen={genFor(i, talkTicks)}
          feeding={sources.includes(i)}
          resting={resting}
          reduced={reduced}
        />
      ))}
    </>
  );
}
