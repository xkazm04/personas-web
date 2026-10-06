"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import AthenaStage from "@/components/athena/stage/AthenaStage";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { SectionIntro } from "@/components/primitives";
import { useTranslation } from "@/i18n/useTranslation";
import { staggerContainer } from "@/lib/animations";
import { AthenaOrb } from "../shared/AthenaOrb";
import TravelLayer from "../shared/TravelLayer";
import { useSceneClock } from "../shared/useSceneClock";
import { CYCLE, STILL_TICK, TICK_MS, stateAt, statusKeyAt } from "./data";
import { Dialogue } from "./Dialogue";
import { Floor } from "./Floor";
import { ART_AR, isoPct } from "./iso";
import { DeskTags, EmptySign, RunCounter, SocketGlyphs } from "./Labels";

/**
 * Athena lab, onboarding v2 — "Moving In".
 *
 * The fear this section answers is the empty product: you install something,
 * open it, and face a blank screen alone. So the scene IS that empty space —
 * an unlit isometric workspace floor with a dashed plot that says "No agents
 * yet" — and the story is the two of you moving in. She arrives and the light
 * comes up; she asks, you answer, and every answer becomes something standing
 * on the floor: the tools you use plugged into sockets on the back wall (the
 * one you leave out stays dark), a desk raised for each job you pick, wired
 * to the tools it needs, and then, on your "go", screens on, work running
 * down the cables and the day's runs counting up.
 *
 * Words: the SectionIntro trio, her short questions and your one-word
 * replies, desk name tags, one counter and one mono status line. The floor is
 * an SVG in a fixed 1440x640 box that grows with the stage slot; labels sit on
 * an HTML layer positioned in percent of that same box, set in rem.
 *
 * Clock: `useSceneClock` (in-view + tab-visible gate, rewind on entry);
 * reduced motion pins STILL_TICK, a finished, busy floor.
 */
export default function OnboardingMovingIn() {
  const { t } = useTranslation();
  const intro = t.athenaPage.onboarding.intro;
  const v = t.athenaLab.onboarding.v2;
  const { sectionRef, phase, reduced, live } = useSceneClock({ cycle: CYCLE, tickMs: TICK_MS, still: STILL_TICK });
  const s = stateAt(phase);
  const orb = isoPct(s.orb);
  const statusKey = statusKeyAt(phase);
  const status =
    statusKey === "empty"
      ? v.statusEmpty
      : statusKey === "running"
        ? v.statusRunning.replace("{n}", String(s.desks.filter(Boolean).length))
        : t.athenaPage.onboarding.status.setup;

  return (
    <AthenaStage>
      <section
        ref={sectionRef}
        data-stage="fill"
        aria-label={t.athenaLab.onboarding.label}
        className="relative flex flex-col px-4 py-14 sm:px-6"
      >
        <div data-stage-inner className="mx-auto flex w-full min-h-0 flex-1 flex-col">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={staggerContainer}>
            <SectionIntro eyebrow={intro.eyebrow} heading={intro.heading} gradient={intro.gradient} className="mb-8" />
          </motion.div>

          <div data-stage-slot>
            <div
              data-stage-art
              role="img"
              aria-label={v.aria}
              className="@container relative -ml-[26%] w-[152%] max-w-none md:mx-auto md:w-full"
              style={{ "--art-ar": ART_AR, aspectRatio: `${ART_AR}` } as CSSProperties}
            >
              <Floor s={s} reduced={reduced} live={live} />
              <div className="absolute inset-0" aria-hidden="true">
                <EmptySign gone={s.desks[0]} reduced={reduced} />
                <SocketGlyphs plugged={s.plugged} reduced={reduced} />
                <div className="hidden md:contents">
                  <DeskTags s={s} reduced={reduced} />
                  <RunCounter s={s} reduced={reduced} />
                </div>
                <TravelLayer
                  x={orb.x}
                  y={orb.y}
                  spring={reduced ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 13, mass: 0.9 }}
                  className="z-20"
                >
                  <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
                    <AthenaOrb
                      busy={live && s.lit && !s.running}
                      reduced={reduced}
                      className="h-[clamp(2.75rem,3.8cqw,4.5rem)] w-[clamp(2.75rem,3.8cqw,4.5rem)]"
                    />
                  </span>
                </TravelLayer>
                <span className={`absolute bottom-[2%] right-[1.5%] hidden whitespace-nowrap md:block ${ANNOTATION_DIM}`}>
                  {status}
                </span>
              </div>
              <div className="absolute bottom-[4%] left-[1%] hidden w-[max(21rem,31cqw)] md:block">
                <Dialogue s={s} reduced={reduced} />
              </div>
            </div>
          </div>
          {/* Below md the art is too small to carry the conversation, so it
              sits under the floor instead of over it */}
          <div className="mt-4 min-h-[6.5rem] md:hidden">
            <Dialogue s={s} reduced={reduced} />
          </div>
        </div>
      </section>
    </AthenaStage>
  );
}
