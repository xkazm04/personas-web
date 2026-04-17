"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { type Memory, type Category, CATEGORY_META } from "../../memoryShared";
import {
  ARM_ANGLES,
  ARM_OUTER,
  HUB_RADIUS,
  NODE_RADIUS,
  angleToXY,
} from "../geometry";

export default function NeuralArm({
  category,
  memories,
  freshId,
}: {
  category: Category;
  memories: Memory[];
  freshId: number | null;
}) {
  const reduced = useReducedMotion();
  const meta = CATEGORY_META[category];
  const angle = ARM_ANGLES[category];

  const sorted = useMemo(
    () => memories.slice().sort((a, b) => b.importance - a.importance),
    [memories],
  );
  const [particleDelay] = useState(() => Math.random() * 2);

  const armStart = HUB_RADIUS + 15;
  const nodeCount = Math.max(sorted.length, 1);
  const nodeSpacing = (ARM_OUTER - armStart) / (nodeCount + 1);

  const endPoint = angleToXY(angle, ARM_OUTER + 10);
  const armStartPoint = angleToXY(angle, armStart);

  const labelPoint = angleToXY(angle, ARM_OUTER + 40);
  const labelAlign =
    angle < 0 && angle > -180
      ? "end"
      : angle > 0 && angle < 180
        ? "start"
        : "middle";

  return (
    <g>
      <motion.line
        x1={armStartPoint.x}
        y1={armStartPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke={meta.color}
        strokeOpacity={0.3}
        strokeWidth={2}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {reduced ? (
        <circle
          r={3}
          cx={(armStartPoint.x + endPoint.x) / 2}
          cy={(armStartPoint.y + endPoint.y) / 2}
          fill={meta.color}
          opacity={0.6}
        />
      ) : (
        <motion.circle
          r={3}
          fill={meta.color}
          opacity={0.8}
          initial={{ cx: armStartPoint.x, cy: armStartPoint.y }}
          animate={{
            cx: [armStartPoint.x, endPoint.x, armStartPoint.x],
            cy: [armStartPoint.y, endPoint.y, armStartPoint.y],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particleDelay,
          }}
        />
      )}

      {sorted.map((mem, i) => {
        const r = armStart + nodeSpacing * (i + 1);
        const { x, y } = angleToXY(angle, r);
        const isFresh = mem.id === freshId;
        const size = NODE_RADIUS + mem.importance * 0.6;

        return (
          <g key={`${category}-${mem.id}`}>
            {isFresh && !reduced && (
              <motion.circle
                cx={x}
                cy={y}
                r={size + 6}
                fill="none"
                stroke={meta.color}
                strokeWidth={2}
                initial={{ opacity: 1, scale: 0.8 }}
                animate={{ opacity: 0, scale: 2.2 }}
                transition={{ duration: 1.2, repeat: 1 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={size + 2}
              fill={meta.color}
              opacity={isFresh ? 0.3 : 0.15}
            />
            <motion.circle
              cx={x}
              cy={y}
              r={size}
              fill={meta.color}
              initial={reduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduced ? { duration: 0 } : {
                type: "spring",
                stiffness: 300,
                damping: 22,
                delay: 0.3 + i * 0.1,
              }}
              style={{
                filter: `drop-shadow(0 0 ${size}px ${meta.color}90)`,
                transformOrigin: `${x}px ${y}px`,
              }}
            />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fill="black"
              fontSize={16}
              fontWeight={700}
              fontFamily="monospace"
            >
              {mem.importance}
            </text>
          </g>
        );
      })}

      <text
        x={labelPoint.x}
        y={labelPoint.y}
        textAnchor={labelAlign}
        fill={meta.color}
        fontSize={16}
        fontWeight={700}
        fontFamily="monospace"
        style={{ textTransform: "uppercase", letterSpacing: 2 }}
      >
        {meta.label.toUpperCase()}
      </text>
      <text
        x={labelPoint.x}
        y={labelPoint.y + 18}
        textAnchor={labelAlign}
        fill="rgba(255,255,255,0.6)"
        fontSize={16}
        fontFamily="monospace"
      >
        {sorted.length} {sorted.length === 1 ? "memory" : "memories"}
      </text>
    </g>
  );
}
