"use client";

import { motion } from "framer-motion";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { tint } from "@/lib/brand-theme";
import { BLOOM, BREATHES_TO, CORE, HEAT, soft } from "./palette";
import type { Cell } from "./layout";
import LightRim from "./LightRim";
import { DrawCheck, Part } from "./parts";

/**
 * One thing you own, drawn as a light.
 *
 * Everything this section knows about a project it says with light: the colour
 * is how long since anyone looked at it, the brightness is how alive it is, the
 * rim is whether it still has an edge, the sparks are it doing its job, and the
 * dust is the film that settles on something nobody touches. There is no card,
 * no bar and no number on it — those live in the report she opens, and only for
 * the one that needed one.
 *
 * The values are all precomputed in `./palette`; what happens here is that they
 * TWEEN. Colour and luminance ride CSS transitions rather than tick steps, so
 * eight ticks of decay read as one slow slide instead of eight little changes —
 * the whole point being that you cannot feel it happening.
 */
export default function ProjectLight({
  cell,
  name,
  stage,
  health,
  base,
  lead,
  dusty = false,
  lifted = false,
  elapsed,
  resolved = false,
  watching,
  reduced,
}: {
  cell: Cell;
  name: string;
  stage: ModuleStage;
  health: number;
  base: number;
  lead: number;
  /** Only the forgotten one collects a film. */
  dusty?: boolean;
  /** Held out to you: it comes nearer while the rest of the field steps back. */
  lifted?: boolean;
  /** The whisper under the name while it is cooling. */
  elapsed?: string;
  resolved?: boolean;
  watching: boolean;
  reduced: boolean;
}) {
  const lit = atStage(stage, "shell");
  const color = HEAT[health];
  const size = Math.round(base * cell.size);
  const core = Math.round(size * 0.3);
  const tween = reduced ? "" : "duration-700 ease-out";

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${cell.at.x}%`, top: `${cell.at.y}%` }}
    >
      <motion.div
        className="flex flex-col items-center gap-2"
        style={{ width: size }}
        initial={false}
        animate={{ scale: lifted ? 1.16 : 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
      >
        <div
          className="relative shrink-0"
          style={{ width: size, height: size, filter: `blur(${cell.depth * 1.6}px)` }}
          aria-hidden="true"
        >
          {/* The place it will occupy, held from tick 0 so nothing can move */}
          <motion.span
            className="absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: tint("cyan", 16) }}
            initial={false}
            animate={{ opacity: lit ? 0 : 1 }}
            transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : lead }}
          />

          {/* Bloom — most of what you actually read. It breathes while the
              project is cared for, and stops when it is not. */}
          <motion.span
            className={`absolute -inset-[30%] rounded-full blur-2xl transition-[background-color] ${tween}`}
            style={{ backgroundColor: soft(color, BLOOM[health] * (1 - cell.depth * 0.3)) }}
            initial={false}
            animate={
              reduced || !lit || health > BREATHES_TO
                ? { opacity: lit ? 1 : 0, scale: 1 }
                : { opacity: 1, scale: [1, 1.07, 1] }
            }
            transition={
              reduced || health > BREATHES_TO
                ? { duration: reduced ? 0 : 0.6, delay: reduced ? 0 : lead }
                : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
            }
          />

          <LightRim
            color={color}
            health={health}
            lit={lit}
            alive={atStage(stage, "detail")}
            dusty={dusty}
            watching={watching}
            tween={tween}
            reduced={reduced}
          />

          {/* The core. It never goes dark — only quiet. */}
          <span
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background-color,box-shadow,opacity] ${tween}`}
            style={{
              width: core,
              height: core,
              opacity: lit ? 1 : 0,
              backgroundColor: soft(color, CORE[health]),
              boxShadow: `0 0 ${Math.round(size * 0.42)}px ${soft(color, BLOOM[health] + 14)}`,
            }}
          />
        </div>

        <Part
          show={atStage(stage, "body")}
          lead={lead}
          reduced={reduced}
          className="flex flex-col items-center"
        >
          <span className="relative whitespace-nowrap text-base leading-none text-foreground">
            {name}
            {resolved && (
              // Explicit box: an absolutely-placed span pinned at `left-full`
              // has zero available width, and shrink-to-fit then collapses the
              // check to nothing.
              <span className="absolute left-full top-1/2 ml-2 flex h-4 w-4 -translate-y-1/2 text-brand-cyan">
                <DrawCheck reduced={reduced} className="h-4 w-4" />
              </span>
            )}
          </span>
          {elapsed && (
            <motion.span
              key={elapsed}
              className={`mt-1.5 whitespace-nowrap normal-case ${ANNOTATION_DIM}`}
              initial={reduced ? false : { opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
            >
              {elapsed}
            </motion.span>
          )}
        </Part>
      </motion.div>
    </div>
  );
}
