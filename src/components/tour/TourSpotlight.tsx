"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTour } from "@/contexts/TourContext";

/** Breathing room (px) drawn around the spotlit element. */
const PADDING = 22;
/** Minimum gap kept between the cutout and the viewport edge. */
const MARGIN = 44;
/** Extra bottom clearance so the cutout never runs under the caption card. */
const BOTTOM_GAP = 150;
/** Step-to-step tween duration. */
const TWEEN_MS = 600;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
/** Smooth ease-in-out for the tween. */
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/**
 * Dims the page except a rounded cutout that *glides* between step targets.
 *
 * Uses one `requestAnimationFrame` loop while the tour is active. Each frame
 * reads the current step's target rect and applies it to the cutout — and
 * during the first `TWEEN_MS` after a step change, the position is blended
 * from the previous step's captured rect toward the live new rect, so the
 * spotlight visibly travels between headings instead of jump-cutting. After
 * the blend, the rAF keeps tracking the live rect, which gives natural
 * scroll-follow without a separate scroll listener.
 *
 * Imports `useReducedMotion` per `custom-animation/require-animation-gating`;
 * when set, the tween is skipped and the cutout snaps to each step.
 *
 * The scrim uses a literal dark colour, not a theme token: a cinematic dim
 * must stay dark in every theme, and `--background` collapses to a light
 * system colour under `prefers-color-scheme: light` / forced-colors (literal
 * hex for overlay scrims is sanctioned in `.claude/design.md`). The ring,
 * however, uses the themed `--brand-cyan` accent so it matches the caption
 * card and the rest of the active theme.
 */
export default function TourSpotlight() {
  const { active, activeSpotlight } = useTour();
  const cutoutRef = useRef<HTMLDivElement>(null);
  const prevTargetRef = useRef<string | null>(activeSpotlight);
  const prevRectRef = useRef<DOMRect | null>(null);
  const tweenStartRef = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  // Mark the live spotlight target with `data-tour-active="true"` so the
  // element itself can react to being in focus (subtle scale + glow lift in
  // globals.css). Retries for lazy-hydrated targets.
  useEffect(() => {
    if (!active || !activeSpotlight) return;
    const selector = activeSpotlight;
    let marked: HTMLElement | null = null;
    const apply = () => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el && el !== marked) {
        marked?.removeAttribute("data-tour-active");
        el.setAttribute("data-tour-active", "true");
        marked = el;
      }
    };
    apply();
    const id = window.setInterval(apply, 200);
    return () => {
      window.clearInterval(id);
      marked?.removeAttribute("data-tour-active");
    };
  }, [active, activeSpotlight]);

  useEffect(() => {
    if (!active || !activeSpotlight) return;

    // Capture the previous target's rect when the target changes (step change
    // or mid-step sweep) so the tween can start from where the spotlight is.
    const oldTarget = prevTargetRef.current;
    prevTargetRef.current = activeSpotlight;
    if (oldTarget && oldTarget !== activeSpotlight && !prefersReducedMotion) {
      const prevEl = document.querySelector<HTMLElement>(oldTarget);
      prevRectRef.current = prevEl ? prevEl.getBoundingClientRect() : null;
      tweenStartRef.current = performance.now();
    } else {
      prevRectRef.current = null;
    }

    const newTarget = activeSpotlight;
    let frame = 0;

    const tick = () => {
      const cutout = cutoutRef.current;
      const el = document.querySelector<HTMLElement>(newTarget);
      if (cutout && el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
          let left = r.left;
          let top = r.top;
          let right = r.right;
          let bottom = r.bottom;
          // Blend from the previous rect toward the live new rect for the
          // first TWEEN_MS — after that, snap to live and just track.
          if (prevRectRef.current) {
            const t = Math.min(1, (performance.now() - tweenStartRef.current) / TWEEN_MS);
            const e = ease(t);
            const p = prevRectRef.current;
            left = p.left * (1 - e) + r.left * e;
            top = p.top * (1 - e) + r.top * e;
            right = p.right * (1 - e) + r.right * e;
            bottom = p.bottom * (1 - e) + r.bottom * e;
            if (t >= 1) prevRectRef.current = null;
          }
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          // Narrow viewports get tighter margins so the frame doesn't crush
          // the visible content area.
          const m = vw < 480 ? 18 : MARGIN;
          const bg = vw < 480 ? 180 : BOTTOM_GAP;
          const cl = clamp(left - PADDING, m, vw - m);
          const ct = clamp(top - PADDING, m, vh - m);
          const cr = clamp(right + PADDING, m, vw - m);
          const cb = clamp(bottom + PADDING, m, vh - bg);
          cutout.style.transform = `translate(${cl}px, ${ct}px)`;
          cutout.style.width = `${Math.max(0, cr - cl)}px`;
          cutout.style.height = `${Math.max(0, cb - ct)}px`;
          cutout.style.opacity = "1";
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, activeSpotlight, prefersReducedMotion]);

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
        className="tour-cutout-pulse absolute left-0 top-0 rounded-2xl opacity-0"
        style={{
          border: "2px solid color-mix(in srgb, var(--brand-cyan) 80%, transparent)",
          boxShadow:
            "0 0 0 100vmax rgba(8, 11, 20, 0.8), 0 0 64px color-mix(in srgb, var(--brand-cyan) 45%, transparent), inset 0 0 30px color-mix(in srgb, var(--brand-cyan) 14%, transparent)",
          willChange: "transform, width, height",
        }}
      />
    </motion.div>
  );
}
