"use client";

import { createElement } from "react";
import type { TriggerId } from "@/components/sections/orchestration-hub/data";
import { SCENES } from "./scenes";

interface TriggerSceneProps {
  id: TriggerId;
  run: boolean;
  tone: string;
  className?: string;
}

/** A trigger's vignette as a standalone, decorative <svg> (the words beside it carry the meaning). */
export default function TriggerScene({ id, run, tone, className }: TriggerSceneProps) {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true" className={className}>
      {/* createElement: the scene is looked up from a module-level table, never created in render. */}
      {createElement(SCENES[id], { run, tone })}
    </svg>
  );
}
