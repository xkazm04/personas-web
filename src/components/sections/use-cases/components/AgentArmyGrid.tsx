"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import type { AgentData } from "../types";
import { initialAgents, statusStyles } from "../data";
import ConnectorIcon from "./ConnectorIcon";

export default function AgentArmyGrid() {
  const prefersReducedMotion = useReducedMotion();
  const [agents, setAgents] = useState<AgentData[]>(initialAgents);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        const idx = Math.floor(Math.random() * initialAgents.length);
        const bump = 1 + Math.floor(Math.random() * 3);
        setAgents((prev) => {
          const next = [...prev];
          const agent = { ...next[idx] };
          agent.executions += bump;
          if (agent.status !== "healing" && Math.random() < 0.2) {
            agent.status = agent.status === "running" ? "idle" : "running";
          }
          next[idx] = agent;
          return next;
        });
        setFlashIdx(idx);
        setTimeout(() => setFlashIdx(null), 600);
        timerRef2 = schedule();
      }, delay);
    };
    let timerRef2 = schedule();
    return () => clearTimeout(timerRef2);
  }, [prefersReducedMotion]);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="mt-16 mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3"
    >
      {agents.map((agent, i) => {
        const st = statusStyles[agent.status];
        const isFlashing = flashIdx === i;
        const rateColor = agent.rate >= 90 ? "#34d399" : agent.rate >= 80 ? "#fbbf24" : "#f43f5e";

        return (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group relative rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:bg-white/[0.05] hover:border-glass-hover"
          >
            {isFlashing && (
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{ backgroundColor: `${agent.color}08` }}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}

            <div className="absolute top-2.5 right-2.5 z-10">
              <div className={`h-2 w-2 rounded-full ${st.dot}`} />
            </div>

            <div className="relative flex flex-col items-center px-3 py-5">
              <span className="text-base font-medium text-foreground/80 truncate max-w-full mb-3">{agent.name}</span>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl mb-3"
                style={{ backgroundColor: `${agent.color}18` }}
              >
                <ConnectorIcon src={agent.iconSrc} size={24} />
              </div>

              <div className="text-base font-mono font-semibold text-foreground tabular-nums tracking-tight">
                {agent.executions.toLocaleString()}
              </div>
              <div className="text-base font-mono uppercase tracking-wider text-muted mb-2">executions</div>

              <div className="w-full">
                <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: rateColor }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${agent.rate}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <div className="text-center mt-1">
                  <span className="text-base font-mono font-medium tabular-nums" style={{ color: rateColor }}>
                    {agent.rate}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
