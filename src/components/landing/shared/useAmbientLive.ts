"use client";

import type { RefObject } from "react";
import { useIsVisible } from "@/hooks/useIsVisible";
import { useStillMotion } from "@/hooks/useStillMotion";

/**
 * Whether an ambient (self-running) loop inside `ref` should run: the element is
 * on screen, the tab is foregrounded, and the visitor has not asked for less
 * motion. Render `ln-live` on the element when true; the landing CSS keys every
 * `animation-play-state` off it. Never branch markup on this value.
 */
export function useAmbientLive<T extends Element>(ref: RefObject<T | null>): boolean {
  const visible = useIsVisible(ref, { threshold: 0.05 });
  const still = useStillMotion();
  return visible && !still;
}
