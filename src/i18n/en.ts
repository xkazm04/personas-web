export interface Translations {
  nav: {
    home: string;
    how: string;
    connections: string;
    roadmap: string;
    templates: string;
    download: string;
    dashboard: string;
    features: string;
    menu: string;
  };
  footer: {
    tagline: string;
    motto: string;
    product: string;
    resources: string;
    legal: string;
    privacy: string;
    terms: string;
    copyright: string;
    slogan: string;
  };
  pricing: {
    local: string;
    cloud: string;
    enterprise: string;
    downloadLocal: string;
    goCloud: string;
    contactSales: string;
    comingSoon: string;
    bestFor: string;
    forever: string;
    mo: string;
    custom: string;
    bestForLocal: string;
    bestForCloud: string;
    bestForEnterprise: string;
    features: {
      unlimitedLocalAgents: string;
      localEventBus: string;
      fullObservability: string;
      designEngine: string;
      teamCanvasLocal: string;
      everythingInFree: string;
      cloudWorkers3: string;
      executions1000: string;
      events10000: string;
      burstAutoScaling: string;
      everythingInPro: string;
      ssoSaml: string;
      multiTenantRbac: string;
      auditTrailExport: string;
      dedicatedWorkers: string;
      prioritySupport: string;
    };
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    badge: string;
    headingLine1: string;
    headingLine2: string;
    description: string;
    descriptionBold: string;
    mode1: string;
    mode2: string;
    mode3: string;
    viewOnGithub: string;
    downloadForWindows: string;
    joinWaitlist: string;
    commandCenter: string;
    adoptionSnapshot: string;
    scroll: string;
    phases: string;
    agents: string;
    executions: string;
    templates: string;
  };
  sections: {
    vision: string;
    pricing: string;
    faq: string;
    features: string;
    useCases: string;
    eventBus: string;
    download: string;
  };
  common: {
    skipToMain: string;
    loading: string;
    cancel: string;
    close: string;
    back: string;
    next: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    noResults: string;
    signOut: string;
    signIn: string;
    notifyMe: string;
    step: string;
    learnMore: string;
    viewAll: string;
    status: string;
    active: string;
    idle: string;
    total: string;
    connected: string;
    disconnected: string;
    demo: string;
  };
  useCasesSection: {
    heading: string;
    headingGradient: string;
    integrations: string;
    patterns: string;
    description: string;
    autoplayHint: string;
    browseTemplates: string;
    whatCanAutomate: string;
    gmail: { name: string; cases: { title: string; desc: string }[] };
    slack: { name: string; cases: { title: string; desc: string }[] };
    github: { name: string; cases: { title: string; desc: string }[] };
    drive: { name: string; cases: { title: string; desc: string }[] };
    jira: { name: string; cases: { title: string; desc: string }[] };
    notion: { name: string; cases: { title: string; desc: string }[] };
    stripe: { name: string; cases: { title: string; desc: string }[] };
    calendar: { name: string; cases: { title: string; desc: string }[] };
    figma: { name: string; cases: { title: string; desc: string }[] };
  };
  faqSection: {
    heading: string;
    headingGradient: string;
    subtitle: string;
    stillQuestions: string;
    joinDiscord: string;
    discordSubtitle: string;
    questions: { q: string; a: string }[];
  };
  downloadSection: {
    heading: string;
    headingGradient: string;
    subtitle: string;
    downloadInstaller: string;
    joinWaitlist: string;
    connectCli: string;
    launchAgent: string;
    exploreFirst: string;
    requiresCli: string;
    installerSize: string;
    noTelemetry: string;
    localFirst: string;
    windows: string;
    macos: string;
    linux: string;
  };
  dashboard: {
    title: string;
    overview: string;
    agents: string;
    executions: string;
    events: string;
    reviews: string;
    playground: string;
    observability: string;
    usage: string;
    knowledge: string;
    settings: string;
    more: string;
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    agentsStatus: string;
    pendingReviews: string;
    totalExecutions: string;
    successRate: string;
    activeAgents: string;
    recentActivity: string;
    running: string;
    noExecutionsYet: string;
    executeToSee: string;
    trafficErrors: string;
    last14Days: string;
    deployed: string;
    metricsHealth: string;
    toolUtilization: string;
    workers: string;
    usageAnalytics: string;
  };
  agentsPage: {
    title: string;
    noAgents: string;
    noAgentsDesc: string;
    agentDeployed: string;
    agentsDeployed: string;
    manualExecution: string;
  };
  executionsPage: {
    title: string;
    all: string;
    active: string;
    completed: string;
    failed: string;
    cancelled: string;
    agent: string;
    duration: string;
    cost: string;
    started: string;
    noExecutions: string;
    noExecutionsDesc: string;
    waitingForWorker: string;
    noOutputYet: string;
  };
  eventsPage: {
    title: string;
    subtitle: string;
    tabEvents: string;
    tabSubscriptions: string;
    tabVisualization: string;
  };
  settingsPage: {
    title: string;
    subtitle: string;
    account: string;
    cloudConnection: string;
    orchestrator: string;
    notConfigured: string;
    systemStatus: string;
    totalWorkers: string;
    queueLength: string;
    activeExecutions: string;
    loadingStatus: string;
  };
  legalPage: {
    title: string;
    heading: string;
    description: string;
  };
  waitlist: {
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    earlyBeta: string;
    submit: string;
    joining: string;
    success: string;
    successDesc: string;
    duplicate: string;
    duplicateDesc: string;
    shareTitle: string;
    copied: string;
    copyLink: string;
    peopleWaiting: string;
    errorGeneric: string;
  };
  roadmapSection: {
    inProgress: string;
    next: string;
    planned: string;
    completed: string;
  };
  eventBusSection: {
    dynamicSwarm: string;
    latencyLanes: string;
    ephemeralConnections: string;
    queueDepth: string;
  };
}

export const en: Translations = {
  nav: {
    home: 'Personas',
    how: 'How it works',
    connections: 'Connections',
    roadmap: 'Roadmap',
    templates: 'Templates',
    download: 'Download',
    dashboard: 'Dashboard',
    features: 'Features',
    menu: 'Menu',
  },
  footer: {
    tagline: 'AI agents that work for you',
    motto: 'AI agents that automate your work, so you can focus on what matters most.',
    product: 'Product',
    resources: 'Resources',
    legal: 'Legal',
    privacy: 'Privacy',
    terms: 'Terms',
    copyright: 'Personas. All rights reserved.',
    slogan: 'Automate your work. Reclaim your time.',
  },
  pricing: {
    local: 'Local',
    cloud: 'Cloud',
    enterprise: 'Enterprise',
    downloadLocal: 'Download Local',
    goCloud: 'Go Cloud',
    contactSales: 'Contact Sales',
    comingSoon: 'Coming Soon',
    bestFor: 'Best for',
    forever: 'forever',
    mo: '/mo',
    custom: 'Custom',
    bestForLocal: 'Solo builders getting started',
    bestForCloud: 'Fast-moving individual teams',
    bestForEnterprise: 'Organizations with compliance & scale needs',
    features: {
      unlimitedLocalAgents: 'Unlimited local agents',
      localEventBus: 'Local event bus & scheduler',
      fullObservability: 'Full observability dashboard',
      designEngine: 'Design engine',
      teamCanvasLocal: 'Team canvas (local)',
      everythingInFree: 'Everything in Free',
      cloudWorkers3: '3 cloud workers',
      executions1000: '1,000 executions/mo',
      events10000: '10,000 events/mo',
      burstAutoScaling: 'Burst auto-scaling',
      everythingInPro: 'Everything in Pro',
      ssoSaml: 'SSO via SAML & OIDC',
      multiTenantRbac: 'Multi-tenant workspaces with RBAC',
      auditTrailExport: 'Execution audit trail export',
      dedicatedWorkers: 'Dedicated cloud workers & SLA',
      prioritySupport: 'Priority support',
    },
  },
  hero: {
    title: 'AI agents that run on your machine',
    subtitle: 'Build autonomous workflows that connect your tools, process your data, and take action \u2014 all running locally.',
    cta: 'Get Started',
    badge: 'AI Agent Platform',
    headingLine1: 'Intelligent agents',
    headingLine2: 'that work for you',
    description: 'Design agents in natural language. Orchestrate them locally or in the cloud.',
    descriptionBold: 'No workflow diagrams. No code.',
    mode1: 'Design in one sentence',
    mode2: 'Run locally for free',
    mode3: 'Scale to cloud when needed',
    viewOnGithub: 'View on GitHub',
    downloadForWindows: 'Download for Windows',
    joinWaitlist: 'Join Windows Waitlist',
    commandCenter: 'Command Center',
    adoptionSnapshot: 'Adoption snapshot',
    scroll: 'Scroll',
    phases: 'PHASES',
    agents: 'Agents',
    executions: 'Executions',
    templates: 'Templates',
  },
  sections: {
    vision: 'Vision',
    pricing: 'Pricing',
    faq: 'FAQ',
    features: 'Features',
    useCases: 'Use Cases',
    eventBus: 'Event Bus',
    download: 'Download',
  },
  common: {
    skipToMain: 'Skip to main content',
    loading: 'Loading...',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    noResults: 'No results found',
    signOut: 'Sign out',
    signIn: 'Sign in',
    notifyMe: 'notify me',
    step: 'Step',
    learnMore: 'Learn more',
    viewAll: 'View all',
    status: 'Status',
    active: 'active',
    idle: 'idle',
    total: 'total',
    connected: 'Connected',
    disconnected: 'Disconnected',
    demo: 'Demo',
  },
  useCasesSection: {
    heading: 'One agent per tool.',
    headingGradient: 'Infinite possibilities',
    integrations: 'integrations',
    patterns: 'patterns',
    description: 'Click any integration to explore what a Personas agent can automate.',
    autoplayHint: 'Auto-cycling \u2014 click to stop.',
    browseTemplates: 'Browse All Templates',
    whatCanAutomate: 'What Personas can automate',
    gmail: {
      name: 'Gmail',
      cases: [
        { title: 'Inbox triage', desc: 'Auto-label, prioritize, and draft replies for inbound emails based on sender and content.' },
        { title: 'Follow-up reminders', desc: 'Detect unanswered threads and send gentle follow-ups after configurable delays.' },
        { title: 'Meeting prep', desc: 'Scan upcoming calendar invites, pull relevant email threads, and summarize context.' },
      ],
    },
    slack: {
      name: 'Slack',
      cases: [
        { title: 'Channel summarizer', desc: 'Digest long channels into actionable summaries delivered to you every morning.' },
        { title: 'Standup collector', desc: 'DM each team member for status updates, compile into a single standup post.' },
        { title: 'Alert router', desc: 'Triage incoming alerts from monitoring tools and escalate to the right channel.' },
      ],
    },
    github: {
      name: 'GitHub',
      cases: [
        { title: 'PR reviewer', desc: 'Analyze pull requests for bugs, style issues, and missing tests \u2014 post inline comments.' },
        { title: 'Issue groomer', desc: 'Auto-label stale issues, request more info, and suggest duplicates.' },
        { title: 'Release notes', desc: 'Generate changelog entries from merged PRs grouped by category and impact.' },
      ],
    },
    drive: {
      name: 'Google Drive',
      cases: [
        { title: 'Doc organizer', desc: 'Auto-file documents into folders based on content, project tags, and ownership.' },
        { title: 'Permissions auditor', desc: 'Weekly scan of shared files \u2014 flag over-shared docs and external access.' },
        { title: 'Content indexer', desc: 'Build a searchable knowledge base from scattered Drive documents.' },
      ],
    },
    jira: {
      name: 'Jira',
      cases: [
        { title: 'Sprint planner', desc: 'Analyze velocity history and suggest optimal story point allocation for next sprint.' },
        { title: 'Blocker detector', desc: 'Monitor ticket dependencies and alert when a critical path item is stuck.' },
        { title: 'Status syncer', desc: 'Keep Jira tickets in sync with GitHub PRs \u2014 auto-transition on merge.' },
      ],
    },
    notion: {
      name: 'Notion',
      cases: [
        { title: 'Meeting notes', desc: 'Transcribe recordings, extract action items, and create linked Notion pages.' },
        { title: 'Wiki gardener', desc: 'Find outdated docs, suggest updates, and archive pages with no recent views.' },
        { title: 'Template filler', desc: 'Auto-populate project brief templates from intake form responses.' },
      ],
    },
    stripe: {
      name: 'Stripe',
      cases: [
        { title: 'Failed payment recovery', desc: 'Email customers with failed charges \u2014 offer retry links and alternative methods.' },
        { title: 'Revenue alerting', desc: 'Monitor MRR changes and notify Slack when churn spikes or upgrades surge.' },
        { title: 'Invoice reconciler', desc: 'Match Stripe payouts against your accounting system and flag discrepancies.' },
      ],
    },
    calendar: {
      name: 'Calendar',
      cases: [
        { title: 'Schedule optimizer', desc: 'Detect meeting-heavy days and suggest blocks for focus time automatically.' },
        { title: 'No-show handler', desc: 'Track attendees who miss meetings and send rescheduling links.' },
        { title: 'Timezone coordinator', desc: 'Find optimal meeting slots across global teams with minimal late-night asks.' },
      ],
    },
    figma: {
      name: 'Figma',
      cases: [
        { title: 'Design handoff', desc: 'Extract component specs, tokens, and assets \u2014 post to the dev channel.' },
        { title: 'Comment tracker', desc: 'Aggregate unresolved Figma comments and create follow-up tasks.' },
        { title: 'Version differ', desc: 'Compare file versions and summarize visual changes for stakeholder review.' },
      ],
    },
  },
  faqSection: {
    heading: 'Frequently',
    headingGradient: 'asked',
    subtitle: 'Everything you need to know about getting started with Personas.',
    stillQuestions: 'Still have questions?',
    joinDiscord: 'Join Discord',
    discordSubtitle: 'Join our Discord community for help and discussion.',
    questions: [
      {
        q: 'What is Claude CLI and why do I need it?',
        a: 'Claude CLI is Anthropic\'s official command-line interface for interacting with Claude. Personas uses it under the hood to run your agents locally \u2014 it handles authentication, model access, and streaming responses. You\'ll need an active Claude Pro or Max subscription and the CLI installed before launching Personas.',
      },
      {
        q: 'Does Personas collect any telemetry or usage data?',
        a: 'No. Personas runs entirely on your machine with zero telemetry. We don\'t collect analytics, usage metrics, or any personal data. Your prompts, agent configurations, and execution logs never leave your device unless you explicitly enable cloud execution.',
      },
      {
        q: 'How does the pricing model work?',
        a: 'The desktop app is free forever with unlimited local agents. Cloud plans (Starter, Pro, Team) add 24/7 execution, remote workers, and team features on top. You always need your own Claude subscription \u2014 we never touch your Anthropic bill. Think of Personas as the orchestration layer, and Claude as the engine.',
      },
      {
        q: 'What is Bring Your Own Infrastructure (BYOI)?',
        a: 'BYOI lets you connect your own cloud provider credentials (e.g., Fly.io API tokens) instead of using our managed infrastructure. Personas provisions and manages the workers on your account, giving you unlimited execution without per-month caps \u2014 you only pay your cloud provider directly.',
      },
      {
        q: 'What\'s the difference between local and cloud execution?',
        a: 'Local execution runs agents on your machine using Claude CLI \u2014 it\'s instant, free, and private, but stops when your computer sleeps. Cloud execution runs agents on remote workers 24/7, supports event-bus bridging across environments, and enables team collaboration. You can switch between modes per-agent.',
      },
      {
        q: 'Are there any limits on the number of agents?',
        a: 'Locally, there are no limits \u2014 create as many agents as you want. Cloud plans have worker limits (1\u20135 depending on tier) and monthly execution caps. Pro and Team plans include burst auto-scaling for traffic spikes. BYOI removes all caps entirely.',
      },
    ],
  },
  downloadSection: {
    heading: 'Ready to build your',
    headingGradient: 'agent?',
    subtitle: 'Download Personas for free. Start building in minutes.',
    downloadInstaller: 'Download installer',
    joinWaitlist: 'Join waitlist',
    connectCli: 'Connect Claude CLI',
    launchAgent: 'Launch first agent',
    exploreFirst: 'Explore capabilities first',
    requiresCli: 'Requires Claude CLI',
    installerSize: '12 MB installer',
    noTelemetry: 'No telemetry',
    localFirst: 'Local-first security',
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
  },
  dashboard: {
    title: 'Dashboard',
    overview: 'Overview',
    agents: 'Agents',
    executions: 'Executions',
    events: 'Events',
    reviews: 'Reviews',
    playground: 'Playground',
    observability: 'Observability',
    usage: 'Usage',
    knowledge: 'Knowledge',
    settings: 'Settings',
    more: 'More',
    greeting: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
    },
    agentsStatus: "Here's what's happening with your agents",
    pendingReviews: 'pending reviews',
    totalExecutions: 'total executions',
    successRate: 'success rate',
    activeAgents: 'active agents',
    recentActivity: 'Recent Activity',
    running: 'running',
    noExecutionsYet: 'No executions yet.',
    executeToSee: 'Execute an agent to see activity here.',
    trafficErrors: 'Traffic & Errors',
    last14Days: 'Last 14 days',
    deployed: 'deployed',
    metricsHealth: 'Metrics & health',
    toolUtilization: 'Tool utilization',
    workers: 'workers',
    usageAnalytics: 'Usage Analytics',
  },
  agentsPage: {
    title: 'Agents',
    noAgents: 'No agents deployed',
    noAgentsDesc: 'Deploy your first agent from the Personas desktop app, then come back here to monitor it.',
    agentDeployed: 'agent deployed',
    agentsDeployed: 'agents deployed',
    manualExecution: 'Manual execution from dashboard',
  },
  executionsPage: {
    title: 'Executions',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    agent: 'Agent',
    duration: 'Duration',
    cost: 'Cost',
    started: 'Started',
    noExecutions: 'No executions yet',
    noExecutionsDesc: 'Execute an agent to see results here',
    waitingForWorker: 'Waiting for worker...',
    noOutputYet: 'No output yet',
  },
  eventsPage: {
    title: 'Events',
    subtitle: 'Event bus activity across all agents',
    tabEvents: 'Events',
    tabSubscriptions: 'Subscriptions',
    tabVisualization: 'Visualization',
  },
  settingsPage: {
    title: 'Settings',
    subtitle: 'Account and cloud connection configuration',
    account: 'Account',
    cloudConnection: 'Cloud Connection',
    orchestrator: 'Orchestrator',
    notConfigured: 'Not configured',
    systemStatus: 'System Status',
    totalWorkers: 'Total Workers',
    queueLength: 'Queue Length',
    activeExecutions: 'Active Executions',
    loadingStatus: 'Loading system status...',
  },
  legalPage: {
    title: 'Legal',
    heading: 'Legal pages coming soon',
    description: 'Our privacy policy and terms of service are being finalized. In the meantime, if you have any questions please reach out to us.',
  },
  waitlist: {
    title: 'Join the Waitlist',
    subtitle: 'Be the first to know when we launch for',
    emailPlaceholder: 'Enter your email',
    earlyBeta: 'I want early beta access',
    submit: 'Join Waitlist',
    joining: 'Joining...',
    success: "You're on the list!",
    successDesc: "We'll notify you as soon as the build is ready.",
    duplicate: 'Already registered',
    duplicateDesc: "You're already on the waitlist. We'll notify you when ready.",
    shareTitle: 'Share with friends',
    copied: 'Copied!',
    copyLink: 'Copy link',
    peopleWaiting: 'people waiting',
    errorGeneric: 'Something went wrong. Please try again.',
  },
  roadmapSection: {
    inProgress: 'In Progress',
    next: 'Next',
    planned: 'Planned',
    completed: 'Completed',
  },
  eventBusSection: {
    dynamicSwarm: 'Dynamic Swarm',
    latencyLanes: 'Latency Lanes',
    ephemeralConnections: 'Ephemeral connections',
    queueDepth: 'Queue depth + throughput',
  },
};
