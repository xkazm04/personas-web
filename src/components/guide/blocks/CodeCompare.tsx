"use client";

import { ArrowDown } from "lucide-react";

import { CopyButton } from "./CopyButton";

interface CodeCompareProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function CodeCompare({
  before,
  after,
  beforeLabel,
  afterLabel,
}: CodeCompareProps) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      <div className="group rounded-xl border border-rose-400/10 bg-rose-400/[0.02] overflow-hidden" role="region" aria-label={beforeLabel ?? "Before"}>
        <div className="flex items-center gap-2 border-b border-rose-400/10 bg-rose-400/[0.04] px-4 py-2">
          <div
            className="h-2 w-2 rounded-full bg-rose-400/50"
            aria-hidden="true"
          />
          <span className="text-base font-semibold uppercase tracking-wider text-rose-400/70">
            {beforeLabel ?? "Before"}
          </span>
          <CopyButton text={before} className="ml-auto" />
        </div>
        <pre className="p-4 font-mono text-base leading-relaxed text-muted-dark overflow-x-auto">
          <code>{before}</code>
        </pre>
      </div>
      {/* Mobile-only directional affordance: the panels stack below sm, so show a
          down-arrow to preserve the before -> after relationship. Hidden at sm+
          where the side-by-side grid makes it obvious. */}
      <div className="flex items-center justify-center text-muted-dark sm:hidden" aria-hidden="true">
        <ArrowDown className="h-4 w-4" />
      </div>
      <div className="group rounded-xl border border-emerald-400/10 bg-emerald-400/[0.02] overflow-hidden" role="region" aria-label={afterLabel ?? "After"}>
        <div className="flex items-center gap-2 border-b border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-2">
          <div
            className="h-2 w-2 rounded-full bg-emerald-400/50"
            aria-hidden="true"
          />
          <span className="text-base font-semibold uppercase tracking-wider text-emerald-400/70">
            {afterLabel ?? "After"}
          </span>
          <CopyButton text={after} className="ml-auto" />
        </div>
        <pre className="p-4 font-mono text-base leading-relaxed text-muted-dark overflow-x-auto">
          <code>{after}</code>
        </pre>
      </div>
    </div>
  );
}
