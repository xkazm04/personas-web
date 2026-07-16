"use client";

import { useReducedMotion } from "framer-motion";
import { CONSUMER_Y, NODE_R, PRODUCER_Y, TOOL_MAP } from "../data";
import type { CanvasNode } from "../types";
import { SVGFocusRingCircle } from "@/components/SVGFocusRing";

export default function FlowNodes({
  nodes,
  wiringFrom,
  onNodePointerDown,
  onNodeClick,
  onNodeKeyDown,
  onRemoveNode,
}: {
  nodes: CanvasNode[];
  wiringFrom: string | null;
  onNodePointerDown: (e: React.PointerEvent, nodeId: string) => void;
  onNodeClick: (e: React.MouseEvent, nodeId: string) => void;
  onNodeKeyDown: (e: React.KeyboardEvent, nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <>
      {nodes.map((node) => {
        const tool = TOOL_MAP.get(node.toolId);
        if (!tool) return null;
        const y = node.side === "producer" ? PRODUCER_Y : CONSUMER_Y;
        const isWiringSource = wiringFrom === node.id;

        return (
          // Non-interactive wrapper so the node and its remove control are
          // SIBLING buttons, not nested (WCAG 4.1.2 nested-interactive).
          <g key={node.id}>
          <g
            role="button"
            tabIndex={0}
            aria-label={`${tool.name} ${node.side} node`}
            className="svg-focus-parent cursor-grab focus-visible:outline-none"
            onPointerDown={(e) => onNodePointerDown(e, node.id)}
            onClick={(e) => onNodeClick(e, node.id)}
            onKeyDown={(e) => onNodeKeyDown(e, node.id)}
          >
            <SVGFocusRingCircle cx={node.x} cy={y} r={NODE_R} offset={2} strokeWidth={0.5} />

            {isWiringSource && (
              <circle
                cx={node.x}
                cy={y}
                r={NODE_R + 2}
                fill="none"
                stroke="rgba(6,182,212,0.4)"
                strokeWidth="0.3"
                strokeDasharray="1 1"
              >
                {!reduced && (
                  <animate
                    attributeName="r"
                    values={`${NODE_R + 1.5};${NODE_R + 2.5};${NODE_R + 1.5}`}
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            )}

            <circle
              cx={node.x}
              cy={y}
              r={NODE_R}
              fill={`${tool.color}15`}
              stroke={tool.color}
              strokeWidth="0.35"
              opacity="0.8"
            />
            <circle cx={node.x} cy={y} r="1.8" fill={tool.color} opacity="0.8" />

            <text
              x={node.x}
              y={node.side === "producer" ? y - NODE_R - 2 : y + NODE_R + 4}
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize="2.2"
              fontFamily="var(--font-geist-mono)"
              letterSpacing="0.04em"
            >
              {tool.name}
            </text>
            <text
              x={node.x}
              y={node.side === "producer" ? y + NODE_R + 3.5 : y - NODE_R - 1}
              textAnchor="middle"
              fill="var(--text-disabled)"
              fontSize="1.3"
              fontFamily="var(--font-geist-mono)"
              letterSpacing="0.08em"
            >
              {node.side === "producer" ? "PRODUCER" : "CONSUMER"}
            </text>

          </g>
            {/* Sibling of the node button (not nested). Always faintly visible
                so touch users can discover + hit it deliberately, rather than
                an invisible tap target that deletes on a stray edge tap. */}
            <g
              role="button"
              tabIndex={0}
              aria-label={`Remove ${tool.name} node`}
              className="svg-focus-parent cursor-pointer opacity-40 hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveNode(node.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveNode(node.id);
                }
              }}
            >
              <SVGFocusRingCircle cx={node.x + NODE_R} cy={y - NODE_R} r={1.5} offset={1.5} strokeWidth={0.4} />
              <circle
                cx={node.x + NODE_R}
                cy={y - NODE_R}
                r="1.5"
                fill="rgba(239,68,68,0.3)"
                stroke="rgba(239,68,68,0.5)"
                strokeWidth="0.2"
              />
              <text
                x={node.x + NODE_R}
                y={y - NODE_R + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(239,68,68,0.8)"
                fontSize="1.5"
                fontFamily="var(--font-geist-mono)"
              >
                x
              </text>
            </g>
          </g>
        );
      })}
    </>
  );
}
