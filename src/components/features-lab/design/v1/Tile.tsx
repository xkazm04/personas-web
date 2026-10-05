"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { DimCopy } from "../shared/copy";
import { inkA } from "../shared/dims";
import type { DimPhase } from "../shared/timeline";
import DecisionText from "../shared/DecisionText";
import { placeStyle, type Rect } from "./layout";

/** Text ink: the dimension colour lifted toward the island's foreground. */
export const textInk = (ink: string) => `color-mix(in oklab, ${ink} 72%, var(--foreground))`;

/**
 * One dimension of the matrix. Its picture "develops": grey and dim while
 * pending, then colour sweeps across behind a glowing seam as the decision
 * lands - the decision is expressed through the art, and the words sit in an
 * owned band at the bottom.
 */
function Tile({
  d,
  rect,
  phase,
  value,
  source,
  moving,
  pulse,
}: {
  d: DimCopy;
  rect: Rect;
  phase: DimPhase;
  value: string;
  source: string;
  moving: boolean;
  /** The asking ring may breathe (clock running, motion allowed). */
  pulse: boolean;
}) {
  const live = phase !== "pending";
  const done = phase === "resolved";
  const dur = (s: number) => (moving ? s : 0);
  const src = `/imgs/features/matrix/${d.key}.png`;

  return (
    <div
      className="absolute overflow-hidden border transition-[border-color,box-shadow] duration-500"
      style={{
        ...placeStyle(rect),
        borderRadius: "1.1cqw",
        borderColor: live ? inkA(d.ink, done ? 45 : 80) : "rgba(var(--surface-overlay), 0.09)",
        boxShadow: live
          ? `0 0 2.4cqw ${inkA(d.ink, done ? 18 : 34)}, inset 0 1px 0 rgba(var(--surface-overlay), 0.14)`
          : "inset 0 1px 0 rgba(var(--surface-overlay), 0.06)",
      }}
    >
      {/* pending: a grey, dim negative of the picture */}
      <Image src={src} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover opacity-45 grayscale" />
      {/* the decision lands: colour sweeps in left to right */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ clipPath: done ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
        transition={{ duration: dur(0.75), ease: [0.6, 0, 0.3, 1] }}
      >
        <Image src={src} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 w-[0.25cqw]"
        style={{ background: `linear-gradient(${inkA(d.ink, 0)}, ${d.ink}, ${inkA(d.ink, 0)})`, boxShadow: `0 0 1.4cqw ${d.ink}` }}
        initial={false}
        animate={{ left: done ? "100%" : "0%", opacity: done && moving ? [0, 1, 1, 0] : 0 }}
        transition={{ duration: dur(0.75), ease: [0.6, 0, 0.3, 1] }}
      />
      {/* engaged: the ink rises from the bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: live ? 1 : 0, background: `linear-gradient(to top, ${inkA(d.ink, 30)}, transparent 70%)` }}
      />
      {/* the owned text band */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[72%]"
        style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--background) 94%, transparent) 30%, transparent)" }}
      />

      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: "0.9cqw 1.1cqw" }}>
        <div className="flex items-start justify-between gap-2">
          <motion.span
            className="rounded-full border px-2 py-0.5 font-mono uppercase tracking-wider"
            style={{ fontSize: "max(12px, 0.95cqw)", borderColor: inkA(d.ink, 50), color: textInk(d.ink), backgroundColor: "color-mix(in srgb, var(--background) 70%, transparent)" }}
            initial={false}
            animate={{ opacity: done ? 1 : 0, y: done ? 0 : -4 }}
            transition={{ duration: dur(0.4), delay: dur(0.5) }}
          >
            {source}
          </motion.span>
          <motion.span
            className="flex items-center justify-center rounded-full"
            style={{ width: "2cqw", height: "2cqw", backgroundColor: d.ink, boxShadow: `0 0 1.2cqw ${inkA(d.ink, 60)}` }}
            initial={false}
            animate={{ scale: done ? 1 : 0 }}
            transition={moving ? { type: "spring", stiffness: 420, damping: 18, delay: 0.5 } : { duration: 0 }}
          >
            <Check className="h-[60%] w-[60%] text-background" strokeWidth={3.2} aria-hidden="true" />
          </motion.span>
        </div>

        <div>
          <div
            className="font-mono font-bold uppercase leading-tight tracking-[0.12em] transition-colors duration-500"
            style={{ fontSize: "max(12px, 1.25cqw)", color: live ? textInk(d.ink) : "color-mix(in srgb, var(--foreground) 72%, transparent)" }}
          >
            {d.label}
          </div>
          <div className="relative mt-[0.35cqw]" style={{ minHeight: "2.6cqw" }}>
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 top-[0.7cqw] flex flex-col gap-[0.5cqw]"
              initial={false}
              animate={{ opacity: done ? 0 : 1 }}
              transition={{ duration: dur(0.3) }}
            >
              <span className="h-[0.45cqw] w-4/5 rounded-full bg-foreground/10" />
              <span className="h-[0.45cqw] w-1/2 rounded-full bg-foreground/[0.07]" />
            </motion.div>
            <motion.div
              className="font-medium leading-snug text-foreground"
              style={{ fontSize: "max(16px, 1.45cqw)" }}
              initial={false}
              animate={{ opacity: done ? 1 : 0, y: done ? 0 : 6 }}
              transition={{ duration: dur(0.45), delay: dur(0.35) }}
            >
              <DecisionText value={value} tools={d.tools} />
            </motion.div>
          </div>
        </div>
      </div>

      {phase === "asking" ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border-2"
          style={{ borderRadius: "1.1cqw", borderColor: d.ink }}
          animate={pulse ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.85 }}
          transition={pulse ? { duration: 1.4, repeat: Infinity } : { duration: 0 }}
        />
      ) : null}
    </div>
  );
}

export default memo(Tile);
