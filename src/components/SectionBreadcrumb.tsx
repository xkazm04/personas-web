"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveSectionId } from "@/contexts/SectionObserverContext";

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
  const activeSectionId = useActiveSectionId();

  const activeIndex = useMemo(() => {
    if (!activeSectionId) return -1;
    return items.findIndex((item) => item.href === `#${activeSectionId}`);
  }, [items, activeSectionId]);

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
            className="h-8 bg-background/80 backdrop-blur-xl border-b border-glass"
          >
            <div className="mx-auto flex h-full max-w-6xl items-center gap-4 px-6">
              {items.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`relative flex h-11 -my-1.5 items-center text-base font-mono uppercase tracking-wider transition-colors duration-200 focus-ring ${
                      isActive
                        ? "text-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="breadcrumb-underline"
                        className="absolute bottom-1.5 left-0 right-0 h-[2px] rounded-full"
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
