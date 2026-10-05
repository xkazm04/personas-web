"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { NodeStatus } from "@/components/sections/playground-split/types";
import type { GNode } from "./layout";

/**
 * One flowchart node: an opaque capsule (edges pass beneath it) lit in its
 * beat's colour while it works - a rotating rim of light and a lift toward
 * the viewer - and settled to emerald with a check once done.
 */
export default function GraphNode({
  node,
  status,
  focused,
  live,
  reduced,
}: {
  node: GNode;
  status: NodeStatus;
  focused: boolean;
  live: boolean;
  reduced: boolean;
}) {
  const Icon = node.icon;
  const brand = status === "done" ? "emerald" : node.brand;
  const on = status !== "pending";
  return (
    <motion.div
      data-am-node={node.id}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: focused ? 3 : 2 }}
      initial={false}
      animate={{ scale: focused ? 1.1 : 1 }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
    >
      <div
        className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border py-[0.35em] pl-[0.35em] pr-3.5 text-base whitespace-nowrap transition-[border-color,box-shadow,background-color] duration-500"
        style={{
          borderColor: on ? tint(brand, status === "active" ? 70 : 40) : "var(--border-glass-hover)",
          background: `color-mix(in srgb, var(--background) ${on ? 86 : 94}%, ${BRAND_VAR[on ? brand : "blue"]})`,
          boxShadow:
            status === "active"
              ? `0 0 0 1px ${tint(brand, 25)}, 0 10px 30px -8px ${tint(brand, 55)}`
              : "0 6px 18px -10px color-mix(in srgb, var(--background) 80%, transparent)",
        }}
      >
        {status === "active" && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/2"
            style={{ background: `linear-gradient(90deg, transparent, ${tint(brand, 22)}, transparent)` }}
            initial={{ left: "-50%" }}
            animate={live ? { left: ["-50%", "100%"] } : { left: "-50%" }}
            transition={{ duration: 1.3, repeat: live ? Infinity : 0, ease: "easeInOut" }}
          />
        )}
        <span
          className="relative flex h-[1.75em] w-[1.75em] items-center justify-center rounded-lg"
          style={{ background: on ? tint(brand, 18) : "rgba(var(--surface-overlay), 0.04)" }}
        >
          {status === "done" ? (
            <Check className="h-4 w-4" style={{ color: BRAND_VAR.emerald }} strokeWidth={2.5} />
          ) : (
            <Icon className="h-4 w-4" style={{ color: on ? BRAND_VAR[brand] : "var(--text-secondary)" }} />
          )}
        </span>
        <span className={`relative font-medium ${on ? "text-foreground" : "text-muted-dark"}`}>{node.label}</span>
      </div>
    </motion.div>
  );
}
