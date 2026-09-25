"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import ConnectorIcon from "./ConnectorIcon";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import type { Tool } from "../types";

/**
 * The persona's capabilities: the focused tool's jobs in full (what it just
 * added), then a ledger with one reserved row per real tool. Connected rows list
 * that tool's job titles; unconnected rows stay dashed. Every title and
 * description comes from `t.useCasesSection` via `localizeTools`.
 */
export default function CapabilityLedger({
  tools,
  attached,
  focus,
  still,
  panelId,
  labelledBy,
}: {
  tools: Tool[];
  attached: string[];
  focus: string | null;
  still: boolean;
  panelId: string;
  labelledBy?: string;
}) {
  const { t } = useTranslation();
  const copy = t.useCasesPersona;
  const active = tools.find((tl) => tl.id === focus) ?? null;
  // "{tool}" renders bold, so the sentence is split around it.
  const [addsBefore, addsAfter = ""] = copy.adds.split("{tool}");
  const addsVars = { count: active?.useCases.length ?? 0, persona: copy.personaName };
  const fade = still ? { duration: 0 } : { duration: 0.28, ease: "easeOut" as const };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* What the focused tool adds, with the real descriptions */}
      <div id={panelId} role="tabpanel" aria-labelledby={labelledBy} aria-live="polite" className="min-h-[132px]">
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={fade}
            >
              <p className="mb-2 flex items-center gap-2 text-xs text-muted">
                <Plus className="h-3 w-3 text-brand-cyan" aria-hidden />
                <span>
                  {fillTemplate(addsBefore, addsVars)}
                  <span className="font-semibold text-foreground">{active.name}</span>
                  {fillTemplate(addsAfter, addsVars)}
                </span>
              </p>
              <ul className="grid gap-2 sm:grid-cols-3">
                {active.useCases.map((uc) => (
                  <li
                    key={uc.title}
                    className="rounded-lg border bg-white/[0.02] p-3"
                    style={{ borderColor: `${active.color}40` }}
                  >
                    <p className="text-xs font-semibold text-foreground">{uc.title}</p>
                    <p className="mt-1 text-xs leading-snug text-muted">{uc.desc}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={false}
              exit={{ opacity: 0 }}
              transition={fade}
              className="flex h-[132px] items-center justify-center rounded-lg border border-dashed border-glass-hover px-4 text-center text-xs text-muted"
            >
              {copy.emptyJobs}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Ledger: one reserved row per tool, in data order */}
      <ul className="grid gap-1.5 stage:grid-cols-2" aria-label={fillTemplate(copy.ledgerLabel, { persona: copy.personaName })}>
        {tools.map((tl) => {
          const on = attached.includes(tl.id);
          const lit = focus === tl.id;
          return (
            <li
              key={tl.id}
              className={`relative flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-2.5 py-1.5 stage:flex-nowrap ${
                on ? "bg-white/[0.02]" : "border-dashed border-glass"
              }`}
              style={on ? { borderColor: lit ? `${tl.color}90` : "var(--border-glass-hover)" } : undefined}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${on ? "" : "opacity-40"}`}
                style={{ backgroundColor: `${tl.color}1f`, borderColor: `${tl.color}40` }}
                aria-hidden
              >
                <ConnectorIcon src={tl.icon.src} size={13} />
              </span>
              <span className={`w-24 shrink-0 truncate text-xs font-medium ${on ? "text-foreground" : "text-muted-dark"}`}>
                {tl.name}
              </span>
              <AnimatePresence initial={false} mode="wait">
                {on ? (
                  <motion.span
                    key="jobs"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                    className="flex min-w-0 basis-full flex-wrap gap-1 sm:basis-auto stage:flex-nowrap stage:overflow-hidden stage:[mask-image:linear-gradient(to_right,black_80%,transparent)]"
                  >
                    {tl.useCases.map((uc) => (
                      <span
                        key={uc.title}
                        className="shrink-0 whitespace-nowrap rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 font-mono text-xs text-muted"
                      >
                        {uc.title}
                      </span>
                    ))}
                  </motion.span>
                ) : (
                  <motion.span key="off" initial={false} exit={{ opacity: 0 }} transition={fade} className="text-xs text-muted-dark">
                    {copy.notConnected}
                  </motion.span>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
