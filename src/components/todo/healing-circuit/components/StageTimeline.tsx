"use client";

import { motion } from "framer-motion";
import { CheckCircle, Wifi } from "lucide-react";
import { connections, healingStages } from "../data";
import type { ConnectionStatus } from "../types";

export default function StageTimeline({
  activeStage,
  getConnectionStatus,
}: {
  activeStage: number;
  getConnectionStatus: (connId: string) => ConnectionStatus;
}) {
  return (
    <div className="border-t border-foreground/6 bg-background/40 px-5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
          {healingStages.map((stage, i) => {
            const isActive = activeStage === i;
            const isDone = activeStage > i;
            const isReached = activeStage >= i;

            return (
              <div key={stage.label} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    borderColor: isActive
                      ? `${stage.color}60`
                      : isDone
                        ? `${stage.color}30`
                        : "rgba(255,255,255,0.06)",
                    backgroundColor: isActive
                      ? `${stage.color}12`
                      : "rgba(255,255,255,0)",
                  }}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 shrink-0"
                >
                  <stage.icon
                    className="h-3 w-3 transition-colors duration-300"
                    style={{
                      color: isReached ? stage.color : "rgba(255,255,255,0.15)",
                    }}
                  />
                  <span
                    className="text-base font-mono font-semibold transition-colors duration-300"
                    style={{
                      color: isReached ? stage.color : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {stage.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  )}
                  {isDone && (
                    <CheckCircle
                      className="h-3 w-3"
                      style={{ color: `${stage.color}60` }}
                    />
                  )}
                </motion.div>
                {i < healingStages.length - 1 && (
                  <motion.div
                    className="h-px w-4 shrink-0"
                    animate={{
                      backgroundColor: isDone
                        ? `${stage.color}40`
                        : "rgba(255,255,255,0.06)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-base font-mono text-foreground/95 font-medium">
          <Wifi className="h-3.5 w-3.5" />
          <span>
            {connections.filter((c) => getConnectionStatus(c.id) === "healthy")
              .length}
            /{connections.length} healthy
          </span>
        </div>
      </div>
    </div>
  );
}
