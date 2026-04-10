import type { GuideTopic } from "./types";

export const GUIDE_TOPICS: GuideTopic[] = [
  // ─── Getting Started (10) ───────────────────────────────────────────
  {
    id: "installing-personas",
    categoryId: "getting-started",
    title: "Installing Personas",
    description:
      "How to download and install on Windows, macOS, or Linux. The installer is a single file — download it, run it, and you're ready to go in under a minute.",
    tags: ["getting-started", "install", "setup", "download", "windows", "mac", "linux"],
  },
  {
    id: "creating-your-first-agent",
    categoryId: "getting-started",
    title: "Creating your first agent",
    description:
      "A step-by-step walkthrough of building your very first AI agent. You'll go from a blank slate to a working agent in about five minutes. By the end, you'll have a personal assistant that can carry out a real task for you.",
    tags: ["getting-started", "first-agent", "tutorial", "walkthrough", "beginner"],
  },
  {
    id: "understanding-the-interface",
    categoryId: "getting-started",
    title: "Understanding the interface",
    description:
      "A tour of the main screen, sidebar, and navigation. Learn where everything lives so you can move around the app with confidence. Think of it like a quick orientation before you start building.",
    tags: ["getting-started", "interface", "navigation", "sidebar", "tour"],
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
  },
  {
    id: "starter-vs-team-vs-builder-tiers",
    categoryId: "getting-started",
    title: "Starter vs Team vs Builder tiers",
    description:
      "What each tier unlocks and how to switch between them. Starter is free and great for trying things out, Team adds collaboration, and Builder unlocks advanced automation features. You can upgrade or downgrade anytime.",
    tags: ["getting-started", "tiers", "pricing", "plans", "upgrade"],
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
    id: "keyboard-shortcuts-and-tips",
    categoryId: "getting-started",
    title: "Keyboard shortcuts and tips",
    description:
      "Speed up your workflow with built-in shortcuts. Once you know a few key combinations, common tasks become almost instant. This guide covers the most useful shortcuts organized by what you do most.",
    tags: ["getting-started", "keyboard", "shortcuts", "productivity", "tips"],
  },
  {
    id: "where-to-get-help",
    categoryId: "getting-started",
    title: "Where to get help",
    description:
      "Discord community, documentation, and support resources all in one place. Whether you prefer chatting with other users, reading guides, or submitting a support request, we've got you covered. You're never stuck alone.",
    tags: ["getting-started", "help", "support", "discord", "community", "documentation"],
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
    title: "How Personas keeps your data safe",
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
    id: "oauth-setup-walkthrough",
    categoryId: "credentials",
    title: "OAuth setup walkthrough",
    description:
      "Connecting services like Google, GitHub, and Slack with one click. OAuth lets you log in to a service and grant access without sharing your password. It's the same secure sign-in flow you use when you click \"Sign in with Google\" on a website.",
    tags: ["credentials", "oauth", "google", "github", "slack", "connect"],
  },
  {
    id: "understanding-the-credential-vault",
    categoryId: "credentials",
    title: "Understanding the credential vault",
    description:
      "How AES-256 encryption protects your secrets on your device. Think of the vault like a bank safe — even if someone got your computer, they couldn't read your stored keys without your master password. Your secrets are scrambled using the same standard that banks use.",
    tags: ["credentials", "vault", "aes-256", "encryption", "storage"],
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
    id: "deleting-credentials-safely",
    categoryId: "credentials",
    title: "Deleting credentials safely",
    description:
      "Removing stored secrets without breaking your agents. Before deleting, Personas shows you which agents depend on that credential. You can reassign them first so nothing stops working when the old credential is removed.",
    tags: ["credentials", "delete", "remove", "safe", "cleanup"],
  },
  {
    id: "connector-catalog",
    categoryId: "credentials",
    title: "Connector catalog",
    description:
      "Browsing the 40+ built-in service integrations ready to use. From email providers to cloud storage, each connector comes pre-configured so you don't have to figure out the technical details. Just pick a service, sign in, and your agents can start using it.",
    tags: ["credentials", "connectors", "integrations", "catalog", "services"],
  },

  // ─── Pipelines & Teams (10) ─────────────────────────────────────────
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
    title: "Arena testing",
    description:
      "Comparing your agent across multiple AI models at once. Send the same task to Claude, GPT, Gemini, and others, then see which model produces the best result. It's like a talent show where AI models compete and you pick the winner.",
    tags: ["testing", "arena", "model-comparison", "benchmark", "evaluate"],
  },
  {
    id: "ab-testing-prompts",
    categoryId: "testing",
    title: "A/B testing prompts",
    description:
      "Running two prompt versions side-by-side to find the winner. Change one thing in your prompt and see if the new version performs better. This scientific approach takes the guesswork out of prompt improvement.",
    tags: ["testing", "ab-test", "comparison", "prompts", "optimization"],
  },
  {
    id: "matrix-testing",
    categoryId: "testing",
    title: "Matrix testing",
    description:
      "Generating multiple prompt variations automatically to explore what works best. The matrix creates dozens of combinations from your building blocks and tests them all. It's like trying every combination on a lock instead of guessing the code.",
    tags: ["testing", "matrix", "variations", "automated", "exploration"],
  },
  {
    id: "eval-testing",
    categoryId: "testing",
    title: "Eval testing",
    description:
      "Testing many prompts against many models in a grid. Eval mode gives you a complete picture — every prompt version tested against every model. The results appear in a clear table so you can spot the best combination instantly.",
    tags: ["testing", "eval", "grid", "comprehensive", "prompts", "models"],
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

  // ─── Monitoring & Costs (10) ────────────────────────────────────────
  {
    id: "the-monitoring-dashboard",
    categoryId: "monitoring",
    title: "The monitoring dashboard",
    description:
      "Your command center for tracking all agent activity at a glance. The dashboard shows running agents, recent results, and key metrics on one screen. It's like a flight control tower — everything you need to know, right where you need it.",
    tags: ["monitoring", "dashboard", "overview", "activity", "command-center"],
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
];
