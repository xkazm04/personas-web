"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY, FLOW, HOURS, MARKS, NIGHT_START, NIGHT_TWITCH, SKY_STOPS, TICKS } from "./data";
import { BAND, pt, rangeRect, tickLine, viewBox, type Orientation } from "./geometry";

/**
 * The day, drawn — one SVG band from morning to the small hours.
 * Sky gradient dawn→day→dusk→night runs along the band; the top lane is
 * a typical assistant's interruption storm, the bottom lane is Athena's
 * three luminous moments. Night dims both lanes; the storm still
 * twitches once at 2 am. All positions are precomputed constants.
 *
 * Reduced motion: the fully composed timeline renders statically —
 * `animate`/`whileInView` props are gated, elements are never dropped.
 */
export default function TimelineBand({ orientation }: { orientation: Orientation }) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const o = orientation;

  const skyId = `${uid}-sky`;
  const glowId = `${uid}-glow`;
  const grad =
    o === "h" ? { x1: "0", y1: "0", x2: "1", y2: "0" } : { x1: "0", y1: "0", x2: "0", y2: "1" };

  const flow = rangeRect(o, FLOW.start, FLOW.end);
  const night = rangeRect(o, NIGHT_START, 1);
  const horizonA = pt(o, 0, BAND.horizon);
  const horizonB = pt(o, 1, BAND.horizon);
  const athenaA = pt(o, 0, BAND.laneAthena);
  const athenaB = pt(o, NIGHT_START, BAND.laneAthena);
  const twitch = tickLine(o, NIGHT_TWITCH.t, NIGHT_TWITCH.h);

  /** Springy tick entrance — the storm arrives relentlessly, in order. */
  const tickMotion = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, scale: 0.4 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, duration: 0.45, delay: 0.2 + i * 0.018 },
        };

  return (
    <svg
      viewBox={viewBox(o)}
      role="img"
      aria-label={COPY.bandAria}
      className={o === "h" ? "h-auto w-full" : "h-full w-full"}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={skyId} {...grad}>
          {SKY_STOPS.map((s) => (
            <stop key={s.at} offset={s.at} stopColor={tint(s.key as BrandKey, s.pct)} />
          ))}
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor={tint("cyan", 45)} />
          <stop offset="100%" stopColor={tint("cyan", 0)} />
        </radialGradient>
      </defs>

      {/* Sky wash behind the horizon — the sun's arc, implied */}
      <rect
        {...rangeRect(o, 0, 1)}
        fill={`url(#${skyId})`}
        opacity={0.16}
      />

      {/* Flow-state stretch — subtly shaded; Athena's lane stays empty here */}
      <rect {...flow} fill={tint("cyan", 6)} />

      {/* The horizon — one quiet line carrying the day's light */}
      <line
        x1={horizonA.x} y1={horizonA.y} x2={horizonB.x} y2={horizonB.y}
        stroke={`url(#${skyId})`} strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Typical-assistant lane: the interruption storm */}
      <g>
        {TICKS.map(([t, h], i) => {
          const l = tickLine(o, t, h);
          return (
            <motion.line
              key={i}
              {...l}
              stroke={tint("rose", t >= NIGHT_START ? 30 : 60)}
              strokeWidth={2}
              strokeLinecap="round"
              style={{ transformBox: "view-box", transformOrigin: `${l.x1}px ${l.y1}px` }}
              {...tickMotion(i)}
            />
          );
        })}
        {/* …and one twitch at 2 am, while everyone sleeps */}
        <motion.line
          {...twitch}
          stroke={tint("rose", 40)}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={reduced ? 0.5 : undefined}
          animate={reduced ? undefined : { opacity: [0.12, 0.6, 0.12] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
      </g>

      {/* Athena's lane: a faint thread that simply ends when night begins */}
      <line
        x1={athenaA.x} y1={athenaA.y} x2={athenaB.x} y2={athenaB.y}
        stroke={tint("cyan", 22)} strokeWidth={1} strokeDasharray="1 6" strokeLinecap="round"
      />

      {/* Her three moments — soft blooms, placed with intent */}
      {MARKS.map((m, i) => {
        const p = pt(o, m.t, BAND.laneAthena);
        return (
          <g key={m.id}>
            <motion.circle
              cx={p.x} cy={p.y} r={16} fill={`url(#${glowId})`}
              style={{ transformBox: "view-box", transformOrigin: `${p.x}px ${p.y}px` }}
              {...(reduced
                ? {}
                : {
                    initial: { opacity: 0, scale: 0.3 },
                    whileInView: { opacity: 1, scale: 1 },
                    viewport: REPLAY,
                    transition: { ...SPRING_POP, delay: 0.6 + i * 0.22 },
                  })}
            />
            <circle cx={p.x} cy={p.y} r={3.5} fill={BRAND_VAR.cyan} />
          </g>
        );
      })}

      {/* Night falls — both lanes dim under it */}
      <rect {...night} className="fill-background" opacity={0.45} />

      {/* Hour marks along the horizon */}
      {HOURS.map((hr) => {
        const p = pt(o, hr.t, BAND.horizon);
        return (
          <text
            key={hr.label}
            x={o === "h" ? p.x : 16}
            y={o === "h" ? BAND.horizon + 20 : p.y + 4}
            textAnchor={o === "h" ? "middle" : "start"}
            className="fill-current text-muted-dark"
            fontSize={12}
          >
            {hr.label}
          </text>
        );
      })}
    </svg>
  );
}
