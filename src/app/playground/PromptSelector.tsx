"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { PROMPTS } from "./data";

interface PromptSelectorProps {
  active: number | null;
  onSelect: (idx: number) => void;
}

export default function PromptSelector({ active, onSelect }: PromptSelectorProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10"
    >
      {PROMPTS.map((prompt, idx) => {
        const Icon = prompt.icon;
        const isActive = active === idx;
        return (
          <button
            key={prompt.title}
            onClick={() => onSelect(idx)}
            className={`group relative text-left rounded-xl border p-4 transition-all duration-300 cursor-pointer backdrop-blur-sm ${
              isActive
                ? "border-brand-cyan/40 bg-brand-cyan/[0.06] shadow-[0_0_30px_rgba(6,182,212,0.08)]"
                : "border-glass bg-white/[0.02] hover:border-glass-strong hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-brand-cyan/15"
                    : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                }`}
              >
                <Icon className="h-4 w-4 text-brand-cyan" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {prompt.title}
                </h3>
                <p className="mt-0.5 text-base text-muted-dark leading-relaxed">
                  {prompt.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </motion.div>
  );
}
