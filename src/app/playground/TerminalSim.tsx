"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import TerminalChrome from "@/components/TerminalChrome";
import { TerminalPanel } from "@/components/primitives";
import { LINE_COLORS, LINE_ICONS, PROMPTS, type OutputLine } from "./data";

interface TerminalSimProps {
  active: number | null;
  onReset: () => void;
}

export default function TerminalSim({ active, onReset }: TerminalSimProps) {
  const prefersReducedMotion = useReducedMotion();
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [prevActive, setPrevActive] = useState(active);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  if (active !== prevActive) {
    setPrevActive(active);
    setLines([]);
    setIsRunning(active !== null);
    setIsDone(false);
  }

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const scrollTerminal = useCallback(() => {
    if (!terminalRef.current) return;
    if (prefersReducedMotion) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    } else {
      requestAnimationFrame(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      });
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    clearTimeouts();
    if (active === null) return;

    const promptLines = PROMPTS[active].lines;
    let cumulative = 0;
    promptLines.forEach((line, i) => {
      const delay =
        line.type === "info" && line.text === "" ? 100 : 250 + Math.random() * 150;
      cumulative += delay;
      const t = setTimeout(() => {
        setLines((prev) => [...prev, line]);
        scrollTerminal();
        if (i === promptLines.length - 1) {
          setIsRunning(false);
          setIsDone(true);
        }
      }, cumulative);
      timeoutsRef.current.push(t);
    });

    return clearTimeouts;
  }, [active, clearTimeouts, scrollTerminal]);

  const handleReset = () => {
    clearTimeouts();
    onReset();
  };

  const status = isRunning ? "executing..." : isDone ? "complete" : "ready";

  return (
    <TerminalPanel
      shadow="hero"
      header={
        <TerminalChrome
          title="agent-playground — live"
          status={status}
          className="px-4 py-3 sm:px-5"
        />
      }
      footer={
        <>
          <span className="text-base font-mono text-muted-dark uppercase tracking-wider">
            Simulated execution
          </span>
          {isDone && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-base font-mono text-muted-dark hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </>
      }
    >
      <div
        ref={terminalRef}
        className="h-[320px] overflow-y-auto px-4 py-4 sm:px-5 scrollbar-hide"
      >
        {active === null && (
          <div className="flex h-full items-center justify-center">
            <p className="text-base text-muted-dark font-mono text-center">
              Select a task above to start the simulation
            </p>
          </div>
        )}

        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`font-mono text-base leading-relaxed ${LINE_COLORS[line.type]}`}
              style={{
                paddingLeft: line.indent ? `${line.indent * 12}px` : undefined,
              }}
            >
              {line.text ? `${LINE_ICONS[line.type]} ${line.text}` : "\u00A0"}
            </motion.div>
          ))}
        </AnimatePresence>

        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mt-1 font-mono text-base text-brand-cyan/80"
          >
            _
          </motion.div>
        )}
      </div>
    </TerminalPanel>
  );
}
