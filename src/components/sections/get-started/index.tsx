"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro, BrandCard } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { useAutoCycle } from "@/hooks/useAutoCycle";
import { TOUR_STEPS } from "@/data/tour";
import { AUTO_ADVANCE_MS } from "./data";
import { STEP_VISUALS } from "./visuals";
import StepChip from "./StepChip";
import StepContent from "./StepContent";
import IllustrationSwitcher from "@/components/illustrate/IllustrationSwitcher";
import GetStartedHandoff from "./GetStarted.handoff";
import GetStartedFirstRun from "./GetStarted.first-run";
import GetStartedSetupMap from "./GetStarted.setup-map";

/**
 * GetStarted — the 5-step onboarding section that replaced the old /tour
 * page. Each step has a chip in the selector and its own animated visual
 * on the right side of the content card.
 */

/* /illustrate round 3 prototype: the current section plus three directions,
 * switchable by tab. The current body stays in this file because
 * lib/landing-address.test.ts reads its SectionWrapper label here. */
export default function GetStarted() {
  return (
    <IllustrationSwitcher
      section="get-started"
      props={{}}
      variants={[
        { key: "current", label: "Current", hint: "Five chips + a prose card per step", Component: GetStartedCurrent },
        { key: "handoff", label: "Hand-off", hint: "You set it up once; it runs after", Component: GetStartedHandoff },
        { key: "first-run", label: "First run", hint: "The app's own five-step setup", Component: GetStartedFirstRun },
        { key: "setup-map", label: "Setup map", hint: "What each step puts on your computer", Component: GetStartedSetupMap },
      ]}
    />
  );
}

function GetStartedCurrent() {
  const [hovered, setHovered] = useState(false);
  const { active, setActive, setPaused } = useAutoCycle({
    count: TOUR_STEPS.length,
    intervalMs: AUTO_ADVANCE_MS,
    paused: hovered,
  });

  const step = TOUR_STEPS[active];
  const Visual = STEP_VISUALS[active];

  return (
    // No id: page.tsx's always-present wrapper owns `get-started` (ids are unique
    // per document); `lib/landing-address.ts` finds this section by its label.
    <SectionWrapper fit="min" aria-labelledby="get-started-heading">
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
              brand={step.brand}
              icon={step.icon}
              visual={Visual}
            />
          </AnimatePresence>
        </BrandCard>
      </motion.div>
    </SectionWrapper>
  );
}
