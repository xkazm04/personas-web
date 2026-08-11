"use client";

import { useState } from "react";
import Link from "next/link";
import { PAGE, type SectionSlot } from "./page-slots";

/*
 * Dev-only assembled-page preview for /athena. Locked winners render in
 * page order so the page grows section by section; the section currently
 * under iteration carries its own slim variant tab bar above it. The page's
 * shape lives in ./page-slots — add or lock sections there, not here.
 */

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
