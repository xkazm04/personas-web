"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  Play,
  Pencil,
  Ban,
  RotateCcw,
  Bookmark,
  Trash2,
  Terminal,
  Clock,
  DollarSign,
  Cpu,
  FileText,
  ScrollText,
  BarChart3,
  TrendingUp,
  Users,
  Timer,
  Zap,
  Settings2,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import GlowCard from "@/components/GlowCard";
import FilterBar from "@/components/dashboard/FilterBar";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { useReviewStore } from "@/stores/reviewStore";
import { usePolling } from "@/hooks/usePolling";
import { api } from "@/lib/api";
import type { ManualReviewItem, ReviewSeverity, ExecutionDetail, EscalationPolicy, EscalationAction } from "@/lib/types";
import { relativeTime, formatDuration } from "@/lib/format";
import ConfirmDialog from "@/components/ConfirmDialog";
import ShortcutHint from "@/components/ShortcutHint";
import UndoToast from "@/components/UndoToast";
import {
  severityThresholdMinutes,
  getUrgencyLevel,
  getSlaCountdown,
  computeAuditAnalytics,
} from "@/lib/reviewUtils";
import { useReviewBulkActions } from "@/hooks/useReviewBulkActions";

// ---------------------------------------------------------------------------
// Notes templates – persisted in localStorage
// ---------------------------------------------------------------------------

const TEMPLATES_KEY = "review-notes-templates";

function loadTemplates(): string[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: string[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// ---------------------------------------------------------------------------
// Quick-action types
// ---------------------------------------------------------------------------

type QuickActionKind =
  | "approve_continue"
  | "approve_modify"
  | "reject_retry"
  | "reject_disable";

const quickActions: {
  kind: QuickActionKind;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  status: "approved" | "rejected";
  prefillNotes?: string;
  className: string;
}[] = [
  {
    kind: "approve_continue",
    label: "Approve & Continue",
    shortLabel: "Approve",
    icon: Play,
    status: "approved",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  },
  {
    kind: "approve_modify",
    label: "Approve w/ Modifications",
    shortLabel: "Modify",
    icon: Pencil,
    status: "approved",
    prefillNotes: "Approved with modifications:\n- ",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
  },
  {
    kind: "reject_retry",
    label: "Reject & Retry",
    shortLabel: "Retry",
    icon: RotateCcw,
    status: "rejected",
    prefillNotes: "Rejected – retry with adjustments:\n- ",
    className:
      "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
  },
  {
    kind: "reject_disable",
    label: "Reject & Disable",
    shortLabel: "Disable",
    icon: Ban,
    status: "rejected",
    prefillNotes: "Rejected – disable trigger. Reason: ",
    className:
      "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20",
  },
];

// ---------------------------------------------------------------------------
// Severity config
// ---------------------------------------------------------------------------

const severityConfig: Record<
  ReviewSeverity,
  { icon: React.ElementType; accent: "cyan" | "amber" | "purple"; color: string; glowRgb: string; thresholdMinutes: number }
> = {
  critical: { icon: AlertTriangle, accent: "purple", color: "text-red-400", glowRgb: "168,85,247", thresholdMinutes: severityThresholdMinutes.critical },
  warning: { icon: AlertCircle, accent: "amber", color: "text-amber-400", glowRgb: "251,191,36", thresholdMinutes: severityThresholdMinutes.warning },
  info: { icon: Info, accent: "cyan", color: "text-blue-400", glowRgb: "6,182,212", thresholdMinutes: severityThresholdMinutes.info },
};

// ---------------------------------------------------------------------------
// Notes Template Picker
// ---------------------------------------------------------------------------

function NoteTemplatePicker({
  templates,
  onSelect,
  onDelete,
}: {
  templates: string[];
  onSelect: (t: string) => void;
  onDelete: (idx: number) => void;
}) {
  if (templates.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {templates.map((t, i) => (
        <span key={i} className="group flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted">
          <button
            type="button"
            onClick={() => onSelect(t)}
            className="hover:text-foreground transition-colors truncate max-w-[180px]"
            title={t}
          >
            {t.length > 40 ? t.slice(0, 40) + "..." : t}
          </button>
          <button
            type="button"
            onClick={() => onDelete(i)}
            className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
            aria-label="Delete template"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Execution Context Panel
// ---------------------------------------------------------------------------

function ExecutionContextPanel({ executionId }: { executionId: string }) {
  const [detail, setDetail] = useState<ExecutionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullLog, setShowFullLog] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getExecution(executionId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [executionId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-dark" />
        <span className="text-[11px] text-muted-dark">Loading execution context...</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-500/15 bg-red-500/5 p-3">
        <AlertCircle className="h-3.5 w-3.5 text-red-400/60" />
        <span className="text-[11px] text-red-400/80">{error ?? "Execution not found"}</span>
      </div>
    );
  }

  const outputLines = detail.output ?? [];
  const visibleLines = showFullLog ? outputLines : outputLines.slice(0, 8);
  const hasMore = outputLines.length > 8;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <Terminal className="h-3.5 w-3.5 text-brand-cyan" />
        <span className="text-[11px] font-medium text-foreground">Execution Context</span>
        <StatusBadge status={detail.status} />
        <span className="ml-auto text-[10px] font-mono text-muted-dark">
          {executionId.slice(0, 12)}
        </span>
      </div>

      {/* Metrics row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-white/[0.06] px-3 py-2">
        {detail.durationMs != null && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <Clock className="h-3 w-3 text-muted-dark" />
            {detail.durationMs < 1000
              ? `${detail.durationMs}ms`
              : `${(detail.durationMs / 1000).toFixed(1)}s`}
          </span>
        )}
        {detail.totalCostUsd != null && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <DollarSign className="h-3 w-3 text-muted-dark" />
            ${detail.totalCostUsd.toFixed(4)}
          </span>
        )}
        {detail.outputLines > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <FileText className="h-3 w-3 text-muted-dark" />
            {detail.outputLines} line{detail.outputLines !== 1 ? "s" : ""}
          </span>
        )}
        {detail.sessionId && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <Cpu className="h-3 w-3 text-muted-dark" />
            Session {detail.sessionId.slice(0, 8)}
          </span>
        )}
      </div>

      {/* Output log */}
      {outputLines.length > 0 && (
        <div className="px-3 py-2">
          <div className="max-h-48 overflow-auto rounded-lg bg-black/40 p-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-400">
              {visibleLines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <span className="select-none text-muted-dark/40 w-5 text-right flex-shrink-0">
                    {(showFullLog ? i : i) + 1}
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
          </div>
          {hasMore && (
            <button
              onClick={() => setShowFullLog(!showFullLog)}
              className="mt-1.5 text-[10px] text-brand-cyan/70 hover:text-brand-cyan transition-colors"
            >
              {showFullLog ? "Show less" : `Show all ${outputLines.length} lines`}
            </button>
          )}
        </div>
      )}

      {outputLines.length === 0 && (
        <div className="px-3 py-3 text-center text-[11px] text-muted-dark/60">
          No output recorded for this execution
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewCard
// ---------------------------------------------------------------------------

function ReviewCard({
  review,
  selected,
  onSelect,
  focused,
  onFocusRequest,
  escalationPolicy,
  escalationEnabled,
}: {
  review: ManualReviewItem;
  selected: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  focused: boolean;
  onFocusRequest: () => void;
  escalationPolicy: EscalationPolicy;
  escalationEnabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(review.reviewerNotes ?? "");
  const resolveReview = useReviewStore((s) => s.resolveReview);
  const [resolving, setResolving] = useState(false);
  const [templates, setTemplates] = useState<string[]>(loadTemplates);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sev = severityConfig[review.severity];
  const SevIcon = sev.icon;
  const isPending = review.status === "pending";

  // Urgency escalation — re-evaluate every 10s for countdown accuracy
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isPending) return;
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, [isPending]);

  const rule = escalationPolicy[review.severity];
  const countdown = isPending && escalationEnabled && rule.action !== "none"
    ? getSlaCountdown(review.createdAt, rule.slaMinutes)
    : null;
  const isEscalated = !!review.escalatedAt;

  const urgency = isPending ? getUrgencyLevel(review.createdAt, review.severity) : 0;
  // Pulse duration: 3s at urgency 0, 1s at urgency 1
  const pulseDuration = urgency > 0 ? 3 - urgency * 2 : 0;

  // Auto-expand when focused via keyboard
  useEffect(() => {
    if (focused && isPending && !expanded) {
      setExpanded(true);
    }
  }, [focused, isPending, expanded]);

  // Scroll into view when focused
  useEffect(() => {
    if (focused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focused]);

  const handleResolve = async (status: "approved" | "rejected", actionNotes?: string) => {
    const finalNotes = actionNotes ?? notes;
    setResolving(true);
    try {
      await resolveReview(review.id, status, finalNotes || undefined);
    } finally {
      setResolving(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[number]) => {
    if (action.prefillNotes) {
      setNotes(action.prefillNotes);
      setExpanded(true);
      setTimeout(() => notesRef.current?.focus(), 50);
    } else {
      void handleResolve(action.status);
    }
  };

  const handleSaveTemplate = () => {
    if (!notes.trim()) return;
    const updated = [...templates, notes.trim()];
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleDeleteTemplate = (idx: number) => {
    const updated = templates.filter((_, i) => i !== idx);
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleSelectTemplate = (t: string) => {
    setNotes(t);
    notesRef.current?.focus();
  };

  // Keyboard shortcuts when this card is focused
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isPending || !focused) return;
      // Ignore if typing in textarea
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "a") {
        e.preventDefault();
        void handleResolve("approved");
      } else if (e.key === "r") {
        e.preventDefault();
        void handleResolve("rejected");
      } else if (e.key === "n") {
        e.preventDefault();
        setExpanded(true);
        setTimeout(() => notesRef.current?.focus(), 50);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPending, focused, notes],
  );

  return (
    <div
      ref={cardRef}
      tabIndex={isPending ? 0 : undefined}
      onFocus={onFocusRequest}
      onKeyDown={handleKeyDown}
      className={`outline-none rounded-2xl relative ${focused ? "ring-2 ring-brand-cyan/40" : ""}`}
    >
      {/* Urgency pulsing glow overlay */}
      {urgency > 0 && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl z-20"
          style={{
            boxShadow: `0 0 ${12 + urgency * 20}px rgba(${sev.glowRgb},${0.1 + urgency * 0.25}), inset 0 0 ${4 + urgency * 8}px rgba(${sev.glowRgb},${0.05 + urgency * 0.1})`,
            border: `1px solid rgba(${sev.glowRgb},${0.15 + urgency * 0.35})`,
            animation: `urgency-pulse ${pulseDuration}s ease-in-out infinite`,
          }}
        />
      )}
      <GlowCard accent={sev.accent} variants={fadeUp} className="px-4 py-3">
        {/* Inline triage row */}
        <div className="flex items-center gap-3">
          {/* Checkbox for pending */}
          {isPending && (
            <button
              role="checkbox"
              aria-checked={selected}
              aria-label={`Select review from ${review.personaName ?? "Unknown agent"}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(review.id, e.shiftKey);
              }}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault();
              }}
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                selected
                  ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan"
                  : "border-white/[0.15] hover:border-white/[0.3]"
              }`}
            >
              {selected && <Check className="h-2.5 w-2.5" />}
            </button>
          )}

          {/* Severity icon */}
          <SevIcon className={`h-4 w-4 flex-shrink-0 ${sev.color}`} />

          {/* Agent */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <PersonaAvatar
              icon={review.personaIcon}
              color={review.personaColor}
              name={review.personaName}
            />
            <span className="text-xs font-medium text-foreground truncate max-w-[100px] hidden sm:inline">
              {review.personaName ?? "Unknown"}
            </span>
          </div>

          {/* Preview text */}
          <p className="flex-1 min-w-0 text-sm text-foreground truncate">
            {review.content.split("\n")[0]}
          </p>

          {/* Urgency indicator */}
          {urgency > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium flex-shrink-0" style={{ color: `rgba(${sev.glowRgb},${0.6 + urgency * 0.4})` }}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: `rgba(${sev.glowRgb},${0.7 + urgency * 0.3})`,
                  animation: `urgency-pulse ${pulseDuration}s ease-in-out infinite`,
                }}
              />
              Aging
            </span>
          )}

          {/* SLA countdown */}
          {countdown && !isEscalated && (
            <span
              className={`flex items-center gap-1 text-[10px] font-mono tabular-nums flex-shrink-0 ${
                countdown.expired
                  ? "text-red-400"
                  : countdown.remainingMs < 300_000
                    ? "text-amber-400"
                    : "text-muted-dark"
              }`}
              title={`SLA: ${rule.slaMinutes}m — Action: ${rule.action === "auto_approve" ? "Auto-approve" : "Escalate"}`}
            >
              <Timer className="h-3 w-3" />
              {countdown.label}
            </span>
          )}

          {/* Escalated badge */}
          {isEscalated && (
            <span className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 flex-shrink-0">
              <Zap className="h-2.5 w-2.5" />
              Escalated
            </span>
          )}

          {/* Status badge */}
          <StatusBadge status={review.status} />

          {/* Time */}
          <span className="text-xs text-muted-dark flex-shrink-0 hidden sm:block">
            {relativeTime(review.createdAt)}
          </span>

          {/* Inline action buttons for pending */}
          {isPending && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.kind}
                    onClick={() => handleQuickAction(action)}
                    disabled={resolving}
                    title={action.label}
                    className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all disabled:opacity-50 ${action.className}`}
                  >
                    {resolving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                    <span className="hidden lg:inline">{action.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 p-1 text-muted-dark hover:text-muted transition-colors"
            title={expanded ? "Collapse" : "Show details"}
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
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
              <div className="mt-3 space-y-3 border-t border-white/[0.06] pt-3">
                {/* Full content */}
                <div className="rounded-xl bg-black/30 p-4">
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-300 leading-relaxed">
                    {review.content}
                  </pre>
                </div>

                {/* Execution context */}
                {review.executionId && (
                  <ExecutionContextPanel executionId={review.executionId} />
                )}

                {/* Notes with templates */}
                {isPending && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium uppercase tracking-wider text-muted-dark">
                        Reviewer Notes
                      </label>
                      <div className="flex items-center gap-2">
                        {notes.trim() && (
                          <button
                            type="button"
                            onClick={handleSaveTemplate}
                            className="flex items-center gap-1 text-[10px] text-brand-cyan/70 hover:text-brand-cyan transition-colors"
                            title="Save as template"
                          >
                            <Bookmark className="h-2.5 w-2.5" />
                            Save template
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      ref={notesRef}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes... (press Enter to submit with current action)"
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-dark/50 focus:border-brand-cyan/30 focus:outline-none"
                    />
                    <NoteTemplatePicker
                      templates={templates}
                      onSelect={handleSelectTemplate}
                      onDelete={handleDeleteTemplate}
                    />
                  </div>
                )}

                {/* Full action buttons (expanded view) */}
                {isPending && (
                  <div className="flex flex-wrap items-center gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.kind}
                          onClick={() => void handleResolve(action.status, action.prefillNotes ? notes : undefined)}
                          disabled={resolving}
                          className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium transition-all disabled:opacity-50 ${action.className}`}
                        >
                          {resolving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Icon className="h-3 w-3" />
                          )}
                          {action.label}
                        </button>
                      );
                    })}
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
    </div>
  );
}

const REVIEW_SHORTCUTS = [
  { label: "Approve", key: "A" },
  { label: "Reject", key: "R" },
  { label: "Focus notes", key: "N" },
  { label: "Next review", key: "J" },
  { label: "Previous review", key: "K" },
];

// ---------------------------------------------------------------------------
// Escalation Policy Settings
// ---------------------------------------------------------------------------

const ACTION_OPTIONS: { value: EscalationAction; label: string }[] = [
  { value: "escalate", label: "Escalate" },
  { value: "auto_approve", label: "Auto-approve" },
  { value: "none", label: "Disabled" },
];

function EscalationSettingsPanel({
  policy,
  enabled,
  onPolicyChange,
  onEnabledChange,
}: {
  policy: EscalationPolicy;
  enabled: boolean;
  onPolicyChange: (p: EscalationPolicy) => void;
  onEnabledChange: (v: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const updateRule = (severity: ReviewSeverity, field: "slaMinutes" | "action", value: number | EscalationAction) => {
    onPolicyChange({
      ...policy,
      [severity]: { ...policy[severity], [field]: value },
    });
  };

  return (
    <motion.div variants={fadeUp} className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
      >
        <Settings2 className="h-3.5 w-3.5 text-brand-cyan" />
        <span className="text-xs font-medium text-foreground">Escalation Policy</span>
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
          enabled
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-white/[0.04] text-muted-dark border border-white/[0.06]"
        }`}>
          {enabled ? "Active" : "Off"}
        </span>
        <ChevronDown className={`ml-auto h-3.5 w-3.5 text-muted-dark transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Enable auto-escalation</p>
                  <p className="text-[11px] text-muted-dark mt-0.5">
                    Automatically escalate or auto-approve reviews when SLA expires
                  </p>
                </div>
                <button
                  onClick={() => onEnabledChange(!enabled)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    enabled ? "bg-brand-cyan" : "bg-white/[0.1]"
                  }`}
                >
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    enabled ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              {/* Per-severity rules */}
              <div className="space-y-2">
                {(["critical", "warning", "info"] as ReviewSeverity[]).map((sev) => {
                  const cfg = severityConfig[sev];
                  const SevIcon = cfg.icon;
                  const rule = policy[sev];
                  return (
                    <div key={sev} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                      <SevIcon className={`h-3.5 w-3.5 flex-shrink-0 ${cfg.color}`} />
                      <span className="text-xs font-medium text-foreground w-16 capitalize">{sev}</span>

                      <label className="flex items-center gap-1.5 text-[11px] text-muted">
                        SLA
                        <input
                          type="number"
                          min={1}
                          max={1440}
                          value={rule.slaMinutes}
                          onChange={(e) => updateRule(sev, "slaMinutes", Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 rounded border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[11px] text-foreground focus:border-brand-cyan/30 focus:outline-none"
                        />
                        min
                      </label>

                      <select
                        value={rule.action}
                        onChange={(e) => updateRule(sev, "action", e.target.value as EscalationAction)}
                        className="ml-auto rounded border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[11px] text-foreground focus:border-brand-cyan/30 focus:outline-none"
                      >
                        {ACTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-muted-dark">
                <strong>Escalate</strong> marks reviews as escalated (webhook in production).{" "}
                <strong>Auto-approve</strong> resolves low-risk items automatically.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AuditLogPanel({ reviews }: { reviews: ManualReviewItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const analytics = useMemo(() => computeAuditAnalytics(reviews), [reviews]);

  if (analytics.totalResolved === 0) return null;

  const approvalRate = analytics.totalResolved > 0
    ? Math.round((analytics.approved / analytics.totalResolved) * 100)
    : 0;

  return (
    <motion.div variants={fadeUp} className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
      >
        <ScrollText className="h-4 w-4 text-brand-cyan" />
        <span className="text-sm font-medium text-foreground">Audit Log & Analytics</span>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-muted">
          {analytics.totalResolved} resolved
        </span>
        <ChevronDown
          className={`ml-auto h-4 w-4 text-muted-dark transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-dark">
                    <BarChart3 className="h-3 w-3" />
                    Total Resolved
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground">{analytics.totalResolved}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-dark">
                    <TrendingUp className="h-3 w-3" />
                    Approval Rate
                  </div>
                  <p className="mt-1 text-lg font-semibold text-emerald-400">{approvalRate}%</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-dark">
                    <Check className="h-3 w-3" />
                    Approved
                  </div>
                  <p className="mt-1 text-lg font-semibold text-emerald-400">{analytics.approved}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-dark">
                    <X className="h-3 w-3" />
                    Rejected
                  </div>
                  <p className="mt-1 text-lg font-semibold text-red-400">{analytics.rejected}</p>
                </div>
              </div>

              {/* Time-to-decision by severity */}
              <GlowCard accent="cyan" className="p-4">
                <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-dark mb-3">
                  <Clock className="h-3.5 w-3.5" />
                  Avg. Time-to-Decision by Severity
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(["critical", "warning", "info"] as ReviewSeverity[]).map((sev) => {
                    const cfg = severityConfig[sev];
                    const SevIcon = cfg.icon;
                    const avgMs = analytics.avgTimeBySeverity[sev];
                    return (
                      <div key={sev} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <SevIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-dark">{sev}</p>
                          <p className="text-sm font-semibold text-foreground">
                            {avgMs != null ? formatDuration(avgMs) : "--"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlowCard>

              {/* Per-agent ratios */}
              {analytics.ratioByAgent.length > 0 && (
                <GlowCard accent="cyan" className="p-4">
                  <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-dark mb-3">
                    <Users className="h-3.5 w-3.5" />
                    Decision Ratios by Agent
                  </h3>
                  <div className="space-y-2">
                    {analytics.ratioByAgent.map((agent) => {
                      const approvedPct = agent.total > 0 ? (agent.approved / agent.total) * 100 : 0;
                      return (
                        <div key={agent.name} className="flex items-center gap-3">
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: agent.color }}
                          />
                          <span className="text-xs text-foreground w-28 truncate">{agent.name}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500/60"
                              style={{ width: `${approvedPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted tabular-nums w-20 text-right">
                            {agent.approved}A / {agent.rejected}R
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </GlowCard>
              )}

              {/* Volume trend */}
              {analytics.volumeByDay.length > 1 && (
                <GlowCard accent="cyan" className="p-4">
                  <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-dark mb-3">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Review Volume (Last 14 Days)
                  </h3>
                  <div className="flex items-end gap-1 h-20">
                    {analytics.volumeByDay.map((day) => {
                      const total = day.approved + day.rejected;
                      const maxTotal = Math.max(...analytics.volumeByDay.map((d) => d.approved + d.rejected), 1);
                      const height = (total / maxTotal) * 100;
                      const approvedHeight = total > 0 ? (day.approved / total) * height : 0;
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col justify-end gap-px"
                          title={`${day.date}: ${day.approved} approved, ${day.rejected} rejected`}
                        >
                          <div
                            className="w-full rounded-t bg-emerald-500/50"
                            style={{ height: `${approvedHeight}%` }}
                          />
                          <div
                            className="w-full rounded-b bg-red-500/50"
                            style={{ height: `${height - approvedHeight}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1.5 text-[9px] text-muted-dark">
                    <span>{analytics.volumeByDay[0]?.date.slice(5)}</span>
                    <span>{analytics.volumeByDay[analytics.volumeByDay.length - 1]?.date.slice(5)}</span>
                  </div>
                </GlowCard>
              )}

              {/* Recent audit entries */}
              <GlowCard accent="cyan" className="p-4">
                <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-dark mb-3">
                  <ScrollText className="h-3.5 w-3.5" />
                  Recent Audit Entries
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-wider text-muted-dark">
                        <th className="pb-2 pr-3 font-medium">Decision</th>
                        <th className="pb-2 pr-3 font-medium">Agent</th>
                        <th className="pb-2 pr-3 font-medium">Severity</th>
                        <th className="pb-2 pr-3 font-medium">Content</th>
                        <th className="pb-2 pr-3 font-medium">Resolved By</th>
                        <th className="pb-2 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {analytics.recentEntries.map((entry) => (
                        <tr key={entry.id} className="text-muted">
                          <td className="py-2 pr-3">
                            <StatusBadge status={entry.status} />
                          </td>
                          <td className="py-2 pr-3">
                            <span className="truncate max-w-[100px] inline-block text-foreground">
                              {entry.personaName ?? "Unknown"}
                            </span>
                          </td>
                          <td className="py-2 pr-3">
                            <span className={severityConfig[entry.severity].color}>
                              {entry.severity}
                            </span>
                          </td>
                          <td className="py-2 pr-3">
                            <span className="truncate max-w-[200px] inline-block">
                              {entry.content.split("\n")[0].slice(0, 60)}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-foreground">
                            {entry.resolvedBy ?? "--"}
                          </td>
                          <td className="py-2 whitespace-nowrap text-muted-dark">
                            {entry.resolvedAt ? relativeTime(entry.resolvedAt) : "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {analytics.recentEntries.length === 0 && (
                  <p className="text-center text-[11px] text-muted-dark py-4">No audit entries yet</p>
                )}
              </GlowCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ReviewsPage() {
  const reviews = useReviewStore((s) => s.reviews);
  const reviewsLoading = useReviewStore((s) => s.reviewsLoading);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const escalationPolicy = useReviewStore((s) => s.escalationPolicy);
  const escalationEnabled = useReviewStore((s) => s.escalationEnabled);
  const setEscalationPolicy = useReviewStore((s) => s.setEscalationPolicy);
  const setEscalationEnabled = useReviewStore((s) => s.setEscalationEnabled);
  const checkEscalations = useReviewStore((s) => s.checkEscalations);
  const [filter, setFilter] = useState("all");
  const gridRef = useRef<HTMLDivElement>(null);
  const [resolvedThisSession, setResolvedThisSession] = useState(0);
  const prevPendingRef = useRef<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  usePolling(fetchReviews, 15_000, true);

  // Auto-escalation check every 30s
  useEffect(() => {
    if (!escalationEnabled) return;
    const id = setInterval(checkEscalations, 30_000);
    // Run immediately on mount/enable
    checkEscalations();
    return () => clearInterval(id);
  }, [escalationEnabled, checkEscalations]);

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

  // Track reviews resolved this session
  useEffect(() => {
    if (prevPendingRef.current !== null && counts.pending < prevPendingRef.current) {
      setResolvedThisSession((prev) => prev + (prevPendingRef.current! - counts.pending));
    }
    prevPendingRef.current = counts.pending;
  }, [counts.pending]);

  const {
    selectedIds,
    clearSelection,
    toggleSelect,
    selectAll,
    bulkResolving,
    bulkProgress,
    pendingInFiltered,
    handleBulkAction,
    showRejectConfirm,
    setShowRejectConfirm,
    handleBulkRejectConfirm,
    undoState,
    handleUndo,
    handleUndoExpire,
  } = useReviewBulkActions(filtered);

  // Clear selection on filter change
  useEffect(() => {
    clearSelection();
    setFocusedIndex(-1);
  }, [filter, clearSelection]);

  // Global keyboard navigation (j/k to move between cards)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "j") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "k") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered.length]);

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

      <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex items-center gap-3">
          <ShortcutHint shortcuts={REVIEW_SHORTCUTS} />
          {reviewsLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />
          )}
        </div>
      </motion.div>

      {/* Escalation policy settings */}
      <EscalationSettingsPanel
        policy={escalationPolicy}
        enabled={escalationEnabled}
        onPolicyChange={setEscalationPolicy}
        onEnabledChange={setEscalationEnabled}
      />

      {/* Reviews list */}
      <motion.div variants={fadeUp}>
        {filtered.length === 0 ? (
          counts.pending === 0 && resolvedThisSession > 0 ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <CheckCheck className="h-7 w-7 text-emerald-400" />
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 blur-xl" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                All caught up!
              </h3>
              <p className="mt-1.5 text-sm font-medium text-emerald-400/80">
                {resolvedThisSession} review{resolvedThisSession !== 1 ? "s" : ""} resolved
              </p>
              <p className="mt-1 text-xs text-muted-dark">
                New review requests will appear here
              </p>
            </motion.div>
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No reviews"
              description="Manual review requests from agents will appear here"
            />
          )
        ) : (
          <div ref={gridRef} className="flex flex-col gap-3">
            {filtered.map((review, idx) => (
              <ReviewCard
                key={review.id}
                review={review}
                selected={selectedIds.has(review.id)}
                onSelect={toggleSelect}
                focused={focusedIndex === idx}
                onFocusRequest={() => setFocusedIndex(idx)}
                escalationPolicy={escalationPolicy}
                escalationEnabled={escalationEnabled}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Audit log & analytics */}
      <AuditLogPanel reviews={reviews} />

      {/* Bulk actions */}
      <AnimatePresence>
        {(selectedIds.size > 0 || bulkProgress) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-background/95 backdrop-blur-xl pb-safe"
          >
            {bulkProgress && (
              <div className="h-1 w-full bg-white/[0.04]">
                <motion.div
                  className="h-full bg-brand-cyan/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            )}
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                {bulkProgress ? (
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-cyan" />
                    {bulkProgress.done} of {bulkProgress.total} resolved
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-foreground">
                      {selectedIds.size} selected
                    </span>
                    <button
                      onClick={selectAll}
                      className="text-xs text-brand-cyan hover:underline"
                    >
                      Select all ({pendingInFiltered.length})
                    </button>
                    <button
                      onClick={clearSelection}
                      className="text-xs text-muted-dark hover:text-muted"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
              {!bulkProgress && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction("approved")}
                    disabled={bulkResolving}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Approve All
                  </button>
                  <button
                    onClick={() => handleBulkAction("rejected")}
                    disabled={bulkResolving}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject All
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk reject confirmation dialog */}
      <ConfirmDialog
        open={showRejectConfirm}
        title="Reject selected reviews?"
        confirmLabel={`Reject ${selectedIds.size} review${selectedIds.size !== 1 ? "s" : ""}`}
        onConfirm={handleBulkRejectConfirm}
        onCancel={() => setShowRejectConfirm(false)}
      >
        <p>
          This will reject <strong className="text-foreground">{selectedIds.size}</strong>{" "}
          selected review{selectedIds.size !== 1 ? "s" : ""}. Rejected reviews
          cannot be re-queued for agent processing.
        </p>
      </ConfirmDialog>

      {/* Undo toast */}
      <AnimatePresence>
        {undoState && (
          <UndoToast
            message={undoState.message}
            durationMs={5000}
            onUndo={handleUndo}
            onExpire={handleUndoExpire}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
