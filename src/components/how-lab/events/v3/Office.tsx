"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { DESKS, HUB, LEGS, TUBES, TRAVEL_MS, VB_H, VB_W, deskState, isBack, legOfPhase } from "./geometry";
import { Desk, Tube } from "./Parts";

const GLASS = "color-mix(in srgb, var(--foreground) 16%, transparent)";
const LEG_S = TRAVEL_MS / 1000;
const colorOf = (id: string) => {
  const desk = DESKS.find((d) => d.id === id);
  return desk ? BRAND_VAR[desk.brand] : BRAND_VAR.cyan;
};

/** A capsule: a short, round-capped dash riding a tube. */
function Capsule({ d, delay, run, color }: { d: string; delay: number; run: boolean; color: string }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={11}
      strokeLinecap="round"
      initial={{ pathLength: 0.07, pathSpacing: 1, pathOffset: -0.07 }}
      animate={run ? { pathOffset: [-0.07, 1] } : { pathOffset: -0.07 }}
      transition={run ? { delay, duration: LEG_S * 0.45, ease: "easeInOut" } : { duration: 0 }}
    />
  );
}

/**
 * The drawn office. Tubes are glass with a core that lights once a leg has
 * used it; the current leg's capsule rides into the hub, the hub flashes, and
 * it rides out to the next desk. Still frame: every tube lit, every desk done.
 */
export default function Office({ uid, phase, run }: { uid: string; phase: number; run: boolean }) {
  const leg = legOfPhase(phase);
  const used = (id: string) => LEGS.some((l, i) => phase >= 2 * i && (l.from === id || l.to === id));
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-hub`} x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity="0.1" />
          <stop offset="45%" stopColor="var(--brand-cyan)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--brand-purple)" stopOpacity="0.12" />
        </linearGradient>
        <radialGradient id={`${uid}-floor`}>
          <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--brand-cyan)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <polygon points="450,118 884,336 450,554 16,336" fill={tint("cyan", 4)} stroke={GLASS} strokeWidth={1.5} />
      <polygon points="450,190 738,336 450,482 162,336" fill="none" stroke={GLASS} strokeDasharray="3 8" />
      <ellipse cx={HUB.x} cy={HUB.base + 6} rx={260} ry={120} fill={`url(#${uid}-floor)`} />

      <Tube d={TUBES.source.in} color={colorOf("source")} lit={used("source")} />
      <Tube d={TUBES.sink.in} color={colorOf("sink")} lit={used("sink")} />
      {DESKS.filter(isBack).map((d) => (
        <Tube key={`t-${d.id}`} d={TUBES[d.id].in} color={colorOf(d.id)} lit={used(d.id)} />
      ))}
      {DESKS.filter(isBack).map((d) => (
        <Desk key={d.id} desk={d} state={deskState(DESKS.indexOf(d), phase)} run={run} />
      ))}

      {/* The hub column: glass, flashing as each capsule passes through. */}
      <rect x={HUB.x - HUB.rx} y={HUB.top} width={HUB.rx * 2} height={HUB.base - HUB.top} fill={`url(#${uid}-hub)`} />
      <ellipse cx={HUB.x} cy={HUB.base} rx={HUB.rx} ry={HUB.ry} fill={tint("cyan", 14)} stroke={tint("cyan", 50)} />
      <motion.rect
        key={`flash-${phase}`}
        x={HUB.x - HUB.rx}
        y={HUB.top}
        width={HUB.rx * 2}
        height={HUB.base - HUB.top}
        fill="var(--brand-cyan)"
        initial={{ opacity: 0 }}
        animate={run && leg >= 0 ? { opacity: [0, 0.35, 0] } : { opacity: 0 }}
        transition={run && leg >= 0 ? { delay: LEG_S * 0.42, duration: 0.6 } : { duration: 0 }}
      />
      <line x1={HUB.x - HUB.rx} y1={HUB.top} x2={HUB.x - HUB.rx} y2={HUB.base} stroke={tint("cyan", 50)} />
      <line x1={HUB.x + HUB.rx} y1={HUB.top} x2={HUB.x + HUB.rx} y2={HUB.base} stroke={tint("cyan", 50)} />
      <ellipse cx={HUB.x} cy={HUB.top} rx={HUB.rx} ry={HUB.ry} fill={tint("cyan", 22)} stroke={tint("cyan", 70)} strokeWidth={1.5} />
      <path d={`M${HUB.x - HUB.rx + 14} ${HUB.top + 30} V${HUB.base - 18}`} stroke="var(--foreground)" strokeOpacity={0.22} strokeWidth={5} strokeLinecap="round" />

      {DESKS.filter((d) => !isBack(d)).map((d) => (
        <Tube key={`t-${d.id}`} d={TUBES[d.id].in} color={colorOf(d.id)} lit={used(d.id)} />
      ))}
      {DESKS.filter((d) => !isBack(d)).map((d) => (
        <Desk key={d.id} desk={d} state={deskState(DESKS.indexOf(d), phase)} run={run} />
      ))}

      {LEGS.map((l, i) => (
        <g key={`${i}-${phase}`} opacity={leg === i ? 1 : 0}>
          <Capsule d={TUBES[l.from].in} delay={0} run={run && leg === i} color={colorOf(l.from)} />
          <Capsule d={TUBES[l.to].out} delay={LEG_S * 0.5} run={run && leg === i} color={colorOf(l.from)} />
        </g>
      ))}
    </svg>
  );
}
