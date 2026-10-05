"use client";

import { useRef } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import { ArtBox, Intro, ReplayButton, StylisedTag } from "../shared/Frame";
import { FG, useLoop } from "../shared/motion";
import Rack from "./Rack";
import Cable from "./Cable";
import AgentList from "./AgentList";
import { AGENTS, ENGINES, H, JACK_X, W, agentY, portOf, type Engine } from "./geometry";
import { usePatch } from "./usePatch";

/**
 * Models lab V3 "Patch bay": per-agent model choice as a physical patch bay.
 * Five agents on the left are cabled to engine modules on the right - Claude
 * Opus, Sonnet and Haiku in one rack, Ollama apart in its own module on this PC.
 * In view, the demo re-patches three cables (the private journal goes home to
 * Ollama first); clicking an agent swaps its engine. Cables sway as an ambient
 * loop (stops off-screen, in a hidden tab, and under reduced motion, which shows
 * the resolved patch with every re-patch a cut).
 */
export default function ModelsLabV3() {
  const c = useTranslation().t.featuresLab.models;
  const ref = useRef<HTMLDivElement>(null);
  const { patch, swap, replay, still } = usePatch(ref);
  const flow = useLoop(ref, 6, 0.25);
  const used = Object.fromEntries(ENGINES.map((e) => [e, AGENTS.filter((a) => patch[a] === e).length])) as Record<Engine, number>;

  return (
    <SectionWrapper fit="fill" id="multi-provider">
      <Intro lede={c.v3.lede} />
      <ArtBox w={W} h={H} boxRef={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="img" aria-label={c.v3.artLabel} fill="none">
          <Rack used={used} />
          {AGENTS.map((a, i) => (
            <circle key={a} cx={JACK_X} cy={agentY(i)} r={13} fill="var(--background)" stroke={FG} strokeOpacity={0.4} strokeWidth={1.5} />
          ))}
          {AGENTS.map((a, i) => (
            <Cable key={a} y1={agentY(i)} to={portOf(patch, a)} engine={patch[a]} i={i} flow={flow} still={still} />
          ))}
        </svg>
        <AgentList patch={patch} swap={swap} />
        <ReplayButton onClick={replay} disabled={still} className="left-[28.5%] top-[4.5%]" />
        <StylisedTag className="right-[1%] top-0" />
      </ArtBox>
    </SectionWrapper>
  );
}
