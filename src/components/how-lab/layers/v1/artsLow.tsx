"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { loopTransition } from "@/lib/motion/loop-gate";
import { frame } from "../shared/Shell";
import { ToolGlyph } from "../shared/ToolGlyph";
import type { ToolId } from "../shared/layers";
import { H, W } from "./geometry";

/** Mini art for the two lower slabs (Run, Coordinate), drawn in a 420x92 box. */

const f = frame(W, H);
export interface ArtProps {
  on: boolean;
  /** `on`, and the loop gate lets ambient motion run. */
  live: boolean;
  still: boolean;
}

const EM = BRAND_VAR.emerald;

/** Run: a laptop holding its agents, a key turning home in the keyring, a struck-out cloud. */
export function RunArt({ on, still, noServers }: ArtProps & { noServers: string }) {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 420 92" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <rect x="14" y="6" width="156" height="66" rx="7" fill={tint("emerald", on ? 10 : 4)} stroke={tint("emerald", on ? 70 : 35)} strokeWidth="2" />
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={50 + i * 42}
            cy="39"
            r="9"
            fill={tint("emerald", 30)}
            stroke={EM}
            strokeWidth="2"
            initial={false}
            animate={{ opacity: on ? 1 : 0.35, scale: on ? 1 : 0.7 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            transition={still ? { duration: 0 } : { delay: on ? 0.15 * i : 0, duration: 0.4 }}
          />
        ))}
        <path d="M2 76 H182 L172 86 H12 Z" fill={tint("emerald", on ? 22 : 10)} stroke={tint("emerald", 45)} strokeWidth="1.5" />
        {/* Keyring with the key sliding home. */}
        <circle cx="236" cy="44" r="21" fill="none" stroke={tint("emerald", on ? 80 : 35)} strokeWidth="3" />
        <motion.g
          initial={false}
          animate={{ x: on ? 0 : 34, opacity: on ? 1 : 0.5 }}
          transition={still ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: on ? 0.3 : 0 }}
        >
          <circle cx="236" cy="44" r="8" fill="none" stroke={EM} strokeWidth="3" />
          <path d="M244 44 H280 M268 44 V53 M276 44 V50" stroke={EM} strokeWidth="3" strokeLinecap="round" fill="none" />
        </motion.g>
        {/* No servers. */}
        <path
          d="M330 46 h56 a14 14 0 0 0 -4 -27 a20 20 0 0 0 -38 -4 a15 15 0 0 0 -14 31 z"
          fill="none"
          stroke="var(--muted-dark)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <motion.path
          d="M322 54 L398 4"
          stroke="var(--brand-rose)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: on ? 1 : 0 }}
          transition={still ? { duration: 0 } : { duration: 0.5, delay: on ? 0.7 : 0 }}
        />
      </svg>
      <span className="absolute -translate-x-1/2 whitespace-nowrap font-mono uppercase tracking-[0.1em] text-muted" style={{ ...f.fs(12, 12), left: f.u(362), top: f.u(56) }}>
        {noServers}
      </span>
    </div>
  );
}

const CHAIN: ToolId[] = ["gmail", "slack", "github"];

/** Coordinate: a real mail -> chat -> code chain, a pulse handing work along. */
export function CoordinateArt({ on, live, still }: ArtProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-between" style={{ paddingInline: f.u(6) }}>
      {CHAIN.map((tool, i) => (
        <div key={tool} className="contents">
          <motion.div
            className="relative flex items-center justify-center rounded-2xl border"
            style={{
              width: f.u(68),
              height: f.u(68),
              borderColor: tint("cyan", on ? 55 : 22),
              background: tint("cyan", on ? 14 : 5),
            }}
            initial={false}
            animate={{ scale: on ? 1 : 0.92 }}
            transition={still ? { duration: 0 } : { delay: on ? 0.25 * i : 0, type: "spring", stiffness: 260, damping: 18 }}
          >
            <ToolGlyph tool={tool} color={on ? "var(--foreground)" : "var(--muted-dark)"} style={{ width: f.u(34), height: f.u(34) }} />
          </motion.div>
          {i < CHAIN.length - 1 && (
            <div className="relative flex-1" style={{ height: f.u(3), marginInline: f.u(10) }}>
              <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(90deg, ${tint("cyan", 50)}, ${tint("cyan", 15)})` }} />
              <motion.div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ width: f.u(11), height: f.u(11), background: BRAND_VAR.cyan, boxShadow: `0 0 12px ${tint("cyan", 70)}` }}
                initial={false}
                animate={live ? { left: ["0%", "100%"], opacity: [0, 1, 1, 0] } : { left: "100%", opacity: on ? 1 : 0 }}
                transition={loopTransition(live, { duration: 1.1, ease: "easeInOut", delay: 0.35 * i, repeatDelay: 0.6 })}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
