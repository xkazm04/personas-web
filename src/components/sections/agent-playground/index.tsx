"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { TerminalPanel } from "@/components/primitives";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";
import { tint } from "@/lib/brand-theme";
import type { SimLine } from "./types";
import { examples } from "./data";
import ExampleChips from "./components/ExampleChips";
import PlaygroundForm from "./components/PlaygroundForm";
import PlaygroundTerminal from "./components/PlaygroundTerminal";

export default function AgentPlayground() {
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [visibleLines, setVisibleLines] = useState<SimLine[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const terminalRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const scrollTerminal = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  const runSimulation = useCallback(
    (lines: SimLine[]) => {
      clearTimeouts();
      setVisibleLines([]);
      setIsRunning(true);
      setPhase("running");

      let cumulative = 0;
      lines.forEach((line, i) => {
        cumulative += line.delay;
        const t = setTimeout(() => {
          setVisibleLines((prev) => [...prev, line]);
          requestAnimationFrame(scrollTerminal);
          if (i === lines.length - 1) {
            setIsRunning(false);
            setPhase("done");
          }
        }, cumulative);
        timeoutsRef.current.push(t);
      });
    },
    [clearTimeouts, scrollTerminal],
  );

  const handleExampleClick = useCallback(
    (idx: number) => {
      if (isRunning) return;
      setActiveExample(idx);
      setInputValue(examples[idx].prompt);
      runSimulation(examples[idx].lines);
    },
    [isRunning, runSimulation],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isRunning || !inputValue.trim()) return;
      const match = examples.findIndex((ex) =>
        inputValue.toLowerCase().includes(ex.label.toLowerCase().split(" ")[0]),
      );
      const idx = match >= 0 ? match : 0;
      setActiveExample(idx);
      runSimulation(examples[idx].lines);
    },
    [isRunning, inputValue, runSimulation],
  );

  const handleReset = useCallback(() => {
    clearTimeouts();
    setActiveExample(null);
    setInputValue("");
    setVisibleLines([]);
    setIsRunning(false);
    setPhase("idle");
  }, [clearTimeouts]);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  return (
    <SectionWrapper id="playground">
      <SectionIntro
        heading="Try it"
        gradient="right now"
        description="Type a natural-language instruction or pick an example to see how a Personas agent parses, plans, and executes."
      />

      <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
        <ExampleChips activeExample={activeExample} isRunning={isRunning} onClick={handleExampleClick} />

        <TerminalPanel
          header={
            <TerminalChrome
              title="agent-playground"
              status={phase === "running" ? "executing" : phase === "done" ? "complete" : "ready"}
              className="px-4 py-3 sm:px-5"
            />
          }
          footer={
            <>
              <span className="text-base font-mono tracking-wider uppercase text-muted-dark">
                Simulated execution
              </span>
              {phase === "done" && (
                <span className="text-base font-mono tracking-wider uppercase" style={{ color: tint("emerald", 60) }}>
                  execution complete
                </span>
              )}
            </>
          }
        >
          <PlaygroundForm
            inputValue={inputValue}
            setInputValue={setInputValue}
            isRunning={isRunning}
            phase={phase}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />

          <PlaygroundTerminal ref={terminalRef} phase={phase} visibleLines={visibleLines} isRunning={isRunning} />
        </TerminalPanel>
      </motion.div>
    </SectionWrapper>
  );
}
