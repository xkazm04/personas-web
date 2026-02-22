"use client";

import { useState, useEffect, useMemo, useRef } from "react";

interface ScrollMapItem {
  label: string;
  href: string;
}

export default function ScrollMap({ items }: { items: ScrollMapItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionIds = useMemo(() => items.map((item) => item.href.replace("#", "")), [items]);
  const elementsRef = useRef<Record<string, HTMLElement | null>>({});
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const nextElements: Record<string, HTMLElement | null> = {};
    for (const id of sectionIds) {
      nextElements[id] = document.getElementById(id);
    }
    elementsRef.current = nextElements;
  }, [sectionIds]);

  useEffect(() => {
    const computeActive = () => {
      const threshold = window.innerHeight / 3;
      let current = 0;

      for (let i = 0; i < items.length; i++) {
        const id = sectionIds[i];
        const el = elementsRef.current[id];
        if (!el) continue;
        // getBoundingClientRect gives viewport-relative position,
        // which is reliable regardless of CSS position/nesting.
        const top = el.getBoundingClientRect().top;
        if (top <= threshold) {
          current = i;
        }
      }
      setActiveIndex(current);
    };

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        computeActive();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    computeActive();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [items, sectionIds]);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-end gap-2">
      <div className="rounded-full border border-white/6 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-dark backdrop-blur-sm">
        Scroll Map
      </div>
      <div className="space-y-1.5 text-[10px] font-mono tracking-wider">
        {items.map((item, i) => (
          <button
            key={item.href}
            onClick={() => scrollTo(item.href)}
            className={`pointer-events-auto flex items-center justify-end gap-2 transition-all duration-300 cursor-pointer ${
              i === activeIndex
                ? "text-brand-cyan scale-105"
                : "text-muted-dark/80 hover:text-muted"
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`h-px transition-all duration-300 ${
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
