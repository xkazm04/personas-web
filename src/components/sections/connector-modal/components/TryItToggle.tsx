"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import type { Connector } from "@/data/connectors";
import TerminalSimulator from "./TerminalSimulator";

interface Props {
  connector: Connector;
  showSimulator: boolean;
  simKey: number;
  onToggle: () => void;
}

export default function TryItToggle({ connector, showSimulator, simKey, onToggle }: Props) {
  return (
    <div className="px-8 py-6">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 rounded-xl border border-glass bg-white/[0.02] px-5 py-3 text-base font-medium transition-all hover:border-glass-strong hover:bg-white/[0.04] cursor-pointer w-full"
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${connector.color}15` }}
        >
          <Play className="h-4 w-4" style={{ color: connector.color }} />
        </div>
        <div>
          <span className="text-white">Try it now</span>
          <span className="block text-base text-muted-dark mt-0.5">See a preview of how this connector works</span>
        </div>
        <div className="ml-auto">
          <div
            className={`h-5 w-9 rounded-full transition-colors duration-300 flex items-center ${
              showSimulator ? "justify-end" : "justify-start"
            }`}
            style={{
              backgroundColor: showSimulator ? `${connector.color}40` : "rgba(255,255,255,0.08)",
            }}
          >
            <motion.div
              layout
              className="h-3.5 w-3.5 rounded-full mx-0.5"
              style={{
                backgroundColor: showSimulator ? connector.color : "rgba(255,255,255,0.3)",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {showSimulator && (
          <motion.div
            key={`sim-${simKey}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <TerminalSimulator key={`terminal-${simKey}`} connector={connector} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
