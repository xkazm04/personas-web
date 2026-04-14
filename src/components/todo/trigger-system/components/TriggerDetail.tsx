"use client";

import { motion, AnimatePresence } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import type { Trigger } from "../types";

interface TriggerDetailProps {
  triggers: Trigger[];
  activeTrigger: number;
  onSelect: (i: number) => void;
}

export default function TriggerDetail({
  triggers,
  activeTrigger,
  onSelect,
}: TriggerDetailProps) {
  const active = triggers[activeTrigger];

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTrigger}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="force-dark rounded-2xl border border-foreground/10 bg-background/80 backdrop-blur-xl p-8"
        >
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: tint(active.brand, 14) }}
            >
              <active.icon className="h-7 w-7" style={{ color: active.color }} />
            </div>
            <div>
              <div className="text-xl font-semibold text-foreground">{active.name}</div>
              <div className="text-base text-muted-dark">{active.desc}</div>
            </div>
          </div>
          <div className="text-base text-muted leading-relaxed mb-5">{active.detail}</div>
          <div className="rounded-lg border border-foreground/6 bg-background/30 px-4 py-3">
            <div className="text-base font-mono text-muted-dark mb-1 uppercase tracking-wider">
              Example
            </div>
            <div className="text-base font-mono" style={{ color: tint(active.brand, 60) }}>
              {active.example}
            </div>
          </div>

          {/* Trigger type indicator */}
          <div className="mt-5 flex gap-2">
            {triggers.map((t, i) => (
              <button
                key={t.name}
                onClick={() => onSelect(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeTrigger ? "w-6" : "w-1.5"
                }`}
                style={{
                  backgroundColor:
                    i === activeTrigger ? active.color : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
