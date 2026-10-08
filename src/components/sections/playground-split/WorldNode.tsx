"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { NodeStatus } from "@/components/sections/playground-split/types";
import type { WNode } from "./world";

/**
 * A beat on the dolly track: a lit disc with its name beneath. Distance from
 * the beat in focus sets the depth of field - near beats sharp, far beats
 * softened and dimmed - so the eye stays where the agent is.
 */
export default function WorldNode({
  node,
  status,
  distance,
  live,
  reduced,
}: {
  node: WNode;
  status: NodeStatus;
  /** Beats away from the focus; null in the overview (everything sharp). */
  distance: number | null;
  live: boolean;
  reduced: boolean;
}) {
  const Icon = node.icon;
  const brand = status === "done" ? "emerald" : node.brand;
  const on = status !== "pending";
  const far = distance === null ? 0 : Math.min(distance, 3);
  return (
    <motion.div
      className="absolute flex w-[220px] -translate-x-1/2 flex-col items-center"
      style={{ left: node.x, top: node.y - 40 }}
      initial={false}
      animate={{ opacity: 1 - far * 0.2, filter: `blur(${far > 1 ? (far - 1) * 1.5 : 0}px)` }}
      transition={reduced ? { duration: 0 } : { duration: 0.6 }}
    >
      <div className="relative h-20 w-20">
        {status === "active" && (
          <motion.span
            aria-hidden
            className="absolute -inset-2 rounded-full"
            style={{ background: `conic-gradient(from 0deg, transparent, ${BRAND_VAR[brand]}, transparent 40%)` }}
            animate={live ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1.4, repeat: live ? Infinity : 0, ease: "linear" }}
          />
        )}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full border transition-[border-color,box-shadow,background] duration-500"
          style={{
            borderColor: on ? tint(brand, 70) : "var(--border-glass-strong)",
            background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--background) ${on ? 70 : 88}%, ${BRAND_VAR[on ? brand : "blue"]}), var(--background) 75%)`,
            boxShadow: on ? `0 0 40px ${tint(brand, status === "active" ? 55 : 25)}, inset 0 1px 0 rgba(var(--surface-overlay),0.15)` : "inset 0 1px 0 rgba(var(--surface-overlay),0.08)",
          }}
        >
          {status === "done" ? (
            <Check className="h-8 w-8" style={{ color: BRAND_VAR.emerald }} strokeWidth={2.5} />
          ) : (
            <Icon className="h-8 w-8" style={{ color: on ? BRAND_VAR[brand] : "var(--text-secondary)" }} strokeWidth={1.75} />
          )}
        </div>
      </div>
      <span
        className={`mt-3 whitespace-nowrap text-[22px] font-semibold tracking-tight ${on ? "text-foreground" : "text-muted-dark"}`}
      >
        {node.label}
      </span>
    </motion.div>
  );
}
