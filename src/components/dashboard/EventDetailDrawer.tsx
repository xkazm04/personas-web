"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Clock, Timer, Tag } from "lucide-react";
import { type SwarmNode, EVENT_TYPES } from "@/lib/mock-dashboard-data";
import { highlightJson } from "@/components/dashboard/JsonViewer";

// ── Mock payload generator ────────────────────────────────────────────

function mockPayloadForNode(node: SwarmNode): string {
  if (node.type === "source") {
    const payloads: Record<string, object> = {
      s_github: {
        action: "pull_request.opened",
        repository: "personas-ai/core",
        sender: "dependabot[bot]",
        pull_request: { number: 347, title: "Bump axios from 1.6.2 to 1.7.0", additions: 4, deletions: 4 },
      },
      s_slack: {
        type: "message",
        channel: "#eng-alerts",
        user: "U04QAHKL9",
        text: "Deploy v2.3.1 failed on staging",
        ts: "1709812345.000200",
      },
      s_webhook: {
        event: "invoice.paid",
        data: { id: "inv_1MtDN6", amount: 4200, currency: "usd", customer: "cus_Na6dX7" },
      },
      s_cron: {
        schedule: "0 */6 * * *",
        job: "sync_analytics",
        next_run: new Date(Date.now() + 21600_000).toISOString(),
      },
      s_api: {
        method: "POST",
        path: "/v1/agents/execute",
        body: { persona_id: "p_research", task: "Summarize Q1 metrics" },
      },
      s_email: {
        from: "alerts@monitoring.io",
        subject: "CPU usage exceeded threshold",
        body_preview: "Instance i-0a1b2c3d reached 94% CPU utilization...",
      },
    };
    return JSON.stringify(payloads[node.id] ?? { source: node.label, event: "generic" }, null, 2);
  }

  const payloads: Record<string, object> = {
    p_research: {
      action: "research_complete",
      results: 12,
      sources_checked: 47,
      confidence: 0.92,
      summary: "Found 12 relevant papers on multi-agent orchestration...",
    },
    p_notify: {
      channels_notified: ["#eng-alerts", "#ops"],
      message: "Deploy v2.3.1 recovered successfully",
      severity: "info",
    },
    p_code: {
      review_status: "approved",
      files_reviewed: 3,
      comments: 1,
      suggestion: "Consider extracting retry logic into shared util",
    },
    p_data: {
      rows_processed: 14_820,
      transform: "csv_to_parquet",
      duration_ms: 2340,
      output_size_bytes: 892_441,
    },
    p_report: {
      report_type: "weekly_summary",
      sections: ["cost_analysis", "performance", "anomalies"],
      pages: 4,
      format: "pdf",
    },
  };
  return JSON.stringify(payloads[node.id] ?? { persona: node.label, status: "idle" }, null, 2);
}

// ── Component ─────────────────────────────────────────────────────────

interface EventDetailDrawerProps {
  node: SwarmNode | null;
  onClose: () => void;
}

export default function EventDetailDrawer({ node, onClose }: EventDetailDrawerProps) {
  const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const durationMs = Math.floor(200 + Math.random() * 4800);
  const timestamp = new Date(Date.now() - Math.floor(Math.random() * 3600_000)).toISOString();

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/[0.06] bg-[#0c0c0e]/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c0e]/80 px-5 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {node.icon && (
                  <span className="text-lg">{node.icon}</span>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {node.label}
                  </h3>
                  <p className="text-[11px] text-muted-dark capitalize">
                    {node.type} node
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-dark transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* Flow direction */}
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px]"
                    style={{
                      backgroundColor: `${node.color}15`,
                      border: `1px solid ${node.color}30`,
                    }}
                  >
                    {node.icon || (node.type === "source" ? "S" : "P")}
                  </span>
                  <span className="font-medium text-foreground">{node.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-dark" />
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-mono text-cyan-400">
                    BUS
                  </span>
                  <span className="text-muted">Event Bus</span>
                </div>
              </div>

              {/* Event type badge */}
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-dark">
                  Event Type
                </label>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-mono text-cyan-400">
                  <Tag className="h-3 w-3" />
                  {eventType}
                </span>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-dark">
                    <Clock className="h-3 w-3" />
                    Timestamp
                  </div>
                  <p className="mt-1 text-xs font-mono text-foreground">
                    {new Date(timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-[10px] text-muted-dark">
                    {new Date(timestamp).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-dark">
                    <Timer className="h-3 w-3" />
                    Duration
                  </div>
                  <p className="mt-1 text-xs font-mono text-foreground">
                    {durationMs.toLocaleString()}ms
                  </p>
                  <p className="text-[10px] text-muted-dark">
                    {durationMs < 500 ? "Fast" : durationMs < 2000 ? "Normal" : "Slow"}
                  </p>
                </div>
              </div>

              {/* Volume indicator */}
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-dark">
                  Traffic Volume
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${node.volume * 100}%`,
                        backgroundColor: node.color,
                        boxShadow: `0 0 8px ${node.color}40`,
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums font-mono text-muted">
                    {Math.round(node.volume * 100)}%
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-dark">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs font-medium text-emerald-400">Active</span>
                </div>
              </div>

              {/* Payload */}
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-dark">
                  Sample Payload
                </label>
                <div className="relative max-h-64 overflow-auto rounded-xl bg-[#0a0a0a] p-4 border border-white/[0.08] shadow-inner">
                  <pre className="font-mono text-[11px] leading-relaxed text-white/30 whitespace-pre-wrap break-all">
                    {highlightJson(mockPayloadForNode(node))}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
