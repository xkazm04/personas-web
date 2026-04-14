"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { CYCLE_MS, MSG_INTERVAL_MS, scenarios } from "./data";

export function useChatSequence() {
  const prefersReduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [wfVisibleCount, setWfVisibleCount] = useState(0);
  const [agVisibleCount, setAgVisibleCount] = useState(0);
  const [wfTyping, setWfTyping] = useState(false);
  const [agTyping, setAgTyping] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
  }, []);

  const playScenario = useCallback(() => {
    clearAllTimers();
    setWfVisibleCount(0);
    setAgVisibleCount(0);
    setWfTyping(false);
    setAgTyping(false);
    setShowSatisfaction(false);

    const currentScenario = scenarios[activeIndex];
    const wfMsgs = currentScenario.workflow.messages;
    const agMsgs = currentScenario.agent.messages;
    const interval = prefersReduced ? 200 : MSG_INTERVAL_MS;

    wfMsgs.forEach((_, i) => {
      const typingTimer = setTimeout(() => {
        setWfTyping(true);
      }, i * interval);
      timerRefs.current.push(typingTimer);

      const msgTimer = setTimeout(() => {
        setWfTyping(false);
        setWfVisibleCount(i + 1);
      }, i * interval + interval * 0.6);
      timerRefs.current.push(msgTimer);
    });

    agMsgs.forEach((_, i) => {
      const typingTimer = setTimeout(() => {
        setAgTyping(true);
      }, i * interval);
      timerRefs.current.push(typingTimer);

      const msgTimer = setTimeout(() => {
        setAgTyping(false);
        setAgVisibleCount(i + 1);
      }, i * interval + interval * 0.6);
      timerRefs.current.push(msgTimer);
    });

    const maxMsgs = Math.max(wfMsgs.length, agMsgs.length);
    const satTimer = setTimeout(() => {
      setShowSatisfaction(true);
    }, maxMsgs * interval + 400);
    timerRefs.current.push(satTimer);
  }, [activeIndex, prefersReduced, clearAllTimers]);

  useEffect(() => {
    queueMicrotask(() => playScenario());
  }, [activeIndex, playScenario]);

  useEffect(() => {
    if (paused || hovered) return;
    cycleTimerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % scenarios.length);
    }, CYCLE_MS);
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    };
  }, [activeIndex, paused, hovered]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return {
    activeIndex,
    setActiveIndex,
    wfVisibleCount,
    agVisibleCount,
    wfTyping,
    agTyping,
    showSatisfaction,
    paused,
    setPaused,
    hovered,
    setHovered,
  };
}
