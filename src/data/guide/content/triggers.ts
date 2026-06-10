export const content: Record<string, string> = {
  "how-triggers-work": `
## How Triggers Work

Triggers are the "when" of your agent. The prompt and tools define *what* the agent does; the trigger defines *when* and *with what input*. Personas ships seven trigger types: **manual** (click a button), **schedule** (cron-style), **webhook** (inbound HTTP), **clipboard** (copy event match), **file watcher** (filesystem events), **chain** (output of another agent), and **event-based** (internal events emitted by other agents, plugins, or the engine itself).

Each agent can have any number of triggers, mixed across types. A single agent might run on a daily schedule, react to a webhook from Stripe, fire when you copy an email address, and be chainable from upstream agents — all at once.

### Trigger Types

:::compare
**Manual**
Button click in the editor or from the title-bar quick-run. Every agent gets this by default. Best for testing and ad-hoc invocations.
---
**Schedule**
Cron-based. Hourly, daily, weekly, or full cron expression with timezone. Best for routine work that runs without input — daily summaries, weekly reports.
---
**Webhook**
A unique inbound URL the agent listens on. External services POST to it to start the agent. Best for "react to event from third-party service".
---
**Clipboard**
Fires when copied text matches a configured pattern (regex, content type, or keyword). Best for power-user shortcuts — copy an email, an agent looks it up.
---
**File Watcher**
Filesystem events on a watched folder (create / modify / delete). Best for drop-zone workflows where files arrive at unpredictable times.
---
**Chain**
The output of agent A becomes the input of agent B. Best for multi-step pipelines composed of focused agents.
---
**Event-Based**
Subscribes to internal Personas events (a credential expired, a plugin emitted an event, an execution finished with manual_review). Best for reactive automations within your own setup.
:::

### Key Points

- **Multiple triggers per agent** — no upper bound; combine types freely
- **Independent firing** — each trigger evaluates on its own; a schedule trigger doesn't know or care about a webhook trigger on the same agent
- **Per-trigger filtering** — each trigger can have its own filter conditions (e.g. webhook trigger only fires on \`event_type=charge.succeeded\`)
- **Trigger lineage** — the Lineage canvas (Events → Live Stream → Lineage) shows which triggers, which agents, and which events are connected, end-to-end across your whole setup
- **Pause individually** — disable a single trigger without touching the rest of the agent

### How It Works

Triggers are configured on the agent's Settings tab or by adding them from the trigger list on the Events page. The execution engine evaluates trigger conditions independently and dispatches a run to the agent whenever any trigger matches. The run carries the trigger payload (webhook body, file path, copied text, upstream output, event data) into the agent as input.

:::tip
Start every agent with just a Manual trigger. Once you trust its behavior, add automatic triggers one at a time so you can isolate which one introduces a problem if anything goes wrong.
:::
  `,

  "manual-triggers": `
## Manual Triggers

Manual triggers are the default for every agent. Click \`Run\` in the editor and the agent starts immediately, or use the title-bar quick-run shortcut (\`Ctrl+Enter\` on the focused agent). Manual runs are how you develop and test — they're the equivalent of running a script directly to see what it does before adding a cron entry.

You can pass custom input each time. The agent editor shows a small input field next to the Run button when the agent declares it accepts input; whatever you type goes through as the trigger payload.

### Key Points

- **No configuration** — manual triggers are always available
- **Optional input** — type input directly, paste structured JSON, or run with no input for agents that don't need one
- **Diagnostic runs** — manual runs are tagged \`manual\` in the trace so you can filter them out of cost / metrics reports if you want to see only automatic activity
- **Concurrency-aware** — manual runs respect the agent's concurrency limit; if the limit is reached, the click is rejected with a clear message

### How It Works

Manual triggers exist implicitly on every agent — there's no toggle to turn them off (use \`Disable\` on the whole agent if you want to lock it out). The engine treats a manual run identically to an automated one: same execution path, same trace capture, same cost accounting. The only difference is the trigger tag.

:::tip
Use manual runs during prompt iteration. Save the prompt, run, look at the trace, edit. The Lab arena is for systematic comparison; manual is for fast feedback in the editor.
:::
  `,

  "schedule-triggers": `
## Schedule Triggers

Schedule triggers run an agent on a recurring cadence — every hour, every weekday at 8am, the first Monday of the month, or any cron expression you can write. The schedule UI gives you preset shortcuts (hourly, daily, weekly) for common cases, and a raw cron field for everything else.

Schedules respect a configurable timezone. By default the agent uses your system timezone, but you can override per-trigger — useful for agents that have to run "at 9am Eastern" regardless of where you're sitting.

### Key Points

- **Presets and cron** — pick from common cadences or write the full cron expression
- **Timezone per trigger** — IANA timezone names (\`America/New_York\`, \`Europe/Prague\`, \`UTC\`); DST is handled automatically
- **Next-run preview** — the trigger shows the next three scheduled times so you can sanity-check your cron expression
- **Pause without losing** — disabling a schedule trigger doesn't delete it; re-enable to resume
- **Past and future in one view** — the Schedules timeline opens with a "Last 24 hours" section (every run that already fired, with status, duration, and a one-click jump to its trace) above the upcoming buckets, so you can audit what happened overnight without leaving the page
- **Usage-limit aware** — when a scheduled run fails because the Claude usage window is exhausted, it isn't silently lost: the engine schedules an automatic retry for when the limit resets (shown as an "auto-retry" badge on the failed run) and the retry survives app restarts. Weekly caps stay failed with a clear notice, since they're too far out to wait on

### Setting Up a Schedule

:::steps
1. **Open trigger settings** — on the agent's Settings tab, or from the Events page; click \`Add trigger\` and pick Schedule
2. **Pick a preset or write a cron** — \`0 8 * * 1-5\` for "8am weekdays", or use a preset for common cases
3. **Set the timezone** — defaults to system; change for agents tied to a specific business calendar
4. **Confirm the next-run preview** — three upcoming run times are shown; verify they match what you expect
5. **Save** — the trigger arms immediately and shows up in the agent's trigger list with a "next run" countdown
:::

:::tip
Schedule triggers do not back-fill missed runs. If the app is closed or the machine is asleep when a scheduled time passes, that run is skipped. For mission-critical scheduled work, run the cloud deploy (Builder tier) so the orchestrator handles scheduling server-side.
:::
  `,

  "webhook-triggers": `
## Webhook Triggers

Webhook triggers expose a unique inbound URL the agent listens on. When an external service POSTs to that URL, the body becomes the trigger payload and the agent runs. Most third-party services that support webhooks (Stripe, GitHub, Shopify, Linear, Twilio, custom internal APIs) work without modification.

The trigger supports filtering on the request body, headers, and method so a single endpoint can be selective about which events actually start the agent. Common pattern: one webhook URL per agent, filtered to specific event types from the upstream service.

### Key Points

- **Unique URL per trigger** — generated automatically; never shared between agents or triggers
- **Filter expressions** — JSONPath / header matches let you accept only the events you care about
- **Replay endpoint** — every received webhook is preserved and can be re-played manually from the trigger detail page
- **Send Test** — built-in button that POSTs sample payloads against your local endpoint so you can validate filters and the agent's response without the external service
- **Inbound and outbound are separate** — see below

### Connecting a Webhook

:::steps
1. **Add a webhook trigger** — Events page → Add trigger → Webhook; bind it to the agent
2. **Copy the generated URL** — unique to this trigger; never expires unless you delete the trigger
3. **Configure the external service** — paste the URL into the service's webhook configuration (Stripe Dashboard, GitHub repo settings, etc.)
4. **Set filter expressions** — restrict to specific event types or payload shapes so you don't run the agent on every event the service emits
5. **Test** — use Send Test with a sample payload (or trigger a real event in the upstream service); inspect the trace and adjust filters if needed
:::

### Inbound vs Outbound Webhooks

Webhooks come in two flavors and it's worth keeping them straight:

- **Inbound webhooks (this topic)** — an external service calls *you* to start an agent. Stripe pings you when a charge succeeds; GitHub pings you when a PR opens.
- **Outbound webhooks (a separate feature)** — *your* agent sends its result out to a channel after it finishes. Personas ships first-class outbound delivery to Slack, Discord, Microsoft Teams, and generic webhook URLs, configured per-agent in the Connectors tab. The agent's output gets formatted appropriately for each channel (rich Slack blocks, Discord embeds, Teams cards) and dispatched once the run completes.

Most automations end up using both: an inbound webhook starts the agent, the agent does its work, and an outbound channel delivers the result to wherever your team is watching.

:::tip
For local dev or pre-production webhooks, use the \`Send Test\` button with a sample payload rather than configuring the real upstream. You'll iterate on filters and prompts much faster without round-tripping the third-party service.
:::
  `,

  "clipboard-monitor": `
## Clipboard Monitor

The clipboard monitor watches your system clipboard and fires the agent when copied content matches your rules. Copy an order number — the agent looks it up. Copy a foreign-language sentence — the agent translates it. Copy a customer email — the agent pulls their account.

Matching can be on simple keywords, regex patterns, or content type heuristics (email address, URL, phone number, JSON-shaped, number, structured ID). The trigger evaluates the rule on every clipboard change and only fires when a rule matches, so it sits silently in the background until you actually copy something interesting.

### Key Points

- **Rule-based** — define one or more rules per trigger; first match wins
- **Match modes** — keyword, regex, or built-in content-type heuristics (email/URL/phone/JSON/etc.)
- **Quiet by default** — non-matching copies don't even trigger an evaluation log; only matches create activity
- **Output modes** — show as a desktop notification, push to the Cockpit inbox, or stay silent and just write to the agent's activity feed
- **Privacy** — clipboard content stays local; nothing is uploaded except to whatever AI provider the agent itself calls

### How It Works

The trigger registers with the OS clipboard system on app start. When the clipboard changes, the new content is evaluated against each rule on this trigger; first match fires the agent with the copied content as input. Non-matching copies are dropped without leaving a trace, so the monitor doesn't bloat the activity log.

:::tip
Be specific with rules. A clipboard monitor matching every \`@\` symbol will fire on copies you didn't mean to use. Use full email regex, or scope to "copies that look like a customer ID" (matching your own ID shape).
:::
  `,

  "file-watcher-triggers": `
## File Watcher Triggers

File-watcher triggers fire when files appear, change, or disappear in a folder you've designated. Drop a CSV into a folder and an agent processes it. Save an image to a "Process" directory and an OCR / classification agent acts on it. Modify a config file and an agent diffs it against the previous version.

Watched folders can be on the local filesystem or any synced location (OneDrive, Dropbox, iCloud). Filters narrow events by file type / glob pattern so you don't run the agent on irrelevant changes (like macOS \`.DS_Store\` files or temporary editor swap files).

### Key Points

- **Watch any folder** — local or synced cloud storage; subfolder recursion optional
- **Event types** — create / modify / delete; subscribe to one, two, or all three
- **Glob filters** — \`*.csv\`, \`**/invoices/*.pdf\`; supports negation patterns
- **Debounce** — successive rapid modifications coalesce into one trigger event (no double-firing for save-and-immediately-save flows)
- **Payload** — agent receives the file path and (when the file is small enough) the contents inline; otherwise a path the agent can read with its file-access tool

### How It Works

The trigger uses OS-native file-watch APIs (FSEvents on macOS, ReadDirectoryChangesW on Windows, inotify on Linux). The watcher runs in the engine process while the app is open. When an event matches the trigger's filter, the engine dispatches an agent run with the file metadata as input. The engine also routes file-watcher events into the **ambient producer**: any agent subscribed to the relevant ambient event can react without needing its own watcher.

:::tip
Create a dedicated drop-zone folder for each agent that uses a file watcher. Mixing watchers on shared folders ("Downloads", "Desktop") leads to surprise fires when you save unrelated files there.
:::
  `,

  "chain-triggers": `
## Chain Triggers

Chain triggers connect agents end-to-end: when agent A finishes successfully, agent B starts with A's output as its input. This is how multi-step automations are built — each agent is small and focused, the chain stitches them into a pipeline.

Chains can branch (one agent's output feeds multiple downstream agents) and converge (multiple upstream agents feed into one downstream). They can also be conditional — the trigger can have a filter that only forwards output matching a condition, so you only run the downstream agent in the cases that matter.

:::diagram
[Research Agent] --> [Writing Agent] --> [Formatting Agent] --> [Final Output]
:::

### Key Points

- **Output → input wiring** — automatic; the downstream agent's prompt sees the upstream output verbatim (or transformed if you configure a transformer)
- **Branch and converge** — many-to-one and one-to-many chains are supported
- **Conditional forwarding** — filter expressions on the chain trigger let you forward only on certain conditions (output contains "error", or a field exceeds a threshold)
- **Failure stops the chain** — if an upstream agent fails, downstream chained agents don't run; the failure surfaces in the lineage view so you can see exactly where the chain broke
- **Visible end-to-end** — the Events → Live Stream → Lineage canvas shows the full graph of chained agents and live execution flow

### How It Works

On the downstream agent's Settings tab, add a Chain trigger and pick the upstream agent. The engine subscribes the downstream agent to the upstream's completion event; when the upstream emits "execution complete with success", the engine forwards the output as input to the downstream. Conditional filters are evaluated server-side before the downstream run is dispatched.

:::tip
Each agent in a chain should do exactly one thing well. A chain of three small focused agents is much easier to debug than one big do-everything agent — you can see at the lineage view which stage failed, and you can swap an agent for a better version without touching the rest of the chain.
:::
  `,

  "event-based-triggers": `
## Event-Based Triggers

Event-based triggers subscribe an agent to internal Personas events. Anything in the app that emits an event — another agent finishing, a credential expiring, a plugin firing (like the Drive plugin emitting \`drive.document.*\` events when files change in the Local Drive), or the engine itself flagging a manual-review case — can drive a subscribed agent.

This is the most flexible trigger type. Unlike webhooks (which come from external systems) or schedules (which fire on the clock), events come from inside your own Personas setup. Build event-driven setups where one signal can fan out to multiple agents without explicit wiring.

### Key Points

- **Subscribe to any event** — agent-completion events, plugin events, engine events, custom events emitted by other agents
- **Payload-aware** — each event carries data (the agent's output, the file path, the credential ID); the subscribed agent receives it as input
- **One-to-many** — multiple agents can subscribe to the same event and all run in parallel when it fires
- **Filter expressions** — restrict by payload fields (only fire on events where \`severity = critical\`)
- **Discoverable** — the event registry is browsable in the Events page; you can see exactly what events are available and what fields they carry

### How It Works

Add an Event trigger to the downstream agent and pick the event from the registry. The engine subscribes the agent at boot and dispatches a run with the event payload whenever the matching event fires. Plugin-emitted events look identical to engine-emitted ones from the agent's perspective — they all flow through the same bus.

:::tip
Event-based triggers are how you build "if X then also Y" relationships without changing X. Add an event trigger on a new agent, point it at an event another agent emits, and the new behavior happens reactively — the existing agent doesn't know or care.
:::
  `,

  "combining-multiple-triggers": `
## Combining Multiple Triggers

An agent can have any number of triggers of any types. Most production agents have at least two: a manual trigger (for testing and ad-hoc invocation) plus one or more automatic triggers (schedule, webhook, chain, event). It's common to see an agent with a schedule + webhook + chain combo — the same agent can run as part of a daily batch, in response to a real-time webhook, and as a step in a chained pipeline.

Multiple triggers don't interfere. Each fires on its own schedule or event; if two trigger at the same instant the agent runs twice (concurrency-limit permitting). Each run's trace captures which trigger started it.

### Key Points

- **No upper limit** — an agent can have dozens of triggers
- **Independent evaluation** — each trigger evaluates and dispatches independently
- **Per-trigger filtering and configuration** — schedules have their own cron, webhooks their own URL, etc.
- **Trigger tag in trace** — every run is tagged with the trigger that started it, so you can filter activity by trigger source
- **Selective disable** — disable a single trigger without touching the rest

### How It Works

The Settings → Triggers tab on the agent shows every attached trigger, its status (enabled/disabled), and its last fire time. Add new ones with \`Add trigger\`; the same picker lets you create any of the seven trigger types. Disabled triggers stay in the list so you can re-enable them later without re-configuring.

:::tip
A useful pattern: keep a Manual trigger active forever (for debugging), and pair each "real" automatic trigger with a sibling Manual trigger that takes the same input shape. That way you can replay any automated payload manually whenever you want to investigate.
:::
  `,

  "testing-and-debugging-triggers": `
## Testing and Debugging Triggers

The Events → Test tab is the trigger tester. For any trigger you can send a sample payload (webhook body, file event, clipboard string, event data) and see exactly what the agent would receive and how it would respond — without the external service or the wait for the actual trigger time.

For triggers that did fire and the agent didn't run the way you expected, the trigger log shows every evaluation: matched filters, rejected ones, payload shape, dispatch time. The lineage canvas (Events → Live Stream → Lineage) is the visual equivalent — it shows live trigger evaluations and dispatches across your whole setup.

### Key Points

- **Simulate any trigger** — paste a payload and see the agent's response
- **Trigger log** — every fire attempt is recorded, including filter rejections so you can see what didn't match
- **Lineage canvas** — visual graph of triggers, agents, and events with live flow indicators when things are firing
- **Send Test for webhooks** — built-in button that POSTs a sample body against the local endpoint
- **Replay** — past trigger fires can be re-played with the exact original payload, useful for "what happens if this Stripe webhook hits the agent again"

### Debugging a Trigger Step by Step

:::steps
1. **Confirm the trigger is enabled** — Settings → Triggers tab on the agent; a muted icon means the trigger is disabled
2. **Check the trigger log** — Events → Test → Logs filtered by your trigger; look for evaluations that didn't dispatch
3. **Inspect filters against the payload** — if the trigger evaluated but didn't dispatch, a filter expression is rejecting it; copy the payload and test the filter explicitly
4. **Verify the dispatch reached the agent** — execution trace should show the trigger tag; if no execution appeared, the trigger never dispatched (filter problem, concurrency limit, or disabled agent)
5. **Use the lineage canvas** — for chain or event triggers, open Lineage and trace the path; you'll see where flow is interrupted
:::

:::tip
"My trigger isn't firing" almost always means one of: the trigger is disabled, a filter is too strict, the agent is disabled, or the external service isn't actually sending what you think it's sending. The trigger log distinguishes all four within a minute.
:::
  `,
};
