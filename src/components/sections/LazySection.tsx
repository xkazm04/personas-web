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
 * Shared helper to create a client-side-only lazy section with a skeleton.
 * Standardizes the ssr: false and loading pattern across the app.
 */
export function createLazySection<T>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  Skeleton: React.ComponentType = SectionSkeleton
) {
  return dynamic(importFunc, {
    ssr: false,
    loading: () => <Skeleton />,
  });
}
