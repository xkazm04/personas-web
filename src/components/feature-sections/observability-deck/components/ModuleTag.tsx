"use client";

import { motion } from "framer-motion";
import type { OverviewModule } from "../types";

export default function ModuleTag({
  mod,
  active,
  onClick,
}: {
  mod: OverviewModule;
  active?: boolean;
  onClick?: () => void;
}) {
  const Icon = mod.icon;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03, x: 2 }}
      onClick={onClick}
      className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm transition-colors duration-300 cursor-pointer text-left ${
        active
          ? "border-foreground/[0.25] bg-foreground/[0.08]"
          : "border-foreground/[0.08] bg-foreground/[0.02] hover:border-foreground/[0.18] hover:bg-foreground/[0.05]"
      }`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
        style={{
          backgroundColor: active ? `${mod.color}30` : `${mod.color}18`,
        }}
      >
        <Icon className="h-4 w-4" style={{ color: mod.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-foreground leading-tight">
          {mod.title}
        </div>
        <div className="mt-0.5 text-base text-foreground/65 leading-snug">
          {mod.blurb}
        </div>
      </div>
    </motion.button>
  );
}
