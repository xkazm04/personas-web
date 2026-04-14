"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro, BrandCard } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { useAutoCycle } from "@/hooks/useAutoCycle";
import { TOUR_STEPS } from "@/data/tour";
import { STEP_ICONS, STEP_BRAND, AUTO_ADVANCE_MS } from "./data";
import { STEP_VISUALS } from "./visuals";
import StepChip from "./StepChip";
import StepContent from "./StepContent";

/**
 * GetStarted — the 5-step onboarding section that replaced the old /tour
 * page. Each step has a chip in the selector and its own animated visual
 * on the right side of the content card.
 */

export default function GetStarted() {
  const [hovered, setHovered] = useState(false);
  const { active, setActive, setPaused } = useAutoCycle({
    count: TOUR_STEPS.length,
    intervalMs: AUTO_ADVANCE_MS,
    paused: hovered,
  });

  const step = TOUR_STEPS[active];
  const Visual = STEP_VISUALS[active];
  const StepIcon = STEP_ICONS[active];
  const brand = STEP_BRAND[active];

  return (
    <SectionWrapper id="get-started" aria-labelledby="get-started-heading">
      <SectionIntro
        id="get-started-heading"
        heading="From download to"
        gradient="running agents"
        description="Five steps. No cloud signup, no credit card — just your machine and your tools."
      />

      {/* Step chips */}
      <motion.div
        variants={fadeUp}
        className="mt-12 mx-auto max-w-5xl flex flex-wrap justify-center gap-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {TOUR_STEPS.map((s, i) => (
          <StepChip
            key={s.id}
            step={s}
            brand={STEP_BRAND[i]}
            icon={STEP_ICONS[i]}
            isActive={i === active}
            onClick={() => {
              setActive(i);
              setPaused(true);
            }}
          />
        ))}
      </motion.div>

      {/* Step content card */}
      <motion.div variants={fadeUp} className="mt-10 mx-auto max-w-5xl">
        <BrandCard interactive={false} gradientWash={false}>
          <AnimatePresence mode="wait">
            <StepContent
              step={step}
              brand={brand}
              icon={StepIcon}
              visual={Visual}
            />
          </AnimatePresence>
        </BrandCard>
      </motion.div>
    </SectionWrapper>
  );
}
