"use client";

import type { Feature } from "../types";

export default function FeatureCardHeader({ f }: { f: Feature }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${f.iconBg} ${f.iconRing} ${f.iconGlow}`}
        >
          <f.icon className={`h-5 w-5 ${f.iconColor}`} />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-base leading-tight">{f.title}</h3>
          <p className="mt-1 text-base font-mono uppercase tracking-wider text-muted-dark">{f.proof}</p>
        </div>
      </div>
      <span className="shrink-0 font-mono text-base text-muted-dark tabular-nums md:hidden">{f.number}</span>
    </div>
  );
}
