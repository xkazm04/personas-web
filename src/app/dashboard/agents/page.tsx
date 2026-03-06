"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ChevronDown,
  Power,
  PowerOff,
  Play,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import AgentDetail, { prefetchAgentDetail } from "@/components/dashboard/AgentDetail";
import EmptyState from "@/components/dashboard/EmptyState";
import { usePersonaStore } from "@/stores/personaStore";
import { useSystemStore } from "@/stores/systemStore";
import { api } from "@/lib/api";
import type { Persona } from "@/lib/types";

const colorToAccent: Record<string, "cyan" | "purple" | "emerald" | "amber"> = {
  "#06b6d4": "cyan",
  "#a855f7": "purple",
  "#34d399": "emerald",
  "#fbbf24": "amber",
};

function accentFromColor(color: string | null): "cyan" | "purple" | "emerald" | "amber" {
  if (!color) return "cyan";
  return colorToAccent[color.toLowerCase()] ?? "cyan";
}

export default function AgentsPage() {
  const personas = usePersonaStore((s) => s.personas);
  const personasLoading = usePersonaStore((s) => s.personasLoading);
  const fetchPersonas = usePersonaStore((s) => s.fetchPersonas);
  const fetchHealth = useSystemStore((s) => s.fetchHealth);
  const health = useSystemStore((s) => s.health);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const prefetchedDetailIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    void fetchPersonas();
    void fetchHealth();
  }, [fetchPersonas, fetchHealth]);

  const handleExecute = useCallback(async (personaId: string) => {
    try {
      await api.executePersona(personaId, "Manual execution from dashboard");
    } catch {
      // TODO: toast
    }
  }, []);

  if (personasLoading && personas.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText>Agents</GradientText>
        </h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-dark">
          <span>{personas.length} agent{personas.length !== 1 ? "s" : ""} deployed</span>
          {health && (
            <>
              <span className="text-white/[0.1]">|</span>
              <span>
                {health.workers.executing} active / {health.workers.total} workers
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* Grid */}
      {personas.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No agents deployed"
          description="Deploy your first agent from the Personas desktop app, then come back here to monitor it."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {personas.map((persona) => {
            const accent = accentFromColor(persona.color);
            const isExpanded = expandedId === persona.id;

            return (
              <div
                key={persona.id}
                onMouseEnter={() => {
                  if (prefetchedDetailIdsRef.current.has(persona.id)) return;
                  prefetchedDetailIdsRef.current.add(persona.id);
                  void prefetchAgentDetail(persona.id);
                }}
              >
                <GlowCard accent={accent} variants={fadeUp} className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <PersonaAvatar
                      icon={persona.icon}
                      color={persona.color}
                      name={persona.name}
                      size="md"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {persona.name}
                      </h3>
                      {persona.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-dark">
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

                {/* Stats */}
                <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-dark">
                  <span className="font-mono">{persona.maxConcurrent} max</span>
                  <span className="font-mono">
                    {(persona.timeoutMs / 1000).toFixed(0)}s timeout
                  </span>
                  {persona.maxBudgetUsd && (
                    <span className="font-mono">
                      ${persona.maxBudgetUsd.toFixed(2)} budget
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleExecute(persona.id);
                    }}
                    className="group relative flex items-center gap-1.5 overflow-hidden rounded-lg border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1.5 text-[11px] font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    <Play className="relative z-10 h-3 w-3" />
                    <span className="relative z-10">Execute</span>
                  </button>
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : persona.id)
                    }
                    className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-muted transition-all hover:bg-white/[0.06] hover:text-foreground"
                  >
                    Details
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* Expandable detail */}
                <AnimatePresence>
                  {isExpanded && (
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
          })}
        </div>
      )}
    </motion.div>
  );
}
