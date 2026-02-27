"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Radio,
  Clock,
  ChevronDown,
  Power,
  PowerOff,
  Play,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { useDashboardStore } from "@/stores/dashboardStore";
import { api } from "@/lib/api";
import type { Persona, PersonaExecution, PersonaEventSubscription, PersonaTrigger } from "@/lib/types";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function accentFromColor(color: string | null): "cyan" | "purple" | "emerald" | "amber" {
  if (!color) return "cyan";
  const lower = color.toLowerCase();
  if (lower.includes("purple") || lower.includes("a855") || lower.includes("8b5")) return "purple";
  if (lower.includes("emerald") || lower.includes("34d3") || lower.includes("10b9")) return "emerald";
  if (lower.includes("amber") || lower.includes("fbbf") || lower.includes("f59")) return "amber";
  return "cyan";
}

interface AgentDetailData {
  executions: PersonaExecution[];
  subscriptions: PersonaEventSubscription[];
  triggers: PersonaTrigger[];
}

function AgentDetail({ persona }: { persona: Persona }) {
  const [data, setData] = useState<AgentDetailData | null>(null);

  useEffect(() => {
    Promise.all([
      api.listExecutions({ personaId: persona.id, limit: 5 }),
      api.listSubscriptions(persona.id),
      api.listTriggers(persona.id),
    ]).then(([executions, subscriptions, triggers]) => {
      setData({ executions, subscriptions, triggers });
    });
  }, [persona.id]);

  if (!data) {
    return (
      <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-3 w-24 rounded bg-white/[0.05]" />
            <div className="space-y-2">
              <div className="h-2.5 rounded bg-white/[0.03]" />
              <div className="h-2.5 w-5/6 rounded bg-white/[0.03]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
      {/* Recent executions */}
      <div>
        <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-dark">
          Recent Executions
        </h4>
        {data.executions.length === 0 ? (
          <p className="mt-1 text-xs text-muted-dark">No executions yet</p>
        ) : (
          <div className="mt-1.5 space-y-1">
            {data.executions.map((exec) => (
              <div
                key={exec.id}
                className="flex items-center gap-2 text-xs text-muted"
              >
                <StatusBadge status={exec.status} />
                <span className="flex-1 truncate font-mono text-[11px] text-muted-dark">
                  {exec.id.slice(0, 8)}
                </span>
                {exec.durationMs && (
                  <span className="tabular-nums text-muted-dark">
                    {(exec.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
                <span className="text-muted-dark">
                  {relativeTime(exec.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscriptions & Triggers summary */}
      <div className="flex gap-4 text-xs text-muted-dark">
        <span className="flex items-center gap-1">
          <Radio className="h-3 w-3" />
          {data.subscriptions.length} subscription{data.subscriptions.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {data.triggers.length} trigger{data.triggers.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const personas = useDashboardStore((s) => s.personas);
  const personasLoading = useDashboardStore((s) => s.personasLoading);
  const fetchPersonas = useDashboardStore((s) => s.fetchPersonas);
  const fetchHealth = useDashboardStore((s) => s.fetchHealth);
  const health = useDashboardStore((s) => s.health);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
              <GlowCard key={persona.id} accent={accent} variants={fadeUp} className="p-5">
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
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-dark">
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
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
