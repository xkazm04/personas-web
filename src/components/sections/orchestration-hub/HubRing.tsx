"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { TRIGGERS, CENTER, RADIUS, NODE_SIZE, nodePosition } from "./data";

interface HubRingProps {
  active: string;
  onSelect: (id: string) => void;
}

/**
 * HubRing — the SVG ring of 8 trigger nodes orbiting a central persona chip.
 * Each trigger has an opaque backing rect so the active spoke line never
 * shows through the node surface.
 */

export default function HubRing({ active, onSelect }: HubRingProps) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const activeTrigger = TRIGGERS.find((t) => t.id === active)!;
  const activeVar = BRAND_VAR[activeTrigger.brand];

  return (
    <svg viewBox="0 0 520 520" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-hub`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={activeVar} stopOpacity="0.5" />
          <stop offset="100%" stopColor={activeVar} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient ring — low-contrast guide circle */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="rgba(var(--surface-overlay), 0.06)"
        strokeWidth="1"
        strokeDasharray="4 6"
      />
      <circle cx={CENTER} cy={CENTER} r={90} fill={`url(#${uid}-hub)`} />

      {/* Spoke lines (rendered behind nodes via svg order) */}
      {TRIGGERS.map((trigger, i) => {
        const p = nodePosition(i, TRIGGERS.length);
        const isActive = trigger.id === active;
        return (
          <g key={`line-${trigger.id}`}>
            <line
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke={
                isActive
                  ? BRAND_VAR[trigger.brand]
                  : "rgba(var(--surface-overlay), 0.08)"
              }
              strokeWidth={isActive ? 1.75 : 1}
            />
            {isActive && !reduced && (
              <motion.circle
                r="4.5"
                fill={BRAND_VAR[trigger.brand]}
                initial={{ cx: p.x, cy: p.y, opacity: 1 }}
                animate={{ cx: CENTER, cy: CENTER, opacity: [1, 1, 0.2] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </g>
        );
      })}

      {/* Central persona node — dual-theme image inside a circular mask */}
      <g>
        <circle
          cx={CENTER}
          cy={CENTER}
          r="62"
          fill="var(--background)"
          stroke="rgba(var(--surface-overlay), 0.14)"
          strokeWidth="1.5"
        />
        <foreignObject x={CENTER - 60} y={CENTER - 60} width={120} height={120}>
          <div className="h-full w-full overflow-hidden rounded-full">
            <img
              src="/imgs/guide/agents-prompts-dark.png"
              alt=""
              aria-hidden="true"
              className="hidden dark:block h-full w-full object-cover"
            />
            <img
              src="/imgs/guide/agents-prompts-light.png"
              alt=""
              aria-hidden="true"
              className="block dark:hidden h-full w-full object-cover"
            />
          </div>
        </foreignObject>
      </g>

      {/* Trigger nodes — opaque so spoke lines never show through */}
      {TRIGGERS.map((trigger, i) => {
        const p = nodePosition(i, TRIGGERS.length);
        const isActive = trigger.id === active;
        const Icon = trigger.icon;
        const v = BRAND_VAR[trigger.brand];
        return (
          <g
            key={trigger.id}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(trigger.id)}
          >
            {/* Opaque backing hides the line behind the node */}
            <rect
              x={p.x - NODE_SIZE / 2}
              y={p.y - NODE_SIZE / 2}
              width={NODE_SIZE}
              height={NODE_SIZE}
              rx="18"
              fill="var(--background)"
            />
            <foreignObject
              x={p.x - NODE_SIZE / 2}
              y={p.y - NODE_SIZE / 2}
              width={NODE_SIZE}
              height={NODE_SIZE}
            >
              <motion.div
                animate={{ scale: isActive ? 1.06 : 1 }}
                className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-2xl border transition-colors"
                style={{
                  backgroundColor: isActive
                    ? tint(trigger.brand, 14)
                    : "var(--background)",
                  borderColor: isActive
                    ? tint(trigger.brand, 50)
                    : "rgba(var(--surface-overlay), 0.10)",
                  boxShadow: isActive
                    ? `0 0 24px ${tint(trigger.brand, 30)}`
                    : "none",
                }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{
                    color: isActive
                      ? v
                      : "rgba(var(--surface-overlay), 0.55)",
                  }}
                />
                <span
                  className="text-base font-semibold leading-tight text-center px-1"
                  style={{
                    color: isActive
                      ? "var(--foreground)"
                      : "var(--muted-dark)",
                  }}
                >
                  {trigger.label}
                </span>
              </motion.div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
