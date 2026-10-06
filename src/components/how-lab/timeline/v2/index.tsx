"use client";

import { useRef } from "react";
import { motion, type MotionValue } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { ArtBox, Intro, ReplayButton, ScenarioChips, StylisedTag, useTimelineCopy } from "../shared/Frame";
import { AGENT, CYAN, FG, RULES, fill, mix, useStory } from "../shared/motion";
import { DONE, DURATION, H, TRAY, W } from "./data";
import Plate from "./Plate";
import { AgentPieces, DoneRow, RulesCluster } from "./Pieces";
import Cards from "./Cards";

/**
 * How lab - timeline v2, "Doesn't fit the rules": a shape sorter. Your
 * systems are the holes in the plate; a real request arrives as a cluster of
 * shapes. Fixed rules shove the whole cluster at one hole, then another, jam,
 * and park it in the waiting tray. Then the same request goes to an agent: it
 * reads the cluster, drops the part nobody needs, and seats each piece in a
 * hole that was there all along. Four scenarios advance on their own; reduced
 * motion shows each finished.
 */

function Scene({ c, p }: { c: number; p: MotionValue<number> }) {
  const label = useTimelineCopy().v2.artLabel;
  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label}>
        <defs>
          <filter id="tl2-blur" x="-0.5" y="-0.5" width="2" height="2">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <linearGradient id="tl2-plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={FG} stopOpacity="0.13" />
            <stop offset="1" stopColor={FG} stopOpacity="0.06" />
          </linearGradient>
          <radialGradient id="tl2-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.14" />
            <stop offset="1" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={620} cy={300} rx={420} ry={240} fill="url(#tl2-glow)" />
        <rect x={TRAY.x} y={TRAY.y} width={TRAY.w} height={TRAY.h} rx={20} fill={mix(RULES, 6)} stroke={mix(RULES, 40)} strokeWidth={1.5} strokeDasharray="6 6" />
        <rect x={TRAY.x + 16} y={TRAY.y + TRAY.h - 24} width={TRAY.w - 32} height={8} rx={4} fill={mix(RULES, 14)} />
        <rect x={DONE.x} y={DONE.y} width={DONE.w} height={DONE.h} rx={20} fill={mix(AGENT, 7)} stroke={mix(AGENT, 45)} strokeWidth={1.5} />
        <Plate c={c} p={p} />
        <RulesCluster c={c} p={p} />
        <AgentPieces c={c} p={p} />
        <DoneRow c={c} p={p} />
      </svg>
      <Cards c={c} p={p} />
    </motion.div>
  );
}

export default function HowLabTimelineV2() {
  const copy = useTimelineCopy();
  const ref = useRef<HTMLDivElement>(null);
  const cases = copy.v2.cases;
  const { p, index, choose, replay, done, still } = useStory(ref, cases.length, () => DURATION, { hold: 3.5 });
  const cs = cases[index];
  const name = copy.scenarios[cs.scenario].name;

  return (
    <SectionWrapper fit="fill" id="agents-timeline">
      <Intro lede={copy.v2.lede} />
      <ScenarioChips names={cases.map((k) => copy.scenarios[k.scenario].name)} index={index} onPick={choose} progress={p}>
        <span aria-hidden className="mx-1 hidden h-6 w-px bg-glass-hover sm:block" />
        <ReplayButton onClick={replay} disabled={still} />
      </ScenarioChips>
      <ArtBox w={W} h={H} boxRef={ref}>
        <Scene key={index} c={index} p={p} />
        <StylisedTag className="bottom-[0.5%] left-[1.5%]" />
      </ArtBox>
      <p className="sr-only" role="status" aria-live="polite">
        {done ? fill(copy.v2.announce, { name, wait: cs.wait, result: cs.result }) : ""}
      </p>
    </SectionWrapper>
  );
}
