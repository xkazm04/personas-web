"use client";

import type { RefObject } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";

/**
 * True while an ambient hero layer should move: motion is allowed, the tab is
 * foregrounded and the hero is on screen. Gate props / play-state with it
 * rather than changing markup (the hero server-renders).
 */
export function useHeroRunning(ref: RefObject<Element | null>): boolean {
  const still = useStillMotion();
  const visible = useIsVisible(ref);
  return !still && visible;
}
