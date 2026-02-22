"use client";

import dynamic from "next/dynamic";

function SectionSkeleton({ className = "" }: { className?: string }) {
  return (
    <section className={`relative px-6 py-24 md:py-32 ${className}`}>
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-4">
        <div className="h-10 w-2/3 max-w-md rounded-lg bg-white/3 animate-pulse sm:h-12" />
        <div className="h-4 w-1/2 max-w-sm rounded-md bg-white/2 animate-pulse" />
        <div className="mt-8 h-40 w-full max-w-2xl rounded-2xl bg-white/1.5 animate-pulse" />
      </div>
    </section>
  );
}

const UseCasesSection = dynamic(() => import("@/components/sections/UseCases"), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const VisionSection = dynamic(() => import("@/components/sections/Vision"), {
  ssr: false,
  loading: () => <SectionSkeleton className="py-28 md:py-44" />,
});

const RoadmapSection = dynamic(() => import("@/components/sections/Roadmap"), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const PricingSection = dynamic(() => import("@/components/sections/Pricing"), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const FAQSection = dynamic(() => import("@/components/sections/FAQ"), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const DownloadCTASection = dynamic(() => import("@/components/sections/DownloadCTA"), {
  ssr: false,
  loading: () => <SectionSkeleton className="py-28 md:py-44" />,
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

export function LazyDownloadCTA() {
  return <DownloadCTASection />;
}
