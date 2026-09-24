"use client";

import type { ComponentType } from "react";
import { BookOpen } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { guideHref, openGuideLink } from "@/lib/guide-link";
import { PLATFORM_CARDS, type PlatformCard } from "./data";
import { glass } from "./VisionGrid.real-surfaces.chrome";
import { TEMPLATE_COUNT } from "./VisionGrid.real-surfaces.data";
import { ModelScreen } from "./VisionGrid.real-surfaces.model";
import { TemplatesScreen, VaultScreen } from "./VisionGrid.real-surfaces.screens-a";
import { ArenaScreen, RoutesScreen } from "./VisionGrid.real-surfaces.screens-b";
import { TraceScreen } from "./VisionGrid.real-surfaces.trace";

/**
 * /illustrate "real-surfaces" (product-true): the six layers under every agent,
 * each card carrying a reduced but faithful mini screen of that layer as the
 * desktop app draws it. Every card's text is visible at rest; the only motion
 * is the Monitoring trace playing its run once (see TraceScreen).
 */

const SCREENS: Record<string, ComponentType> = {
  "credential-vault": VaultScreen,
  templates: TemplatesScreen,
  byom: ModelScreen,
  monitoring: TraceScreen,
  lab: ArenaScreen,
  orchestration: RoutesScreen,
};

// data.ts still says "40+" for templates; the count shown here is derived.
function detailText(card: PlatformCard, detail: string): string {
  return card.id === "templates" ? detail.replace(/^\d+\+/, String(TEMPLATE_COUNT)) : detail;
}

function LayerCard({ card, index }: { card: PlatformCard; index: number }) {
  const Screen = SCREENS[card.id];
  const brand = BRAND_VAR[card.brand];
  return (
    <li
      className="flex flex-col rounded-2xl border border-glass p-2 transition-colors duration-300 hover:border-glass-hover"
      style={{ backgroundColor: glass(0.02) }}
    >
      {Screen && <Screen />}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <span
            className="rounded-md border px-1.5 font-mono text-xs leading-5 tabular-nums"
            style={{ color: brand, borderColor: tint(card.brand, 30), backgroundColor: tint(card.brand, 8) }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-lg font-bold tracking-tight text-foreground">{card.title}</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
        <ul className="mt-3 space-y-1">
          {card.details.map((d) => (
            <li key={d} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
              <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: brand }} />
              {detailText(card, d)}
            </li>
          ))}
        </ul>
        {card.guideTopics?.map((g) => (
          <button
            key={g.topic}
            type="button"
            onClick={() => openGuideLink(guideHref(g))}
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-xs font-medium transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:underline"
            style={{ color: brand }}
          >
            <BookOpen aria-hidden className="h-3.5 w-3.5" />
            {g.label}
            <span aria-hidden>→</span>
          </button>
        ))}
      </div>
    </li>
  );
}

export default function VisionGridRealSurfaces() {
  return (
    <SectionWrapper id="vision-grid" className="relative overflow-hidden">
      <div className="relative z-10 mx-auto mb-14 max-w-3xl text-center">
        <SectionHeading>
          The <GradientText>platform</GradientText> behind your agents
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base font-light leading-relaxed text-muted">
          Six layers sit under every agent. Each card shows one the way the desktop app draws it.
        </p>
      </div>

      <ul
        data-tour-diagram="platform"
        aria-label="Six platform layers, each with a reduced screen from the desktop app: Vault credentials, the template gallery, the model picker, an execution trace, a prompt arena and chain routes"
        className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PLATFORM_CARDS.map((card, i) => (
          <LayerCard key={card.id} card={card} index={i} />
        ))}
      </ul>
      <p className="relative z-10 mx-auto mt-6 max-w-2xl text-center text-xs text-muted">
        Screens are the app&apos;s own, reduced. Names and values in them are sample data.
      </p>
    </SectionWrapper>
  );
}
