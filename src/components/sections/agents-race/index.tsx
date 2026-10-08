"use client";

import { useRef } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { ArtBox, Intro, ReplayButton, ScenarioChips, StylisedTag, useTimelineCopy, useWide } from "./shared/Frame";
import { fill, useStory } from "./shared/motion";
import { DESK, DURATION } from "./data";
import Scene from "./Scene";
import Labels from "./Labels";
import Phone from "./Phone";

/**
 * How lab - timeline v3, "Off the rails": one stylised map. Fixed rules are a
 * train on a straight track - it leaves first and runs fast, until the
 * scenario's snag blocks the line; it brakes, puts its hazards on and a stall
 * clock starts running. The agent leaves at the same moment on foot, as it
 * were: its route bends around the snag through the four things it did and
 * reaches the flag. Five scenarios advance on their own; reduced motion shows
 * each finished. Below 64rem the same story runs on a portrait map (Phone).
 */
export default function HowLabTimelineV3() {
  const copy = useTimelineCopy();
  const wide = useWide();
  const ref = useRef<HTMLDivElement>(null);
  const { p, index, choose, replay, done, still } = useStory(ref, copy.v3.cases.length, () => DURATION, { hold: 3.5 });
  const cs = copy.v3.cases[index];
  const sc = copy.scenarios[index];

  return (
    <SectionWrapper fit="fill" id="agents-timeline">
      <Intro lede={copy.v3.lede} />
      <ScenarioChips names={copy.scenarios.map((s) => s.name)} index={index} onPick={choose} progress={p}>
        <span aria-hidden className="mx-1 hidden h-6 w-px bg-glass-hover sm:block" />
        <ReplayButton onClick={replay} disabled={still} />
      </ScenarioChips>
      {wide ? (
        <ArtBox w={DESK.w} h={DESK.h} boxRef={ref}>
          <Scene key={index} g={DESK} p={p}>
            <Labels c={index} p={p} />
          </Scene>
          <StylisedTag className="bottom-[0.5%] right-[1%]" />
        </ArtBox>
      ) : (
        <Phone c={index} p={p} boxRef={ref} />
      )}
      <p className="sr-only" role="status" aria-live="polite">
        {done ? fill(copy.v3.announce, { name: sc.name, snag: cs.snag, wait: cs.wait, result: cs.result }) : ""}
      </p>
    </SectionWrapper>
  );
}
