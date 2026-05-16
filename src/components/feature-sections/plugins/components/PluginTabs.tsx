"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import type { PluginDef, PluginKey } from "../types";

export default function PluginTabs({
  plugins,
  active,
  onSelect,
}: {
  plugins: PluginDef[];
  active: PluginKey;
  onSelect: (key: PluginKey) => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mt-10 mx-auto max-w-5xl"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {plugins.map((p) => {
          const PIcon = p.icon;
          const isActive = active === p.key;
          return (
            <button
              key={p.key}
              onClick={() => onSelect(p.key)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-base font-medium transition-all duration-300 ${
                isActive
                  ? "bg-foreground/[0.06] text-foreground"
                  : "border-foreground/[0.08] bg-foreground/[0.02] text-foreground/65 hover:text-foreground hover:bg-foreground/[0.04]"
              }`}
              style={{
                borderColor: isActive ? `${p.color}50` : undefined,
                boxShadow: isActive ? `0 0 18px ${p.color}18` : undefined,
              }}
            >
              <PIcon
                className="h-4 w-4"
                style={{ color: isActive ? p.color : undefined }}
              />
              {p.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
