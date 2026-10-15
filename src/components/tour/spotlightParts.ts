"use client";

import { useEffect } from "react";

/* Pieces of the tour spotlight (TourSpotlight.tsx) that need no React state:
   the click fence around the cutout, the tween maths, the live-target marker
   and the missed-anchor breadcrumb. */

export const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Smooth ease-in-out for the tween. */
export const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/** The four click-blocking panels around the cutout: top, bottom, left, right. */
export type Blockers = readonly (HTMLDivElement | null)[];

function place(el: HTMLDivElement | null, left: number, top: number, width: number, height: number): void {
  if (!el) return;
  el.style.transform = `translate(${left}px, ${top}px)`;
  el.style.width = `${Math.max(0, width)}px`;
  el.style.height = `${Math.max(0, height)}px`;
}

/** Fence the page outside the cutout `[l, t, r, b]`; the cutout itself stays open to the pointer. */
export function fence(blockers: Blockers, l: number, t: number, r: number, b: number, vw: number, vh: number): void {
  place(blockers[0], 0, 0, vw, t);
  place(blockers[1], 0, b, vw, vh - b);
  place(blockers[2], 0, t, l, b - t);
  place(blockers[3], r, t, vw - r, b - t);
}

/** Take the fence down (anchor dropped): the page is usable as is. */
export function unfence(blockers: Blockers): void {
  for (const el of blockers) place(el, 0, 0, 0, 0);
}

/** Data-free breadcrumb: no SENSITIVE_FIELDS key, no user-derived value. */
export function breadcrumbMissedAnchor(waitedMs: number): void {
  if (typeof window === "undefined") return;
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.addBreadcrumb({
        category: "tour",
        level: "warning",
        message: "tour spotlight anchor never resolved; dropping the scrim",
        data: { waitedMs },
      });
    })
    .catch(() => {
      /* Sentry is optional — the scrim is dropped either way. */
    });
}

/**
 * Mark the live spotlight target with `data-tour-active="true"` so the
 * element itself can react to being in focus (subtle scale + glow lift in
 * globals.css). Retries for lazy-hydrated targets.
 */
export function useSpotlightMarker(active: boolean, selector: string | null): void {
  useEffect(() => {
    if (!active || !selector) return;
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
  }, [active, selector]);
}
