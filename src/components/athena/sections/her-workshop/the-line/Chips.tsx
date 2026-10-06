"use client";

import { motion } from "framer-motion";
import { ArrowUp, UserRound } from "lucide-react";
import { DrawCheck } from "./DrawCheck";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { Frame } from "./shared/art";
import { ITEMS, itemState } from "./data";
import type { V3Layout } from "./layout";

/**
 * The words in the field: the axis's two ends, and the eight pieces of work
 * that carry a name. A named chip sits beside its mote and wears its state -
 * a drawn check once she has done it, your mark in violet once it is yours.
 * Drag the line past one and it changes hands on the spot.
 */
export default function Chips({ phase, line, g, f, reduced }: { phase: number; line: number; g: V3Layout; f: Frame; reduced: boolean }) {
  const c = useTranslation().t.athenaSections.workshop.v3;
  const { x, y, w, h } = g.field;
  const axis = "absolute flex items-center whitespace-nowrap rounded-full bg-background/85 font-mono uppercase tracking-[0.16em] text-muted-dark backdrop-blur-sm";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className={axis} style={{ ...f.box(x + 14, y + 12), ...f.fs(14, 12), gap: f.len(6, 4), padding: f.len(6, 4) }}>
        <ArrowUp style={{ width: f.len(15, 12), height: f.len(15, 12) }} />
        {c.high}
      </span>
      <span className={axis} style={{ ...f.box(x + 14, y + h - 40), ...f.fs(14, 12), padding: f.len(6, 4) }}>
        {c.low}
      </span>

      {ITEMS.map((it, i) => {
        if (it.label === undefined) return null;
        const st = itemState(it, phase, line);
        const left = it.x > g.flipAt;
        const cx = x + it.x * w;
        const cy = y + h - it.s * h;
        const yours = st === "yours";
        return (
          <motion.span
            key={i}
            className={`absolute flex items-center whitespace-nowrap rounded-full border bg-background/80 leading-none backdrop-blur-sm ${left ? "-translate-x-full" : ""} -translate-y-1/2`}
            style={{
              ...f.at(left ? cx - 16 : cx + 16, cy),
              ...f.fs(18, 16),
              gap: f.len(8, 6),
              paddingInline: f.len(12, 8),
              paddingBlock: f.len(7, 5),
              borderColor: yours ? tint("purple", 60) : st === "done" ? tint("cyan", 45) : tint("cyan", 24),
              color: yours ? "var(--foreground)" : undefined,
              boxShadow: yours ? `0 0 22px ${tint("purple", 28)}` : undefined,
              transition: reduced ? "none" : "border-color .4s, box-shadow .4s",
            }}
            initial={false}
            animate={{ opacity: st === "pending" ? 0 : 1 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
          >
            {yours ? (
              <UserRound className="shrink-0" style={{ width: f.len(17, 14), height: f.len(17, 14), color: BRAND_VAR.purple }} />
            ) : st === "done" ? (
              <span className="flex shrink-0 text-brand-cyan" style={{ width: f.len(17, 14), height: f.len(17, 14) }}>
                <DrawCheck reduced={reduced} className="h-full w-full" />
              </span>
            ) : null}
            <span className="text-foreground">{c.items[it.label]}</span>
          </motion.span>
        );
      })}
    </div>
  );
}
