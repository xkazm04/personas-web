"use client";

import { useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { EASE_CURVE } from "@/lib/animations";
import HeroFrame from "./shared/HeroFrame";
import { useHeroClock } from "./shared/useHeroClock";
import { CYCLE, INITIAL_TICK, TICK_MS, beatAt, dotsLit } from "./data";
import { STAGE_H, STAGE_W } from "./geometry";
import Drafting from "./Drafting";
import Demos from "./Demos";
import Orb from "./Orb";
import { CalloutList, Labels, Leaders } from "./Callouts";

/**
 * Athena lab - hero v1, "Presence, evolved".
 *
 * The live hero's idea, kept whole: a schematic of a being. The real avatar is
 * the centrepiece, four blueprint callouts tie one visitor benefit each to the
 * part of her that delivers it, and hovering her makes her acknowledge you.
 *
 * What it adds:
 * - Depth and light: she is drawn on a drafting table (construction lines, a
 *   slowly turning instrument bezel), lit by the page's one key light (rim
 *   light, a light pool on the disc), and a scan sweeps the space round her.
 * - Choreography: the callouts no longer just sit there. A 28s clock lights
 *   one at a time, a bead of light runs down its leader, and the being acts
 *   the promise out at the disc (her voice rings, the task dots fill, drop
 *   brackets snap, arrival rings open). Then a quiet beat - the tagline acted
 *   out. Hover or focus a callout to hold it.
 * - Stage fit: one viewport. Intro at the top, the schematic takes the room
 *   left (a 2.5:1 box sized from the slot's height), CTAs at the base.
 *
 * Reduced motion pins the "talk" beat: callouts drawn, her voice ring at rest
 * length, the poster in place of the clip.
 */
export default function AthenaLabHeroV1() {
  const { t } = useTranslation();
  const uid = useId().replace(/:/g, "");
  const sectionRef = useRef<HTMLElement>(null);
  const { phase, live, reduced } = useHeroClock(sectionRef, { cycle: CYCLE, tickMs: TICK_MS, initial: INITIAL_TICK });
  const [pinned, setPinned] = useState<number | null>(null);

  const active = pinned ?? beatAt(phase);
  const lit = pinned === 1 ? 5 : pinned === null ? dotsLit(phase) : 0;

  return (
    <HeroFrame sectionRef={sectionRef}>
      <div className="relative mx-auto flex w-full flex-col stage:my-auto">
        <motion.div
          role="group"
          aria-label={t.athenaPage.hero.calloutsAria}
          className="relative mx-auto aspect-square w-full max-w-[min(88vmin,560px)] overflow-hidden lg:aspect-[1600/640] lg:max-w-none lg:overflow-visible stage:w-[min(100%,calc(100cqh*2.5))]"
          {...(reduced
            ? {}
            : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1.2, ease: EASE_CURVE } })}
        >
          {/* One stage-space SVG; below lg a 640-wide window shows the orb square.
              maxWidth inline: globals.css caps every svg at 100% unlayered,
              which outranks any Tailwind utility. */}
          <svg
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            overflow="visible"
            className="absolute left-[-75%] top-0 h-full w-[250%] lg:left-0 lg:w-full"
            style={{ maxWidth: "none" }}
            aria-hidden="true"
          >
            <Drafting uid={uid} live={live} />
            <Demos active={active} lit={lit} live={live} />
            <g className="hidden lg:inline">
              <Leaders active={active} live={live} reduced={reduced} />
            </g>
          </svg>
          <Orb reduced={reduced} />
          <Labels active={active} reduced={reduced} onPin={setPinned} />
        </motion.div>
        <CalloutList active={active} reduced={reduced} />
      </div>
    </HeroFrame>
  );
}
