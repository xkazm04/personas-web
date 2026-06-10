"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CELLS, type CellKey, type CellStatus } from "../../designMatrixShared";

const CENTER = 1.5;

// Grid positions in a 0..3 viewBox (cell centers at 0.5 / 1.5 / 2.5), matching
// the 3×3 tile layout in index.tsx. The center cell is the intent tile, so the
// eight dimensions sit at these coordinates. preserveAspectRatio="none" makes
// the proportional centers track the responsive grid without DOM measurement.
const SPOKES: { key: CellKey; x: number; y: number }[] = [
  { key: "tasks", x: 0.5, y: 0.5 },
  { key: "apps", x: 1.5, y: 0.5 },
  { key: "triggers", x: 2.5, y: 0.5 },
  { key: "messages", x: 0.5, y: 1.5 },
  { key: "review", x: 2.5, y: 1.5 },
  { key: "memory", x: 0.5, y: 2.5 },
  { key: "errors", x: 1.5, y: 2.5 },
  { key: "events", x: 2.5, y: 2.5 },
];

const COLOR_BY_KEY: Record<string, string> = Object.fromEntries(
  CELLS.map((c) => [c.key, c.color]),
);

/** The connecting spoke brightens while the intent is engaging a feature and
 *  stays lit once that feature is on; faint while the dimension is dormant. */
function spokeOpacity(state: CellStatus["state"] | undefined): number {
  if (state === "thinking" || state === "asking" || state === "answered") return 0.5;
  if (state === "filled") return 0.28;
  return 0.1;
}

/**
 * Connector overlay for the persona matrix. Renders the "intent at center · 8
 * dimensions radiate outward" metaphor: each spoke is a connector from the
 * center intent tile to a dimension. When the build engages a dimension (its
 * cell enters `thinking`), a glowing "command" packet travels out along that
 * spoke to the card — a visual transfer of the intent dispatching that feature.
 * Desktop-only (the radial layout exists only at the md 3×3 grid); the moving
 * packet is gated on reduced motion (the build itself also pauses there).
 */
export default function RadiateOverlay({
  statuses,
}: {
  statuses: Record<CellKey, CellStatus>;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full md:block"
      viewBox="0 0 3 3"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {SPOKES.map((s) => {
        const state = statuses[s.key]?.state;
        const color = COLOR_BY_KEY[s.key];
        // Fire the transfer once, while the cell is first being engaged.
        const dispatching = !reduced && state === "thinking";
        return (
          <g key={s.key}>
            <motion.line
              x1={CENTER}
              y1={CENTER}
              x2={s.x}
              y2={s.y}
              stroke={color}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              initial={{ opacity: spokeOpacity(state) }}
              animate={{ opacity: spokeOpacity(state) }}
              transition={{ duration: 0.5 }}
            />
            {dispatching && (
              <>
                {/* The command packet — a zero-length round-capped stroke so it
                    renders as an exact, perfectly round dot (6px soft halo +
                    3px bright core) regardless of the non-uniform viewBox scale.
                    A plain <circle r> would distort into a large ellipse here. */}
                <motion.line
                  stroke={color}
                  strokeWidth={6}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER, opacity: 0 }}
                  animate={{ x1: s.x, y1: s.y, x2: s.x, y2: s.y, opacity: [0, 0.3, 0.3, 0] }}
                  transition={{ duration: 1.15, ease: "easeOut" }}
                />
                <motion.line
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER, opacity: 0 }}
                  animate={{ x1: s.x, y1: s.y, x2: s.x, y2: s.y, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.15, ease: "easeOut" }}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
