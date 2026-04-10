export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## The Monitoring Dashboard

The monitoring dashboard is your command center for all agent activity. At a glance, you can see which agents are running, recent results, key metrics, and any issues that need attention. It's like a flight control tower — everything you need to know, organized on one screen.

You don't need to check agents individually. The dashboard aggregates the most important information so you can stay on top of your entire setup in seconds.

### Key Points

- **Running agents** — see which agents are currently active with live progress indicators
- **Recent results** — quick view of the latest execution outcomes
- **Key metrics** — success rates, costs, and performance at a glance
- **Alerts** — any issues or warnings that need your attention are surfaced at the top

### How It Works

Open the \`Monitoring\` section from the sidebar. The dashboard loads with real-time data organized into sections: active runs at the top, recent results in the middle, and metrics at the bottom. Click any item to drill down into details. The dashboard refreshes automatically so you're always seeing the latest information.

> **Tip:** Start your day with a quick look at the monitoring dashboard. A 30-second check tells you if everything is running smoothly or if something needs your attention.
  `,

  "execution-logs": `
## Execution Logs

Every time an agent runs, a detailed log is created. The log records what the agent did, what it produced, how long it took, and how much it cost. When something goes wrong — or when something goes especially well — the execution log is the first place to look.

Logs are like a detailed receipt for every agent run. They give you full transparency into your agents' behavior.

### Key Points

- **Complete record** of every agent run with timestamps
- **Input and output** — see exactly what the agent received and what it produced
- **Duration and cost** — know how long it took and what it cost
- **Error details** — if something failed, the log explains why

### How It Works

Navigate to \`Monitoring > Logs\` or click on a specific agent to see its log history. Each entry shows a summary line — click to expand and see full details including the exact input, complete output, any tool calls made, and the total cost. You can filter logs by date, agent, or status.

> **Tip:** When an agent produces unexpected results, check the log to see the full input it received. Often, the issue is in the input data, not the agent's instructions.
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

Open the activity feed from the monitoring dashboard or the sidebar. Updates stream in automatically as your agents work. Each entry shows the agent name, action, timestamp, and result. Click any entry to jump to the full execution details. The feed is scrollable and searchable.

> **Tip:** Keep the activity feed open in a side panel while testing new agents. Watching the live output helps you spot issues immediately and iterate faster.
  `,

  "cost-tracking-per-agent": `
## Cost Tracking per Agent

Every AI call has a small cost, and the per-agent view breaks this down so there are no surprises. You can see exactly how much each agent has spent over any time period — today, this week, this month, or all time. This helps you identify which agents are budget-friendly and which ones might need optimization.

Understanding costs per agent lets you make smart decisions about model selection, frequency, and budget allocation.

### Key Points

- **Per-agent breakdown** — see spending for each individual agent
- **Time periods** — filter by day, week, month, or custom date range
- **Cost trends** — see if an agent's costs are increasing or decreasing over time
- **Per-run cost** — know exactly how much each individual execution costs

### How It Works

Go to \`Monitoring > Costs\` and select the per-agent view. You'll see a list of all agents sorted by spending. Click any agent to see its cost breakdown by time period, model used, and number of runs. Charts show trends so you can spot cost increases early.

> **Tip:** If an agent is costing more than expected, try switching it to a smaller or cheaper AI model. Many tasks don't need the most powerful model to produce great results.
  `,

  "cost-tracking-per-model": `
## Cost Tracking per Model

Different AI models charge different rates, and the per-model view shows you where your money goes across all providers. You might discover that most of your spending is on one model, or that switching a few agents to a cheaper alternative could save you significantly without any loss in quality.

This view is essential for optimizing your overall AI spending.

### Key Points

- **Model comparison** — see how much you're spending on each AI provider and model
- **Usage breakdown** — how many tokens, calls, or minutes each model consumed
- **Cost efficiency** — compare cost-per-task across different models
- **Optimization hints** — the system suggests where cheaper models might work just as well

### How It Works

Go to \`Monitoring > Costs\` and select the per-model view. You'll see a breakdown of spending by AI provider and model. Each row shows total cost, number of calls, average cost per call, and a trend indicator. The system highlights models where a cheaper alternative might produce similar results.

> **Tip:** Run your most expensive agents through Arena testing with cheaper models. You might find that a model at half the price produces results that are 95% as good.
  `,

  "success-rate-metrics": `
## Success Rate Metrics

Success rates tell you how reliable each agent is — expressed as a simple percentage. If an agent has a 95% success rate, it completes its task correctly 19 out of 20 times. If that rate drops, it's a clear signal that something needs your attention.

Tracking success rates over time helps you maintain high-quality automation and catch problems before they become patterns.

### Key Points

- **Simple percentage** for each agent showing how often it succeeds
- **Trend tracking** — see if reliability is improving or declining
- **Threshold alerts** — get notified when a success rate drops below a level you set
- **Per-trigger breakdown** — see if certain triggers produce different success rates

### How It Works

Open \`Monitoring > Metrics\` to see success rates for all your agents. Each agent shows its current rate and a trend arrow (up, down, or stable). Click any agent to see detailed metrics including success rate by time period, by trigger type, and by input characteristics.

> **Tip:** Set a threshold alert for any agent below 90%. This way you're automatically notified when an agent needs attention rather than discovering problems after the fact.
  `,

  "execution-tracing": `
## Execution Tracing

Tracing shows you the step-by-step path of a complex agent run. Every decision the agent made, every tool it used, every piece of data it processed — all laid out in chronological order. It's like a detailed travel log that shows exactly how your agent arrived at its result.

This is invaluable for understanding complex agent behavior, verifying that agents follow your instructions correctly, and diagnosing subtle issues that don't show up in simple logs.

### Key Points

- **Step-by-step path** — see every action in the order it happened
- **Tool usage** — which tools were called, with what parameters, and what they returned
- **Decision points** — understand why the agent chose one path over another
- **Timing breakdown** — see how long each step took

### How It Works

Open an execution log and click the \`Trace\` tab. You'll see a timeline of every step the agent took, from reading the input to producing the final output. Each step is expandable — click to see the full details including tool calls, intermediate results, and timing.

> **Tip:** Use tracing when your agent produces correct results but you want to understand *how* it got there. This insight often reveals opportunities to make the agent faster or more reliable.
  `,

  "performance-trends": `
## Performance Trends

Trend charts give you a bird's-eye view of how your agents' performance changes over time. Speed, cost, and success rates are plotted on visual charts so you can spot improvements and regressions at a glance. Instead of checking individual runs, you see the bigger picture.

This long-term perspective helps you celebrate wins (your agent is getting faster!), catch problems early (costs are creeping up), and measure the impact of changes you make.

### Key Points

- **Visual charts** — line graphs showing performance over days, weeks, or months
- **Multiple metrics** — speed, cost, success rate, and more on the same timeline
- **Before/after comparison** — see the impact of prompt changes or model switches
- **Agent comparison** — overlay trends from different agents on one chart

### How It Works

Open \`Monitoring > Trends\` and select the metrics and agents you want to track. Charts render automatically with data points for each time period. Hover over any point to see exact numbers. Use the date range selector to zoom in on specific periods or zoom out for the full picture.

> **Tip:** Check trends after making changes to an agent. If you updated a prompt last Tuesday, look at the trend starting from that date to see if it actually improved things.
  `,

  "setting-budget-limits": `
## Setting Budget Limits

Budget limits keep your AI spending under control. Set a daily, weekly, or monthly cap, and your agents will pause when they reach the limit. It's like setting a spending limit on a credit card — you stay in full control of your costs and are never surprised by an unexpected bill.

This is especially important when agents run automatically on schedules or triggers, where you might not be watching every execution.

### Key Points

- **Daily, weekly, or monthly** caps — choose the timeframe that works for you
- **Per-agent limits** — set different budgets for different agents
- **Global limit** — set an overall cap across all agents combined
- **Graceful pause** — agents stop cleanly when the budget is reached, no data lost

### How It Works

Go to \`Settings > Budget\` and set your limits. You can set a global limit that covers all agents, individual limits per agent, or both. When a limit is reached, affected agents pause and you receive a notification. You can increase the limit or wait for the next period to begin.

> **Tip:** Start with a conservative daily limit and increase it gradually as you understand your typical usage patterns. It's much easier to raise a limit than to undo overspending.
  `,

  "anomaly-detection": `
## Anomaly Detection

Anomaly detection watches your agents and alerts you when something unusual happens. The system learns what's "normal" for each agent — typical run times, usual costs, expected success rates — and flags anything that deviates significantly. It's like having a watchful assistant who taps you on the shoulder when something seems off.

This catches problems you might not notice on your own, especially when you have many agents running automatically.

### Key Points

- **Automatic baseline** — the system learns what's normal for each agent
- **Instant alerts** — get notified when behavior deviates significantly
- **Multiple signals** — monitors cost, speed, error rates, and output patterns
- **Low noise** — designed to alert on genuine anomalies, not minor variations

### How It Works

Anomaly detection runs automatically in the background. As your agents execute, the system builds a profile of normal behavior for each one. When a run falls significantly outside that profile — a sudden cost spike, an unusual failure, or a run that takes five times longer than normal — you receive an alert with details about what's unusual.

> **Tip:** Don't dismiss anomaly alerts, even if everything seems fine on the surface. They often catch the early signs of problems — like a slowly expiring credential or a degrading AI model — before they cause real failures.
  `,
};
