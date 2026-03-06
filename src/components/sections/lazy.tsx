"use client";

import dynamic from "next/dynamic";

/* ── Shared pulse block ─────────────────────────────────────────── */

const P = "animate-pulse bg-white/[0.03] rounded-2xl";
const Ps = "animate-pulse bg-white/[0.03] rounded-lg";
const Pm = "animate-pulse bg-white/[0.03] rounded-md";

/* ── UseCases skeleton: heading + 9-button tool grid + detail card ── */
function UseCasesSkeleton() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl flex flex-col items-center">
        {/* Heading */}
        <div className={`h-10 w-2/3 max-w-md sm:h-12 ${Ps}`} />
        <div className={`mt-4 h-4 w-1/2 max-w-sm ${Pm}`} />

        {/* Tool grid — 9 buttons in a row (5-col on md, 9 on lg) */}
        <div className="mt-16 grid grid-cols-5 gap-3 w-full max-w-2xl lg:grid-cols-9 lg:max-w-4xl">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`${P} h-[76px]`} />
          ))}
        </div>

        {/* Detail card */}
        <div className={`mt-8 w-full max-w-3xl h-56 ${P}`} />
      </div>
    </section>
  );
}

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

/* ── Pricing skeleton: heading + 3 side-by-side pricing cards ── */
function PricingSkeleton() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl flex flex-col items-center">
        {/* Heading */}
        <div className={`h-10 w-2/3 max-w-md sm:h-12 ${Ps}`} />
        <div className={`mt-4 h-4 w-1/2 max-w-sm ${Pm}`} />

        {/* Three pricing cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl">
          {[5, 5, 6].map((featureCount, i) => (
            <div key={i} className={`${P} flex flex-col gap-4 p-6 ${i === 1 ? "ring-1 ring-white/[0.06]" : ""}`}>
              {/* Tier name */}
              <div className={`${Pm} h-5 w-16`} />
              {/* Price */}
              <div className={`${Pm} h-10 w-24`} />
              {/* Divider */}
              <div className="h-px w-full bg-white/[0.04]" />
              {/* Best for box */}
              <div className={`${Pm} h-16 w-full`} />
              {/* Feature lines */}
              {Array.from({ length: featureCount }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className={`${Pm} h-4 w-4 !rounded-full shrink-0`} />
                  <div className={`${Pm} h-3 flex-1`} style={{ maxWidth: 140 + j * 20 }} />
                </div>
              ))}
              {/* CTA button */}
              <div className={`${Pm} h-10 w-full !rounded-full mt-4`} />
            </div>
          ))}
        </div>

        {/* Disclaimer bar */}
        <div className={`mt-10 h-12 w-full max-w-5xl ${P}`} />
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

/* ── MidPageCTA skeleton: horizontal button row ── */
function MidPageCTASkeleton() {
  return (
    <section className="relative border-t border-primary/5 py-12">
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-4 px-6">
        <div className={`${Pm} h-12 w-52 !rounded-full`} />
        <div className={`${Pm} h-12 w-28 !rounded-full`} />
        <div className={`${Pm} h-12 w-24 !rounded-full`} />
      </div>
    </section>
  );
}

/* ── DownloadCTA skeleton: badge + heading + step cards + buttons ── */
function DownloadCTASkeleton() {
  return (
    <section className="relative px-6 py-28 md:py-44">
      <div className="mx-auto max-w-2xl flex flex-col items-center">
        {/* Version badge */}
        <div className={`${Pm} h-7 w-44 !rounded-full`} />

        {/* Heading */}
        <div className={`mt-6 h-12 w-3/4 max-w-md ${Ps}`} />

        {/* Subtitle */}
        <div className={`mt-8 h-5 w-2/3 max-w-sm ${Pm}`} />

        {/* 3 step cards */}
        <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xl sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${P} h-14`} />
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mt-10 flex gap-3">
          <div className={`${Pm} h-12 w-52 !rounded-full`} />
          <div className={`${Pm} h-12 w-48 !rounded-full`} />
        </div>

        {/* Platform pills */}
        <div className="mt-8 flex gap-3">
          {[90, 80, 70].map((w, i) => (
            <div key={i} className={`${Pm} h-9 !rounded-full`} style={{ width: w }} />
          ))}
        </div>

        {/* Trust signals */}
        <div className={`mt-8 h-4 w-72 ${Pm}`} />
      </div>
    </section>
  );
}

/* ── Generic fallback for sections without a specific skeleton ── */
function SectionSkeleton() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-4">
        <div className={`h-10 w-2/3 max-w-md sm:h-12 ${Ps}`} />
        <div className={`h-4 w-1/2 max-w-sm ${Pm}`} />
        <div className={`mt-8 h-40 w-full max-w-2xl ${P}`} />
      </div>
    </section>
  );
}

/* ── Dynamic imports with section-specific skeletons ─────────── */

const UseCasesSection = dynamic(() => import("@/components/sections/UseCases"), {
  ssr: false,
  loading: () => <UseCasesSkeleton />,
});

const VisionSection = dynamic(() => import("@/components/sections/Vision"), {
  ssr: false,
  loading: () => <VisionSkeleton />,
});

const RoadmapSection = dynamic(() => import("@/components/sections/Roadmap"), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const PricingSection = dynamic(() => import("@/components/sections/Pricing"), {
  ssr: false,
  loading: () => <PricingSkeleton />,
});

const FAQSection = dynamic(() => import("@/components/sections/FAQ"), {
  ssr: false,
  loading: () => <FAQSkeleton />,
});

const MidPageCTASection = dynamic(() => import("@/components/sections/MidPageCTA"), {
  ssr: false,
  loading: () => <MidPageCTASkeleton />,
});

const DownloadCTASection = dynamic(() => import("@/components/sections/DownloadCTA"), {
  ssr: false,
  loading: () => <DownloadCTASkeleton />,
});

export function LazyUseCases() {
  return <UseCasesSection />;
}

export function LazyVision() {
  return <VisionSection />;
}

export function LazyRoadmap() {
  return <RoadmapSection />;
}

export function LazyPricing() {
  return <PricingSection />;
}

export function LazyFAQ() {
  return <FAQSection />;
}

export function LazyMidPageCTA() {
  return <MidPageCTASection />;
}

export function LazyDownloadCTA() {
  return <DownloadCTASection />;
}
