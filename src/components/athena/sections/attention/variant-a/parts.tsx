"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";
import {
  EDITOR, CHROME_H, CHROME_DOTS, CODE_LINES, HEAL_LINE, CARET,
  GLOW, COUNTER, T, originAt,
} from "./geometry";

/*
 * SVG fragments for the visitor's-screen scene. All continuous/entrance
 * motion gates on the `reduced` prop (passed from index.tsx) at the
 * `animate`/`whileInView` props — markup never changes shape. Under
 * reduced motion every part renders its healed end-state.
 */

/** The visitor's editor window, mid-flow. Squeezes under chaos, re-expands on heal. */
export function EditorWindow({ reduced }: { reduced: boolean }) {
  const line = "rgba(var(--surface-overlay), 0.10)";
  return (
    <motion.g
      {...(reduced
        ? {}
        : {
            initial: { scale: 1 },
            whileInView: { scale: [1, 0.98, 0.98, 1] },
            viewport: REPLAY,
            transition: { duration: 3.6, times: [0, 0.2, 0.82, 1], ease: "easeInOut" },
          })}
      style={originAt(EDITOR.x + EDITOR.w / 2, EDITOR.y + EDITOR.h / 2)}
    >
      <rect
        x={EDITOR.x} y={EDITOR.y} width={EDITOR.w} height={EDITOR.h} rx={EDITOR.r}
        fill="rgba(var(--surface-overlay), 0.04)"
        stroke="rgba(var(--surface-overlay), 0.12)"
      />
      {/* Window chrome */}
      <line
        x1={EDITOR.x} y1={EDITOR.y + CHROME_H} x2={EDITOR.x + EDITOR.w} y2={EDITOR.y + CHROME_H}
        stroke="rgba(var(--surface-overlay), 0.10)"
      />
      {CHROME_DOTS.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={4.5}
          fill={tint((["rose", "amber", "emerald"] as const)[i], 55)} />
      ))}
      {/* Abstract code lines — the work itself; hot lines are the flow */}
      {CODE_LINES.map((l, i) => (
        <rect key={i} x={l.x} y={l.y} width={l.w} height={10} rx={5}
          fill={l.hot ? tint("cyan", 38) : line} />
      ))}
      {/* Flow resumes: this line types itself once the screen heals */}
      <motion.rect
        x={HEAL_LINE.x} y={HEAL_LINE.y} width={HEAL_LINE.w} height={HEAL_LINE.h} rx={5}
        fill={tint("cyan", 55)}
        {...(reduced
          ? {}
          : {
              initial: { scaleX: 0 },
              whileInView: { scaleX: 1 },
              viewport: REPLAY,
              transition: { delay: T.heal, duration: 0.7, ease: "easeOut" },
            })}
        style={originAt(HEAL_LINE.x, HEAL_LINE.y)}
      />
      <motion.rect
        x={CARET.x} y={CARET.y} width={CARET.w} height={CARET.h}
        fill={BRAND_VAR.cyan}
        opacity={reduced ? 0.8 : undefined}
        animate={reduced ? undefined : { opacity: [0, 0, 1, 0.15, 1] }}
        transition={{ delay: T.heal + 0.5, duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.g>
  );
}

/** The one calm presence at the screen's edge — brightens as it absorbs. */
export function PresenceGlow({ reduced }: { reduced: boolean }) {
  const uid = useId();
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity="0.45" />
          <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Ambient halo — grows brighter once everything is held */}
      <motion.circle
        cx={GLOW.x} cy={GLOW.y} r={GLOW.r * 2.6}
        fill={`url(#${uid}-halo)`}
        opacity={reduced ? 0.9 : undefined}
        {...(reduced
          ? {}
          : {
              initial: { opacity: 0.4, scale: 1 },
              whileInView: { opacity: [0.4, 0.45, 0.95], scale: [1, 1, 1.14] },
              viewport: REPLAY,
              transition: { duration: 3.5, times: [0, 0.62, 1], ease: "easeOut" },
            })}
        style={originAt(GLOW.x, GLOW.y)}
      />
      {/* The quiet core */}
      <circle cx={GLOW.x} cy={GLOW.y} r={GLOW.r * 0.42} fill={tint("cyan", 85)} />
      <circle cx={GLOW.x} cy={GLOW.y} r={GLOW.r} fill="none" stroke={tint("cyan", 40)} strokeWidth="1" />
    </g>
  );
}

/** "7 held for later" chip — proof nothing was dropped. */
export function HeldCounter({ reduced }: { reduced: boolean }) {
  return (
    <motion.g
      {...(reduced
        ? {}
        : {
            initial: { opacity: 0, scale: 0.7, rotate: -3 },
            whileInView: { opacity: 1, scale: 1, rotate: 0 },
            viewport: REPLAY,
            transition: { ...SPRING_POP, delay: T.counter },
          })}
      style={originAt(COUNTER.cx, COUNTER.cy)}
    >
      <rect
        x={COUNTER.cx - COUNTER.w / 2} y={COUNTER.cy - COUNTER.h / 2}
        width={COUNTER.w} height={COUNTER.h} rx={COUNTER.r}
        fill={tint("cyan", 10)} stroke={tint("cyan", 45)}
      />
      <text
        x={COUNTER.cx} y={COUNTER.cy + 4.5} textAnchor="middle"
        fontSize={14} className="fill-current font-mono text-brand-cyan"
      >
        {COPY.counter}
      </text>
    </motion.g>
  );
}
