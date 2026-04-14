"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";

export default function FlowCTA({
  nodeCount,
  wireCount,
}: {
  nodeCount: number;
  wireCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 flex flex-col items-center gap-3"
    >
      <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple motion-safe:animate-border-flow shadow-[0_0_30px_rgba(6,182,212,0.3)]">
        <a
          href="#download"
          className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-black/80 backdrop-blur-md px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-black/60"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent motion-safe:-translate-x-full motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:translate-x-full motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100 motion-reduce:transition-opacity motion-reduce:duration-300"
          />
          <Download className="relative h-5 w-5 text-brand-cyan transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="relative">Build this flow in Personas</span>
        </a>
      </div>
      <p className="text-base text-muted font-mono">
        {nodeCount} nodes, {wireCount} connection{wireCount !== 1 ? "s" : ""} — ready to import
      </p>
    </motion.div>
  );
}
