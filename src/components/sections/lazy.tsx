"use client";

import { useRef, useState, useEffect, type ComponentType } from "react";
import { motion } from "framer-motion";

export function SectionSkeleton({ className = "" }: { className?: string }) {
  return (
    <section className={`relative px-6 py-32 md:py-40 ${className}`}>
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-4">
        <div className="h-10 w-2/3 max-w-md rounded-lg bg-white/3 animate-pulse sm:h-12" />
        <div className="h-4 w-1/2 max-w-sm rounded-md bg-white/2 animate-pulse" />
        <div className="mt-8 h-40 w-full max-w-2xl rounded-2xl bg-white/1.5 animate-pulse" />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Scroll-proximity lazy loader
// Defers the dynamic import until the placeholder scrolls within `rootMargin`
// of the viewport (default 800px). This keeps chunk fetches off the critical
// path so the Hero section gets all the bandwidth.
// ---------------------------------------------------------------------------

function useScrollProximity(rootMargin = "800px"): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, near]);

  return [ref, near];
}

function LazySection({
  loader,
  fallback,
}: {
  loader: () => Promise<{ default: ComponentType }>;
  fallback: React.ReactNode;
}) {
  const [ref, near] = useScrollProximity();
  const [Component, setComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!near || Component) return;
    let cancelled = false;
    loader().then((mod) => {
      if (!cancelled) setComponent(() => mod.default);
    });
    return () => { cancelled = true; };
  }, [near, Component, loader]);

  if (Component)
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Component />
      </motion.div>
    );

  return <div ref={ref}>{fallback}</div>;
}

// ---------------------------------------------------------------------------
// Stable loader references (defined outside component to avoid re-creation)
// ---------------------------------------------------------------------------

const loadUseCases = () => import("@/components/sections/UseCases");
const loadVision = () => import("@/components/sections/Vision");
const loadPricing = () => import("@/components/sections/Pricing");
const loadFAQ = () => import("@/components/sections/FAQ");
const loadDownloadCTA = () => import("@/components/sections/DownloadCTA");
const loadChangelog = () => import("@/components/sections/Changelog");
const loadAgentPlayground = () => import("@/components/sections/AgentPlayground");
const loadPlaygroundSplit = () => import("@/components/sections/PlaygroundSplit");
const loadPlaygroundTimeline = () => import("@/components/sections/PlaygroundTimeline");
const loadVisionGlobe = () => import("@/components/sections/VisionGlobe");
const loadVisionHoneycomb = () => import("@/components/sections/VisionHoneycomb");

// ---------------------------------------------------------------------------
// Exported lazy wrappers
// ---------------------------------------------------------------------------

export function LazyUseCases() {
  return <LazySection loader={loadUseCases} fallback={<SectionSkeleton />} />;
}

export function LazyVision() {
  return <LazySection loader={loadVision} fallback={<SectionSkeleton />} />;
}

export function LazyPricing() {
  return <LazySection loader={loadPricing} fallback={<SectionSkeleton />} />;
}

export function LazyFAQ() {
  return <LazySection loader={loadFAQ} fallback={<SectionSkeleton />} />;
}

export function LazyDownloadCTA() {
  return <LazySection loader={loadDownloadCTA} fallback={<SectionSkeleton className="py-40 md:py-48" />} />;
}

export function LazyAgentPlayground() {
  return <LazySection loader={loadAgentPlayground} fallback={<SectionSkeleton />} />;
}

export function LazyPlaygroundSplit() {
  return <LazySection loader={loadPlaygroundSplit} fallback={<SectionSkeleton />} />;
}

export function LazyPlaygroundTimeline() {
  return <LazySection loader={loadPlaygroundTimeline} fallback={<SectionSkeleton />} />;
}

export function LazyVisionGlobe() {
  return <LazySection loader={loadVisionGlobe} fallback={<SectionSkeleton />} />;
}

export function LazyVisionHoneycomb() {
  return <LazySection loader={loadVisionHoneycomb} fallback={<SectionSkeleton />} />;
}

export function LazyChangelog() {
  return <LazySection loader={loadChangelog} fallback={<SectionSkeleton className="py-16 md:py-20" />} />;
}
