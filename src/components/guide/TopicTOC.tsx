"use client";

import { useMemo } from "react";

import { useActiveHeading } from "./useActiveHeading";
import type { GuideHeading } from "./guide-markdown/extractHeadings";

interface TopicTOCProps {
  headings: GuideHeading[];
  label: string;
}

export default function TopicTOC({ headings, label }: TopicTOCProps) {
  const tocHeadings = useMemo(
    () => headings.filter((h) => h.depth === 2 || h.depth === 3),
    [headings],
  );
  const activeId = useActiveHeading(tocHeadings);

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
              {heading.tabLabels && heading.tabLabels.length > 0 && (
                <p
                  className={`pb-1 text-xs italic text-muted-dark/60 ${
                    heading.depth === 3 ? "pl-6" : "pl-3"
                  }`}
                  aria-hidden="true"
                >
                  tabs: {heading.tabLabels.join(" · ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
