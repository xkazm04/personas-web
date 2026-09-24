"use client";

import { motion, type useAnimationControls, type Variants } from "framer-motion";

type AnimationControls = ReturnType<typeof useAnimationControls>;
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { StackLayer } from "./layers";

/**
 * The exploded stack: one isometric slab per layer, drawn with a 2D CSS
 * matrix (x axis -> 30deg down-right, y axis -> 30deg down-left), so a square
 * of side `--s` becomes a rhombus 1.732s wide and s tall. Decorative: the
 * readable labels are flat DOM beside the stack (see the tablist).
 *
 * Geometry is shared with the label column through these constants.
 */
export const STACK = {
  /** Distance between slab tops, px. */
  gap: 60,
  /** Slab thickness, px. */
  depth: 8,
  /** Top of the first slab, px from the top of the illustration box. */
  top: 150,
  /** Left inset of the slab column (room to pull a slab out), px. */
  inset: 20,
} as const;

export const ISO = "matrix(0.866, 0.5, -0.866, 0.5, 0, 0)";
/** Horizontal centre of the slab column, as CSS. */
export const STACK_CENTER_X = `calc(${STACK.inset}px + var(--s) * 0.866)`;
/** Where the flat label column starts, as CSS. */
export const LABELS_LEFT = `calc(${STACK.inset}px + var(--s) * 1.732 + 18px)`;
export const slabTop = (i: number) => STACK.top + i * STACK.gap;
/** Vertical centre of slab i (its left and right vertices), as CSS. */
export const slabMidY = (i: number) => `calc(${slabTop(i)}px + var(--s) * 0.5)`;

/** Entrance: slabs start pressed together under the first one, then spread. */
export const slabVariants: Variants = {
  collapsed: (i: number) => ({ y: -i * (STACK.gap - 10), transition: { duration: 0 } }),
  exploded: (i: number) => ({
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const opaque = (layer: StackLayer, pct: number) =>
  `color-mix(in srgb, ${BRAND_VAR[layer.brand]} ${pct}%, var(--background))`;

export function LayerSlabs({
  layers,
  activeIndex,
  still,
  controls,
}: {
  layers: StackLayer[];
  activeIndex: number;
  still: boolean;
  controls: AnimationControls;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* The agent sits on the stack: a short dashed drop from card to top slab. */}
      <div
        className="absolute w-px border-l border-dashed border-glass-hover"
        style={{ left: STACK_CENTER_X, top: STACK.top - 22, height: 22 }}
      />
      {layers.map((layer, i) => {
        const on = i === activeIndex;
        return (
          <motion.div
            key={layer.card.id}
            custom={i}
            variants={slabVariants}
            initial={false}
            animate={controls}
            className="absolute"
            style={{ left: STACK_CENTER_X, top: slabTop(i), zIndex: 20 - i }}
          >
            <motion.div
              initial={false}
              animate={{ x: on ? -STACK.inset : 0 }}
              transition={still ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
            >
              <Slab layer={layer} on={on} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function Slab({ layer, on }: { layer: StackLayer; on: boolean }) {
  const Icon = layer.icon;
  const face = {
    width: "var(--s)",
    height: "var(--s)",
    transform: ISO,
    transformOrigin: "0 0",
  } as const;
  return (
    <div className="relative">
      {/* Thickness: the same rhombus, dropped by `depth`, in a darker mix. */}
      <div
        className="absolute left-0 rounded-[10px] border"
        style={{
          ...face,
          top: STACK.depth,
          backgroundColor: opaque(layer, on ? 42 : 24),
          borderColor: tint(layer.brand, on ? 80 : 40),
        }}
      />
      <div
        className="absolute left-0 top-0 overflow-hidden rounded-[10px] border transition-colors duration-300"
        style={{
          ...face,
          backgroundColor: opaque(layer, on ? 20 : 9),
          borderColor: on ? BRAND_VAR[layer.brand] : tint(layer.brand, 45),
          boxShadow: on ? `0 0 24px ${tint(layer.brand, 35)}` : undefined,
        }}
      >
        {/* Surface grid, painted on the slab. */}
        <div
          className="absolute inset-0"
          style={{
            opacity: on ? 0.5 : 0.3,
            backgroundImage: `linear-gradient(${tint(layer.brand, 30)} 1px, transparent 1px), linear-gradient(90deg, ${tint(layer.brand, 30)} 1px, transparent 1px)`,
            backgroundSize: "calc(var(--s) / 6) calc(var(--s) / 6)",
          }}
        />
        {/* The layer's glyph, near the front corner where lower slabs stay visible. */}
        <Icon
          className="absolute"
          style={{
            left: "calc(var(--s) * 0.6)",
            top: "calc(var(--s) * 0.6)",
            width: "calc(var(--s) * 0.24)",
            height: "calc(var(--s) * 0.24)",
            color: BRAND_VAR[layer.brand],
            opacity: on ? 1 : 0.75,
          }}
          strokeWidth={1.6}
        />
      </div>
    </div>
  );
}
