"use client";

import { useRef } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, Intro, ReplayButton, StylisedTag, frame } from "../shared/ArtBox";
import { usePlay, useLoop } from "../shared/motion";
import Machine from "./Machine";
import Words from "./Words";
import { FRAME, H, W } from "./assemblyGeometry";

/**
 * Landing lab - From download to running agents, V2 "Built from one sentence".
 * An assembly sequence on your PC: one sentence parts into four phrases, each
 * drops a part of the agent onto its chassis, keys lock, the test passes and
 * you switch it on. The build plays once in view; the run lap after it is
 * ambient (stops off-screen, in a hidden tab, and under reduced motion).
 */
export default function LabVariant() {
  const c = useTranslation().t.landingLab.getStarted;
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, seek, still } = usePlay(ref, 8);
  const loop = useLoop(ref, 3.4, 0.86);
  const { place, fs } = frame(W, H);

  return (
    <SectionWrapper fit="fill" aria-labelledby="get-started-heading">
      <Intro lede={c.v2.lede} />
      <ArtBox w={W} h={H} boxRef={ref}>
        <Machine p={p} loop={loop} label={c.v2.artLabel} />
        <Words p={p} loop={loop} onSeek={(at) => seek(Math.min(1, at + 0.09))} />
        <ReplayButton onClick={play} disabled={still} className="right-[2.5%] top-[3.4%] !h-8 !w-8" />
        <StylisedTag style={{ ...place(FRAME.x + 24, FRAME.y + FRAME.h - 28, 280), ...fs(12, 12) }} />
      </ArtBox>
    </SectionWrapper>
  );
}
