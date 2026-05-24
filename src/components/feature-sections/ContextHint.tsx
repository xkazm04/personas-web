"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export default function ContextHint({
  subtitle,
  detail,
}: {
  subtitle: string;
  detail: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-start gap-2 px-5 py-2.5 border-b border-foreground/[0.04] bg-foreground/[0.015]">
        <p className="flex-1 text-sm text-foreground/60 leading-relaxed">
          {subtitle}
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="More context about this visualization"
          className="mt-0.5 flex-shrink-0 rounded-full p-0.5 text-foreground/60 hover:text-foreground/60 hover:bg-foreground/[0.06] transition-colors"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-foreground/[0.04] bg-foreground/[0.025]"
          >
            <p className="px-5 py-2.5 text-sm text-foreground/60 leading-relaxed">
              {detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
