"use client";

import { useEffect, useRef } from "react";

/**
 * Playback policy for Athena's looping avatar clip (`athena_idle_loop.mp4`),
 * which the /athena page renders in two places at once — the hero orb and
 * the walkthrough guide orb. Left to the browser, both decode continuously
 * and forever: while scrolled far off screen, and while the tab sits in the
 * background.
 *
 * The desktop product this page advertises has an explicit resource
 * discipline — one clip playing at a time, zero decode while the document is
 * hidden. The page should honour the discipline it is selling. So:
 *
 *   - reduced motion   → the caller renders the static poster and never
 *                        mounts a <video>; pass `enabled: false` and this
 *                        hook is inert.
 *   - off screen       → paused. The observer watches the <video> element
 *                        itself (not its section), so only the orb actually
 *                        on screen holds a decode.
 *   - tab backgrounded → paused, resumed on return.
 *
 * Deliberately holds no React state. Nothing in either caller's render output
 * depends on the play/pause decision, so routing it through state (framer's
 * `useInView`, or the repo's `useIsVisible`) would re-render an SVG-motion
 * subtree on every viewport crossing and every tab switch to change one DOM
 * property. Both the observer and the listener are torn down on unmount, and
 * the element is paused on the way out so a detached node cannot keep
 * decoding.
 *
 * @param enabled `false` under reduced motion (no <video> exists to drive).
 * @returns ref to attach to the `<video>`.
 */
export function useAvatarPlayback(enabled: boolean) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!enabled || !video) return;

    // Environments without IntersectionObserver (older browsers, jsdom) can't
    // tell on screen from off — degrade to "visible" so the clip still plays.
    const observable = typeof IntersectionObserver !== "undefined";
    let onScreen = !observable;

    const sync = () => {
      if (onScreen && !document.hidden) {
        if (video.paused) {
          // play() rejects when a pause races it, or when an autoplay policy
          // refuses — swallow it so it never surfaces as an unhandled
          // rejection. (Muted playback is permitted without a user gesture.)
          const started = video.play();
          if (started) started.catch(() => {});
        }
      } else if (!video.paused) {
        video.pause();
      }
    };

    const observer = observable
      ? new IntersectionObserver((entries) => {
          const latest = entries[entries.length - 1];
          if (!latest) return;
          onScreen = latest.isIntersecting;
          sync();
        })
      : null;
    observer?.observe(video);

    document.addEventListener("visibilitychange", sync);
    // Kick once: fallback environments start playing here, observed ones stay
    // paused until the observer delivers its first entry.
    sync();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [enabled]);

  return ref;
}
