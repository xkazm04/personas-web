"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface SectionObserverValue {
  /** Currently active section ID (last one whose top crossed the 1/3 viewport line) */
  activeSectionId: string | null;
  /** Register a section element to be observed */
  observe: (id: string, el: HTMLElement) => void;
  /** Unregister a section element */
  unobserve: (id: string) => void;
}

const SectionObserverContext = createContext<SectionObserverValue>({
  activeSectionId: null,
  observe: () => {},
  unobserve: () => {},
});

/**
 * Provides a single shared IntersectionObserver that tracks which page section
 * is "active" — replacing per-component scroll listeners + getBoundingClientRect.
 *
 * The observer fires when a section's top edge crosses 33% from the top of the
 * viewport, matching the previous scroll-spy threshold.
 */
export function SectionObserverProvider({
  sectionIds,
  children,
}: {
  sectionIds: string[];
  children: ReactNode;
}) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Track which sections are currently intersecting
  const visibleRef = useRef<Set<string>>(new Set());
  // Ordered list of section IDs for determining "last visible"
  const orderedIdsRef = useRef(sectionIds);
  orderedIdsRef.current = sectionIds;

  // Map of observed elements
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Compute active section from visible set
  const computeActive = useCallback(() => {
    const ordered = orderedIdsRef.current;
    const visible = visibleRef.current;
    let active: string | null = null;
    for (const id of ordered) {
      if (visible.has(id)) active = id;
    }
    setActiveSectionId(active);
  }, []);

  // Create observer on mount
  useEffect(() => {
    // rootMargin: trigger when element enters a zone starting from 0px top
    // to -(100% - 33%) from bottom. This means entries fire when the element's
    // top edge is in the top 33% of the viewport — same as the old threshold.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-section-id");
          if (!id) continue;
          if (entry.isIntersecting) {
            visibleRef.current.add(id);
          } else {
            visibleRef.current.delete(id);
          }
        }
        computeActive();
      },
      {
        // The observation zone: from the top of the viewport to 33% down.
        // bottom margin is negative = shrink observation area from bottom.
        rootMargin: "0px 0px -67% 0px",
      },
    );

    observerRef.current = observer;

    // Observe any already-registered elements
    for (const [id, el] of elementsRef.current) {
      el.setAttribute("data-section-id", id);
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [computeActive]);

  const observe = useCallback((id: string, el: HTMLElement) => {
    elementsRef.current.set(id, el);
    el.setAttribute("data-section-id", id);
    observerRef.current?.observe(el);
  }, []);

  const unobserve = useCallback((id: string) => {
    const el = elementsRef.current.get(id);
    if (el) {
      observerRef.current?.unobserve(el);
      elementsRef.current.delete(id);
    }
    visibleRef.current.delete(id);
  }, []);

  // Auto-observe sections by ID on mount
  useEffect(() => {
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observe(id, el);
    }
    return () => {
      for (const id of sectionIds) {
        unobserve(id);
      }
    };
  }, [sectionIds, observe, unobserve]);

  return (
    <SectionObserverContext.Provider value={{ activeSectionId, observe, unobserve }}>
      {children}
    </SectionObserverContext.Provider>
  );
}

export function useActiveSectionId(): string | null {
  return useContext(SectionObserverContext).activeSectionId;
}

export function useSectionObserver() {
  return useContext(SectionObserverContext);
}
