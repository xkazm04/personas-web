"use client";

import { motion } from "framer-motion";
import { connections, connectionStatusColor } from "../data";
import type { ConnectionStatus } from "../types";
import { DataParticle, SparkEffect, RepairBot, WeldFlash } from "./effects";

export default function CircuitTraces({
  getConnectionStatus,
  brokenConnectionId,
  breakPoint,
}: {
  getConnectionStatus: (connId: string) => ConnectionStatus;
  brokenConnectionId: string;
  breakPoint: { x: number; y: number };
}) {
  return (
    <>
      {connections.map((conn) => {
        const status = getConnectionStatus(conn.id);
        const traceColor = connectionStatusColor[status];
        const traceOpacity =
          status === "broken" ? 0.3 : status === "healthy" ? 0.4 : 0.5;

        return (
          <g key={conn.id}>
            <path id={conn.id} d={conn.path} fill="none" stroke="none" />

            <path
              d={conn.path}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <motion.path
              d={conn.path}
              fill="none"
              stroke={traceColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: traceOpacity }}
              animate={{ opacity: traceOpacity }}
              transition={{ duration: 0.5 }}
            />

            <motion.path
              d={conn.path}
              fill="none"
              stroke={traceColor}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: traceOpacity * 0.3 }}
              animate={{ opacity: traceOpacity * 0.3 }}
              transition={{ duration: 0.5 }}
            />

            {status === "healthy" &&
              Array.from({ length: conn.particles }).map((_, pi) => (
                <DataParticle
                  key={`${conn.id}-p-${pi}`}
                  pathId={conn.id}
                  color={traceColor}
                  delay={pi * (2 / conn.particles)}
                  duration={2}
                />
              ))}

            {status === "broken" && conn.id === brokenConnectionId && (
              <SparkEffect x={breakPoint.x} y={breakPoint.y} color={traceColor} />
            )}

            {status === "diagnosing" && conn.id === brokenConnectionId && (
              <RepairBot pathId={conn.id} duration={2} color={traceColor} />
            )}

            {status === "repairing" && conn.id === brokenConnectionId && (
              <WeldFlash x={breakPoint.x} y={breakPoint.y} color={traceColor} />
            )}
          </g>
        );
      })}
    </>
  );
}
