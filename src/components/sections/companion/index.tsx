"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { useAutoCycle } from "@/hooks/useAutoCycle";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { CAPABILITIES, AUTO_CYCLE_MS } from "./data";
import AthenaOrb from "./AthenaOrb";

/**
 * Companion (Athena) — the flagship companion story. An auto-cycling capability
 * list drives the orb's accent and its "speech" line, so the orb literally
 * demonstrates each capability (always-on breathing, hold-to-talk, memory,
 * proactive check-ins). Mirrors the OrchestrationHub auto-cycle pattern.
 */

const TAP_PAUSE_MS = AUTO_CYCLE_MS * 2;

export default function Companion() {
  const { t } = useTranslation();
  const copy = t.companionSection;
  const [hovering, setHovering] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { active, setActive, pauseFor } = useAutoCycle({
    count: CAPABILITIES.length,
    intervalMs: AUTO_CYCLE_MS,
    paused: hovering,
    ref: gridRef,
  });

  const activeCap = CAPABILITIES[active] ?? CAPABILITIES[0];

  return (
    <SectionWrapper fit="fill" id="companion" aria-labelledby="companion-heading">
      <SectionIntro
        id="companion-heading"
        heading={copy.heading}
        gradient={copy.headingGradient}
        trailing={copy.headingTrailing}
        description={copy.description}
      />

      <motion.div
        ref={gridRef}
        variants={fadeUp}
        data-stage-slot
        className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 stage:mt-0 stage:content-center"
      >
        {/* Orb stage */}
        <div
          className="relative"
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
        >
          <AthenaOrb brand={activeCap.brand} />

          {/* Athena's "speech" — a small panel the orb morphs into, changing per capability */}
          <div className="mx-auto mt-4 flex min-h-[3.5rem] max-w-sm items-center justify-center stage:mt-[1.5svh]">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeCap.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 rounded-2xl border border-glass px-4 py-2.5 text-center text-sm text-foreground"
                style={{ backgroundColor: "rgba(var(--surface-overlay), 0.03)" }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: BRAND_VAR[activeCap.brand] }}
                />
                {copy.capabilities[activeCap.id].line}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Capability list */}
        <ul data-stage-zoom className="flex flex-col gap-3 stage:gap-2">
          {CAPABILITIES.map((cap, i) => {
            const isActive = cap.id === activeCap.id;
            const Icon = cap.icon;
            const accent = BRAND_VAR[cap.brand];
            return (
              <li key={cap.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    pauseFor(TAP_PAUSE_MS);
                  }}
                  aria-pressed={isActive}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors stage:gap-3 stage:px-3 stage:py-2.5 ${
                    isActive ? "" : "border-glass"
                  }`}
                  style={{
                    borderColor: isActive ? accent : undefined,
                    backgroundColor: isActive
                      ? "rgba(var(--surface-overlay), 0.04)"
                      : undefined,
                  }}
                >
                  <span
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: tint(cap.brand, 12), color: accent }}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-medium text-foreground">{copy.capabilities[cap.id].label}</span>
                    <span className="mt-1 block text-sm font-light leading-relaxed text-muted">
                      {copy.capabilities[cap.id].blurb}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </SectionWrapper>
  );
}
