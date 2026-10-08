"use client";

import { SectionSkeleton, createLazySection } from "@/components/sections/LazySection";

/**
 * Lazy, code-split, client-only versions of the heavy /features sections. Paired
 * with <LazyMount> in features/page.tsx so each chunk is only fetched + hydrated
 * when scrolled near — avoiding the all-at-once hydration of the previous static
 * imports. DesignEngine stays a static import (above the fold) for LCP + SEO.
 */
export const LazyMemoryLayers = createLazySection(
  () => import("@/components/feature-sections/memory-rings"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyHealingCircuit = createLazySection(
  () => import("@/components/feature-sections/healing-run-circuit"),
  SectionSkeleton,
  { ssr: false },
);

export const LazySecurityVault = createLazySection(
  () => import("@/components/feature-sections/SecurityVault"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyMultiProviderAI = createLazySection(
  () => import("@/components/feature-sections/models-router"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyObservabilityDeck = createLazySection(
  () => import("@/components/feature-sections/observe-record"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyLab = createLazySection(
  () => import("@/components/feature-sections/Lab"),
  SectionSkeleton,
  { ssr: false },
);

export const LazyPlugins = createLazySection(
  () => import("@/components/feature-sections/plugins-bay"),
  SectionSkeleton,
  { ssr: false },
);
