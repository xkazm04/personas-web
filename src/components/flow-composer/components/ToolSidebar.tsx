"use client";

import { motion } from "framer-motion";
import { TOOL_CATALOGUE } from "../data";
import type { CanvasNode } from "../types";

export default function ToolSidebar({
  nodes,
  onAddNode,
}: {
  nodes: CanvasNode[];
  onAddNode: (toolId: string, side: "producer" | "consumer") => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-0 top-14 z-20 w-56 max-h-80 overflow-y-auto rounded-xl border border-glass-hover bg-black/90 backdrop-blur-xl p-3 shadow-2xl"
    >
      <p className="text-base font-mono text-muted uppercase tracking-wider mb-2">
        Available Integrations
      </p>
      <div className="space-y-1">
        {TOOL_CATALOGUE.map((tool) => {
          const alreadyOnCanvas = nodes.some((n) => n.toolId === tool.id);
          return (
            <div key={tool.id} className="flex items-center gap-2">
              <button
                disabled={alreadyOnCanvas && tool.category !== "both"}
                onClick={() =>
                  onAddNode(
                    tool.id,
                    tool.category === "consumer" ? "consumer" : "producer"
                  )
                }
                className="flex-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-base transition-colors hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <tool.icon
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: tool.color }}
                />
                <span className="text-muted">{tool.name}</span>
                <span className="ml-auto text-base text-muted font-mono uppercase">
                  {tool.category === "both"
                    ? "any"
                    : tool.category === "producer"
                      ? "prod"
                      : "cons"}
                </span>
              </button>
              {tool.category === "both" &&
                !nodes.some(
                  (n) => n.toolId === tool.id && n.side === "consumer"
                ) && (
                  <button
                    onClick={() => onAddNode(tool.id, "consumer")}
                    className="text-base text-muted hover:text-foreground/80 font-mono px-1"
                    title="Add as consumer"
                  >
                    +C
                  </button>
                )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
