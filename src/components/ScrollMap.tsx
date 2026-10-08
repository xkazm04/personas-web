"use client";

import { useEffect, useMemo, useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useActiveSectionId } from "@/contexts/SectionObserverContext";
import { useTranslation } from "@/i18n/useTranslation";
import { startArrival } from "@/hooks/useHashArrival";
import { resolveLandingAddress } from "@/lib/landing-address";
import type { ScrollMapItem } from "@/lib/types";

export default function ScrollMap({ items }: { items: ScrollMapItem[] }) {
  const { t } = useTranslation();
  const activeSectionId = useActiveSectionId();
  const reduced = useStillMotion();

  const activeIndex = useMemo(() => {
    const idx = items.findIndex((item) => item.href === `#${activeSectionId}`);
    return idx >= 0 ? idx : 0;
  }, [items, activeSectionId]);

  // Every scroll-map target is a declared home address, and most live inside
  // `ssr: false` + viewport-gated sections that are not in the DOM on first
  // paint. The shared arrival runner scrolls the always-present wrapper (which
  // mounts the section), then lands on the real section once it exists — the
  // same resolver and protocol a cold `/#download` link uses.
  const stopArrival = useRef<() => void>(() => {});
  useEffect(() => () => stopArrival.current(), []);

  const scrollTo = (href: string) => {
    const address = resolveLandingAddress(href);
    if (!address) return;
    stopArrival.current();
    const behavior: ScrollBehavior = reduced ? "instant" : "smooth";
    stopArrival.current = startArrival(address, { approach: behavior, land: () => behavior, focus: false });
  };

  return (
    // At rest the rail is ticks plus the ACTIVE label only - a readout of
    // where you are that stays inside the page's 7rem gutter, so sections can
    // run wide (styles/stage.css --stage-max-w). Every label expands on hover
    // or keyboard focus. Collapsed labels use max-width, not opacity, so an
    // invisible label can never sit over the content and swallow its clicks.
    <aside aria-label={t.pageNav.landmarkLabel} className="group/map pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-end gap-2">
      <div className="max-h-0 overflow-hidden rounded-full border border-transparent px-2.5 text-xs uppercase tracking-[0.2em] text-muted-dark transition-[max-height,border-color] duration-300 group-hover/map:max-h-8 group-hover/map:border-glass group-hover/map:py-1 group-focus-within/map:max-h-8 group-focus-within/map:border-glass group-focus-within/map:py-1">
        {t.pageNav.scrollMap}
      </div>
      <div className="flex flex-col text-xs font-mono tracking-wider">
        {items.map((item, i) => (
          <button
            key={item.href}
            onClick={() => scrollTo(item.href)}
            aria-current={i === activeIndex ? "true" : undefined}
            className={`pointer-events-auto flex h-11 -my-3.5 items-center justify-end gap-2 transition-[color,transform] duration-300 cursor-pointer focus-ring focus-visible:ring-offset-4 ${
              i === activeIndex
                ? "text-brand-cyan scale-105 font-bold"
                : "text-muted-dark hover:text-muted"
            }`}
          >
            <span
              className={
                i === activeIndex
                  ? "max-w-48 overflow-hidden whitespace-nowrap"
                  : "max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-300 group-hover/map:max-w-48 group-focus-within/map:max-w-48"
              }
            >
              {item.label}
            </span>
            <span
              className={`h-px transition-[width,background-color] duration-300 ${
                i === activeIndex
                  ? "w-6 bg-linear-to-l from-brand-cyan/80 to-transparent"
                  : "w-4 bg-linear-to-l from-brand-cyan/35 to-transparent"
              }`}
            />
          </button>
        ))}
      </div>
    </aside>
  );
}
