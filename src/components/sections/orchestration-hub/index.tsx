"use client";

import { useState } from "react";
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
 * into a radial hub showing all 10 real trigger types that start Personas.
 * Auto-cycles the active trigger, pausing on hover and briefly on tap/click.
 */

const TAP_PAUSE_MS = AUTO_CYCLE_MS * 2;

export default function OrchestrationHub() {
  const [hovering, setHovering] = useState(false);
  const { active, setActive, pauseFor } = useAutoCycle({
    count: TRIGGERS.length,
    intervalMs: AUTO_CYCLE_MS,
    paused: hovering,
  });

  const activeTrigger = TRIGGERS[active] ?? TRIGGERS[0];

  const handleSelect = (id: string) => {
    const idx = TRIGGERS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      setActive(idx);
      // Pause briefly so the user can read, then auto-resume. Touch devices
      // never fire pointerleave paired with the tap that triggered the
      // selection, so a permanent pause here would freeze the cycle.
      pauseFor(TAP_PAUSE_MS);
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
        description="Ten trigger types, one persona hub. Any signal can wake any agent — or launch one yourself. Pick a trigger to see it fire."
      />

      <motion.div variants={fadeUp} className="mt-12 mx-auto max-w-5xl">
        <div
          className="rounded-3xl border p-6 sm:p-10 overflow-hidden"
          style={{
            borderColor: "var(--border-glass-hover)",
            backgroundColor: "rgba(var(--surface-overlay), 0.02)",
          }}
        >
          {/* data-tour-diagram spans both the ring and the trigger detail
              panel so the tour spotlight frames the description too. */}
          <div
            data-tour-diagram="orchestration"
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center"
          >
            <div
              className="relative mx-auto w-full max-w-[560px] aspect-square"
              onPointerEnter={() => setHovering(true)}
              onPointerLeave={() => setHovering(false)}
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
