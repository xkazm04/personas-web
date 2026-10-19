"use client";

import { P, Ps, Pm, SectionSkeleton, createLazySection } from "./LazySection";

/* ── Vision skeleton: tags + heading + terminal dashboard card ── */
function VisionSkeleton() {
  return (
    <section data-lazy-placeholder className="relative px-6 py-20 md:py-24">
      <div className="mx-auto max-w-3xl flex flex-col items-center">
        {/* Pill tags */}
        <div className="flex gap-3">
          {[120, 160, 150].map((w, i) => (
            <div key={i} className={`${Pm} h-8`} style={{ width: w }} />
          ))}
        </div>

        {/* Heading */}
        <div className={`mt-6 h-12 w-3/4 max-w-lg ${Ps}`} />

        {/* Terminal card with 6 agent rows */}
        <div className={`mt-12 w-full max-w-2xl ${P} overflow-hidden`}>
          {/* Terminal header */}
          <div className={`h-12 w-full bg-white/[0.02]`} />
          {/* 6 rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3">
              <div className={`${Pm} h-7 w-7 !rounded-lg shrink-0`} />
              <div className={`${Pm} h-4 flex-1 max-w-[120px]`} />
              <div className={`${Pm} h-3 w-12 ml-auto`} />
            </div>
          ))}
          {/* Footer */}
          <div className={`h-10 w-full bg-white/[0.015]`} />
        </div>
      </div>
    </section>
  );
}

/* ── Lazy section exports ──────────────────────────────────────── */

export const LazyVision = createLazySection(
  () => import("@/components/sections/vision-grid"),
  VisionSkeleton,
);

export const LazyUseCases = createLazySection(
  () => import("@/components/sections/use-cases"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyPlaygroundSplit = createLazySection(
  () => import("@/components/sections/playground-split"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyDownloadCTA = createLazySection(
  () => import("@/components/sections/DownloadCTA"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyOrchestrationHub = createLazySection(
  () => import("@/components/sections/orchestration-hub"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyGetStarted = createLazySection(
  () => import("@/components/sections/get-started"),
  SectionSkeleton,
  { ssr: false },
);
