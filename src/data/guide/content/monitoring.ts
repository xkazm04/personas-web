export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## The Monitoring Dashboard

The Overview page is your command center for everything happening across your agents. The Dashboard tab opens by default and shows a grid of KpiTiles — one tile per metric (success rate, total runs, total cost, average duration, active agents, failures-today, etc.). Each tile has three density modes (compact / standard / detail) that you switch by clicking the tile; useful when you want a quick number vs. when you want the trend chart and breakdown.

Below the KpiTiles, the Overview surfaces live activity, recent failures, and notifications you've subscribed to. Everything on this page is filterable by agent, by group, and by time range — the same filter set applies across every panel so you can scope the whole dashboard to "this week, just my Marketing agents" in one click.

| Panel | What it shows |
|---------|--------------|
| **KpiTiles** | Success rate, runs, cost, duration, failure count, active agents — each at three density levels |
| **Activity feed** | Live stream of executions across all agents, scrollable, searchable, click to detail |
| **Notifications** | Subscribed alerts (failures, budget caps, manual review, anomalies) with click-through to the offending run |
| **Health snapshot** | Per-agent health roll-up — quick scan for anything yellow or red |

### How It Works

The Overview page reads from the same execution and event store the rest of the app uses, so what you see is always the live state. Filters and density preferences persist across sessions; you set them once and the dashboard remembers. Click any KpiTile to drill into a per-agent breakdown, click any activity row to open the execution detail modal.

:::tip
The title-bar notification bell is a one-click shortcut from anywhere in the app to the freshest execution detail. You don't need to navigate to Overview manually for routine "what just happened?" checks.
:::
  `,

  "execution-logs": `
## Execution Logs

Every agent run produces an execution log: trigger payload, rendered prompt sent to the model, model response, every tool call (with arguments and result), final output, duration, cost, and any errors. Logs are immutable — they're written once and preserved indefinitely. The Activity tab (per-agent on the editor, or global on Overview) is the entry point.

Each log entry is a one-line summary in the list; clicking opens the full detail modal with all the fields above. From there you can copy any field, replay the run with the same input, or jump to the related trace view for step-by-step debugging.

### Key Points

- **Complete capture** — input, prompt, response, tool calls (with parameters and results), output, duration, cost, errors
- **Immutable history** — logs never change after the run completes; if the agent's prompt is edited later, old runs still show what was sent at the time
- **Replay from any run** — re-runs the agent with the original input; useful for verifying a fix on a previously-failing payload
- **Tagged by trigger** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\`, etc., so you can filter activity by source
- **Manual-review marker** — runs that the agent itself flagged for review (via the \`manual_review\` directive) get a badge so you can find them quickly

### How It Works

The execution store is local SQLite, written transactionally as the run progresses. The trace tab inside the detail modal expands each step into its sub-events (model token stream, tool call dispatched, tool result received, decision branch taken). Filter by date range, agent, trigger type, status, business_outcome, or full-text on the input/output.

:::tip
When an agent produces unexpected output, the trace tab — not the output — is where the answer lives. Look for the tool call that returned wrong data, or the model decision that branched the wrong way. The output is the symptom; the trace is the cause.
:::
  `,

  "real-time-activity-feed": `
## Real-Time Activity Feed

The activity feed shows you what's happening right now across all your agents. As each agent processes its task, updates appear in real time — it's like watching a live scoreboard. You see results the moment they happen without refreshing or checking individual agents.

This is especially useful when you have many agents running simultaneously or when you want to watch a critical automation as it executes.

### Key Points

- **Live updates** — see agent activity as it happens, no refreshing needed
- **All agents** — one feed covers every running agent in your setup
- **Timestamped entries** — each update shows exactly when it occurred
- **Status changes** — see when agents start, finish, succeed, or fail in real time

### How It Works

Open the activity feed from the monitoring dashboard or the sidebar. Updates stream in automatically as your agents work. Each entry shows the agent name, action, timestamp, and result. Click any entry — or the notification bell in the title bar — to open the full execution detail modal directly on the Overview › Activity tab, where you can see the trace, the rendered prompt, the input, the output, and any errors. The feed itself is scrollable and searchable.

:::tip
Keep the activity feed open in a side panel while testing new agents. Watching the live output helps you spot issues immediately and iterate faster. For everyday use, the title-bar notification bell is the fastest path — it always opens the freshest execution detail without you having to navigate.
:::
  `,

  "cost-tracking-per-agent": `
## Cost Tracking per Agent

Every AI provider charges per token, and Personas tags every run with the exact token count, model, and provider so per-agent cost is always known. Overview → Usage shows a sortable list of every agent with its cost over the selected time window — day, week, month, or custom range — plus trend arrows so you can see at a glance which agents' costs are climbing.

Drill into any row for a breakdown: cost-per-run distribution (median vs. p95), cost by model when the agent has failover configured, total tokens (input vs. output), and a trend chart over time. If an agent's cost is creeping up, this is the first place that surfaces it.

### Key Points

- **Per-agent breakdown** — every run is attributed to its agent
- **Filterable time windows** — today, this week, this month, all time, or custom range
- **Cost-per-run distribution** — median, p95, max; reveals if one expensive outlier is dominating the total
- **Token breakdown** — input vs. output tokens so you can tell if the agent is reading a lot or producing a lot
- **Trend arrows** — week-over-week change shown next to each agent, so cost regressions surface immediately

### How It Works

The cost meter ticks live during a run as tokens stream in. When the run completes, the final cost is finalized and persisted alongside the execution log. The Usage view aggregates from this store, so changing the time-range filter just re-queries the same data — no separate "cost accounting" job is running.

:::tip
If a single agent dominates your costs, the per-run distribution is more useful than the total. A high median means the prompt is consistently expensive (look at the prompt size and tool-call count). A high p95 with normal median means rare outliers (look at unusual inputs in the trace history).
:::
  `,

  "cost-tracking-per-model": `
## Cost Tracking per Model

Different models have very different price points — Claude Haiku is ~30× cheaper than Opus per token, GPT-4o-mini is ~20× cheaper than GPT-4o, and local models cost essentially nothing per token (just compute). The per-model view on Overview → Usage breaks down spending by provider and model so you can see where the money goes and whether the spend matches the value.

:::feature
**Smart Optimization Hints** color=#34d399
The system tags runs that look like they could have run on a cheaper model with similar quality. When a high-cost model is used for a task pattern that the cheaper model handles fine elsewhere, the hint surfaces alongside the cost row — pointing you at candidate agents to A-B in the Lab.
:::

### Key Points

- **By provider and model** — cost split out by exact model identifier (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Calls, tokens, cost** — three views of the same data; cost is what you pay, tokens is what you spend, calls is how often you call
- **Cost-per-call comparison** — same metric across models so you can compare like-for-like
- **Optimization hints** — surfaces candidate agents that could be downgraded; click into Lab to A-B test
- **Per-agent attribution** — drill into a model row to see which agents are using it most

### How It Works

The Usage view groups the same execution records as the per-agent view but on the model dimension instead. Pricing is configured per-model in Settings → Engine, with defaults matching each provider's public pricing; you can override if you have a negotiated rate or are using BYOI on a cheaper endpoint.

:::tip
Once a month, scan the per-model view sorted by total cost. The top entry is your biggest opportunity for savings — drop it into the Lab arena against the next cheaper model and see if quality holds. Most agents tolerate a model downgrade fine; the ones that don't are the ones genuinely worth the spend.
:::
  `,

  "success-rate-metrics": `
## Success Rate Metrics

Every run finishes with a status: success, failure, or manual-review. Success rate is the percentage of runs that completed successfully against a backdrop of expected behavior. The Overview → Health tab and the per-agent Activity tab both surface success rate with a trend indicator — week-over-week change — so you can see at a glance whether reliability is holding.

The metric goes beyond pure success/failure now. With **business_outcome** tracking, the agent itself can declare whether a successful run produced the outcome you actually wanted (a sale, an approved doc, a useful summary) — a separate signal from "did the run complete without errors". Success rate splits into "completed cleanly" and "produced the desired business outcome" — the second one is the more useful number for most agents.

### Key Points

- **Per-agent success rate** with trend arrow
- **Business-outcome rate** — separate from clean-completion rate; tracks whether the agent's work was actually useful
- **Per-trigger split** — same agent might succeed at 99% on manual runs but 70% on scheduled runs; the breakdown shows you which trigger source has issues
- **Threshold alerts** — set a threshold per agent; you're notified when the rate drops below it
- **Failure reason classification** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\`, etc., so you can see *why* runs are failing

### How It Works

The Health tab aggregates run statuses over a rolling window per agent. Business-outcome tracking requires the agent to emit a \`business_outcome\` directive in its output (most templates that need it do so by default; custom agents can add it explicitly). Threshold alerts are configured per agent and fire through the same notification channels the agent is set up with.

:::tip
Set a 90% threshold on every production agent. The alert won't tell you why an agent is failing, but it'll tell you something is. The failure-reason classification on the Health tab is where you go next to diagnose.
:::
  `,

  "execution-tracing": `
## Execution Tracing

Tracing is the per-run step-by-step record of what the agent did. Open any execution from the Activity feed and click the Trace tab: you'll see every event in chronological order — model token-streaming start and end, every tool invocation with arguments, every tool result, every decision branch in a chained agent, the rendered prompt, the output. Each step is expandable for full detail.

For chained pipelines, the trace spans multiple agents — the lineage canvas (Events → Lineage) shows the cross-agent view while the per-run trace shows the within-agent detail. Together they let you debug both "where did this pipeline break?" and "what did the agent decide step-by-step?".

### Key Points

- **Chronological** — every event with timestamp and duration
- **Expandable per step** — click any step for full input/output of that step
- **Per-step duration** — see which step is slow; usually a tool call or a long model response
- **Chained traces** — when an agent is triggered by a chain, the trace links back to the upstream agent so you can navigate the pipeline
- **Token-by-token** for the model — useful for slow-streaming providers where the user is waiting

### How It Works

Each execution writes events to the trace store as it runs; the trace tab queries that store and renders the timeline. Token-level events are sampled at a rate that keeps the trace usable even for long responses (a 10k-token response might capture 500 sampled events rather than 10k). For tool-use loops, every iteration of the model/tool round-trip is captured.

:::tip
Use the trace to confirm what the model *actually* received. The biggest source of "the agent did something weird" bugs is the model getting different input than you expected — usually because of a tool result that didn't look like what the agent's prompt assumed.
:::
  `,

  "performance-trends": `
## Performance Trends

Trends are the long view of agent behavior — success rate, cost, duration, output quality (where measured) plotted over time so you can see the impact of changes you make. Overview → Trends gives you the chart view; you pick the agent(s) and metric(s) and the date range, and the charts render.

The most useful pattern is "before vs. after": you changed an agent's prompt on March 5, did things get better or worse? The trends view answers that in seconds — the lines you care about go up or down at the date you made the change.

### Key Points

- **Multiple metrics on one chart** — overlay success rate, cost, duration, business-outcome rate
- **Multi-agent overlay** — compare the same metric across multiple agents on one chart
- **Custom date ranges** — zoom from "this hour" to "all time"
- **Annotations** — significant events (prompt version saves, settings changes, credential rotations) are pinned to the timeline so you can correlate
- **Export** — chart data exports to CSV if you want to do your own analysis

### How It Works

Trends aggregate from the same execution and trace store as the rest of the monitoring views — same data, different visualization. Annotations are auto-generated from the version history and configuration history so you don't have to manually mark "I made a change here"; the system already knows.

:::tip
After any meaningful change to an agent (prompt revision, model swap, new tool), check the trends a week later. Most prompt changes that "felt better in testing" produce measurably different metrics; the chart confirms it (or invalidates your gut).
:::
  `,

  "setting-budget-limits": `
## Setting Budget Limits

Budget limits cap AI spending at the agent level and the global level. Set a per-run budget (this single execution can't cost more than $X), a per-day budget (this agent can't spend more than $Y per day across all runs), or a global cap across all agents. When a limit is reached, the affected agent pauses cleanly — the partial run is captured in the trace, no charge persists past the cap, and a notification fires.

This is one of the most underrated features for unattended agents. A scheduled or webhook-triggered agent without a budget cap could rack up unexpected costs overnight if a prompt or input does something pathological. Budget caps mean the worst case is bounded by what you decided ahead of time, not by what an errant model run can do.

### Key Points

- **Per-run cap** — hard limit on a single execution
- **Per-day / per-week / per-month cap** — windowed spending limit per agent
- **Global cap** — across-all-agents limit; useful as a safety net even when each agent has its own cap
- **Graceful stop** — agents stop cleanly at the cap; partial trace is preserved
- **Notifications** — every cap-hit notifies you so you can decide whether to raise the cap or fix the underlying prompt
- **Soft warnings** — optional pre-cap thresholds (e.g. "warn at 80%") so you know an agent is heading toward a cap

### How It Works

Caps are configured on the agent's Settings tab (per-run, per-window) or in Settings → Engine → Budget (global). The execution engine tracks live cost during the run; when the cost crosses the cap, the engine aborts the run via the same path as a timeout. The aborted state is preserved in the trace with reason \`budget_exceeded\`.

:::warning
Always set at least a per-day cap for any agent triggered automatically (schedule, webhook, file watcher, chain). Without one, a pathological input or a model loop could spend an unbounded amount before you notice. The cap is your safety net.
:::

:::tip
Start with caps about 3x what you expect a typical day to cost. Tight enough to catch runaways, loose enough that normal variance doesn't trip the cap. Adjust after a week of real data.
:::
  `,

  "anomaly-detection": `
## Anomaly Detection

Anomaly detection compares every new run against the agent's recent baseline and flags runs that look unusual. The baseline is built per-agent: typical duration, typical cost, typical output length, typical tool-call count. A new run that deviates significantly on any of these gets flagged with a reason — "duration 5× normal", "cost spike", "tool-call count anomalous", "output unusually short".

This catches a class of problems pure success/failure metrics miss: the run completed, but something was wrong. The agent took five minutes when it usually takes thirty seconds. The output is three sentences when it's usually three paragraphs. The cost doubled with no change in input. These are signals worth seeing before they become trends.

### Key Points

- **Multi-signal baseline** — duration, cost, output size, tool-call count, failure rate
- **Per-agent baselines** — each agent has its own normal; what's anomalous for one is normal for another
- **Reason-tagged alerts** — the alert names which signal deviated and by how much
- **Low noise** — calibrated to surface genuine outliers, not normal variance
- **Integrates with notifications** — anomalies fire through whichever notification channels the agent is configured with

### How It Works

The baseline is a rolling window of recent runs (configurable; default 50). Each new run is scored on each signal; if any signal crosses the configured threshold (default 3 standard deviations from the rolling mean), the run is flagged and an anomaly event is emitted. Anomaly events show up on Overview → Notifications and in the Health tab for that agent.

:::tip
Anomalies that you investigate and resolve should be cleared (mark them "investigated"). The baseline excludes investigated anomalies from its rolling window, so the system doesn't drift toward considering the anomalous run "normal".
:::
  `,
};
