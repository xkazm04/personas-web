"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTour } from "@/contexts/TourContext";
import { breadcrumbMissedAnchor, clamp, ease, fence, unfence, useSpotlightMarker } from "./spotlightParts";

/** Breathing room (px) drawn around the spotlit element. */
const PADDING = 22;
/** Minimum gap kept between the cutout and the viewport edge. */
const MARGIN = 44;
/** Extra bottom clearance so the cutout never runs under the caption card. */
const BOTTOM_GAP = 150;
/** From here up (Tailwind `lg`) a docked caption card sits beside the cutout, not under it. */
const DOCK_MIN_VW = 1024;
/** Bottom gap when the card is docked: the anchor's controls may sit at the viewport's foot. */
const DOCKED_BOTTOM_GAP = 8;
/** Step-to-step tween duration. */
const TWEEN_MS = 600;
/** Anchor wait before the missed-anchor policy fires (covers lazy hydration). */
const ANCHOR_TIMEOUT_MS = 3000;

/**
 * Dims the page except a rounded cutout that *glides* between step targets.
 *
 * Uses one `requestAnimationFrame` loop while the tour is active. Each frame
 * reads the current step's target rect and applies it to the cutout; for the
 * first `TWEEN_MS` after a step change the position is blended from the previous
 * step's captured rect toward the live one, so the spotlight visibly travels
 * between headings instead of jump-cutting. After the blend the rAF keeps
 * tracking the live rect — scroll-follow for free, no scroll listener.
 *
 * Gated on `useStillMotion` per `custom-animation/require-animation-gating`;
 * when set, the tween is skipped and the cutout snaps to each step.
 *
 * **Missed-anchor policy — keep the caption, drop the scrim.** If a step's
 * selector has not resolved within `ANCHOR_TIMEOUT_MS` the cutout fades out, so
 * the page reads normally while narration and caption carry on. Skipping the
 * step was rejected: it would discard narration already playing and desync the
 * voice from the caption. It also fixes the worse half of the same bug — a cutout
 * left on the *previous* step's rect. Self-healing: a late anchor restores it.
 *
 * The scrim is a literal `rgba(8, 11, 20, 0.8)`, not a theme token, because its
 * job is to darken whatever is behind it — it must stay dark in every theme, and
 * `--background` resolves to a light colour under `prefers-color-scheme: light`
 * and forced-colors, which would make the "dim" brighter than the page and
 * destroy the cutout. It is the one value here that must NOT follow the theme, a
 * deliberate exception to `.claude/design.md` §1 (which sanctions only `#0a0f1a`
 * for modal surfaces, not scrims) — not blanket permission for literal colours
 * elsewhere in the tour. The ring, by contrast, uses the themed `--brand-cyan`
 * accent so it matches the caption card and the rest of the active theme.
 *
 * **Click-through cutout.** The overlay itself takes no pointer events; four
 * transparent panels fence the page *around* the cutout (moved with it every
 * frame), so the spotlit target can be clicked (a step the visitor does) while
 * the dimmed page cannot. The fence comes down with the scrim when an anchor is
 * missed. Keyboard focus is unchanged: the caption card keeps its trap and
 * Escape still exits; its "Show me" is the keyboard way to the target.
 */
export default function TourSpotlight() {
  const { active, activeSpotlight, steps, stepIndex } = useTour();
  const docked = steps[stepIndex]?.captionDock !== undefined;
  const cutoutRef = useRef<HTMLDivElement>(null);
  const blockersRef = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const prevTargetRef = useRef<string | null>(activeSpotlight);
  const prevRectRef = useRef<DOMRect | null>(null);
  const tweenStartRef = useRef<number>(0);
  const prefersReducedMotion = useStillMotion();

  useSpotlightMarker(active, activeSpotlight);

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
    const startedAt = performance.now();
    let resolved = false;
    let dropped = false;

    const tick = () => {
      const cutout = cutoutRef.current;
      const el = document.querySelector<HTMLElement>(newTarget);
      if (cutout && el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
          resolved = true;
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
          // A docked card (TourStep.captionDock) leaves the bottom edge free.
          const bg = vw < 480 ? 180 : docked && vw >= DOCK_MIN_VW ? DOCKED_BOTTOM_GAP : BOTTOM_GAP;
          const cl = clamp(left - PADDING, m, vw - m);
          const ct = clamp(top - PADDING, m, vh - m);
          const cr = clamp(right + PADDING, m, vw - m);
          const cb = clamp(bottom + PADDING, m, vh - bg);
          cutout.style.transform = `translate(${cl}px, ${ct}px)`;
          cutout.style.width = `${Math.max(0, cr - cl)}px`;
          cutout.style.height = `${Math.max(0, cb - ct)}px`;
          cutout.style.opacity = "1";
          fence(blockersRef.current, cl, ct, cr, cb, vw, vh);
        }
      }
      // Missed-anchor policy (see docblock). Two boolean reads per frame once
      // the anchor resolves, so the happy path is untouched.
      if (!resolved && !dropped && cutout) {
        const waitedMs = performance.now() - startedAt;
        if (waitedMs > ANCHOR_TIMEOUT_MS) {
          dropped = true;
          cutout.style.opacity = "0";
          unfence(blockersRef.current);
          breadcrumbMissedAnchor(Math.round(waitedMs));
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, activeSpotlight, docked, prefersReducedMotion]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[80]"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : undefined}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          ref={(el) => {
            blockersRef.current[i] = el;
          }}
          data-tour-fence=""
          className="pointer-events-auto absolute left-0 top-0 h-0 w-0"
        />
      ))}
      <div
        ref={cutoutRef}
        className="tour-cutout-pulse pointer-events-none absolute left-0 top-0 rounded-2xl opacity-0"
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
