"use client";

import { useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

/**
 * Dev-only tab switcher for the /athena page prototypes. All competing
 * variants of the section currently under iteration are registered here;
 * one mounts at a time (dynamic import) so heavy motion scenes don't
 * stack. Add the next round of variants to PROTOTYPES as they land.
 */

type Prototype = {
  id: string;
  label: string;
  note: string;
  Component: ComponentType;
};

const PROTOTYPES: Prototype[] = [
  {
    id: "hero-a",
    label: "Hero A — Presence",
    note: "orb-first cinematic",
    Component: dynamic(() => import("@/components/athena/hero/variant-a")),
  },
  {
    id: "hero-b",
    label: "Hero B — Conductor",
    note: "voice-to-fleet sequence",
    Component: dynamic(() => import("@/components/athena/hero/variant-b")),
  },
];

export default function AthenaPrototypeSwitcher() {
  const [activeId, setActiveId] = useState(PROTOTYPES[0].id);
  const active = PROTOTYPES.find((p) => p.id === activeId) ?? PROTOTYPES[0];
  const Active = active.Component;

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-glass bg-background/80 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 font-mono text-base text-muted-dark">
          <Link href="/preview" className="hover:text-foreground">
            ← preview index
          </Link>
          <span className="text-foreground/60">athena prototypes</span>
          <div role="tablist" aria-label="Athena prototypes" className="flex flex-wrap gap-2">
            {PROTOTYPES.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={p.id === active.id}
                onClick={() => setActiveId(p.id)}
                className={`rounded-lg border px-3 py-1 transition-colors ${
                  p.id === active.id
                    ? "border-glass-hover bg-surface text-foreground"
                    : "border-glass hover:border-glass-hover hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className="ml-auto hidden sm:inline">{active.note}</span>
        </div>
      </div>
      <Active key={active.id} />
    </>
  );
}
