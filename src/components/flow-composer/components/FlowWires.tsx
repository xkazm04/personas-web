"use client";

import { motion } from "framer-motion";
import { NODE_R, QUEUE_Y } from "../data";
import type { Wire } from "../types";
import { SVGFocusRingCircle } from "@/components/SVGFocusRing";

export default function FlowWires({
  wires,
  nodePos,
  evGlowId,
  onRemoveWire,
}: {
  wires: Wire[];
  nodePos: (id: string) => { x: number; y: number };
  evGlowId: string;
  onRemoveWire: (from: string, to: string) => void;
}) {
  return (
    <>
      {wires.map((wire) => {
        const from = nodePos(wire.from);
        const to = nodePos(wire.to);
        const midX = (from.x + to.x) / 2;
        return (
          <g key={`${wire.from}-${wire.to}`}>
            <path
              d={`M ${from.x} ${from.y + NODE_R} L ${from.x} ${QUEUE_Y} L ${to.x} ${QUEUE_Y} L ${to.x} ${to.y - NODE_R}`}
              fill="none"
              stroke="rgba(6,182,212,0.3)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            <motion.circle
              r="0.9"
              fill="rgba(6,182,212,0.95)"
              filter={`url(#${evGlowId})`}
              initial={{ cx: from.x, cy: from.y + NODE_R, opacity: 0 }}
              animate={{
                cx: [from.x, from.x, to.x, to.x],
                cy: [from.y + NODE_R, QUEUE_Y, QUEUE_Y, to.y - NODE_R],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
            <text
              x={midX}
              y={QUEUE_Y - 6}
              textAnchor="middle"
              fill="rgba(6,182,212,0.35)"
              fontSize="1.6"
              fontFamily="var(--font-geist-mono)"
            >
              {wire.label}
            </text>
            <g
              role="button"
              tabIndex={0}
              aria-label={`Remove wire ${wire.label}`}
              className="svg-focus-parent cursor-pointer focus-visible:outline-none"
              onClick={() => onRemoveWire(wire.from, wire.to)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onRemoveWire(wire.from, wire.to);
                }
              }}
            >
              <SVGFocusRingCircle cx={midX} cy={QUEUE_Y - 6} r={2.5} offset={1.5} strokeWidth={0.4} />
              <circle
                cx={midX}
                cy={QUEUE_Y - 6}
                r="2.5"
                fill="transparent"
              >
                <title>Remove wire</title>
              </circle>
            </g>
          </g>
        );
      })}
    </>
  );
}
