"use client";

import {
  easeInOut,
  motion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { HardDrive, Lock, Sparkles } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

/* ── Effort dial ────────────────────────────────────────────────────────────
 * Beats (one progress value p, 0 → END, played once in view):
 *   0-1  a small task chip drops on the hub, needle swings to Haiku, chip parks
 *   1-2  a medium chip → Sonnet
 *   2-3  a large chip → Opus
 *   3-4.4 the Offline switch flips; the orange dial dims, the inner emerald
 *        Ollama band lights, the needle shortens onto it, a locked chip lands.
 * Reduced motion and the server render show p = END (every chip parked, the
 * offline band lit, the three orange zones still drawn).
 * Ollama is a user-configured local provider in the app, not an automatic
 * fallback, so the picture shows a switch the user flips.
 */

import {
  CX, CY, DROP_Y, INNER_IN, INNER_OUT, NEEDLE, OUTER, PARK_R, TICKS, ZONES, pt, sector,
} from "./MultiProviderAI.effort-dial.geometry";

export { END, SECONDS_PER_BEAT } from "./MultiProviderAI.effort-dial.geometry";

const ease = { ease: easeInOut };

function Zone({ p, i }: { p: MotionValue<number>; i: number }) {
  const z = ZONES[i];
  const lit = useTransform(p, [i + 0.45, i + 0.65], [0.3, 1], ease);
  return (
    <motion.path
      d={sector(OUTER - z.thick, OUTER, z.from, z.to)}
      className="fill-orange-500 dark:fill-orange-400"
      style={{ opacity: lit }}
    />
  );
}

function Chip({ p, i }: { p: MotionValue<number>; i: number }) {
  const z = ZONES[i];
  const [px, py] = pt(PARK_R, z.mid);
  const x = useTransform(p, [i + 0.65, i + 0.95], [0, px - CX], ease);
  const y = useTransform(p, [i, i + 0.35, i + 0.65, i + 0.95], [DROP_Y - CY, 0, 0, py - CY], ease);
  const opacity = useTransform(p, [i, i + 0.1], [0, 1]);
  const s = z.chip;
  return (
    <g transform={`translate(${CX} ${CY})`}>
      <motion.rect
        x={-s / 2}
        y={-s / 2}
        width={s}
        height={s}
        rx={s / 4}
        className="fill-orange-500 dark:fill-orange-400"
        style={{ x, y, opacity }}
      />
    </g>
  );
}

export function Dial({ p }: { p: MotionValue<number> }) {
  const needleRotate = useTransform(
    p,
    [0.35, 0.65, 1.35, 1.65, 2.35, 2.65, 3.4, 3.8],
    [-180, -151, -151, -90, -90, -29, -29, -90],
    ease,
  );
  const needleScale = useTransform(p, [3.4, 3.8], [1, (INNER_OUT - 6) / NEEDLE], ease);
  const outerDim = useTransform(p, [3.2, 3.6], [1, 0.55], ease);
  const innerLit = useTransform(p, [3.3, 3.7], [0.22, 1], ease);
  const knob = useTransform(p, [3.0, 3.3], [0, 20], ease);
  const trackOn = useTransform(p, [3.0, 3.3], [0, 1]);
  const lockY = useTransform(p, [3.8, 4.2], [DROP_Y - CY, 0], ease);
  const lockOpacity = useTransform(p, [3.8, 3.9], [0, 1]);

  return (
    <svg viewBox="24 0 592 356" className="block h-auto w-full overflow-visible" aria-hidden>
      {/* ticks */}
      <g aria-hidden className="stroke-foreground/20" strokeWidth={1.5}>
        {TICKS.map((a) => {
          const [x0, y0] = pt(OUTER + 6, a);
          const [x1, y1] = pt(OUTER + 13, a);
          return <line key={a} x1={x0} y1={y0} x2={x1} y2={y1} />;
        })}
      </g>

      {/* baseline */}
      <line aria-hidden x1={40} y1={CY} x2={600} y2={CY} className="stroke-foreground/15" strokeWidth={1.5} />

      {/* outer orange dial: three zones, thicker = more effort */}
      <motion.g aria-hidden style={{ opacity: outerDim }}>
        {ZONES.map((z) => (
          <path key={`bg-${z.name}`} d={sector(OUTER - z.thick, OUTER, z.from, z.to)} fill="none" className="stroke-orange-500/40 dark:stroke-orange-400/30" strokeWidth={1} />
        ))}
        {ZONES.map((z, i) => (
          <Zone key={z.name} p={p} i={i} />
        ))}
      </motion.g>

      {/* inner emerald band: the single local zone */}
      <path aria-hidden d={sector(INNER_IN, INNER_OUT, 180, 0)} fill="none" stroke={tint("emerald", 45)} strokeWidth={1} />
      <motion.path
        aria-hidden
        d={sector(INNER_IN, INNER_OUT, 180, 0)}
        fill={BRAND_VAR.emerald}
        style={{ opacity: innerLit }}
      />

      {/* zone labels */}
      {ZONES.map((z) => {
        const [x, y] = pt(OUTER + 38, z.mid);
        return (
          <text
            key={`t-${z.name}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={22}
            fontWeight={600}
            className="fill-orange-700 dark:fill-orange-300"
          >
            {z.name}
          </text>
        );
      })}

      {/* needle */}
      <g transform={`translate(${CX} ${CY})`} aria-hidden>
        <motion.g style={{ rotate: needleRotate }}>
          <circle r={NEEDLE} fill="none" stroke="none" />
          <motion.g style={{ scaleX: needleScale }}>
            <circle r={NEEDLE} fill="none" stroke="none" />
            <polygon points={`0,-5 ${NEEDLE},0 0,5`} className="fill-foreground/80" />
          </motion.g>
        </motion.g>
        <circle r={22} className="fill-background stroke-foreground/30" strokeWidth={2} />
      </g>

      {/* task chips, sized by weight */}
      {ZONES.map((z, i) => (
        <Chip key={`c-${z.name}`} p={p} i={i} />
      ))}

      {/* private task: locked chip lands on the hub */}
      <g transform={`translate(${CX} ${CY})`} aria-hidden>
        <motion.g style={{ y: lockY, opacity: lockOpacity }}>
          <rect x={-15} y={-15} width={30} height={30} rx={8} fill={tint("emerald", 25)} stroke={BRAND_VAR.emerald} strokeWidth={2} />
          <Lock x={-9} y={-9} width={18} height={18} color={BRAND_VAR.emerald} strokeWidth={2.4} />
        </motion.g>
      </g>

      {/* feet: Claude mark, Ollama, offline switch */}
      <Sparkles aria-hidden x={CX - OUTER + 4} y={CY + 12} width={22} height={22} className="text-orange-500 dark:text-orange-400" />
      <HardDrive aria-hidden x={CX - INNER_OUT - 44} y={CY + 14} width={20} height={20} color={BRAND_VAR.emerald} />
      <text x={CX - INNER_OUT - 18} y={CY + 25} dominantBaseline="middle" fontSize={22} fontWeight={600} fill={BRAND_VAR.emerald}>
        Ollama
      </text>

      <text x={CX + INNER_OUT + 58} y={CY + 25} textAnchor="end" dominantBaseline="middle" fontSize={22} fontWeight={600} className="fill-foreground/75">
        Offline
      </text>
      <g aria-hidden transform={`translate(${CX + INNER_OUT + 68} ${CY + 13})`}>
        <rect width={44} height={24} rx={12} className="fill-foreground/10 stroke-foreground/25" strokeWidth={1} />
        <motion.rect width={44} height={24} rx={12} fill={BRAND_VAR.emerald} style={{ opacity: trackOn }} />
        <motion.circle cx={12} cy={12} r={9} className="fill-background" style={{ x: knob }} />
      </g>
    </svg>
  );
}

