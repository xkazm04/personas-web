export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## The Monitoring Dashboard

The Overview page is your command center for everything happening across your agents. The Mission control tab opens by default and shows a grid of KpiTiles — one tile per metric (success rate, total runs, total cost, average duration, active agents, failures-today, etc.). Each tile has three density modes (compact / standard / detail) that you switch by clicking the tile; useful when you want a quick number vs. when you want the trend chart and breakdown.

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

  "the-director": `
## The Director — Automatic Agent Coaching

The **Director** is a built-in meta-agent that watches your other agents and coaches them toward being genuinely useful. Instead of you reading every run, the Director reviews them for you and leaves a verdict.

You choose what it watches by **starring** agents (the ⭐ on each row of All Agents). A starred agent is "in the Director's scope" — the Director reviews it; unstarred agents are left alone. The Director itself is a system agent and can't be deleted.

### The command center

The Director lives under **Overview › Director** — one focused screen:

- A **portfolio scorecard**: how much of your fleet's work actually delivered value, the average verdict score, your cost per value-delivered run, and a 0–5 distribution showing how your starred agents stack up.
- A **coaching table** of every agent in scope — score, a trend sparkline (is coaching moving the needle?), value rate, last review, and **attention tags** that flag exactly what to act on (awaiting first review, low score, declining, stale). Filter to just the agents that need attention. Click any agent to open its **detail** — full verdict history with the reasoning and concrete suggestions behind each score.
- A thin header with **Review all in scope**, an **Add to scope** picker, and the long-term-**memory** toggle.

The All Agents page keeps a slim Director strip that links straight here.

### What a verdict looks like

Every review produces an overall **0–5 score** plus optional coaching notes:

- The **Verdict** column in the Activity list shows the score as stars, right next to the agent — a glance tells you which runs earned their cost.
- The **Director** tab on any run opens the full assessment in readable markdown: the score, a one-line summary, and specific suggestions (a prompt tweak, a guardrail, a model-tier change, a missing tool).
- Actionable notes also land in your review queue, where approving or rejecting them teaches the Director your taste over time.

A healthy agent scores high with little or no coaching — the Director stays quiet when there's nothing to improve.

### Long-term memory (optional)

If you use the **Obsidian Brain**, you can switch on the Director's long-term memory. It then reads its own past notes about an agent before each review (so advice compounds instead of repeating) and writes each new verdict back into a \`Director/\` folder in your vault — a durable, human-readable coaching history.

### Why It Matters

Raw counts (runs, cost, success rate) tell you *what* happened, not *whether it was worth it*. The Director adds the missing judgment layer — an honest, evidence-based read on each agent's value and efficiency — so a fleet of agents stays useful without you auditing every run by hand.
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

  "tracking-goals": `
## Tracking Goals

Goals are the outcome layer above individual runs. Instead of watching executions tick by, you define what you're trying to accomplish — and let progress roll up automatically from the work your team and your agents are doing.

A goal has a title, an optional target date, a status, and a progress percentage. Status follows a simple four-value model: **open** (not started), **in-progress** (being worked), **blocked** (waiting on something), and **done**. Progress is hybrid: the system computes a suggestion from the goal's checklist items, sub-goals, and linked team-assignment steps — and shows it to you as an **Accept / edit** nudge. You decide; a manual override always wins.

### Three Views

Goals lives under the Teams section and offers three surfaces, switched via the sidebar:

- **Board** — a kanban organized by status. Cards show the full goal title and an inline checklist (the first few to-dos as toggleable checkboxes, the rest behind a "+N more" link). When a goal has to-dos, completing them drives progress — the bar moves as items are checked off.
- **Map** — a pan-and-zoom canvas showing how goals relate to each other. Dependency edges (blocks, follows) connect goals into a directed graph. **Now** highlighting (an amber pulsing ring) marks goals currently in progress; **Next** highlighting (a blue ring) marks goals whose blockers are all done and are ready to start. Zoom out to see the constellation; zoom in for full metadata on each node.
- **Timeline** — goals on a vertical due-date rail, bucketed by urgency: Overdue, This week, This month, Later, No date.

### The Key Move: Hand to Your AI Team

The detail drawer for any goal has a **Hand to your AI team** control. Pressing it turns the goal into a running team assignment linked back to the goal. The team decomposes the goal into steps (or picks up the existing to-dos verbatim), works them one by one, and ticks progress automatically as each step completes. The goal moves from open to in-progress to done on its own — and only surfaces in your review queue when a step genuinely needs a human decision.

:::tip
You don't have to hand a goal to your team immediately. Use the Board to build out the checklist manually first — the team then picks up each to-do item in order, which gives you fine-grained control over what gets worked and in what sequence.
:::
  `,

  "measuring-outcomes-with-kpis": `
## Measuring Outcomes with KPIs

KPIs are the number layer above goals. Where a goal describes an outcome you want to reach, a KPI tracks whether you're actually getting there — a current value, a target, and a pace read that tells you whether you're on course.

Each KPI shows its current value versus its target with a **pace** status: **on-track**, **off-track**, **met**, or **unmeasured** (when a measurement hasn't been taken yet). A progress bar and measurement freshness indicator round out the card at a glance.

### Four Measurement Kinds

KPIs aren't all measured the same way. Personas supports four measurement kinds, each suited to a different data source:

:::info
- **Codebase** — runs a command against your repository and parses the result. Useful for things like test coverage percentage or lint error count that live entirely in the code.
- **Derived** — reads from the orchestrator's own data: run counts, outcome rates, cost trends, and similar operational metrics that Personas already tracks.
- **Connector** — pulls a value from a connected external service (analytics, traffic, error tracking). If the needed connector isn't in your vault yet, the KPI card shows a "Connect \<service\>" prompt that links directly to the credential catalog.
- **Manual** — you enter the value yourself. Useful for business numbers that don't live in any system you've connected, or for KPIs you want to track informally before automating measurement.
:::

### Where KPIs Live

**Teams › KPIs** has two views behind a segmented switch. The **Dashboard** view shows all active KPIs as cards — click any card to open the detail drawer with the full measurement history, a sparkline, and a manual value entry field. The **Proposals** view is a review queue: clicking "Scan for KPIs" runs a headless analysis pass over your project's context map and existing KPIs, and surfaces proposed KPIs with a one-line rationale and the exact measurement procedure it would use. You accept (optionally adjusting the target first) or reject. Rejected proposals are archived and fed back to future scans as negative examples so the same suggestion doesn't come back.

:::tip
Let the scan propose KPIs before you author them manually. It reads your project's context map, your existing goals, and your vault's connector roster — and tends to suggest measurements that are actually automatable with what you already have connected.
:::
  `,

  "director-verdicts-and-categories": `
## Director Verdicts and Categories

Every Director review produces a structured verdict — not just a pass/fail, but a layered assessment that tells you what an agent is doing well, what needs coaching, and how to file that coaching so it actually sticks.

The mandatory piece is an **overall 0–5 score** with a one-line summary. This score lands on the execution record and shows up as stars in the Activity list — so a quick scan of any agent's recent runs tells you which ones earned their cost. The score also drives the trend sparkline in the Agents table: a short history bar colored by the most recent rating.

### What's Working

The review doesn't lead with criticism. Before any coaching notes, the Director calls out the things the agent is genuinely doing right — what the docs call **wins**. These appear at the top of the full assessment markdown as a "What's working" section. An agent that's performing well might get nothing but wins; the Director stays quiet when there's nothing to improve.

### Coaching Notes and Categories

After the wins come the coaching notes: specific, actionable suggestions filed under one of six **categories**:

- **Prompt** — the agent's instructions or framing need tuning
- **Health** — reliability or error-handling issues
- **Triggers** — how and when the agent fires (schedule, webhook, chain setup)
- **Credentials** — vault or permission gaps blocking the agent
- **Memory** — what the agent is storing and recalling (or failing to)
- **Usefulness** — whether the agent's output is actually valuable for its stated purpose

Coaching notes land in your **review queue** as items you approve or reject. This isn't just housekeeping: approving or rejecting notes teaches the Director your taste. The next review reads back which notes you accepted and which you dismissed, so the feedback loop compounds — the Director gets better at knowing what you care about for each agent, and stops suggesting things you've already ruled out.

The Director's command center includes an **Issues by category** rollup that tallies coaching notes across your whole fleet, so you can see at a portfolio level whether credential gaps are your most common issue or whether prompt quality is where most agents need attention.

:::tip
Healthy agents score high and generate few or no coaching notes. If an agent consistently earns a 4–5 with no pending review items, that's the signal to leave it alone and focus attention on the ones with declining trends or low scores.
:::
  `,

  "director-momentum-and-stale-sweep": `
## Director Momentum and Stale Sweep

Beyond individual verdicts, the Director builds a portfolio-level picture of how your whole fleet is trending. This is the longitudinal view — not "what did this agent do last run" but "is coaching actually moving the needle across your agents over time?"

### The Scorecard

The Director's command center opens with a **scorecard** that answers four questions at a glance: what fraction of your fleet's work delivered value (the **value-delivered rate**), what's the average verdict score across all in-scope agents, what's the **cost per useful run**, and how many agents are currently in scope. Below the headline KPIs, a **value breakdown** bar decomposes the value-delivered rate into the full outcome taxonomy — delivered, partial, blocked, no-input, unassessed — so you can see where value is leaking, not just whether it is.

A **0–5 score distribution** chart shows how your starred agents stack up across the full rating scale, with a dashed line marking the portfolio average. A review-period selector (7 / 30 / 90 days) scopes the entire scorecard.

### Momentum

The **momentum** strip answers the most important portfolio question: are things getting better? It tallies how many agents **improved**, **held steady**, or **slipped** versus their previous review. An improving fleet means coaching is working; a slipping fleet means something systemic needs attention — model changes, credential drift, prompt decay.

### Attention Tags and Triage

The coaching table flags every in-scope agent with **attention tags** based on client-derived rules: awaiting first review (never been assessed), low score (≤ 2), declining trend, or stale review (not coached in more than 14 days). An attention triage bar at the top of the table rolls these flags up — N new, N low, N declining, N stale — so you see the scope of the problem before you start working through it.

Clicking a triage chip filters the table to that flag. Once filtered, a **Review these N** action runs the Director sequentially over exactly those agents — triage flows directly into action.

### The Stale Sweep

The **Stale sweep** button re-reviews every starred agent that hasn't been coached in more than 14 days, in one click. It only appears when stale agents exist. This is the routine maintenance pass: run it once a month and the Director catches any agent that's drifted since its last assessment.

### Long-Term Memory

With the **Obsidian Brain** enabled, the Director reads its own past notes about an agent before each review and writes the new verdict back to a \`Director/\` folder in your vault. Coaching compounds instead of repeating — the Director doesn't re-suggest things it already covered, and it builds on what you approved and rejected over time.

:::tip
The stale sweep and the attention triage bar are the two fastest ways to keep a large fleet healthy without spending time on agents that are already doing well. Use the triage bar to find the agents that actually need attention; use the stale sweep to make sure nothing is quietly slipping unreviewed.
:::
  `,
};
