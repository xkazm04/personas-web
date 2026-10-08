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

/* ── Pricing skeleton: heading + lede + one wide illustration + CTA ──
   Mirrors the live section (SectionIntro, the "bill" diagram, the download
   button) so the swap from skeleton to content does not jump. ── */
function PricingSkeleton() {
  return (
    <section data-lazy-placeholder className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl flex flex-col items-center">
        <div className={`h-10 w-1/2 max-w-sm sm:h-12 ${Ps}`} />
        <div className={`mt-4 h-4 w-2/3 max-w-2xl ${Pm}`} />
        <div className={`mt-2 h-4 w-1/2 max-w-xl ${Pm}`} />
        <div className={`mt-8 w-full max-w-[1000px] aspect-[5/2] ${P}`} />
        <div className={`mt-5 h-12 w-48 !rounded-full ${Pm}`} />
      </div>
    </section>
  );
}

/* ── FAQ skeleton: heading + 2-column stacked question bars ── */
function FAQSkeleton() {
  return (
    <section data-lazy-placeholder className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl flex flex-col items-center">
        {/* Heading */}
        <div className={`h-10 w-2/3 max-w-md sm:h-12 ${Ps}`} />
        <div className={`mt-4 h-4 w-1/2 max-w-sm ${Pm}`} />

        {/* Two-column FAQ grid — 3 items per column */}
        <div className="mt-16 grid gap-4 md:grid-cols-2 w-full">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${P} h-16`} />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${P} h-16`} />
            ))}
          </div>
        </div>

        {/* Discord CTA card */}
        <div className={`mt-14 h-20 w-full max-w-lg ${P}`} />
      </div>
    </section>
  );
}

/* ── Lazy section exports ──────────────────────────────────────── */

export const LazyVision = createLazySection(
  () => import("@/components/sections/vision-grid"),
  VisionSkeleton,
);

export const LazyPricing = createLazySection(
  () => import("@/components/sections/pricing"),
  PricingSkeleton,
);

export const LazyFAQ = createLazySection(
  () => import("@/components/sections/FAQ"),
  FAQSkeleton,
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

export const LazyCompanion = createLazySection(
  () => import("@/components/sections/companion"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyTeamCanvas = createLazySection(
  () => import("@/components/sections/team-canvas"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyGetStarted = createLazySection(
  () => import("@/components/sections/get-started"),
  SectionSkeleton,
  { ssr: false },
);
