"use client";

import type { ComponentType } from "react";
import type { StageColor } from "@/lib/colors";
import StageSection from "@/components/StageSection";
import HeroAmbientIllustration from "@/components/sections/hero/HeroAmbientIllustration";

type StageProps = { glow: "cyan" | "purple" | "emerald"; fromColor: StageColor; toColor?: StageColor };

/**
 * Wraps a landing-lab variant the way app/page.tsx mounts its section: a
 * StageSection with the live glow/gradient (one viewport, scroll-map
 * address), or for a hero the always-present `#hero` block with the page's
 * ambient layer behind it.
 */
export function labFrame(Variant: ComponentType, stage: StageProps | "hero"): ComponentType {
  function LabFramed() {
    if (stage === "hero") {
      return (
        <>
          <HeroAmbientIllustration />
          <div id="hero">
            <Variant />
          </div>
        </>
      );
    }
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
