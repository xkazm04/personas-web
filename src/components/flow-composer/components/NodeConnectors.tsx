"use client";

import { CONSUMER_Y, NODE_R, PRODUCER_Y, QUEUE_Y } from "../data";
import type { CanvasNode } from "../types";

export default function NodeConnectors({ nodes }: { nodes: CanvasNode[] }) {
  return (
    <>
      {nodes.map((node) => {
        const y = node.side === "producer" ? PRODUCER_Y : CONSUMER_Y;
        const connStart = node.side === "producer" ? y + NODE_R : QUEUE_Y + 4;
        const connEnd = node.side === "producer" ? QUEUE_Y - 4 : y - NODE_R;
        return (
          <line
            key={`conn-${node.id}`}
            x1={node.x}
            y1={connStart}
            x2={node.x}
            y2={connEnd}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.3"
            strokeDasharray="1.5 2"
          />
        );
      })}
    </>
  );
}
