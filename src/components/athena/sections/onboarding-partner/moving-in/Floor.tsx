"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { FLOOR, HUB, PLOT, SOCKETS, VB, boxFaces, cable, hubIn, iso, poly, socketIn } from "./iso";
import { Desk, DeskCable } from "./Desk";
import { Packets } from "./Packets";
import { FACE } from "./palette";
import type { V2State } from "./data";

/**
 * The isometric floor of v2 "Moving In", drawn for this idea: a workspace
 * platform floating on the stage, four sockets on its back edge for the tools
 * you might use, a hub in the middle where Athena works, and a dashed plot
 * where the agents will stand. It starts unlit; the light comes up when she
 * arrives and everything after that is something the two of you put there.
 *
 * Colours are theme mixes of --surface / --background / --foreground with the
 * brand cyan, so the slab reads as a lit object in dark and light themes.
 */

const fade = (reduced: boolean, delay = 0) => (reduced ? { duration: 0 } : { duration: 0.9, delay });

export function Floor({ s, reduced, live }: { s: V2State; reduced: boolean; live: boolean }) {
  const uid = useId();
  const slab = boxFaces(0, 0, FLOOR.gx, FLOOR.gy, FLOOR.t, -FLOOR.t);
  const hub = iso(HUB);
  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-pool`}>
          <stop offset="0%" stopColor={tint("cyan", 22)} />
          <stop offset="60%" stopColor={tint("cyan", 6)} />
          <stop offset="100%" stopColor={tint("cyan", 0)} />
        </radialGradient>
      </defs>

      {/* Under-glow: the slab floats on its own light */}
      <ellipse cx={720} cy={612} rx={520} ry={40} fill={tint("cyan", 8)} style={{ filter: "blur(18px)" }} />

      {/* The slab: top + two visible sides */}
      <polygon points={slab.left} fill={FACE.left} stroke="var(--border-glass)" />
      <polygon points={slab.right} fill={FACE.right} stroke="var(--border-glass)" />
      <polygon points={slab.top} fill={FACE.top} stroke={tint("cyan", 28)} strokeWidth={1.2} />

      {/* Floor grid */}
      {Array.from({ length: FLOOR.gx - 1 }, (_, i) => (
        <polyline key={`gx${i}`} points={poly([{ x: i + 1, y: 0 }, { x: i + 1, y: FLOOR.gy }])} stroke={tint("cyan", 9)} fill="none" />
      ))}
      {Array.from({ length: FLOOR.gy - 1 }, (_, i) => (
        <polyline key={`gy${i}`} points={poly([{ x: 0, y: i + 1 }, { x: FLOOR.gx, y: i + 1 }])} stroke={tint("cyan", 9)} fill="none" />
      ))}

      {/* Unlit, the floor sits in the dark; the veil lifts when she arrives */}
      <motion.polygon
        points={slab.top}
        fill="var(--background)"
        initial={false}
        animate={{ opacity: s.lit ? 0 : 0.55 }}
        transition={fade(reduced)}
      />

      {/* The pool of light she brings in */}
      <motion.ellipse
        cx={hub.x + 60}
        cy={hub.y + 10}
        rx={560}
        ry={300}
        fill={`url(#${uid}-pool)`}
        initial={false}
        animate={{ opacity: s.lit ? 1 : 0 }}
        transition={fade(reduced)}
      />

      {/* The plot where the agents will stand — empty until they do */}
      <motion.polygon
        points={poly([
          { x: PLOT.x, y: PLOT.y },
          { x: PLOT.x + PLOT.w, y: PLOT.y },
          { x: PLOT.x + PLOT.w, y: PLOT.y + PLOT.d },
          { x: PLOT.x, y: PLOT.y + PLOT.d },
        ])}
        fill={tint("cyan", 3)}
        stroke={tint("cyan", 34)}
        strokeWidth={1.4}
        strokeDasharray="7 7"
        initial={false}
        animate={{ opacity: s.desks[0] ? 0.35 : 1 }}
        transition={fade(reduced)}
      />

      {/* Cables: dashed where nothing is plugged, drawn bright once it is */}
      {SOCKETS.map((_, i) => {
        const d = cable(socketIn(i), hubIn(i));
        return (
          <g key={`c${i}`}>
            <path d={d} fill="none" stroke={tint("cyan", 14)} strokeWidth={2} strokeDasharray="3 8" strokeLinecap="round" />
            {s.plugged[i] && (
              <motion.path
                d={d}
                fill="none"
                stroke={BRAND_VAR.cyan}
                strokeWidth={2.4}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 5px ${tint("cyan", 60)})` }}
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.8, ease: "easeInOut", delay: 0.25 }}
              />
            )}
          </g>
        );
      })}
      {s.desks.map((on, i) => (on ? <DeskCable key={`dc${i}`} i={i} reduced={reduced} /> : null))}

      {/* Sockets: a small pedestal per tool, lit once plugged in */}
      {SOCKETS.map((p, i) => {
        const f = boxFaces(p.x - 0.35, p.y - 0.35, 0.7, 0.7, 0.3);
        const on = s.plugged[i];
        return (
          <g key={`s${i}`}>
            <polygon points={f.left} fill={FACE.left} stroke="var(--border-glass)" />
            <polygon points={f.right} fill={FACE.right} stroke="var(--border-glass)" />
            <polygon
              points={f.top}
              fill={on ? tint("cyan", 30) : FACE.top}
              stroke={on ? BRAND_VAR.cyan : tint("cyan", 25)}
              style={{ transition: reduced ? undefined : "fill 500ms, stroke 500ms" }}
            />
          </g>
        );
      })}

      <Hub lit={s.lit} running={s.running} reduced={reduced} />
      {s.running && <Packets plugged={s.plugged} live={live} reduced={reduced} />}
      {[0, 1, 2].map((i) => (
        <Desk key={`d${i}`} i={i} up={s.desks[i]} running={s.running} live={live} reduced={reduced} />
      ))}
    </svg>
  );
}

/** The hub pad she works from: an iso disc whose rim lights with the room. */
function Hub({ lit, running, reduced }: { lit: boolean; running: boolean; reduced: boolean }) {
  const c = iso(HUB);
  const rx = 58;
  const ry = 33;
  return (
    <g>
      <ellipse cx={c.x} cy={c.y + 8} rx={rx} ry={ry} fill={FACE.left} />
      <rect x={c.x - rx} y={c.y} width={rx * 2} height={8} fill={FACE.left} />
      <ellipse
        cx={c.x}
        cy={c.y}
        rx={rx}
        ry={ry}
        fill={FACE.top}
        strokeWidth={2}
        stroke={lit ? (running ? BRAND_VAR.cyan : tint("cyan", 60)) : tint("cyan", 20)}
        style={{ transition: reduced ? undefined : "stroke 900ms" }}
      />
      <ellipse cx={c.x} cy={c.y} rx={rx * 0.55} ry={ry * 0.55} fill="none" stroke={tint("cyan", lit ? 40 : 14)} strokeDasharray="4 6" />
    </g>
  );
}
