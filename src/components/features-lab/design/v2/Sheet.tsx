"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { DesignCopy } from "../shared/copy";
import { H, TITLE_BLOCK, u, W } from "./geometry";
import { LABEL_SIZE } from "./Callout";

/** The drawing sheet under the machine: a fine grid, registration corners. */
export function SheetGrid() {
  const id = useId().replace(/:/g, "");
  const corner = (x: number, y: number, sx: number, sy: number) => `M${x} ${y + sy * 18} V${y} H${x + sx * 18}`;
  return (
    <g aria-hidden="true">
      <defs>
        <pattern id={`${id}m`} width={20} height={20} patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" fill="none" stroke="color-mix(in srgb, var(--brand-cyan) 9%, transparent)" strokeWidth={0.6} />
        </pattern>
        <pattern id={`${id}M`} width={100} height={100} patternUnits="userSpaceOnUse">
          <rect width={100} height={100} fill={`url(#${id}m)`} />
          <path d="M100 0 H0 V100" fill="none" stroke="color-mix(in srgb, var(--brand-cyan) 16%, transparent)" strokeWidth={0.9} />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}M)`} />
      <path
        d={`${corner(6, 6, 1, 1)} ${corner(W - 6, 6, -1, 1)} ${corner(6, H - 6, 1, -1)} ${corner(W - 6, H - 6, -1, -1)}`}
        fill="none"
        stroke="color-mix(in srgb, var(--brand-cyan) 55%, transparent)"
        strokeWidth={1.4}
      />
      <path d={`M20 84 H${W - 20}`} stroke="color-mix(in srgb, var(--brand-cyan) 30%, transparent)" strokeWidth={1} strokeDasharray="2 5" />
    </g>
  );
}

/**
 * The title block in the corner of the sheet: what was drawn, for whom, and
 * that it is a stylised drawing; stamped "ready to deploy" when finished.
 */
export function TitleBlock({ copy, done, moving }: { copy: DesignCopy; done: boolean; moving: boolean }) {
  const tb = TITLE_BLOCK;
  return (
    <div
      className="absolute flex flex-col justify-center border px-[1cqw]"
      style={{ left: u(tb.x), top: u(tb.y), width: u(tb.w), height: u(tb.h), borderColor: "color-mix(in srgb, var(--brand-cyan) 45%, transparent)", backgroundColor: "color-mix(in srgb, var(--background) 70%, transparent)" }}
    >
      <span className="font-mono uppercase tracking-[0.14em] text-foreground/70" style={{ fontSize: LABEL_SIZE }}>
        {copy.lab.v2.sheet} &middot; {copy.lab.v2.stylised}
      </span>
      <span className="font-semibold text-foreground" style={{ fontSize: "max(16px, 1.55cqw)" }}>
        {copy.lab.persona}
      </span>
      <motion.span
        className="absolute bottom-[0.5cqw] right-[0.8cqw] rounded-md border-2 px-[0.6cqw] py-[0.15cqw] font-mono font-bold uppercase tracking-wider"
        style={{ fontSize: LABEL_SIZE, color: "var(--brand-emerald)", borderColor: "var(--brand-emerald)", backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)" }}
        initial={false}
        animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 1.4, rotate: -6 }}
        transition={moving ? { type: "spring", stiffness: 260, damping: 16 } : { duration: 0 }}
      >
        {copy.lab.ready}
      </motion.span>
    </div>
  );
}
