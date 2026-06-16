"use client";

import type { ReactNode } from "react";

const DEPTH_CLASSES: Record<1 | 2 | 3 | 4, string> = {
  1: "text-3xl font-bold tracking-tight mt-8 mb-4 text-foreground scroll-mt-24 group relative",
  2: "text-2xl font-semibold tracking-tight mt-8 mb-3 text-foreground scroll-mt-24 group relative",
  3: "text-xl font-semibold mt-6 mb-2 text-foreground scroll-mt-24 group relative",
  4: "text-lg font-medium mt-4 mb-2 text-foreground scroll-mt-24 group relative",
};

interface HeadingAnchorProps {
  depth: 1 | 2 | 3 | 4;
  id: string;
  rawText: string;
  copyLabel: string;
  children: ReactNode;
}

export function HeadingAnchor({ depth, id, rawText, copyLabel, children }: HeadingAnchorProps) {
  const Tag = `h${depth}` as const;
  return (
    <Tag className={DEPTH_CLASSES[depth]} id={id}>
      <a
        href={`#${id}`}
        aria-label={`${copyLabel}: ${rawText}`}
        title={copyLabel}
        onClick={(event) => {
          if (typeof window === "undefined" || !navigator.clipboard) return;
          const url = `${window.location.href.split("#")[0]}#${id}`;
          navigator.clipboard.writeText(url).catch(() => {});
          const target = event.currentTarget;
          target.dataset.copied = "1";
          window.setTimeout(() => {
            delete target.dataset.copied;
          }, 1500);
        }}
        className="absolute -left-6 top-1/2 -translate-y-1/2 text-muted-dark/60 hover:text-brand-cyan no-underline opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity font-normal data-[copied=1]:text-emerald-400"
      >
        #
      </a>
      {children}
    </Tag>
  );
}
