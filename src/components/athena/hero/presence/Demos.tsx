"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { BRACKETS, CX, CY, DOTS, DOT_TRACK, ORB_R, VOICE_BARS, orbOrigin } from "./geometry";

/**
 * The being acts out whichever callout is lit, at the disc itself, so the
 * label and the thing it promises are one picture:
 *
 *   talk    a voice ring of radial bars around the disc speaks
 *   tasks   the five task dots fill one by one along their arc
 *   drag    drop brackets snap round her: she sits where you put her
 *   summon  arrival rings open outward: she answers from any app
 *
 * Every group is always mounted (the clock only changes its targets), so the
 * picture never re-lays out between beats.
 */
export default function Demos({
  active, lit, live,
}: {
  active: number | null;
  /** Task dots lit, 0..5. */
  lit: number;
  live: boolean;
}) {
  const cyan = BRAND_VAR.cyan;
  const talking = active === 0;

  return (
    <g>
      {/* talk: the voice ring */}
      <g>
        {VOICE_BARS.map((b, i) => (
          <g key={b.deg} transform={`rotate(${b.deg} ${CX} ${CY})`}>
            <motion.rect
              x={CX - 1.5} y={CY - ORB_R - 10 - b.len} width={3} height={b.len} rx={1.5}
              fill={cyan}
              initial={false}
              animate={
                talking && live
                  ? { opacity: 0.9, scaleY: [0.35, 1, 0.55, 0.9, 0.35] }
                  : { opacity: talking ? 0.85 : 0.12, scaleY: talking ? 0.8 : 0.3 }
              }
              transition={
                talking && live
                  ? { scaleY: { duration: 1.1 + (i % 5) * 0.13, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.4 } }
                  : { duration: 0.6 }
              }
              style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
            />
          </g>
        ))}
      </g>

      {/* tasks: the dot arc fills */}
      <path d={DOT_TRACK} fill="none" stroke={tint("cyan", 16)} strokeWidth="1.5" />
      <motion.path
        d={DOT_TRACK} fill="none" stroke={cyan} strokeWidth="2" strokeLinecap="round"
        initial={false}
        animate={{ pathLength: lit > 0 ? (lit - 1) / 4 : 0, opacity: lit > 1 ? 0.9 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {DOTS.map((d, i) => {
        const on = i < lit;
        return (
          <motion.circle
            key={i} cx={d.x} cy={d.y} r={6}
            fill={cyan}
            initial={false}
            animate={{ opacity: on ? 1 : 0.32, scale: on ? 1.3 : 0.85 }}
            transition={SPRING_POP}
            style={{ transformBox: "view-box", transformOrigin: `${d.x}px ${d.y}px` }}
          />
        );
      })}

      {/* drag: the drop brackets */}
      <motion.g
        initial={false}
        animate={{ opacity: active === 2 ? 1 : 0, scale: active === 2 ? 1 : 1.16 }}
        transition={SPRING_POP}
        style={orbOrigin}
      >
        {BRACKETS.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={cyan} strokeWidth="2.5" strokeLinecap="round" />
        ))}
      </motion.g>

      {/* summon: arrival rings */}
      {[0, 1, 2].map((k) => (
        <motion.circle
          key={k}
          cx={CX} cy={CY} r={ORB_R + 6}
          fill="none" stroke={cyan} strokeWidth="1.5"
          initial={false}
          animate={
            active === 3 && live
              ? { opacity: [0.7, 0], scale: [1, 1.42] }
              : { opacity: active === 3 ? 0.45 - k * 0.12 : 0, scale: 1 + k * 0.12 }
          }
          transition={
            active === 3 && live
              ? { duration: 1.8, repeat: Infinity, ease: "easeOut", delay: k * 0.6 }
              : { duration: 0.5 }
          }
          style={orbOrigin}
        />
      ))}
    </g>
  );
}
