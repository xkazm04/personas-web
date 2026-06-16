"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Bot } from "lucide-react";

import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import { prefetchAgentDetail } from "@/components/dashboard/AgentDetail";
import { useTranslation } from "@/i18n/useTranslation";
import { api } from "@/lib/api";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { usePersonaStore } from "@/stores/personaStore";
import { useSystemStore } from "@/stores/systemStore";

import { AgentCardImage } from "./agents-page/AgentCardImage";
import { AgentsLoadingGrid } from "./agents-page/AgentsLoadingGrid";
import ExecuteToast from "./agents-page/ExecuteToast";

type ExecuteToastState = { id: number; status: "success" | "error"; message: string };

export default function AgentsPage() {
  const { t } = useTranslation();
  const personas = usePersonaStore((state) => state.personas);
  const personasLoading = usePersonaStore((state) => state.personasLoading);
  const personasError = usePersonaStore((state) => state.personasError);
  const fetchPersonas = usePersonaStore((state) => state.fetchPersonas);
  const fetchHealth = useSystemStore((state) => state.fetchHealth);
  const health = useSystemStore((state) => state.health);
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);
  const [executingIds, setExecutingIds] = useState<Set<string>>(() => new Set());
  const [result, setResult] = useState<{ id: string; status: "success" | "error" } | null>(null);
  const [toast, setToast] = useState<ExecuteToastState | null>(null);
  const prefetchedDetailIdsRef = useRef<Set<string>>(new Set());
  const toastIdRef = useRef(0);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void fetchPersonas();
    void fetchHealth();
  }, [fetchPersonas, fetchHealth]);

  // Clear the pending result-ring timer if we unmount mid-flight.
  useEffect(() => () => {
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
  }, []);

  const showToast = useCallback((status: "success" | "error", message: string) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, status, message });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // Flash a brief success/error ring on the card's Execute button (~700ms),
  // re-armed on each outcome so rapid re-fires restart the animation.
  const flashResult = useCallback((id: string, status: "success" | "error") => {
    setResult({ id, status });
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => setResult(null), 700);
  }, []);

  const handleExecute = useCallback(async (personaId: string) => {
    const name = usePersonaStore.getState().personasById[personaId]?.name ?? "";
    setExecutingIds((prev) => {
      const next = new Set(prev);
      next.add(personaId);
      return next;
    });
    try {
      await api.executePersona(personaId, t.agentsPage.manualExecution);
      showToast("success", t.agentsPage.executeQueued.replace("{name}", name));
      flashResult(personaId, "success");
    } catch {
      showToast("error", t.agentsPage.executeFailed.replace("{name}", name));
      flashResult(personaId, "error");
    } finally {
      setExecutingIds((prev) => {
        if (!prev.has(personaId)) return prev;
        const next = new Set(prev);
        next.delete(personaId);
        return next;
      });
    }
  }, [t.agentsPage.manualExecution, t.agentsPage.executeQueued, t.agentsPage.executeFailed, showToast, flashResult]);

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

      {personasError && (
        <motion.div variants={fadeUp}>
          <DashboardErrorBanner
            message={personasError}
            onRetry={() => void fetchPersonas()}
          />
        </motion.div>
      )}

      {personas.length === 0 ? (
        // A failed fetch surfaces the banner above; don't also paint the
        // reassuring "no agents" empty state over a network error.
        personasError ? null : (
          <EmptyState
            icon={Bot}
            title={t.agentsPage.noAgents}
            description={t.agentsPage.noAgentsDesc}
          />
        )
      ) : (
        <div data-tour-diagram="dashboard-agents" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {personas.map((persona) => (
            <AgentCardImage
              key={persona.id}
              persona={persona}
              expanded={expandedImageId === persona.id}
              executing={executingIds.has(persona.id)}
              result={result?.id === persona.id ? result.status : null}
              labels={{
                execute: t.agentsPage.execute,
                executing: t.agentsPage.executing,
                details: t.agentsPage.details,
                statusLive: t.agentsPage.statusLive,
                statusOff: t.agentsPage.statusOff,
              }}
              onExecute={(personaId) => void handleExecute(personaId)}
              onPrefetch={handlePrefetch}
              onToggleExpanded={() =>
                setExpandedImageId(expandedImageId === persona.id ? null : persona.id)
              }
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <ExecuteToast
            key={toast.id}
            status={toast.status}
            message={toast.message}
            onDismiss={dismissToast}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
