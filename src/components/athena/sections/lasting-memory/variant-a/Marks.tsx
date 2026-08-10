"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { COPY } from "./copy";
import { FULL, REACH, type SceneState } from "./data";
import { reachY, thresholdY, waterY, type FieldLayout } from "./layout";
import Anchor from "./Anchor";
import { Sheen } from "./parts";

/**
 * The two lines that explain the rhythm without a sentence of prose.
 *
 * THRESHOLD is drawn from the first frame and never moves: it is how far the
 * talk has to rise before anything happens, which is the whole reason a quiet
 * stretch is quiet. It flares when the level reaches it and goes calm again
 * once the level has fallen, so the loop's shape is legible from the line
 * alone.
 *
 * REACH is drawn only while a pass is running, and only because one pass
 * cannot take everything: the part below it is what this pass reached, the
 * part above it is what did not fit. Its label rides the surface of the talk
 * rather than the line, so when the three pills it names come down at the end,
 * the words come down with them — which is the difference between "set aside"
 * and "dropped".
 */

const LABEL = "font-mono text-base uppercase tracking-[0.14em]";
const GLIDE = { type: "spring", stiffness: 58, damping: 17 } as const;

export default function Marks({
  layout: L,
  scene,
  reduced,
}: {
  layout: FieldLayout;
  scene: SceneState;
  reduced: boolean;
}) {
  const line = thresholdY(L, FULL);
  const flare = scene.crossed && !scene.dropped;
  const deferY = waterY(L, scene.slots) - L.pitch * 0.85;
  const rightGap = 100 - (L.basin.x + L.basin.w) + 0.5;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* How far it has to fill. Colour rides a scoped CSS transition rather
          than framer's `animate` — the palette is `color-mix()` on a theme
          variable, which framer cannot interpolate. */}
      <span
        className={`absolute overflow-hidden border-t border-dashed ${
          reduced ? "" : "transition-[border-color,box-shadow] duration-500"
        }`}
        style={{
          left: `${L.basin.x}%`,
          top: `${line}%`,
          width: `${L.basin.w}%`,
          borderColor: flare ? tint("cyan", 75) : tint("cyan", 24),
          boxShadow: flare ? brandShadow("cyan", 16, 34) : undefined,
        }}
      >
        <Sheen on={flare} reduced={reduced} />
      </span>

      {L.thresholdLabel && (
        <span
          className={`absolute ${LABEL} ${reduced ? "" : "transition-opacity duration-500"}`}
          style={{
            left: `${L.basin.x + 0.6}%`,
            top: `${line}%`,
            marginTop: "0.35rem",
            color: BRAND_VAR.cyan,
            opacity: scene.showThreshold ? 0.8 : 0,
          }}
        >
          {COPY.basin.threshold}
        </span>
      )}

      {/* How far one pass got */}
      <motion.span
        className="absolute h-px origin-left"
        style={{
          left: `${L.basin.x}%`,
          top: `${reachY(L, REACH)}%`,
          width: `${L.basin.w}%`,
          background: `linear-gradient(to right, ${tint("cyan", 20)}, ${tint("cyan", 80)}, ${tint("cyan", 20)})`,
        }}
        initial={false}
        animate={{ scaleX: scene.reaching ? 1 : 0, opacity: scene.reaching ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.55, ease: "easeOut" }}
      />

      {/* …and what it did not get to, riding the surface of the talk */}
      <Anchor at={{ x: 0, y: deferY }} glide={reduced ? { duration: 0 } : GLIDE}>
        <span
          className={`absolute -translate-y-full whitespace-nowrap ${LABEL} ${
            reduced ? "" : "transition-opacity duration-500"
          }`}
          style={{
            right: `${rightGap}%`,
            color: BRAND_VAR.amber,
            opacity: scene.marked ? 0.85 : 0,
          }}
        >
          {COPY.basin.deferred}
        </span>
      </Anchor>
    </div>
  );
}
