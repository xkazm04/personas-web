"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Brain,
  Calendar,
  Clock,
  GitBranch,
  Settings,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import FilterBar from "@/components/dashboard/FilterBar";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import BatchReviewModal, {
  type BatchDecision,
} from "@/components/dashboard/BatchReviewModal";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_MEMORIES,
  type MemoryItem,
  type MemoryAction,
} from "@/lib/mock-dashboard-data";
import { relativeTime } from "@/lib/format";
import { useTranslation } from "@/i18n/useTranslation";

type FilterKey = "all" | MemoryAction["type"];

const TYPES: MemoryAction["type"][] = [
  "throttle",
  "schedule",
  "alert",
  "config",
  "routing",
];

const typeConfig: Record<
  MemoryAction["type"],
  { Icon: React.ElementType; tone: string; dot: string }
> = {
  throttle: {
    Icon: Clock,
    tone: "border-amber-500/20 bg-amber-500/8 text-amber-400",
    dot: "bg-amber-400",
  },
  alert: {
    Icon: Bell,
    tone: "border-rose-500/20 bg-rose-500/8 text-rose-400",
    dot: "bg-rose-400",
  },
  routing: {
    Icon: GitBranch,
    tone: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
    dot: "bg-cyan-400",
  },
  schedule: {
    Icon: Calendar,
    tone: "border-purple-500/20 bg-purple-500/8 text-purple-400",
    dot: "bg-purple-400",
  },
  config: {
    Icon: Settings,
    tone: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
    dot: "bg-emerald-400",
  },
};

const statusConfig: Record<
  MemoryItem["status"],
  { label: keyof ReturnType<typeof useTranslation>["t"]["memoriesPage"]["status"]; pill: string }
> = {
  active: {
    label: "active",
    pill: "border-emerald-500/25 bg-emerald-500/8 text-emerald-400",
  },
  pending: {
    label: "pending",
    pill: "border-amber-500/25 bg-amber-500/8 text-amber-400",
  },
  archived: {
    label: "archived",
    pill: "border-glass bg-white/[0.03] text-muted-dark",
  },
};

function ScoreDots({ score, type }: { score: number; type: MemoryAction["type"] }) {
  const maxDots = 5;
  const filled = Math.max(1, Math.round((score / 10) * maxDots));
  const { dot } = typeConfig[type];
  return (
    <div className="flex items-center gap-0.5" aria-label={`score ${score} of 10`}>
      {Array.from({ length: maxDots }, (_, i) => (
        <span
          key={i}
          className={`h-1 w-1 rounded-full ${i < filled ? dot : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}

function MemoryCard({ item }: { item: MemoryItem }) {
  const { t } = useTranslation();
  const { Icon, tone } = typeConfig[item.type];
  const status = statusConfig[item.status];
  const usesLabel = t.memoriesPage.uses.replace("{n}", String(item.usageCount));

  return (
    <div
      className="rounded-xl border border-glass bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
      style={{ contentVisibility: "auto", containIntrinsicSize: "120px" }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {item.title}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-sm font-medium ${status.pill}`}
            >
              {t.memoriesPage.status[status.label]}
            </span>
            {item.hasConflict && (
              <span className="flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/8 px-2 py-0.5 text-sm font-medium text-rose-400">
                <AlertTriangle className="h-3 w-3" />
                Conflict
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-relaxed text-muted-dark line-clamp-2">
            {item.description}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-dark">
            <span className="rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 font-medium">
              {item.persona}
            </span>
            <ScoreDots score={item.score} type={item.type} />
            <span className="tabular-nums">{usesLabel}</span>
            <span aria-hidden>·</span>
            <span>{relativeTime(item.lastUsed)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MemoriesPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [fetchedAt] = useState(() => Date.now());
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [modalOpen, setModalOpen] = useState(false);

  const visibleMemories = useMemo(
    () =>
      MOCK_MEMORIES.map((m) =>
        resolvedIds.has(m.id) ? { ...m, hasConflict: false } : m,
      ),
    [resolvedIds],
  );

  const filtered = useMemo(
    () =>
      filter === "all"
        ? visibleMemories
        : visibleMemories.filter((m) => m.type === filter),
    [filter, visibleMemories],
  );

  const activeConflicts = useMemo(
    () => visibleMemories.filter((m) => m.hasConflict),
    [visibleMemories],
  );

  const conflictCountLabel = t.memoriesPage.conflicts.count.replace(
    "{n}",
    String(activeConflicts.length),
  );

  function handleApply(decisions: Record<string, BatchDecision>) {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      for (const id of Object.keys(decisions)) next.add(id);
      return next;
    });
    setModalOpen(false);
  }

  const filterOptions = useMemo(
    () => [
      {
        key: "all",
        label: t.memoriesPage.filters.all,
        count: MOCK_MEMORIES.length,
      },
      ...TYPES.map((type) => ({
        key: type,
        label: t.memoriesPage.filters[type],
        count: MOCK_MEMORIES.filter((m) => m.type === type).length,
      })),
    ],
    [t],
  );

  const totalLabel = t.memoriesPage.totalCount.replace(
    "{n}",
    String(filtered.length),
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-purple/25 bg-brand-purple/10">
          <Brain className="h-5 w-5 text-brand-purple" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{t.memoriesPage.title}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">
            {t.memoriesPage.subtitle}
          </p>
        </div>
        <StalenessIndicator fetchedAt={fetchedAt} className="mt-2" />
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="mb-3 flex flex-wrap items-center gap-2"
      >
        <FilterBar
          options={filterOptions}
          active={filter}
          onChange={(key) => setFilter(key as FilterKey)}
        />
        {activeConflicts.length > 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-300 transition-all hover:bg-rose-500/15"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="tabular-nums">{conflictCountLabel}</span>
            <span aria-hidden>·</span>
            {t.memoriesPage.conflicts.resolveButton}
          </button>
        )}
      </motion.div>

      <motion.p variants={fadeUp} className="mb-4 text-sm text-muted-dark tabular-nums">
        {totalLabel}
      </motion.p>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-dark">
          {t.memoriesPage.empty}
        </p>
      ) : (
        <motion.div
          variants={fadeUp}
          className="max-h-[calc(100vh-320px)] space-y-2 overflow-y-auto pr-2"
        >
          {filtered.map((item) => (
            <MemoryCard key={item.id} item={item} />
          ))}
        </motion.div>
      )}

      <BatchReviewModal
        open={modalOpen}
        conflicts={activeConflicts}
        onClose={() => setModalOpen(false)}
        onApply={handleApply}
      />
    </motion.div>
  );
}
