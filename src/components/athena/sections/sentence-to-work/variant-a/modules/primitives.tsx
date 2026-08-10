"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, type BrandKey, tint } from "@/lib/brand-theme";

/**
 * The small state atoms every module on the desk draws from — status dots,
 * pills, chips and the progress bar a running piece of work shows. These are
 * what make a module read as product UI instead of a captioned box.
 * Type floor: nothing renders below text-base.
 */

/** A status dot — optionally breathing while something is in flight. */
export function Dot({
  accent,
  pulse,
  reduced,
  className = "h-2 w-2",
}: {
  accent: BrandKey;
  pulse?: boolean;
  reduced?: boolean;
  className?: string;
}) {
  const live = pulse && !reduced;
  return (
    <motion.span
      className={`shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: BRAND_VAR[accent] }}
      animate={live ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
      transition={live ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      aria-hidden="true"
    />
  );
}

export type PillTone = "brand" | "ok" | "muted";

/** Every pill and chip on the desk is exactly one 24px line box tall, so a
 *  row that reserves `min-h-6` cannot grow when one lands in it — the whole
 *  reason nothing on this canvas moves as it composes. */
const PILL =
  "flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-base leading-none";

/** Status pill — the state vocabulary shared by every module. `glyph` replaces
 *  the leading dot when a state has something better to say than "something is
 *  here": a drawn check once a piece of work lands. */
export function StatePill({
  tone,
  label,
  pulse,
  glyph,
  reduced,
}: {
  tone: PillTone;
  label: string;
  pulse?: boolean;
  glyph?: ReactNode;
  reduced?: boolean;
}) {
  if (tone === "muted") {
    return <span className={`${PILL} border-glass text-muted-dark`}>{label}</span>;
  }
  const accent: BrandKey = tone === "ok" ? "emerald" : "cyan";
  return (
    <span
      className={PILL}
      style={{
        borderColor: tint(accent, 40),
        backgroundColor: tint(accent, 10),
        color: BRAND_VAR[accent],
      }}
    >
      {glyph ?? <Dot accent={accent} pulse={pulse} reduced={reduced} className="h-1.5 w-1.5" />}
      {label}
    </span>
  );
}

/** A plain attribute chip — the texture of a plan step and of an attached
 *  source. `accent` marks the one chip a correction has landed on. */
export function Chip({
  icon,
  accent,
  className = "",
  children,
}: {
  icon?: ReactNode;
  accent?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex h-6 min-w-0 shrink items-center gap-1.5 rounded-full border px-2.5 text-base leading-none duration-500 transition-[background-color,border-color,color] ${
        accent ? "text-brand-cyan" : "border-glass text-muted-dark"
      } ${className}`}
      style={
        accent
          ? { borderColor: tint("cyan", 45), backgroundColor: tint("cyan", 12) }
          : undefined
      }
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** The live hint on a running piece of work: a bar that visibly creeps while
 *  the work is under way and completes when it lands. `scaleX` keeps the whole
 *  thing off the layout. */
export function ProgressBar({
  fill,
  running,
  done,
  reduced,
  delay = 0,
  className = "h-1 w-14",
}: {
  fill: number;
  running: boolean;
  done: boolean;
  reduced: boolean;
  delay?: number;
  className?: string;
}) {
  const target = done ? 1 : running ? fill / 100 : 0;
  return (
    <span
      className={`shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ backgroundColor: tint("cyan", 14) }}
      aria-hidden="true"
    >
      <motion.span
        className="block h-full origin-left rounded-full"
        style={{ backgroundColor: BRAND_VAR.cyan }}
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: target }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: done ? 0.45 : 2.1, delay, ease: done ? "easeOut" : "easeInOut" }
        }
      />
    </span>
  );
}
