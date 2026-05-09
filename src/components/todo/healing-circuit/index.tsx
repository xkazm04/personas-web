"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { staggerContainer } from "@/lib/animations";
import { connections, getPathMidpoint } from "./data";
import { useHealingCycle } from "./useHealingCycle";
import CircuitHeader from "./components/CircuitHeader";
import CircuitBoard from "./components/CircuitBoard";
import StatusPanel from "./components/StatusPanel";
import StageDescription from "./components/StageDescription";
import StageTimeline from "./components/StageTimeline";

export default function HealingCircuit() {
  const {
    activeStage,
    brokenConnectionId,
    cycleIndex,
    getConnectionStatus,
    getNodeStatus,
  } = useHealingCycle();

  const brokenConn = connections.find((c) => c.id === brokenConnectionId);
  const breakPoint = brokenConn
    ? getPathMidpoint(brokenConn.path)
    : { x: 0, y: 0 };

  return (
    <SectionWrapper id="healing-circuit" className="relative overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="relative z-10"
      >
        <SectionIntro
          heading="Fixes itself when things"
          gradient="break"
          description="When something goes wrong, your agents don't just stop — they figure out what happened, fix it, and keep going. No 3 AM alerts, no manual restarts."
          descriptionMaxWidth="max-w-xl"
          className="mb-0"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 mx-auto max-w-4xl relative z-10"
      >
        <div className="force-dark rounded-2xl border border-foreground/8 bg-background/85 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
          <CircuitHeader activeStage={activeStage} cycleIndex={cycleIndex} />

          <div className="flex flex-col lg:flex-row">
            <CircuitBoard
              getConnectionStatus={getConnectionStatus}
              getNodeStatus={getNodeStatus}
              brokenConnectionId={brokenConnectionId}
              breakPoint={breakPoint}
            />
            <StatusPanel getConnectionStatus={getConnectionStatus} />
          </div>

          <StageDescription activeStage={activeStage} />

          <StageTimeline
            activeStage={activeStage}
            getConnectionStatus={getConnectionStatus}
          />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
