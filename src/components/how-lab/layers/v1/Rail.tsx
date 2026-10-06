"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { frame } from "../shared/Shell";
import { LAYERS } from "../shared/layers";
import { H, RAIL_W, SLAB_H, W, slabTop } from "./geometry";

const f = frame(W, H);

/**
 * The layer rail (the live section's stack labels, now real controls): one
 * button per layer, level with its slab once the stack has spread. Hover or
 * focus previews a layer; a click pins it until clicked again.
 */
export default function Rail({
  spread,
  focus,
  pinned,
  names,
  label,
  onPreview,
  onPin,
}: {
  spread: MotionValue<number>;
  focus: number;
  pinned: number | null;
  names: string[];
  label: string;
  onPreview: (i: number | null) => void;
  onPin: (i: number) => void;
}) {
  const opacity = useTransform(spread, [0.35, 0.9], [0, 1]);
  return (
    <motion.div role="group" aria-label={label} className="absolute inset-y-0 left-0" style={{ width: f.u(RAIL_W), opacity }}>
      {LAYERS.map((layer, i) => {
        const cy = slabTop(i, 1) + SLAB_H / 2;
        const hot = focus === i || focus === 4;
        return (
          <button
            key={layer.id}
            type="button"
            aria-pressed={pinned === i}
            onClick={() => onPin(i)}
            onMouseEnter={() => onPreview(i)}
            onMouseLeave={() => onPreview(null)}
            onFocus={() => onPreview(i)}
            onBlur={() => onPreview(null)}
            className="group absolute right-0 flex -translate-y-1/2 items-center justify-end rounded-lg py-2 pl-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
            style={{ top: `${(cy / H) * 100}%`, gap: f.u(12), width: "100%" }}
          >
            <span className="flex flex-col items-end leading-none">
              <span className="font-mono tracking-[0.18em] text-muted" style={f.fs(13, 12)}>
                {`0${i + 1}`}
              </span>
              <span
                className="mt-1 font-semibold uppercase tracking-[0.14em] transition-colors"
                style={{ ...f.fs(17, 13), color: hot ? BRAND_VAR[layer.brand] : "var(--muted)" }}
              >
                {names[i]}
              </span>
            </span>
            <span
              aria-hidden
              className="block h-px transition-all duration-300"
              style={{ width: f.u(hot ? 34 : 20), background: tint(layer.brand, hot ? 85 : 35) }}
            />
          </button>
        );
      })}
    </motion.div>
  );
}
