"use client";

import { useRef } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, Intro, ReplayButton, StylisedTag, frame } from "./shared/ArtBox";
import Dial from "./Dial";
import DialWords from "./DialWords";
import { H, W } from "./dialGeometry";
import { useDial } from "./useDial";

/**
 * From download to running agents, "Your day, its day" (winner of the 2026-10-05 landing review).
 * A 24-hour dial: the only time you give is a cyan sliver at 09:00 on day one
 * (install, describe, connect); the rest of the dial is your day going on while
 * the agent's inner ring keeps running. The setup plays once in view; the day
 * then turns as an ambient loop (stops off-screen, in a hidden tab, and under
 * reduced motion, which rests on 08:15 the next morning with every run done).
 */
export default function GetStarted() {
  const c = useTranslation().t.landingSections.getStarted;
  const ref = useRef<HTMLDivElement>(null);
  const { p, hour, day, passed, play, still } = useDial(ref);
  const { place, fs } = frame(W, H);

  return (
    <SectionWrapper fit="fill" aria-labelledby="get-started-heading">
      <Intro lede={c.v3.lede} />
      <ArtBox w={W} h={H} boxRef={ref}>
        <Dial hour={hour} day={day} label={c.v3.artLabel} />
        <DialWords p={p} hour={hour} day={day} passed={passed} />
        <ReplayButton onClick={play} disabled={still} className="bottom-[2%] left-[2%]" />
        <StylisedTag style={{ ...place(900, 610, 280), ...fs(12, 12), textAlign: "right" }} />
      </ArtBox>
    </SectionWrapper>
  );
}
