"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

export type QualityTier = "high" | "medium" | "low";

interface QualityState {
  tier: QualityTier;
  reducedMotion: boolean;
  canHover: boolean;
}

const QualityContext = createContext<QualityState>({
  tier: "high",
  reducedMotion: false,
  canHover: true,
});

/** Number of frame samples per evaluation window (~2 s at 60 fps). */
const WINDOW_SIZE = 120;
/** p90 frame-time thresholds in milliseconds. */
const DOWNGRADE_MS = 20; // above this → drop a tier
const UPGRADE_MS = 17;   // below this → eligible to upgrade
/** Consecutive passing windows required before upgrading (prevents oscillation). */
const UPGRADE_PASSES_REQUIRED = 3;
/** Stop measuring after this many seconds to save overhead once tier is stable. */
const SETTLE_TIMEOUT_MS = 15_000;
/** Fallback delay if requestIdleCallback is unavailable. */
const IDLE_FALLBACK_MS = 2_000;

function percentile90(sorted: Float64Array, len: number): number {
  const idx = Math.floor(len * 0.9);
  return sorted[Math.min(idx, len - 1)];
}

export function QualityProvider({ children }: { children: ReactNode }) {
  const framerReduced = useReducedMotion();
  const [tier, setTier] = useState<QualityTier>("high");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const tierRef = useRef<QualityTier>("high");
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const samplesRef = useRef(new Float64Array(WINDOW_SIZE));
  const sampleIdxRef = useRef(0);
  const upgradePassesRef = useRef(0);
  const settledRef = useRef(false);

  useEffect(() => {
    // Skip measurement in SSR or when reduced-motion is preferred
    if (typeof window === "undefined") return;
    if (framerReduced) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let startTime = 0;

    const tick = (now: number) => {
      if (startTime === 0) startTime = now;
      if (settledRef.current) return;

      const prev = lastFrameRef.current;
      lastFrameRef.current = now;

      if (prev > 0) {
        const dt = now - prev;
        const idx = sampleIdxRef.current;
        samplesRef.current[idx % WINDOW_SIZE] = dt;
        sampleIdxRef.current = idx + 1;

        // Evaluate every full window
        if (sampleIdxRef.current >= WINDOW_SIZE && sampleIdxRef.current % WINDOW_SIZE === 0) {
          evaluate();
        }
      }

      // Auto-settle after timeout
      if (now - startTime > SETTLE_TIMEOUT_MS) {
        settledRef.current = true;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const evaluate = () => {
      const len = Math.min(sampleIdxRef.current, WINDOW_SIZE);
      // Copy and sort for percentile calculation
      const sorted = samplesRef.current.slice(0, len).sort();
      const p90 = percentile90(sorted, len);

      const current = tierRef.current;

      if (p90 > DOWNGRADE_MS) {
        // Downgrade immediately
        upgradePassesRef.current = 0;
        const next: QualityTier = current === "high" ? "medium" : "low";
        if (next !== current) {
          tierRef.current = next;
          setTier(next);
        }
      } else if (p90 < UPGRADE_MS && current !== "high") {
        // Accumulate upgrade evidence
        upgradePassesRef.current += 1;
        if (upgradePassesRef.current >= UPGRADE_PASSES_REQUIRED) {
          upgradePassesRef.current = 0;
          const next: QualityTier = current === "low" ? "medium" : "high";
          tierRef.current = next;
          setTier(next);
        }
      } else {
        // In the dead zone — reset upgrade counter to prevent false upgrades
        upgradePassesRef.current = 0;
      }
    };

    // Defer measurement until the browser is idle so we don't compete
    // with critical rendering (LCP, FID) during initial page load.
    let idleHandle: number | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    const startMeasuring = () => {
      if (idleHandle !== undefined) {
        cancelIdleCallback(idleHandle);
        idleHandle = undefined;
      }
      if (fallbackTimer !== undefined) {
        clearTimeout(fallbackTimer);
        fallbackTimer = undefined;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    if (typeof requestIdleCallback === "function") {
      idleHandle = requestIdleCallback(startMeasuring);
      // Fallback in case idle callback is heavily delayed
      fallbackTimer = setTimeout(startMeasuring, IDLE_FALLBACK_MS);
    } else {
      fallbackTimer = setTimeout(startMeasuring, IDLE_FALLBACK_MS);
    }

    return () => {
      if (idleHandle !== undefined) cancelIdleCallback(idleHandle);
      if (fallbackTimer !== undefined) clearTimeout(fallbackTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [framerReduced]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverQuery = window.matchMedia("(hover: hover)");

    const applyReducedMotion = () => setReducedMotion(reducedMotionQuery.matches);
    const applyCanHover = () => setCanHover(hoverQuery.matches);

    applyReducedMotion();
    applyCanHover();

    reducedMotionQuery.addEventListener("change", applyReducedMotion);
    hoverQuery.addEventListener("change", applyCanHover);

    return () => {
      reducedMotionQuery.removeEventListener("change", applyReducedMotion);
      hoverQuery.removeEventListener("change", applyCanHover);
    };
  }, []);

  return (
    <QualityContext.Provider value={{ tier, reducedMotion, canHover }}>
      {children}
    </QualityContext.Provider>
  );
}

export function useQualityTier(): QualityTier {
  return useContext(QualityContext).tier;
}

export function useReducedMotionPreference(): boolean {
  return useContext(QualityContext).reducedMotion;
}

export function useCanHover(): boolean {
  return useContext(QualityContext).canHover;
}
