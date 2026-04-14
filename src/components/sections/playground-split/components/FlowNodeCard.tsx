"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FlowNode, NodeStatus } from "../types";
import { getStatusColor } from "../data";

function getStatusIcon(status: NodeStatus, Icon: LucideIcon) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-brand-emerald" />;
    case "active":
      return <Loader2 className="h-4 w-4 text-brand-cyan animate-spin" />;
    default:
      return <Icon className="h-4 w-4 text-muted-dark" />;
  }
}

export default function FlowNodeCard({
  node,
  reduced,
}: {
  node: FlowNode;
  reduced: boolean;
}) {
  return (
    <g>
      {node.status === "active" && !reduced && (
        <motion.circle
          cx={node.x}
          cy={node.y}
          r={38}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          initial={{ opacity: 0, r: 30 }}
          animate={{ opacity: [0, 0.3, 0], r: [30, 42, 30] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <foreignObject x={node.x - 88} y={node.y - 24} width={176} height={48}>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduced ? 0 : 0.4,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 backdrop-blur-sm transition-all duration-500 ${getStatusColor(
            node.status
          )} ${
            node.status === "pending"
              ? "bg-white/[0.02]"
              : node.status === "active"
                ? "bg-brand-cyan/[0.06]"
                : "bg-brand-emerald/[0.03]"
          }`}
        >
          {getStatusIcon(node.status, node.icon)}
          <span
            className={`text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis ${
              node.status === "pending"
                ? "text-muted-dark"
                : node.status === "active"
                  ? "text-brand-cyan"
                  : "text-foreground/85"
            }`}
          >
            {node.label}
          </span>
        </motion.div>
      </foreignObject>
    </g>
  );
}
