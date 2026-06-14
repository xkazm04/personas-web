export const content: Record<string, string> = {
  "installing-personas": `
## Installing Personas

Personas runs on **Windows** today. macOS and Linux builds are on the roadmap — see the cards below for current platform availability.

Getting Personas on your Windows machine takes about a minute. Download the installer, run it, approve the SmartScreen prompt, and the app launches. Updates are delivered automatically in the background, so you'll always have the latest version without doing anything.

:::cards
[available] Windows | The Windows installer is a 53 MB NSIS \`.exe\`. Code-signed, auto-updating, runs on Windows 10 or newer (64-bit). | /imgs/get-started/platform/windows
[roadmap] macOS | Native universal \`.dmg\` for Apple Silicon and Intel is in development. Track progress on the roadmap. | /imgs/get-started/platform/mac
[roadmap] Linux | \`.AppImage\` and \`.deb\` builds for Ubuntu, Debian, Fedora, and Arch are in development. Track progress on the roadmap. | /imgs/get-started/platform/linux
:::

### Precondition: Install Claude Code

Personas builds on top of **Claude Code** for its agent execution engine, so Claude Code needs to be installed first. The Claude Code installer is a single file from Anthropic and takes under a minute.

:::steps
1. **Open the Claude Code installer page** — head to [claude.com/claude-code](https://claude.com/claude-code) and follow the install flow for your platform
2. **Confirm the install** — run \`claude --version\` in a terminal to verify the binary is on your PATH
3. **Continue with Personas below** — Claude Code only needs to be installed once; subsequent Personas updates don't require reinstalling it
:::

:::info
If you already have Claude Code installed for other work, skip this section — Personas will pick up your existing install automatically.
:::

### Windows install

:::steps
1. **Download the installer** — grab the NSIS \`.exe\` from the download page
2. **Double-click to run** — SmartScreen may ask you to confirm the publisher the first time; the installer is code-signed, so it's safe to approve
3. **Approve security prompts** — Windows may ask you to allow the install; this is standard for new desktop software
4. **Tick "Add to PATH"** — optional but recommended so you can launch and script Personas from a terminal
5. **Launch Personas** — the welcome screen opens with a guided tour you can take or skip
:::

After install, the bundled binary is around 90 MB. Auto-updates run silently in the background, delta-only — typically much smaller than the original installer.

The first time the app opens, you land on the welcome screen. From there you can either jump straight into building an agent (Personas will offer to set up an AI provider when you need one) or open the credential vault first if you already have API keys you want to store. Both paths work.

### Verifying your install

Once Personas is installed, you can confirm it's reachable from your terminal. This is handy for scripting, CI integration, or just a quick sanity check after a fresh install.

:::cli
$ personas --version
:::

Print the available flags:

:::cli
$ personas --help
:::

If your shell can't find the \`personas\` command, the desktop launcher still works — the CLI is an optional convenience that the installer wires up only when you tick "Add to PATH" during setup. Re-run the installer and tick that option if you want it later.

:::tip
If you run into a Windows SmartScreen warning, it's your OS being cautious with new software. Approve it and you're all set — the installer is code-signed.
:::
  `,

  "creating-your-first-agent": `
## Creating Your First Agent

Your first agent takes about five minutes from blank slate to working assistant. You have two paths: **start from a template** (recommended for your first agent — the build engine assembles a working configuration from your answers) or **start from scratch** (full manual control). Both end up at the same place: an agent you can run.

If you pick the template path, the build engine kicks off an interactive session. It asks clarifying questions in batches ("what kind of input do you expect?", "where should the output go?", "how often should this run?"), proposes parameters based on your answers, and shows a live preview of the agent it's about to build. You approve at the end, and the agent lands ready to test.

If you pick the from-scratch path, you write the prompt yourself, pick the AI model, attach any tools, and save.

:::steps
1. **Open the Agents page** — sidebar → Agents, or press \`Ctrl+1\` to jump there
2. **Click Create Agent** — pick a path: pick a template, or start blank
3. **Answer the build questions (template path)** — the build engine batches clarifying questions per capability and shows a live preview as your answers shape the agent
4. **Adjust the prompt and tools** — fine-tune the instructions the template produced (or write them from scratch)
5. **Promote when ready** — moves the agent from draft to active; setup-status checks run automatically to flag any unconnected credentials or unconfigured triggers before you can promote
:::

### How It Works

The template path is the fastest way to get a *good* agent (templates are designed and tested by us), but you'll outgrow it. Once you've shipped a couple of template-based agents, you'll start writing prompts directly and treating templates as starting points rather than full solutions.

:::tip
Don't worry about perfecting your first agent. The version history (covered later) means you can experiment freely — every save is a checkpoint you can return to.
:::
  `,

  "understanding-the-interface": `
## Understanding the Interface

The Personas interface has three main regions. The **sidebar** on the left is your top-level navigation — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, and Settings. Click a top-level section and a second-level nav appears showing its sub-pages (e.g. clicking Agents reveals All Agents, plus the Editor tabs for the currently-selected agent: Prompt, Connectors, Lab, Activity, Health, Settings).

The center area is the **workspace** where everything actually happens — editing prompts, watching executions, browsing the credential catalog. The **title bar** at the top holds the notification bell (click for the freshest execution detail), the cockpit access ("Talk to Athena"), and the global search. The **bottom strip** shows active executions and any urgent system events.

| Region | What it does |
|------|-------------|
| Sidebar Level 1 | Top-level sections — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, Settings |
| Sidebar Level 2 | Context-sensitive sub-nav for the active section |
| Workspace | The main editor / browser / dashboard for whatever section you're on |
| Title bar | Notification bell, cockpit shortcut, global search, app controls |
| Bottom strip | Active executions, system status |

### How It Works

Most of what you do happens by clicking a sidebar item and editing in the workspace. The title-bar notification bell is the one universal shortcut worth memorizing — it always opens the most recent execution detail, no matter where you are. The cockpit shortcut ("Talk to Athena") opens an in-app chat with the companion that can help you build, debug, or just answer questions about your setup.

### Keyboard shortcuts

A handful of shortcuts cover most everyday navigation. \`Ctrl+K\` opens global search (find any agent, page, or setting by name). \`Ctrl+1\`–\`Ctrl+9\` jump directly to top-level sidebar sections. \`Ctrl+Enter\` runs the focused agent. \`Ctrl+Shift+P\` opens the command palette — type a verb (\`run\`, \`clone\`, \`disable\`, \`open\`) plus a target name to act on anything without navigating.

You can customize any binding in **Settings → Appearance → Keyboard Shortcuts**; defaults follow OS conventions where possible.

:::keys
Ctrl+K — Global search (find anything by name)
Ctrl+N — Create a new agent
Ctrl+Enter — Run the focused agent
Ctrl+S — Save changes in the current editor
Ctrl+/ — Toggle the sidebar open/closed
Ctrl+, — Open Settings
Ctrl+? — Show the keyboard shortcut cheat sheet
Ctrl+Shift+P — Open the command palette
Ctrl+1 — Home
Ctrl+2 — Overview
Ctrl+3 — Agents
Ctrl+4 — Events
Ctrl+5 — Connections
Ctrl+6 — Templates
Ctrl+7 — Plugins
:::

:::tip
Start with \`Ctrl+K\`. Type a few letters of an agent name and hit Enter — that one shortcut covers maybe 60% of everyday navigation.
:::
  `,

  "what-is-an-ai-agent": `
## What Is an AI Agent?

An AI agent is a configured AI model with a job. You give it instructions ("read my unread emails and summarize the important ones"), tell it which tools it can use, and trigger it — manually with a button, on a schedule, on an event, or as a step in a pipeline. The agent reads the trigger payload, follows your instructions, calls any tools it needs, and produces an output. Unlike a chatbot, ==the agent acts==: sends the email, writes the file, posts to Slack.

Each agent in Personas is durable — it remembers its setup, its history, its credentials, and (optionally) memories from past runs. You can clone it, version-control its prompt, run it in an arena against alternative prompts to see which performs better, and chain it to other agents to build multi-step workflows.

:::compare
**Chatbot**
You type a question, it replies. Each turn is one-shot. Useful for quick lookups, brainstorming, drafting. No actions, no memory across sessions, no automation.
---
**AI Agent** [recommended]
A persistent configuration with a job. Triggered manually or automatically; uses tools to act; has version-controlled prompt, attached credentials, execution history, and a health indicator. The model is the engine, but the agent is the whole assembly around it.
:::

### How It Works

![Agent orchestration overview: trigger fires, agent reads input, model and tools execute, output dispatched](/imgs/features/orchestration.png)

The trigger packs an input payload (a webhook body, a clipboard string, a file path, an event from another agent…). The agent reads its prompt, feeds it to the AI model along with the input, and lets the model call attached tools as needed. The final output is dispatched through whatever output channel you configured — back to a UI, written to a file, posted to Slack, or chained as input to the next agent.

:::tip
The fastest way to understand agents is to look at your repetitive weekly tasks and ask: "could this be triggered, instructed, and automated?" If yes, that task is an agent.
:::
  `,

  "running-your-first-automation": `
## Running Your First Automation

Once you've created an agent, you have several ways to start it. The simplest is the manual **Run** button at the top of the agent editor — click it and you'll see the live execution stream in the activity panel. Within a few seconds (or a couple of minutes for slower providers or longer prompts), the output appears.

For repeating work, add a schedule trigger, a webhook trigger, a file-watcher trigger, or a chain trigger so the agent runs on its own. You set the trigger once, the agent does the rest.

:::steps
1. **Open the agent** — find it on the Agents page; the editor opens with the Prompt tab focused
2. **Click Run** — the workspace switches to the Activity tab automatically; you see the prompt being constructed, the model call going out, and tokens streaming back
3. **Watch the live feed** — each agent has its own stream so you can run multiple in parallel without confusion
4. **Review the output** — the activity row expands to show the full prompt, the model response, any tool calls made, the duration, and the cost
5. **Iterate** — change the prompt or settings, save, run again; every run is checkpointed
:::

### How It Works

![Lab view of a single execution trace showing prompt construction, model call, tool calls, and output](/imgs/features/lab.png)

A run is a single execution: trigger → prompt-construction → model-call → tool-calls → output. Every step is captured in the execution trace, and the run lands in the Activity tab of the Overview page (the global view across all agents) and in the agent's own Activity tab. From either place you can click into the run for the full detail modal.

If a run fails (model error, expired credential, network blip), the agent's health indicator turns yellow or red and the failure is preserved in the trace so you can debug.

:::tip
Your first run is partly about learning what your prompt actually does in practice. If the output isn't what you wanted, the trace shows you exactly what the model received — usually the fix is to clarify or constrain the prompt rather than retry.
:::
  `,

  "choosing-your-ai-provider": `
## Choosing Your AI Provider

Personas supports the major AI providers — **Anthropic** (Claude family), **OpenAI** (GPT family), **Google** (Gemini), and **local models** via Ollama or any OpenAI-compatible endpoint. You can also configure custom providers in Settings → Custom Models. Each agent picks its provider/model independently, so you can run cheap models on routine work and reserve expensive ones for tasks that need them.

Connect a provider once on the Connections page (you'll paste an API key — encrypted in the local vault — or run through OAuth for providers that support it). After that, every agent's model picker shows the configured providers and their models.

:::compare
**Anthropic Claude** [recommended]
Strong instruction-following, long-context reasoning, structured output. Sonnet 4.6 is the default for new agents. Opus models for hardest reasoning, Haiku for speed/cost. Excellent at tool-use loops.
---
**OpenAI GPT**
Broadest ecosystem and the most-tested for many use cases. Solid all-rounder; GPT-4o-class models are strong for general assistant work.
---
**Google Gemini**
Multimodal, large context windows, fast first-token latency. Strong for research / document-processing agents.
---
**Local (Ollama / OpenAI-compatible)**
Runs on your machine — zero data leaves the device. Smaller models, but for low-stakes or private work the trade-off is often worth it.
:::

### How It Works

Once multiple providers are connected, Personas can do automatic failover at the agent level: if your primary provider returns errors above a threshold, the agent's next run uses the configured fallback provider. When the primary recovers, normal rotation resumes. This is configured per-agent in the Editor → Settings tab.

For cost tracking, every run is tagged with provider, model, and token count, so the Overview → Usage tab can break down spending by provider, model, or agent.

### See It In Action

:::usecases
**Model-per-agent strategy**
Your agents have different needs
---
Code-review agent uses Claude Opus (best reasoning); email summarizer uses Haiku (fast and cheap); a personal/private agent runs on Ollama locally.
===
**Provider outage failover**
A provider has a regional outage
---
Affected agents automatically route to the configured fallback; the Health tab shows which agents are running on fallback and surfaces the recovery once the primary comes back.
===
**Cost reduction**
Monthly AI spend creeps up
---
Overview → Usage shows which agents and models dominate the spend. Swap the top-cost agents to a cheaper tier (Sonnet → Haiku, GPT-4o → GPT-4o-mini); the Lab can A-B them first to confirm quality holds.
:::

:::callout-stack
[info] Default provider for new agents is set in **Settings → Engine**. You can override on every agent.
[tip] Most providers offer free trial credits. Connect two or three and run the same prompt against each in the Lab arena — you'll feel the personality differences and pick a default that fits your style.
:::
  `,

  "system-requirements": `
## System Requirements

Personas is a Tauri desktop app — Rust backend, React frontend, local SQLite database — and it's intentionally lightweight. Most of the heavy compute happens on the AI provider's servers, not your machine. The app idles at near-zero CPU and uses a few hundred megabytes of RAM; it scales up only when agents are actively running locally.

The bundled binary is about 90 MB after install. Plugins (Artist for image generation, Obsidian Brain for vector search) can add to that footprint if you enable them.

:::checklist
- Windows 10+, macOS 12+, or Ubuntu 20.04+ (latest version recommended)
- 4 GB RAM minimum (8 GB+ recommended if you use the embeddings / vector-search plugins)
- 1 GB free disk space (more if you enable the Artist plugin's local models)
- Stable broadband — agent execution is bound by the AI provider's API latency
- Any modern dual-core CPU; quad-core or better recommended for parallel multi-agent runs
:::

### How It Works

The app stores its database (\`personas.db\`), credential vault, execution history, and configuration locally in your OS-specific app-data directory. Nothing is uploaded unless you explicitly enable cloud deployment or use a cloud AI provider. Plugins that ship local models (e.g. the Artist plugin's image-gen + Gemini vision) download the model files on first use.

The Windows build uses ONNX Runtime for embedding when the vector-knowledge-base feature is enabled; this is the largest single dependency in that case.

:::tip
If you see the app feel slow during a multi-agent run, open the Health tab — it shows which agents and which dependencies (model calls, tool calls, ONNX inference) are contributing to the load.
:::
  `,

  "where-to-get-help": `
## Where to Get Help

You're never stuck. **In-app help** is the fastest path: the cockpit chat ("Talk to Athena" in the title bar) is an LLM-powered companion that knows your setup, your recent executions, and the product. Ask it questions in plain English and it can also propose configuration changes, link you to the right tab, or open a debug session on a failing run.

For things the in-app companion can't answer, the **guide** (this site) is the long-form reference, the **community Discord** is where you ask other users and the team, and **email support** is for account or billing issues.

| Resource | Best for | Response time |
|----------|----------|---------------|
| Cockpit / Athena (in-app) | Setup questions, debugging, "where is X?" | Instant |
| This Guide | Feature reference and how-tos | Instant |
| Documentation site | Architecture, schema, advanced integrations | Instant |
| Discord community | Tips, recipes, "is anyone else seeing…?" | Minutes |
| Support email | Account, billing, security | Hours |
| Video tutorials | Visual walkthroughs of key flows | Instant |

### How It Works

The cockpit has access to a doctrine — a curated body of knowledge about the product — and to your local state (anonymized). It can search your executions, recommend changes, and even compose inline UI cards to walk you through a fix step by step. If it can't answer, it'll suggest the right external resource.

:::tip
For "I think something's broken" questions, open Athena first and ask "diagnose the last failing run of agent X". The cockpit's debug flow is built for this and usually beats reading logs manually.
:::
  `,

  "browsing-templates": `
## Browsing Templates

Don't start from a blank page. The template gallery is a library of pre-built agents — each one designed for a real job, tested, and ready to specialize to your setup. Templates cover everything from monitoring and reporting to content workflows and developer tooling. Finding the right one takes less time than writing a prompt from scratch.

Each card in the gallery tells you what the agent does, how complex it is to set up, and roughly how long adoption takes. Below that you see the **connectors** the template needs — services like Slack, Notion, GitHub, or a cloud storage provider — and whether you already have matching credentials in your vault. A small readiness indicator on each connector chip tells you at a glance: green means you're good to go, amber means you have a partial match, and grey means you'd need to add that credential before the template can run.

### Coverage Filter

The filter strip at the top of the gallery — **All / Ready / Partial / Drafts** — lets you narrow to what matters right now:

- **Ready** — every connector the template needs is already in your vault. These are the fastest path to a running agent.
- **Partial** — some connectors are matched, some aren't. Worth browsing if you're planning to add credentials soon.
- **Drafts** — unpublished templates, visible only in development builds.

Start on Ready if you want to be running something within minutes.

### Comparing Templates

When you're deciding between a few options, you don't have to open each one individually. Select up to three cards (hover reveals a checkbox) and click **Compare** — a side-by-side modal lines them up across category, goal, connectors, triggers, use-cases, complexity, and setup time. Rows where the templates differ get highlighted so the differences are easy to spot. You can adopt directly from the compare view without going back to the gallery.

### Trending Quick-Adopt

The top of the gallery carries a shelf of trending templates — the most frequently adopted across all users. Each card has a hover-revealed **Adopt** action that opens the adoption flow directly, skipping the detail modal if you've already made up your mind.

:::tip
Start on the **Ready** filter — those templates match what's already in your vault and can be running in minutes. Once you've shipped one or two, browse **Partial** to see what new credentials would unlock.
:::
  `,

  "adopting-a-template": `
## Adopting a Template

Adopting a template is the fastest way to get a working, configured agent. The flow takes you from the gallery to a promoted agent in a few minutes — and every step along the way is reversible.

:::steps
1. **Click Adopt** — from the gallery card, the detail modal, the compare view, or the trending shelf. The adoption wizard opens. Nothing is written to the database yet; you can close freely at this stage.
2. **Answer the questionnaire** — the form presents one question at a time. On the right, a live brief shows your answers building up in real time. Questions cover things like which workspace or project to target, what output format you want, and how the agent should handle errors. Your answers will fill \`{{placeholder}}\` slots in the agent's prompt, specializing it to your setup.
3. **Automatic test** — once you submit, the agent is assembled from the template and your answers, then run once automatically. This confirms the configuration is valid against your credentials and connectors before anything is promoted to production.
4. **Promote** — if the test passes, the agent is promoted and becomes a real, editable agent on your Agents page. The wizard navigates you there automatically.
:::

### Vault Auto-Matching

Credentials already in your vault are detected and filled automatically. When the questionnaire has a connector question and you have exactly one matching credential, it's pre-selected and marked with an **auto** badge — you don't need to pick it manually. If you have multiple matching credentials, the question narrows the available choices to just what you have.

If a template needs a connector you haven't added yet, that question is **blocked** — a banner appears at the top of the form explaining which credential category is missing and showing an **Add credential** button. Clicking it deep-links you to the credential catalog, pre-filtered to the right category, and saves your in-progress answers as a draft. When you return to the template after adding the credential, your answers are restored and the blocked question unlocks.

### How Your Answers Shape the Agent

Behind the scenes, your answers are substituted into the prompt at two levels. First, any \`{{param.aq_*}}\` placeholders in the template's prompt are replaced with your actual values. Second, a \`## User Configuration\` section is appended to the system prompt listing every question and answer, so the model always has the full context of your setup regardless of whether a specific placeholder exists. The test run and the promoted agent both use your real configuration — not the generic template defaults.

:::tip
If a question isn't clear, look for the **ⓘ** icon on the right of the question label. Clicking it expands a tip with more context about what the question affects and what a good answer looks like.
:::
  `,

  "recipes": `
## Recipes

Recipes are hundreds of ready-to-run use cases derived from templates, organized around what they accomplish. Where a template is a full agent configuration, a recipe is a concrete example of a job that agent can do — specific, actionable, and close to something you might actually have on your to-do list.

You find them under the **Templates → Recipes** tab. The full catalog is sortable and searchable: browse by name, filter by category, or scan the connector icons to find use cases that match what you already have connected.

### Categories

Recipes are organized into nine buckets:

- **Monitoring** — watching for changes, alerts, thresholds
- **Reporting** — generating summaries, digests, and dashboards
- **Automation** — repetitive actions that run on a schedule or trigger
- **Communication** — messages, notifications, and routing
- **Data sync** — keeping two systems in agreement
- **Analysis** — synthesizing information and producing insights
- **Development** — code review, test generation, deploy checks
- **Content** — drafting, editing, publishing
- **Productivity** — personal and team workflow helpers

### The Recipes Table

The main view is a sortable table. Each row shows the recipe name (with search-match highlighting when you've typed a query), its category badge, and a strip of connector icons showing which services it needs — up to three icons, with an overflow count for templates that need more. Click any row to open the recipe detail panel.

The detail panel gives you the full picture: what the recipe does, what it needs (connectors and any specific bindings), how it handles errors, and whether the current agent has already adopted it. If you've already adopted a recipe for the active agent, the row shows a green **Adopted** chip.

### Team Presets

If you're setting up a full workflow rather than a single agent, look for **team presets** — bundles of templates that are adopted together in one flow. A preset covers a coherent job (like a full content pipeline or a developer productivity suite) where multiple agents hand work to each other.

:::tip
Recipes are the fastest way to find a concrete example close to a job you have in mind. If you know what outcome you want but aren't sure which template to start with, search the Recipes tab first — the specific use-case descriptions are often easier to match against a job than the broader template names.
:::
  `,

  "interface-modes": `
## Interface Modes

Personas has two interface modes: **Simple** and **Power**. They run the same app — same components, same data, same agents — with Simple hiding the surfaces that non-technical users rarely need. Nothing is removed; everything is just shown or hidden depending on which mode you're in.

:::compare
**Simple**
Opt-in. Four screens: Home, Agents, Connections, Settings. Advanced surfaces — Overview, Workflows, Events, Templates, Plugins, advanced triggers, and the full editor tab set — are hidden. Execution shows as a clean progress bar and formatted result rather than a raw token stream. Good for users who want to run agents, not build them.
---
**Power** [recommended]
The default for most people. The full app. All sidebar sections, all editor tabs (Prompt, Matrix, Lab, Activity, Health, Settings), all trigger types (schedule, webhook, file watcher, clipboard, chain, and event triggers), the full vault with playground and dependency graph, monitoring via Overview, Director, and everything else. The mode most users graduate into once they have a few agents running.
:::

### What Simple Hides

In Simple mode the sidebar narrows to four sections: **Home**, **Agents**, **Connections**, and **Settings**. Overview, Workflows, Events, Templates, Plugins, and other advanced sections don't appear in the nav.

Inside Agents, the editor shows only the **Prompt**, **Chat**, and **Connectors** tabs. The Matrix editor, Lab arena, Activity log, Health tab, version history, condition builder, tool configuration panel, advanced settings, and advanced trigger types are all hidden. The only trigger visible is **Manual** (the Run button).

Execution output is simplified: instead of a streaming terminal with raw token output, you see a progress bar while the agent runs and a formatted, readable result when it finishes. Cost and token counts are not shown.

In Connections, the credential list shows a simplified view — add, test, and delete a credential. The credential playground, vector knowledge base, database connection manager, bulk actions, and health scoring are hidden.

### Switching Modes

Go to **Settings → Appearance → Interface Mode** and select Simple or Power. The change takes effect immediately — no restart needed.

The guide you're reading right now has its own Simple / Power toggle in the sidebar. Switching the guide's mode filters topics to match: Simple mode shows core topics, Power mode reveals advanced sections. The two toggles are independent — you can read Power-mode guide topics while running the app in Simple mode.

:::tip
Start in Simple mode if you're new to Personas. Once you have a couple of agents running and want to tune schedules, set up webhook triggers, or dig into execution traces, switch to Power — everything you built in Simple mode carries over exactly as-is.
:::
  `,
};
