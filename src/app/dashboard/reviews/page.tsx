"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  Check,
  X,
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronDown,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import GlowCard from "@/components/GlowCard";
import FilterBar from "@/components/dashboard/FilterBar";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { useDashboardStore } from "@/stores/dashboardStore";
import { usePolling } from "@/hooks/usePolling";
import type { ManualReviewItem } from "@/lib/types";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const severityConfig: Record<
  string,
  { icon: React.ElementType; accent: "cyan" | "amber" | "purple"; color: string }
> = {
  critical: { icon: AlertTriangle, accent: "purple", color: "text-red-400" },
  warning: { icon: AlertCircle, accent: "amber", color: "text-amber-400" },
  info: { icon: Info, accent: "cyan", color: "text-blue-400" },
};

function ReviewCard({
  review,
  selected,
  onSelect,
}: {
  review: ManualReviewItem;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(review.reviewerNotes ?? "");
  const resolveReview = useDashboardStore((s) => s.resolveReview);
  const [resolving, setResolving] = useState(false);
  const sev = severityConfig[review.severity] ?? severityConfig.info;
  const SevIcon = sev.icon;
  const isPending = review.status === "pending";

  const handleResolve = async (status: "approved" | "rejected") => {
    setResolving(true);
    try {
      await resolveReview(review.id, status, notes || undefined);
    } finally {
      setResolving(false);
    }
  };

  return (
    <GlowCard accent={sev.accent} variants={fadeUp} className="p-5">
      <div className="flex items-start gap-3">
        {/* Checkbox for pending */}
        {isPending && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(review.id);
            }}
            className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
              selected
                ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan"
                : "border-white/[0.15] hover:border-white/[0.3]"
            }`}
          >
            {selected && <Check className="h-2.5 w-2.5" />}
          </button>
        )}

        {/* Severity icon */}
        <SevIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${sev.color}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <PersonaAvatar
              icon={review.personaIcon}
              color={review.personaColor}
              name={review.personaName}
            />
            <span className="text-sm font-medium text-foreground truncate">
              {review.personaName ?? "Unknown agent"}
            </span>
            <StatusBadge status={review.status} />
            <span className="ml-auto text-xs text-muted-dark">
              {relativeTime(review.createdAt)}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-muted leading-relaxed">
            {review.content.split("\n")[0]}
          </p>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[11px] text-muted-dark hover:text-muted transition-colors"
          >
            {expanded ? "Collapse" : "Show details"}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
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
            <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
              {/* Full content */}
              <div className="rounded-xl bg-black/30 p-4">
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-300 leading-relaxed">
                  {review.content}
                </pre>
              </div>

              {/* Notes */}
              {isPending && (
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-dark">
                    Reviewer Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes..."
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-dark/50 focus:border-brand-cyan/30 focus:outline-none"
                  />
                </div>
              )}

              {/* Actions */}
              {isPending && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleResolve("approved")}
                    disabled={resolving}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    {resolving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => void handleResolve("rejected")}
                    disabled={resolving}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {resolving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    Reject
                  </button>
                </div>
              )}

              {/* Resolved info */}
              {review.resolvedAt && (
                <p className="text-[11px] text-muted-dark">
                  Resolved {relativeTime(review.resolvedAt)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlowCard>
  );
}

export default function ReviewsPage() {
  const reviews = useDashboardStore((s) => s.reviews);
  const reviewsLoading = useDashboardStore((s) => s.reviewsLoading);
  const fetchReviews = useDashboardStore((s) => s.fetchReviews);
  const resolveReview = useDashboardStore((s) => s.resolveReview);
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkResolving, setBulkResolving] = useState(false);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  usePolling(fetchReviews, 15_000, true);

  // Clear selection on filter change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter]);

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.status === filter);
  }, [reviews, filter]);

  const counts = useMemo(() => {
    const c = { all: reviews.length, pending: 0, approved: 0, rejected: 0 };
    for (const r of reviews) {
      if (r.status === "pending") c.pending++;
      else if (r.status === "approved") c.approved++;
      else if (r.status === "rejected") c.rejected++;
    }
    return c;
  }, [reviews]);

  const pendingInFiltered = useMemo(
    () => filtered.filter((r) => r.status === "pending"),
    [filtered],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(pendingInFiltered.map((r) => r.id)));
  }, [pendingInFiltered]);

  const handleBulkAction = useCallback(
    async (status: "approved" | "rejected") => {
      setBulkResolving(true);
      const results = await Promise.allSettled(
        Array.from(selectedIds).map((id) => resolveReview(id, status)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed === 0) setSelectedIds(new Set());
      setBulkResolving(false);
    },
    [selectedIds, resolveReview],
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText>Manual Reviews</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Review and approve agent decisions requiring human oversight
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between">
        <FilterBar
          options={[
            { key: "all", label: "All", count: counts.all },
            { key: "pending", label: "Pending", count: counts.pending },
            { key: "approved", label: "Approved", count: counts.approved },
            { key: "rejected", label: "Rejected", count: counts.rejected },
          ]}
          active={filter}
          onChange={setFilter}
        />
        {reviewsLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />
        )}
      </motion.div>

      {/* Reviews grid */}
      <motion.div variants={fadeUp}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No reviews"
            description="Manual review requests from agents will appear here"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                selected={selectedIds.has(review.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-background/95 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={selectAll}
                  className="text-xs text-brand-cyan hover:underline"
                >
                  Select all pending ({pendingInFiltered.length})
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-muted-dark hover:text-muted"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void handleBulkAction("approved")}
                  disabled={bulkResolving}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Approve All
                </button>
                <button
                  onClick={() => void handleBulkAction("rejected")}
                  disabled={bulkResolving}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
