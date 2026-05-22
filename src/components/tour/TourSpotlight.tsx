"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTour } from "@/contexts/TourContext";
import { TOUR_STEPS } from "@/lib/tour-script";

/** Breathing room (px) drawn around the spotlit element. */
const PADDING = 16;

/**
 * Dims the whole page except a rounded cutout around the current step's
 * target. The cutout follows the element on scroll/resize via a `scroll`
 * listener (which fires every frame during programmatic smooth-scroll), so
 * no `requestAnimationFrame` loop is needed and the spotlight glides with
 * the page as the tour scrolls between sections.
 */
export default function TourSpotlight() {
  const { stepIndex } = useTour();
  const cutoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { target } = TOUR_STEPS[stepIndex];

    const sync = () => {
      const el = document.querySelector<HTMLElement>(target);
      const cutout = cutoutRef.current;
      if (!el || !cutout) return;
      const r = el.getBoundingClientRect();
      cutout.style.transform = `translate(${r.left - PADDING}px, ${r.top - PADDING}px)`;
      cutout.style.width = `${r.width + PADDING * 2}px`;
      cutout.style.height = `${r.height + PADDING * 2}px`;
      cutout.style.opacity = "1";
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [stepIndex]);

  return (
    <motion.div
      className="fixed inset-0 z-[80]"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        ref={cutoutRef}
        className="absolute left-0 top-0 rounded-2xl border border-brand-cyan/70 opacity-0"
        style={{
          // The huge spread turns this element's shadow into the page dim;
          // the second shadow is the spotlight's cyan glow.
          boxShadow:
            "0 0 0 100vmax color-mix(in srgb, var(--background) 84%, transparent), 0 0 48px color-mix(in srgb, var(--brand-cyan) 35%, transparent)",
          willChange: "transform, width, height",
        }}
      />
    </motion.div>
  );
}
