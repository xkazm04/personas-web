"use client";

import { useState, useEffect, useRef, useMemo } from "react";

interface SectionDef {
  id: string;
  label: string;
}

/**
 * Detects which named section is currently in view based on scroll position.
 * Returns the label of the active section (or null when at the very top / hero).
 */
export default function useActiveSection(sections: SectionDef[]) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const elementsRef = useRef<Record<string, HTMLElement | null>>({});
  const rafRef = useRef<number | null>(null);

  // Cache DOM references once after mount
  useEffect(() => {
    const next: Record<string, HTMLElement | null> = {};
    for (const id of ids) {
      next[id] = document.getElementById(id);
    }
    elementsRef.current = next;
  }, [ids]);

  useEffect(() => {
    const compute = () => {
      const threshold = window.innerHeight / 3;
      let current: string | null = null;

      for (const section of sections) {
        const el = elementsRef.current[section.id];
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= threshold) {
          current = section.label;
        }
      }

      setActiveLabel(current);
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        compute();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sections]);

  return activeLabel;
}
