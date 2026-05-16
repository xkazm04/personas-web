"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Bot } from "lucide-react";

import GradientText from "@/components/GradientText";
import EmptyState from "@/components/dashboard/EmptyState";
import { prefetchAgentDetail } from "@/components/dashboard/AgentDetail";
import { useTranslation } from "@/i18n/useTranslation";
import { api } from "@/lib/api";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { usePersonaStore } from "@/stores/personaStore";
import { useSystemStore } from "@/stores/systemStore";

import { AgentCard } from "./agents-page/AgentCard";
import { AgentsLoadingGrid } from "./agents-page/AgentsLoadingGrid";

export default function AgentsPage() {
  const { t } = useTranslation();
  const personas = usePersonaStore((state) => state.personas);
  const personasLoading = usePersonaStore((state) => state.personasLoading);
  const fetchPersonas = usePersonaStore((state) => state.fetchPersonas);
  const fetchHealth = useSystemStore((state) => state.fetchHealth);
  const health = useSystemStore((state) => state.health);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const prefetchedDetailIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    void fetchPersonas();
    void fetchHealth();
  }, [fetchPersonas, fetchHealth]);

  const handleExecute = useCallback(async (personaId: string) => {
    try {
      await api.executePersona(personaId, t.agentsPage.manualExecution);
    } catch {
      // TODO: toast
    }
  }, [t.agentsPage.manualExecution]);

  const handlePrefetch = useCallback((personaId: string) => {
    if (prefetchedDetailIdsRef.current.has(personaId)) return;
    prefetchedDetailIdsRef.current.add(personaId);
    void prefetchAgentDetail(personaId);
  }, []);

  if (personasLoading && personas.length === 0) {
    return <AgentsLoadingGrid />;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <Image
          src="/gen/backgrounds/bg-agents.png"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>

      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">{t.agentsPage.title}</GradientText>
        </h1>
        <div className="mt-2 flex items-center gap-3 text-base text-muted-dark">
          <span>
            {personas.length}{" "}
            {personas.length === 1 ? t.agentsPage.agentDeployed : t.agentsPage.agentsDeployed}
          </span>
          {health && (
            <>
              <span className="text-white/[0.1]">|</span>
              <span>
                {health.workers.executing} {t.common.active} / {health.workers.total} {t.dashboard.workers}
              </span>
            </>
          )}
        </div>
      </motion.div>

      {personas.length === 0 ? (
        <EmptyState
          icon={Bot}
          title={t.agentsPage.noAgents}
          description={t.agentsPage.noAgentsDesc}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {personas.map((persona) => (
            <AgentCard
              key={persona.id}
              persona={persona}
              expanded={expandedId === persona.id}
              labels={{
                maxConcurrent: t.agentsPage.maxConcurrent,
                timeoutSeconds: t.agentsPage.timeoutSeconds,
                budget: t.agentsPage.budget,
                execute: t.agentsPage.execute,
                details: t.agentsPage.details,
              }}
              onExecute={(personaId) => void handleExecute(personaId)}
              onPrefetch={handlePrefetch}
              onToggleExpanded={() =>
                setExpandedId(expandedId === persona.id ? null : persona.id)
              }
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
