"use client";

import type { ConnectionStatus, NodeStatus } from "../types";
import SvgDefs from "./SvgDefs";
import CircuitTraces from "./CircuitTraces";
import CircuitNodes from "./CircuitNodes";

export default function CircuitBoard({
  getConnectionStatus,
  getNodeStatus,
  brokenConnectionId,
  breakPoint,
}: {
  getConnectionStatus: (connId: string) => ConnectionStatus;
  getNodeStatus: (nodeId: string) => NodeStatus;
  brokenConnectionId: string;
  breakPoint: { x: number; y: number };
}) {
  return (
    <div className="flex-1 relative p-4">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />

      <svg
        viewBox="0 0 660 400"
        className="w-full h-auto"
        style={{ minHeight: 300 }}
      >
        <SvgDefs />
        <CircuitTraces
          getConnectionStatus={getConnectionStatus}
          brokenConnectionId={brokenConnectionId}
          breakPoint={breakPoint}
        />
        <CircuitNodes getNodeStatus={getNodeStatus} />
      </svg>
    </div>
  );
}
