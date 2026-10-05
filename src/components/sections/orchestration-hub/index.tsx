"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { TRIGGERS } from "@/components/sections/orchestration-hub/data";
import { useHubPlayback } from "./shared/useHubPlayback";
import { useDialSteps } from "./shared/useDialSteps";
import HubControls from "./shared/HubControls";
import RingArt from "./RingArt";
import RingNodes from "./RingNodes";
import AgentLens from "./AgentLens";
import DetailPanel from "./DetailPanel";

/**
 * Orchestration hub - V1, the faithful upgrade. Same layout and mechanism as
 * the live section (ring of ten triggers around the agent, the selected
 * trigger's detail beside it, visitor-owned playback from playback.ts), drawn
 * as a lit instrument: a ticked bezel whose marker turns to the active
 * trigger, glass tiles, a comet that carries each signal down its spoke into
 * the agent's lens, and a detail card led by the trigger's own vignette.
 * Swappable with the live section: same id, heading id, tour anchors and
 * playback controls.
 */
export default function OrchestrationHub() {
  const { diagramRef, hub } = useHubPlayback();
  const copy = useTranslation().t.orchestrationSection;
  const tone = BRAND_VAR[hub.trigger.brand];
  const dialSteps = useDialSteps(hub.state.active, TRIGGERS.length);

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
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-[3cqw] stage:h-full"
        >
          <div
            role="group"
            aria-label={copy.ringLabel}
            className="@container relative mx-auto aspect-square w-full max-w-[560px] stage:w-[min(100%,100cqh)] stage:max-w-none"
            {...hub.holdProps}
          >
            <RingArt activeId={hub.trigger.id} dialSteps={dialSteps} live={hub.live} still={hub.still} />
            <AgentLens trigger={hub.trigger} live={hub.live} still={hub.still} />
            <RingNodes activeId={hub.trigger.id} live={hub.live} onSelect={hub.select} />
          </div>
          <div className="flex flex-col gap-[2.2cqh] stage:h-full stage:min-h-0 stage:justify-center">
            <DetailPanel hub={hub} />
            <HubControls hub={hub} tone={tone} className="self-center lg:self-start" />
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
