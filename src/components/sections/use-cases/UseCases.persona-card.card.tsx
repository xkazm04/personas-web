"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Compass, DollarSign, Plug, Zap } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import ConnectorIcon from "./components/ConnectorIcon";
import { tools } from "./data";

/**
 * A reduced persona card in the app's shape (PersonaOverviewCardList): health
 * stripe on the left edge, persona-tinted icon frame, name + description, status
 * chip, a row of 24px connector tiles, and the trigger / last-run / spend footer.
 * Identity (name, icon, colour) is constant; only the connector row and the
 * job count change as tools attach. Unattached slots are dashed, as pending
 * items are in the app.
 */

export const PERSONA = {
  name: "Chief of staff",
  description: "Keeps your inbox, channels, repos and calendar moving.",
  brand: "purple" as const,
};

export default function PersonaCard({ attached, focus, still }: { attached: string[]; focus: string | null; still: boolean }) {
  const jobs = attached.reduce((n, id) => n + (tools.find((tl) => tl.id === id)?.useCases.length ?? 0), 0);
  const spring = still ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 26 };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-l-2 border-glass-hover bg-white/[0.03] backdrop-blur-sm"
      style={{ borderLeftColor: BRAND_VAR.emerald }}
    >
      {/* Header: tinted icon frame, name, description */}
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
          style={{ backgroundColor: tint(PERSONA.brand, 12), borderColor: tint(PERSONA.brand, 28) }}
        >
          <Compass className="h-5 w-5" style={{ color: BRAND_VAR[PERSONA.brand] }} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight text-foreground">{PERSONA.name}</p>
          <p className="mt-1 text-xs leading-snug text-muted">{PERSONA.description}</p>
        </div>
      </div>

      {/* Meta: status chip + job count derived from the attached tools' data */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-brand-emerald"
          style={{ backgroundColor: tint("emerald", 8), borderColor: tint("emerald", 20) }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_VAR.emerald }} aria-hidden />
          Active
        </span>
        <span className="font-mono text-xs tabular-nums text-muted">
          {jobs} {jobs === 1 ? "job" : "jobs"}
        </span>
      </div>

      {/* Connector row: eight reserved slots, filled in the order tools attach */}
      <div className="px-4 pb-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-dark">
          <Plug className="h-3 w-3" aria-hidden />
          {attached.length === 0 ? "No connectors yet" : `${attached.length} of ${tools.length} connectors`}
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Connected tools">
          {tools.map((tl) => {
            const on = attached.includes(tl.id);
            const lit = focus === tl.id;
            return (
              <li key={tl.id} className="relative h-7 w-7" title={tl.name}>
                <span className="absolute inset-0 rounded-md border border-dashed border-glass-hover" aria-hidden />
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span
                      key="tile"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: lit ? 1.12 : 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={spring}
                      className="absolute inset-0 flex items-center justify-center rounded-md border"
                      style={{ backgroundColor: `${tl.color}24`, borderColor: `${tl.color}${lit ? "90" : "40"}` }}
                    >
                      <ConnectorIcon src={tl.icon.src} size={14} />
                      <span className="sr-only">{tl.name}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer: the app's trigger / last run / spend row (sample values) */}
      <div className="flex items-center gap-4 border-t border-glass px-4 py-2.5 font-mono text-xs tabular-nums text-muted">
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" aria-hidden />3 triggers
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />2 min ago
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" aria-hidden />0.04
        </span>
      </div>
    </div>
  );
}
