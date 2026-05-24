export const content: Record<string, string> = {
  "what-are-pipelines": `
## What Are Pipelines?

A pipeline is a coordinated group of agents that pass work between each other to handle a multi-step task. Instead of one big do-everything agent, you build small focused agents and wire them together — each one specializes, the pipeline handles the orchestration. The Pipeline section in the sidebar is where pipelines live; the Team Canvas inside it is where you compose them.

Pipelines in Personas are first-class — they have their own execution history, their own observability surfaces, their own team memory (shared context that all agents in the pipeline can read), and they can be triggered just like a single agent (schedule, webhook, manual, chain). The difference is that one trigger fires a whole pipeline rather than one agent.

:::compare
**Single Agent**
One prompt, one tool set, one output. Simple to set up; limited when the task naturally decomposes into stages.
---
**Pipeline** [recommended for multi-stage work]
Several focused agents, wired into a flow. Each agent is small and easy to debug; the pipeline composes them into a larger capability. Shared team memory lets agents pass structured context, not just text. Visible on the team canvas end-to-end.
:::

### Key Points

- **Multi-agent flow** — agents pass output to inputs along defined connections
- **Team memory** — a shared context store all pipeline agents can read and write, separate from per-agent memory
- **Visual editor** — the Team Canvas; place agents, draw connections, configure routing
- **Reusable** — same pipeline runs for any matching trigger payload; pipelines are also clonable
- **Observable** — full pipeline-level execution history with per-agent breakdown

### How It Works

You compose a pipeline on the Team Canvas: drop agents, draw connections, configure conditional branches if needed. When the pipeline runs, data flows along the connections — each agent's output becomes input to whichever downstream agent the canvas wired it to. The engine tracks the run end-to-end so you see one pipeline execution rather than N disjoint agent runs.

### See It In Action

:::usecases
**DevOps automation**
A pull request opens on GitHub
---
PR Reviewer agent analyzes the diff, Test Runner verifies builds, Release Notes drafts a changelog, Slack Notifier posts the summary to your team channel — single pipeline triggered by the GitHub webhook.
===
**Content workflow**
You need a published blog post from a topic
---
Research agent gathers sources, Writer drafts the piece, Editor polishes, Publisher formats for your CMS — pipeline manages the handoffs and team memory carries shared style guidance.
===
**Customer support triage**
A new ticket arrives
---
Classifier determines urgency and category, Knowledge agent retrieves relevant docs, Drafter writes a candidate response, Router escalates to a human if confidence is low.
:::

:::info
No hard upper limit on pipeline size. Start with two agents to validate the data flow, grow by adding one specialist at a time. Pipelines with 10+ agents work as reliably as small ones; the engine handles orchestration identically.
:::

:::tip
Treat each agent in the pipeline like a single-purpose function: one specific input shape, one specific output shape. The smaller and more focused each agent is, the easier the whole pipeline is to debug and the more reusable the individual pieces are across pipelines.
:::
  `,

  "the-team-canvas": `
## The Team Canvas

The Team Canvas is the visual editor for pipelines. Open Pipeline → Team Canvas and you see your pipeline as a graph: agent nodes connected by directed edges. Drop agents from the library panel on the left, draw connections by dragging from an agent's output port to another agent's input port, configure branches with conditional nodes. The canvas supports pan, zoom, multi-select, auto-layout, and keyboard navigation.

The canvas isn't just visualization — it's the editor. Every change you make on the canvas (placing an agent, drawing a connection, adding a conditional node) immediately updates the pipeline's definition. Save to commit; the pipeline is version-controlled in the same way agent prompts are.

### Key Points

- **Drag-and-drop** agents from the library onto the canvas
- **Connection drawing** — click-and-drag from output port to input port; data flows along the connection at run time
- **Conditional nodes** — add a routing node between agents to branch based on data
- **Auto-layout** — one click tidies the canvas into a left-to-right or top-to-bottom flow
- **Versioned** — canvas snapshots are saved with the pipeline; restore prior layouts and topologies

### Building Your First Pipeline

:::steps
1. **Open Pipeline → Team Canvas** — sidebar → Pipeline → New Pipeline (or open an existing one)
2. **Browse the agent library** — left panel; filter by group or search
3. **Drag agents onto the canvas** — place them roughly in execution order
4. **Draw connections** — output port (right edge) to input port (left edge)
5. **Add conditional nodes if needed** — toolbar → Conditional; configure branches
6. **Save** — Ctrl+S; the pipeline is committed and runnable immediately
:::

:::tip
Left-to-right top-to-bottom is the most readable convention. Use auto-layout (toolbar button) once the topology is set; it produces a clean visual flow that helps anyone reading the canvas — including future-you — understand the pipeline at a glance.
:::
  `,

  "adding-agents-to-a-pipeline": `
## Adding Agents to a Pipeline

Agents are added to pipelines from the library panel on the left of the Team Canvas. Drag any agent onto the canvas to place it; the agent's default settings carry over (prompt, tools, model, credentials), but you can override per-pipeline if you want this agent to behave slightly differently here than elsewhere.

The same agent can participate in multiple pipelines, each with its own override settings. Changes to the underlying agent (e.g. a prompt revision in the agent's own editor) propagate to all pipelines using it; per-pipeline overrides don't, they live only in the pipeline.

### Key Points

- **Drag from library** — any agent you've created is available
- **Per-pipeline overrides** — input mapping, output transformer, model preference (if you want this pipeline to use a cheaper model for this stage), failover provider
- **Multi-pipeline reuse** — an agent in pipeline A and pipeline B has independent override sets per pipeline
- **Underlying agent changes propagate** — prompt edits, tool changes, etc., flow through to every pipeline using the agent (per-pipeline overrides don't)
- **Replace an agent in place** — right-click → Replace; the new agent inherits the connections of the old one if input/output shapes match

### How It Works

Placing an agent on the canvas creates a *pipeline-scoped reference* to that agent. The reference includes the override set (any per-pipeline customizations) and the position on the canvas. At run time, the engine resolves the reference, applies the overrides on top of the agent's base configuration, and dispatches the run.

:::tip
Resist the temptation to bake heavy per-pipeline customizations into the override set. If you find yourself overriding many things in one pipeline, it's usually cleaner to clone the agent (giving the clone a clear name like "Email Writer - Pipeline B") and use the clone — keeps the per-pipeline customizations explicit instead of hidden inside override panels.
:::
  `,

  "connecting-agents-with-data-flow": `
## Connecting Agents with Data Flow

Connections on the canvas are directed edges from an agent's output port to another agent's input port. Each connection carries the upstream agent's output to the downstream agent as input — verbatim by default, or transformed by an inline transformer (a small expression that reshapes the output before passing it on).

Connections are configured: you can add transformers, label them (useful in complex pipelines), and toggle them off temporarily for debugging without removing them. Multiple connections can fan out from one output (broadcast: downstream agents all receive the same data) or fan in to one input (the engine combines inputs from multiple upstream agents into one input object for the downstream).

### Key Points

- **Click-drag** from output port to input port to create a connection
- **Optional transformer** — inline expression that reshapes the data on its way through
- **Fan-out** — one output to many downstream inputs (parallel branching)
- **Fan-in** — many upstream outputs into one downstream input (combined object)
- **Toggle on/off** — disable a connection without deleting it (useful for staged rollouts)
- **Labeled** — name connections for clarity in complex pipelines
- **Delete** — click connection → Delete key

### Connecting Two Agents

:::steps
1. **Find the output port** — small circle on the right edge of the source agent
2. **Click-and-drag** to the input port — small circle on the left edge of the target
3. **Drop on the input port** — line drawn; connection committed
4. **Optionally add a transformer** — right-click connection → Add transformer; write a small expression to reshape data
5. **Test by running the pipeline** — click any connection during a run to inspect the data passing through
:::

:::tip
Use connection labels and transformers liberally in any pipeline with more than 3-4 agents. Labels make the topology self-documenting; transformers let you keep agents reusable across pipelines (one agent doesn't have to know what format a different pipeline upstream might produce — the transformer adapts it).
:::
  `,

  "pipeline-execution": `
## Pipeline Execution

Running a pipeline dispatches the trigger payload into the first agent (or agents, if multiple start nodes), and each downstream agent runs as its inputs become available. The canvas shows execution live — agents glow when running, connections animate with the data flowing, and conditional nodes show which branch was taken.

The engine handles parallelism automatically: if two agents have no dependency between them, they run in parallel. If an agent depends on outputs from multiple upstream agents, it waits for all to complete. The total wall-clock time is determined by the critical path through the graph, not the sum of all agent durations.

### Key Points

- **Live canvas animation** — see which agents are running, which connections are flowing, which conditional branches are taken
- **Automatic parallelism** — independent agents run concurrently; dependent agents wait for prerequisites
- **Critical path determines wall time** — pipeline duration = longest dependency chain, not sum of agents
- **Stop-at-first-failure** — by default; configurable per pipeline if you want fault-tolerant execution
- **Re-run from any step** — pick up after a fix without re-running successful upstream stages

### How It Works

:::diagram
[Trigger] --> [Agent A] --> [Conditional] --> [Agent B or Agent C] --> [Agent D] --> [Output]
:::

Click \`Run\` (or wait for the trigger to fire automatically). The engine builds an execution plan from the canvas topology, dispatches start nodes, and processes the graph by topological order. As each agent completes, downstream agents become eligible and dispatch automatically. Failure pauses the pipeline at the failing step with the error visible in the inspector; fix the underlying issue and click \`Retry Step\` to resume.

:::tip
The slowest agent on the critical path determines pipeline duration. If your pipeline feels slow, run it once, look at per-agent durations in the trace, identify the longest path, and optimize whichever agent on that path has the highest duration. Parallel branches don't help if your critical path is slow.
:::
  `,

  "conditional-routing": `
## Conditional Routing

Conditional routing nodes let a pipeline branch on the data it's processing. Drop a conditional node on the canvas, define one or more rules ("if amount > 1000", "if email contains 'urgent'", "if classifier output = 'support'"), and wire each branch to a different downstream path. At run time the conditional evaluates and routes to the matching branch — only that branch runs.

Rules are expression-based: a small DSL of comparisons and logical operators evaluated against the upstream agent's output. No code; the expression editor has autocomplete for the upstream output shape so you discover the available fields as you type.

:::feature
**Expression-based routing**
Conditional rules are evaluated as expressions against the upstream output. Compare fields, combine with AND/OR, fall through to a default branch when nothing matches. No code required, but full expressiveness when you need it.
:::

### Key Points

- **Multiple branches** — one conditional node, N rule-defined branches, plus a default fallback
- **Default branch is mandatory** — guarantees data never gets stuck on unmatched conditions
- **Expression DSL** — comparisons (\`>\`, \`<\`, \`==\`, \`contains\`, \`matches\`), boolean operators (\`and\`, \`or\`, \`not\`)
- **Autocomplete on upstream shape** — the expression editor knows the output schema of the upstream agent
- **Live evaluation in trace** — see which branch was taken on each pipeline run

### How It Works

Drop a Conditional node between agents. Configure each branch's rule in the rule editor; the default branch needs no rule (it's the fallback). At run time the engine evaluates rules in order; the first match wins; if no rule matches the default branch runs. The branch that runs sees the upstream output as input; the others remain idle for this run.

:::warning
Always define a default branch. Without one, an unmatched input gets stuck mid-pipeline and produces a hung run — annoying to debug. The default branch can simply route to a terminal "log and stop" agent if you really want unmatched inputs to fail loudly, but the branch needs to exist.
:::
  `,

  "team-members-and-roles": `
## Team Members and Roles

Each agent in a pipeline can carry a role label — "Researcher", "Writer", "Editor", "Classifier" — that describes its function within the pipeline. Roles are purely organizational; the engine doesn't enforce or use them. Their value is human: when you (or someone else) opens the canvas a month later, role labels make the pipeline self-documenting.

Beyond the label, roles are also useful for agent substitution. If you have multiple agents that could fill the "Editor" role (with different prompt styles or specialties), the role label makes it obvious which slot to swap when you change your mind. The Team Canvas supports drag-replace on a role: drop a different agent on the existing role and the canvas asks whether to substitute, preserving the connections.

### Key Points

- **Free-text role labels** — anything human-readable; common ones get autocomplete suggestions
- **Canvas-visible** — role labels appear above each agent node so the team structure is at-a-glance
- **Drag-replace by role** — drop a new agent on a role slot to substitute, preserving connections
- **Filter library by role** — when you have many similar agents, filter the library by role to find candidates quickly
- **Pipeline templates use roles** — the template defines roles to fill, you bring agents that fit each role

### How It Works

Right-click any agent on the canvas → Set role. The label appears above the agent node. Roles live in the pipeline definition alongside the agent reference; they don't modify the agent itself. Pipeline templates ship with roles pre-defined; instantiating a template prompts you to pick an agent for each role.

:::tip
Name roles by responsibility, not by current agent. "Editor" is better than "Claude Sonnet Editor"; the role description outlives whichever specific agent currently fills it. If you switch from Claude to GPT for that role, the role label is still accurate.
:::
  `,

  "pipeline-run-history": `
## Pipeline Run History

Pipeline runs are first-class executions in the same store that individual agent runs go to. The Pipeline → Run History tab shows every run with its trigger, input, status, total duration, total cost, and per-agent breakdown. Click any run to expand the full trace: per-agent traces, conditional decisions, transformer outputs, the final result.

Run history persists indefinitely (subject to retention settings in Settings → Data) and supports the same filtering and search as per-agent activity views. Each run is immutable — once captured, the trace is frozen, useful for after-the-fact audits.

### Key Points

- **Complete capture** — input, per-agent traces (prompt, tool calls, response), conditional decisions, transformer outputs, final result
- **Per-agent status** within the pipeline trace — success / failure / skipped / pending
- **Total + per-agent timing** — see the critical path and identify bottlenecks
- **Total + per-agent cost** — pipeline cost = sum of per-agent costs
- **Searchable and filterable** — by date, trigger, status, cost, duration, agent
- **Two-run compare** — pick two runs to diff per-agent outputs (useful for "what changed?")

### How It Works

Pipeline runs use the same execution store as single-agent runs but with an additional pipeline-level wrapper that links to all the child agent executions. The history view queries this store, joins to the agent execution records for per-agent breakdowns, and renders the trace tree.

:::tip
After a meaningful pipeline change (new conditional rule, swapped agent, prompt revision on a member agent), pick a "before" run from history and the "after" run from the new run, then use Compare to see exactly what's different. The diff at the pipeline level often reveals impact you'd miss looking at any single agent in isolation.
:::
  `,

  "pipeline-templates": `
## Pipeline Templates

Pipeline templates are pre-built pipeline shapes you can adopt as a starting point. The template defines the topology — what roles exist, what conditional branches, what transformers — but doesn't bind specific agents to each role. When you instantiate a template, the canvas opens with the topology in place and prompts you to fill each role from your own agent library.

Templates cover common shapes: content workflows (research → write → edit → publish), support triage (classify → route → respond → escalate), data processing (ingest → validate → transform → store). The template library is in Pipelines → New Pipeline → Browse Templates.

### Key Points

- **Topology-defined, role-flexible** — the template knows the shape; you bring the agents
- **Pre-configured conditional rules and transformers** — common-case routing logic is baked in
- **Customizable after instantiation** — once instantiated, the canvas is yours to modify
- **Best-practice patterns** — templates ship with error handling and fallback branches as standard
- **Growing library** — new templates are added based on user demand; you can also save your own pipelines as templates for reuse

### How It Works

A template is a canvas definition with role slots instead of agent references. Instantiating creates a new pipeline, copies the template's canvas, and asks you to fill each role from the agent library. Once filled, the pipeline is fully editable — it's not linked back to the template, so updates to the template don't propagate (and edits to the pipeline don't affect the template).

:::tip
Even when no template is an exact fit, picking the closest one and modifying it is usually faster than building from scratch. Templates pre-solve the orchestration shape (conditional placement, transformer locations, fan-out/fan-in topology); the work that remains is agent selection and prompt tuning, which is the work you wanted to focus on anyway.
:::
  `,

  "team-assignments": `
## Team Assignments

Pipelines wire every step by hand. Assignments flip that around: you hand the team a **goal** in plain language, and the team figures out the steps itself. It breaks the goal into a checklist, picks the best agent for each step, and runs them in parallel — only stopping to ask you when a step fails or needs a decision.

Think of it as the difference between drawing a flowchart and briefing a project manager. With a pipeline you design the flow; with an assignment you state the outcome and let the team organize around it.

### Key Points

- **Goal-first** — describe what you want; the team decomposes it into ordered steps
- **Smart matching** — each step is routed to the agent best suited to it (you can pin agents manually, use fast local matching, or let the model decide)
- **Auto-decompose** — one click turns a goal into an editable step list you can tweak before running
- **Parallel execution** — independent steps run at the same time; dependent steps wait their turn
- **Human review on failure** — a failed step pauses just that assignment and offers you Edit / Reassign / Skip, with a notification in the title bar
- **Reusable templates** — save a goal + step layout as a template and stamp out new assignments from it
- **Chat dispatch** — ask Athena to "have the research team handle this" and she'll set it up for your approval

### How It Works

Open a team's canvas and click the **Assignments** badge (bottom-left). Hit **New**, type a goal, and either fill in the steps yourself or click **Auto-decompose** to have the assistant propose them. Choose how agents get matched to steps, set how many run at once, and click **Create & start**. Watch the checklist update live; if a step fails, resolve it inline. Save anything you'll run again as a template.

:::tip
Use an assignment when you know the outcome but not the exact steps. Use a pipeline when you want precise, repeatable control over every connection. Templates bridge the two — a saved assignment becomes a one-click starting point.
:::
  `,

  "debugging-pipeline-issues": `
## Debugging Pipeline Issues

When a pipeline run fails, the canvas marks the failing agent with a red indicator and the run pauses at that step. Open the failing run from history (or click the indicator on the live canvas) and the debug panel shows the agent's input, the error, the trace up to the failure, and any partial output the agent produced before failing. From the same panel you can retry just the failing step or rerun the whole pipeline from the start.

The most common pipeline failures are data-shape mismatches — an upstream agent produces output in a slightly different format than the downstream agent expects. The connection inspector (click any connection) shows the data passing through it on the most recent run, which is usually enough to spot the mismatch.

### Key Points

- **Failing step highlighted** — red indicator on the canvas, full error in the debug panel
- **Connection inspector** — click any connection to see live or last-run data passing through
- **Retry from failed step** — fix the issue and resume; successful upstream stages don't re-run
- **Step-by-step replay** — re-run any past pipeline execution with the same input to reproduce a failure deterministically
- **Connection validation** — the canvas can pre-check whether upstream and downstream agents have compatible input/output shapes (catches mismatches before run time)

### How It Works

The pipeline engine emits structured failure events when an agent run errors. The debug panel subscribes to these events and renders the relevant trace + inspector. Retry-from-step is supported by the engine: it re-dispatches the failed agent with the same upstream context, preserving the rest of the pipeline run.

:::tip
Most pipeline failures are connection issues, not agent issues. When something breaks, first inspect the connections feeding the failing agent — what shape did it actually receive? It's much more often "the data was wrong" than "the agent was wrong"; the connection inspector tells you which case it is in under a minute.
:::
  `,
};
