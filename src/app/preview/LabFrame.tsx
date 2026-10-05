"use client";

import type { ComponentType } from "react";
import type { StageColor } from "@/lib/colors";
import StageSection from "@/components/StageSection";

type StageProps = { glow: "cyan" | "purple" | "emerald"; fromColor: StageColor; toColor?: StageColor };

/**
 * Wraps a lab variant the way app/features/page.tsx mounts its section: a
 * StageSection with the live glow and gradient (one viewport).
 */
export function labFrame(Variant: ComponentType, stage: StageProps): ComponentType {
  function LabFramed() {
    return (
      <div data-scroll-anchor="lab">
        <StageSection glow={stage.glow} fromColor={stage.fromColor} toColor={stage.toColor}>
          <Variant />
        </StageSection>
      </div>
    );
  }
  return LabFramed;
}
