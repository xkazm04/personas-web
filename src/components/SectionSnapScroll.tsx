"use client";

import { useEffect, useRef } from "react";

/**
 * Snap-assist scroll: lets the browser handle scrolling naturally,
 * then gently snaps to the nearest section when the user stops.
 *
 * Key differences from the old approach:
 * - Never calls preventDefault() — native scroll is always active
 * - Uses scroll-idle detection instead of debounced wheel hijacking
 * - Snap is a gentle nudge, not a forced teleport
 * - User can always override the snap by continuing to scroll
 */

const IDLE_MS = 250; // ms of no scrolling before snap triggers
const SNAP_ZONE = 0.15; // fraction of viewport — only snap if within this distance of a boundary
const NAVBAR_OFFSET = 88;

export default function SectionSnapScroll() {
  const idleTimerRef = useRef<number | null>(null);
  const isSnappingRef = useRef(false);

  useEffect(() => {
    // Only activate on devices with a precise pointer (mouse/trackpad)
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    const getSections = (): HTMLElement[] =>
      Array.from(document.querySelectorAll<HTMLElement>("main > section"));

    const findNearestSectionEdge = (
      sections: HTMLElement[]
    ): { section: HTMLElement; distance: number } | null => {
      let best: { section: HTMLElement; distance: number } | null = null;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        // Distance from this section's top to the "ideal" position (navbar bottom)
        const distance = rect.top - NAVBAR_OFFSET;

        if (best === null || Math.abs(distance) < Math.abs(best.distance)) {
          best = { section, distance };
        }
      }

      return best;
    };

    const snapToNearest = () => {
      if (isSnappingRef.current) return;

      const sections = getSections();
      if (sections.length < 2) return;

      const nearest = findNearestSectionEdge(sections);
      if (!nearest) return;

      const snapZonePx = window.innerHeight * SNAP_ZONE;

      // Only snap if we're close enough to a section boundary
      // (within the snap zone but not already perfectly aligned)
      if (Math.abs(nearest.distance) > 3 && Math.abs(nearest.distance) < snapZonePx) {
        isSnappingRef.current = true;

        const targetTop =
          window.scrollY + nearest.section.getBoundingClientRect().top - NAVBAR_OFFSET;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: "smooth",
        });

        // Release the snapping flag after the smooth scroll likely finishes
        setTimeout(() => {
          isSnappingRef.current = false;
        }, 500);
      }
    };

    const onScroll = () => {
      // Any user scroll cancels an in-progress snap
      if (isSnappingRef.current) {
        isSnappingRef.current = false;
      }

      // Reset idle timer
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = window.setTimeout(snapToNearest, IDLE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  return null;
}
