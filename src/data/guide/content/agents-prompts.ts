export const content: Record<string, string> = {
  "creating-a-new-agent": `
## Creating a New Agent

You have two ways to create a new agent. **From scratch** — click \`Create Agent\`, name it, and write instructions yourself. **From a template** — browse the template gallery, pick one that matches what you want to do (invoice processing, daily reports, social posting…), answer a few short questions about your specific use case, and let the build engine assemble the agent for you. Most people start with a template and tweak from there.

Either way, you'll pick a name and icon, select which AI model powers the agent, and choose which tools (email, web search, file access, etc.) it can use. None of these choices are permanent — you can change any setting later.

:::steps
1. **Click Create Agent** — from the sidebar or home screen
2. **Pick a path** — start blank, or pick a template from the gallery
3. **Answer the build questions** — if you went the template route; the build engine adapts the agent to your answers
4. **Name your agent** — and choose an icon
5. **Adjust the prompt and tools** — fine-tune the instructions the template produced (or write them from scratch)
6. **Promote when ready** — the agent moves from draft to active once you confirm
:::

### How It Works

The template path runs an interactive build session: the engine asks clarifying questions about your use case, proposes parameters (input shape, output channels, schedule cadence), and shows a live preview of the agent it's about to assemble. You approve at the end, and the agent lands ready to test. The from-scratch path skips all that — useful when you already know exactly what you want the agent to do.

:::tip
Good agent names describe the task, not the technology. "Morning Email Summary" is more useful than "GPT Agent 3."
:::
  `,

  "writing-effective-prompts": `
## Writing Effective Prompts

A prompt is the set of instructions you give your agent. Good prompts are specific, concrete, and ordered: define the agent's role, state the task, describe the input shape, specify the output format, and call out edge cases. Vague prompts produce vague output — "summarize my emails" works much worse than "read my five most recent unread emails and write a two-sentence summary of each, ordered by sender importance."

The build engine helps you here. When you adopt a template, the engine asks clarifying questions in batches per capability (input source, output channel, format, frequency) and weaves your answers into a structured prompt. If you write from scratch, you're doing that weaving yourself — but the same five inputs are what produce reliable agents.

### Prompt Quality Checklist

:::checklist
- Define the role — "You are an X that does Y." Anchors the model's behavior.
- State the task concretely — verbs, counts, time windows. Avoid "help me with…"
- Describe the input — what shape, what fields, what the agent should ignore
- Specify the output — bullets vs. paragraphs vs. JSON, with field names if structured
- Handle edge cases — what to do when input is empty, malformed, or unexpected
- Use examples — even one input/output pair dramatically improves consistency
:::

### How It Works

Every run constructs the prompt from your stored template, the trigger payload, and any agent memory the model is allowed to consult. The model sees the same prompt you wrote (in the order you wrote it) plus the input — what comes back is its honest attempt to follow your instructions. The trace tab in the execution detail shows the exact prompt that was sent, so when output drifts you can see whether the prompt or the input is at fault.

:::tip
Write the prompt as if briefing a smart but brand-new contractor. Assume nothing. The first time the agent produces output, look at the trace and ask: "would a human contractor have understood what I wanted from this prompt?"
:::
  `,

  "simple-vs-structured-prompt-mode": `
## Simple vs Structured Prompt Mode

The prompt editor offers two modes. **Simple mode** is a single freeform text box — you type the prompt as one block of prose. Fast for small or experimental agents. **Structured mode** breaks the prompt into five named sections (Identity, Instructions, Tools, Examples, Error Handling) so you can think about each concern separately and edit one without affecting the others.

You can switch between modes at any time without losing work. The editor parses simple-mode prose into structured sections when you switch up, and concatenates structured sections back into a single block when you switch down.

:::compare
**Simple Mode**
Single text box. Free-form prose. Fast to draft, fast to iterate. Best for experimentation and personal agents where you're the only reader.
---
**Structured Mode** [recommended for shared/production agents]
Five named sections — Identity, Instructions, Tools, Examples, Error Handling. Slower to draft but easier to maintain. Each section can be reviewed and changed independently, which matters when you (or someone else) revisits the agent months later.
:::

:::info
Both modes produce the same prompt under the hood at runtime. Structured mode is a UX overlay that helps you organize your thinking; the model sees the rendered prompt either way.
:::

### How It Works

Switching modes is non-destructive: the editor stores the structured representation internally, and simple-mode is a flattened view of it. The version history preserves whichever mode you saved in, so restoring an old version brings back the mode it was authored in too.

:::tip
Start in simple mode while you're figuring out what the agent should do. Once you're happy with the behavior, switch to structured mode for the long-term — it pays off the first time you need to tweak just the Examples section without re-reading the whole prompt.
:::
  `,

  "structured-prompt-sections-explained": `
## Structured Prompt Sections Explained

Structured mode splits the prompt into five sections. Each one has a specific job, and the build engine uses the same five buckets when it generates prompts from templates — so the sections aren't a UI quirk, they're a stable contract between your authoring and how the model sees the agent.

### The Five Sections

:::diagram
[Identity] --> [Instructions] --> [Tools] --> [Examples] --> [Error Handling]
:::

- **Identity** — who the agent is. Role, personality, expertise area, communication style. The "you are a…" line.
- **Instructions** — what the agent does, step by step. The core task and any sub-tasks, in the order they should happen.
- **Tools** — which capabilities the agent uses and how to use them. When to call which tool, what arguments matter, what to do with results.
- **Examples** — input/output pairs that show "good" looks like. The single most underused section and one of the most impactful — one solid example beats three more sentences of instruction.
- **Error Handling** — what to do when input is missing, malformed, or unexpected. Where to stop, what to retry, what to escalate to a manual review.

### How It Works

The renderer concatenates the sections in the order shown, with clear delimiters. Some models pay more attention to early sections; the order is designed to put role and core task first, with examples and error handling at the bottom where they're still in context but don't dilute the headline. If you're using structured prompts for the first time, fill Identity and Instructions immediately and leave the others empty — the model will work fine, and you can add Examples / Error Handling as edge cases come up.

:::tip
When an agent starts producing edge-case failures, look at the trace and ask: "could I have prevented this with an example?" Most "the agent is bad at X" problems are really "I never showed it what good X looks like."
:::
  `,

  "agent-settings-and-limits": `
## Agent Settings and Limits

The Settings tab on the agent editor is where you put guardrails. Every agent has limits on how long it runs, how much it costs per run, how many model turns it can take, and how many copies can run in parallel. Defaults are conservative — enough to let real work happen, low enough that a misbehaving agent can't run up a bill before you notice.

The limits are especially important for unattended agents (scheduled, webhook-triggered, chain-triggered). Manual runs you see happen; scheduled runs you don't, so a runaway prompt could fire hourly for a week before you check.

### Key Settings

- **Timeout** — total wall-clock time before the run is killed. Default 2 minutes, raise for slow models or long tool-use chains.
- **Budget cap** — maximum cost per run, evaluated against the live cost meter; the run aborts gracefully when it crosses the cap.
- **Max turns** — number of model ↔ tool round-trips allowed in one run. Prevents tool-call loops where the model never converges.
- **Concurrency** — how many parallel executions of this agent are allowed. Set to 1 for stateful agents (so they don't overlap on the same input); raise for parallel batch work.
- **Memory access** — whether the agent reads from its memory store at runtime (default on for agents that have memories enabled).
- **Failover provider** — alternate AI provider to use when the primary returns errors above a threshold. Set on agents you care about uptime for.

### How It Works

Limits are enforced by the execution engine, not the model. When a run hits a limit, it stops cleanly — the partial trace is preserved, the run is marked with the reason (\`timeout\`, \`budget_exceeded\`, \`turns_exceeded\`), and no charge or state mutation persists for the cut-off portion. The Health tab surfaces limit-stops as warnings so you can decide whether to raise the limit or fix the underlying prompt.

:::tip
Start with conservative limits on every new agent. The cheapest moment to discover a runaway prompt is on the third manual run, not the third scheduled overnight run.
:::
  `,

  "assigning-tools-to-agents": `
## Assigning Tools to Agents

Tools are like apps on a phone — your agent can only use the ones you install. By assigning specific tools, you control exactly what your agent can do. An agent with email access can read and send messages; one with web search can look things up online.

:::warning
This is also a safety feature. An agent can't accidentally modify files if it doesn't have file access, and it can't send emails if it doesn't have email tools. You're always in control of what your agents can and can't touch.
:::

### Available Tool Types

- **Email** — read, draft, and send email messages
- **Web search** — look up information on the internet
- **File access** — read and write files on your computer or cloud storage
- **API calls** — interact with external services and databases
- **Clipboard** — read from and write to your clipboard
- **Messaging channels** — send results to Slack, Discord, Teams, or any generic webhook endpoint as part of the agent's output

### How to Assign Tools

:::steps
1. **Open the Connectors tab** — on the agent editor; it shows every capability your agent needs against your vault
2. **Pick a category, not a specific service** — choose "email" or "cloud storage" and the picker shows matching credentials you already have plus suggested connectors if you don't
3. **Authorize anything new** — for OAuth services, you'll click through a one-time consent screen; the resulting credential lands in your vault and is reusable across agents
4. **Pre-flight check** — before you promote the agent, the build engine cross-checks every required capability against the vault and flags anything missing
5. **Save the configuration** — the agent uses the assigned tools on its next run; if a credential later expires, you'll see it in the agent's health indicator
:::

:::tip
Only assign the tools your agent actually needs. Fewer tools means fewer things that can go wrong, and your agent stays focused on its job.
:::
  `,

  "prompt-version-history": `
## Prompt Version History

Every save of an agent's prompt creates an immutable version. The history lives next to the prompt editor on the Prompt tab — open it and you see every save, timestamped, with the diff against the previous version visible inline. There's no limit; the very first version is preserved indefinitely.

The system also auto-versions when the build engine modifies a prompt (e.g. during template adoption or parameter rebuilds), so changes from the engine show up alongside your manual edits with a clear "auto-generated" label.

### Key Points

- **Automatic snapshots** on every save — manual edits and engine edits alike
- **One-click restore** — picks any version and makes it the current prompt; the current version is saved first, so restores are never lossy
- **Inline diff** — see what changed between two versions without leaving the tab
- **Unlimited retention** — versions never expire or get garbage-collected

### How It Works

The history is stored in the local SQLite database (alongside the agent itself), so it's immediately searchable and works offline. When you restore a version, the editor switches to it but the previously-current version is also preserved — you can flip back without redoing your work.

:::tip
Before a risky prompt change, make a no-op save so the current state is checkpointed in history. Then experiment freely — restoring is one click if the experiment fails.
:::
  `,

  "comparing-prompt-versions": `
## Comparing Prompt Versions

When an agent's behavior changes and you want to know why, the diff view on the version history shows exactly which characters of the prompt are different between any two versions. Additions are highlighted green, removals red. This is the fastest way to localize a regression — you can usually see the offending change in seconds.

The diff respects the structured-prompt sections too: if you're comparing two structured-mode versions, the diff is segmented per section so you can ignore irrelevant sections and focus on the one that changed.

:::code-compare
### Original
Summarize the emails in my inbox.
Give me the key points.
---
### Improved
Read my 5 most recent unread emails.
For each email, write a 2-sentence summary
including the sender name and action needed.
Format as a numbered list.
:::

### Key Points

- **Side-by-side view** — both versions visible at once with character-level highlighting
- **Per-section diff** for structured prompts — jump straight to the changed section
- **Compare any two versions** — not just consecutive ones; useful for "what changed since the working version three weeks ago"
- **Quick restore** — restore either version directly from the diff view

### How It Works

Open the version history on the Prompt tab, check the boxes next to two versions, and click Compare. The diff renders in a side-by-side panel. Click Restore on either side to make it current; the diff stays open so you can see exactly what you reverted to.

:::tip
When you find the offending change in a diff, copy the *new* (broken) version into the prompt and keep editing — that way the version history records your intent ("tried X, rolled back to Y, then refined to Z"). Restoring without leaving a trail loses the lesson.
:::
  `,

  "cloning-and-duplicating-agents": `
## Cloning and Duplicating Agents

Cloning copies an agent's full configuration into a new agent: prompt (including version history), tools, triggers, settings, memory access flags, failover provider, everything except runtime state (executions, costs, and live triggers don't carry over). The clone is fully independent — edits on either side don't affect the other.

The most common use is forking a working agent to experiment safely. The original keeps producing; the clone is your sandbox. If the experiment is good, you can either replace the original or keep the clone as a specialization.

### Key Points

- **Full configuration carries over** — prompt, tools, triggers, settings, memory, failover
- **Runtime state does not** — executions, costs, live triggers belong to one agent at a time
- **Triggers are cloned but disabled** — so the clone doesn't immediately start firing on the same schedule/webhook as the original
- **Cloned agents get a "(Copy)" suffix** by default; rename before promoting

### How It Works

Right-click an agent in the sidebar or use the three-dot menu in the editor toolbar, and pick \`Clone\`. The new agent appears in the same group with disabled triggers. Re-enable them deliberately (and update their configuration if you don't want the clone listening to the same webhook URL as the original, for instance).

:::tip
Cloning is the safest way to A-B a prompt change without disrupting an agent that's already in production. Make the change in the clone, run both in the Lab arena on the same inputs, and only swap the production agent once the clone wins.
:::
  `,

  "agent-groups-and-organization": `
## Agent Groups and Organization

Agents in the sidebar are organized by groups — your own folders for arranging things by team, project, function, or whatever you find useful. Empty by default; you add groups as your collection grows and the flat list stops scaling.

The sidebar also supports nested groups (one level of nesting), drag-and-drop reordering, collapse/expand state that persists across sessions, and per-group icons for fast visual recognition.

### Key Points

- **Create groups** as needed — no limit on count
- **Drag to reorganize** — drop an agent on a group to move it, or rearrange the list by dropping between siblings
- **Per-group icons and colors** — pick an icon that hints at the group's theme so you find the right group at a glance
- **Collapse to declutter** — collapsed groups stay collapsed across sessions so a long list doesn't fight you on startup
- **Nest one level** — useful for "Personal > Email", "Work > Research", etc.

### How It Works

Right-click in the agent sidebar to add a group, or drag an existing group onto another to nest it. Groups are persisted in the local database and don't affect agent execution — they're purely an organization layer. Agents can be in one group at a time but move freely between them.

:::tip
A "Drafts" or "Experimental" group at the top of your sidebar is a useful pattern. Anything you're still iterating on lives there, and your production agents stay in clearly-named groups below. Visual separation reduces the chance of editing the wrong agent.
:::
  `,

  "disabling-and-archiving-agents": `
## Disabling and Archiving Agents

Two ways to pause an agent without deleting it. **Disable** stops all triggers from firing and blocks manual runs; the agent stays visible in the sidebar with a muted icon so you remember it exists. **Archive** moves the agent into a hidden archive section out of the way of daily use; it stops triggering, doesn't count against tier limits, and can be restored at any time.

Neither operation touches executions, settings, or version history. Archive is heavier — use it for agents you're done with for now but might want back. Disable is lighter — use it when you need to stop an agent temporarily without losing it from view.

### Key Points

- **Disable** — pauses execution; agent still visible in the sidebar; one-click re-enable
- **Archive** — hides the agent and frees up its slot against your tier limit; restorable forever
- **Neither deletes** — settings, prompt history, and past executions are preserved
- **Triggers respect disable** — a disabled agent ignores schedule/webhook/file-watcher events; they don't queue up for replay on re-enable

### How It Works

Open the three-dot menu in the agent editor toolbar or right-click the agent in the sidebar. Disable / Archive / Restore all live there. Archived agents are accessible from the Archive section at the bottom of the agent sidebar; restoring puts the agent back in its original group (or in an "Ungrouped" bucket if the group has been deleted in the meantime).

:::tip
Archive seasonal agents (quarterly reports, holiday workflows, end-of-month reconciliations) instead of deleting. Restore them when the season comes back around and they're ready to run immediately.
:::
  `,

  "agent-health-indicators": `
## Agent Health Indicators

Every agent has a small colored dot next to its name that tells you its status at a glance. **Green** means everything is running smoothly. **Yellow** means something needs your attention — maybe a credential is about to expire or a recent run had a warning. **Red** means there's a problem that needs fixing.

These indicators save you from having to check each agent individually. A quick look at your sidebar tells you the health of your entire setup.

:::feature
**At-a-Glance Health Monitoring**
Personas continuously tracks execution results, credential expiry, and configuration completeness for every agent. Health indicators update automatically — no manual checks required.
:::

### What Each Color Means

| Color | Status | Meaning |
|---|---|---|
| **Green** | Healthy | All recent runs succeeded, no issues detected, setup complete |
| **Yellow** | Warning | Something may need attention soon (expiring credential, slow performance, setup partially complete) |
| **Red** | Error | The agent failed recently or has a configuration problem |
| **Gray** | Inactive | Disabled or never run |

### Setup Status

Alongside health, every agent has a **setup status** indicating how ready it is to run autonomously. A freshly-promoted agent often has setup gaps — a missing credential, an unconfigured trigger, an output channel still being wired up. The setup status badge surfaces exactly what's left to do, in priority order, so you don't have to hunt through tabs to find out what's blocking. Agents with persistent setup problems are automatically pulled out of any scheduled or triggered rotation by a circuit-breaker, so you'll never have a half-configured agent running silently against bad data.

### How It Works

Health is calculated automatically based on recent execution results, credential status, and configuration completeness. Click on the indicator to see a summary of what's causing the current status — including any setup gaps. From there, you can jump directly to the settings, logs, or specific tab that needs attention.

:::tip
Make it a habit to scan your sidebar colors once a day. Catching a yellow indicator early prevents it from becoming a red one — and resolving setup gaps right after promotion is the cheapest moment to do it.
:::
  `,
};
