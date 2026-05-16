import { motion } from "framer-motion";
import { Brain } from "lucide-react";

import {
  CENTRAL,
  EDGES,
  NODE_ICON,
  SATELLITES,
  nodeById,
} from "./secondBrainData";

export function SecondBrainGraph({
  reduced,
  baseDelay,
}: {
  reduced: boolean;
  baseDelay: number;
}) {
  return (
    <div className="relative aspect-[5/4] md:aspect-auto md:h-[340px] rounded-xl border border-purple-400/20 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.10),rgba(168,85,247,0.02)_60%,transparent_80%)] overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="brain-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(168,85,247,0.05)" />
            <stop offset="50%" stopColor="rgba(168,85,247,0.55)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0.05)" />
          </linearGradient>
        </defs>
        {EDGES.map(([fromId, toId], index) => {
          const from = nodeById(fromId);
          const to = nodeById(toId);
          return (
            <motion.line
              key={`${fromId}-${toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#brain-edge)"
              strokeWidth={0.35}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: reduced ? 0 : 0.7,
                delay: reduced ? 0 : 0.2 + index * 0.08,
                ease: "easeOut",
              }}
            />
          );
        })}
      </svg>

      {!reduced &&
        [0, 1.4, 2.8].map((delay) => (
          <motion.div
            key={delay}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/40"
            initial={{ scale: 0.4, opacity: 0.55 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 4.2, delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

      {SATELLITES.map((node, index) => {
        const Icon = NODE_ICON[node.type];
        const isTag = node.type === "tag";
        const isIdea = node.type === "idea";
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0 : 0.35,
              delay: reduced ? 0 : 0.4 + index * baseDelay,
              type: "spring",
              stiffness: 220,
              damping: 18,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm ${
              isTag
                ? "border-purple-400/35 bg-purple-500/15 text-purple-200"
                : isIdea
                  ? "border-amber-300/35 bg-amber-400/10 text-amber-200"
                  : "border-foreground/15 bg-background/80 text-foreground/85"
            }`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="text-base font-mono whitespace-nowrap">
              {node.label}
            </span>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduced ? 0 : 0.4, type: "spring", stiffness: 200, damping: 16 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/50 bg-purple-500/20 shadow-[0_0_24px_rgba(168,85,247,0.35)]">
          <Brain className="h-7 w-7 text-purple-200" />
          {!reduced && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl border border-purple-300/60"
              animate={{ opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        <div className="rounded-md border border-purple-400/30 bg-background/85 px-2 py-0.5 text-base font-mono text-purple-200 backdrop-blur-sm">
          {CENTRAL.label}
        </div>
      </motion.div>
    </div>
  );
}
