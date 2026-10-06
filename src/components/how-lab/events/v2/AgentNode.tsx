"use client";

import { motion } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import { BADGE_R, VB_W, pct } from "./geometry";

/**
 * One agent on the circuit: a badge whose ring fills while it works, its name,
 * and what it hands back to the hub once it is done.
 */
export default function AgentNode({
  x,
  y,
  side,
  Icon,
  name,
  result,
  state,
  workMs,
  run,
  tone,
  listening,
  working,
}: {
  x: number;
  y: number;
  side: "left" | "right";
  Icon: LucideIcon;
  name: string;
  result: string;
  state: "listening" | "working" | "done";
  workMs: number;
  run: boolean;
  tone: string;
  listening: string;
  working: string;
}) {
  const on = state !== "listening";
  const size = `${((BADGE_R * 2) / VB_W) * 100}cqw`;
  const anchor = side === "right" ? { left: pct(x, y).left, marginLeft: `calc(${size} / -2)` } : { right: `${100 - (x / VB_W) * 100}%`, marginRight: `calc(${size} / -2)` };
  return (
    <div className={`absolute flex -translate-y-1/2 items-center gap-[1cqw] ${side === "left" ? "flex-row-reverse text-right" : ""}`} style={{ top: pct(x, y).top, ...anchor }}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div
          className="flex h-full w-full items-center justify-center rounded-full border-2 bg-background transition-[border-color,box-shadow,background-color] duration-500"
          style={{
            borderColor: on ? tone : "color-mix(in srgb, var(--foreground) 22%, transparent)",
            boxShadow: on ? `0 0 2cqw color-mix(in srgb, ${tone} 45%, transparent)` : "none",
            background: on
              ? `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${tone} 30%, var(--background)), color-mix(in srgb, ${tone} 8%, var(--background)))`
              : "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--foreground) 8%, var(--background)), var(--background))",
          }}
        >
          <Icon className="h-[46%] w-[46%]" style={{ color: on ? tone : "var(--muted-dark)" }} aria-hidden="true" />
        </div>
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute -inset-[12%] h-[124%] w-[124%] -rotate-90" aria-hidden="true">
          <motion.circle
            cx={50}
            cy={50}
            r={47}
            fill="none"
            stroke={tone}
            strokeWidth={3}
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: state === "listening" ? 0 : 1, opacity: state === "working" ? 1 : 0 }}
            transition={{ pathLength: { duration: run && state === "working" ? workMs / 1000 : 0, ease: "linear" }, opacity: { duration: run ? 0.3 : 0 } }}
          />
        </svg>
      </div>
      <div className={`flex min-w-0 flex-col gap-[0.35cqw] ${side === "left" ? "items-end" : "items-start"}`}>
        <span className="whitespace-nowrap text-[clamp(14px,1.55cqw,28px)] font-semibold leading-tight text-foreground">{name}</span>
        {state === "done" ? (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: run ? 0.3 : 0 }}
            className="flex w-fit items-center gap-[0.4cqw] whitespace-nowrap rounded-full border px-[0.8cqw] py-[0.2cqw] text-[clamp(12px,1.25cqw,22px)] text-foreground"
            style={{ borderColor: `color-mix(in srgb, ${tone} 50%, transparent)`, backgroundColor: `color-mix(in srgb, ${tone} 14%, var(--background))` }}
          >
            <Check className="h-[1.1em] w-[1.1em]" style={{ color: tone }} aria-hidden="true" />
            {result}
          </motion.span>
        ) : (
          <span className="whitespace-nowrap font-mono text-[clamp(12px,1.1cqw,20px)] uppercase tracking-wider" style={{ color: state === "working" ? tone : "var(--muted-dark)" }}>
            {state === "working" ? working : listening}
          </span>
        )}
      </div>
    </div>
  );
}
