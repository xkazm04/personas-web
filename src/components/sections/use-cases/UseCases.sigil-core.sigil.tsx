"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { DIMS, PERSONA, petalAngle, type Dim } from "./UseCases.sigil-core.model";

/**
 * PersonaSigil - a reduced drawing of the app's persona sigil
 * (`features/shared/glyph/persona-sigil/GlyphHeroSigil`): eight lens petals at
 * 45deg steps, one per persona dimension, around a core tinted with the
 * persona's colour. Lit petals are filled in their dimension colour; unlit
 * petals are dashed outlines (the app's "not filled yet"). Geometry is the
 * app's, in a 100-unit box.
 */

const OUTER = 44;
const INNER = 13;
const PETAL =
  `M 0 -${INNER} C 6.5 -${OUTER * 0.49}, 6.5 -${OUTER * 0.77}, 0 -${OUTER} ` +
  `C -6.5 -${OUTER * 0.77}, -6.5 -${OUTER * 0.49}, 0 -${INNER} Z`;

export default function PersonaSigil({
  lit,
  flashKey,
  animate,
  className,
}: {
  lit: ReadonlySet<Dim>;
  /** Changes on every attach beat so the lit petals re-flash. */
  flashKey?: string | number;
  /** Arm the flash (client-only, never under reduced motion). */
  animate?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const coreId = `sigil-core-${uid}`;
  const persona = BRAND_VAR[PERSONA.brand];

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: persona }} stopOpacity="0.34" />
          <stop offset="70%" style={{ stopColor: persona }} stopOpacity="0.14" />
          <stop offset="100%" style={{ stopColor: persona }} stopOpacity="0.04" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r={OUTER + 3} fill="none" stroke="currentColor" strokeOpacity="0.07" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="1 3" />

      {DIMS.map((d, i) => {
        const on = lit.has(d.dim);
        const color = BRAND_VAR[d.brand];
        return (
          <g key={d.dim} transform={`translate(50 50) rotate(${petalAngle(i)})`}>
            {on ? (
              <motion.path
                key={`${d.dim}-${flashKey ?? ""}`}
                d={PETAL}
                strokeWidth={0.7}
                initial={animate ? { opacity: 0.35 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ fill: color, stroke: color, fillOpacity: 0.3 }}
              />
            ) : (
              <path
                d={PETAL}
                style={{ fill: color, stroke: color }}
                fillOpacity={0.04}
                strokeOpacity={0.45}
                strokeWidth={0.45}
                strokeDasharray="1.6 1.4"
              />
            )}
          </g>
        );
      })}

      <circle cx="50" cy="50" r="21" fill="none" style={{ stroke: tint(PERSONA.brand, 30) }} strokeWidth="0.4" />
      <circle cx="50" cy="50" r="19" fill={`url(#${coreId})`} />
      <circle cx="50" cy="50" r="19" fill="none" style={{ stroke: persona }} strokeOpacity="0.6" strokeWidth="0.6" />
    </svg>
  );
}
