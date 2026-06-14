"use client";

import { P, Ps, Pm, SectionSkeleton, createLazySection } from "./LazySection";

/* ── Vision skeleton: tags + heading + terminal dashboard card ── */
function VisionSkeleton() {
  return (
    <section className="relative px-6 py-20 md:py-24">
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

/* ── Pricing skeleton: heading + offer banner + 3 feature-group cards ──
   Mirrors the live section (SectionIntro + offer framing + FeatureGroupCard grid)
   so the swap from skeleton to content doesn't jump. ── */
function PricingSkeleton() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl flex flex-col items-center">
        {/* Heading + description */}
        <div className={`h-10 w-2/3 max-w-md sm:h-12 ${Ps}`} />
        <div className={`mt-4 h-4 w-1/2 max-w-sm ${Pm}`} />

        {/* Offer banner */}
        <div className={`mt-10 h-32 w-full max-w-3xl ${P}`} />

        {/* Three feature-group cards (icon + title/tagline + concept lines + link) */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
          {[4, 4, 5].map((conceptCount, i) => (
            <div key={i} className={`${P} flex flex-col gap-4 p-6`}>
              {/* Header: icon square + title/tagline */}
              <div className="flex items-start gap-3">
                <div className={`${Pm} h-12 w-12 !rounded-xl shrink-0`} />
                <div className="flex-1 space-y-2">
                  <div className={`${Pm} h-6 w-3/4`} />
                  <div className={`${Pm} h-3 w-1/2`} />
                </div>
              </div>
              {/* Divider */}
              <div className="h-px w-full bg-white/[0.04]" />
              {/* Concept lines */}
              {Array.from({ length: conceptCount }).map((_, j) => (
                <div key={j} className="flex items-center gap-2.5">
                  <div className={`${Pm} h-4 w-4 !rounded shrink-0`} />
                  <div className={`${Pm} h-3 flex-1`} style={{ maxWidth: 150 + j * 15 }} />
                </div>
              ))}
              {/* Read guide link */}
              <div className={`${Pm} h-4 w-28 mt-1`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ skeleton: heading + 2-column stacked question bars ── */
function FAQSkeleton() {
  return (
    <section className="relative px-6 py-24 md:py-32">
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

export const LazySocialProof = createLazySection(
  () => import("@/components/sections/SocialProof"),
  SectionSkeleton,
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

export const LazyWhyAgents = createLazySection(
  () => import("@/components/sections/why-agents/WhyAgentsSection"),
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

export const LazyChangelog = createLazySection(
  () => import("@/components/sections/Changelog"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyGetStarted = createLazySection(
  () => import("@/components/sections/get-started"),
  SectionSkeleton,
  { ssr: false },
);
