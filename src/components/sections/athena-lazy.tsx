"use client";

import { createLazySection } from "./LazySection";

/*
 * The /athena page's sections, lazily mounted.
 *
 * Every one is `ssr: false` on purpose. Each section is a self-playing scene
 * driven by a deterministic tick clock behind an IntersectionObserver gate,
 * several mount a looping `<video>`, and all of them branch on
 * `prefers-reduced-motion` — browser-only behaviour that would either bloat
 * first paint or hydrate against markup the server could not have produced.
 * They also carry their own full-height stage, so the skeleton below reserves
 * a viewport-sized box rather than the shared `SectionSkeleton`, which would
 * collapse the page height and make the scroll map jump as chunks land.
 */

function SceneSkeleton() {
  return (
    <div className="relative min-h-dvh bg-background" aria-hidden="true">
      <div className="mx-auto flex h-dvh max-w-6xl flex-col items-center justify-center gap-4 px-6">
        <div className="h-12 w-2/3 max-w-md animate-pulse rounded-lg bg-white/[0.03] sm:h-14" />
        <div className="h-5 w-1/2 max-w-sm animate-pulse rounded-md bg-white/[0.03]" />
        <div className="mt-8 h-64 w-full max-w-4xl animate-pulse rounded-2xl bg-white/[0.03]" />
      </div>
    </div>
  );
}

const scene = (importFunc: Parameters<typeof createLazySection>[0]) =>
  createLazySection(importFunc, SceneSkeleton, { ssr: false });

export const LazyAthenaHero = scene(() => import("@/components/athena/hero/variant-a"));

export const LazyOnboardingPartner = scene(
  () => import("@/components/athena/sections/onboarding-partner/variant-a"),
);

export const LazyFleetOrchestration = scene(
  () => import("@/components/athena/sections/fleet-orchestration/variant-b"),
);

export const LazyHerWorkshop = scene(
  () => import("@/components/athena/sections/her-workshop/variant-c"),
);

export const LazyWholePortfolio = scene(
  () => import("@/components/athena/sections/whole-portfolio/variant-a"),
);

export const LazyLastingMemory = scene(
  () => import("@/components/athena/sections/lasting-memory/variant-e"),
);

export const LazyOneMind = scene(
  () => import("@/components/athena/sections/one-mind/variant-c"),
);
