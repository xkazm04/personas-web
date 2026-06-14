import type { GuideTopic } from "./types";

export const GUIDE_TOPICS: GuideTopic[] = [
  // ─── Getting Started (12) ───────────────────────────────────────────
  {
    id: "installing-personas",
    categoryId: "getting-started",
    title: "Installing Personas",
    description:
      "How to download and install Personas on Windows. The installer is a single file — install Claude Code first, then run the Personas installer and you're ready to go in under a minute. macOS and Linux builds are on the roadmap.",
    tags: ["getting-started", "install", "setup", "download", "windows", "claude-code", "roadmap"],
  },
  {
    id: "creating-your-first-agent",
    categoryId: "getting-started",
    title: "Your first agent",
    description:
      "A step-by-step walkthrough of building your very first AI agent. You'll go from a blank slate to a working agent in about five minutes. By the end, you'll have a personal assistant that can carry out a real task for you.",
    tags: ["getting-started", "first-agent", "tutorial", "walkthrough", "beginner"],
    coverage: {
      screenshotRecipe: "tools/guide-screenshots/recipes/creating-your-first-agent.yaml",
    },
  },
  {
    id: "understanding-the-interface",
    categoryId: "getting-started",
    title: "App interface",
    description:
      "A tour of the main screen, sidebar, and navigation, plus the keyboard shortcuts that speed up everyday work. Learn where everything lives so you can move around the app with confidence — and once you know a few key combinations, most tasks become almost instant.",
    tags: ["getting-started", "interface", "navigation", "sidebar", "tour", "keyboard", "shortcuts", "productivity"],
    coverage: {
      screenshotRecipe: "tools/guide-screenshots/recipes/understanding-the-interface.yaml",
    },
  },
  {
    id: "what-is-an-ai-agent",
    categoryId: "getting-started",
    title: "What is an AI agent?",
    description:
      "A plain-English explanation of what agents are and what they can do for you. An agent is like a smart assistant that follows your instructions to complete tasks automatically. No programming knowledge required to understand or use them.",
    tags: ["getting-started", "agent", "basics", "introduction", "concept"],
  },
  {
    id: "running-your-first-automation",
    categoryId: "getting-started",
    title: "Running your first automation",
    description:
      "How to execute an agent and see it work. You'll press a button, watch your agent carry out a task, and review the results. It's like hitting play on a recipe — your agent does the cooking.",
    tags: ["getting-started", "run", "execute", "automation", "first-run"],
  },
  {
    id: "choosing-your-ai-provider",
    categoryId: "getting-started",
    title: "Choosing your AI provider",
    description:
      "How to connect Claude, OpenAI, or other AI services to power your agents. Each provider has different strengths, and you can switch anytime. We'll help you pick the best fit for your needs and budget.",
    tags: ["getting-started", "provider", "claude", "openai", "ai-model", "setup"],
    devOnly: true,
    coverage: {
      screenshotRecipe: "tools/guide-screenshots/recipes/choosing-your-ai-provider.yaml",
    },
  },
  {
    id: "system-requirements",
    categoryId: "getting-started",
    title: "System requirements",
    description:
      "What your computer needs to run Personas smoothly. The app is lightweight and works on most modern computers. We'll tell you the minimum specs and what's recommended for the best experience.",
    tags: ["getting-started", "requirements", "hardware", "compatibility", "performance"],
  },
  {
    id: "where-to-get-help",
    categoryId: "getting-started",
    title: "Where to get help",
    description:
      "Discord community, documentation, and support resources all in one place. Whether you prefer chatting with other users, reading guides, or submitting a support request, we've got you covered. You're never stuck alone.",
    tags: ["getting-started", "help", "support", "discord", "community", "documentation"],
  },

  {
    id: "browsing-templates",
    categoryId: "getting-started",
    title: "Browsing the template gallery",
    description:
      "Start from a ready-made agent instead of a blank page. The template gallery is a library of pre-built agents for real jobs — each one lists what it does, which connectors it needs, and how long setup takes. Filter by how ready a template is for your setup, compare a few side by side, and preview its use cases before you commit.",
    tags: ["getting-started", "templates", "gallery", "browse", "prebuilt"],
    mode: "both",
  },
  {
    id: "adopting-a-template",
    categoryId: "getting-started",
    title: "Adopting a template",
    description:
      "Turn a template into your own working agent with a short guided setup. A one-question-at-a-time form collects what the agent needs, and credentials you already saved in the vault are matched and filled in for you. The agent is tested once on your setup before it's promoted, so you start from something that already works.",
    tags: ["getting-started", "templates", "adopt", "questionnaire", "vault", "setup"],
    mode: "both",
  },
  {
    id: "recipes",
    categoryId: "getting-started",
    title: "Recipes",
    description:
      "Browse hundreds of ready-to-run use cases drawn from the templates, grouped by what they accomplish — monitoring, reporting, automation, communication, data sync, analysis, and more. Recipes are the fastest way to see concrete examples of what agents can do and to find one close to the job you have in mind.",
    tags: ["getting-started", "templates", "recipes", "use-cases", "examples"],
    mode: "power",
  },
  {
    id: "interface-modes",
    categoryId: "getting-started",
    title: "Interface modes: Simple & Power",
    description:
      "Personas can show you a stripped-down workspace or the full toolkit. Simple mode keeps just a few screens and hides advanced options so you can create, run, and review an agent in a handful of clicks; Power mode reveals everything — the team canvas, monitoring, every trigger type, and the full vault. Switch anytime in Settings; nothing is removed, only shown or tucked away.",
    tags: ["getting-started", "interface", "modes", "simple", "power", "settings"],
    mode: "both",
  },

  // ─── Agents & Prompts (12) ──────────────────────────────────────────
  {
    id: "creating-a-new-agent",
    categoryId: "agents-prompts",
    title: "Creating a new agent",
    description:
      "How to set up an agent with a name, icon, and purpose. Giving your agent a clear identity helps you stay organized as your collection grows. You'll also choose which AI model powers it and what tools it can use.",
    tags: ["agents-prompts", "create", "new-agent", "setup", "configuration"],
  },
  {
    id: "writing-effective-prompts",
    categoryId: "agents-prompts",
    title: "Writing effective prompts",
    description:
      "Tips for writing instructions your agent will follow precisely. Good prompts are like good recipes — clear, specific, and in the right order. Small wording changes can dramatically improve your agent's results.",
    tags: ["agents-prompts", "prompts", "writing", "instructions", "best-practices"],
  },
  {
    id: "simple-vs-structured-prompt-mode",
    categoryId: "agents-prompts",
    title: "Simple vs structured prompt mode",
    description:
      "When to use plain text vs the advanced multi-section editor. Simple mode is great for quick tasks — just type what you want. Structured mode gives you separate sections for identity, instructions, and examples, which helps with more complex agents.",
    tags: ["agents-prompts", "simple-mode", "structured-mode", "prompt-editor"],
  },
  {
    id: "structured-prompt-sections-explained",
    categoryId: "agents-prompts",
    title: "Structured prompt sections explained",
    description:
      "What each section — identity, instructions, tools, examples, and error handling — does for your agent. Think of these sections like chapters in a handbook you're writing for a new employee. Each one gives your agent a different kind of guidance.",
    tags: ["agents-prompts", "structured-prompt", "sections", "identity", "instructions"],
  },
  {
    id: "agent-settings-and-limits",
    categoryId: "agents-prompts",
    title: "Agent settings and limits",
    description:
      "Configuring timeouts, concurrency, budget caps, and max turns. These settings act like guardrails — they keep your agent from running too long or spending too much. Set them once and your agents stay well-behaved.",
    tags: ["agents-prompts", "settings", "limits", "timeout", "budget", "concurrency"],
  },
  {
    id: "assigning-tools-to-agents",
    categoryId: "agents-prompts",
    title: "Assigning tools to agents",
    description:
      "Giving your agent access to specific capabilities like sending emails, reading files, or searching the web. Tools are like apps on a phone — your agent can only use the ones you install. This keeps things safe and focused.",
    tags: ["agents-prompts", "tools", "capabilities", "permissions", "assign"],
  },
  {
    id: "prompt-version-history",
    categoryId: "agents-prompts",
    title: "Prompt version history",
    description:
      "How every change to your prompt is tracked so you can always go back. Each time you save, a snapshot is created automatically. If a change makes things worse, you can restore any previous version with one click.",
    tags: ["agents-prompts", "version-history", "snapshots", "rollback", "undo"],
  },
  {
    id: "comparing-prompt-versions",
    categoryId: "agents-prompts",
    title: "Comparing prompt versions",
    description:
      "Side-by-side diffs to see exactly what changed between two versions of your prompt. Additions are highlighted in green, removals in red — just like tracking changes in a document. This makes it easy to understand what improved or broke your agent.",
    tags: ["agents-prompts", "compare", "diff", "versions", "changes"],
  },
  {
    id: "cloning-and-duplicating-agents",
    categoryId: "agents-prompts",
    title: "Cloning and duplicating agents",
    description:
      "Creating copies of your agents to experiment without risk. Cloning lets you try new ideas on a duplicate while your original stays untouched. It's the safest way to improve an agent that's already working well.",
    tags: ["agents-prompts", "clone", "duplicate", "copy", "experiment"],
  },
  {
    id: "agent-groups-and-organization",
    categoryId: "agents-prompts",
    title: "Agent groups and organization",
    description:
      "Keeping your agents organized with folders and labels. As your agent collection grows, groups help you find what you need quickly. You can drag and drop agents between groups and collapse sections you're not using.",
    tags: ["agents-prompts", "groups", "organization", "folders", "labels"],
  },
  {
    id: "disabling-and-archiving-agents",
    categoryId: "agents-prompts",
    title: "Disabling and archiving agents",
    description:
      "Safely pausing or removing agents you no longer need. Disabling an agent stops it from running but keeps all its settings intact. Archiving tucks it away so your workspace stays clean without losing anything.",
    tags: ["agents-prompts", "disable", "archive", "pause", "remove"],
  },
  {
    id: "agent-health-indicators",
    categoryId: "agents-prompts",
    title: "Agent health indicators",
    description:
      "Understanding the status dots and what they mean. Green means everything is running smoothly, yellow means something needs attention, and red means there's a problem to fix. These indicators let you spot issues at a glance without digging into logs.",
    tags: ["agents-prompts", "health", "status", "indicators", "diagnostics"],
  },

  // ─── Triggers & Scheduling (10) ─────────────────────────────────────
  {
    id: "how-triggers-work",
    categoryId: "triggers",
    title: "How triggers work",
    description:
      "Understanding the different ways to start your agents automatically. Triggers are like alarm clocks for your agents — they wake up and do their job when the right condition is met. You can mix and match trigger types for maximum flexibility.",
    tags: ["triggers", "automation", "basics", "overview", "start"],
  },
  {
    id: "manual-triggers",
    categoryId: "triggers",
    title: "Manual triggers",
    description:
      "Running agents on demand with one click. Sometimes you just want to press a button and let your agent do its thing. Manual triggers are the simplest way to start an agent whenever you need it.",
    tags: ["triggers", "manual", "on-demand", "button", "run"],
  },
  {
    id: "schedule-triggers",
    categoryId: "triggers",
    title: "Schedule triggers",
    description:
      "Setting agents to run at specific times — hourly, daily, or on a custom schedule. It's like setting a recurring alarm that tells your agent when to wake up and work. Perfect for routine tasks you want handled automatically.",
    tags: ["triggers", "schedule", "cron", "recurring", "timer", "daily"],
  },
  {
    id: "webhook-triggers",
    categoryId: "triggers",
    title: "Webhook triggers",
    description:
      "Receiving data from external services to start your agents. A webhook is like a doorbell — when another app rings it, your agent answers. This lets services like Stripe, GitHub, or Shopify kick off your agents automatically.",
    tags: ["triggers", "webhook", "external", "api", "integration"],
  },
  {
    id: "clipboard-monitor",
    categoryId: "triggers",
    title: "Clipboard monitor",
    description:
      "Agents that activate when you copy specific text to your clipboard. Imagine copying a customer email and having your agent instantly draft a reply. The clipboard monitor watches what you copy and springs into action when it matches your rules.",
    tags: ["triggers", "clipboard", "copy", "paste", "monitor", "text"],
  },
  {
    id: "file-watcher-triggers",
    categoryId: "triggers",
    title: "File watcher triggers",
    description:
      "Agents that respond when files are created or changed in a folder you specify. Drop a spreadsheet into a folder and your agent processes it automatically. It's like having an assistant who watches your inbox tray and handles each new document.",
    tags: ["triggers", "file-watcher", "folder", "files", "automatic"],
  },
  {
    id: "chain-triggers",
    categoryId: "triggers",
    title: "Chain triggers",
    description:
      "One agent's output automatically starts the next agent in line. Chains let you build assembly lines where each agent handles one step and passes the result forward. This is how you turn simple agents into powerful multi-step workflows.",
    tags: ["triggers", "chain", "sequence", "pipeline", "workflow"],
  },
  {
    id: "event-based-triggers",
    categoryId: "triggers",
    title: "Event-based triggers",
    description:
      "Agents that listen for custom events happening in your system. Events are like announcements — when something noteworthy happens, interested agents hear about it and react. This is great for building responsive, real-time automations.",
    tags: ["triggers", "events", "listener", "real-time", "reactive"],
  },
  {
    id: "combining-multiple-triggers",
    categoryId: "triggers",
    title: "Combining multiple triggers",
    description:
      "Using several trigger types together for complex workflows. A single agent can have a schedule, a webhook, and a manual button all at once. This means your agent is ready to work no matter how the need arises.",
    tags: ["triggers", "multiple", "combine", "advanced", "flexibility"],
  },
  {
    id: "testing-and-debugging-triggers",
    categoryId: "triggers",
    title: "Testing and debugging triggers",
    description:
      "Making sure your triggers fire correctly before you rely on them. The trigger tester lets you simulate events and see exactly what would happen. Catching problems early saves you from missed automations and unexpected behavior.",
    tags: ["triggers", "testing", "debugging", "simulate", "verify"],
  },

  // ─── Credentials & Security (10) ────────────────────────────────────
  {
    id: "how-personas-keeps-your-data-safe",
    categoryId: "credentials",
    title: "Data safety",
    description:
      "An overview of the encryption and security model that protects your information. Your passwords and keys are locked in an encrypted vault on your own computer — they never leave your device. You're in full control of your data at all times.",
    tags: ["credentials", "security", "encryption", "privacy", "safety"],
  },
  {
    id: "adding-a-new-credential",
    categoryId: "credentials",
    title: "Adding a new credential",
    description:
      "A step-by-step guide to storing API keys and passwords so your agents can use them. The process takes about 30 seconds — paste your key, give it a name, and you're done. Your credential is encrypted immediately and ready for your agents to use.",
    tags: ["credentials", "add", "api-key", "password", "store"],
  },
  {
    id: "credential-health-checks",
    categoryId: "credentials",
    title: "Credential health checks",
    description:
      "Making sure your stored credentials still work. Over time, API keys can expire or permissions can change. Health checks test each credential automatically and flag any that need your attention before they cause problems.",
    tags: ["credentials", "health-check", "validation", "expiry", "status"],
  },
  {
    id: "auto-credential-browser",
    categoryId: "credentials",
    title: "Auto-credential browser",
    description:
      "Let AI help you find and configure credentials automatically. Instead of hunting through documentation for the right settings, the auto-browser walks you through each service's setup. It's like having a tech-savvy friend looking over your shoulder.",
    tags: ["credentials", "auto-browser", "automatic", "discovery", "setup"],
  },
  {
    id: "which-agents-use-which-credentials",
    categoryId: "credentials",
    title: "Which agents use which credentials",
    description:
      "Tracking credential usage across your agents. A clear map shows you which agents rely on which credentials. This is especially helpful before you delete or rotate a key — you'll know exactly what might be affected.",
    tags: ["credentials", "usage", "tracking", "agents", "dependencies"],
  },
  {
    id: "refreshing-expired-tokens",
    categoryId: "credentials",
    title: "Refreshing expired tokens",
    description:
      "What happens when credentials expire and how to fix it. Some services require you to renew your access periodically, like renewing a library card. Personas warns you before expiration and makes refreshing as easy as clicking a button.",
    tags: ["credentials", "refresh", "expired", "token", "renew"],
  },
  {
    id: "connector-catalog",
    categoryId: "credentials",
    title: "Connector catalog",
    description:
      "Browsing the 40+ built-in service integrations ready to use. From email providers to cloud storage, each connector comes pre-configured so you don't have to figure out the technical details. Just pick a service, sign in, and your agents can start using it.",
    tags: ["credentials", "connectors", "integrations", "catalog", "services"],
  },

  // ─── Pipelines & Teams (12) ─────────────────────────────────────────
  {
    id: "team-assignments",
    categoryId: "pipelines",
    title: "Team assignments",
    description:
      "Give a team a goal in plain language and let it organize the work itself. Instead of wiring every step by hand, you describe what you want; the team breaks it into a checklist, picks the right agent for each part, and runs them in parallel — pausing for your review only when something needs a decision.",
    tags: ["pipelines", "assignments", "goals", "orchestration", "delegation"],
  },
  {
    id: "team-memory-and-goals",
    categoryId: "pipelines",
    title: "Team memory & goals",
    description:
      "How a team stays coherent over time and how you steer it without micromanaging. Teams build up shared memory — the decisions and constraints that flow into every member's next run, so the team converges instead of repeating itself. Link a team to a goal and you can stay high-level: progress is tracked and the app surfaces only what actually needs you.",
    tags: ["pipelines", "teams", "memory", "goals", "orchestration", "oversight"],
  },
  {
    id: "what-are-pipelines",
    categoryId: "pipelines",
    title: "What are pipelines?",
    description:
      "How multiple agents work together to handle complex tasks. A pipeline is like an assembly line — each agent does one job and passes the result to the next. This lets you break big problems into small, manageable steps.",
    tags: ["pipelines", "multi-agent", "workflow", "basics", "overview"],
  },
  {
    id: "the-team-canvas",
    categoryId: "pipelines",
    title: "The team canvas",
    description:
      "Using the visual drag-and-drop editor to build pipelines. The canvas is your workspace for arranging agents and drawing connections between them. It's as intuitive as arranging sticky notes on a whiteboard.",
    tags: ["pipelines", "canvas", "visual-editor", "drag-and-drop", "design"],
  },
  {
    id: "adding-agents-to-a-pipeline",
    categoryId: "pipelines",
    title: "Adding agents to a pipeline",
    description:
      "Placing and configuring agents on the canvas. Drag an agent from your library onto the canvas, position it where you want, and adjust its settings for this specific pipeline. Each agent can behave differently depending on where it's used.",
    tags: ["pipelines", "add-agent", "canvas", "configure", "placement"],
  },
  {
    id: "connecting-agents-with-data-flow",
    categoryId: "pipelines",
    title: "Connecting agents with data flow",
    description:
      "Drawing connections so one agent's output feeds the next. Click and drag from one agent to another to create a connection. Data flows along these lines like water through pipes — the output of one step becomes the input of the next.",
    tags: ["pipelines", "connections", "data-flow", "wiring", "output-input"],
  },
  {
    id: "pipeline-execution",
    categoryId: "pipelines",
    title: "Pipeline execution",
    description:
      "Running a complete multi-agent workflow and watching it work. When you hit run, each agent lights up as it processes its step. You can watch the data flow through your pipeline in real time, like watching dominoes fall in sequence.",
    tags: ["pipelines", "execution", "run", "real-time", "workflow"],
  },
  {
    id: "conditional-routing",
    categoryId: "pipelines",
    title: "Conditional routing",
    description:
      "Sending data to different agents based on conditions. Sometimes you need your pipeline to take different paths depending on the situation — like sorting mail into different boxes. Conditional routing lets your pipeline make smart decisions about what to do next.",
    tags: ["pipelines", "conditional", "routing", "branching", "logic"],
  },
  {
    id: "team-members-and-roles",
    categoryId: "pipelines",
    title: "Team members and roles",
    description:
      "Assigning specific responsibilities to agents in a team. Each agent on your team has a role — researcher, writer, reviewer, and so on. Clear roles help agents work together without stepping on each other's toes.",
    tags: ["pipelines", "team", "roles", "members", "collaboration"],
  },
  {
    id: "pipeline-run-history",
    categoryId: "pipelines",
    title: "Pipeline run history",
    description:
      "Reviewing past executions and their results. Every pipeline run is recorded with timestamps, inputs, outputs, and status for each step. This makes it easy to understand what happened and troubleshoot any issues.",
    tags: ["pipelines", "history", "logs", "past-runs", "review"],
  },
  {
    id: "pipeline-templates",
    categoryId: "pipelines",
    title: "Pipeline templates",
    description:
      "Starting from pre-built multi-agent workflows instead of building from scratch. Templates give you a working pipeline that you can customize to fit your needs. It's like using a recipe as a starting point and adjusting the ingredients to your taste.",
    tags: ["pipelines", "templates", "pre-built", "starter", "quickstart"],
  },
  {
    id: "debugging-pipeline-issues",
    categoryId: "pipelines",
    title: "Debugging pipeline issues",
    description:
      "Finding and fixing problems in multi-agent flows. When a pipeline doesn't work as expected, the debugger highlights exactly where things went wrong. You can inspect the data at each step to pinpoint the issue without guesswork.",
    tags: ["pipelines", "debugging", "troubleshooting", "errors", "fix"],
  },

  // ─── Testing & Optimization (12) ────────────────────────────────────
  {
    id: "why-test-your-agents",
    categoryId: "testing",
    title: "Why test your agents?",
    description:
      "How testing helps you build more reliable automations. Testing is like a dress rehearsal — it lets you catch mistakes before they matter. A few minutes of testing can save hours of fixing problems later.",
    tags: ["testing", "reliability", "quality", "basics", "introduction"],
  },
  {
    id: "the-testing-lab-overview",
    categoryId: "testing",
    title: "The Testing Lab overview",
    description:
      "Understanding Arena, A/B, Matrix, and Eval — the four testing modes at your disposal. Each mode answers a different question about your agent's performance. This overview helps you pick the right test for what you're trying to learn.",
    tags: ["testing", "testing-lab", "overview", "arena", "ab-test", "matrix", "eval"],
  },
  {
    id: "arena-testing",
    categoryId: "testing",
    title: "Measuring a version",
    description:
      "The Measure action behind every rating: open the Arena on a prompt version, pick the models, and run them in parallel to score that version. Like a talent show where the models compete on one version's prompt and the scores land back in the table.",
    tags: ["testing", "arena", "measure", "model-comparison", "evaluate"],
  },
  {
    id: "ab-testing-prompts",
    categoryId: "testing",
    title: "Comparing versions",
    description:
      "Evaluating a prompt edit without a separate A/B mode — measure the old and new versions on the same model and read their rows in the table. Pin a baseline and the Δ column flags regressions for you.",
    tags: ["testing", "comparison", "versions", "baseline", "optimization"],
  },
  {
    id: "matrix-testing",
    categoryId: "testing",
    title: "Improving with Athena",
    description:
      "When a version scores low but you're not sure how to fix it, the Improve action hands it to the Athena companion with its weakest metric pre-filled. You say what to focus on; Athena drafts the next version to measure.",
    tags: ["testing", "improve", "athena", "iteration", "prompts"],
  },
  {
    id: "eval-testing",
    categoryId: "testing",
    title: "The ratings grid",
    description:
      "The Versions & Ratings table is the version × model grid — every measured version as a row per model, the best cell starred, the live config marked Active. Activate the winning prompt + model in one click.",
    tags: ["testing", "grid", "ratings", "versions", "models"],
  },
  {
    id: "rating-and-scoring-results",
    categoryId: "testing",
    title: "Rating and scoring results",
    description:
      "How to evaluate and vote on test outputs. After a test runs, you can rate each result with a thumbs up, thumbs down, or a star rating. Your feedback teaches the system which outputs match your standards.",
    tags: ["testing", "rating", "scoring", "voting", "feedback"],
  },
  {
    id: "genome-evolution-basics",
    categoryId: "testing",
    title: "Genome evolution basics",
    description:
      "How Personas automatically breeds better prompts over time. Think of it like plant breeding — the best-performing prompts are combined to create even better ones. Each generation gets a little closer to the perfect instructions for your task.",
    tags: ["testing", "genome", "evolution", "breeding", "optimization"],
  },
  {
    id: "running-a-breeding-cycle",
    categoryId: "testing",
    title: "Running a breeding cycle",
    description:
      "Starting an evolution run and understanding generations. You select a starting prompt, set your goals, and let the system create and test new variations automatically. Each cycle produces a new generation of improved candidates.",
    tags: ["testing", "breeding", "cycle", "generations", "run"],
  },
  {
    id: "adopting-evolved-prompts",
    categoryId: "testing",
    title: "Adopting evolved prompts",
    description:
      "Promoting the best-performing variants to production. When evolution finds a prompt that outperforms your current one, you can adopt it with a single click. Your agent instantly starts using the improved instructions.",
    tags: ["testing", "adopt", "promote", "production", "upgrade"],
  },
  {
    id: "fitness-scoring-explained",
    categoryId: "testing",
    title: "Fitness scoring explained",
    description:
      "How the system measures which prompts perform best. Fitness scores combine your ratings, speed, cost, and output quality into one easy-to-read number. Higher scores mean better prompts — no complicated math required on your part.",
    tags: ["testing", "fitness", "scoring", "metrics", "performance"],
  },
  {
    id: "test-history-and-trends",
    categoryId: "testing",
    title: "Test history and trends",
    description:
      "Tracking improvement over time with charts and comparisons. Every test result is saved so you can see how your agents have gotten better week by week. Trend lines show you whether your changes are moving in the right direction.",
    tags: ["testing", "history", "trends", "progress", "charts"],
  },

  // ─── Memories & Knowledge (10) ──────────────────────────────────────
  {
    id: "how-agent-memory-works",
    categoryId: "memories",
    title: "How agent memory works",
    description:
      "Your agents remember past tasks and learn from experience. Each time an agent runs, it can store useful information for next time — like a notebook it carries from task to task. This means your agents get smarter the more you use them.",
    tags: ["memories", "basics", "learning", "experience", "overview"],
  },
  {
    id: "memory-categories",
    categoryId: "memories",
    title: "Memory categories",
    description:
      "Understanding the types of knowledge your agents store — facts, decisions, insights, learnings, and warnings. Each category serves a different purpose, like chapters in a reference book. This helps your agent recall the right knowledge at the right time.",
    tags: ["memories", "categories", "types", "facts", "insights", "knowledge"],
  },
  {
    id: "importance-levels",
    categoryId: "memories",
    title: "Importance levels",
    description:
      "How memories are ranked from routine to critical on a scale of 1 to 5. Important memories stick around longer and are recalled more often, just like how you remember big events better than everyday moments. This keeps your agent focused on what matters most.",
    tags: ["memories", "importance", "ranking", "priority", "levels"],
  },
  {
    id: "searching-agent-memories",
    categoryId: "memories",
    title: "Searching agent memories",
    description:
      "Finding specific knowledge your agents have learned. Type a keyword or phrase and instantly see every related memory across all your agents. It's like searching your email — fast, simple, and you can filter by category or date.",
    tags: ["memories", "search", "find", "query", "lookup"],
  },
  {
    id: "creating-memories-manually",
    categoryId: "memories",
    title: "Creating memories manually",
    description:
      "Teaching your agents specific facts or preferences by hand. Sometimes you want your agent to know something before it learns on its own — like briefing a new employee. Manual memories let you give your agent a head start.",
    tags: ["memories", "create", "manual", "teach", "add"],
  },
  {
    id: "memory-tiers-explained",
    categoryId: "memories",
    title: "Memory tiers explained",
    description:
      "Core, active, working, and archive — where knowledge lives and how it moves between tiers. Think of it like a filing system: frequently used memories stay on your desk, older ones go into a cabinet, and the most important are locked in a safe. This keeps your agent efficient without losing anything.",
    tags: ["memories", "tiers", "core", "active", "working", "archive"],
  },
  {
    id: "memory-and-execution",
    categoryId: "memories",
    title: "Memory and execution",
    description:
      "How past memories influence current agent decisions. When your agent starts a new task, it automatically recalls relevant memories from previous runs. This context helps it make better decisions and avoid repeating past mistakes.",
    tags: ["memories", "execution", "context", "recall", "decisions"],
  },
  {
    id: "reviewing-and-cleaning-memories",
    categoryId: "memories",
    title: "Reviewing and cleaning memories",
    description:
      "Keeping your agent's knowledge base accurate and up to date. Over time, some memories become outdated or incorrect. Regular reviews ensure your agent isn't making decisions based on old information — like spring cleaning for your agent's brain.",
    tags: ["memories", "review", "clean", "maintain", "accuracy"],
  },
  {
    id: "exporting-and-importing-memories",
    categoryId: "memories",
    title: "Exporting and importing memories",
    description:
      "Backing up or transferring agent knowledge between devices or agents. Export creates a file you can save, share, or import elsewhere. This is perfect for moving to a new computer or giving a new agent the benefit of another's experience.",
    tags: ["memories", "export", "import", "backup", "transfer"],
  },
  {
    id: "memory-best-practices",
    categoryId: "memories",
    title: "Memory best practices",
    description:
      "Tips for helping your agents learn effectively over time. Like a good study habit, the way you structure and maintain memories makes a big difference. Follow these guidelines to get the most out of your agent's learning ability.",
    tags: ["memories", "best-practices", "tips", "guidelines", "optimization"],
  },

  // ─── Monitoring & Costs (15) ────────────────────────────────────────
  {
    id: "the-monitoring-dashboard",
    categoryId: "monitoring",
    title: "The monitoring dashboard",
    description:
      "Your command center for tracking all agent activity at a glance. The dashboard shows running agents, recent results, and key metrics on one screen. It's like a flight control tower — everything you need to know, right where you need it.",
    tags: ["monitoring", "dashboard", "overview", "activity", "command-center"],
  },
  {
    id: "the-director",
    categoryId: "monitoring",
    title: "The Director — automatic agent coaching",
    description:
      "A built-in meta-agent that reviews your starred agents and scores each run 0–5 with concrete coaching notes. Star an agent to put it in the Director's scope; verdicts show as a stars column in Activity and a Director tab on each run. Can use your Obsidian Brain as long-term memory so its coaching improves over time.",
    tags: ["monitoring", "director", "coaching", "verdict", "quality", "review"],
  },
  {
    id: "execution-logs",
    categoryId: "monitoring",
    title: "Execution logs",
    description:
      "Viewing detailed records of every agent run. Each log shows what your agent did, what it produced, and how long it took. When something goes wrong, the log is the first place to look for answers.",
    tags: ["monitoring", "logs", "execution", "records", "details"],
  },
  {
    id: "real-time-activity-feed",
    categoryId: "monitoring",
    title: "Real-time activity feed",
    description:
      "Watching your agents work as it happens. The activity feed shows live updates as each agent processes its task. It's like watching a live scoreboard — you see results the moment they happen.",
    tags: ["monitoring", "real-time", "live", "activity", "feed"],
  },
  {
    id: "cost-tracking-per-agent",
    categoryId: "monitoring",
    title: "Cost tracking per agent",
    description:
      "Understanding how much each agent costs to run. Every AI call has a small cost, and this view breaks it down per agent so there are no surprises. You'll know exactly which agents are budget-friendly and which need attention.",
    tags: ["monitoring", "cost", "per-agent", "spending", "budget"],
  },
  {
    id: "cost-tracking-per-model",
    categoryId: "monitoring",
    title: "Cost tracking per model",
    description:
      "Comparing spending across AI providers. Different models charge different rates, and this view helps you see where your money goes. You might discover that switching one agent to a cheaper model saves you money without sacrificing quality.",
    tags: ["monitoring", "cost", "per-model", "providers", "comparison"],
  },
  {
    id: "success-rate-metrics",
    categoryId: "monitoring",
    title: "Success rate metrics",
    description:
      "Measuring how often your agents complete tasks correctly. A simple percentage tells you how reliable each agent is — 95% means it succeeds 19 out of 20 times. If a rate drops, you'll know it's time to review that agent's setup.",
    tags: ["monitoring", "success-rate", "reliability", "metrics", "performance"],
  },
  {
    id: "execution-tracing",
    categoryId: "monitoring",
    title: "Execution tracing",
    description:
      "Following the step-by-step path of complex agent runs. Tracing shows you every decision your agent made and every tool it used, like a detailed travel log. This is invaluable when you need to understand exactly how your agent arrived at its result.",
    tags: ["monitoring", "tracing", "steps", "path", "debugging"],
  },
  {
    id: "performance-trends",
    categoryId: "monitoring",
    title: "Performance trends",
    description:
      "Spotting improvements or regressions over time with visual charts. Trend lines show how your agents' speed, cost, and success rates change week by week. This bird's-eye view helps you celebrate wins and catch problems early.",
    tags: ["monitoring", "trends", "charts", "performance", "analytics"],
  },
  {
    id: "setting-budget-limits",
    categoryId: "monitoring",
    title: "Setting budget limits",
    description:
      "Controlling how much your agents can spend. Set a daily, weekly, or monthly cap and your agents will pause when they reach the limit. It's like setting a spending limit on a credit card — you stay in control of your costs.",
    tags: ["monitoring", "budget", "limits", "caps", "spending-control"],
  },
  {
    id: "anomaly-detection",
    categoryId: "monitoring",
    title: "Anomaly detection",
    description:
      "Getting alerted when something unusual happens with your agents. The system learns what's normal for each agent and flags anything out of the ordinary — like a sudden spike in cost or an unexpected failure. You'll be the first to know if something needs attention.",
    tags: ["monitoring", "anomaly", "alerts", "unusual", "detection"],
  },

  {
    id: "tracking-goals",
    categoryId: "monitoring",
    title: "Tracking goals",
    description:
      "Set an outcome and watch progress toward it instead of tracking runs one by one. Goals roll up to-dos, sub-goals, and the work your teams do into a single percentage, shown on a board, a map of how goals depend on each other, or a due-date timeline. Hand a goal to your AI team and it advances on its own, raising its hand only when it needs you.",
    tags: ["monitoring", "goals", "outcomes", "tracking", "teams", "progress"],
    mode: "power",
  },
  {
    id: "measuring-outcomes-with-kpis",
    categoryId: "monitoring",
    title: "Measuring outcomes with KPIs",
    description:
      "Track the numbers that tell you whether your agents are actually moving the needle. KPIs measure outcomes four ways — from your codebase, from orchestrator data, through a connector, or by hand — and show current value against target with an on-track or off-track pace read. A scan can even propose relevant KPIs for your project, each with the exact way it will be measured.",
    tags: ["monitoring", "kpis", "metrics", "outcomes", "measurement", "pace"],
    mode: "power",
  },
  {
    id: "director-verdicts-and-categories",
    categoryId: "monitoring",
    title: "Director verdicts & categories",
    description:
      "A closer look at what the Director writes when it reviews an agent. Every review gives an overall 0–5 score with a short summary, calls out what the agent is doing well, and files specific coaching notes by category — prompt, health, triggers, credentials, memory, or usefulness. Approving or rejecting a note teaches the Director your taste over time.",
    tags: ["monitoring", "director", "verdicts", "coaching", "categories", "review"],
    mode: "power",
  },
  {
    id: "director-momentum-and-stale-sweep",
    categoryId: "monitoring",
    title: "Director momentum & stale sweep",
    description:
      "How the Director keeps coaching honest across your whole fleet over time. A portfolio scorecard shows your value-delivered rate, average score, and cost per useful run; a momentum read tells you how many agents improved, held, or slipped since their last review; and a stale sweep re-reviews any starred agent that hasn't been looked at in over two weeks, so nothing drifts unnoticed.",
    tags: ["monitoring", "director", "momentum", "stale", "portfolio", "scorecard"],
    mode: "power",
  },

  // ─── Deployment & Integrations (10) ─────────────────────────────────
  {
    id: "local-vs-cloud-execution",
    categoryId: "deployment",
    title: "Local vs cloud execution",
    description:
      "Understanding when to run agents on your machine vs in the cloud. Local execution is great for testing and private data — your agents run right on your computer. Cloud execution keeps your agents running 24/7, even when your computer is off.",
    tags: ["deployment", "local", "cloud", "execution", "comparison"],
  },
  {
    id: "connecting-to-the-cloud-orchestrator",
    categoryId: "deployment",
    title: "Connecting to the cloud orchestrator",
    description:
      "Setting up 24/7 remote agent execution so your agents never sleep. The cloud orchestrator is a service that runs your agents around the clock without needing your computer turned on. Connect once and your agents are always available.",
    tags: ["deployment", "cloud", "orchestrator", "always-on", "setup"],
  },
  {
    id: "deploying-an-agent-to-the-cloud",
    categoryId: "deployment",
    title: "Deploying an agent to the cloud",
    description:
      "Publishing agents for always-on execution with a few clicks. Select an agent, choose your cloud settings, and hit deploy — it's live in seconds. Your agent will keep working on its schedule even when you close the app.",
    tags: ["deployment", "deploy", "publish", "cloud", "always-on"],
  },
  {
    id: "cloud-execution-monitoring",
    categoryId: "deployment",
    title: "Cloud execution monitoring",
    description:
      "Tracking remote agent performance and costs from your desktop. Even though your agents run in the cloud, you can monitor them from the comfort of the Personas app. See live status, costs, and results just like you would for local agents.",
    tags: ["deployment", "cloud", "monitoring", "remote", "performance"],
  },
  {
    id: "github-actions-integration",
    categoryId: "deployment",
    title: "GitHub Actions integration",
    description:
      "Triggering GitHub workflows from your agents. If your team uses GitHub, your agents can kick off build and deployment pipelines automatically. It's like giving your agent a button that starts your team's standard processes.",
    tags: ["deployment", "github", "actions", "ci-cd", "integration"],
  },
  {
    id: "gitlab-ci-cd-integration",
    categoryId: "deployment",
    title: "GitLab CI/CD integration",
    description:
      "Exporting agent configurations as GitLab pipeline YAML. Your agent setups can be turned into GitLab-compatible files that run in your existing infrastructure. This bridges the gap between your AI agents and your team's development workflow.",
    tags: ["deployment", "gitlab", "ci-cd", "yaml", "integration"],
  },
  {
    id: "n8n-workflow-integration",
    categoryId: "deployment",
    title: "n8n workflow integration",
    description:
      "Connecting Personas agents with n8n automation workflows. If you already use n8n for automation, your Personas agents can plug right in. This lets you combine AI-powered decision-making with n8n's vast library of integrations.",
    tags: ["deployment", "n8n", "workflow", "automation", "integration"],
  },
  {
    id: "byoi-bring-your-own-infrastructure",
    categoryId: "deployment",
    title: "BYOI — Bring Your Own Infrastructure",
    description:
      "Using your own cloud servers instead of managed hosting. If you prefer to run everything on your own infrastructure for compliance or cost reasons, BYOI gives you full control. You get all the benefits of cloud execution with none of the vendor lock-in.",
    tags: ["deployment", "byoi", "self-hosted", "infrastructure", "custom"],
  },
  {
    id: "syncing-desktop-and-cloud",
    categoryId: "deployment",
    title: "Syncing desktop and cloud",
    description:
      "Keeping your local and remote agents in sync. When you make changes on your desktop, they can be pushed to the cloud automatically. This ensures the version running remotely is always up to date with your latest improvements.",
    tags: ["deployment", "sync", "desktop", "cloud", "consistency"],
  },
  {
    id: "cloud-troubleshooting",
    categoryId: "deployment",
    title: "Cloud troubleshooting",
    description:
      "Fixing common cloud deployment issues. If your cloud agent isn't behaving as expected, this guide walks you through the most common causes and fixes. From connection problems to permission errors, you'll find clear steps to get back on track.",
    tags: ["deployment", "troubleshooting", "cloud", "errors", "fix"],
  },

  // ─── Troubleshooting (8) ────────────────────────────────────────────
  {
    id: "common-error-messages",
    categoryId: "troubleshooting",
    title: "Common error messages",
    description:
      "What they mean and how to fix them. Error messages can look scary, but most have simple solutions. This guide translates the most frequent errors into plain English and tells you exactly what to do.",
    tags: ["troubleshooting", "errors", "messages", "fix", "solutions"],
  },
  {
    id: "agent-not-responding",
    categoryId: "troubleshooting",
    title: "Agent not responding",
    description:
      "Steps to diagnose and fix unresponsive agents. If your agent seems frozen or stuck, don't worry — it's usually a simple fix. Follow this checklist to identify the cause and get your agent working again in minutes.",
    tags: ["troubleshooting", "unresponsive", "frozen", "stuck", "diagnose"],
  },
  {
    id: "credential-errors",
    categoryId: "troubleshooting",
    title: "Credential errors",
    description:
      "Resolving authentication and permission issues. When an agent can't connect to a service, it's usually because a password expired or a permission changed. This guide helps you pinpoint the problem and fix it without starting over.",
    tags: ["troubleshooting", "credentials", "authentication", "permissions", "access"],
  },
  {
    id: "trigger-not-firing",
    categoryId: "troubleshooting",
    title: "Trigger not firing",
    description:
      "Debugging triggers that aren't starting your agents. A trigger that doesn't fire is frustrating, but the cause is usually something small — a typo, a timing issue, or a missing permission. This guide walks you through the most common culprits.",
    tags: ["troubleshooting", "triggers", "not-firing", "debugging", "diagnose"],
  },
  {
    id: "self-healing-explained",
    categoryId: "troubleshooting",
    title: "Self-healing explained",
    description:
      "How Personas automatically recovers from failures. When something goes wrong during an agent run, the self-healing system tries to fix the problem and retry automatically. It's like having a safety net that catches most errors before you even notice them.",
    tags: ["troubleshooting", "self-healing", "recovery", "automatic", "resilience"],
  },
  {
    id: "checking-system-health",
    categoryId: "troubleshooting",
    title: "Checking system health",
    description:
      "Built-in diagnostics for your Personas installation. The health check scans your setup and reports any issues — outdated components, missing files, or configuration problems. Run it anytime something feels off for a quick assessment.",
    tags: ["troubleshooting", "health", "diagnostics", "system-check", "status"],
  },
  {
    id: "log-files-and-debugging",
    categoryId: "troubleshooting",
    title: "Log files and debugging",
    description:
      "Where to find detailed logs when something goes wrong. Log files are like a flight recorder — they capture everything that happened leading up to a problem. This guide shows you where they live and how to read the important parts.",
    tags: ["troubleshooting", "logs", "debugging", "files", "details"],
  },
  {
    id: "resetting-to-defaults",
    categoryId: "troubleshooting",
    title: "Resetting to defaults",
    description:
      "How to safely reset settings without losing your agents. If you've changed something and can't figure out what's wrong, resetting to defaults gives you a clean slate. Your agents, credentials, and memories are preserved — only your preferences go back to their original values.",
    tags: ["troubleshooting", "reset", "defaults", "settings", "safe"],
  },

  // ─── Companion / Athena (8) ─────────────────────────────────────────
  {
    id: "meet-athena",
    categoryId: "companion",
    title: "Meet Athena",
    description:
      "Athena is your built-in companion — an always-available assistant who lives in the corner of the app. Tap her avatar to open a chat, or let her float on top of your work as a movable orb. She can answer questions, explain features, and actually operate the app for you. This is the place to start.",
    tags: ["companion", "athena", "assistant", "overview", "getting-started"],
    mode: "simple",
  },
  {
    id: "chatting-with-athena",
    categoryId: "companion",
    title: "Chatting with Athena",
    description:
      "How to get the most out of a conversation with Athena. Start from a suggested prompt, type \"/\" to pick a ready-made command, or just ask in your own words. She offers quick follow-up replies and one-tap ways to make an answer shorter or add more detail, and she keeps the typing box open so you can steer her mid-thought.",
    tags: ["companion", "athena", "chat", "prompts", "slash-commands"],
    mode: "simple",
  },
  {
    id: "voice-and-hold-to-talk",
    categoryId: "companion",
    title: "Voice & hold-to-talk",
    description:
      "Talk to Athena instead of typing, and have her talk back. Press and hold her avatar to dictate a question, or use a keyboard shortcut to summon her by voice from anywhere. Your speech can be transcribed on your own machine for privacy, and her replies can be spoken aloud — even when the chat is closed.",
    tags: ["companion", "athena", "voice", "speech", "dictation", "text-to-speech"],
    mode: "both",
  },
  {
    id: "athenas-long-term-memory",
    categoryId: "companion",
    title: "Athena's long-term memory",
    description:
      "Athena remembers across conversations so you don't have to repeat yourself. She keeps facts about you and your projects, the way you like things done, and a profile she reads before every reply — and you stay in control: a short intake interview gets her started, and you can view, edit, or correct anything she's learned.",
    tags: ["companion", "athena", "memory", "brain", "identity", "privacy"],
    mode: "both",
  },
  {
    id: "proactive-check-ins",
    categoryId: "companion",
    title: "Proactive check-ins",
    description:
      "Athena can reach out first when something deserves your attention — a goal's deadline approaching, an agent that failed or is waiting on you, or a reminder you asked her to keep. Check-ins respect quiet hours and a daily limit so she stays helpful rather than noisy, and every nudge is one you can act on or dismiss.",
    tags: ["companion", "athena", "proactive", "notifications", "nudges", "reminders"],
    mode: "both",
  },
  {
    id: "guided-walkthroughs",
    categoryId: "companion",
    title: "Guided walkthroughs",
    description:
      "Ask Athena to \"show me how\" and she'll walk you through a task on the real screen. Her orb glides to each spot, the right control lights up, and she narrates the step — then waits for you to click it yourself. It's hands-on learning inside the actual app, not a video to watch.",
    tags: ["companion", "athena", "walkthrough", "tour", "help", "onboarding"],
    mode: "simple",
  },
  {
    id: "the-decision-hub",
    categoryId: "companion",
    title: "The decision hub",
    description:
      "Some actions wait for your say-so. When Athena or one of your agents wants to do something that needs approval — running an agent, changing your profile, scheduling a check-in — it shows up as a card you approve or reject. Requests from your running agents gather here too, with an approve-all option when they pile up.",
    tags: ["companion", "athena", "approvals", "decisions", "inbox", "review"],
    mode: "power",
  },
  {
    id: "operating-by-chat",
    categoryId: "companion",
    title: "Operating Personas by chat",
    description:
      "Athena isn't just an advisor — she can drive the app. Ask her to open a screen, jump to an agent's editor, build a custom home dashboard, or call a connected service, and she does it, flashing the destination so you can follow along. Two one-tap buttons give you a fleet review and a morning brief of what happened overnight.",
    tags: ["companion", "athena", "navigation", "automation", "ops", "dashboard"],
    mode: "power",
  },
];
