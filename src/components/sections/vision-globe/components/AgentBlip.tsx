"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AgentData } from "../types";
import { statusStyles, agentPosition } from "../data";

interface Props {
  agent: AgentData;
  index: number;
  total: number;
  radarRadius: number;
  isFlashing: boolean;
  isSwept: boolean;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export default function AgentBlip({
  agent,
  index,
  total,
  radarRadius,
  isFlashing,
  isSwept,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: Props) {
  const { x, y } = agentPosition(index, total, agent.rate, radarRadius - 30);
  const st = statusStyles[agent.status];
  const blipBrightness = isFlashing || isSwept ? 1 : agent.status === "idle" ? 0.4 : 0.7;

  return (
    <div
      className="absolute group cursor-pointer"
      style={{
        left: radarRadius + x,
        top: radarRadius + y,
        transform: "translate(-50%, -50%)",
        zIndex: isHovered ? 30 : 10,
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {(isFlashing || isSwept) && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 36, height: 36, left: -18, top: -18, border: `1.5px solid ${agent.color}` }}
          initial={{ opacity: 0.7, scale: 0.5 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}

      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 28,
          height: 28,
          left: -14,
          top: -14,
          backgroundColor: `${agent.color}${Math.round(blipBrightness * 30)
            .toString(16)
            .padStart(2, "0")}`,
          boxShadow:
            isFlashing || isSwept
              ? `0 0 14px ${agent.color}80, 0 0 30px ${agent.color}40`
              : `0 0 6px ${agent.color}30`,
        }}
        animate={{ opacity: blipBrightness }}
        transition={{ duration: 0.3 }}
      >
        <agent.icon className="h-3 w-3" style={{ color: agent.color }} />
      </motion.div>

      <div className={`absolute h-[5px] w-[5px] rounded-full ${st.dot}`} style={{ left: 6, top: -16 }} />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 whitespace-nowrap rounded-lg border border-white/10 bg-black/80 backdrop-blur-lg px-3 py-2 shadow-xl z-40"
          >
            <div className="flex items-center gap-2 mb-1">
              <agent.icon className="h-3 w-3" style={{ color: agent.color }} />
              <span className="text-base font-semibold text-white/90">{agent.name}</span>
              <span className={`text-base font-mono ${st.text}`}>{st.label}</span>
            </div>
            <div className="text-base font-mono text-white/50 space-y-0.5">
              <div>{agent.executions.toLocaleString()} executions</div>
              <div>Success rate: {agent.rate}%</div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
