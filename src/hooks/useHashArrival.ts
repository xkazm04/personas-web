"use client";

import { useEffect, useRef } from "react";

import {
  isUserScrollIntent,
  resolveLandingAddress,
  step,
  type ArrivalState,
  type LandingAddress,
} from "@/lib/landing-address";
import { useStillMotion } from "./useStillMotion";

/**
 * Lands `/#download` (and every other declared home address) on its section.
 *
 * The browser's fragment scroll and Next's layout-router both run before a
 * lazy, viewport-gated section exists, find no node, and give up. This runs
 * the pure arrival table from `lib/landing-address.ts` against the live DOM:
 * scroll the always-present wrapper (which mounts the section), wait for the
 * real section, land on it and move focus to its heading, then hold it in
 * place for a moment while skeletons above it resolve. The reader scrolling
 * at any point cancels it.
 */

const TICK_MS = 100;
/** Document-position drift that counts as a layout shift. */
const SHIFT_PX = 4;
/** Reader-intent events. Never `scroll`: our own scrollIntoView fires that. */
const INTENT_EVENTS = ["wheel", "touchmove", "pointerdown", "keydown"] as const;

export interface ArrivalOptions {
  /** Behaviour of the scroll toward the (possibly unmounted) section. */
  approach: ScrollBehavior;
  /** Behaviour of the landing scroll, read at landing time. */
  land: () => ScrollBehavior;
  /** Move keyboard focus to the section's heading on landing. */
  focus: boolean;
}

const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

function focusHeading(section: HTMLElement) {
  const labelledBy = section.getAttribute("aria-labelledby");
  const target =
    (labelledBy ? document.getElementById(labelledBy) : null) ??
    section.querySelector<HTMLElement>("h1, h2") ??
    section;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

/** Runs one arrival; returns a function that stops it. Safe to call again
 *  while one is running as long as the previous stop function is called. */
export function startArrival(address: LandingAddress, options: ArrivalOptions): () => void {
  let state: ArrivalState = "seeking";
  let enteredAt = performance.now();
  let userScrolled = false;
  // Where (document coordinates) the element we last scrolled to sat when we
  // scrolled. Document coordinates do not move while a smooth scroll runs,
  // only when content above the target changes height.
  let sentTo: number | null = null;

  const onIntent = (e: Event) => {
    if (isUserScrollIntent({ type: e.type, key: (e as KeyboardEvent).key })) userScrolled = true;
  };
  const scrollTo = (el: Element, behavior: ScrollBehavior) => {
    sentTo = docTop(el);
    el.scrollIntoView({ behavior, block: "start" });
  };

  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
    for (const type of INTENT_EVENTS) window.removeEventListener(type, onIntent, true);
  };

  const tick = () => {
    const wrapper = document.querySelector(address.wrapperSelector);
    const inner = document.querySelector<HTMLElement>(address.innerSelector);
    const target = inner ?? wrapper;
    const layoutShifted = target !== null && sentTo !== null && Math.abs(docTop(target) - sentTo) > SHIFT_PX;
    const next = step(state, {
      innerMounted: inner !== null,
      userScrolled,
      layoutShifted,
      elapsedMs: performance.now() - enteredAt,
    });
    if (next.state !== state) {
      state = next.state;
      enteredAt = performance.now();
    }
    switch (next.action) {
      case "scroll-wrapper":
        // Re-issue only when the wrapper moved: restarting a smooth scroll on
        // every tick would stall it.
        if (wrapper && (sentTo === null || layoutShifted)) scrollTo(wrapper, options.approach);
        break;
      case "scroll-inner-and-focus":
        if (inner) {
          scrollTo(inner, options.land());
          if (options.focus) focusHeading(inner);
        }
        break;
      case "reassert-inner":
        if (inner) scrollTo(inner, "instant");
        break;
    }
    if (state !== "seeking" && state !== "landed") stop();
  };

  for (const type of INTENT_EVENTS) window.addEventListener(type, onIntent, { capture: true, passive: true });
  timer = setInterval(tick, TICK_MS);
  tick();
  return stop;
}

/** Resolve the URL hash on mount and on every hashchange. */
export function useHashArrival(): void {
  const still = useStillMotion();
  const stillRef = useRef(still);
  useEffect(() => {
    stillRef.current = still;
  }, [still]);

  useEffect(() => {
    let stop = () => {};
    const arrive = (initial: boolean) => {
      stop();
      stop = () => {};
      const address = resolveLandingAddress(window.location.hash);
      if (!address) return;
      stop = startArrival(address, {
        // A cold arrival jumps, as a native fragment load does: a smooth scroll
        // across ten gated sections would mount every one of them on the way.
        approach: initial || stillRef.current ? "instant" : "smooth",
        land: () => (stillRef.current ? "instant" : "smooth"),
        focus: true,
      });
    };
    const onHashChange = () => arrive(false);
    arrive(true);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      stop();
    };
  }, []);
}
