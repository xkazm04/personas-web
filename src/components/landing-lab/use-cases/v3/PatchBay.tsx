"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { CASES, TOOLS, brandInk, brandTint } from "../shared/catalog";
import ToolGlyph from "../shared/ToolGlyph";
import { JACK_R, RACKS, cq, px, py } from "./geometry";

/**
 * The rack of tool jacks (HTML over the SVG layer, so the real brand glyphs
 * can be masked to the theme). The rack the current need calls on lights up
 * and the rest fall back; a jack that holds a cable keeps its brand ring.
 * Racks carry no captions: the logos say what they are.
 */
export default function PatchBay({
  active,
  lit,
  plugged,
  moving,
}: {
  active: number;
  /** The active rack is lit (CONSIDER, SCAN, CHOOSE). */
  lit: boolean;
  /** Per case: its cable is in its chosen jack. */
  plugged: boolean[];
  moving: boolean;
}) {
  const t = { duration: moving ? 0.45 : 0 };
  return (
    <>
      {RACKS.map((r) => {
        const on = lit && r.caseIdx === active;
        return (
          <motion.div
            key={`${r.x}-${r.y}`}
            className="absolute rounded-[1cqw] border [border-color:var(--bc)]"
            style={{
              left: px(r.x),
              top: py(r.y),
              width: cq(r.w),
              height: cq(r.h),
              backgroundColor: on ? tint("cyan", 8) : "rgba(var(--surface-overlay), 0.03)",
              "--bc": on ? "var(--brand-cyan)" : "var(--border-glass-hover)",
              boxShadow: on ? `0 0 ${cq(30)} ${tint("cyan", 18)}` : "none",
            } as CSSProperties}
            initial={false}
            animate={{ opacity: lit && !on ? 0.4 : 1 }}
            transition={t}
          />
        );
      })}

      {RACKS.flatMap((r) =>
        r.jacks.map((j, k) => {
          const tool = j.key ? TOOLS[j.key] : null;
          const caseIdx = j.key ? CASES.findIndex((c) => c.chosen === j.key) : -1;
          const held = caseIdx >= 0 && plugged[caseIdx];
          const on = lit && r.caseIdx === active && !!tool;
          return (
            <motion.div
              key={`${r.x}-${r.y}-${k}`}
              className="absolute flex items-center justify-center rounded-full border-2 [border-color:var(--bc)]"
              style={{
                left: px(j.x),
                top: py(j.y),
                width: cq(JACK_R * 2),
                height: cq(JACK_R * 2),
                marginLeft: cq(-JACK_R),
                marginTop: cq(-JACK_R),
                color: held && tool ? brandInk(tool, 60) : on ? "var(--foreground)" : "var(--muted-dark)",
                backgroundColor: held && tool ? brandTint(tool, 22) : "color-mix(in srgb, var(--background) 70%, transparent)",
                "--bc": held && tool ? brandInk(tool, 60) : on ? tint("cyan", 55) : "var(--border-glass)",
              } as CSSProperties}
              initial={false}
              animate={{ scale: held ? 1.08 : 1 }}
              transition={t}
            >
              {tool ? <ToolGlyph tool={tool} className="h-[50%] w-[50%] transition-colors duration-500" /> : <span className="h-[30%] w-[30%] rounded-full bg-muted-dark/60" aria-hidden="true" />}
            </motion.div>
          );
        }),
      )}
    </>
  );
}
