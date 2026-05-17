"use client";

import { useEffect, useState } from "react";

import type { GuideHeading } from "./guide-markdown/extractHeadings";

interface TopicTOCProps {
  headings: GuideHeading[];
  label: string;
}

export default function TopicTOC({ headings, label }: TopicTOCProps) {
  const tocHeadings = headings.filter((h) => h.depth === 2 || h.depth === 3);
  const [activeId, setActiveId] = useState<string | null>(tocHeadings[0]?.id ?? null);

  useEffect(() => {
    if (tocHeadings.length === 0 || typeof window === "undefined") return;
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
    for (const heading of tocHeadings) {
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
  }, [tocHeadings]);

  if (tocHeadings.length === 0) return null;

  return (
    <nav aria-label={label}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-dark/80">
        {label}
      </p>
      <ul className="space-y-1.5 border-l border-glass">
        {tocHeadings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block border-l-2 py-1 text-base leading-snug transition-colors ${
                  heading.depth === 3 ? "pl-6" : "pl-3"
                } ${
                  isActive
                    ? "-ml-px border-brand-cyan text-brand-cyan"
                    : "-ml-px border-transparent text-muted-dark hover:text-foreground"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
