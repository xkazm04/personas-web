"use client";

import type { ReactNode } from "react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { PLATFORM_CARDS } from "./data";
import { LayerCard } from "./VisionGrid.real-nouns.card";
import { ByomArt, TemplatesArt, VaultArt } from "./VisionGrid.real-nouns.art-catalogue";
import { LabArt, MonitoringArt, OrchestrationArt } from "./VisionGrid.real-nouns.art-runtime";
import {
  GLYPHS,
  MODEL_COUNT,
  PROVIDERS,
  STAGES,
  TEMPLATE_COUNT,
  TEMPLATE_ROWS,
  TOP_AUTH_TYPES,
  TRIGGER_COUNT,
} from "./VisionGrid.real-nouns.data";
import type { Phase } from "./VisionGrid.real-nouns.reveal";

/**
 * /illustrate variant "real-nouns" (data-as-art): the platform's six layers,
 * each card drawn from its real catalogue — connector glyphs, template frames,
 * provider models, pipeline stages, Lab statuses, trigger kinds. Every count on
 * the page is derived; all copy is visible at rest.
 */

const ART: Record<string, { count: string; label: string; Art: (p: { phase: Phase }) => ReactNode }> = {
  "credential-vault": {
    count: `${GLYPHS.length} connectors`,
    label: `${GLYPHS.length} connector glyphs, one per credential the vault can hold. Most common: ${TOP_AUTH_TYPES.map((a) => `${a.type} (${a.count})`).join(", ")}.`,
    Art: VaultArt,
  },
  templates: {
    count: `${TEMPLATE_COUNT} templates`,
    label: `${TEMPLATE_COUNT} template frames in ${TEMPLATE_ROWS.length} categories, largest first.`,
    Art: TemplatesArt,
  },
  byom: {
    count: `${PROVIDERS.length} providers · ${MODEL_COUNT} models`,
    label: "Model picker: Claude through the official CLI as primary, local Ollama as automatic failover.",
    Art: ByomArt,
  },
  monitoring: {
    count: `${STAGES.length} stages`,
    label: `A sample run through the ${STAGES.length} execution stages, from ${STAGES[0].label} to ${STAGES[STAGES.length - 1].label}.`,
    Art: MonitoringArt,
  },
  lab: {
    count: "version × model",
    label: "Lab table for a sample persona: prompt versions against models, each Active, Measured, Unmeasured or Archived.",
    Art: LabArt,
  },
  orchestration: {
    count: `${TRIGGER_COUNT} trigger types`,
    label: `All ${TRIGGER_COUNT} trigger types, grouped as Watch, Listen, Combine and On demand.`,
    Art: OrchestrationArt,
  },
};

export default function VisionGridRealNouns() {
  return (
    <SectionWrapper id="vision-grid" className="relative overflow-hidden">
      <div className="relative z-10 mx-auto mb-14 max-w-3xl text-center">
        <SectionHeading>
          The <GradientText>platform</GradientText> behind your agents
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-muted">
          Six layers sit under every agent. Each card is drawn from what ships: {GLYPHS.length} connectors,{" "}
          {TEMPLATE_COUNT} templates, {STAGES.length} run stages, {TRIGGER_COUNT} trigger types — counted, not
          painted.
        </p>
      </div>

      <div
        role="group"
        aria-label="The six platform layers, each drawn from its real catalogue"
        data-tour-diagram="platform"
        className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PLATFORM_CARDS.map((card, i) => {
          const art = ART[card.id];
          if (!art) return null;
          const { Art } = art;
          return (
            <LayerCard key={card.id} card={card} index={i} count={art.count} artLabel={art.label}>
              {(phase) => <Art phase={phase} />}
            </LayerCard>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
