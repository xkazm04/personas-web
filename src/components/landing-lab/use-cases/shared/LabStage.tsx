"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { CASES } from "./catalog";
import CycleControls from "./CycleControls";
import type { CaseCopy } from "./useCaseCopy";
import type { CaseCycle } from "./useCaseCycle";

/**
 * The section body every variant shares: the live heading, one stage slot
 * holding the art at a fixed aspect ratio (as wide as the stage allows, never
 * taller than the slot), the playback controls under it, and a status line
 * that is announced only while the visitor is stepping (not on autoplay).
 *
 * The art box is an inline-size container, so a variant sizes everything in
 * `cqw` and keeps its proportions from a 1280x800 laptop to a 1080p monitor.
 */
export default function LabStage({
  ar,
  artRef,
  pb,
  copy,
  children,
}: {
  ar: number;
  artRef: RefObject<HTMLDivElement | null>;
  pb: CaseCycle;
  copy: CaseCopy;
  children: ReactNode;
}) {
  return (
    <SectionWrapper fit="fill" id="use-cases">
      <SectionIntro heading={copy.heading} gradient={copy.gradient} />
      <div data-stage-slot>
        <div
          ref={artRef}
          data-stage-art
          role="img"
          aria-label={copy.artLabel}
          className="relative w-full select-none"
          style={{ "--art-ar": ar, aspectRatio: ar, containerType: "inline-size" } as CSSProperties}
        >
          {children}
        </div>
      </div>
      <div className="mt-4 flex justify-center stage:mt-[1.6svh]">
        <CycleControls pb={pb} count={CASES.length} />
      </div>
      <p className="sr-only" aria-live={pb.playing ? "off" : "polite"}>
        {copy.status(pb.active)}
      </p>
    </SectionWrapper>
  );
}
