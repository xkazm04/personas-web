import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Play, Power, PowerOff } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import AgentDetail from "@/components/dashboard/AgentDetail";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { fadeUp } from "@/lib/animations";
import type { Persona } from "@/lib/types";

import { accentFromColor } from "./agentAccent";

export function AgentCard({
  persona,
  expanded,
  labels,
  onExecute,
  onPrefetch,
  onToggleExpanded,
}: {
  persona: Persona;
  expanded: boolean;
  labels: {
    maxConcurrent: string;
    timeoutSeconds: string;
    budget: string;
    execute: string;
    details: string;
  };
  onExecute: (id: string) => void;
  onPrefetch: (id: string) => void;
  onToggleExpanded: () => void;
}) {
  const accent = accentFromColor(persona.color);

  return (
    <div onMouseEnter={() => onPrefetch(persona.id)}>
      <GlowCard accent={accent} variants={fadeUp} className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <PersonaAvatar
              icon={persona.icon}
              color={persona.color}
              name={persona.name}
              size="md"
            />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {persona.name}
              </h3>
              {persona.description && (
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-dark">
                  {persona.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {persona.enabled ? (
              <Power className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <PowerOff className="h-3.5 w-3.5 text-muted-dark" />
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-dark">
          <span className="font-mono">
            {persona.maxConcurrent} {labels.maxConcurrent}
          </span>
          <span className="font-mono">
            {labels.timeoutSeconds.replace(
              "{n}",
              (persona.timeoutMs / 1000).toFixed(0),
            )}
          </span>
          {persona.maxBudgetUsd && (
            <span className="font-mono">
              ${persona.maxBudgetUsd.toFixed(2)} {labels.budget}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExecute(persona.id);
            }}
            className="group relative flex items-center gap-1.5 overflow-hidden rounded-lg border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            <Play className="relative z-10 h-3 w-3" />
            <span className="relative z-10">{labels.execute}</span>
          </button>
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-1 rounded-lg border border-glass bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-all hover:bg-white/[0.06] hover:text-foreground"
          >
            {labels.details}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <AgentDetail persona={persona} />
            </motion.div>
          )}
        </AnimatePresence>
      </GlowCard>
    </div>
  );
}
