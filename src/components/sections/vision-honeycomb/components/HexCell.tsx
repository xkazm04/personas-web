"use client";

import { motion } from "framer-motion";
import type { AgentData } from "../types";
import { statusStyles, hexPath } from "../data";

interface HexCellProps {
  agent: AgentData;
  x: number;
  y: number;
  index: number;
  isFlashing: boolean;
  isHovered: boolean;
  onHover: (i: number | null) => void;
}

export default function HexCell({ agent, x, y, index, isFlashing, isHovered, onHover }: HexCellProps) {
  const st = statusStyles[agent.status];
  const hexSize = 56;
  const path = hexPath(hexSize);
  const borderPath = hexPath(hexSize + 2);

  const activityLevel = Math.min(agent.executions / 13000, 1);

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.5, ease: "easeOut" }}
      style={{ cursor: "pointer" }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <g transform={`translate(${x}, ${y})`}>
        {isFlashing && (
          <motion.path
            d={hexPath(hexSize + 10)}
            fill="none"
            stroke={agent.color}
            strokeWidth={1.5}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.7 }}
          />
        )}

        <path
          d={borderPath}
          fill="none"
          stroke={st.border}
          strokeWidth={1.2}
          style={{
            filter: isFlashing ? `drop-shadow(0 0 8px ${agent.color})` : undefined,
            transition: "filter 0.3s, stroke 0.3s",
          }}
        />

        <defs>
          <linearGradient id={`hex-fill-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={agent.color}
              stopOpacity={isFlashing ? 0.18 : 0.06 + activityLevel * 0.06}
            />
            <stop offset="100%" stopColor={agent.color} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <path d={path} fill={`url(#hex-fill-${index})`} style={{ transition: "fill 0.4s" }} />
        <path d={path} fill="rgba(0,0,0,0.35)" />
        <path d={path} fill={`url(#hex-fill-${index})`} />

        <foreignObject x={-12} y={-24} width={24} height={24}>
          <div className="flex items-center justify-center w-full h-full">
            <agent.icon className="h-4 w-4" style={{ color: agent.color }} />
          </div>
        </foreignObject>

        <text y={2} textAnchor="middle" className="fill-white/80 text-sm font-medium" style={{ fontFamily: "inherit" }}>
          {agent.name}
        </text>

        <text
          y={15}
          textAnchor="middle"
          className="fill-white/40 text-sm font-mono"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          {agent.executions.toLocaleString()} runs
        </text>

        <rect x={-22} y={23} width={44} height={3} rx={1.5} fill="rgba(255,255,255,0.04)" />
        <rect
          x={-22}
          y={23}
          width={44 * (agent.rate / 100)}
          height={3}
          rx={1.5}
          fill={agent.rate >= 90 ? "#34d399" : agent.rate >= 80 ? "#fbbf24" : "#f43f5e"}
          style={{ transition: "width 0.5s ease" }}
        />

        <circle
          cx={32}
          cy={-32}
          r={3}
          fill={
            agent.status === "running"
              ? "#34d399"
              : agent.status === "healing"
                ? "#fbbf24"
                : "rgba(255,255,255,0.2)"
          }
        >
          {agent.status === "healing" && (
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          )}
        </circle>

        {isHovered && (
          <motion.path
            d={hexPath(hexSize + 5)}
            fill="none"
            stroke={agent.color}
            strokeWidth={1}
            strokeOpacity={0.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </g>
    </motion.g>
  );
}
