"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { tools, AUTOPLAY_INTERVAL } from "./data";

export function useToolSelection(initiallyAutoplay: boolean) {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<string>(tools[0].id);
  const [autoplay, setAutoplay] = useState(initiallyAutoplay && !reduced);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const userClickedRef = useRef(false);
  const progressRef = useRef(0);
  const rafStartRef = useRef<number | null>(null);

  const desktopButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const advanceToNext = useCallback(() => {
    setSelected((prev) => {
      const idx = tools.findIndex((tl) => tl.id === prev);
      return tools[(idx + 1) % tools.length].id;
    });
    setProgress(0);
    progressRef.current = 0;
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    rafStartRef.current = null;
    let rafId: number;

    const frame = (timestamp: number) => {
      if (document.hidden) {
        rafId = requestAnimationFrame(frame);
        return;
      }
      if (rafStartRef.current === null) rafStartRef.current = timestamp;
      const elapsed = timestamp - rafStartRef.current;
      const pct = Math.min(elapsed / AUTOPLAY_INTERVAL, 1);

      if (Math.abs(pct - progressRef.current) >= 0.01 || pct >= 1) {
        progressRef.current = pct;
        setProgress(pct);
      }

      if (pct >= 1) {
        advanceToNext();
      } else {
        rafId = requestAnimationFrame(frame);
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [autoplay, selected, advanceToNext]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const handleManualClick = useCallback((toolId: string) => {
    if (!userClickedRef.current) {
      userClickedRef.current = true;
      setAutoplay(false);
    }
    setSelected(toolId);
    setProgress(0);
    progressRef.current = 0;
  }, []);

  const handleToolbarKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIdx = tools.findIndex((tl) => tl.id === selected);
      let nextIdx: number | null = null;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIdx = (currentIdx + 1) % tools.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIdx = (currentIdx - 1 + tools.length) % tools.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIdx = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIdx = tools.length - 1;
      } else if (e.key === "Escape") {
        e.preventDefault();
        setAutoplay(true);
        userClickedRef.current = false;
        setProgress(0);
        progressRef.current = 0;
        return;
      }

      if (nextIdx !== null) {
        const nextId = tools[nextIdx].id;
        handleManualClick(nextId);
        const btn = isMobile ? mobileButtonRefs.current[nextId] : desktopButtonRefs.current[nextId];
        btn?.focus();
      }
    },
    [selected, isMobile, handleManualClick],
  );

  return {
    selected,
    autoplay,
    progress,
    isMobile,
    desktopButtonRefs,
    mobileButtonRefs,
    handleManualClick,
    handleToolbarKeyDown,
  };
}
