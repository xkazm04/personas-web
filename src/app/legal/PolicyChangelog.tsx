"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { POLICY_META, type PolicyId } from "@/data/policy-changelog";

type Props = {
  policyId: PolicyId;
  hasUnseenUpdate: boolean;
};

export default function PolicyChangelog({ policyId, hasUnseenUpdate }: Props) {
  const meta = POLICY_META[policyId];
  const [open, setOpen] = useState(hasUnseenUpdate);

  return (
    <div className="rounded-xl border border-glass bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`policy-changes-${policyId}`}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm text-muted-dark transition-colors hover:text-foreground"
      >
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
          <span>What changed in this update</span>
          {hasUnseenUpdate && (
            <span className="rounded-full bg-brand-cyan/15 px-2 py-0.5 text-xs font-medium text-brand-cyan">
              New
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`policy-changes-${policyId}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul className="space-y-2 border-t border-glass px-4 py-3 text-sm leading-relaxed text-muted-dark">
              {meta.changes.map((change, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-brand-cyan/70"
                    aria-hidden="true"
                  />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
