"use client";

import { useRef } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, Intro, ReplayButton, StylisedTag, frame } from "../shared/ArtBox";
import { usePlay, useLoop } from "../shared/motion";
import StopLabels from "./StopLabels";
import TrailArt from "./TrailArt";
import { H, W } from "./trailGeometry";

/**
 * Landing lab - From download to running agents, V1 "The trail".
 * A stylised trail map: you walk four stops (install, say what you want, it
 * builds and connects, it runs), and the trail ends by joining a loop the agent
 * keeps running on its own. The walk plays once in view; the loop is ambient
 * (stops off-screen, in a hidden tab, and under reduced motion).
 */
export default function LabVariant() {
  const c = useTranslation().t.landingLab.getStarted;
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, seek, still } = usePlay(ref, 7);
  const loop = useLoop(ref, 9, 0.18);
  const { place, fs } = frame(W, H);

  return (
    <SectionWrapper fit="fill" aria-labelledby="get-started-heading">
      <Intro lede={c.v1.lede} />
      <ArtBox w={W} h={H} boxRef={ref}>
        <TrailArt p={p} loop={loop} label={c.v1.artLabel} />
        <StopLabels p={p} onSeek={(at) => seek(Math.min(1, at + 0.012))} />
        <ReplayButton onClick={play} disabled={still} className="right-0 top-0" />
        <StylisedTag style={{ ...place(900, 596, 296), ...fs(12, 12), textAlign: "right" }} />
      </ArtBox>
    </SectionWrapper>
  );
}
