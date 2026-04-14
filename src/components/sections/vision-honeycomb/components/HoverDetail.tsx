"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AgentData } from "../types";
import { statusStyles } from "../data";

export default function HoverDetail({ hoveredIdx, agents }: { hoveredIdx: number | null; agents: AgentData[] }) {
  return (
    <AnimatePresence>
      {hoveredIdx !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="border-t border-white/6 px-4 py-3 sm:px-5 bg-white/[0.02]"
        >
          {(() => {
            const agent = agents[hoveredIdx];
            const Icon = agent.icon;
            const st = statusStyles[agent.status];
            return (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: agent.color }} />
                  <span className="text-base font-semibold text-white/90">{agent.name}</span>
                  <span className={`text-base font-mono ${st.text}`}>{st.label}</span>
                </div>
                <div className="flex items-center gap-4 text-base font-mono text-white/40 ml-auto">
                  <span>{agent.executions.toLocaleString()} executions</span>
                  <span>Rate: {agent.rate}%</span>
                  <span>Last: {(agent.executions % 8) + 1}s ago</span>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
