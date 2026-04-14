"use client";

import { motion } from "framer-motion";
import { nodes, nodeStatusColor } from "../data";
import type { NodeStatus } from "../types";

export default function CircuitNodes({
  getNodeStatus,
}: {
  getNodeStatus: (nodeId: string) => NodeStatus;
}) {
  return (
    <>
      {nodes.map((node) => {
        const status = getNodeStatus(node.id);
        const color = nodeStatusColor[status];
        const isAffected = status !== "healthy";

        return (
          <g key={node.id}>
            <rect
              x={node.x - 46}
              y={node.y - 36}
              width={92}
              height={72}
              rx={8}
              fill="rgba(0,0,0,0.55)"
            />

            <motion.rect
              x={node.x - 44}
              y={node.y - 36}
              width={88}
              height={72}
              rx={7}
              fill="rgba(15,15,25,0.92)"
              stroke={color}
              strokeWidth={1.75}
              animate={{
                strokeOpacity: isAffected ? [0.7, 1, 0.7] : 0.45,
              }}
              transition={
                isAffected
                  ? { duration: 0.8, repeat: Infinity }
                  : { duration: 0.5 }
              }
            />

            {[-28, -14, 0, 14, 28].map((offset) => (
              <g key={`pins-${node.id}-${offset}`}>
                <rect
                  x={node.x - 50}
                  y={node.y - 2 + offset * 0.4}
                  width={7}
                  height={2.5}
                  rx={0.5}
                  fill={color}
                  opacity={0.3}
                />
                <rect
                  x={node.x + 44}
                  y={node.y - 2 + offset * 0.4}
                  width={7}
                  height={2.5}
                  rx={0.5}
                  fill={color}
                  opacity={0.3}
                />
              </g>
            ))}

            {isAffected && (
              <motion.rect
                x={node.x - 46}
                y={node.y - 38}
                width={92}
                height={76}
                rx={9}
                fill="none"
                stroke={color}
                strokeWidth={1.25}
                filter="url(#nodeGlow)"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}

            <motion.circle
              cx={node.x + 34}
              cy={node.y - 26}
              r={3}
              fill={color}
              animate={isAffected ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={
                isAffected
                  ? { duration: 0.5, repeat: Infinity }
                  : { duration: 0.3 }
              }
            />

            <circle cx={node.x} cy={node.y - 16} r={5} fill={color} opacity={0.85} />

            <text
              x={node.x}
              y={node.y + 10}
              textAnchor="middle"
              fill="white"
              fontSize={16}
              fontWeight={600}
              fontFamily="monospace"
              opacity={1}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </>
  );
}
