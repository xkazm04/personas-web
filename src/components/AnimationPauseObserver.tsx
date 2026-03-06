"use client";

import { useAnimationPause } from "@/hooks/useAnimationPause";
import { usePageVisibility } from "@/hooks/usePageVisibility";

export default function AnimationPauseObserver() {
  useAnimationPause();
  usePageVisibility(); // toggles .page-hidden on <html> when tab is backgrounded
  return null;
}
