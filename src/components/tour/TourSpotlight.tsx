"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTour } from "@/contexts/TourContext";

/** Breathing room (px) drawn around the spotlit element. */
const PADDING = 22;
/** Minimum gap kept between the cutout and the viewport edge. */
const MARGIN = 44;
/** Extra bottom clearance so the cutout never runs under the caption card. */
const BOTTOM_GAP = 150;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * Dims the page except a rounded cutout around the current step's spotlight
 * target. The cutout follows the element on scroll/resize via a `scroll`
 * listener, plus a slow interval that catches the target once a lazy
 * section has hydrated — so no `requestAnimationFrame` loop is needed.
 *
 * The scrim uses a literal dark colour, not a theme token: a cinematic dim
 * must stay dark in every theme, and `--background` collapses to a light
 * system colour under `prefers-color-scheme: light` / forced-colors (literal
 * hex for overlay scrims is sanctioned in `.claude/design.md`). The ring,
 * however, uses the themed `--brand-cyan` accent so it matches the caption
 * card and the rest of the active theme.
 */
export default function TourSpotlight() {
  const { stepIndex, steps } = useTour();
  const cutoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (steps.length === 0) return;
    const { spotlightTarget } = steps[stepIndex];

    const sync = () => {
      const el = document.querySelector<HTMLElement>(spotlightTarget);
      const cutout = cutoutRef.current;
      if (!el || !cutout) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Clamp into the viewport so an oversized target still frames cleanly.
      const left = clamp(r.left - PADDING, MARGIN, vw - MARGIN);
      const top = clamp(r.top - PADDING, MARGIN, vh - MARGIN);
      const right = clamp(r.right + PADDING, MARGIN, vw - MARGIN);
      const bottom = clamp(r.bottom + PADDING, MARGIN, vh - BOTTOM_GAP);
      cutout.style.transform = `translate(${left}px, ${top}px)`;
      cutout.style.width = `${Math.max(0, right - left)}px`;
      cutout.style.height = `${Math.max(0, bottom - top)}px`;
      cutout.style.opacity = "1";
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    // Safety net: catch the target after lazy-section hydration / reflow.
    const poll = window.setInterval(sync, 250);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.clearInterval(poll);
    };
  }, [stepIndex, steps]);

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
        className="absolute left-0 top-0 rounded-2xl opacity-0"
        style={{
          border: "2px solid color-mix(in srgb, var(--brand-cyan) 80%, transparent)",
          // No CSS transition: the cutout is repositioned on every scroll
          // frame, so easing here would make it trail the smooth-scroll.
          // First shadow = the page dim; rest = the spotlight's accent glow.
          boxShadow:
            "0 0 0 100vmax rgba(8, 11, 20, 0.8), 0 0 64px color-mix(in srgb, var(--brand-cyan) 45%, transparent), inset 0 0 30px color-mix(in srgb, var(--brand-cyan) 14%, transparent)",
          willChange: "transform, width, height",
        }}
      />
    </motion.div>
  );
}
