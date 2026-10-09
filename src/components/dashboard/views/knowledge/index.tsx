"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Table2, GitFork, Brain } from "lucide-react";
import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import { KNOWLEDGE_VIEW_KEY } from "@/lib/constants";
import { useTranslation } from "@/i18n/useTranslation";
// The Graph tab's shell (top bar + frame) is light and ships with the view so
// its chrome paints with the tab. Its body - SVG layout math, five
// sub-components, framer-motion - is the code-split part (`loadClusterCanvas`)
// and is fetched only on intent (Graph tab hover/focus) or selection, then
// mounted through the view's arrival queue.
import KnowledgeClusterGraph, { loadClusterCanvas } from "./KnowledgeClusterGraph";
import KnowledgeDenseTable from "./KnowledgeDenseTable";
import MemoriesView from "./MemoriesView";
import { useKnowledgeData } from "./useKnowledgeData";

/** Prefetch on intent: a failed warm-up is harmless (the real mount retries). */
const warmClusterCanvas = () => {
  void loadClusterCanvas().catch(() => {});
};

type ViewVariant = "dense-table" | "cluster-graph" | "memories";

const VIEW_VARIANTS: {
  key: ViewVariant;
  labelKey: "denseTable" | "graph" | "memories";
  icon: React.ElementType;
}[] = [
  { key: "dense-table", labelKey: "denseTable", icon: Table2 },
  { key: "cluster-graph", labelKey: "graph", icon: GitFork },
  { key: "memories", labelKey: "memories", icon: Brain },
];

function isViewVariant(value: string | null): value is ViewVariant {
  return VIEW_VARIANTS.some((v) => v.key === value);
}

export default function KnowledgeGraphPage() {
  const { t } = useTranslation();
  const { patterns, memories, loading, error, retry } = useKnowledgeData();
  const [activeVariant, setActiveVariant] = useState<ViewVariant>("dense-table");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // T2 placeholders only on a first load with nothing held (a retry keeps the
  // last data). `coldStart` gives content that lands after such a load its
  // entrance; mock data present on the first frame paints settled.
  const [coldStart] = useState(loading);
  const pending = loading && patterns.length === 0 && memories.length === 0;
  const settle = coldStart && !pending;

  // Restore the persisted view on mount. Navigation remounts this page, which
  // would otherwise reset the switcher to "dense-table" on every visit.
  // queueMicrotask keeps the setState out of the effect body (React 19 rule).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KNOWLEDGE_VIEW_KEY);
      if (isViewVariant(stored)) {
        queueMicrotask(() => setActiveVariant(stored));
      }
    } catch {
      // localStorage unavailable (private mode, disabled storage) — keep default.
    }
  }, []);

  const selectVariant = useCallback((next: ViewVariant) => {
    setActiveVariant(next);
    try {
      localStorage.setItem(KNOWLEDGE_VIEW_KEY, next);
    } catch {
      // localStorage unavailable — the selection still applies for this session.
    }
  }, []);

  // Roving-tabindex keyboard navigation: Left/Right wrap, Home/End jump.
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const count = VIEW_VARIANTS.length;
      const current = VIEW_VARIANTS.findIndex((v) => v.key === activeVariant);
      let nextIndex: number | null = null;
      if (e.key === "ArrowRight") nextIndex = (current + 1) % count;
      else if (e.key === "ArrowLeft") nextIndex = (current - 1 + count) % count;
      else if (e.key === "Home") nextIndex = 0;
      else if (e.key === "End") nextIndex = count - 1;
      if (nextIndex === null) return;
      e.preventDefault();
      selectVariant(VIEW_VARIANTS[nextIndex].key);
      tabRefs.current[nextIndex]?.focus();
    },
    [activeVariant, selectVariant],
  );

  return (
    <div>
      {/* T0 frame: title + the view switcher paint with the view, never animated. */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{t.knowledgePage.title}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">
            {t.knowledgePage.subtitle}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t.knowledgePage.viewSwitcherLabel}
          aria-orientation="horizontal"
          className="flex items-center gap-1 rounded-xl border border-glass bg-white/[0.02] p-1"
        >
          {VIEW_VARIANTS.map((v, index) => {
            const VIcon = v.icon;
            const isActive = activeVariant === v.key;
            return (
              <button
                key={v.key}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`knowledge-tab-${v.key}`}
                aria-selected={isActive}
                aria-controls={`knowledge-panel-${v.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectVariant(v.key)}
                onKeyDown={handleTabKeyDown}
                onPointerEnter={v.key === "cluster-graph" ? warmClusterCanvas : undefined}
                onFocus={v.key === "cluster-graph" ? warmClusterCanvas : undefined}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.08] text-foreground shadow-sm"
                    : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"
                }`}
              >
                <VIcon className="h-3.5 w-3.5" />
                {t.knowledgePage[v.labelKey]}
              </button>
            );
          })}
        </div>
      </div>

      {error && <DashboardErrorBanner message={error} onRetry={retry} />}

      <div
        role="tabpanel"
        id={`knowledge-panel-${activeVariant}`}
        aria-labelledby={`knowledge-tab-${activeVariant}`}
        aria-busy={loading}
      >
        {/* Each variant paints its own T1 chrome at once and holds its T2
            placeholder while a cold load is pending (see each component). */}
        {activeVariant === "dense-table" && (
          <KnowledgeDenseTable patterns={patterns} pending={pending} settle={settle} />
        )}
        {activeVariant === "cluster-graph" && <KnowledgeClusterGraph patterns={patterns} pending={pending} />}
        {activeVariant === "memories" && <MemoriesView memories={memories} pending={pending} settle={settle} />}
      </div>
    </div>
  );
}
