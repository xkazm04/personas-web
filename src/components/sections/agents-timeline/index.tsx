"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import SectionIntro from "@/components/primitives/SectionIntro";
import { ThemedChip } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { ANIMATION_DURATION_MS, CYCLE_MS, scenarios } from "./data";
import TimelineControls from "./components/TimelineControls";
import { ScenarioTrigger } from "./components/ScenarioTrigger";
import { TimelineRaceBody } from "./components/TimelineRaceBody";

export default function AgentsTimeline() {
  const prefersReduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [paused, setPaused] = useState(false);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // For pause/resume of the in-flight race: when the current run started and how
  // much of ANIMATION_DURATION_MS is still owed. Lets a pause freeze the result
  // reveal (instead of it slamming in after 4s regardless) and resume finish it.
  const raceStartRef = useRef(0);
  const remainingRef = useRef(ANIMATION_DURATION_MS);

  const scenario = scenarios[activeIndex];

  const startAnimation = useCallback(() => {
    setIsPlaying(true);
    setShowResults(false);
    remainingRef.current = ANIMATION_DURATION_MS;
    raceStartRef.current = Date.now();

    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      setShowResults(true);
      setIsPlaying(false);
    }, ANIMATION_DURATION_MS);
  }, []);

  // Make `paused` actually hold the race's result reveal. Pausing (hover or the
  // Pause control) banks the remaining time and clears the result timer so
  // results never appear while paused; resuming re-arms it for the banked
  // remainder so the run completes — fixing both the "result slams in while
  // paused" and the "Resume does nothing to the finished race" bugs.
  useEffect(() => {
    if (!isPlaying) return;
    if (paused) {
      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
        resultTimerRef.current = null;
        remainingRef.current = Math.max(
          0,
          remainingRef.current - (Date.now() - raceStartRef.current),
        );
      }
    } else {
      raceStartRef.current = Date.now();
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      resultTimerRef.current = setTimeout(() => {
        setShowResults(true);
        setIsPlaying(false);
      }, remainingRef.current);
    }
  }, [paused, isPlaying]);

  const advanceScenario = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % scenarios.length);
  }, []);

  useEffect(() => {
    queueMicrotask(() => startAnimation());
  }, [activeIndex, startAnimation]);

  useEffect(() => {
    if (paused || prefersReduced) return;
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    cycleTimerRef.current = setTimeout(() => {
      advanceScenario();
    }, CYCLE_MS);
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    };
  }, [activeIndex, paused, prefersReduced, advanceScenario]);

  useEffect(() => {
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, []);

  return (
    <SectionWrapper
      id="agents-timeline"
      aria-label="Agents vs Workflows racing timeline comparison"
    >
      <SectionIntro
        heading="The"
        gradient="Race"
        trailing=" Is Already Over"
        description="See what happens when a rigid system meets a real-world problem — and how an intelligent agent handles it instead."
        className="mb-14"
      />

      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {scenarios.map((s, i) => (
          <ThemedChip
            key={s.id}
            active={i === activeIndex}
            onClick={() => {
              setActiveIndex(i);
              setPaused(true);
            }}
            size="sm"
            mono
          >
            {s.name}
          </ThemedChip>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="mb-8">
        <ScenarioTrigger id={scenario.id} trigger={scenario.trigger} />
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-glass bg-white/[0.02] backdrop-blur-lg overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <TerminalChrome
          title="agents-vs-workflows.race"
          status={isPlaying ? "racing" : showResults ? "complete" : "ready"}
          info={
            <span className="text-base font-mono text-muted-dark">
              scenario {activeIndex + 1}/{scenarios.length}
            </span>
          }
          className="px-4 py-2.5"
        />

        <TimelineRaceBody scenario={scenario} isPlaying={isPlaying} showResults={showResults} />
      </motion.div>

      <TimelineControls
        activeIndex={activeIndex}
        paused={paused}
        onSelect={(i) => {
          setActiveIndex(i);
          setPaused(true);
        }}
        onReplay={() => startAnimation()}
        onTogglePause={() => setPaused((v) => !v)}
      />

      {/* The race outcome is otherwise conveyed only by visual reveals; announce
          it to assistive tech when results land. */}
      <p className="sr-only" role="status" aria-live="polite">
        {showResults
          ? `${scenario.name}: workflow ${scenario.workflow.result}; agent ${scenario.agent.result}.`
          : ""}
      </p>
    </SectionWrapper>
  );
}
