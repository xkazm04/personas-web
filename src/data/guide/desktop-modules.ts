// ── Desktop App Module Registry ─────────────────────────────────────
// Maps guide topics to their location in the Personas desktop app.
// Used by ModuleBadge to show "Find in App: Agents → Editor → Design".
//
// Source of truth on the desktop side (verify against these on sync):
//   src/lib/navigation/registry.ts            (Level-1 rail sections)
//   src/features/shared/chrome/sidebar/sidebarData.ts (Level-2/3 items)
// The desktop guide-sync skill reads and may update this file — keep the
// module/child id shape and the TOPIC_MODULE_MAP export intact.
// ────────────────────────────────────────────────────────────────────

export interface DesktopModule {
  id: string;
  label: string;
  icon: string;
  children?: { id: string; label: string }[];
}

export interface TopicModuleRef {
  moduleId: string;
  path: string[];
  label: string;
}

// ── Module hierarchy (mirrors sidebar in the desktop app) ──────────

export const DESKTOP_MODULES: DesktopModule[] = [
  {
    id: "home",
    label: "Home",
    icon: "House",
    children: [
      { id: "welcome", label: "Welcome" },
      { id: "cockpit", label: "Cockpit" },
      { id: "learning", label: "Learning" },
      { id: "whats-new", label: "What's New" },
      { id: "system-check", label: "System Check" },
    ],
  },
  {
    // Companion (Athena) ships as a plugin: Plugins → Companion. Chat is the
    // Athena panel summoned from the title bar / orb rather than a sidebar tab.
    id: "companion",
    label: "Companion",
    icon: "Sparkles",
    children: [
      { id: "chat", label: "Chat" },
      { id: "voice", label: "Voice" },
      { id: "memory", label: "Memory" },
      { id: "setup", label: "Setup" },
      { id: "decisions", label: "Decisions" },
    ],
  },
  {
    id: "overview",
    label: "Overview",
    icon: "LayoutDashboard",
    children: [
      { id: "dashboard", label: "Dashboard" },
      { id: "incidents", label: "Incidents" },
      { id: "activity", label: "Activity" },
      { id: "approvals", label: "Approvals" },
      { id: "messages", label: "Messages" },
      { id: "events", label: "Events" },
      { id: "memories", label: "Memories" },
      { id: "patterns", label: "Patterns" },
      { id: "extracted", label: "Extracted" },
      { id: "memory-graph", label: "Graph" },
      { id: "sla", label: "Reliability" },
      { id: "health", label: "Health" },
      { id: "director", label: "Director" },
      { id: "leaderboard", label: "Leaderboard" },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    icon: "Bot",
    children: [
      { id: "all-agents", label: "All Agents" },
      { id: "editor-activity", label: "Activity" },
      { id: "editor-design", label: "Design" },
      { id: "editor-matrix", label: "Matrix" },
      { id: "editor-use-cases", label: "Use Cases" },
      { id: "editor-lab", label: "Lab" },
      { id: "editor-chat", label: "Chat" },
      { id: "editor-settings", label: "Settings" },
    ],
  },
  {
    id: "events",
    label: "Events",
    icon: "Zap",
    children: [
      { id: "live-stream", label: "Live Stream" },
      { id: "chain-studio", label: "Chain Studio" },
      { id: "speed-limits", label: "Speed Limits" },
      { id: "test", label: "Test" },
      { id: "local-relay", label: "Local Relay" },
      { id: "marketplace", label: "Marketplace" },
    ],
  },
  {
    id: "connections",
    label: "Connections",
    icon: "KeyRound",
    children: [
      { id: "credentials", label: "Credentials" },
      { id: "databases", label: "Databases" },
      { id: "catalog", label: "Catalog" },
      { id: "dependencies", label: "Dependencies" },
      { id: "broker", label: "Broker" },
      { id: "add-new", label: "Add New" },
    ],
  },
  {
    // Templates is no longer a Level-1 rail entry on desktop — it's reached
    // from the Connections Level-2 nav ("Templates" group) but remains a full
    // content destination, so it stays a module here.
    id: "templates",
    label: "Templates",
    icon: "FileCode",
    children: [
      { id: "generated", label: "Generated" },
      { id: "explore", label: "Explore" },
      { id: "recipes", label: "Recipes" },
      { id: "presets", label: "Presets" },
      { id: "n8n-import", label: "n8n Import" },
    ],
  },
  {
    id: "plugins",
    label: "Plugins",
    icon: "Puzzle",
    children: [
      { id: "browse", label: "Browse" },
      { id: "artist", label: "Artist" },
      { id: "dev-tools", label: "Dev Tools" },
      { id: "drive", label: "Drive" },
      { id: "twin", label: "Twin" },
      { id: "obsidian-brain", label: "Obsidian Brain" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    children: [
      { id: "account", label: "Account" },
      { id: "appearance", label: "Appearance" },
      { id: "notifications", label: "Notifications" },
      { id: "radio", label: "Radio" },
      { id: "engine", label: "Engine" },
      { id: "custom-models", label: "Custom Models" },
      { id: "data", label: "Data" },
      { id: "limits", label: "Limits" },
      { id: "api-keys", label: "API Keys" },
      { id: "devices", label: "Devices" },
      { id: "admin", label: "Admin" },
    ],
  },
  {
    id: "schedules",
    label: "Schedules",
    icon: "Calendar",
    children: [
      { id: "timeline", label: "Timeline" },
    ],
  },
  {
    // Desktop rail label is "Projects" (section id `teams`). Module id stays
    // `pipeline` for TOPIC_MODULE_MAP stability.
    id: "pipeline",
    label: "Projects",
    icon: "Users",
    children: [
      { id: "projects", label: "Manage" },
      { id: "goals", label: "Goals" },
      { id: "lifecycle", label: "Lifecycle" },
      { id: "factory", label: "Factory" },
      { id: "competition", label: "Competition" },
      { id: "mastermind", label: "Mastermind" },
      { id: "team-canvas", label: "Team Canvas" },
      { id: "team-memory", label: "Team Memory" },
    ],
  },
  {
    id: "deployment",
    label: "Deployment",
    icon: "Cloud",
    children: [
      { id: "unified-dashboard", label: "All Deployments" },
      { id: "cloud-deploy", label: "Cloud Runs" },
      { id: "gitlab-panel", label: "GitLab" },
    ],
  },
];

// ── Topic → Module mapping ──────────────────────────────────────────
// Every guide topic maps to its primary location in the desktop app.

export const TOPIC_MODULE_MAP: Record<string, TopicModuleRef> = {
  // ─── Monitoring ─────────────────────────────────────────────────
  "the-director": {
    moduleId: "overview",
    path: ["Overview", "Director"],
    label: "Director coaching",
  },
  // ─── Getting Started ────────────────────────────────────────────
  "installing-personas": {
    moduleId: "home",
    path: ["Home", "Welcome"],
    label: "Welcome screen",
  },
  "creating-your-first-agent": {
    moduleId: "agents",
    path: ["Agents", "All Agents"],
    label: "Agent list",
  },
  "understanding-the-interface": {
    moduleId: "home",
    path: ["Home", "Welcome"],
    label: "App layout",
  },
  "what-is-an-ai-agent": {
    moduleId: "home",
    path: ["Home", "Learning"],
    label: "Learning hub",
  },
  "running-your-first-automation": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Activity"],
    label: "Agent execution",
  },
  "choosing-your-ai-provider": {
    moduleId: "connections",
    path: ["Connections", "Add New"],
    label: "Provider setup",
  },
  "system-requirements": {
    moduleId: "home",
    path: ["Home", "System Check"],
    label: "System diagnostics",
  },
  "where-to-get-help": {
    moduleId: "home",
    path: ["Home", "Learning"],
    label: "Help resources",
  },

  // ─── Agents & Prompts ──────────────────────────────────────────
  "creating-a-new-agent": {
    moduleId: "agents",
    path: ["Agents", "All Agents"],
    label: "Create agent",
  },
  "writing-effective-prompts": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Design"],
    label: "Prompt editor",
  },
  "simple-vs-structured-prompt-mode": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Design"],
    label: "Prompt modes",
  },
  "structured-prompt-sections-explained": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Design"],
    label: "Prompt sections",
  },
  "agent-settings-and-limits": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Settings"],
    label: "Agent settings",
  },
  "assigning-tools-to-agents": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Design"],
    label: "Tool assignment",
  },
  "prompt-version-history": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Design"],
    label: "Version history",
  },
  "comparing-prompt-versions": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Design"],
    label: "Version diff",
  },
  "cloning-and-duplicating-agents": {
    moduleId: "agents",
    path: ["Agents", "All Agents"],
    label: "Clone agent",
  },
  "agent-groups-and-organization": {
    moduleId: "agents",
    path: ["Agents", "All Agents"],
    label: "Sidebar groups",
  },
  "disabling-and-archiving-agents": {
    moduleId: "agents",
    path: ["Agents", "All Agents"],
    label: "Agent management",
  },
  "agent-health-indicators": {
    moduleId: "agents",
    path: ["Agents", "Editor"],
    label: "Health badge",
  },

  // ─── Triggers & Scheduling ─────────────────────────────────────
  "how-triggers-work": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Settings"],
    label: "Trigger setup",
  },
  "manual-triggers": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Settings"],
    label: "Manual triggers",
  },
  "schedule-triggers": {
    moduleId: "schedules",
    path: ["Schedules", "Timeline"],
    label: "Schedule timeline",
  },
  "webhook-triggers": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Settings"],
    label: "Webhook config",
  },
  "clipboard-monitor": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Settings"],
    label: "Clipboard trigger",
  },
  "file-watcher-triggers": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Settings"],
    label: "File watcher",
  },
  "chain-triggers": {
    moduleId: "events",
    path: ["Events", "Chain Studio"],
    label: "Chain studio",
  },
  "event-based-triggers": {
    moduleId: "events",
    path: ["Events", "Live Stream"],
    label: "Event stream",
  },
  "combining-multiple-triggers": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Settings"],
    label: "Multi-trigger",
  },
  "testing-and-debugging-triggers": {
    moduleId: "events",
    path: ["Events", "Test"],
    label: "Trigger tester",
  },

  // ─── Credentials & Security ────────────────────────────────────
  "how-personas-keeps-your-data-safe": {
    moduleId: "connections",
    path: ["Connections", "Credentials"],
    label: "Security vault",
  },
  "adding-a-new-credential": {
    moduleId: "connections",
    path: ["Connections", "Add New"],
    label: "Add credential",
  },
  "credential-health-checks": {
    moduleId: "connections",
    path: ["Connections", "Credentials"],
    label: "Health checks",
  },
  "auto-credential-browser": {
    moduleId: "connections",
    path: ["Connections", "Catalog"],
    label: "Auto-browser",
  },
  "which-agents-use-which-credentials": {
    moduleId: "connections",
    path: ["Connections", "Dependencies"],
    label: "Dependency graph",
  },
  "refreshing-expired-tokens": {
    moduleId: "connections",
    path: ["Connections", "Credentials"],
    label: "Token refresh",
  },
  "connector-catalog": {
    moduleId: "connections",
    path: ["Connections", "Catalog"],
    label: "Connector catalog",
  },

  // ─── Pipelines & Teams ─────────────────────────────────────────
  "team-assignments": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas", "Assignments"],
    label: "Assignments panel",
  },
  "team-memory-and-goals": {
    moduleId: "pipeline",
    path: ["Projects", "Team Memory"],
    label: "Team Memory panel",
  },
  "what-are-pipelines": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas"],
    label: "Team canvas",
  },
  "the-team-canvas": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas"],
    label: "Canvas editor",
  },
  "adding-agents-to-a-pipeline": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas"],
    label: "Canvas agents",
  },
  "connecting-agents-with-data-flow": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas"],
    label: "Data flow wiring",
  },
  "pipeline-execution": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas"],
    label: "Pipeline runner",
  },
  "conditional-routing": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas"],
    label: "Routing logic",
  },
  "team-members-and-roles": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas"],
    label: "Team roles",
  },
  "pipeline-run-history": {
    moduleId: "overview",
    path: ["Overview", "Activity", "History"],
    label: "Run history",
  },
  "pipeline-templates": {
    moduleId: "templates",
    path: ["Templates", "Generated"],
    label: "Template gallery",
  },
  "debugging-pipeline-issues": {
    moduleId: "pipeline",
    path: ["Projects", "Team Canvas"],
    label: "Pipeline debugger",
  },

  // ─── Testing & Optimization ────────────────────────────────────
  "why-test-your-agents": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Lab"],
    label: "Testing lab",
  },
  "the-testing-lab-overview": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Lab"],
    label: "Lab overview",
  },
  "arena-testing": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Lab"],
    label: "Arena mode",
  },
  "ab-testing-prompts": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Lab"],
    label: "A/B testing",
  },
  "matrix-testing": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Matrix"],
    label: "Matrix builder",
  },
  "eval-testing": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Lab"],
    label: "Eval grid",
  },
  "rating-and-scoring-results": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Lab"],
    label: "Result scoring",
  },
  "genome-evolution-basics": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Matrix"],
    label: "Genome evolution",
  },
  "running-a-breeding-cycle": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Matrix"],
    label: "Breeding cycle",
  },
  "adopting-evolved-prompts": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Matrix"],
    label: "Prompt adoption",
  },
  "fitness-scoring-explained": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Matrix"],
    label: "Fitness scores",
  },
  "test-history-and-trends": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Lab"],
    label: "Test history",
  },

  // ─── Memories & Knowledge ──────────────────────────────────────
  "how-agent-memory-works": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Memory system",
  },
  "memory-categories": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Memory types",
  },
  "importance-levels": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Importance ranking",
  },
  "searching-agent-memories": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Memory search",
  },
  "creating-memories-manually": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Manual memories",
  },
  "memory-tiers-explained": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Memory tiers",
  },
  "memory-and-execution": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Execution context",
  },
  "reviewing-and-cleaning-memories": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Memory review",
  },
  "exporting-and-importing-memories": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Memory export",
  },
  "memory-best-practices": {
    moduleId: "overview",
    path: ["Overview", "Memories"],
    label: "Best practices",
  },

  // ─── Monitoring & Costs ────────────────────────────────────────
  "the-monitoring-dashboard": {
    moduleId: "overview",
    path: ["Overview", "Dashboard"],
    label: "Main dashboard",
  },
  "execution-logs": {
    moduleId: "overview",
    path: ["Overview", "Activity", "History"],
    label: "Execution logs",
  },
  "real-time-activity-feed": {
    moduleId: "overview",
    path: ["Overview", "Dashboard"],
    label: "Realtime feed",
  },
  "cost-tracking-per-agent": {
    moduleId: "overview",
    path: ["Overview", "Dashboard"],
    label: "Agent costs",
  },
  "cost-tracking-per-model": {
    moduleId: "overview",
    path: ["Overview", "Dashboard"],
    label: "Model costs",
  },
  "success-rate-metrics": {
    moduleId: "overview",
    path: ["Overview", "Dashboard"],
    label: "Success metrics",
  },
  "execution-tracing": {
    moduleId: "overview",
    path: ["Overview", "Activity", "History"],
    label: "Execution trace",
  },
  "performance-trends": {
    moduleId: "overview",
    path: ["Overview", "Dashboard"],
    label: "Trend charts",
  },
  "setting-budget-limits": {
    moduleId: "agents",
    path: ["Agents", "Editor", "Settings"],
    label: "Budget caps",
  },
  "anomaly-detection": {
    moduleId: "overview",
    path: ["Overview", "Health"],
    label: "Anomaly alerts",
  },

  // ─── Deployment & Integrations ─────────────────────────────────
  "local-vs-cloud-execution": {
    moduleId: "deployment",
    path: ["Deployment", "Cloud Runs"],
    label: "Deploy options",
  },
  "connecting-to-the-cloud-orchestrator": {
    moduleId: "deployment",
    path: ["Deployment", "Cloud Runs"],
    label: "Cloud connect",
  },
  "deploying-an-agent-to-the-cloud": {
    moduleId: "deployment",
    path: ["Deployment", "Cloud Runs"],
    label: "Cloud deploy",
  },
  "cloud-execution-monitoring": {
    moduleId: "deployment",
    path: ["Deployment", "All Deployments"],
    label: "Cloud monitoring",
  },
  "github-actions-integration": {
    moduleId: "deployment",
    path: ["Deployment", "GitLab"],
    label: "GitHub Actions",
  },
  "gitlab-ci-cd-integration": {
    moduleId: "deployment",
    path: ["Deployment", "GitLab"],
    label: "GitLab CI/CD",
  },
  "n8n-workflow-integration": {
    moduleId: "templates",
    path: ["Templates", "n8n Import"],
    label: "n8n import",
  },
  "byoi-bring-your-own-infrastructure": {
    moduleId: "deployment",
    path: ["Deployment", "Cloud Runs"],
    label: "BYOI setup",
  },
  "syncing-desktop-and-cloud": {
    moduleId: "deployment",
    path: ["Deployment", "Cloud Runs"],
    label: "Desktop-cloud sync",
  },
  "cloud-troubleshooting": {
    moduleId: "deployment",
    path: ["Deployment", "Cloud Runs"],
    label: "Cloud debugging",
  },

  // ─── Troubleshooting ───────────────────────────────────────────
  "common-error-messages": {
    moduleId: "overview",
    path: ["Overview", "Health"],
    label: "Error reference",
  },
  "agent-not-responding": {
    moduleId: "agents",
    path: ["Agents", "Editor"],
    label: "Agent health",
  },
  "credential-errors": {
    moduleId: "connections",
    path: ["Connections", "Credentials"],
    label: "Credential status",
  },
  "trigger-not-firing": {
    moduleId: "events",
    path: ["Events", "Test"],
    label: "Trigger tester",
  },
  "self-healing-explained": {
    moduleId: "overview",
    path: ["Overview", "Health"],
    label: "Self-healing",
  },
  "checking-system-health": {
    moduleId: "home",
    path: ["Home", "System Check"],
    label: "System check",
  },
  "log-files-and-debugging": {
    moduleId: "settings",
    path: ["Settings", "Admin"],
    label: "Log viewer",
  },
  "resetting-to-defaults": {
    moduleId: "settings",
    path: ["Settings", "Appearance"],
    label: "Reset settings",
  },

  // ─── Companion / Athena ────────────────────────────────────────
  "meet-athena": {
    moduleId: "companion",
    path: ["Companion", "Chat"],
    label: "Athena panel",
  },
  "chatting-with-athena": {
    moduleId: "companion",
    path: ["Companion", "Chat"],
    label: "Chat panel",
  },
  "voice-and-hold-to-talk": {
    moduleId: "companion",
    path: ["Companion", "Voice"],
    label: "Voice settings",
  },
  "athenas-long-term-memory": {
    moduleId: "companion",
    path: ["Companion", "Memory"],
    label: "Brain viewer",
  },
  "proactive-check-ins": {
    moduleId: "companion",
    path: ["Companion", "Setup"],
    label: "Proactive check-ins",
  },
  "guided-walkthroughs": {
    moduleId: "companion",
    path: ["Companion", "Chat"],
    label: "Guided walkthroughs",
  },
  "the-decision-hub": {
    moduleId: "overview",
    path: ["Overview", "Approvals"],
    label: "Approvals queue",
  },
  "operating-by-chat": {
    moduleId: "companion",
    path: ["Companion", "Chat"],
    label: "Operate by chat",
  },

  // ─── Getting Started · Templates & Modes ───────────────────────
  "browsing-templates": {
    moduleId: "templates",
    path: ["Templates", "Explore"],
    label: "Template gallery",
  },
  "adopting-a-template": {
    moduleId: "templates",
    path: ["Templates", "Generated"],
    label: "Adopt template",
  },
  "recipes": {
    moduleId: "templates",
    path: ["Templates", "Recipes"],
    label: "Recipes",
  },
  "interface-modes": {
    moduleId: "settings",
    path: ["Settings", "Appearance"],
    label: "Interface mode",
  },

  // ─── Monitoring · Goals, KPIs & Director ───────────────────────
  "tracking-goals": {
    moduleId: "pipeline",
    path: ["Projects", "Goals"],
    label: "Goals board",
  },
  "measuring-outcomes-with-kpis": {
    moduleId: "pipeline",
    path: ["Projects", "Factory", "KPIs"],
    label: "KPI dashboard",
  },
  "director-verdicts-and-categories": {
    moduleId: "overview",
    path: ["Overview", "Director"],
    label: "Director verdicts",
  },
  "director-momentum-and-stale-sweep": {
    moduleId: "overview",
    path: ["Overview", "Director"],
    label: "Director momentum",
  },
};
