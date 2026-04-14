"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { colorClasses, commands, summaryLines } from "./data";
import { useTerminalSequence } from "./use-terminal-sequence";
import BlinkingCursor from "./components/BlinkingCursor";
import CommandBadge from "./components/CommandBadge";
import TerminalBackground from "./components/TerminalBackground";
import TerminalControls from "./components/TerminalControls";
import TerminalHistory from "./components/TerminalHistory";
import TerminalLine from "./components/TerminalLine";

export default function PlatformCommand() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    currentCommandIndex,
    typedText,
    outputLines,
    history,
    phase,
    showSummary,
    skipCommand,
    restart,
  } = useTerminalSequence(terminalRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [typedText, outputLines, history, showSummary]);

  const currentCmd = commands[currentCommandIndex];
  const completedCount = history.length;

  return (
    <SectionWrapper id="platform-command" dotGrid>
      <TerminalBackground />

      <SectionIntro
        eyebrow="CLI"
        heading="One"
        gradient="command"
        trailing=" at a time"
        description="Design, connect, deploy, and monitor your agents — all from the terminal."
        className="mb-16"
      />

      <motion.div
        variants={fadeUp}
        className="flex flex-wrap justify-center gap-2 mb-8"
      >
        {commands.map((cmd, i) => (
          <motion.div
            key={cmd.pillar}
            animate={{
              opacity: i <= currentCommandIndex || showSummary ? 1 : 0.3,
              scale: i === currentCommandIndex && !showSummary ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <CommandBadge command={cmd} index={i} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div ref={terminalRef} variants={fadeUp} className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-md shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="px-4 py-3">
            <TerminalChrome
              title="personas-cli"
              status="active"
              info={
                <span className="text-muted-dark">
                  {completedCount}/{commands.length} complete
                </span>
              }
            />
          </div>

          <div
            ref={scrollRef}
            className="px-4 sm:px-6 pb-6 pt-2 max-h-[480px] overflow-y-auto scroll-smooth"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.1) transparent",
            }}
          >
            <TerminalHistory history={history} />

            {phase !== "idle" && phase !== "done" && phase !== "summary" && currentCmd && (
              <div className="mb-2">
                <div className="font-mono text-base">
                  <span className="text-muted-dark">~/agents $ </span>
                  <span className="text-muted">{typedText}</span>
                  {phase === "typing" && <BlinkingCursor />}
                </div>

                <AnimatePresence>
                  {outputLines.map((line, lIdx) => (
                    <TerminalLine key={lIdx} line={line} index={lIdx} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            <AnimatePresence>
              {showSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4"
                >
                  {summaryLines.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      className={`font-mono text-base leading-relaxed ${colorClasses[line.color]}`}
                      style={{ whiteSpace: "pre" }}
                    >
                      {line.text || "\u00A0"}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {(phase === "done" || (phase === "summary" && showSummary)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 font-mono text-base"
              >
                <span className="text-muted-dark">~/agents $ </span>
                <BlinkingCursor />
              </motion.div>
            )}
          </div>

          <TerminalControls
            phase={phase}
            showSummary={showSummary}
            currentCommandIndex={currentCommandIndex}
            completedCount={completedCount}
            onSkip={skipCommand}
            onRestart={restart}
          />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
