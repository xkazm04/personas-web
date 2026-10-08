"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/** Detect -> Diagnose -> Fix -> Back on track, lit up to the current phase. */
export default function Stepper({
  labels,
  colors,
  phase,
  running,
}: {
  labels: string[];
  colors: BrandKey[];
  phase: number;
  running: boolean;
}) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-[0.5em] border-t border-glass px-[1.1em] py-[0.7em]">
      {labels.map((label, i) => {
        const reached = phase >= i + 1;
        const active = phase === i + 1;
        const k = colors[i];
        return (
          <Fragment key={label}>
            {i > 0 && (
              <span aria-hidden className="relative h-[2px] w-[2.2em] overflow-hidden rounded-full bg-foreground/15">
                <motion.span
                  className="absolute inset-0 origin-left"
                  style={{ background: BRAND_VAR[k] }}
                  initial={false}
                  animate={{ scaleX: reached ? 1 : 0 }}
                  transition={{ duration: running ? 0.4 : 0 }}
                />
              </span>
            )}
            <li
              className="inline-flex items-center gap-[0.45em] rounded-full border px-[0.8em] py-[0.25em] text-[0.9em] font-semibold transition-colors duration-300"
              style={{
                borderColor: reached ? tint(k, active ? 70 : 40) : "var(--border-glass)",
                background: active ? tint(k, 16) : "transparent",
                color: reached ? BRAND_VAR[k] : "color-mix(in srgb, var(--foreground) 65%, transparent)",
                boxShadow: active ? `0 0 1.2em ${tint(k, 30)}` : "none",
              }}
            >
              <span className="font-mono text-[0.85em] opacity-80">{i + 1}</span>
              {label}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
