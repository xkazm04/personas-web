"use client";

import { useReducer, useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import type { LabTab } from "./types";
import TabSwitcher from "./components/TabSwitcher";
import ChatTab from "./components/ChatTab";
import ArenaTab from "./components/ArenaTab";
import EvolutionTab from "./components/EvolutionTab";
import EvalTab from "./components/EvalTab";
import VersionRail from "./components/VersionRail";
import { arenaContenders, initialLedger, ledgerReducer } from "./ledger";
import { labSectionCopy } from "@/i18n/pending/labSection";
import VariantStrip, { type LabVariantKey } from "./variants/VariantStrip";
import InstrumentVariant from "./variants/instrument";
import SpecimenVariant from "./variants/specimen";
import BroadcastVariant from "./variants/broadcast";

// TODO(prototype, 2026-10-18): consolidate the Lab variant switcher.
const VARIANT_BODIES = {
  instrument: InstrumentVariant,
  specimen: SpecimenVariant,
  broadcast: BroadcastVariant,
} as const;

export default function Lab() {
  const copy = labSectionCopy;
  const [active, setActive] = useState<LabTab>("chat");
  // One version ledger for the whole section: the rail, the chat's promote
  // answer and the arena's contender labels all project from it. Lazy
  // initializer keeps the first render pure; every dispatch is a click.
  const [ledger, dispatch] = useReducer(ledgerReducer, undefined, initialLedger);
  const [variant, setVariant] = useState<LabVariantKey>("baseline");
  const VariantBody = variant === "baseline" ? null : VARIANT_BODIES[variant];

  return (
    <SectionWrapper fit="fill" id="lab">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <SectionIntro
          heading={copy.heading}
          gradient={copy.headingGradient}
          description={copy.lede}
          descriptionMaxWidth="max-w-2xl stage:max-w-4xl"
          className="mb-0"
        />
      </motion.div>

      {/* Tour anchor wraps the switcher + the active variant so the spotlight
          highlights both the buttons and the diagram together. On the desktop
          stage (styles/stage.css) the slot below the switcher takes the height
          left after the intro, and holds the panel and the rail side by side:
          every tab fills the same box, so switching tabs never moves the page. */}
      <div
        data-tour-diagram="lab"
        data-stage-zoom
        className="stage:flex stage:min-h-0 stage:flex-1 stage:flex-col"
      >
        <VariantStrip active={variant} onSelect={setVariant} />
        <TabSwitcher active={active} onSelect={setActive} />

        <div
          data-stage-slot
          className="stage:mx-auto stage:mt-3 stage:grid stage:w-full stage:max-w-6xl stage:grid-cols-[minmax(0,1fr)_21rem] stage:gap-4"
        >
          <motion.div
            key={`${variant}:${active}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6 mx-auto max-w-4xl stage:m-0 stage:h-full stage:min-h-0 stage:max-w-none"
          >
            {VariantBody && <VariantBody active={active} ledger={ledger} dispatch={dispatch} />}
            {!VariantBody && active === "chat" && (
              <ChatTab
                liveId={ledger.liveId}
                onActivate={(id) => dispatch({ type: "activate", id })}
              />
            )}
            {!VariantBody && active === "arena" && (
              <ArenaTab contenders={arenaContenders(ledger)} liveId={ledger.liveId} />
            )}
            {!VariantBody && active === "evolution" && <EvolutionTab />}
            {!VariantBody && active === "eval" && <EvalTab />}
          </motion.div>

          <div className="mx-auto max-w-4xl stage:m-0 stage:h-full stage:min-h-0 stage:max-w-none">
            <VersionRail ledger={ledger} dispatch={dispatch} />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
