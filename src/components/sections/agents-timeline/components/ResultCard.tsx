"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function ResultCard({
  isWorkflow,
  result,
  visible,
}: {
  isWorkflow: boolean;
  result: string;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`mt-3 rounded-xl border px-4 py-3 ${
            isWorkflow
              ? "border-brand-rose/20 bg-brand-rose/5"
              : "border-brand-emerald/20 bg-brand-emerald/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {isWorkflow ? (
              <X className="h-3.5 w-3.5 text-brand-rose" />
            ) : (
              <Check className="h-3.5 w-3.5 text-brand-emerald" />
            )}
            <span
              className={`text-base font-mono uppercase tracking-wider ${
                isWorkflow ? "text-brand-rose/80" : "text-brand-emerald/80"
              }`}
            >
              {isWorkflow ? "FAILED" : "RESOLVED"}
            </span>
          </div>
          <p
            className={`text-base leading-relaxed ${
              isWorkflow ? "text-brand-rose/80" : "text-brand-emerald/80"
            }`}
          >
            {result}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
