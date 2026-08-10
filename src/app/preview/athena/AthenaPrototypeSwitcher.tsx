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
  {
    id: "onboarding-partner",
    title: "S3 — Onboarding partner",
    variants: [
      {
        id: "glide",
        label: "A — The Glide (developing)",
        note: "winner in refinement — she sets the workspace up with you",
        Component: dynamic(
          () => import("@/components/athena/sections/onboarding-partner/variant-a"),
        ),
      },
    ],
  },
  {
    id: "fleet-orchestration",
    title: "S4 — Fleet orchestration",
    locked: true,
    variants: [
      {
        id: "decomposition",
        label: "Decomposition ✓",
        note: "winner — the sentence comes apart into the work it implies",
        Component: dynamic(
          () => import("@/components/athena/sections/fleet-orchestration/variant-b"),
        ),
      },
    ],
  },
  {
    id: "whole-portfolio",
    title: "S5 — Your whole portfolio",
    variants: [
      {
        id: "flight",
        label: "A — The Flight",
        note: "camera travels the field, descends onto the worst one",
        Component: dynamic(
          () => import("@/components/athena/sections/whole-portfolio/variant-a"),
        ),
      },
      {
        id: "worst-first",
        label: "B — Worst First",
        note: "many → few → ordered → one; the sort is the argument",
        Component: dynamic(
          () => import("@/components/athena/sections/whole-portfolio/variant-b"),
        ),
      },
      {
        id: "stopped-looking",
        label: "C — The Thing You Stopped Looking At",
        note: "wildcard: elapsed attention, quiet decay, noticed in time",
        Component: dynamic(
          () => import("@/components/athena/sections/whole-portfolio/variant-c"),
        ),
      },
    ],
  },
];

/*
 * All variants of a slot stay MOUNTED; tabs toggle visibility only. This
 * makes switching instant and keeps the rest of the page untouched — no
 * unmount/remount, no height collapse, no scroll jump, no replayed
 * reveals in neighboring sections.
 */
function SectionRow({ slot }: { slot: SectionSlot }) {
  const [activeId, setActiveId] = useState(slot.variants[0].id);
  const active = slot.variants.find((v) => v.id === activeId) ?? slot.variants[0];

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
      {slot.variants.map((v) => (
        <div key={v.id} className={v.id === active.id ? undefined : "hidden"}>
          <v.Component />
        </div>
      ))}
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
