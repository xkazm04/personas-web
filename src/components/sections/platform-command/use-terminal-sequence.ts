"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { commands, getTypingDelay } from "./data";
import type { OutputLine, TerminalPhase } from "./types";

export function useTerminalSequence(
  terminalRef: React.RefObject<HTMLDivElement | null>
) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(terminalRef, { once: false, margin: "-100px" });

  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [history, setHistory] = useState<
    Array<{ command: string; output: OutputLine[] }>
  >([]);
  const [phase, setPhase] = useState<TerminalPhase>("idle");
  const [showSummary, setShowSummary] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isInView && phase === "idle") {
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) setPhase("typing");
      }, 600);
    }
  }, [isInView, phase]);

  useEffect(() => {
    if (phase !== "typing" || !isActiveRef.current) return;

    const cmd = commands[currentCommandIndex];
    if (!cmd) return;

    const fullText = cmd.command;

    if (prefersReducedMotion) {
      queueMicrotask(() => {
        setTypedText(fullText);
        setPhase("output");
      });
      return;
    }

    if (typedText.length < fullText.length) {
      const delay = getTypingDelay();
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }
      }, delay);
    } else {
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) setPhase("output");
      }, 300);
    }
  }, [phase, typedText, currentCommandIndex, prefersReducedMotion]);

  const advanceToNext = useCallback(() => {
    const cmd = commands[currentCommandIndex];

    setHistory((prev) => [
      ...prev,
      { command: cmd.command, output: [...(outputLines.length > 0 ? outputLines : cmd.output)] },
    ]);

    setTypedText("");
    setOutputLines([]);

    if (currentCommandIndex < commands.length - 1) {
      setCurrentCommandIndex((prev) => prev + 1);
      setPhase("typing");
    } else {
      setPhase("summary");
    }
  }, [currentCommandIndex, outputLines]);

  const skipCommand = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const cmd = commands[currentCommandIndex];
    if (!cmd) return;

    if (phase === "typing" || phase === "output") {
      setHistory((prev) => [...prev, { command: cmd.command, output: cmd.output }]);
      setTypedText("");
      setOutputLines([]);

      if (currentCommandIndex < commands.length - 1) {
        setCurrentCommandIndex((prev) => prev + 1);
        setPhase("typing");
      } else {
        setPhase("summary");
      }
    }
  }, [phase, currentCommandIndex]);

  const restart = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentCommandIndex(0);
    setTypedText("");
    setOutputLines([]);
    setHistory([]);
    setShowSummary(false);
    setPhase("typing");
  }, []);

  useEffect(() => {
    if (phase !== "output" || !isActiveRef.current) return;

    const cmd = commands[currentCommandIndex];
    if (!cmd) return;

    if (prefersReducedMotion) {
      queueMicrotask(() => setOutputLines(cmd.output));
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) advanceToNext();
      }, 800);
      return;
    }

    if (outputLines.length < cmd.output.length) {
      const nextLine = cmd.output[outputLines.length];
      const delay = nextLine.delay ?? 60;
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) {
          setOutputLines((prev) => [...prev, nextLine]);
        }
      }, delay);
    } else {
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) advanceToNext();
      }, 1200);
    }
  }, [phase, outputLines, currentCommandIndex, prefersReducedMotion, advanceToNext]);

  useEffect(() => {
    if (phase !== "summary" || !isActiveRef.current) return;

    queueMicrotask(() => setShowSummary(true));

    timeoutRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        setPhase("done");
        timeoutRef.current = setTimeout(() => {
          if (isActiveRef.current) restart();
        }, 4000);
      }
    }, 3000);
  }, [phase, restart]);

  return {
    currentCommandIndex,
    typedText,
    outputLines,
    history,
    phase,
    showSummary,
    skipCommand,
    restart,
  };
}
