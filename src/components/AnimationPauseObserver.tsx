"use client";

import { useEffect } from "react";
import { useAnimationPause } from "@/hooks/useAnimationPause";
import { usePageVisibility } from "@/hooks/usePageVisibility";

export default function AnimationPauseObserver() {
  useAnimationPause();
  usePageVisibility(); // toggles .page-hidden on <html> when tab is backgrounded

  useEffect(() => {
    // ── data-animate-when-visible enforcement ───────────────────────────────
    // If no elements are found with the attribute, animations won't be paused
    // off-screen, wasting GPU budget. Every section component MUST include it.
    if (process.env.NODE_ENV === "development") {
      const elements = document.querySelectorAll("[data-animate-when-visible]");
      if (elements.length === 0) {
        console.warn(
          "[AnimationPauseObserver] Zero elements found with [data-animate-when-visible]. " +
          "Ensure your section wrappers (e.g. SectionWrapper or StageSection) include " +
          "this attribute to participate in off-screen performance optimization."
        );
      }
    }
  }, []);

  return null;
}
