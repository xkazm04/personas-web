"use client";

import { motion, useReducedMotion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { ANNOTATION, REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY, FLOW, MARKS, NIGHT_TWITCH } from "./data";
import { BAND, overlayPos, type Orientation } from "./geometry";

/**
 * HTML layer over the band SVG: lane names, the section's one mono
 * annotation ("in flow · she waits"), the 2 am whisper, and the three
 * Athena moments as keyboard-accessible buttons. In the vertical
 * (mobile) orientation the moment labels are hidden until hover/focus —
 * the peek the tight layout asks for; on desktop they are always shown.
 */
export default function BandOverlays({ orientation }: { orientation: Orientation }) {
  const reduced = useReducedMotion() ?? false;
  const o = orientation;
  const flowMid = (FLOW.start + FLOW.end) / 2;

  const bloom = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          whileInView: { opacity: 1, y: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay },
        };

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Lane names */}
      <span
        aria-hidden
        className={`absolute text-xs tracking-wide text-muted-dark ${
          o === "h" ? "left-1 top-1" : "left-2 top-1"
        }`}
      >
        {COPY.laneTypical}
      </span>
      <span
        aria-hidden
        className={`absolute text-xs tracking-wide ${
          o === "h" ? "bottom-1 left-1" : "right-2 top-1"
        }`}
        style={{ color: tint("cyan", 75) }}
      >
        {COPY.laneAthena}
      </span>

      {/* The one garnish: her silence during flow, annotated */}
      <motion.span
        aria-hidden
        {...bloom(1.1)}
        className={`${ANNOTATION} absolute whitespace-nowrap ${
          o === "h" ? "-translate-x-1/2" : "-translate-y-1/2"
        }`}
        style={overlayPos(o, flowMid, o === "h" ? 196 : 186)}
      >
        {COPY.flowNote}
      </motion.span>

      {/* 2 am, whispered next to the storm's last twitch */}
      <span
        aria-hidden
        className={`absolute text-xs text-muted-dark ${
          o === "h" ? "-translate-x-1/2" : "-translate-y-1/2"
        }`}
        style={overlayPos(o, NIGHT_TWITCH.t, o === "h" ? 34 : 20)}
      >
        {COPY.nightNote}
      </span>

      {/* Athena's three moments — focusable, each worth saying */}
      <div role="group" aria-label={COPY.marksAria} className="contents">
        {MARKS.map((m, i) => (
          <button
            key={m.id}
            type="button"
            aria-label={`${m.time} — ${m.label}`}
            className="group pointer-events-auto absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/70"
            style={overlayPos(o, m.t, BAND.laneAthena)}
          >
            <motion.span
              {...bloom(0.9 + i * 0.22)}
              className={`absolute text-sm leading-snug text-foreground/80 transition-opacity duration-300 ${
                o === "h"
                  ? "left-1/2 top-full w-40 -translate-x-1/2 pt-1 text-center"
                  : "right-full top-1/2 w-40 -translate-y-1/2 pr-3 text-right opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
              }`}
            >
              {m.label}
              <span className="mt-0.5 block text-xs text-muted-dark">{m.time}</span>
            </motion.span>
          </button>
        ))}
      </div>
    </div>
  );
}
