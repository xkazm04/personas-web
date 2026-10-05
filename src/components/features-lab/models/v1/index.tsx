"use client";

import { useRef } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, Intro, ReplayButton, StylisedTag } from "../shared/Frame";
import { FG, mix, useLoop, usePlay } from "../shared/motion";
import { Backdrop, Defs } from "./Backdrop";
import Stations from "./Stations";
import Agents from "./Agents";
import { DURATION, H, HUB, W } from "./geometry";

/**
 * Models lab V1 "Router, lit": the live router, restaged. Four agents live in
 * rows on your machine; one by one their thinking leaves the row, passes the
 * per-agent pick and docks at its engine: out through the machine's single
 * port to Claude Opus, Sonnet or Haiku, or down to Ollama inside the machine,
 * which gains a shield. Plays once in view (replayable); once docked, pulses
 * keep every line busy as an ambient loop (stops off-screen, in a hidden tab,
 * and under reduced motion, which shows the docked end state).
 */
export default function ModelsLabV1() {
  const c = useTranslation().t.featuresLab.models;
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlay(ref, DURATION);
  const flow = useLoop(ref, 3.2, 0.3);
  const [hx, hy] = HUB;

  return (
    <SectionWrapper fit="fill" id="multi-provider">
      <Intro lede={c.v1.lede} />
      <ArtBox w={W} h={H} boxRef={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={c.v1.artLabel} fill="none">
          <Defs />
          <Backdrop />
          <Stations p={p} />
          <Agents p={p} flow={flow} />
          {/* The per-agent pick: drawn last, orbs pass under it. */}
          <circle cx={hx} cy={hy} r={34} fill="var(--background)" />
          <circle cx={hx} cy={hy} r={34} fill={mix(FG, 6)} stroke={FG} strokeOpacity={0.5} strokeWidth={2} />
          <g stroke={FG} strokeOpacity={0.85} strokeWidth={2.4} strokeLinecap="round">
            <path d={`M ${hx - 15} ${hy} L ${hx + 13} ${hy - 13} M ${hx - 15} ${hy} L ${hx + 15} ${hy} M ${hx - 15} ${hy} L ${hx + 13} ${hy + 13}`} />
          </g>
          <circle cx={hx - 15} cy={hy} r={4.5} fill={FG} />
          <text x={hx + 46} y={hy + 44} fontSize={15} fontWeight={600} fill={FG} fillOpacity={0.75}>
            {c.v1.pick}
          </text>
        </svg>
        <ReplayButton onClick={play} disabled={still} className="right-[1.5%] top-[2%]" />
        <StylisedTag className="bottom-[1%] right-[2%]" />
      </ArtBox>
    </SectionWrapper>
  );
}
