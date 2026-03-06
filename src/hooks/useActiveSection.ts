"use client";

import { useMemo } from "react";
import { useActiveSectionId } from "@/contexts/SectionObserverContext";

interface SectionDef {
  id: string;
  label: string;
}

/**
 * Returns the label of the currently active section, powered by the shared
 * SectionObserverContext (IntersectionObserver). Falls back to null when no
 * provider is mounted or no section is active.
 */
export default function useActiveSection(sections: SectionDef[]) {
  const activeSectionId = useActiveSectionId();

  const labelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sections) map.set(s.id, s.label);
    return map;
  }, [sections]);

  return activeSectionId ? (labelMap.get(activeSectionId) ?? null) : null;
}
