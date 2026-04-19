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
    guide: string;
    community: string;
    useCases: string;
    tour: string;
    security: string;
    blog: string;
    changelog: string;
    compare: string;
    pricing: string;
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
    mode4: string;
    mode5: string;
    viewOnGithub: string;
    downloadForWindows: string;
    joinWaitlist: string;
    commandCenter: string;
    adoptionSnapshot: string;
    scroll: string;
    phases: string;
    publicBeta: string;
    agents: string;
    executions: string;
    connectors: string;
    templates: string;
  };
  heroTransition: {
    ariaLabel: string;
    speed: string;
    privacy: string;
    scale: string;
    value: string;
    cta: string;
  };
  sections: {
    vision: string;
    pricing: string;
    faq: string;
    features: string;
    community: string;
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
    observability: string;
    knowledge: string;
    settings: string;
    leaderboard: string;
    sla: string;
    messages: string;
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
    unreadMessages: string;
    fleetHealth: string;
    fleet: {
      title: string;
      severity: {
        urgent: string;
        suggested: string;
        insight: string;
      };
      expand: string;
      collapse: string;
      dismiss: string;
    };
    staleness: {
      justNow: string;
      secondsAgo: string;
      minutesAgo: string;
      hoursAgo: string;
      daysAgo: string;
      error: string;
    };
    scope: {
      allPersonas: string;
      personaLabel: string;
      compare: string;
      dateRange: {
        last24h: string;
        last7d: string;
        last30d: string;
        last90d: string;
        custom: string;
      };
    };
  };
  memoriesPage: {
    title: string;
    subtitle: string;
    totalCount: string;
    filters: {
      all: string;
      throttle: string;
      schedule: string;
      alert: string;
      config: string;
      routing: string;
    };
    status: {
      active: string;
      pending: string;
      archived: string;
    };
    uses: string;
    empty: string;
    seeAll: string;
    conflicts: {
      count: string;
      resolveButton: string;
      modalTitle: string;
      modalSubtitle: string;
      accept: string;
      reject: string;
      cancel: string;
      apply: string;
      allResolved: string;
    };
  };
  reviewsPage: {
    focus: {
      enter: string;
      exit: string;
      progress: string;
      skip: string;
      empty: string;
      approve: string;
      reject: string;
      shortcuts: string;
    };
  };
  leaderboardPage: {
    title: string;
    subtitle: string;
    rank: string;
    composite: string;
    radarTitle: string;
    metrics: {
      reliability: string;
      cost: string;
      speed: string;
      quality: string;
      volume: string;
    };
    trend: {
      up: string;
      down: string;
      flat: string;
    };
  };
  slaPage: {
    title: string;
    subtitle: string;
    compliance: string;
    activeBreaches: string;
    objectives: string;
    target: string;
    current: string;
    timeInSla: string;
    metricType: {
      availability: string;
      latency: string;
      successRate: string;
    };
    severity: {
      minor: string;
      major: string;
      critical: string;
    };
    breachLog: {
      title: string;
      empty: string;
      ongoing: string;
      duration: string;
    };
  };
  messagesPage: {
    title: string;
    subtitle: string;
    unread: string;
    read: string;
    empty: string;
    expand: string;
    collapse: string;
    pagination: {
      prev: string;
      next: string;
      page: string;
    };
    markAllRead: string;
  };
  observabilityPage: {
    title: string;
    subtitle: string;
    tabPerformance: string;
    tabUsage: string;
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
    tabSwimlane: string;
    swimlane: {
      title: string;
      subtitle: string;
      empty: string;
    };
    connectionStatus: {
      connected: string;
      reconnecting: string;
      polling: string;
    };
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
  guide: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchInCategory: string;
    topics: string;
    backToGuide: string;
    showAllResults: string;
    noResults: string;
    stillQuestions: string;
    joinDiscord: string;
    categories: {
      "getting-started": string;
      "agents-prompts": string;
      triggers: string;
      credentials: string;
      pipelines: string;
      testing: string;
      memories: string;
      monitoring: string;
      deployment: string;
      troubleshooting: string;
    };
    categoryDescriptions: {
      "getting-started": string;
      credentials: string;
      "agents-prompts": string;
      triggers: string;
      pipelines: string;
      memories: string;
      monitoring: string;
      testing: string;
      deployment: string;
      troubleshooting: string;
    };
  };
  featurePages: {
    orchestration: { headline: string; description: string; cta: string };
    security: { headline: string; description: string; cta: string };
    "multi-provider": { headline: string; description: string; cta: string };
    genome: { headline: string; description: string; cta: string };
  };
  accessibility: {
    changeLanguage: string;
    selectLanguage: string;
    selectTheme: string;
  };
  themes: {
    midnight: string;
    cyan: string;
    bronze: string;
    frost: string;
    purple: string;
    pink: string;
    red: string;
    matrix: string;
    light: string;
    ice: string;
    news: string;
  };
  themeDescriptions: {
    midnight: string;
    cyan: string;
    bronze: string;
    frost: string;
    purple: string;
    pink: string;
    red: string;
    matrix: string;
    light: string;
    ice: string;
    news: string;
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
    guide: 'Guide',
    community: 'Community',
    useCases: 'Use Cases',
    tour: 'Tour',
    security: 'Security',
    blog: 'Blog',
    changelog: 'Changelog',
    compare: 'Compare',
    pricing: 'Pricing',
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
    mode1: 'Multi-Agent Pipelines',
    mode2: 'Simple setup',
    mode3: 'Free',
    mode4: 'Multi-Provider AI',
    mode5: 'Self-improving',
    viewOnGithub: 'View on GitHub',
    downloadForWindows: 'Download for Windows',
    joinWaitlist: 'Join Windows Waitlist',
    commandCenter: 'Command Center',
    adoptionSnapshot: 'Adoption snapshot',
    scroll: 'Scroll',
    phases: 'PHASES',
    publicBeta: 'PUBLIC BETA',
    agents: 'Agents',
    executions: 'Executions',
    connectors: 'Connectors',
    templates: 'Templates',
  },
  heroTransition: {
    ariaLabel: 'Core product pillars',
    speed: 'Fast',
    privacy: 'Private',
    scale: 'Scalable',
    value: 'Agents that run where your data lives, scale when you need them, and stay under your control.',
    cta: 'See it in action',
  },
  sections: {
    vision: 'Vision',
    pricing: 'Pricing',
    faq: 'FAQ',
    features: 'Features',
    community: 'Community',
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
    heading: 'Integrate any tool.',
    headingGradient: 'Infinite Possibilities',
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
    observability: 'Observability',
    knowledge: 'Knowledge',
    settings: 'Settings',
    leaderboard: 'Leaderboard',
    sla: 'SLA',
    messages: 'Messages',
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
    unreadMessages: 'unread messages',
    fleetHealth: 'fleet health',
    fleet: {
      title: 'Fleet optimization',
      severity: {
        urgent: 'Urgent',
        suggested: 'Suggested',
        insight: 'Insight',
      },
      expand: 'Details',
      collapse: 'Hide',
      dismiss: 'Dismiss',
    },
    staleness: {
      justNow: 'Just now',
      secondsAgo: '{n}s ago',
      minutesAgo: '{n}m ago',
      hoursAgo: '{n}h ago',
      daysAgo: '{n}d ago',
      error: 'Failed to load',
    },
    scope: {
      allPersonas: 'All personas',
      personaLabel: 'Persona filter',
      compare: 'Compare',
      dateRange: {
        last24h: '24h',
        last7d: '7d',
        last30d: '30d',
        last90d: '90d',
        custom: 'Custom',
      },
    },
  },
  memoriesPage: {
    title: 'Memories',
    subtitle: 'Learned patterns your agents apply automatically',
    totalCount: '{n} memories',
    filters: {
      all: 'All',
      throttle: 'Throttle',
      schedule: 'Schedule',
      alert: 'Alert',
      config: 'Config',
      routing: 'Routing',
    },
    status: {
      active: 'Active',
      pending: 'Pending',
      archived: 'Archived',
    },
    uses: '{n} uses',
    empty: 'No memories match this filter',
    seeAll: 'See all',
    conflicts: {
      count: '{n} conflicts',
      resolveButton: 'Resolve conflicts',
      modalTitle: 'Resolve {n} conflicts',
      modalSubtitle: 'Accept or reject each to keep your memory store consistent.',
      accept: 'Accept',
      reject: 'Reject',
      cancel: 'Cancel',
      apply: 'Apply',
      allResolved: 'All conflicts resolved',
    },
  },
  reviewsPage: {
    focus: {
      enter: 'Focus flow',
      exit: 'Exit focus',
      progress: '{n} of {total}',
      skip: 'Skip',
      empty: 'All caught up — no pending reviews',
      approve: 'Approve',
      reject: 'Reject',
      shortcuts: 'A approve · R reject · S skip · Esc exit',
    },
  },
  leaderboardPage: {
    title: 'Leaderboard',
    subtitle: 'Fleet ranking by composite performance',
    rank: 'Rank',
    composite: 'Composite',
    radarTitle: 'Metrics profile',
    metrics: {
      reliability: 'Reliability',
      cost: 'Cost',
      speed: 'Speed',
      quality: 'Quality',
      volume: 'Volume',
    },
    trend: {
      up: 'Up',
      down: 'Down',
      flat: 'Flat',
    },
  },
  slaPage: {
    title: 'SLA',
    subtitle: 'Service-level objectives, compliance, and breach history',
    compliance: 'Compliance',
    activeBreaches: 'Active breaches',
    objectives: 'Objectives',
    target: 'Target',
    current: 'Current',
    timeInSla: 'Time in SLA',
    metricType: {
      availability: 'Availability',
      latency: 'Latency p95',
      successRate: 'Success rate',
    },
    severity: {
      minor: 'Minor',
      major: 'Major',
      critical: 'Critical',
    },
    breachLog: {
      title: 'Breach log',
      empty: 'No breaches in the last 7 days.',
      ongoing: 'Ongoing',
      duration: '{n} min',
    },
  },
  messagesPage: {
    title: 'Messages',
    subtitle: 'Async feedback from every persona in the fleet',
    unread: 'Unread',
    read: 'Read',
    empty: 'No messages in this page.',
    expand: 'Show payload',
    collapse: 'Hide payload',
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page {n} of {total}',
    },
    markAllRead: 'Mark all read',
  },
  observabilityPage: {
    title: 'Observability',
    subtitle: 'Performance metrics, cost tracking, and tool utilization',
    tabPerformance: 'Performance',
    tabUsage: 'Tool Usage',
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
    tabSwimlane: 'Timeline',
    swimlane: {
      title: 'Event swim-lanes',
      subtitle: 'Time-ordered per-persona event trace',
      empty: 'No events in the selected window',
    },
    connectionStatus: {
      connected: 'Real-time: connected',
      reconnecting: 'Reconnecting to event stream…',
      polling: 'Polling for updates (delayed)',
    },
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
  guide: {
    title: 'User',
    subtitle: 'Everything you need to know about Personas — from your first agent to advanced multi-agent pipelines.',
    searchPlaceholder: 'Search 100+ topics...',
    searchInCategory: 'Search in this category...',
    topics: 'topics',
    backToGuide: 'Back to Guide',
    showAllResults: 'Show all results',
    noResults: 'No topics found. Try a different search term.',
    stillQuestions: 'Still have questions?',
    joinDiscord: 'Join our Discord',
    categories: {
      "getting-started": 'Getting Started',
      "agents-prompts": 'Agents & Prompts',
      triggers: 'Triggers & Scheduling',
      credentials: 'Credentials & Security',
      pipelines: 'Pipelines & Teams',
      testing: 'Testing & Optimization',
      memories: 'Memories & Knowledge',
      monitoring: 'Monitoring & Costs',
      deployment: 'Deployment & Integrations',
      troubleshooting: 'Troubleshooting',
    },
    categoryDescriptions: {
      "getting-started": "Install Personas, create your first agent, and learn the basics in under 10 minutes.",
      credentials: "Connect to services securely. Understand the encrypted vault and how your data stays safe.",
      "agents-prompts": "Create, configure, and fine-tune your AI agents. Master simple and structured prompt modes.",
      triggers: "Set up when and how your agents run — schedules, webhooks, file watchers, and more.",
      pipelines: "Wire agents together into visual pipelines. Build multi-agent workflows on the team canvas.",
      memories: "Your agents learn and remember. Manage what they know and how they use past experience.",
      monitoring: "Track every execution in real time. See what your agents do, how well they perform, and what they cost.",
      testing: "Run arena tests, A/B comparisons, and let the genome system evolve your best prompts.",
      deployment: "Deploy agents to the cloud, connect to GitHub Actions, GitLab CI, and n8n workflows.",
      troubleshooting: "Fix common issues, understand error messages, and get your agents back on track.",
    },
  },
  featurePages: {
    orchestration: {
      headline: "Agents that work together",
      description: "Build visual pipelines where multiple agents collaborate on complex tasks. One agent's output feeds into the next — no glue code, no manual steps, no limits on what you can orchestrate.",
      cta: "Build your first pipeline",
    },
    security: {
      headline: "Your secrets stay yours",
      description: "Every password, API key, and access token is encrypted on your device using bank-grade AES-256 encryption. Your credentials are stored in your operating system's own secure vault — nothing is ever sent to the cloud.",
      cta: "Secure your connections",
    },
    "multi-provider": {
      headline: "Not locked to one AI",
      description: "Use Claude, OpenAI, Gemini, or run models locally with Ollama. Switch between providers freely, assign different models to different agents, and if one provider goes down — your agents automatically switch to another.",
      cta: "Choose your AI",
    },
    genome: {
      headline: "Your agents get smarter automatically",
      description: "Instead of manually tweaking prompts for hours, let the Genome system do it for you. It tests variations, keeps what works, and discards the rest — like natural selection for your AI agents.",
      cta: "Evolve your agents",
    },
  },
  accessibility: {
    changeLanguage: 'Change language',
    selectLanguage: 'Select language',
    selectTheme: 'Select theme: {name}',
  },
  themes: {
    midnight: 'Midnight',
    cyan: 'Cyan',
    bronze: 'Bronze',
    frost: 'Frost',
    purple: 'Purple',
    pink: 'Pink',
    red: 'Red',
    matrix: 'Matrix',
    light: 'Light',
    ice: 'Ice',
    news: 'News',
  },
  themeDescriptions: {
    midnight: 'Deep navy dark theme',
    cyan: 'Teal accent dark theme',
    bronze: 'Warm amber dark theme',
    frost: 'Silver cool dark theme',
    purple: 'Violet accent dark theme',
    pink: 'Magenta accent dark theme',
    red: 'Crimson accent dark theme',
    matrix: 'Neon green dark theme',
    light: 'Classic bright theme',
    ice: 'Cool blue light theme',
    news: 'High contrast light theme',
  },
};
