"use client";

import { motion } from "framer-motion";
import { type Memory, CATEGORIES } from "../../memoryShared";
import { HUB_CX, HUB_CY, HUB_RADIUS, HUB_SIZE, ARM_OUTER } from "../geometry";
import NeuralArm from "./NeuralArm";

export default function NeuralHub({
  memories,
  freshId,
}: {
  memories: Memory[];
  freshId: number | null;
}) {
  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    memories: memories.filter((m) => m.category === cat),
  }));

  return (
    <svg
      viewBox={`0 0 ${HUB_SIZE} ${HUB_SIZE}`}
      className="mx-auto w-full max-w-[700px] h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {[0.4, 0.65, 0.9].map((f) => (
        <circle
          key={f}
          cx={HUB_CX}
          cy={HUB_CY}
          r={ARM_OUTER * f}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="3 6"
        />
      ))}

      {grouped.map(({ category, memories: catMemories }) => (
        <NeuralArm
          key={category}
          category={category}
          memories={catMemories}
          freshId={freshId}
        />
      ))}

      <motion.circle
        cx={HUB_CX}
        cy={HUB_CY}
        r={HUB_RADIUS + 8}
        fill="none"
        stroke="rgba(168, 85, 247, 0.4)"
        strokeWidth={2}
        animate={{ r: [HUB_RADIUS + 6, HUB_RADIUS + 10, HUB_RADIUS + 6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle
        cx={HUB_CX}
        cy={HUB_CY}
        r={HUB_RADIUS}
        fill="rgba(168, 85, 247, 0.12)"
        stroke="rgba(168, 85, 247, 0.8)"
        strokeWidth={2}
      />
      <text
        x={HUB_CX}
        y={HUB_CY - 4}
        textAnchor="middle"
        fill="white"
        fontSize={20}
        fontWeight={800}
        fontFamily="monospace"
      >
        {memories.length}
      </text>
      <text
        x={HUB_CX}
        y={HUB_CY + 16}
        textAnchor="middle"
        fill="rgba(255,255,255,0.65)"
        fontSize={16}
        fontFamily="monospace"
      >
        total
      </text>
    </svg>
  );
}
