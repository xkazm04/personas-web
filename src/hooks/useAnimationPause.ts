"use client";

import { useEffect, useRef } from "react";

/**
 * ── data-animate-when-visible Contract ─────────────────────────────────────
 *
 * To optimize GPU budget, CSS animations should be paused when off-screen.
 * This module implements a "pause-off-screen" protocol:
 *
 * 1. Server-rendered elements use the `data-animate-when-visible` attribute
 *    (picked up via one-time querySelectorAll on mount).
 * 2. Client components that mount dynamically (e.g. lazy-loaded sections)
 *    register via `useAnimationPauseRegister`.
 * 3. `globals.css` defines `.animations-paused` to set `animation-play-state: paused`.
 *
 * This replaces the previous MutationObserver approach with a registry
 * pattern to eliminate querySelectorAll on every DOM mutation.
 * ───────────────────────────────────────────────────────────────────────────
 */

const SELECTOR = "[data-animate-when-visible]";
const PAUSED_CLASS = "animations-paused";

// ── Module-level registry (singleton) ──
// Client components register their element refs here on mount.
// The IntersectionObserver in useAnimationPause picks them up.

let _observer: IntersectionObserver | null = null;
const _registered = new Set<Element>();

function registerAnimationElement(el: Element) {
  if (_registered.has(el)) return;
  _registered.add(el);
  _observer?.observe(el);
}

function deregisterAnimationElement(el: Element) {
  _registered.delete(el);
  _observer?.unobserve(el);
}

/**
 * Observes all elements with `data-animate-when-visible` and those registered
 * via the module registry. Toggles `.animations-paused` when elements leave
 * the viewport (with a one-viewport-height margin).
 *
 * Uses a one-time querySelectorAll on mount for server-rendered elements,
 * plus the registry for dynamically-mounted client components — no
 * MutationObserver needed.
 */
export function useAnimationPause() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove(PAUSED_CLASS);
          } else {
            entry.target.classList.add(PAUSED_CLASS);
          }
        }
      },
      {
        // Trigger when element is within one viewport height of the visible area
        rootMargin: "100% 0px",
      },
    );

    // Expose the observer to the registry so late-mounting components
    // can be observed immediately on register.
    _observer = observer;

    // One-time scan for server-rendered elements
    const elements = document.querySelectorAll(SELECTOR);
    elements.forEach((el) => observer.observe(el));

    // Observe any elements that registered before the observer was created
    for (const el of _registered) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      _observer = null;
    };
  }, []);
}

/**
 * Hook for client components to register their root element with the
 * animation pause system. Call from any client component whose root
 * element should participate in off-screen animation pausing.
 *
 * Returns a ref callback to attach to the element. If you already have
 * a ref, pass it as the argument instead.
 */
export function useAnimationPauseRegister(
  externalRef?: React.RefObject<Element | null>,
) {
  const internalRef = useRef<Element | null>(null);
  const ref = externalRef ?? internalRef;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerAnimationElement(el);
    return () => deregisterAnimationElement(el);
  }, [ref]);

  return externalRef ? undefined : internalRef;
}
