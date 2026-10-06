"use client";

import { motion } from "framer-motion";
import type { DimCopy } from "./shared/copy";
import DecisionText from "./shared/DecisionText";
import { inkA } from "./shared/dims";
import type { DimPhase } from "./shared/timeline";
import { u } from "./geometry";

export const LABEL_SIZE = "max(12px, 1.15cqw)";
export const VALUE_SIZE = "max(16px, 1.5cqw)";

/** Text ink lifted toward the foreground, so small labels keep contrast. */
export const textInk = (ink: string) => `color-mix(in oklab, ${ink} 78%, var(--foreground))`;

/**
 * A drawing annotation: the dimension's name (and where the decision came
 * from) is pencilled in from the start; the decision itself is written in
 * when it lands.
 */
export default function Callout({
  d,
  box,
  phase,
  value,
  source,
  moving,
}: {
  d: DimCopy;
  box: { x: number; y: number; w: number; h: number; align?: "left" | "right" };
  phase: DimPhase;
  value: string;
  source: string;
  moving: boolean;
}) {
  const live = phase !== "pending";
  const done = phase === "resolved";
  const right = box.align === "right";
  return (
    <div
      className={`absolute flex flex-col ${right ? "items-end text-right" : ""}`}
      style={{ left: u(box.x), top: u(box.y), width: u(box.w), height: u(box.h) }}
    >
      <div className={`flex flex-wrap items-baseline gap-x-2 ${right ? "justify-end" : ""}`}>
        <span
          className="font-mono font-bold uppercase tracking-[0.12em] transition-colors duration-500"
          style={{ fontSize: LABEL_SIZE, color: live ? textInk(d.ink) : "color-mix(in srgb, var(--foreground) 62%, transparent)" }}
        >
          {d.label}
        </span>
        <motion.span
          className="font-mono uppercase tracking-wider"
          style={{ fontSize: LABEL_SIZE, color: "color-mix(in srgb, var(--foreground) 70%, transparent)" }}
          initial={false}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: moving ? 0.4 : 0, delay: moving ? 0.4 : 0 }}
        >
          {source}
        </motion.span>
      </div>
      <motion.div
        className="mt-[0.4cqw] font-medium leading-snug text-foreground"
        style={{ fontSize: VALUE_SIZE }}
        initial={false}
        animate={{ opacity: done ? 1 : 0, x: done || !moving ? 0 : right ? 8 : -8 }}
        transition={{ duration: moving ? 0.45 : 0, delay: moving ? 0.25 : 0 }}
      >
        <DecisionText value={value} tools={d.tools} />
      </motion.div>
      <span
        aria-hidden="true"
        className="mt-auto block h-px transition-[width] duration-700"
        style={{ width: done ? "100%" : "0%", backgroundColor: inkA(d.ink, 40) }}
      />
    </div>
  );
}
