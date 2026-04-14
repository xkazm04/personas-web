"use client";

import dynamic from "next/dynamic";
import { TerminalPanel } from "@/components/primitives";
import { createLazySection, SectionSkeleton, Ps, Pm } from "./LazySection";

function EventBusShowcaseSkeleton() {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-4">
          <div className={`h-12 w-3/4 max-w-lg ${Ps} sm:h-14 md:h-16`} />
          <div className={`h-5 w-2/3 max-w-xl ${Pm}`} />
          <div className={`h-5 w-1/2 max-w-md ${Pm}`} />
        </div>

        <div className="relative mx-auto mt-16 max-w-3xl">
          <TerminalPanel shadow="hero" bodyClassName="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/4">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-white/6" />
                <div className="h-2 w-2 rounded-full bg-white/6" />
                <div className="h-2 w-2 rounded-full bg-white/6" />
              </div>
              <div className="h-2.5 w-24 rounded bg-white/4 ml-2" />
            </div>

            <div className={`min-h-65 w-full sm:min-h-90 ${Pm}`} />
          </TerminalPanel>

          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-brand-cyan/4 via-transparent to-brand-purple/4 blur-2xl" />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <div className={`h-4 w-24 ${Pm}`} />
          <div className={`h-4 w-28 ${Pm}`} />
          <div className={`h-4 w-32 ${Pm}`} />
        </div>
      </div>
    </section>
  );
}

const EventBusShowcaseSection = createLazySection(() => import("@/components/sections/EventBusShowcase"), EventBusShowcaseSkeleton);

const AgentsTimelineSection = dynamic(() => import("@/components/sections/AgentsTimeline"), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const AgentsChatSection = dynamic(() => import("@/components/sections/AgentsChat"), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const PlatformLayersSection = dynamic(() => import("@/components/sections/PlatformLayers"), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

export function LazyAgentsTimeline() {
  return <AgentsTimelineSection />;
}

export function LazyAgentsChat() {
  return <AgentsChatSection />;
}

export function LazyPlatformLayers() {
  return <PlatformLayersSection />;
}

export function LazyEventBusShowcase() {
  return <EventBusShowcaseSection />;
}
