"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { Frame } from "../shared/art";
import type { DialGeo } from "./layout";

/**
 * How much she does on her own - now an actual dial.
 *
 * The live section drew a slider; this is a machined knob with three detents
 * on a 270-degree track, standing on your side of the line. The knob turns on
 * a spring from one detent to the next, the track fills behind it, and each
 * detent lights as it is reached. At the top stop one ring leaves the knob,
 * once. Its setting is written under it in the scene's display voice; its name
 * sits above it like the engraving on a panel.
 *
 * The knob is an HTML disc turned with a plain rotate, so the one moving
 * control in the scene stays off the layout path entirely.
 */
const SWEEP = 135;
const TURN = { type: "spring", stiffness: 70, damping: 12 } as const;

const rad = (deg: number) => (deg * Math.PI) / 180;

export default function Dial({
  d,
  on,
  level,
  W,
  H,
  f,
  reduced,
}: {
  d: DialGeo;
  on: boolean;
  level: number;
  W: number;
  H: number;
  f: Frame;
  reduced: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const c = useTranslation().t.athenaPage.workshop.dial;
  const at = Math.min(Math.max(level, 0), 2);
  const topped = level >= 2;
  const { cx, cy, r } = d;
  const pt = (deg: number, rr: number) => `${cx + rr * Math.sin(rad(deg))} ${cy - rr * Math.cos(rad(deg))}`;
  const track = `M ${pt(-SWEEP, r * 0.84)} A ${r * 0.84} ${r * 0.84} 0 1 1 ${pt(SWEEP, r * 0.84)}`;
  const angle = -SWEEP + at * SWEEP;

  return (
    <>
      <div
        className="absolute rounded-2xl border bg-surface/70 backdrop-blur-md"
        style={{
          ...f.box(d.panel.x, d.panel.y, d.panel.w, d.panel.h),
          borderColor: tint("cyan", topped ? 34 : 20),
          boxShadow: `inset 0 1px 0 ${tint("cyan", 20)}, 0 24px 60px -30px ${tint("cyan", 40)}`,
        }}
        aria-hidden="true"
      />
      <motion.svg
        viewBox={`0 0 ${W} ${H}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        initial={false}
        animate={{ opacity: on ? 1 : 0.3 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
        aria-hidden="true"
      >
        <defs>
          <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r * 1.14} fill={tint("cyan", 4)} stroke={tint("cyan", 22)} strokeWidth={1.5} />
        <path d={track} fill="none" stroke={tint("cyan", 14)} strokeWidth={r * 0.12} strokeLinecap="round" />
        {[0, 1].map((glow) => (
          <motion.path
            key={glow}
            d={track}
            fill="none"
            stroke={BRAND_VAR.cyan}
            strokeOpacity={glow ? 0.55 : 1}
            strokeWidth={r * (glow ? 0.2 : 0.12)}
            strokeLinecap="round"
            filter={glow ? `url(#${id}-glow)` : undefined}
            initial={false}
            animate={{ pathLength: level < 1 ? 0.001 : at / 2 }}
            transition={reduced ? { duration: 0 } : TURN}
          />
        ))}
        {[-SWEEP, 0, SWEEP].map((deg, i) => {
          const [x, y] = pt(deg, r * 1.14).split(" ").map(Number);
          return (
            <circle
              key={deg}
              cx={x}
              cy={y}
              r={r * 0.06}
              fill={level >= i ? BRAND_VAR.cyan : tint("cyan", 22)}
              className="transition-[fill] duration-500"
            />
          );
        })}
        {topped && !reduced && (
          <motion.circle
            cx={cx}
            cy={cy}
            fill="none"
            stroke={tint("cyan", 60)}
            strokeWidth={2}
            initial={{ r: r * 0.6, opacity: 0 }}
            animate={{ r: r * 1.4, opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        )}
      </motion.svg>

      {/* The knob: HTML, so it turns about its own centre on a plain rotate */}
      <motion.span
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ ...f.at(cx, cy), width: f.len(r * 1.2), height: f.len(r * 1.2) }}
        initial={false}
        animate={{ opacity: on ? 1 : 0.3 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
        aria-hidden="true"
      >
        <motion.span
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: tint("cyan", topped ? 75 : 50),
            background: `radial-gradient(circle at 38% 30%, ${tint("cyan", 28)}, ${tint("cyan", 6)} 70%)`,
            boxShadow: `inset 0 2px 0 ${tint("cyan", 30)}, 0 10px 30px -10px ${tint("cyan", 50)}`,
          }}
          initial={false}
          animate={{ rotate: angle }}
          transition={reduced ? { duration: 0 } : TURN}
        >
          <span
            className="absolute left-1/2 top-[8%] h-[30%] -translate-x-1/2 rounded-full"
            style={{ width: f.len(r * 0.07, 3), backgroundColor: BRAND_VAR.cyan, boxShadow: `0 0 8px ${tint("cyan", 70)}` }}
          />
        </motion.span>
      </motion.span>

      <span
        className="absolute flex items-center justify-center text-center font-mono leading-snug text-muted-dark"
        style={{ ...f.box(d.title.x, d.title.y, d.title.w, d.title.h), ...f.fs(16, 13) }}
        aria-hidden="true"
      >
        {c.label}
      </span>
      <span className="absolute flex items-center justify-center" style={f.box(d.value.x, d.value.y, d.value.w, d.value.h)} aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={on ? at : "off"}
            className="whitespace-nowrap font-semibold text-brand-cyan"
            style={f.fs(24, 16)}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: on ? 1 : 0, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            {c.stops[at]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );
}
