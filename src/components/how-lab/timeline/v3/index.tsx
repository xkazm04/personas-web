"use client";

import { useRef } from "react";
import { motion, type MotionValue } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { ArtBox, Intro, ReplayButton, ScenarioChips, StylisedTag, useTimelineCopy } from "../shared/Frame";
import { BG, CYAN, FG, fill, useStory } from "../shared/motion";
import { DURATION, H, W } from "./data";
import { Railway, Terrain } from "./Map";
import { Route, Train } from "./Movers";
import Labels from "./Labels";

/**
 * How lab - timeline v3, "Off the rails": one stylised map. Fixed rules are a
 * train on a straight track - it leaves first and runs fast, until the
 * scenario's snag blocks the line; it brakes, puts its hazards on and a stall
 * clock starts running. The agent leaves at the same moment on foot, as it
 * were: its route bends around the snag through the four things it did and
 * reaches the flag. Five scenarios advance on their own; reduced motion shows
 * each finished.
 */

function Scene({ c, p }: { c: number; p: MotionValue<number> }) {
  const label = useTimelineCopy().v3.artLabel;
  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label}>
        <defs>
          <filter id="tl3-blur" x="-1" y="-1" width="3" height="3">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <pattern id="tl3-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill={FG} fillOpacity="0.16" />
          </pattern>
          <pattern id="tl3-check" width="11" height="11" patternUnits="userSpaceOnUse">
            <rect width="11" height="11" fill={BG} />
            <rect width="5.5" height="5.5" fill={FG} fillOpacity="0.8" />
            <rect x="5.5" y="5.5" width="5.5" height="5.5" fill={FG} fillOpacity="0.8" />
          </pattern>
          <radialGradient id="tl3-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.1" />
            <stop offset="1" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} fill="url(#tl3-glow)" />
        <Terrain />
        <Railway p={p} />
        <Route p={p} />
        <Train p={p} />
      </svg>
      <Labels c={c} p={p} />
    </motion.div>
  );
}

export default function HowLabTimelineV3() {
  const copy = useTimelineCopy();
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
      <ArtBox w={W} h={H} boxRef={ref}>
        <Scene key={index} c={index} p={p} />
        <StylisedTag className="bottom-[0.5%] right-[1%]" />
      </ArtBox>
      <p className="sr-only" role="status" aria-live="polite">
        {done ? fill(copy.v3.announce, { name: sc.name, snag: cs.snag, wait: cs.wait, result: cs.result }) : ""}
      </p>
    </SectionWrapper>
  );
}
