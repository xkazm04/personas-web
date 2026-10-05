"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { DIM_BY_KEY, inkA, type DimKey } from "../shared/dims";
import type { DimPhase } from "../shared/timeline";
import { CORE_R, CX, CY, PETALS, petalAxis, petalPath, polar, RI, RO } from "./geometry";

const ORIGIN = { transformBox: "view-box", transformOrigin: `${CX}px ${CY}px` } as const;

/**
 * The agent's sigil: one petal per decision, in the app's own petal order.
 * A petal waits as a dashed outline, buds while Personas works on it, pulses
 * while it asks, and opens in its colour once decided. Finished, the core
 * lights and the whole flower blooms once.
 */
export default function Sigil({
  phases,
  focus,
  done,
  moving,
  pulse,
  run,
}: {
  phases: Record<DimKey, DimPhase>;
  focus: DimKey | null;
  done: boolean;
  moving: boolean;
  pulse: boolean;
  run: number;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        {PETALS.map(({ key, angle }) => {
          const { a, b } = petalAxis(angle);
          return (
            <linearGradient key={key} id={`${id}${key}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} gradientUnits="userSpaceOnUse">
              <stop offset="0" style={{ stopColor: DIM_BY_KEY[key].ink, stopOpacity: 0.15 }} />
              <stop offset="1" style={{ stopColor: DIM_BY_KEY[key].ink, stopOpacity: 0.55 }} />
            </linearGradient>
          );
        })}
      </defs>

      <circle cx={CX} cy={CY} r={RO + 4} fill="none" stroke="rgba(var(--surface-overlay), 0.1)" strokeDasharray="2 6" />

      {PETALS.map(({ key, angle, icon: Icon }) => {
        const ink = DIM_BY_KEY[key].ink;
        const p = phases[key];
        const open = p === "resolved";
        const dim = focus !== null && focus !== key;
        const scale = open ? 1 : p === "pending" ? 0.001 : 0.62;
        const ic = polar(angle, (RI + RO) / 2 + 4);
        return (
          <g key={key} style={{ opacity: dim ? 0.3 : 1, transition: "opacity .3s" }}>
            <g>
              <path d={petalPath(angle)} fill="none" stroke="rgba(var(--surface-overlay), 0.28)" strokeWidth={1.2} strokeDasharray="3 5" />
              <motion.path
                d={petalPath(angle)}
                fill={open ? `url(#${id}${key})` : inkA(ink, 10)}
                stroke={ink}
                strokeWidth={focus === key ? 3.2 : 2}
                style={{ ...ORIGIN, filter: open ? `drop-shadow(0 0 8px ${inkA(ink, 45)})` : undefined }}
                initial={false}
                animate={{ scale, opacity: p === "pending" ? 0 : 1 }}
                transition={moving ? { type: "spring", stiffness: 120, damping: 14 } : { duration: 0 }}
              />
              {p === "asking" && (
                <motion.path
                  d={petalPath(angle)}
                  fill="none"
                  stroke={ink}
                  strokeWidth={6}
                  style={ORIGIN}
                  initial={{ scale: 0.62, opacity: 0.4 }}
                  animate={pulse ? { scale: [0.62, 0.8, 0.62], opacity: [0.5, 0.15, 0.5] } : { scale: 0.62, opacity: 0.5 }}
                  transition={pulse ? { duration: 1.4, repeat: Infinity } : { duration: 0 }}
                />
              )}
            </g>
            <Icon
              x={ic.x - 13}
              y={ic.y - 13}
              width={26}
              height={26}
              strokeWidth={2}
              color={open ? "var(--foreground)" : ink}
              style={{ opacity: p === "pending" ? 0 : 1, transition: moving ? "opacity .6s .3s" : "none" }}
              aria-hidden="true"
            />
          </g>
        );
      })}

      <motion.circle
        key={`bloom-${run}`}
        cx={CX}
        cy={CY}
        fill="none"
        stroke="var(--brand-emerald)"
        strokeWidth={2}
        initial={{ r: CORE_R, opacity: 0 }}
        animate={done && moving ? { r: RO + 30, opacity: [0, 0.8, 0] } : { r: CORE_R, opacity: 0 }}
        transition={{ duration: done && moving ? 1.4 : 0, ease: "easeOut" }}
      />
      <circle
        cx={CX}
        cy={CY}
        r={CORE_R}
        fill={done ? "color-mix(in srgb, var(--brand-emerald) 22%, var(--background))" : "color-mix(in srgb, var(--brand-purple) 14%, var(--background))"}
        stroke={done ? "var(--brand-emerald)" : "color-mix(in srgb, var(--brand-purple) 60%, transparent)"}
        strokeWidth={2.4}
        style={{ transition: "fill .8s, stroke .8s", filter: `drop-shadow(0 0 14px ${done ? inkA("var(--brand-emerald)", 50) : inkA("var(--brand-purple)", 35)})` }}
      />
      <Check
        x={CX - 18}
        y={CY - 18}
        width={36}
        height={36}
        strokeWidth={3}
        color="var(--brand-emerald)"
        style={{ opacity: done ? 1 : 0, transition: moving ? "opacity .6s .4s" : "none" }}
        aria-hidden="true"
      />
    </g>
  );
}
