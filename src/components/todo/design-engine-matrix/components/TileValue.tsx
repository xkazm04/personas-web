"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { CellDef, CellStatus } from "../../designMatrixShared";

export default function TileValue({
  def,
  status,
}: {
  def: CellDef;
  status: CellStatus;
}) {
  return (
    <div className="relative z-10 px-5 pb-5">
      <div className="relative h-[78px]">
        <AnimatePresence mode="wait">
          {status.state === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-end gap-2"
            >
              <div className="h-2.5 w-4/5 rounded-full bg-foreground/[0.1]" />
              <div className="h-2.5 w-2/3 rounded-full bg-foreground/[0.08]" />
            </motion.div>
          )}

          {status.state === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-end text-base font-mono"
              style={{ color: `${def.color}cc` }}
            >
              analyzing intent…
            </motion.div>
          )}

          {status.state === "asking" && def.question && (
            <motion.div
              key="asking"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute inset-0 flex flex-col justify-end gap-2"
            >
              <div className="text-base text-foreground font-medium leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {def.question.prompt}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {def.question.options.map((opt, i) => {
                  const isPicked = def.question!.picked === i;
                  return (
                    <span
                      key={opt}
                      className="rounded-full border px-3 py-1 text-base font-mono backdrop-blur-sm"
                      style={{
                        borderColor: isPicked
                          ? def.color
                          : "rgba(255,255,255,0.15)",
                        backgroundColor: isPicked
                          ? `${def.color}30`
                          : "rgba(0,0,0,0.4)",
                        color: isPicked ? def.color : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {opt}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}

          {status.state === "answered" && def.question && (
            <motion.div
              key="answered"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-end gap-2 text-base font-mono"
              style={{ color: def.color }}
            >
              <Check className="h-5 w-5" />
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {def.question.options[def.question.picked]}
              </span>
            </motion.div>
          )}

          {status.state === "filled" && (
            <motion.div
              key="filled"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-end text-base leading-snug text-foreground font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
            >
              {def.finalValue}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
