"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function ExtendCard({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-glass-hover bg-white/[0.01] p-5 text-center backdrop-blur-sm transition-all duration-500 hover:border-glass-strong hover:bg-white/[0.02]"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300 group-hover:bg-white/[0.03]"
        style={{ borderColor: `${accent}30` }}
      >
        <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" style={{ color: accent }} />
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-base text-muted-dark leading-relaxed">{description}</p>
    </motion.div>
  );
}
