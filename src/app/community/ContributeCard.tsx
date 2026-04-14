"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import type { ContributeWay } from "./data";

interface ContributeCardProps {
  way: ContributeWay;
}

export default function ContributeCard({ way }: ContributeCardProps) {
  const Icon = way.icon;
  const bv = BRAND_VAR[way.brand];

  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.01]"
      style={{
        borderColor: "rgba(var(--surface-overlay), 0.08)",
        backgroundColor: "rgba(var(--surface-overlay), 0.02)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: tint(way.brand, 30) }}
      />
      <div className="relative flex items-center gap-3 mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: tint(way.brand, 16) }}
        >
          <Icon className="h-4 w-4" style={{ color: bv }} />
        </div>
        <h3
          className="text-lg font-bold tracking-tight"
          style={{ color: bv }}
        >
          {way.title}
        </h3>
      </div>
      <p className="relative text-base text-foreground/70 leading-relaxed">
        {way.description}
      </p>
    </motion.div>
  );
}
