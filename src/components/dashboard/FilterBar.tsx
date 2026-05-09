"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface FilterOption {
  key: string;
  label: string;
  count?: number;
  /** When true, render a heartbeat dot next to the count (e.g. "live runs in flight"). */
  pulse?: boolean;
}

function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document === "undefined" ? true : document.visibilityState !== "hidden",
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
}

/**
 * Tracks whether `el` overflows horizontally and which edges (left/right)
 * have additional scrollable content. Driven by both scroll events and a
 * ResizeObserver so the affordance updates when the container is resized
 * (e.g. mobile rotation, parent layout shifts) — not just on scroll.
 */
function useEdgeOverflow(el: HTMLElement | null) {
  const [state, setState] = useState({ left: false, right: false });

  useEffect(() => {
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      // 1px tolerance — sub-pixel measurement on some zoom levels can leave
      // a fractional gap that wrongly shows the right fade.
      const left = el.scrollLeft > 1;
      const right = el.scrollLeft < max - 1;
      setState((prev) =>
        prev.left === left && prev.right === right ? prev : { left, right },
      );
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [el]);

  return state;
}

export default function FilterBar({
  options,
  active,
  onChange,
  compact = false,
}: {
  options: FilterOption[];
  active: string;
  onChange: (key: string) => void;
  compact?: boolean;
}) {
  const visible = useDocumentVisible();
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const { left: showLeftFade, right: showRightFade } = useEdgeOverflow(scrollEl);

  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
      {/* Edge fades hint at hidden scrollable content; toggled by overflow
          state so we never paint a fade against a non-scrollable edge. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-6 rounded-l-xl bg-gradient-to-r from-background to-transparent transition-opacity duration-150 ${
          showLeftFade ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-6 rounded-r-xl bg-gradient-to-l from-background to-transparent transition-opacity duration-150 ${
          showRightFade ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={setScrollEl}
        className={`flex items-center gap-1 overflow-x-auto scrollbar-hide ${compact ? "p-0.5" : "p-1"}`}
      >
        {options.map((opt) => {
          const isActive = opt.key === active;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`relative flex items-center gap-1.5 transition-all duration-200 ${
                compact
                  ? `rounded-md px-2 py-1 text-[11px] font-medium ${
                      isActive
                        ? "bg-white/[0.12] text-foreground shadow-sm"
                        : "text-muted-dark hover:text-muted hover:bg-white/[0.04]"
                    }`
                  : `rounded-lg px-3 py-1.5 text-xs font-medium ${
                      isActive
                        ? "bg-white/[0.12] text-foreground shadow-sm"
                        : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                    }`
              }`}
            >
              {opt.label}
              {opt.count !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-px tabular-nums ${
                    compact ? "text-[9px]" : "text-[10px]"
                  } ${
                    isActive
                      ? "bg-brand-cyan/15 text-brand-cyan"
                      : "bg-white/[0.06] text-muted-dark"
                  }`}
                >
                  {opt.pulse && (
                    <span
                      aria-hidden="true"
                      data-paused={!visible}
                      className="animate-heartbeat inline-block h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_6px_color-mix(in_srgb,var(--brand-cyan)_70%,transparent)]"
                    />
                  )}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={opt.count}
                      initial={{ y: -6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 6, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="inline-block tabular-nums"
                    >
                      {opt.count}
                    </motion.span>
                  </AnimatePresence>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
