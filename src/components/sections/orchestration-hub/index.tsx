"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { useAutoCycle } from "@/hooks/useAutoCycle";
import { TRIGGERS, AUTO_CYCLE_MS } from "./data";
import HubRing from "./HubRing";
import TriggerDetail from "./TriggerDetail";

/**
 * Landing section — redesigned from the old single-chain "Pipelines" concept
 * into a radial hub showing how 8 real trigger types all wake Personas.
 * Auto-cycles the active trigger, pausing on hover.
 */

export default function OrchestrationHub() {
  const { active, setActive, setPaused } = useAutoCycle({
    count: TRIGGERS.length,
    intervalMs: AUTO_CYCLE_MS,
  });

  const activeTrigger = TRIGGERS[active];

  const handleSelect = (id: string) => {
    const idx = TRIGGERS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      setActive(idx);
      setPaused(true);
    }
  };

  return (
    <SectionWrapper
      id="orchestration-hub"
      aria-labelledby="orchestration-hub-heading"
    >
      <SectionIntro
        id="orchestration-hub-heading"
        heading="Orchestration"
        gradient="hub"
        description="Eight trigger types, one persona hub. Any signal can wake any agent — pick a trigger to see it fire."
      />

      <motion.div variants={fadeUp} className="mt-12 mx-auto max-w-5xl">
        <div
          className="rounded-3xl border p-6 sm:p-10 overflow-hidden"
          style={{
            borderColor: "rgba(var(--surface-overlay), 0.08)",
            backgroundColor: "rgba(var(--surface-overlay), 0.02)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div
              className="relative mx-auto w-full max-w-[560px] aspect-square"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <HubRing active={activeTrigger.id} onSelect={handleSelect} />
            </div>
            <TriggerDetail activeId={activeTrigger.id} />
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
