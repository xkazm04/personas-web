"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CASES, TOOLS, brandInk } from "../shared/catalog";
import { CHOOSE, CONSIDER, DOCK, NEED, SCAN, type Phase } from "../shared/cycle";
import { JACK_R, PANEL, SOCKET_X, VIEW_H, VIEW_W, cablePath, jackOf, socketY } from "./geometry";

const SHEATH = "color-mix(in srgb, var(--foreground) 16%, transparent)";

/**
 * The SVG layer: the persona's panel and sockets, every cable already patched
 * (a signal pulse runs home along each while the loop plays), and the live
 * cable - it slides out of the waiting socket, probes the lit rack jack by
 * jack, seats in the chosen one with a spark, then carries a pulse home.
 */
export default function Cables({
  active,
  phase,
  docked,
  moving,
  ticking,
  scanMs,
  liveKey,
}: {
  active: number;
  phase: Phase;
  docked: boolean[];
  moving: boolean;
  ticking: boolean;
  scanMs: number;
  liveKey: string;
}) {
  const c = CASES[active];
  const sy = socketY(active);
  const chosenJack = jackOf(c.chosen);
  const plugged = phase === CHOOSE || phase === DOCK || (phase === SCAN && !moving);
  const probing = phase === SCAN && moving;
  const ready = cablePath(active, SOCKET_X + 70, sy + 34);
  const home = cablePath(active, chosenJack.x, chosenJack.y);
  const probes = c.candidates.flatMap((k) => {
    const j = jackOf(k);
    return [cablePath(active, j.x, j.y), cablePath(active, j.x, j.y)];
  });
  const ends = c.candidates.flatMap((k) => [jackOf(k), jackOf(k)]);
  const showLive = phase !== NEED && !docked[active];
  const liveInk = plugged ? brandInk(TOOLS[c.chosen], 65) : BRAND_VAR.cyan;
  const dur = (scanMs / 1000) * 0.92;
  const end = plugged ? chosenJack : { x: SOCKET_X + 70, y: sy + 34 - JACK_R * 0.4 };

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true" overflow="visible">
      <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={22} style={{ fill: tint("purple", 5), stroke: tint("purple", 30) }} strokeWidth={1.2} />
      {CASES.map((cc, i) => {
        const waiting = i === active && phase !== DOCK && !docked[i];
        return (
          <g key={cc.need}>
            <circle cx={SOCKET_X} cy={socketY(i)} r={13} style={{ fill: "var(--background)", stroke: waiting ? BRAND_VAR.cyan : tint("purple", 45) }} strokeWidth={2} />
            <circle cx={SOCKET_X} cy={socketY(i)} r={5} style={{ fill: docked[i] ? brandInk(TOOLS[cc.chosen], 70) : tint("purple", 30) }} />
          </g>
        );
      })}

      {CASES.map((cc, i) => {
        if (!docked[i]) return null;
        const j = jackOf(cc.chosen);
        const d = cablePath(i, j.x, j.y);
        const ink = brandInk(TOOLS[cc.chosen], 65);
        return (
          <g key={cc.need}>
            <path d={d} fill="none" strokeWidth={8} strokeLinecap="round" style={{ stroke: SHEATH }} />
            <path d={d} fill="none" strokeWidth={3.5} strokeLinecap="round" style={{ stroke: ink }} />
            <motion.path
              d={d}
              fill="none"
              pathLength={1}
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeDasharray="0.06 1.2"
              style={{ stroke: "var(--foreground)" }}
              initial={false}
              animate={ticking ? { strokeDashoffset: [-1, 0.06], opacity: 0.8 } : { strokeDashoffset: -1, opacity: 0 }}
              transition={ticking ? { duration: 2.4, repeat: Infinity, ease: "easeIn", delay: i * 0.4, repeatDelay: 1.2 } : { duration: 0.3 }}
            />
          </g>
        );
      })}

      {showLive && (
        <g key={liveKey}>
          <motion.path
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            style={{ stroke: SHEATH }}
            initial={{ d: ready }}
            animate={probing ? { d: probes } : { d: plugged ? home : ready }}
            transition={probing ? { duration: dur, ease: "easeInOut" } : { duration: moving ? 0.35 : 0 }}
          />
          <motion.path
            fill="none"
            strokeWidth={3.5}
            strokeLinecap="round"
            style={{ stroke: liveInk }}
            initial={{ d: ready, pathLength: moving && phase === CONSIDER ? 0 : 1 }}
            animate={probing ? { d: probes, pathLength: 1 } : { d: plugged ? home : ready, pathLength: 1 }}
            transition={probing ? { duration: dur, ease: "easeInOut" } : { duration: moving ? 0.4 : 0 }}
          />
          <motion.circle
            r={7.5}
            strokeWidth={2}
            style={{ fill: "var(--background)", stroke: liveInk }}
            initial={{ cx: end.x, cy: end.y + JACK_R * 0.4 }}
            animate={probing ? { cx: ends.map((e) => e.x), cy: ends.map((e) => e.y + JACK_R * 0.4) } : { cx: end.x, cy: end.y + JACK_R * 0.4 }}
            transition={probing ? { duration: dur, ease: "easeInOut" } : { duration: moving ? 0.35 : 0 }}
          />
          {phase === CHOOSE && (
            <motion.circle
              cx={chosenJack.x}
              cy={chosenJack.y}
              fill="none"
              strokeWidth={2.5}
              style={{ stroke: liveInk }}
              initial={{ r: JACK_R, opacity: moving ? 1 : 0 }}
              animate={moving ? { r: JACK_R * 2.6, opacity: 0 } : { r: JACK_R, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
        </g>
      )}
    </svg>
  );
}
