"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useCallback, useState } from "react";
import TerminalChrome from "@/components/TerminalChrome";
import { BlinkingCursor, TerminalPanel } from "@/components/primitives";
import { useTranslation } from "@/i18n/useTranslation";
import { LINE_COLORS, LINE_ICONS, PROMPTS, type OutputLine } from "./data";

interface TerminalSimProps {
  active: number | null;
  onReset: () => void;
}

function ElapsedDisplay({ ms, reduced }: { ms: number; reduced: boolean }) {
  const display = (ms / 1000).toFixed(1);
  const dot = display.indexOf(".");
  const whole = display.slice(0, dot);
  const frac = display.slice(dot);

  return (
    <span className="font-mono tabular-nums" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={whole}
          initial={reduced ? {} : { scale: 1.25, opacity: 0.55 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{ display: "inline-block" }}
        >
          {whole}
        </motion.span>
      </AnimatePresence>
      <span>{frac}s</span>
    </span>
  );
}

export default function TerminalSim({ active, onReset }: TerminalSimProps) {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [prevActive, setPrevActive] = useState(active);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  if (active !== prevActive) {
    setPrevActive(active);
    setLines([]);
    setIsRunning(active !== null);
    setIsDone(false);
    setElapsed(0);
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

    const runStart = Date.now();
    const timerId = setInterval(() => {
      setElapsed(Date.now() - runStart);
    }, 100);

    const promptLines = PROMPTS[active].lines;
    let cumulative = 0;
    promptLines.forEach((line, i) => {
      const delay =
        line.type === "info" && line.text === "" ? 100 : 250 + Math.random() * 150;
      cumulative += delay;
      const tid = setTimeout(() => {
        setLines((prev) => [...prev, line]);
        scrollTerminal();
        if (i === promptLines.length - 1) {
          clearInterval(timerId);
          setIsRunning(false);
          setIsDone(true);
        }
      }, cumulative);
      timeoutsRef.current.push(tid);
    });

    return () => {
      clearTimeouts();
      clearInterval(timerId);
    };
  }, [active, clearTimeouts, scrollTerminal]);

  const handleReset = () => {
    clearTimeouts();
    onReset();
  };

  const pg = t.playgroundPage;
  const status = isRunning ? pg.statusExecuting : isDone ? pg.statusComplete : pg.statusReady;
  const elapsedNode =
    elapsed > 0 ? (
      <ElapsedDisplay ms={elapsed} reduced={prefersReducedMotion ?? false} />
    ) : undefined;

  return (
    <TerminalPanel
      shadow="hero"
      header={
        <TerminalChrome
          title={pg.chromeTitle}
          status={status}
          info={elapsedNode}
          className="px-4 py-3 sm:px-5"
        />
      }
      footer={
        <>
          <span className="text-base font-mono text-muted-dark uppercase tracking-wider">
            {pg.simulatedExecution}
          </span>
          {isDone && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-base font-mono text-muted-dark hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              {pg.reset}
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
              {pg.selectTask}
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
              {line.text ? `${LINE_ICONS[line.type]} ${line.text}` : " "}
            </motion.div>
          ))}
        </AnimatePresence>

        {isRunning && (
          <div className="mt-1">
            <BlinkingCursor />
          </div>
        )}
      </div>
    </TerminalPanel>
  );
}
