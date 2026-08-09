"use client";

import { useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

/*
 * Dev-only assembled-page preview for /athena. Locked winners render in
 * page order so the page grows section by section; the section currently
 * under iteration carries its own slim variant tab bar above it. Add each
 * new section as a SectionSlot; when the user picks a winner, collapse its
 * variants array to the winning entry and mark it locked.
 */

type Variant = {
  id: string;
  label: string;
  note: string;
  Component: ComponentType;
};

type SectionSlot = {
  id: string;
  title: string;
  locked?: boolean;
  variants: Variant[];
};

const PAGE: SectionSlot[] = [
  {
    id: "hero",
    title: "Hero",
    locked: true,
    variants: [
      {
        id: "presence",
        label: "Presence ✓",
        note: "winner — locks the page tone",
        Component: dynamic(() => import("@/components/athena/hero/variant-a")),
      },
    ],
  },
  // Section 2 "Two surfaces" round 2 (benefit-first) registers here when built.
];

function SectionRow({ slot }: { slot: SectionSlot }) {
  const [activeId, setActiveId] = useState(slot.variants[0].id);
  const active = slot.variants.find((v) => v.id === activeId) ?? slot.variants[0];
  const Active = active.Component;

  return (
    <section className="relative">
      <div className="sticky top-0 z-40 border-y border-glass bg-background/80 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 font-mono text-base text-muted-dark">
          <span className="text-foreground/60">{slot.title}</span>
          {slot.locked ? (
            <span>{active.label}</span>
          ) : (
            <div role="tablist" aria-label={`${slot.title} variants`} className="flex flex-wrap gap-2">
              {slot.variants.map((v) => (
                <button
                  key={v.id}
                  role="tab"
                  aria-selected={v.id === active.id}
                  onClick={() => setActiveId(v.id)}
                  className={`rounded-lg border px-3 py-1 transition-colors ${
                    v.id === active.id
                      ? "border-glass-hover bg-surface text-foreground"
                      : "border-glass hover:border-glass-hover hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <span className="ml-auto hidden sm:inline">{active.note}</span>
        </div>
      </div>
      <Active key={active.id} />
    </section>
  );
}

export default function AthenaPrototypeSwitcher() {
  return (
    <>
      <div className="border-b border-glass bg-background/80 px-4 py-2">
        <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-base text-muted-dark">
          <Link href="/preview" className="hover:text-foreground">
            ← preview index
          </Link>
          <span>/athena — assembled page preview</span>
        </div>
      </div>
      {PAGE.map((slot) => (
        <SectionRow key={slot.id} slot={slot} />
      ))}
    </>
  );
}
