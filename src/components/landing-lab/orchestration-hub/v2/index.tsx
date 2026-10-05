"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useHubPlayback } from "../shared/useHubPlayback";
import HubControls from "../shared/HubControls";
import OrbitStage from "./OrbitStage";
import TitleCard from "./TitleCard";

/**
 * Orchestration hub - V2, the cinematic restaging. The same beats as the live
 * section - ten triggers ringing one agent, the selected one explained,
 * visitor-owned playback (playback.ts) - shot as a scene: the ring is an orbit
 * seen in perspective that swings the active trigger to the front, its signal
 * climbs a shaft of light into the agent floating over the far side, and the
 * trigger's name is set as a title card rather than a panel.
 * Swappable with the live section: same id, heading id, tour anchors and
 * playback controls.
 */
export default function OrchestrationHubV2() {
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
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-[2cqw] stage:h-full"
        >
          <div className="flex flex-col justify-center gap-[4cqh] stage:h-full">
            <TitleCard hub={hub} />
            <HubControls hub={hub} tone={BRAND_VAR[hub.trigger.brand]} />
          </div>
          <OrbitStage hub={hub} />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
