"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type PhaseCardData = {
  phase: number;
  name: string;
  icon: LucideIcon;
  scope: string;
  accent: string;
  bg: string;
  completed?: boolean;
};

export default function PhaseCard({
  data,
  index = 0,
}: {
  data: PhaseCardData;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group relative flex-none w-[160px] snap-start rounded-xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-4 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]"
    >
      {/* Phase number */}
      <div className="absolute top-2.5 right-3 text-[10px] font-mono text-muted-dark/30">
        {String(data.phase).padStart(2, "0")}
      </div>

      {/* Completed checkmark */}
      {data.completed && (
        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-emerald/20 flex items-center justify-center ring-2 ring-background">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3 5.5L6.5 2" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${data.bg} mb-3`}>
        <data.icon className={`h-4 w-4 ${data.accent}`} />
      </div>

      {/* Name */}
      <h4 className="text-sm font-medium leading-tight">{data.name}</h4>
      <p className="mt-1 text-[10px] leading-relaxed text-muted-dark line-clamp-2">{data.scope}</p>
    </motion.div>
  );
}
