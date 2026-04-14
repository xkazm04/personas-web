"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { hexPath } from "../data";

export default function OrchestratorHex({ cx, cy }: { cx: number; cy: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
    >
      <g transform={`translate(${cx}, ${cy})`}>
        <defs>
          <radialGradient id="orch-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.12} />
            <stop offset="60%" stopColor="#a855f7" stopOpacity={0.06} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>
        </defs>
        <path d={hexPath(52)} fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth={1.5} />
        <path d={hexPath(50)} fill="url(#orch-grad)" />
        <path d={hexPath(50)} fill="rgba(0,0,0,0.4)" />
        <path d={hexPath(50)} fill="url(#orch-grad)" />
        <foreignObject x={-12} y={-20} width={24} height={24}>
          <div className="flex items-center justify-center w-full h-full">
            <Cpu className="h-4 w-4 text-brand-cyan" />
          </div>
        </foreignObject>
        <text
          y={4}
          textAnchor="middle"
          className="fill-white/70 text-sm font-semibold uppercase tracking-wider"
          style={{ fontFamily: "inherit" }}
        >
          Orchestrator
        </text>
        <text
          y={17}
          textAnchor="middle"
          className="fill-brand-cyan/50 text-sm font-mono"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          6 agents
        </text>

        <motion.path
          d={hexPath(58)}
          fill="none"
          stroke="rgba(6,182,212,0.15)"
          strokeWidth={0.8}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>
    </motion.g>
  );
}
