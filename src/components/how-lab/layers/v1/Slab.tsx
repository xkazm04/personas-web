"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { frame } from "../shared/Shell";
import type { LayerDef } from "../shared/layers";
import { ART_H, ART_W, ART_X, CHIP, CHIP_X, H, SLAB_H, SLAB_W, SLAB_X, TEXT_X, W, slabTop } from "./geometry";

export type SlabMode = "off" | "on" | "current";

const f = frame(W, H);

/**
 * One layer as a lit glass slab. Its height in the stack follows `spread`
 * (pressed together -> fanned out); `mode` lights it, and the current slab
 * turns to face the viewer and lifts out of the stack.
 */
export default function Slab({
  layer,
  index,
  spread,
  mode,
  still,
  name,
  title,
  line,
  onEnter,
  onLeave,
  children,
}: {
  layer: LayerDef;
  index: number;
  spread: MotionValue<number>;
  mode: SlabMode;
  still: boolean;
  name: string;
  title: string;
  line: string;
  onEnter: () => void;
  onLeave: () => void;
  children: ReactNode;
}) {
  const top = useTransform(spread, (s) => `${(slabTop(index, s) / H) * 100}%`);
  const on = mode !== "off";
  const current = mode === "current";
  const brand = BRAND_VAR[layer.brand];
  const Icon = layer.icon;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${(SLAB_X / W) * 100}%`,
        width: `${(SLAB_W / W) * 100}%`,
        height: `${(SLAB_H / H) * 100}%`,
        top,
        zIndex: current ? 20 : index + 1,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-[1.1rem] border backdrop-blur-md"
        style={{
          transformPerspective: 1500,
          transformOrigin: "50% 100%",
          background: `linear-gradient(115deg, ${tint(layer.brand, on ? 16 : 6)} 0%, ${tint(layer.brand, on ? 5 : 2)} 55%, transparent 100%), color-mix(in srgb, var(--surface) 78%, transparent)`,
          borderColor: tint(layer.brand, current ? 60 : on ? 34 : 16),
          boxShadow: current
            ? `0 18px 48px -18px ${tint(layer.brand, 55)}, 0 0 0 1px ${tint(layer.brand, 22)}`
            : `0 10px 30px -18px color-mix(in srgb, var(--foreground) 30%, transparent)`,
        }}
        animate={{
          rotateX: still || current ? 0 : 11,
          y: current ? -6 : 0,
          opacity: on ? 1 : 0.72,
        }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 190, damping: 24 }}
      >
        {/* Lit edge along the top, and a soft wash where the light enters. */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${tint(layer.brand, on ? 80 : 30)}, transparent)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 -left-10 w-1/3 rounded-full blur-2xl transition-opacity duration-500"
          style={{ background: tint(layer.brand, 22), opacity: on ? 1 : 0 }}
        />

        <div
          className="absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-2xl border"
          style={{
            left: f.u(CHIP_X),
            width: f.u(CHIP),
            height: f.u(CHIP),
            borderColor: tint(layer.brand, on ? 55 : 25),
            background: tint(layer.brand, on ? 20 : 8),
            boxShadow: on ? `0 0 26px ${tint(layer.brand, 45)}` : "none",
          }}
        >
          <Icon aria-hidden style={{ width: f.u(30), height: f.u(30), color: brand }} />
        </div>

        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: f.u(TEXT_X), width: f.u(ART_X - TEXT_X - 12) }}>
          <h3 className="font-semibold leading-[1.12] tracking-tight text-foreground" style={f.fs(33, 18)}>
            <span className="sr-only">{`${name}: `}</span>
            {title}
          </h3>
          <p className="mt-[0.25em] whitespace-nowrap leading-snug text-muted" style={f.fs(19, 16)}>
            {line}
          </p>
        </div>

        {/* A recessed window for the layer's art, so it sits inside the glass. */}
        <div
          aria-hidden
          className="absolute rounded-xl border border-glass"
          style={{
            left: f.u(ART_X - 22),
            right: f.u(16),
            top: f.u(10),
            bottom: f.u(10),
            background: "color-mix(in srgb, var(--background) 42%, transparent)",
            boxShadow: `inset 0 2px 14px color-mix(in srgb, var(--background) 60%, transparent), inset 0 0 0 1px ${tint(layer.brand, on ? 14 : 5)}`,
          }}
        />
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: f.u(ART_X), width: f.u(ART_W), height: f.u(ART_H) }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
