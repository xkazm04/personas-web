"use client";

import { useId, useRef, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { EASE_CURVE } from "@/lib/animations";
import HeroFrame from "../shared/HeroFrame";
import { useHeroClock } from "../shared/useHeroClock";
import { CYCLE, INITIAL_TICK, TICK_MS, seenAt, stateAt } from "./data";
import Iris from "./Iris";
import Pupil from "./Pupil";

/**
 * Athena lab - hero v2, "The Watch".
 *
 * An abstract first impression: a vast iris owns the viewport. Its rings are
 * the streams of your day - inbox, calendar, builds, your agents, shared docs
 * - turning at their own paces, with small lights arriving on them all the
 * time. She sees all of it and lets it pass. Every ten seconds one thing
 * matters: it flares amber, the iris narrows on it, a line of light reaches
 * her, and she says one short sentence before you have asked. Then quiet
 * again - the silence is the longer half of every moment.
 *
 * The pupil is a real button (she answers you), and the eye turns toward
 * your pointer: rings shift with depth, inner ones most.
 *
 * Reduced motion pins INITIAL_TICK - mid-sentence, the flare and its line of
 * light held - with no spin, no parallax and no breathing.
 */
export default function AthenaLabHeroV2() {
  const { t } = useTranslation();
  const lab = t.athenaLab.hero;
  const uid = useId().replace(/:/g, "");
  const sectionRef = useRef<HTMLElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const { phase, tick, live, reduced } = useHeroClock(sectionRef, { cycle: CYCLE, tickMs: TICK_MS, initial: INITIAL_TICK });

  const look = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const el = irisRef.current;
    if (!el) return;
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  const status = lab.watch.status
    .replace("{seen}", seenAt(phase).toLocaleString())
    .replace("{spoken}", String(stateAt(phase).spoken));

  return (
    <HeroFrame sectionRef={sectionRef} scrim status={status} onPointerMove={reduced ? undefined : look}>
      <div className="relative h-[62svh] min-h-[22rem] stage:h-full stage:min-h-0">
        <motion.div
          ref={irisRef}
          role="group"
          aria-label={lab.watch.aria}
          className="absolute left-1/2 top-1/2 aspect-square w-[min(118vw,44rem)] -translate-x-1/2 -translate-y-1/2 stage:w-[min(118svh,100vw)]"
          {...(reduced
            ? {}
            : { initial: { opacity: 0, scale: 1.08 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1.6, ease: EASE_CURVE } })}
        >
          <Iris uid={uid} phase={phase} tick={tick} live={live} reduced={reduced} />
          <Pupil phase={phase} live={live} reduced={reduced} />
        </motion.div>
      </div>
    </HeroFrame>
  );
}
