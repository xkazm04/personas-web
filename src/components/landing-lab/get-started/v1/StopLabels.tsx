"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { frame } from "../shared/ArtBox";
import { beat } from "../shared/motion";
import { GATES, H, LOOP, STOPS, W, onLoop } from "./trailGeometry";

/* The words of V1, laid over the map in the same coordinates: one title and one
 * line per stop. Each stop is a button that walks you to it. */

const { place, fs } = frame(W, H);
const TONE = { install: "text-brand-cyan", describe: "text-brand-purple", build: "text-brand-emerald", run: "text-brand-amber", away: "text-brand-emerald" } as const;

function Stop({ p, i, onSeek }: { p: MotionValue<number>; i: number; onSeek: (at: number) => void }) {
  const s = STOPS[i];
  const steps = useTranslation().t.landingLab.getStarted.steps;
  const opacity = useTransform(p, (v) => 0.5 + 0.5 * beat(v, s.at, 0.05));
  const step = steps[s.key];
  return (
    <motion.div style={{ ...place(s.text.x, s.text.y, s.text.w), opacity }}>
      <button
        type="button"
        onClick={() => onSeek(s.at)}
        className="group block w-full rounded-xl p-[0.4em] text-left transition-colors hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
        style={fs(19, 16)}
      >
        <span className={`block font-bold leading-tight ${TONE[s.key]}`} style={{ fontSize: "1.2em" }}>
          <span className="mr-[0.35em] font-mono text-[0.8em] opacity-80">{s.n}</span>
          {step.title}
        </span>
        <span className="mt-[0.2em] block leading-snug text-foreground/85">{step.line}</span>
      </button>
    </motion.div>
  );
}

function Tag({ x, y, w, children, className = "" }: { x: number; y: number; w: number; children: React.ReactNode; className?: string }) {
  return (
    <span className={`pointer-events-none text-center font-semibold leading-none ${className}`} style={{ ...place(x - w / 2, y, w), ...fs(15, 12) }}>
      {children}
    </span>
  );
}

export default function StopLabels({ p, onSeek }: { p: MotionValue<number>; onSeek: (at: number) => void }) {
  const c = useTranslation().t.landingLab.getStarted;
  const [mx, my] = onLoop(GATES.morning, LOOP.r - 44);
  const [ex, ey] = onLoop(GATES.email, LOOP.r - 50);
  const b = STOPS[2];
  return (
    <>
      {STOPS.map((s, i) => (
        <Stop key={s.key} p={p} i={i} onSeek={onSeek} />
      ))}
      <Tag x={b.x + 82} y={b.y + 112} w={90} className="text-foreground/80">{c.gmail}</Tag>
      <Tag x={b.x + 170} y={b.y + 74} w={90} className="text-foreground/80">{c.slack}</Tag>
      <Tag x={mx - 6} y={my - 8} w={70} className="text-brand-amber">{c.v1.morning}</Tag>
      <Tag x={ex + 84} y={ey - 2} w={110} className="text-brand-cyan">{c.v1.newEmail}</Tag>
      <Tag x={LOOP.cx} y={LOOP.cy - 10} w={140} className="text-brand-emerald">{c.v1.agent}</Tag>
    </>
  );
}
