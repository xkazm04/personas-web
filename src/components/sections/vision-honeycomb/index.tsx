"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { TerminalPanel } from "@/components/primitives";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";
import { initialAgents, getHexPositions } from "./data";
import AnimatedCounter from "../vision-shared/AnimatedCounter";
import { useAgentTicker } from "../vision-shared/useAgentTicker";
import HiveCanvas from "./components/HiveCanvas";
import HoverDetail from "./components/HoverDetail";
import FleetStatusBar from "./components/FleetStatusBar";

export default function VisionHoneycomb() {
  const { agents, flashIdx } = useAgentTicker(initialAgents);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalExec = agents.reduce((s, a) => s + a.executions, 0);
  const hexPositions = useMemo(() => getHexPositions(), []);

  return (
    <SectionWrapper id="vision-honeycomb" className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="honeycomb-bg"
              x="0"
              y="0"
              width="56"
              height="100"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(1.5)"
            >
              <path d="M28 2 L50 16 L50 44 L28 58 L6 44 L6 16 Z" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M28 52 L50 66 L50 94 L28 108 L6 94 L6 66 Z" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0 27 L22 41 L22 69 L0 83 L-22 69 L-22 41 Z" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M56 27 L78 41 L78 69 L56 83 L34 69 L34 41 Z" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb-bg)" />
        </svg>
      </div>

      <SectionIntro
        heading="Your personal army of"
        gradient="AI specialists"
        descriptionMaxWidth="max-w-3xl"
        className="mb-14"
      />

      <motion.div variants={fadeUp} className="relative z-10 mx-auto max-w-2xl">
        <TerminalPanel
          header={
            <TerminalChrome
              title="hive-monitor"
              status="synced"
              info={
                <>
                  <AnimatedCounter value={totalExec} /> total exec
                </>
              }
              className="px-4 py-3 sm:px-5"
            />
          }
        >
          <HiveCanvas
            agents={agents}
            hexPositions={hexPositions}
            flashIdx={flashIdx}
            hoveredIdx={hoveredIdx}
            setHoveredIdx={setHoveredIdx}
          />

          <HoverDetail hoveredIdx={hoveredIdx} agents={agents} />
          <FleetStatusBar agents={agents} totalExec={totalExec} />
        </TerminalPanel>
      </motion.div>
    </SectionWrapper>
  );
}
