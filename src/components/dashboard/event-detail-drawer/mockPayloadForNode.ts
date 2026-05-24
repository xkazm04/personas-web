import type { SwarmNode } from "@/lib/mock-dashboard-data";

export function mockPayloadForNode(node: SwarmNode): string {
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
