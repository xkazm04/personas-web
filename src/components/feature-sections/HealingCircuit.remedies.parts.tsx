"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { CheckCircle2, Play, UserRound, X, type LucideIcon } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { Fade, Grow, useWindow } from "./HealingCircuit.shell";

/* Marks of the "remedies" lanes. Positions are % of the lane's track; every size is
 * in em so the lane scales with the art's font-size. `d` is the lane's beat offset. */

type P = MotionValue<number>;
const pos = (from: number, to: number) => ({ left: `${from}%`, width: `${to - from}%` });
/** Vertical centre of the bar row inside a 3.1em track. */
const BAR_TOP = "1.8em";

export function Lane({
  name,
  code,
  outcome,
  children,
}: {
  name: string;
  code?: string;
  outcome: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-[1em] md:grid-cols-[12em_1fr_7em]">
      <div className="flex flex-wrap items-baseline gap-x-[0.45em]">
        <span className="font-semibold text-foreground/90">{name}</span>
        {code && (
          <span
            className="rounded-[0.35em] px-[0.35em] font-mono text-[0.8em] font-semibold"
            style={{ color: BRAND_VAR.rose, background: tint("rose", 12) }}
          >
            {code}
          </span>
        )}
      </div>
      <div className="relative col-span-2 row-start-2 h-[4.8em] md:col-span-1 md:h-[3.1em] md:col-start-2 md:row-start-1">
        {/* the lane's floor: where every run in it travels */}
        <div className="absolute inset-x-0 h-px bg-foreground/10" style={{ top: `calc(${BAR_TOP} + 0.37em)` }} />
        {children}
      </div>
      <div className="col-start-2 row-start-1 justify-self-end md:col-start-3 md:justify-self-start">{outcome}</div>
    </div>
  );
}

export function AttemptBar({ p, d, from, to }: { p: P; d: number; from: number; to: number }) {
  return (
    <Grow
      p={p}
      a={d}
      b={0.2 + d}
      className="absolute h-[0.75em] rounded-full bg-foreground/25"
      style={{ ...pos(from, to), top: BAR_TOP }}
    />
  );
}

export function RetryBar({ p, d, from, to, resumed }: { p: P; d: number; from: number; to: number; resumed?: boolean }) {
  return (
    <Grow
      p={p}
      a={0.55 + d}
      b={0.8 + d}
      className={`absolute h-[0.75em] ${resumed ? "rounded-r-full" : "rounded-full"}`}
      style={{ ...pos(from, to), top: BAR_TOP, background: tint("emerald", 75) }}
    >
      {resumed && (
        <Play className="absolute -left-[0.2em] top-1/2 h-[1em] w-[1em] -translate-y-1/2 fill-current" style={{ color: BRAND_VAR.emerald }} aria-hidden />
      )}
    </Grow>
  );
}

export function Cross({ p, d, at }: { p: P; d: number; at: number }) {
  return (
    <Fade
      p={p}
      a={0.2 + d}
      b={0.27 + d}
      className="absolute flex h-[1.35em] w-[1.35em] -translate-x-1/2 items-center justify-center rounded-full border-2"
      style={{ left: `${at}%`, top: "1.5em", borderColor: BRAND_VAR.rose, background: tint("rose", 18) }}
    >
      <X className="h-[0.85em] w-[0.85em]" strokeWidth={3} style={{ color: BRAND_VAR.rose }} aria-hidden />
    </Fade>
  );
}

function Tag({ icon: Icon, label, color }: { icon?: LucideIcon; label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-[0.3em] whitespace-nowrap text-[0.8em] font-semibold" style={{ color }}>
      {Icon && <Icon className="h-[1.1em] w-[1.1em]" aria-hidden />}
      {label}
    </span>
  );
}

/** A dashed wait between two attempts, labelled with what the wait is. */
export function Gap({ p, d, from, to, tone, icon, label }: { p: P; d: number; from: number; to: number; tone: BrandKey; icon: LucideIcon; label: string }) {
  return (
    <>
      <Grow
        p={p}
        a={0.3 + d}
        b={0.5 + d}
        className="absolute border-t-2 border-dashed"
        style={{ ...pos(from, to), top: `calc(${BAR_TOP} + 0.3em)`, borderColor: BRAND_VAR[tone] }}
      />
      <Fade p={p} a={0.32 + d} b={0.46 + d} rise={0.3} className="absolute top-0 flex justify-center" style={pos(from - 6, to + 6)}>
        <Tag icon={icon} label={label} color={BRAND_VAR[tone]} />
      </Fade>
    </>
  );
}

/** A time limit: a post across the lane with its value on top. */
export function Wall({ at, tone, label }: { at: number; tone: BrandKey; label: string }) {
  return (
    <div className="absolute top-0 flex h-[3.1em] -translate-x-1/2 flex-col items-center" style={{ left: `${at}%` }}>
      <Tag label={label} color={BRAND_VAR[tone]} />
      <div className="mt-[0.15em] w-[3px] flex-1 rounded-full" style={{ background: BRAND_VAR[tone] }} />
    </div>
  );
}

/** The doubled limit: a second post that slides out from the first. */
export function MovingWall({ p, d, from, to, label }: { p: P; d: number; from: number; to: number; label: string }) {
  const t = useWindow(p, 0.3 + d, 0.52 + d);
  const x = useTransform(t, (v) => `${(to - from) * v}%`);
  return (
    <motion.div className="absolute inset-0" style={{ x }}>
      <Wall at={from} tone="amber" label={label} />
    </motion.div>
  );
}

/** No retry: a dashed arrow from the failure to a health issue for the user. */
export function HandOff({ p, d, from, to, label }: { p: P; d: number; from: number; to: number; label: string }) {
  return (
    <>
      <Grow
        p={p}
        a={0.3 + d}
        b={0.5 + d}
        className="absolute border-t-2 border-dashed"
        style={{ ...pos(from, to), top: `calc(${BAR_TOP} + 0.3em)`, borderColor: BRAND_VAR.rose }}
      />
      <Fade
        p={p}
        a={0.5 + d}
        b={0.62 + d}
        className="absolute flex items-center gap-[0.35em] whitespace-nowrap rounded-full border px-[0.6em] py-[0.2em] text-[0.8em] font-semibold"
        style={{ left: `${to}%`, top: "1.35em", color: BRAND_VAR.rose, borderColor: tint("rose", 45), background: tint("rose", 12) }}
      >
        <UserRound className="h-[1.1em] w-[1.1em]" aria-hidden />
        {label}
      </Fade>
    </>
  );
}

export function Outcome({ p, d, text, person }: { p: P; d: number; text: string; person?: boolean }) {
  const color = person ? BRAND_VAR.rose : BRAND_VAR.emerald;
  const Icon = person ? UserRound : CheckCircle2;
  return (
    <Fade p={p} a={0.82 + d} b={0.92 + d} className="flex items-center gap-[0.35em] text-[0.85em] font-semibold" style={{ color }}>
      <Icon className="h-[1.15em] w-[1.15em]" aria-hidden />
      {text}
    </Fade>
  );
}
