"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href: string;
  color: string;
}

export default function SectionBreadcrumb({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sectionIds = items.map((item) => item.href.replace("#", ""));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    // Track which sections are currently intersecting
    const visibleSet = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSet.add(entry.target.id);
          } else {
            visibleSet.delete(entry.target.id);
          }
        }
        // Pick the first visible section in document order
        const idx = sectionIds.findIndex((id) => visibleSet.has(id));
        setActiveIndex(idx);
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: 0 },
    );

    elements.forEach((el) => observerRef.current!.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  const active = activeIndex >= 0 ? items[activeIndex] : null;

  return (
    <div className="fixed top-[60px] left-0 right-0 z-40 hidden md:block">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-8 bg-background/80 backdrop-blur-xl border-b border-white/4"
          >
            <div className="mx-auto flex h-full max-w-6xl items-center gap-4 px-6">
              {items.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`relative flex h-full items-center text-[11px] font-mono uppercase tracking-wider transition-colors duration-200 ${
                      isActive
                        ? "text-white/90"
                        : "text-white/70 hover:text-white/90"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="breadcrumb-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${item.color}, transparent)`,
                        }}
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.4,
                        }}
                      />
                    )}
                  </a>
                );
              })}

              {/* Progress dots */}
              <div className="ml-auto flex items-center gap-1.5">
                {items.map((item, i) => (
                  <div
                    key={item.href}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? "w-4"
                        : "w-1 bg-white/10"
                    }`}
                    style={
                      i === activeIndex
                        ? { background: item.color }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
