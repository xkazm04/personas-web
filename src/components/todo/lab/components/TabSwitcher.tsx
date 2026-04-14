"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { TABS } from "../data";
import type { LabTab } from "../types";

export default function TabSwitcher({
  active,
  onSelect,
}: {
  active: LabTab;
  onSelect: (tab: LabTab) => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mt-10 mx-auto max-w-2xl"
    >
      <div className="flex items-center gap-1 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelect(tab.key)}
              aria-pressed={isActive}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium transition-all duration-200 ${
                isActive
                  ? "bg-foreground/[0.08] text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground/85 hover:bg-foreground/[0.04]"
              }`}
              style={{
                boxShadow: isActive ? `0 0 20px ${tab.color}15` : undefined,
              }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: isActive ? tab.color : undefined }}
              />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-center text-base font-mono text-foreground/60 uppercase tracking-widest">
        {TABS.find((t) => t.key === active)?.blurb}
      </div>
    </motion.div>
  );
}
