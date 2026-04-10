"use client";

import { useMemo } from "react";
import { useActiveSectionId } from "@/contexts/SectionObserverContext";
import type { ScrollMapItem } from "@/lib/types";

export default function ScrollMap({ items }: { items: ScrollMapItem[] }) {
  const activeSectionId = useActiveSectionId();

  const activeIndex = useMemo(() => {
    const idx = items.findIndex((item) => item.href === `#${activeSectionId}`);
    return idx >= 0 ? idx : 0;
  }, [items, activeSectionId]);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside aria-label="Page navigation" className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-end gap-2">
      <div className="rounded-full border border-white/6 bg-black/20 px-2.5 py-1 text-sm uppercase tracking-[0.2em] text-muted-dark backdrop-blur-sm">
        Scroll Map
      </div>
      <div className="flex flex-col text-sm font-mono tracking-wider">
        {items.map((item, i) => (
          <button
            key={item.href}
            onClick={() => scrollTo(item.href)}
            className={`pointer-events-auto flex h-11 -my-3.5 items-center justify-end gap-2 transition-[color,transform] duration-300 cursor-pointer focus-ring focus-visible:ring-offset-4 ${
              i === activeIndex
                ? "text-brand-cyan scale-105"
                : "text-muted-dark hover:text-muted"
            }`}
          >
            <span>{item.label}</span>
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
