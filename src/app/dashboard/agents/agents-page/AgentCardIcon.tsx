"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Play, Power, PowerOff } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import AgentDetail from "@/components/dashboard/AgentDetail";
import AgentMetrics from "@/components/dashboard/AgentMetrics";
import { fadeUp } from "@/lib/animations";
import type { Persona } from "@/lib/types";

import { accentFromColor } from "./agentAccent";
import { PersonaGlyph } from "./personaVisuals";

/**
 * Variant A — icon-dominant card: a large lucide glyph tinted with the persona
 * color sits at the top of the card, with name + description + metrics below.
 */
export function AgentCardIcon({
  persona,
  expanded,
  labels,
  onExecute,
  onPrefetch,
  onToggleExpanded,
}: {
  persona: Persona;
  expanded: boolean;
  labels: { execute: string; details: string };
  onExecute: (id: string) => void;
  onPrefetch: (id: string) => void;
  onToggleExpanded: () => void;
}) {
  const accent = accentFromColor(persona.color);
  const tint = persona.color ?? "#06b6d4";

  return (
    <div onMouseEnter={() => onPrefetch(persona.id)}>
      <GlowCard accent={accent} variants={fadeUp} className="flex flex-col items-center p-6 text-center">
        {/* Large icon medallion */}
        <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-90"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${tint}33 0%, ${tint}10 60%, transparent 100%)`,
              border: `1px solid ${tint}40`,
            }}
          />
          <PersonaGlyph name={persona.name} className="relative h-12 w-12" style={{ color: tint }} />
          <span
            className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-glass-hover bg-surface"
            aria-label={persona.enabled ? "Enabled" : "Disabled"}
            title={persona.enabled ? "Enabled" : "Disabled"}
          >
            {persona.enabled ? (
              <Power className="h-3 w-3 text-emerald-400" />
            ) : (
              <PowerOff className="h-3 w-3 text-muted-dark" />
            )}
          </span>
        </div>

        <h3 className="text-base font-semibold text-foreground">{persona.name}</h3>
        {persona.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-dark">{persona.description}</p>
        )}

        <div className="mt-4 w-full">
          <AgentMetrics persona={persona} />
        </div>

        <div className="mt-4 flex w-full items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExecute(persona.id);
            }}
            className="group relative flex items-center gap-1.5 overflow-hidden rounded-lg border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20 focus-ring focus-visible:ring-offset-0"
          >
            <Play className="h-3 w-3" />
            {labels.execute}
          </button>
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-1 rounded-lg border border-glass bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-all hover:bg-white/[0.06] hover:text-foreground focus-ring focus-visible:ring-offset-0"
          >
            {labels.details}
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full overflow-hidden text-left"
            >
              <AgentDetail persona={persona} />
            </motion.div>
          )}
        </AnimatePresence>
      </GlowCard>
    </div>
  );
}
