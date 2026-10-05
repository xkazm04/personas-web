"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { useHubPlayback } from "../shared/useHubPlayback";
import Fan from "./Fan";
import Band from "./Band";

/**
 * Orchestration hub - V3, illustration-led. The ring becomes a sunrise: the
 * ten triggers are rays of coloured glass fanned over the horizon around the
 * agent, who rises as the sun at their centre. The selected ray opens like an
 * iris and shows its own scene - the moment it fires, in the visitor's world -
 * while bands of light run down it into the agent. The words sit below the
 * horizon on either side of the sun. Playback is the live machine
 * (playback.ts); swappable with the live section: same id, heading id, tour
 * anchors and playback controls.
 */
export default function OrchestrationHubV3() {
  const { diagramRef, hub } = useHubPlayback();
  const copy = useTranslation().t.orchestrationSection;

  return (
    <SectionWrapper fit="fill" id="orchestration-hub" aria-labelledby="orchestration-hub-heading">
      <SectionIntro
        id="orchestration-hub-heading"
        heading={copy.heading}
        gradient={copy.headingGradient}
        description={copy.description}
      />
      <motion.div variants={fadeUp} data-stage-slot className="mx-auto mt-10 w-full stage:mt-0">
        <div
          ref={diagramRef}
          data-tour-diagram="orchestration"
          className="flex flex-col gap-[clamp(5rem,13cqh,8rem)] stage:h-full"
        >
          <div className="flex min-h-[18rem] flex-1 items-end justify-center [container-type:size]">
            <Fan hub={hub} />
          </div>
          <Band hub={hub} />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
