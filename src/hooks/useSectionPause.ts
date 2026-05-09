"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useReducedMotion } from "framer-motion";
import { usePageVisibility } from "./usePageVisibility";

/**
 * Section-level animation pause state. Combines four signals:
 *   1. `prefers-reduced-motion` (accessibility)
 *   2. IntersectionObserver — only animate when on/near screen
 *   3. `document.hidden` — halt loops when the tab is blurred
 *   4. Manual user toggle (rendered by TerminalChrome's pause button)
 *
 * Children read the merged `paused` boolean via `useSectionPaused` and
 * freeze any `repeat: Infinity` motions / auto-cycling effects.
 */

interface SectionPauseValue {
  paused: boolean;
  manualPaused: boolean;
  reducedMotion: boolean;
  inView: boolean;
  tabHidden: boolean;
  toggleManual: () => void;
}

const SectionPauseContext = createContext<SectionPauseValue | null>(null);

interface UseSectionPauseControllerOptions {
  ref: RefObject<Element | null>;
  /** Pre-load animations slightly before the section enters the viewport. */
  rootMargin?: string;
}

/**
 * Owner-side hook: instantiates the pause state for one section.
 * Returns a value to feed into `SectionPauseProvider`.
 */
export function useSectionPauseController({
  ref,
  rootMargin = "200px 0px",
}: UseSectionPauseControllerOptions): SectionPauseValue {
  const reducedMotion = !!useReducedMotion();
  const tabHidden = usePageVisibility();
  const [manualPaused, setManualPaused] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  const toggleManual = useCallback(() => {
    setManualPaused((p) => !p);
  }, []);

  return useMemo(
    () => ({
      paused: reducedMotion || manualPaused || !inView || tabHidden,
      manualPaused,
      reducedMotion,
      inView,
      tabHidden,
      toggleManual,
    }),
    [reducedMotion, manualPaused, inView, tabHidden, toggleManual],
  );
}

interface SectionPauseProviderProps {
  value: SectionPauseValue;
  children: ReactNode;
}

export function SectionPauseProvider({
  value,
  children,
}: SectionPauseProviderProps) {
  return createElement(
    SectionPauseContext.Provider,
    { value },
    children,
  );
}

/**
 * Consumer hook. Returns true if any of the three signals say to pause.
 * Outside a provider it falls back to `prefers-reduced-motion` only,
 * so motion components remain safe to drop in anywhere.
 */
export function useSectionPaused(): boolean {
  const ctx = useContext(SectionPauseContext);
  const reduced = !!useReducedMotion();
  const tabHidden = usePageVisibility();
  if (ctx) return ctx.paused;
  return reduced || tabHidden;
}

/**
 * Full-state consumer for the TerminalChrome toggle and other UI
 * that needs to know whether the user explicitly paused.
 */
export function useSectionPauseState(): SectionPauseValue | null {
  return useContext(SectionPauseContext);
}

/**
 * Convenience hook for components that own a section. Wires up the
 * IntersectionObserver and returns both the value and a stable ref.
 */
export function useSectionPause(rootMargin?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const value = useSectionPauseController({ ref, rootMargin });
  return { ref, ...value };
}
