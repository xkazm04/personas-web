"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PhaseCardData = {
  phase: number;
  name: string;
  icon: LucideIcon;
  scope: string;
  accent: string;
  bg: string;
  completed?: boolean;
};

export default function PhaseCard({
  data,
  index = 0,
}: {
  data: PhaseCardData;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group relative flex-none w-[160px] snap-start rounded-xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-4 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]"
    >
      {/* Phase number */}
      <div className="absolute top-2.5 right-3 text-[10px] font-mono text-muted-dark/30">
        {String(data.phase).padStart(2, "0")}
      </div>

      {/* Completed checkmark */}
      {data.completed && (
        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-emerald/20 flex items-center justify-center ring-2 ring-background">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3 5.5L6.5 2" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${data.bg} mb-3`}>
        <data.icon className={`h-4 w-4 ${data.accent}`} />
      </div>

      {/* Name */}
      <h4 className="text-sm font-medium leading-tight">{data.name}</h4>
      <p className="mt-1 text-[10px] leading-relaxed text-muted-dark line-clamp-2">{data.scope}</p>
    </motion.div>
  );
}

export function PhaseCardStrip({ phases }: { phases: PhaseCardData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [peeked, setPeeked] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();

    const onScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = 0;
        updateScrollState();
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = 0;
      }
    };
  }, [updateScrollState]);

  // Mobile peek animation on first view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || peeked) return;
    const mq = window.matchMedia("(max-width: 640px)");
    if (!mq.matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !peeked) {
          setPeeked(true);
          el.scrollTo({ left: 80, behavior: "smooth" });
          setTimeout(() => el.scrollTo({ left: 0, behavior: "smooth" }), 600);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [peeked]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -320 : 320;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="group/strip relative">
      {/* Gradient fade masks */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
      )}

      {/* Arrow buttons — visible on hover (hidden on mobile) */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-background/80 text-muted-dark backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover/strip:opacity-100 hover:border-white/[0.15] hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-background/80 text-muted-dark backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover/strip:opacity-100 hover:border-white/[0.15] hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
      >
        {phases.map((phase, i) => (
          <PhaseCard key={phase.phase} data={phase} index={i} />
        ))}
      </div>
    </div>
  );
}
