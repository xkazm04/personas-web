"use client";

import { createLazySection, Ps, Pm, P } from "./LazySection";

/*
 * The /how sections are desktop stages (styles/stage.css) and the page snaps
 * one per scroll, so while a chunk loads its skeleton reserves exactly one
 * stage and carries the stage attribute - a snap point from first paint, and
 * nothing below shifts when the section mounts. (The shared section skeleton
 * has a fixed height, which made the page jump as chunks landed.)
 */
function StageSkeleton() {
  return (
    <section data-stage="fill" data-lazy-placeholder className="relative px-6 py-24 md:py-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 stage:flex-1">
        <div className={`h-10 w-2/3 max-w-md sm:h-12 ${Ps}`} />
        <div className={`h-4 w-1/2 max-w-sm ${Pm}`} />
        <div className={`mt-8 h-40 w-full max-w-4xl stage:h-auto stage:flex-1 ${P}`} />
      </div>
    </section>
  );
}

export const LazyEventBusShowcase = createLazySection(
  () => import("@/components/sections/event-hub"),
  StageSkeleton,
  { ssr: false },
);

export const LazyAgentsTimeline = createLazySection(
  () => import("@/components/sections/agents-race"),
  StageSkeleton,
  { ssr: false },
);

export const LazyAgentsChat = createLazySection(
  () => import("@/components/sections/agents-chat-split"),
  StageSkeleton,
  { ssr: false },
);

export const LazyPlatformLayers = createLazySection(
  () => import("@/components/sections/growth-dial"),
  StageSkeleton,
  { ssr: false },
);
