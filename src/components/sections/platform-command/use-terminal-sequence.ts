"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { commands, getTypingDelay } from "./data";
import type { OutputLine, TerminalPhase } from "./types";

/* ── Phase machine ────────────────────────────────────────────────────
 *
 *           in-view? ─ no ─→ stays idle
 *              │
 *             yes (after 600ms warm-up)
 *              ↓
 *   ┌──→  typing  ─ per-char setTimeout, advances typedText
 *   │       │
 *   │      done typing (or reduced-motion: instant)
 *   │       ↓
 *   │     output  ─ per-line setTimeout, advances outputLines
 *   │       │
 *   │      done outputting → advanceToNext()
 *   │       │
 *   │       ├─ more commands? ─→ typing  (next command)
 *   │       └─ last command   ─→ summary
 *   │                              │
 *   │                          show summary lines, wait 3s
 *   │                              ↓
 *   │                            done   (cursor blink)
 *   │                              │
 *   │                          wait 4s
 *   │                              ↓
 *   └─────────────────────── restart() resets everything
 *
 * Cleanup: every setTimeout is parked in timeoutRef so it can be
 * cleared on unmount, on Skip, or on Restart. isActiveRef is a mount
 * guard so a setTimeout that fires after unmount doesn't call setState.
 *
 * Skip jumps the current command straight to "fully output" without
 * waiting for the typing/output timers; behavior matches normal
 * advancement otherwise.
 *
 * NOTE (deferred follow-up): the state machine is spread across 4
 * useEffect blocks plus 3 callbacks. A pure reducer + thin hook would
 * isolate the transitions so they could be unit-tested. Deferred
 * because (a) the project has no unit-test runner configured today
 * (only Playwright e2e), so the "testability win" wouldn't be realized
 * immediately, and (b) any rewrite of this state machine carries
 * behavioral risk that needs visual verification. See harness finding
 * platform-showcase.md #7 when a test runner is added.
 * ───────────────────────────────────────────────────────────────────── */

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

  /* ── Mount guard + timeout cleanup on unmount ────────────────────── */
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /* ── idle → typing  (warm-up after the section enters viewport) ──── */
  useEffect(() => {
    if (isInView && phase === "idle") {
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) setPhase("typing");
      }, 600);
    }
  }, [isInView, phase]);

  /* ── typing phase: advance typedText one char at a time ──────────── */
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

  /* ── advanceToNext: snapshot current command into history, then
        either move to the next typing cycle or transition to summary */
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

  /* ── Skip: jumps the current command to its full output and advances */
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

  /* ── Restart: reset to first command, clear history and summary ──── */
  const restart = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentCommandIndex(0);
    setTypedText("");
    setOutputLines([]);
    setHistory([]);
    setShowSummary(false);
    setPhase("typing");
  }, []);

  /* ── output phase: append output lines one at a time ─────────────── */
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

  /* ── summary → done → restart cycle ──────────────────────────────── */
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
