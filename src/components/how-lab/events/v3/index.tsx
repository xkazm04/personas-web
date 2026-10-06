"use client";

import { useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { useStepper } from "../shared/useStepper";
import ToolMark from "../shared/ToolMark";
import Office from "./Office";
import HandoffLog from "./HandoffLog";
import { ART_AR, DESKS, DESK, FINAL_PHASE, HUB, LEGS, PHASE_MS, SINK, SOURCE, legOfPhase, pct } from "./geometry";

const LABEL = "whitespace-nowrap rounded-full border px-[1.1cqw] py-[0.3cqw] text-[clamp(12px,1.7cqw,24px)] font-semibold backdrop-blur-sm";

/**
 * Events - V3, the pneumatic post. A stylised office: four agent desks, one
 * glass hub in the middle, a tube from every desk into it. A request drops in
 * from Slack; each agent finishes, seals what it made into a capsule, and the
 * hub sends it on to the desk that needs it - until the result leaves for
 * Notion. The log beside it is what the hub saw.
 */
export default function EventsV3() {
  const copy = useTranslation().t.howLab.events;
  const uid = useId();
  const artRef = useRef<HTMLDivElement>(null);
  const { run, still } = useLoopGate(artRef, { rootMargin: "100px" });
  const step = useStepper(run, PHASE_MS);
  const phase = still ? FINAL_PHASE : step;
  const leg = legOfPhase(phase);
  const carrying = leg >= 0 ? copy.v3.capsules[LEGS[leg].carry] : null;

  return (
    <SectionWrapper fit="fill" id="event-bus">
      <SectionIntro heading={copy.heading} gradient={copy.headingGradient} description={copy.description} descriptionMaxWidth="max-w-3xl" />
      <motion.div
        variants={fadeUp}
        data-stage-slot
        className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_clamp(20rem,27vw,42rem)] lg:gap-[3cqw]"
      >
        <div className="relative flex h-full min-h-0 items-center overflow-x-auto stage:overflow-visible stage:[container-type:size]">
          <div
            ref={artRef}
            role="img"
            aria-label={copy.v3.illustration}
            className="relative mx-auto aspect-[45/28] w-full min-w-[36rem] stage:min-w-0 stage:w-[min(100%,calc(100cqh*var(--post-ar)))] [container-type:inline-size]"
            style={{ ["--post-ar" as string]: ART_AR }}
          >
            <Office uid={uid} phase={phase} run={run} />

            {DESKS.map((d) => (
              <span
                key={d.id}
                className={`absolute -translate-x-1/2 ${LABEL} text-foreground`}
                style={{ ...pct(d.x, d.y + DESK.hh + 14), borderColor: BRAND_VAR[d.brand], backgroundColor: `color-mix(in srgb, ${BRAND_VAR[d.brand]} 14%, var(--background))` }}
              >
                {copy.v3.desks[d.id]}
              </span>
            ))}

            {[SOURCE, SINK].map((s, i) => (
              <div key={s.tool} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[0.6cqw]" style={pct(s.x, s.y)}>
                <span className="flex aspect-square w-[7cqw] items-center justify-center rounded-2xl border border-glass-hover bg-surface/80 shadow-lg">
                  <ToolMark id={s.tool} className="h-1/2 w-1/2" />
                </span>
                <span className="whitespace-nowrap text-[clamp(12px,1.5cqw,22px)] font-medium text-foreground/80">{i === 0 ? copy.v3.from : copy.v3.to}</span>
              </div>
            ))}

            <div className="absolute flex -translate-x-1/2 flex-col items-center gap-[0.5cqw]" style={pct(HUB.x, HUB.top - HUB.ry - 74)}>
              <span className="font-mono text-[clamp(12px,1.5cqw,22px)] font-semibold uppercase tracking-[0.16em] text-brand-cyan">{copy.v3.hub}</span>
              <div className="h-[clamp(22px,3.6cqw,44px)]">
                <AnimatePresence mode="wait" initial={false}>
                  {carrying && (
                    <motion.span
                      key={carrying}
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className={`block ${LABEL} border-brand-cyan/50 bg-background/80 text-foreground`}
                    >
                      {carrying}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        <div data-stage-zoom className="min-h-0">
          <HandoffLog phase={phase} run={run} />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
