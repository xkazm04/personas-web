"use client";

import type { ComponentType } from "react";
import type { StageColor } from "@/lib/colors";
import StageSection from "@/components/StageSection";

type StageProps = { glow: "cyan" | "purple" | "emerald"; fromColor?: StageColor; toColor?: StageColor };

/** Wraps a how-lab variant the way app/how/page.tsx mounts its sections. */
export function howLabFrame(Variant: ComponentType, stage: StageProps): ComponentType {
  function HowLabFramed() {
    return (
      <StageSection glow={stage.glow} fromColor={stage.fromColor} toColor={stage.toColor}>
        <Variant />
      </StageSection>
    );
  }
  return HowLabFramed;
}
