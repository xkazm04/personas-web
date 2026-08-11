"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import type { FieldLayout } from "./layout";
import { BREATH, rectStyle } from "./parts";

/**
 * The boundary — the section's whole argument, drawn once.
 *
 * It is four HTML edges rather than an SVG path, and that is a correctness
 * decision, not a preference. Everything else in this scene lives in a
 * `viewBox="0 0 100 100"` with no aspect lock so that percent geometry and
 * type share one coordinate system — but that viewBox scales x and y by very
 * different factors, which does three things to a rectangle: it draws the
 * vertical runs several times thicker than the horizontal ones, it stretches
 * every blur and glow sideways, and (with `vector-effect: non-scaling-stroke`
 * as the fix for the first) it silently breaks framer's `pathLength`, whose
 * dash lengths are then resolved in screen units against a path normalised in
 * user units. The line that must read as ONE unbroken line came out dotted.
 * Four positioned edges are exact at every viewport instead.
 *
 * The draw is a genuine draw: each edge scales in from the end the last one
 * finished at — left to right along the top, down the right, back along the
 * bottom, up the left — so the boundary is laid down as a single clockwise
 * stroke. Nothing about it is redrawn afterwards. Not when the dial goes up,
 * not when the yard fills, not when she reaches past it. That is the point,
 * and it is made by omission: the eye has nothing to catch.
 *
 * Two moments are allowed to assert it. At HOLDS_AT one bright pass runs the
 * perimeter, edge after edge, in the same direction it was drawn. And in the
 * closing stillness the line takes the only breath left in the frame, so the
 * last thing moving on screen is the thing the visitor is meant to leave
 * holding.
 */

const EDGE = "1.5px";
const STEP = 0.3;
const SPAN = 0.36;

/** The four edges, in the order the stroke lays them down. */
interface EdgeSpec {
  pos: string;
  grow: "scaleX" | "scaleY";
  h?: string;
  w?: string;
}

const EDGES: readonly EdgeSpec[] = [
  { pos: "left-0 top-0 w-full origin-left", grow: "scaleX", h: EDGE },
  { pos: "right-0 top-0 h-full origin-top", grow: "scaleY", w: EDGE },
  { pos: "bottom-0 left-0 w-full origin-right", grow: "scaleX", h: EDGE },
  { pos: "bottom-0 left-0 h-full origin-bottom", grow: "scaleY", w: EDGE },
];

/** The bright pass, edge by edge, in the direction the line was drawn. */
interface ShineSpec {
  pos: string;
  h?: string;
  w?: string;
  axis: "x" | "y";
  from: string;
  to: string;
  deg: number;
}

const SHINES: readonly ShineSpec[] = [
  { pos: "left-0 top-0 w-1/5", h: "3px", axis: "x", from: "0%", to: "400%", deg: 90 },
  { pos: "right-0 top-0 h-1/5", w: "3px", axis: "y", from: "0%", to: "400%", deg: 180 },
  { pos: "bottom-0 left-0 w-1/5", h: "3px", axis: "x", from: "400%", to: "0%", deg: 90 },
  { pos: "left-0 top-0 h-1/5", w: "3px", axis: "y", from: "400%", to: "0%", deg: 180 },
];

export default function Fence({
  layout,
  stage,
  sweep,
  calm,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  sweep: boolean;
  calm: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.workshop.fence;
  const drawn = atStage(stage, "shell");
  const glowing = atStage(stage, "body");
  const named = atStage(stage, "detail");
  const held = atStage(stage, "chosen");

  return (
    <>
      <div className="pointer-events-none absolute" style={rectStyle(layout.fence)} aria-hidden="true">
        {/* The line before you drew it — same rect, so what follows is a morph */}
        <motion.span
          className="absolute inset-0 border border-dashed"
          style={{ borderColor: tint("cyan", 22) }}
          initial={false}
          animate={{ opacity: drawn ? 0 : 1 }}
          transition={{ duration: reduced ? 0 : 0.5 }}
        />

        {/* The light it throws inward, blooming a beat after it closes */}
        <motion.span
          className="absolute inset-0"
          style={{ boxShadow: `inset 0 0 44px ${tint("cyan", 14)}` }}
          initial={false}
          animate={{ opacity: glowing ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.8 }}
        />

        <motion.span
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: reduced ? 1 : calm ? [1, 0.72, 1] : held ? 1 : 0.85 }}
          transition={reduced ? { duration: 0 } : calm ? BREATH : { duration: 0.6 }}
        >
          {EDGES.map((edge, i) => (
            <motion.span
              key={edge.pos}
              className={`absolute ${edge.pos}`}
              style={{ height: edge.h, width: edge.w, backgroundColor: tint("cyan", 68) }}
              initial={reduced ? false : { [edge.grow]: 0 }}
              animate={{ [edge.grow]: drawn ? 1 : 0 }}
              transition={
                reduced ? { duration: 0 } : { duration: SPAN, delay: drawn ? i * STEP : 0 }
              }
            />
          ))}

          {/* It holds: one pass, end to end, said once and not repeated */}
          {sweep &&
            !reduced &&
            SHINES.map((shine, i) => (
              <motion.span
                key={shine.pos}
                className={`absolute ${shine.pos}`}
                style={{
                  height: shine.h,
                  width: shine.w,
                  background: `linear-gradient(${shine.deg}deg, transparent, ${BRAND_VAR.cyan}, transparent)`,
                }}
                initial={{ [shine.axis]: shine.from, opacity: 0 }}
                animate={{ [shine.axis]: shine.to, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.46, delay: i * 0.42, ease: "linear" }}
              />
            ))}
        </motion.span>
      </div>

      {/* The plate, mounted astride the line — the yard is named from the
          outset, so nothing that arrives later has to explain what it is in. */}
      <motion.span
        className={`pointer-events-none absolute flex -translate-y-1/2 items-center whitespace-nowrap rounded-full border bg-background px-3 py-0.5 ${ANNOTATION}`}
        style={{
          left: `${layout.plate.x}%`,
          top: `${layout.plate.y}%`,
          borderColor: tint("cyan", 34),
        }}
        initial={reduced ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: named ? 1 : 0, scale: named ? 1 : 0.94 }}
        transition={reduced ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
        aria-hidden="true"
      >
        <span className="hidden sm:inline">{c.plate}</span>
        <span className="sm:hidden">{c.plateShort}</span>
      </motion.span>
    </>
  );
}
