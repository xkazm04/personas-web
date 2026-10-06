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
 * They are desktop stages (styles/stage.css: the hero one full screen, every
 * other one stage high), so each skeleton reserves exactly what its section
 * will occupy - and carries the same stage attribute, which makes it a snap
 * point while its chunk loads. The shared `SectionSkeleton` would collapse the
 * page height and make the scroll map jump as chunks land.
 */

function SceneSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div
      className="relative min-h-dvh bg-background stage:min-h-0"
      aria-hidden="true"
      data-stage={hero ? undefined : "fill"}
      data-stage-hero={hero ? "" : undefined}
    >
      <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col stage:h-auto stage:flex-1 items-center justify-center gap-4 px-6">
        <div className="h-12 w-2/3 max-w-md animate-pulse rounded-lg bg-white/[0.03] sm:h-14" />
        <div className="h-5 w-1/2 max-w-sm animate-pulse rounded-md bg-white/[0.03]" />
        <div className="mt-8 h-64 w-full max-w-4xl animate-pulse rounded-2xl bg-white/[0.03]" />
      </div>
    </div>
  );
}

const scene = (importFunc: Parameters<typeof createLazySection>[0]) =>
  createLazySection(importFunc, SceneSkeleton, { ssr: false });

function HeroSkeleton() {
  return <SceneSkeleton hero />;
}

export const LazyAthenaHero = createLazySection(
  () => import("@/components/athena/hero/presence"),
  HeroSkeleton,
  { ssr: false },
);

export const LazyOnboardingPartner = scene(
  () => import("@/components/athena/sections/onboarding-partner/moving-in"),
);

export const LazyFleetOrchestration = scene(
  () => import("@/components/athena/sections/fleet-orchestration/all-at-once"),
);

export const LazyHerWorkshop = scene(
  () => import("@/components/athena/sections/her-workshop/the-line"),
);

export const LazyWholePortfolio = scene(
  () => import("@/components/athena/sections/whole-portfolio/roots"),
);

export const LazyLastingMemory = scene(
  () => import("@/components/athena/sections/lasting-memory/every-night"),
);

export const LazyOneMind = scene(
  () => import("@/components/athena/sections/one-mind/one-face"),
);
