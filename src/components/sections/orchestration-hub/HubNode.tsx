"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SVGFocusRingRect } from "@/components/SVGFocusRing";
import { NODE_SIZE, nodePosition, type TriggerDef } from "./data";

interface HubNodeProps {
  trigger: TriggerDef;
  index: number;
  total: number;
  isActive: boolean;
  reduced: boolean;
  onSelect: (id: string) => void;
}

/**
 * A single trigger node on the orbit ring: an opaque rounded chip (so the spoke
 * line never shows through) with an icon + label, plus a pulsing halo when
 * active. Entrance and halo motion are gated on reduced-motion preference.
 */
export default function HubNode({
  trigger,
  index,
  total,
  isActive,
  reduced,
  onSelect,
}: HubNodeProps) {
  const p = nodePosition(index, total);
  const Icon = trigger.icon;
  const v = BRAND_VAR[trigger.brand];

  return (
    <g
      data-trigger-id={trigger.id}
      role="button"
      tabIndex={0}
      aria-label={trigger.label}
      aria-pressed={isActive}
      className="svg-focus-parent cursor-pointer focus-visible:outline-none"
      onClick={() => onSelect(trigger.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(trigger.id);
        }
      }}
    >
      <SVGFocusRingRect
        x={p.x - NODE_SIZE / 2}
        y={p.y - NODE_SIZE / 2}
        width={NODE_SIZE}
        height={NODE_SIZE}
        offset={4}
        rx={20}
        strokeWidth={2}
      />
      {/* Pulsing halo behind the active node */}
      {isActive && !reduced && (
        <motion.circle
          cx={p.x}
          cy={p.y}
          r={NODE_SIZE / 2}
          fill="none"
          stroke={v}
          strokeWidth="1.25"
          initial={{ opacity: 0.5, scale: 0.92 }}
          animate={{ opacity: [0.5, 0, 0.5], scale: [0.92, 1.35, 0.92] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          style={{ transformBox: "view-box", transformOrigin: `${p.x}px ${p.y}px` }}
        />
      )}
      {/* Opaque backing hides the line behind the node */}
      <rect
        x={p.x - NODE_SIZE / 2}
        y={p.y - NODE_SIZE / 2}
        width={NODE_SIZE}
        height={NODE_SIZE}
        rx="18"
        fill="var(--background)"
      />
      <foreignObject x={p.x - NODE_SIZE / 2} y={p.y - NODE_SIZE / 2} width={NODE_SIZE} height={NODE_SIZE}>
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: isActive ? 1.06 : 1 }}
          transition={
            reduced ? { duration: 0 } : { delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }
          }
          className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-2xl border transition-colors"
          style={{
            backgroundColor: isActive ? tint(trigger.brand, 14) : "var(--background)",
            borderColor: isActive ? tint(trigger.brand, 50) : "rgba(var(--surface-overlay), 0.10)",
            boxShadow: isActive ? `0 0 24px ${tint(trigger.brand, 30)}` : "none",
          }}
        >
          <Icon className="h-5 w-5" style={{ color: isActive ? v : "rgba(var(--surface-overlay), 0.55)" }} />
          <span
            className="text-base font-semibold leading-tight text-center px-1"
            style={{ color: isActive ? "var(--foreground)" : "var(--muted-dark)" }}
          >
            {trigger.label}
          </span>
        </motion.div>
      </foreignObject>
    </g>
  );
}
