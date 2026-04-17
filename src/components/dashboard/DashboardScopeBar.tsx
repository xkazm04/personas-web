"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Users } from "lucide-react";
import PersonaAvatar from "./PersonaAvatar";
import CompareToggle from "./CompareToggle";
import { usePersonaStore } from "@/stores/personaStore";
import {
  DATE_RANGE_PRESETS,
  useDashboardFilterStore,
  type DateRangePreset,
} from "@/stores/dashboardFilterStore";
import { useTranslation } from "@/i18n/useTranslation";

export default function DashboardScopeBar() {
  const { t } = useTranslation();
  const personas = usePersonaStore((s) => s.personas);
  const fetchPersonas = usePersonaStore((s) => s.fetchPersonas);

  const personaId = useDashboardFilterStore((s) => s.personaId);
  const dateRange = useDashboardFilterStore((s) => s.dateRange);
  const compareEnabled = useDashboardFilterStore((s) => s.compareEnabled);
  const setPersonaId = useDashboardFilterStore((s) => s.setPersonaId);
  const setDateRange = useDashboardFilterStore((s) => s.setDateRange);
  const setCompareEnabled = useDashboardFilterStore((s) => s.setCompareEnabled);

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void fetchPersonas();
  }, [fetchPersonas]);

  useEffect(() => {
    if (!personaMenuOpen) return;
    function onClickAway(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPersonaMenuOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setPersonaMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEscape);
    };
  }, [personaMenuOpen]);

  const selectedPersona = useMemo(
    () => personas.find((p) => p.id === personaId) ?? null,
    [personas, personaId],
  );

  const presetLabels: Record<DateRangePreset, string> = {
    "24h": t.dashboard.scope.dateRange.last24h,
    "7d": t.dashboard.scope.dateRange.last7d,
    "30d": t.dashboard.scope.dateRange.last30d,
    "90d": t.dashboard.scope.dateRange.last90d,
    custom: t.dashboard.scope.dateRange.custom,
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-glass bg-white/[0.02] px-3 py-2 backdrop-blur-sm">
      {/* Persona selector */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setPersonaMenuOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={personaMenuOpen}
          aria-label={t.dashboard.scope.personaLabel}
          className="flex items-center gap-2 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]"
        >
          {selectedPersona ? (
            <PersonaAvatar
              icon={selectedPersona.icon}
              color={selectedPersona.color}
              name={selectedPersona.name}
              size="sm"
            />
          ) : (
            <Users className="h-3.5 w-3.5 text-muted-dark" />
          )}
          <span className="max-w-[140px] truncate">
            {selectedPersona ? selectedPersona.name : t.dashboard.scope.allPersonas}
          </span>
          <ChevronDown
            className={`h-3 w-3 text-muted-dark transition-transform ${
              personaMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {personaMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              role="listbox"
              className="absolute z-20 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-glass bg-[#0a0f1a]/95 p-1 shadow-xl backdrop-blur-lg"
            >
              <button
                type="button"
                role="option"
                aria-selected={personaId === null}
                onClick={() => {
                  setPersonaId(null);
                  setPersonaMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-white/[0.04]"
              >
                <Users className="h-3.5 w-3.5 text-muted-dark" />
                <span className="flex-1 text-left">{t.dashboard.scope.allPersonas}</span>
                {personaId === null && <Check className="h-3.5 w-3.5 text-brand-cyan" />}
              </button>
              {personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={personaId === p.id}
                  onClick={() => {
                    setPersonaId(p.id);
                    setPersonaMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-white/[0.04]"
                >
                  <PersonaAvatar icon={p.icon} color={p.color} name={p.name} size="sm" />
                  <span className="flex-1 truncate text-left">{p.name}</span>
                  {personaId === p.id && <Check className="h-3.5 w-3.5 text-brand-cyan" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Date range presets */}
      <div className="scrollbar-hide flex items-center gap-0.5 overflow-x-auto rounded-lg border border-glass-hover bg-white/[0.02] p-0.5">
        {DATE_RANGE_PRESETS.map((p) => {
          const isActive = dateRange === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setDateRange(p)}
              aria-pressed={isActive}
              className={`rounded-md px-2.5 py-1 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/[0.08] text-foreground shadow-sm"
                  : "text-muted-dark hover:bg-white/[0.04] hover:text-muted"
              }`}
            >
              {presetLabels[p]}
            </button>
          );
        })}
        {dateRange === "custom" && (
          <span className="rounded-md bg-white/[0.08] px-2.5 py-1 text-sm font-medium text-foreground">
            {presetLabels.custom}
          </span>
        )}
      </div>

      {/* Compare toggle */}
      <CompareToggle
        enabled={compareEnabled}
        onToggle={() => setCompareEnabled(!compareEnabled)}
        label={t.dashboard.scope.compare}
      />
    </div>
  );
}
