"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Wrench } from "lucide-react";
import { connections, nodes, healingStages } from "../data";
import type { ConnectionStatus } from "../types";

const statusColorFor = (status: ConnectionStatus) =>
  status === "broken"
    ? "#f43f5e"
    : status === "diagnosing"
      ? "#fbbf24"
      : status === "repairing"
        ? "#06b6d4"
        : "#34d399";

const statusLabelFor = (status: ConnectionStatus) =>
  status === "healthy"
    ? "OK"
    : status === "broken"
      ? "DOWN"
      : status === "diagnosing"
        ? "SCAN"
        : "FIX";

export default function StatusPanel({
  activeStage,
  getConnectionStatus,
}: {
  activeStage: number;
  getConnectionStatus: (connId: string) => ConnectionStatus;
}) {
  return (
    <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-foreground/6 bg-background/30 p-4">
      <div className="flex items-center gap-1.5 mb-4">
        <Shield className="h-4 w-4 text-foreground/90" />
        <span className="text-base font-mono text-foreground/95 uppercase tracking-wider font-semibold">
          Connection Status
        </span>
      </div>

      <div className="space-y-2">
        {connections.map((conn) => {
          const status = getConnectionStatus(conn.id);
          const statusColor = statusColorFor(status);
          const fromNode = nodes.find((n) => n.id === conn.from);
          const toNode = nodes.find((n) => n.id === conn.to);

          return (
            <motion.div
              key={conn.id}
              animate={{
                borderColor:
                  status !== "healthy"
                    ? `${statusColor}40`
                    : "rgba(255,255,255,0.04)",
                backgroundColor:
                  status !== "healthy"
                    ? `${statusColor}08`
                    : "rgba(255,255,255,0)",
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between rounded-lg border border-foreground/4 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: statusColor }}
                  animate={
                    status !== "healthy"
                      ? { opacity: [1, 0.3, 1] }
                      : { opacity: 0.6 }
                  }
                  transition={
                    status !== "healthy"
                      ? { duration: 0.6, repeat: Infinity }
                      : {}
                  }
                />
                <span className="text-base font-mono text-foreground font-medium">
                  {fromNode?.label.split(" ")[0]} →{" "}
                  {toNode?.label.split(" ")[0]}
                </span>
              </div>
              <span
                className="text-base font-mono uppercase tracking-wider"
                style={{ color: statusColor }}
              >
                {statusLabelFor(status)}
              </span>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeStage >= 0 && (
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-lg border border-foreground/6 bg-background/40 p-3"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wrench
                className="h-3 w-3"
                style={{ color: healingStages[activeStage].color }}
              />
              <span
                className="text-base font-mono font-semibold uppercase tracking-wider"
                style={{ color: healingStages[activeStage].color }}
              >
                {healingStages[activeStage].label}
              </span>
            </div>
            <p className="text-base text-foreground font-mono leading-relaxed">
              {healingStages[activeStage].desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
