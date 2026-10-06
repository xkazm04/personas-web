"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { loopTransition } from "@/lib/motion/loop-gate";
import { frame } from "../shared/Shell";
import { H, W } from "./geometry";
import type { ArtProps } from "./artsLow";

/** Mini art for the two upper slabs (Design, Monitor), drawn in a 420x92 box. */

const f = frame(W, H);
const PU = BRAND_VAR.purple;

/** Design: a plain sentence types itself out and becomes an agent. */
export function DesignArt({ on, live, still, prompt }: ArtProps & { prompt: string }) {
  return (
    <div className="relative flex h-full w-full items-center" style={{ gap: f.u(14) }}>
      <div
        className="relative flex min-w-0 flex-1 items-center rounded-full border"
        style={{ height: f.u(50), paddingInline: f.u(18), borderColor: tint("purple", on ? 50 : 20), background: tint("purple", on ? 10 : 4) }}
      >
        <motion.span
          className="block overflow-hidden whitespace-nowrap text-foreground"
          style={f.fs(17, 13)}
          initial={false}
          animate={{ clipPath: on ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
          transition={still ? { duration: 0 } : { duration: on ? 1.2 : 0.2, ease: "linear" }}
        >
          {prompt}
        </motion.span>
        <motion.span
          aria-hidden
          className="ml-[2px] inline-block shrink-0 rounded-full"
          style={{ width: 2, height: "45%", background: PU }}
          animate={{ opacity: live ? [1, 0, 1] : 1 }}
          transition={loopTransition(live, { duration: 0.9 })}
        />
      </div>
      <svg viewBox="0 0 24 24" aria-hidden className="shrink-0" style={{ width: f.u(26), height: f.u(26) }}>
        <path d="M4 12h14m-5-6 6 6-6 6" stroke={tint("purple", on ? 90 : 35)} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* The agent it becomes: a small face that pops in once the sentence is done. */}
      <motion.div
        className="relative flex shrink-0 items-center justify-center rounded-2xl border"
        style={{ width: f.u(66), height: f.u(66), borderColor: tint("purple", 60), background: tint("purple", 18) }}
        initial={false}
        animate={{ scale: on ? 1 : 0.6, opacity: on ? 1 : 0.35, boxShadow: on ? `0 0 26px ${tint("purple", 50)}` : "0 0 0px transparent" }}
        transition={still ? { duration: 0 } : { delay: on ? 1.25 : 0, type: "spring", stiffness: 260, damping: 16 }}
      >
        <svg viewBox="0 0 40 40" aria-hidden style={{ width: "62%", height: "62%" }}>
          <rect x="6" y="9" width="28" height="22" rx="9" fill="none" stroke={PU} strokeWidth="2.6" />
          <circle cx="15" cy="20" r="2.6" fill={PU} />
          <circle cx="25" cy="20" r="2.6" fill={PU} />
          <path d="M20 9V4" stroke={PU} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
}

/** Per-colour opacity keyframes for the node: amber -> rose -> emerald. */
const OPACITY_KEYS = [
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
];

const BEAT = "M0 52 H70 L84 52 L94 22 L106 80 L116 52 H170 L182 52 L190 74 L200 30 L210 52 H300";

/** Monitor: a live trace with one stumble, and the run marked healed. */
export function MonitorArt({ on, live, healed }: ArtProps & { healed: string }) {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 420 92" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path d={BEAT} fill="none" stroke={tint("amber", 22)} strokeWidth="2.5" />
        <motion.path
          d={BEAT}
          fill="none"
          stroke={BRAND_VAR.amber}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={live ? { pathLength: [0, 1], opacity: [1, 1, 0.4] } : { pathLength: on ? 1 : 0.15, opacity: 1 }}
          transition={loopTransition(live, { duration: 2.2, ease: "linear", repeatDelay: 0.3 })}
        />
        {/* The run's node: amber while it runs, a rose stumble, then healed green. */}
        {(["amber", "rose", "emerald"] as const).map((k, i) => (
          <motion.circle
            key={k}
            cx="326"
            cy="52"
            r="15"
            fill={tint(k, k === "emerald" && !on ? 12 : 38)}
            stroke={BRAND_VAR[k]}
            strokeWidth="3"
            initial={false}
            animate={live ? { opacity: OPACITY_KEYS[i] } : { opacity: k === "emerald" ? 1 : 0 }}
            transition={loopTransition(live, { duration: 2.5, ease: "easeInOut", repeatDelay: 0.2 })}
          />
        ))}
      </svg>
      <span
        className="absolute flex items-center font-mono uppercase tracking-[0.14em]"
        style={{ ...f.fs(13, 12), left: f.u(350), top: "50%", transform: "translateY(-50%)", color: BRAND_VAR.emerald, gap: f.u(4) }}
      >
        <Check aria-hidden style={{ width: "1.1em", height: "1.1em" }} />
        {healed}
      </span>
    </div>
  );
}
