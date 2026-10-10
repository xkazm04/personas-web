"use client";

import { motion } from "framer-motion";
import { DIMS, inkA, type DimKey } from "./shared/dims";
import type { DimPhase } from "./shared/timeline";
import type { Machine } from "./shared/machine";
import { CALLOUTS, GATE, LOOP } from "./geometry";
import { ALT_PATHS, PART_FILL, PART_PATHS } from "./paths";

const PEN = { strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

/**
 * The machine, drawn part by part. Every part is on the sheet from the start
 * as faint dashed construction lines; when Personas makes the decision its
 * part is inked over in the dimension's colour (a pen stroke), fills softly
 * when the decision lands, and its leader line runs out to the callout.
 * The machine follows the visitor's answers: a part that is not needed stays
 * as construction lines (with a note), a swapped part inks its alternative
 * glyph instead. Both glyph sets are always in the DOM; only their ink moves.
 */
export default function Parts({
  phases,
  machine,
  notNeeded,
  moving,
  pulse,
}: {
  phases: Record<DimKey, DimPhase>;
  machine: Machine;
  notNeeded: string;
  moving: boolean;
  pulse: boolean;
}) {
  return (
    <g>
      {DIMS.map((d) => {
        const p = phases[d.key];
        const inked = p !== "pending";
        const done = p === "resolved";
        const state = machine.parts[d.key];
        const fill = PART_FILL[d.key];
        const alt = ALT_PATHS[d.key] ?? [];
        const leader = d.key === "tasks" ? null : CALLOUTS[d.key].leader;
        const ink = (path: string, i: number, on: boolean, key: string) => (
          <motion.path
            key={key}
            d={path}
            {...PEN}
            stroke={d.ink}
            style={{ filter: done && on ? `drop-shadow(0 0 3px ${inkA(d.ink, 55)})` : undefined }}
            initial={false}
            animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
            transition={{ duration: moving ? 0.9 : 0, delay: moving && on ? i * 0.12 : 0, ease: "easeInOut" }}
          />
        );
        return (
          <g key={d.key}>
            <g style={{ opacity: state === "swapped" ? 0 : 1, transition: moving ? "opacity .6s" : "none" }}>
              {PART_PATHS[d.key].map((path, i) => (
                <path key={`g${i}`} d={path} {...PEN} strokeWidth={1.4} stroke="rgba(var(--surface-overlay), 0.22)" strokeDasharray="4 6" />
              ))}
            </g>
            {d.key === "triggers" && (
              <g style={{ opacity: state === "swapped" ? 1 : 0, transition: moving ? "opacity .6s" : "none" }}>
                {alt.map((path, i) => (
                  <path key={`a${i}`} d={path} {...PEN} strokeWidth={1.4} stroke="rgba(var(--surface-overlay), 0.22)" strokeDasharray="4 6" />
                ))}
              </g>
            )}
            {fill && (
              <path d={fill} fill={inkA(d.ink, 12)} style={{ opacity: done && state === "drawn" ? 1 : 0, transition: moving ? "opacity .8s" : "none" }} />
            )}
            {PART_PATHS[d.key].map((path, i) => ink(path, i, inked && state === "drawn", `i${i}`))}
            {alt.map((path, i) => ink(path, i, inked && state !== "drawn", `x${i}`))}
            {leader && (
              <motion.path
                d={leader}
                {...PEN}
                strokeWidth={1.2}
                stroke={d.ink}
                initial={false}
                animate={{ pathLength: done ? 1 : 0, opacity: done ? 0.9 : 0 }}
                transition={{ duration: moving ? 0.45 : 0, ease: "easeOut" }}
              />
            )}
            {p === "asking" && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={pulse ? { opacity: [0.4, 1, 0.4] } : { opacity: 1 }}
                transition={pulse ? { duration: 1.4, repeat: Infinity } : { duration: 0 }}
              >
                <path d={PART_PATHS[d.key][d.key === "review" ? 1 : 0]} {...PEN} strokeWidth={5} stroke={inkA(d.ink, 35)} />
              </motion.g>
            )}
          </g>
        );
      })}
      <text
        x={(GATE.a + GATE.b) / 2}
        y={GATE.bottom + 18}
        textAnchor="middle"
        fontSize={12}
        fontFamily="var(--font-geist-mono)"
        fill="color-mix(in srgb, var(--foreground) 72%, transparent)"
        style={{ opacity: machine.gate === "none" && phases.review === "resolved" ? 1 : 0, transition: moving ? "opacity .6s" : "none" }}
      >
        {notNeeded}
      </text>
      <text
        x={LOOP.cx}
        y={LOOP.cy + 5}
        textAnchor="middle"
        fontSize={15}
        fontWeight={700}
        fontFamily="var(--font-geist-mono)"
        fill={DIMS.find((d) => d.key === "errors")?.ink}
        style={{ opacity: phases.errors === "resolved" ? 1 : 0, transition: moving ? "opacity .6s" : "none" }}
      >
        3&times;
      </text>
    </g>
  );
}
