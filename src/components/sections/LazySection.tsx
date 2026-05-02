"use client";

import dynamic from "next/dynamic";
import React from "react";

/* ── Shared pulse block constants for skeletons ─────────────────── */

export const P = "animate-pulse bg-white/[0.03] rounded-2xl";
export const Ps = "animate-pulse bg-white/[0.03] rounded-lg";
export const Pm = "animate-pulse bg-white/[0.03] rounded-md";

/* ── Generic fallback for sections without a specific skeleton ── */
export function SectionSkeleton() {
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

/**
 * Create a lazy-loaded section.
 *
 * SSR decision tree:
 *   - Use ssr: true (default) for sections that:
 *       * Are above the fold or near it (Vision, Pricing, FAQ).
 *       * Render meaningful content for crawlers / first paint.
 *       * Have no browser-only dependencies (window, IntersectionObserver, canvas/SMIL, etc).
 *   - Use ssr: false for sections that:
 *       * Use browser-only APIs (canvas-driven visualizations, framer-motion in-view triggers).
 *       * Mount heavy framer-motion subtrees that bloat first paint.
 *       * Are below the fold AND fully decorative.
 *     Common ssr: false: AgentsTimeline, AgentsChat, PlatformLayers — all far below the fold
 *     with framer-motion entry animations triggered by IntersectionObserver.
 */
export function createLazySection<T = unknown>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  Skeleton: React.ComponentType = SectionSkeleton,
  options: { ssr?: boolean } = {}
) {
  const { ssr = true } = options;
  return dynamic(importFunc, {
    ssr,
    loading: () => <Skeleton />,
  });
}
