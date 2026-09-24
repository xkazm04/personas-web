"use client";

import { useId, useRef } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useLoopGate } from "@/hooks/useLoopGate";
import { loopTransition } from "@/lib/motion/loop-gate";
import { TRIGGERS, CENTER, RADIUS, nodePosition } from "./data";
import HubNode from "./HubNode";

interface HubRingProps {
  active: string;
  onSelect: (id: string) => void;
  /** The visitor stopped the hub's motion with a control ("user" decider). */
  userStopped?: boolean;
}

/**
 * HubRing — the SVG ring of 10 trigger nodes orbiting a central persona chip.
 * A continuous "signal rain" of pulses runs every spoke inward to the hub,
 * dramatizing "any signal can wake any agent"; the active spoke's pulse is
 * brighter and faster. Both loops run only while the loop gate allows it
 * (reduced motion, hidden tab, scrolled past, or a user stop all rest them);
 * the gate switches their animate/transition props, never the elements.
 */
export default function HubRing({ active, onSelect, userStopped = false }: HubRingProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { run, still } = useLoopGate(svgRef, { userStopped });
  const uid = useId();
  const activeTrigger = TRIGGERS.find((t) => t.id === active) ?? TRIGGERS[0];
  const activeVar = BRAND_VAR[activeTrigger.brand];

  return (
    <svg ref={svgRef} viewBox="0 0 520 520" className="h-full w-full" role="group" aria-label="Trigger types">
      <defs>
        <radialGradient id={`${uid}-hub`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={activeVar} stopOpacity="0.5" />
          <stop offset="100%" stopColor={activeVar} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient ring — low-contrast guide circle, slowly rotating for life */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="rgba(var(--surface-overlay), 0.06)"
        strokeWidth="1"
        strokeDasharray="4 6"
        animate={{ rotate: run ? 360 : 0 }}
        transition={loopTransition(run, { duration: 80, ease: "linear" })}
        style={{ transformBox: "view-box", transformOrigin: `${CENTER}px ${CENTER}px` }}
      />
      <circle cx={CENTER} cy={CENTER} r={90} fill={`url(#${uid}-hub)`} />

      {/* Spoke lines (rendered behind nodes via svg order) */}
      {TRIGGERS.map((trigger, i) => {
        const p = nodePosition(i, TRIGGERS.length);
        const isActive = trigger.id === active;
        return (
          <line
            key={`line-${trigger.id}`}
            x1={CENTER}
            y1={CENTER}
            x2={p.x}
            y2={p.y}
            stroke={isActive ? BRAND_VAR[trigger.brand] : "rgba(var(--surface-overlay), 0.08)"}
            strokeWidth={isActive ? 1.75 : 1}
          />
        );
      })}

      {/* Signal rain — a pulse travels each spoke inward to the hub, staggered
          by node so signals appear to converge continuously. */}
      {TRIGGERS.map((trigger, i) => {
        const p = nodePosition(i, TRIGGERS.length);
        const isActive = trigger.id === active;
        return (
          <motion.circle
            key={`pulse-${trigger.id}`}
            r={isActive ? 4.5 : 2.2}
            fill={BRAND_VAR[trigger.brand]}
            initial={{ cx: p.x, cy: p.y, opacity: 0 }}
            animate={
              run
                ? {
                    cx: CENTER,
                    cy: CENTER,
                    opacity: isActive ? [0, 1, 1, 0.2] : [0, 0.45, 0.45, 0],
                  }
                : { cx: p.x, cy: p.y, opacity: 0 }
            }
            transition={loopTransition(run, {
              duration: isActive ? 1.5 : 2.8,
              ease: "easeInOut",
              delay: i * 0.3,
            })}
          />
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
      {TRIGGERS.map((trigger, i) => (
        <HubNode
          key={trigger.id}
          trigger={trigger}
          index={i}
          total={TRIGGERS.length}
          isActive={trigger.id === active}
          reduced={still}
          onSelect={onSelect}
        />
      ))}
    </svg>
  );
}
