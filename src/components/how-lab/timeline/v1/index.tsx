"use client";

import { useRef, useState } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { ArtBox, Intro, PauseButton, ReplayButton, ScenarioChips, StylisedTag, useTimelineCopy } from "../shared/Frame";
import { fill, useStory } from "../shared/motion";
import { H, SLOW, TIMING, W, raceMs } from "./data";
import Board, { LEAD, RaceCount } from "./Board";

/**
 * How lab - timeline v1, "The race, lit": the live race kept whole (five
 * scenarios, two lanes, race clocks, scenario picker, replay and pause) and
 * restaged as one lit board. The customer's request forks into both lanes at
 * once; the rule-based lane lights step by step until its rail cracks and
 * stamps its stall, while the agent's runner reaches the flag. Plays when in
 * view, then advances through the scenarios; hovering the board holds the
 * auto-advance, Pause freezes the race. Reduced motion shows each race
 * finished and never advances on its own.
 */
export default function HowLabTimelineV1() {
  const c = useTimelineCopy();
  const ref = useRef<HTMLDivElement>(null);
  const [frozen, setFrozen] = useState(false);
  const [hover, setHover] = useState(false);
  const { p, index, choose, replay, done, still } = useStory(ref, TIMING.length, (i) => ((raceMs(i) + LEAD) * SLOW) / 1000, {
    hold: 2.8,
    paused: frozen,
    holdCycle: hover,
  });
  const sc = c.scenarios[index];

  return (
    <SectionWrapper fit="fill" id="agents-timeline">
      <Intro lede={c.v1.lede} />
      <ScenarioChips
        names={c.scenarios.map((s) => s.name)}
        index={index}
        progress={p}
        onPick={(i) => {
          setFrozen(false);
          choose(i);
        }}
      >
        <span aria-hidden className="mx-1 hidden h-6 w-px bg-glass-hover sm:block" />
        <ReplayButton
          disabled={still}
          onClick={() => {
            setFrozen(false);
            replay();
          }}
        />
        <PauseButton paused={frozen} disabled={still} onClick={() => setFrozen((f) => !f)} />
      </ScenarioChips>

      <ArtBox w={W} h={H} boxRef={ref} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
        <RaceCount index={index} total={TIMING.length} />
        <Board key={index} index={index} p={p} />
        <StylisedTag className="bottom-[0.5%] left-[0.5%]" />
      </ArtBox>

      <p className="sr-only" role="status" aria-live="polite">
        {done ? fill(c.v1.announce, { name: sc.name, rules: sc.rulesResult, agent: sc.agentResult }) : ""}
      </p>
    </SectionWrapper>
  );
}
