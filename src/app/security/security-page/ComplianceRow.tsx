import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, CircleCheck } from "lucide-react";

import type { CompliancePoint } from "@/data/security";

interface StatusStyle {
  label: string;
  color: string;
  meaning: string;
}

export const STATUS_STYLES: Record<CompliancePoint["status"], StatusStyle> = {
  simplified: { label: "Simplified", color: "#34d399", meaning: "Requirement exists but is dramatically easier to meet" },
  "not-applicable": { label: "N/A", color: "#fbbf24", meaning: "Requirement does not apply to local-first software" },
  "built-in": { label: "Built-in", color: "#06b6d4", meaning: "Handled automatically by the local architecture" },
};

const UNKNOWN_STATUS_STYLE: StatusStyle = {
  label: "Unknown",
  color: "#94a3b8",
  meaning: "Status not yet documented",
};

export function ComplianceRow({ point }: { point: CompliancePoint }) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const status = STATUS_STYLES[point.status] ?? UNKNOWN_STATUS_STYLE;
  const panelId = `compliance-${point.label.replace(/\s+/g, "-").toLowerCase()}`;
  const triggerId = `${panelId}-trigger`;

  return (
    <div className="border-b border-glass last:border-b-0">
      <button
        id={triggerId}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-4 px-6 py-5 text-left cursor-pointer group"
      >
        <span
          className="shrink-0 mt-0.5 rounded px-2 py-0.5 text-sm font-semibold uppercase tracking-wider"
          style={{ backgroundColor: `${status.color}15`, color: status.color }}
        >
          {status.label}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-foreground">
            {point.label}
          </h4>
          <p className="text-sm text-muted leading-relaxed mt-1">
            {point.description}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted shrink-0 mt-1.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-0">
              <div
                className="rounded-lg border px-5 py-4"
                style={{
                  borderColor: `${status.color}20`,
                  backgroundColor: `${status.color}08`,
                }}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
                  What you don&apos;t need to worry about
                </p>
                <ul className="space-y-2">
                  {point.checklist.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-muted">
                      <CircleCheck
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: status.color }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
