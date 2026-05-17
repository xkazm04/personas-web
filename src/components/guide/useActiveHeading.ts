"use client";

import { useEffect, useState } from "react";

import type { GuideHeading } from "./guide-markdown/extractHeadings";

export function useActiveHeading(headings: GuideHeading[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0 || typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );
    const observed: HTMLElement[] = [];
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    }
    return () => {
      observed.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [headings]);

  return activeId;
}
