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
    useCases: string;
    tour: string;
    security: string;
    blog: string;
    changelog: string;
    pricing: string;
    menu: string;
  };
  compareSection: {
    heading: string;
    headingGradient: string;
    description: string;
    readGuide: string;
    groups: {
      "agents-prompts": { title: string; tagline: string; concepts: string[] };
      triggers: { title: string; tagline: string; concepts: string[] };
      pipelines: { title: string; tagline: string; concepts: string[] };
      credentials: { title: string; tagline: string; concepts: string[] };
      monitoring: { title: string; tagline: string; concepts: string[] };
      testing: { title: string; tagline: string; concepts: string[] };
    };
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
    signingOut: string;
    signIn: string;
    notifyMe: string;
    step: string;
    learnMore: string;
    viewAll: string;
    status: string;
    active: string;
    idle: string;
    total: string;
    checking: string;
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
    incidents: string;
    health: string;
    messages: string;
    more: string;
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    agentsStatus: string;
    lastSeen: string;
    greetingFallback: string;
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
    noTrafficYet: string;
    deployed: string;
    metricsHealth: string;
    toolUtilization: string;
    workers: string;
    usageAnalytics: string;
    errorBoundary: {
      title: string;
      description: string;
      retry: string;
      errorIdLabel: string;
      copyErrorId: string;
      copied: string;
    };
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
    home: {
      vitals: {
        runs: string;
        alerts: string;
      };
      cockpit: {
        vitalsTitle: string;
        vitalsTrend: string;
        triageTitle: string;
        triageSubtitle: string;
        triageEmpty: string;
        triageKindBreach: string;
        triageKindIncident: string;
        triageKindReview: string;
        tickerLabel: string;
        tickerSuccess: string;
        tickerAgents: string;
        tickerProviders: string;
        tickerNextRoutine: string;
        tickerAlerts: string;
        tickerAllClear: string;
        instrumentsTitle: string;
      };
      heatmap: {
        title: string;
        subtitle: string;
        less: string;
        more: string;
        empty: string;
      };
      topPerformers: {
        title: string;
      };
      upcomingRoutines: {
        title: string;
        subtitle: string;
        empty: string;
        triggers: {
          schedule: string;
          polling: string;
          webhook: string;
          event: string;
        };
      };
      vaultChanges: {
        title: string;
        subtitle: string;
        empty: string;
        actions: {
          rotated: string;
          added: string;
          revoked: string;
          synced: string;
        };
      };
    };
  };
  dashboardUi: {
    testFlow: string;
    eventTypes: string;
    stdout: string;
    jumpToLatest: string;
    loadMoreExecutions: string;
    cancelling: string;
    cancelQueuedRun: string;
    conflict: string;
    manualReviews: string;
    manualReviewsSubtitle: string;
    content: string;
    selectReview: string;
    selectReviewDesc: string;
    navigate: string;
    execution: string;
    reviewerNotes: string;
    notesPlaceholder: string;
    selected: string;
    selectReviewsBulk: string;
    noReviewsInFilter: string;
    refreshing: string;
    rejectSelectedTitle: string;
    rejectSelectedBody: string;
    allShortcuts: string;
    keyboardShortcuts: string;
    searchShortcuts: string;
    noShortcutsMatch: string;
    failedAgentDetails: string;
    retryAgentDetails: string;
    recentExecutions: string;
    noExecutionsYet: string;
    subscription: string;
    subscriptions: string;
    trigger: string;
    triggers: string;
    closeAgentDetails: string;
    metricConcurrency: string;
    metricTimeout: string;
    metricBudget: string;
    metricConcurrencyTitle: string;
    metricTimeoutTitle: string;
    metricBudgetTitle: string;
    sessionVerifyFailed: string;
    sessionHelp: string;
    devModeMock: string;
    signInTitlePrefix: string;
    signInTitleDashboard: string;
    devSignInDesc: string;
    prodSignInDesc: string;
    signingIn: string;
    enterDemoDashboard: string;
    continueWithGoogle: string;
    tryDemo: string;
    devNoAuth: string;
    securedBySupabase: string;
    errorBoundaryFallback: string;
    brandName: string;
    connected: string;
    weekAbbr: string;
    disconnected: string;
    totalLabel: string;
    agent: string;
    connections: string;
    eventAnimationPaused: string;
    node: string;
    eventBus: string;
    eventType: string;
    timestamp: string;
    trafficVolume: string;
    samplePayload: string;
    systemHealth: string;
    health: string;
    memoryInsights: string;
    suggestion: string;
    suggestions: string;
    dismissAction: string;
    allSuggestionsDismissed: string;
    noDataAvailable: string;
    errors: string;
    totalLower: string;
    copyPayload: string;
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
      discardTitle: string;
      discardBody: string;
      discardConfirm: string;
      discardKeep: string;
    };
  };
  knowledgePage: {
    viewSwitcherLabel: string;
    title: string;
    subtitle: string;
    denseTable: string;
    graph: string;
    memories: string;
    type: string;
    patternKey: string;
    agent: string;
    success: string;
    successLower: string;
    failures: string;
    failuresLower: string;
    fails: string;
    rate: string;
    rateLower: string;
    cost: string;
    tokens: string;
    retries: string;
    duration: string;
    confidence: string;
    lastSeen: string;
    nodes: string;
    agents: string;
    clusters: string;
    avgConfidence: string;
    all: string;
    agentLinks: string;
    nodeSize: string;
    confidenceLegend: string;
    low: string;
    high: string;
    patterns: string;
    avgCost: string;
    clear: string;
    noPatterns: string;
    types: {
      tool_sequence: string;
      failure_pattern: string;
      cost_quality: string;
      model_performance: string;
      data_flow: string;
    };
  };
  reviewsPage: {
    selectReview: string;
    selectAllPending: string;
    focus: {
      enter: string;
      exit: string;
    volume: string;
    skipTo: string;
    chapterHome: string;
      progress: string;
      skip: string;
      empty: string;
      approve: string;
      reject: string;
    };
    parseError: {
      label: string;
      detail: string;
    };
  };
  leaderboardPage: {
    title: string;
    subtitle: string;
    rank: string;
    composite: string;
    delta: string;
    sortBy: string;
    compare: string;
    versus: string;
    radarTitle: string;
    rankBy: string;
    overall: string;
    metrics: {
      reliability: string;
      cost: string;
    tokens: string;
    retries: string;
      speed: string;
      quality: string;
      volume: string;
    skipTo: string;
    chapterHome: string;
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
    targetFilter: {
      all: string;
      atRisk: string;
      healthy: string;
    };
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
      all: string;
      empty: string;
      ongoing: string;
      duration: string;
      started: string;
      resolved: string;
      otherBreaches: string;
      timeToResolve: string;
      elapsed: string;
    };
  };
  incidentsPage: {
    title: string;
    subtitle: string;
    open: string;
    total: string;
    bySeverity: string;
    bySource: string;
    incidents: string;
    groupByLabel: string;
    clearFilters: string;
    allPersonas: string;
    statusLabel: string;
    severity: {
      critical: string;
      high: string;
      medium: string;
      low: string;
    };
    status: {
      all: string;
      open: string;
      resolved: string;
      ignored: string;
      escalated: string;
    };
    source: {
      all: string;
      executions: string;
      events: string;
      triggers: string;
      vault: string;
      messages: string;
      reviews: string;
    };
    groupBy: {
      none: string;
      agent: string;
      severity: string;
      source: string;
    };
    badges: {
      circuitBreaker: string;
      autoFixed: string;
    };
    detail: {
      recommendation: string;
      source: string;
      category: string;
      persona: string;
      detected: string;
      resolved: string;
      ongoing: string;
    };
    empty: {
      title: string;
      description: string;
      filteredTitle: string;
      filteredDescription: string;
    };
  };
  healthPage: {
    title: string;
    subtitle: string;
    sections: {
      runtime: string;
      services: string;
      resources: string;
      integrations: string;
    };
    status: {
      ok: string;
      warn: string;
      error: string;
      info: string;
    };
    diskUsage: string;
    used: string;
    free: string;
    actions: {
      install: string;
      configure: string;
    };
    toast: {
      configured: string;
      installed: string;
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
    usageInsight: string;
    title: string;
    subtitle: string;
    tabPerformance: string;
    tabUsage: string;
    tabActivity: string;
    circuitBreaker: string;
    autoFixed: string;
    resolved: string;
    autoFixApplied: string;
    costAnomalyDetected: string;
    budgetThresholdExceeded: string;
    totalCost: string;
    executions: string;
    successRate: string;
    activePersonas: string;
    costOverTime: string;
    previousPeriod: string;
    executionHealth: string;
    latencyDistribution: string;
    latencyPercentiles: string;
    spendByAgent: string;
    noSpendData: string;
    healthIssues: string;
    open: string;
    analyzing: string;
    runAnalysis: string;
    runningAnalysis: string;
    allSystemsHealthy: string;
    noIssuesDetected: string;
    noSeverityIssues: string;
    exampleDataNotice: string;
    toolInvocations: string;
    distribution: string;
    usageOverTime: string;
    last14Days: string;
    toolUsageByAgent: string;
    other: string;
    athenaUsage: string;
    athenaSubtitle: string;
    athenaActions: {
      invoke: string;
      recall: string;
      fallback: string;
    };
    valueRollup: string;
    valueDelivered: string;
    costPerValue: string;
    outcomes: {
      delivered: string;
      partial: string;
      blocked: string;
    };
    severity: {
      all: string;
      critical: string;
      high: string;
      medium: string;
      low: string;
    };
  };
  agentsPage: {
    statusLive: string;
    statusOff: string;
    title: string;
    noAgents: string;
    noAgentsDesc: string;
    agentDeployed: string;
    agentsDeployed: string;
    manualExecution: string;
    maxConcurrent: string;
    timeoutSeconds: string;
    budget: string;
    execute: string;
    executing: string;
    executeQueued: string;
    executeFailed: string;
    details: string;
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
    tokens: string;
    retries: string;
    started: string;
    noExecutions: string;
    noExecutionsDesc: string;
    waitingForWorker: string;
    noOutputYet: string;
    noFilteredActive: string;
    noFilteredCompleted: string;
    noFilteredFailed: string;
    noFilteredCancelled: string;
    filteredEmptyDesc: string;
    showAllExecutions: string;
  };
  eventsPage: {
    title: string;
    subtitle: string;
    tabEvents: string;
    tabSubscriptions: string;
    tabVisualization: string;
    tabSwimlane: string;
    event: string;
    source: string;
    time: string;
    id: string;
    sourceLabel: string;
    processed: string;
    retry: string;
    selectForBulkRetry: string;
    showRelatedEvents: string;
    retriedCount: string;
    retryEvent: string;
    searchPlaceholder: string;
    clearSearch: string;
    eventType: string;
    sourceType: string;
    clearFilters: string;
    chain: string;
    events: string;
    result: string;
    results: string;
    noDeadLetters: string;
    noDeadLettersDescription: string;
    noMatchingEvents: string;
    noEvents: string;
    noMatchingEventsDescription: string;
    noEventsDescription: string;
    loadMore: string;
    failedEventSelected: string;
    failedEventsSelected: string;
    selectAllFailed: string;
    retryAll: string;
    active: string;
    disabled: string;
    created: string;
    match: string;
    matches: string;
    deleteSubscription: string;
    unknownAgent: string;
    disableSubscription: string;
    enableSubscription: string;
    createSubscription: string;
    persona: string;
    selectPersona: string;
    selectEventType: string;
    sourceFilter: string;
    optional: string;
    sourceFilterPlaceholder: string;
    create: string;
    newSubscription: string;
    noMatchingSubscriptions: string;
    noSubscriptions: string;
    noSubscriptionsDescription: string;
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
    totalWorkers: string;
    queueLength: string;
    activeExecutions: string;
    notifications: {
      title: string;
      subtitle: string;
      weeklyDigest: string;
      voice: {
        label: string;
        preview: string;
        newReviewRequest: string;
        announcement: string;
        unknownPersona: string;
        severity: {
          critical: string;
          warning: string;
          info: string;
        };
      };
      severity: {
        critical: string;
        high: string;
        medium: string;
        low: string;
      };
    };
    providers: {
      title: string;
      subtitle: string;
      allowed: string;
      requests: string;
    };
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
  templatesPage: {
    title: string;
    subtitle: string;
    gridHeading: string;
    gridDescription: string;
    changeCategory: string;
    complexityAll: string;
    complexityBasic: string;
    complexityProfessional: string;
    complexityEnterprise: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    showingCount: string;
    noMatches: string;
    clearFilters: string;
    viewDetails: string;
    filterByComplexity: string;
    backToTemplates: string;
    keyBenefits: string;
    triggers: string;
    services: string;
    configuration: string;
    copied: string;
    copy: string;
    copyFailed: string;
    copyConfiguration: string;
    getStartedTitle: string;
    getStartedDescription: string;
    openInPersonas: string;
    moreTemplates: string;
    appNotFoundTitle: string;
    appNotFoundDescription: string;
    templateNotFound: string;
    templateNotFoundDescription: string;
    browseTemplates: string;
    backToHome: string;
    customTrigger: string;
  };
  roadmapSection: {
    inProgress: string;
    next: string;
    planned: string;
    completed: string;
    empty: string;
    emptyHint: string;
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
    copyAnchor: string;
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
  blogPage: {
    eyebrow: string;
    heading: string;
    headingGradient: string;
    description: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    clearSearch: string;
    showing: string;
    of: string;
    posts: string;
    noMatches: string;
    clearFilters: string;
    allPosts: string;
    featured: string;
    min: string;
    minRead: string;
    read: string;
    readArticle: string;
    article: string;
    backToBlog: string;
    published: string;
    continueExploring: string;
    seeItInAction: string;
    browseTemplates: string;
    postNotFound: string;
    postNotFoundDescription: string;
    browseAllPosts: string;
    backToHome: string;
  };
  accessibility: {
    changeLanguage: string;
    selectLanguage: string;
    selectTheme: string;
  };
  pageNav: {
    onThisPage: string;
    closeMenu: string;
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
  tour: {
    launch: string;
    play: string;
    pause: string;
    next: string;
    previous: string;
    exit: string;
    volume: string;
    skipTo: string;
    chapterHome: string;
    begin: string;
    skip: string;
    introTitle: string;
    introBody: string;
    bridgePrompt: string;
    bridgeConfirm: string;
    bridgeDismiss: string;
    bridgeToDashboardPrompt: string;
    bridgeToDashboardConfirm: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    features1: string;
    features2: string;
    features3: string;
    features4: string;
    features5: string;
    features6: string;
    dashboardHome: string;
    dashboardAgents: string;
    dashboardExecutions: string;
    dashboardEvents: string;
    dashboardReviews: string;
    roadmap1: string;
    roadmap2: string;
    roadmap3: string;
  };
  playgroundPage: {
    heroHeading: string;
    heroHeadingGradient: string;
    heroDescription: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaDownload: string;
    ctaBrowseTemplates: string;
    selectTask: string;
    simulatedExecution: string;
    statusExecuting: string;
    statusComplete: string;
    statusReady: string;
    chromeTitle: string;
    reset: string;
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
    useCases: 'Use Cases',
    tour: 'Tour',
    security: 'Security',
    blog: 'Blog',
    changelog: 'Changelog',
    pricing: 'Pricing',
    menu: 'Menu',
  },
  compareSection: {
    heading: 'Everything is',
    headingGradient: 'free',
    description: 'The desktop app and every capability below ship free forever. No tiers, no per-seat pricing — just a complete agent platform running on your machine.',
    readGuide: 'Read the guide',
    groups: {
      'agents-prompts': {
        title: 'Agents & Prompts',
        tagline: 'Focused on users',
        concepts: [
          'Natural-language persona authoring',
          '40+ adoptable templates',
          'BYOM — Claude or local Ollama',
          'Structured + simple prompt modes',
          'Persistent agent memory',
        ],
      },
      triggers: {
        title: 'Orchestration',
        tagline: 'Every way an agent can start',
        concepts: [
          'Schedule (cron)',
          'Webhook endpoints',
          'File watcher',
          'Clipboard monitor',
          'Chain / event trigger',
          'Composite conditions',
        ],
      },
      pipelines: {
        title: 'Pipelines & Teams',
        tagline: 'Visual agentic collaboration',
        concepts: [
          'Visual team canvas',
          'Data-flow connections',
          'Live event bus',
          'Self-healing execution',
          'Pipeline replay + time travel',
        ],
      },
      credentials: {
        title: 'Credentials & Security',
        tagline: 'Your secrets stay on your machine',
        concepts: [
          'AES-256-GCM vault',
          'OS-native keyring',
          'AI-assisted OAuth',
          'Automatic token refresh',
          'Zero telemetry, local-first',
        ],
      },
      monitoring: {
        title: 'Monitoring',
        tagline: 'See, cost, and control every run',
        concepts: [
          'Live observability dashboard',
          'Span tracing per execution',
          'Per-model cost attribution',
          'Human review queues',
          'Budget alerts + enforcement',
        ],
      },
      testing: {
        title: 'Testing Lab',
        tagline: 'Automated evolution',
        concepts: [
          'Arena for A/B tests',
          'Prompt versioning + diffs',
          'Fitness scoring',
          'Breeding cycles',
          'Mock tool sandboxes',
        ],
      },
    },
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
    subtitle: 'One persona, many capabilities. Build an assistant with a stable identity and compose the jobs it does \u2014 add, toggle, or retire capabilities without starting over.',
    cta: 'Get Started',
    badge: 'AI Agent Platform',
    headingLine1: 'Intelligent agents',
    headingLine2: 'that work for you',
    description: 'Design agents in natural language. Orchestrate them locally or in the cloud.',
    descriptionBold: 'No workflow diagrams. No agent swarms. No code.',
    mode1: 'Composable Capabilities',
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
    value: 'One persona, many capabilities \u2014 a stable identity with a composable set of jobs, running where your data lives and staying under your control.',
    cta: 'See it in action',
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
    signingOut: 'Signing out…',
    signIn: 'Sign in',
    notifyMe: 'notify me',
    step: 'Step',
    learnMore: 'Learn more',
    viewAll: 'View all',
    status: 'Status',
    active: 'active',
    idle: 'idle',
    total: 'total',
    checking: 'Checking…',
    connected: 'Connected',
    disconnected: 'Disconnected',
    demo: 'Demo',
  },
  useCasesSection: {
    heading: 'One persona,',
    headingGradient: 'many capabilities',
    integrations: 'integrations',
    patterns: 'capabilities',
    description: 'Each persona carries a stable identity and a composable set of capabilities \u2014 click any integration to explore the jobs a persona can do.',
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
    incidents: 'Incidents',
    health: 'Health',
    messages: 'Messages',
    more: 'More',
    greeting: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
    },
    agentsStatus: "Here's what's happening with your agents",
    lastSeen: 'Last seen',
    greetingFallback: 'there',
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
    noTrafficYet: 'No traffic yet',
    deployed: 'deployed',
    metricsHealth: 'Metrics & health',
    toolUtilization: 'Tool utilization',
    workers: 'workers',
    usageAnalytics: 'Usage Analytics',
    errorBoundary: {
      title: 'Dashboard panel failed to render',
      description: 'This section hit an unexpected error. You can retry without leaving the page.',
      retry: 'Retry',
      errorIdLabel: 'Error ID',
      copyErrorId: 'Copy error ID',
      copied: 'Copied',
    },
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
    home: {
      vitals: {
        runs: 'Runs',
        alerts: 'Alerts',
      },
      cockpit: {
        vitalsTitle: 'Fleet vitals',
        vitalsTrend: 'Success · 14 days',
        triageTitle: 'Triage queue',
        triageSubtitle: 'Ranked by urgency',
        triageEmpty: 'All clear — nothing needs your attention right now.',
        triageKindBreach: 'SLA breach',
        triageKindIncident: 'Incident',
        triageKindReview: 'Review',
        tickerLabel: 'Live',
        tickerSuccess: 'Fleet success',
        tickerAgents: 'Agents online',
        tickerProviders: 'Providers',
        tickerNextRoutine: 'Next routine',
        tickerAlerts: 'Open alerts',
        tickerAllClear: 'All clear',
        instrumentsTitle: 'Instruments',
      },
      heatmap: {
        title: 'Execution activity',
        subtitle: 'Runs per agent · last 7 days',
        less: 'Less',
        more: 'More',
        empty: 'No executions yet.',
      },
      topPerformers: {
        title: 'Top performers',
      },
      upcomingRoutines: {
        title: 'Upcoming routines',
        subtitle: 'Next scheduled runs',
        empty: 'No scheduled routines.',
        triggers: {
          schedule: 'Schedule',
          polling: 'Polling',
          webhook: 'Webhook',
          event: 'Event',
        },
      },
      vaultChanges: {
        title: 'Credential vault',
        subtitle: 'Recent changes',
        empty: 'No recent changes.',
        actions: {
          rotated: 'Rotated',
          added: 'Added',
          revoked: 'Revoked',
          synced: 'Synced',
        },
      },
    },
  },
  dashboardUi: {
    testFlow: "Test Flow",
    eventTypes: "Event Types",
    stdout: "stdout",
    jumpToLatest: "Jump to latest",
    loadMoreExecutions: "Load more executions ({visible}/{total})",
    cancelling: "Cancelling...",
    cancelQueuedRun: "Cancel queued run",
    conflict: "Conflict",
    manualReviews: "Manual Reviews",
    manualReviewsSubtitle: "Review and approve agent decisions requiring human oversight",
    content: "Content",
    selectReview: "Select a review",
    selectReviewDesc: "Choose a review from the list to see details and take action",
    navigate: "navigate",
    execution: "Execution",
    reviewerNotes: "Reviewer Notes",
    notesPlaceholder: "Add optional notes before resolving...",
    selected: "selected",
    selectReviewsBulk: "Select reviews for bulk actions",
    noReviewsInFilter: "No reviews in this filter",
    refreshing: "Refreshing...",
    rejectSelectedTitle: "Reject selected reviews?",
    rejectSelectedBody: "This will reject {count} selected review{plural}. You will have 5 seconds to undo this action.",
    allShortcuts: "All shortcuts",
    keyboardShortcuts: "Keyboard shortcuts",
    searchShortcuts: "Search shortcuts...",
    noShortcutsMatch: "No shortcuts match \"{query}\"",
    failedAgentDetails: "Failed to load agent details",
    retryAgentDetails: "Retry",
    recentExecutions: "Recent Executions",
    noExecutionsYet: "No executions yet",
    subscription: "subscription",
    subscriptions: "subscriptions",
    trigger: "trigger",
    triggers: "triggers",
    closeAgentDetails: "Close agent details",
    metricConcurrency: "Concurrency",
    metricTimeout: "Timeout",
    metricBudget: "Budget",
    metricConcurrencyTitle: "Up to {n} concurrent executions",
    metricTimeoutTitle: "Execution timeout: {n} seconds",
    metricBudgetTitle: "Budget cap: {n} per execution",
    sessionVerifyFailed: "Couldn't verify your session",
    sessionHelp: "If this keeps happening, check your network or any ad-blockers.",
    devModeMock: "Development Mode - using mock data",
    signInTitlePrefix: "Sign in to your",
    signInTitleDashboard: "Dashboard",
    devSignInDesc: "Click below to enter the dashboard with example data and explore the UI.",
    prodSignInDesc: "Monitor your cloud agents, review executions, and manage events from one place.",
    signingIn: "Signing in...",
    enterDemoDashboard: "Enter Demo Dashboard",
    continueWithGoogle: "Continue with Google",
    tryDemo: "Try Demo",
    devNoAuth: "No authentication required in development mode",
    securedBySupabase: "Secured by Supabase Authentication",
    errorBoundaryFallback: "This view keeps failing. Please refresh the page or contact support with the error ID above.",
    brandName: "Personas",
    connected: "Connected",
    weekAbbr: "w",
    disconnected: "Disconnected",
    totalLabel: "Total",
    agent: "Agent",
    connections: "Connections",
    eventAnimationPaused: "Event flow animation paused (reduced motion)",
    node: "node",
    eventBus: "Event Bus",
    eventType: "Event Type",
    timestamp: "Timestamp",
    trafficVolume: "Traffic Volume",
    samplePayload: "Sample Payload",
    systemHealth: "System Health",
    health: "Health",
    memoryInsights: "Memory Insights",
    suggestion: "suggestion",
    suggestions: "suggestions",
    dismissAction: "Dismiss: {title}",
    allSuggestionsDismissed: "All suggestions dismissed. Check back later.",
    noDataAvailable: "No data available yet",
    errors: "Errors",
    totalLower: "total",
    copyPayload: "Copy payload",
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
      discardTitle: 'Discard your decisions?',
      discardBody: "You've classified {n} conflicts. Closing now discards them without applying.",
      discardConfirm: 'Discard',
      discardKeep: 'Keep editing',
    },
  },
  knowledgePage: {
    viewSwitcherLabel: "Knowledge views",
    title: "Knowledge Graph",
    subtitle: "Patterns learned from agent executions",
    denseTable: "Dense Table",
    graph: "Graph",
    memories: "Memories",
    type: "Type",
    patternKey: "Pattern Key",
    agent: "Agent",
    success: "Success",
    successLower: "success",
    failures: "Failures",
    failuresLower: "failures",
    fails: "Fails",
    rate: "Rate",
    rateLower: "rate",
    cost: "Cost",
    tokens: 'Tokens',
    retries: 'Retries',
    duration: "Duration",
    confidence: "Confidence",
    lastSeen: "Last seen",
    nodes: "Nodes",
    agents: "Agents",
    clusters: "Clusters",
    avgConfidence: "Avg Conf",
    all: "All",
    agentLinks: "Agent Links",
    nodeSize: "Node Size",
    confidenceLegend: "= confidence",
    low: "low",
    high: "high",
    patterns: "Patterns",
    avgCost: "Avg Cost",
    clear: "Clear",
    noPatterns: "No patterns match current filters",
    types: {
      tool_sequence: "Tool Sequence",
      failure_pattern: "Failure Pattern",
      cost_quality: "Cost / Quality",
      model_performance: "Model Performance",
      data_flow: "Data Flow",
    },
  },
  reviewsPage: {
    selectReview: 'Select review',
    selectAllPending: 'Select all pending reviews',
    focus: {
      enter: 'Focus flow',
      exit: 'Exit focus',
    volume: 'Volume',
    skipTo: 'Jump to',
    chapterHome: 'Homepage',
      progress: '{n} of {total}',
      skip: 'Skip',
      empty: 'All caught up â€” no pending reviews',
      approve: 'Approve',
      reject: 'Reject',
    },
    parseError: {
      label: 'Parse error',
      detail: 'Malformed payload â€” escalated to critical until reviewed',
    },
  },
  leaderboardPage: {
    title: 'Leaderboard',
    subtitle: 'Fleet ranking by composite performance',
    rank: 'Rank',
    composite: 'Composite',
    delta: 'Delta',
    sortBy: 'Sort by {field}',
    compare: 'Compare',
    versus: 'vs',
    radarTitle: 'Metrics profile',
    rankBy: 'Rank by',
    overall: 'Overall',
    metrics: {
      reliability: 'Reliability',
      cost: 'Cost',
    tokens: 'Tokens',
    retries: 'Retries',
      speed: 'Speed',
      quality: 'Quality',
      volume: 'Volume',
    skipTo: 'Jump to',
    chapterHome: 'Homepage',
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
    targetFilter: {
      all: 'All',
      atRisk: 'At risk',
      healthy: 'Healthy',
    },
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
      all: 'All',
      started: 'Started',
      resolved: 'Resolved',
      otherBreaches: 'Other breaches by {persona}: {n}',
      timeToResolve: 'Time to resolve',
      elapsed: 'Elapsed',
      empty: 'No breaches in the last 7 days.',
      ongoing: 'Ongoing',
      duration: '{n} min',
    },
  },
  incidentsPage: {
    title: 'Incidents',
    subtitle: 'Audit-log incidents across the fleet',
    open: 'Open',
    total: 'Total',
    bySeverity: 'By severity',
    bySource: 'By source',
    incidents: 'incidents',
    groupByLabel: 'Group by',
    clearFilters: 'Clear filters',
    allPersonas: 'All personas',
    statusLabel: 'Status',
    severity: {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    status: {
      all: 'All',
      open: 'Open',
      resolved: 'Resolved',
      ignored: 'Ignored',
      escalated: 'Escalated',
    },
    source: {
      all: 'All sources',
      executions: 'Executions',
      events: 'Events',
      triggers: 'Triggers',
      vault: 'Vault',
      messages: 'Messages',
      reviews: 'Reviews',
    },
    groupBy: {
      none: 'None',
      agent: 'Agent',
      severity: 'Severity',
      source: 'Source',
    },
    badges: {
      circuitBreaker: 'Circuit breaker',
      autoFixed: 'Auto-fixed',
    },
    detail: {
      recommendation: 'Recommended action',
      source: 'Source',
      category: 'Category',
      persona: 'Agent',
      detected: 'Detected',
      resolved: 'Resolved',
      ongoing: 'Ongoing',
    },
    empty: {
      title: 'No incidents',
      description: 'The fleet is healthy — no audit incidents recorded.',
      filteredTitle: 'No matching incidents',
      filteredDescription: 'No incidents match the current filters.',
    },
  },
  healthPage: {
    title: 'System health',
    subtitle: 'Runtime, services, resources, and integrations',
    sections: {
      runtime: 'Runtime',
      services: 'Services',
      resources: 'Resources',
      integrations: 'Integrations',
    },
    status: {
      ok: 'Healthy',
      warn: 'Warning',
      error: 'Error',
      info: 'Info',
    },
    diskUsage: 'Disk usage',
    used: 'used',
    free: 'free',
    actions: {
      install: 'Install',
      configure: 'Configure',
    },
    toast: {
      configured: 'configured (demo)',
      installed: 'enabled (demo)',
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
    usageInsight: '{top} is used {ratio}x more than {second}, making it your most utilized tool integration.',
    title: 'Observability',
    subtitle: 'Performance metrics, cost tracking, and tool utilization',
    tabPerformance: 'Performance',
    tabUsage: 'Tool Usage',
    tabActivity: 'Activity',
    circuitBreaker: 'Circuit Breaker',
    autoFixed: 'Auto-fixed',
    resolved: 'Resolved',
    autoFixApplied: 'Auto-fix applied',
    costAnomalyDetected: 'Cost anomaly detected on',
    budgetThresholdExceeded: 'Budget threshold exceeded for',
    totalCost: 'Total Cost',
    executions: 'Executions',
    successRate: 'Success Rate',
    activePersonas: 'Active Personas',
    costOverTime: 'Cost Over Time',
    previousPeriod: 'vs previous period',
    executionHealth: 'Execution Health',
    latencyDistribution: 'Latency Distribution',
    latencyPercentiles: 'P50 / P95 / P99',
    spendByAgent: 'Spend by Agent',
    noSpendData: 'No spend data',
    healthIssues: 'Health Issues',
    open: 'open',
    analyzing: 'Analyzing...',
    runAnalysis: 'Run Analysis',
    runningAnalysis: 'Running health analysis across all monitored services...',
    allSystemsHealthy: 'All systems healthy',
    noIssuesDetected: 'No issues detected across monitored services',
    noSeverityIssues: 'No {severity} severity issues',
    exampleDataNotice: 'Showing example data. Real analytics will appear once agents start running executions.',
    toolInvocations: 'Tool Invocations',
    distribution: 'Distribution',
    usageOverTime: 'Usage Over Time',
    last14Days: 'Last 14 days',
    toolUsageByAgent: 'Tool Usage by Agent',
    other: 'Other',
    athenaUsage: 'Athena usage',
    athenaSubtitle: 'Companion cost by action',
    athenaActions: {
      invoke: 'Invoke',
      recall: 'Recall',
      fallback: 'Fallback',
    },
    valueRollup: 'Value rollup',
    valueDelivered: 'Value delivered',
    costPerValue: 'Cost per value',
    outcomes: {
      delivered: 'Delivered',
      partial: 'Partial',
      blocked: 'Blocked',
    },
    severity: {
      all: 'all',
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    },
  },
  agentsPage: {
    statusLive: 'Live',
    statusOff: 'Off',
    title: 'Agents',
    noAgents: 'No agents deployed',
    noAgentsDesc: 'Deploy your first agent from the Personas desktop app, then come back here to monitor it.',
    agentDeployed: 'agent deployed',
    agentsDeployed: 'agents deployed',
    manualExecution: 'Manual execution from dashboard',
    maxConcurrent: 'max',
    timeoutSeconds: '{n}s timeout',
    budget: 'budget',
    execute: 'Execute',
    executing: 'Executing…',
    executeQueued: 'Execution queued for {name}',
    executeFailed: 'Couldn’t start execution for {name}',
    details: 'Details',
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
    tokens: 'Tokens',
    retries: 'Retries',
    started: 'Started',
    noExecutions: 'No executions yet',
    noExecutionsDesc: 'Execute an agent to see results here',
    waitingForWorker: 'Waiting for worker...',
    noOutputYet: 'No output yet',
    noFilteredActive: 'No active runs in this view',
    noFilteredCompleted: 'No completed runs in this view',
    noFilteredFailed: 'No failed runs in this view',
    noFilteredCancelled: 'No cancelled runs in this view',
    filteredEmptyDesc: 'Other runs exist but none match this filter.',
    showAllExecutions: 'Show all',
  },
  eventsPage: {
    title: 'Events',
    subtitle: 'Event bus activity across all agents',
    tabEvents: 'Events',
    tabSubscriptions: 'Subscriptions',
    tabVisualization: 'Visualization',
    tabSwimlane: 'Timeline',
    event: 'Event',
    source: 'Source',
    time: 'Time',
    id: 'ID',
    sourceLabel: 'Source',
    processed: 'Processed',
    retry: 'Retry',
    selectForBulkRetry: 'Select for bulk retry',
    showRelatedEvents: 'Show {count} related events',
    retriedCount: 'Retried {count} time',
    retryEvent: 'Retry event',
    searchPlaceholder: 'Search payloads, event types, sources, errors...',
    clearSearch: 'Clear search',
    eventType: 'Event type',
    sourceType: 'Source type',
    clearFilters: 'Clear filters',
    chain: 'Chain',
    events: 'events',
    result: 'result',
    results: 'results',
    noDeadLetters: 'No dead letters',
    noDeadLettersDescription: 'Failed events with errors will appear here for retry',
    noMatchingEvents: 'No matching events',
    noEvents: 'No events',
    noMatchingEventsDescription: 'Try adjusting your search or filters',
    noEventsDescription: 'Events will appear here as agents process triggers and subscriptions',
    loadMore: 'Load more events',
    failedEventSelected: 'failed event selected',
    failedEventsSelected: 'failed events selected',
    selectAllFailed: 'Select all failed',
    retryAll: 'Retry All',
    active: 'Active',
    disabled: 'Disabled',
    created: 'Created',
    match: 'match',
    matches: 'matches',
    deleteSubscription: 'Delete subscription',
    unknownAgent: 'Unknown agent',
    disableSubscription: 'Disable subscription',
    enableSubscription: 'Enable subscription',
    createSubscription: 'Create Subscription',
    persona: 'Persona',
    selectPersona: 'Select a persona...',
    selectEventType: 'Select event type...',
    sourceFilter: 'Source Filter',
    optional: 'optional',
    sourceFilterPlaceholder: 'e.g. github, pagerduty...',
    create: 'Create',
    newSubscription: 'New Subscription',
    noMatchingSubscriptions: 'No matching subscriptions',
    noSubscriptions: 'No subscriptions',
    noSubscriptionsDescription: 'Create subscriptions to route events to your agents',
    swimlane: {
      title: 'Event swim-lanes',
      subtitle: 'Time-ordered per-persona event trace',
      empty: 'No events in the selected window',
    },
    connectionStatus: {
      connected: 'Real-time: connected',
      reconnecting: 'Reconnecting to event streamâ€¦',
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
    totalWorkers: 'Total Workers',
    queueLength: 'Queue Length',
    activeExecutions: 'Active Executions',
    notifications: {
      title: 'Notifications',
      subtitle: 'Healing alerts and digests',
      weeklyDigest: 'Weekly health digest',
      voice: {
        label: 'Announce new reviews aloud',
        preview: 'Preview',
        newReviewRequest: 'New review request',
        announcement: 'New {severity} review from {persona}',
        unknownPersona: 'an agent',
        severity: {
          critical: 'critical',
          warning: 'warning',
          info: 'info',
        },
      },
      severity: {
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
    },
    providers: {
      title: 'Model providers',
      subtitle: 'Which models your agents may use',
      allowed: 'Allowed',
      requests: 'requests',
    },
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
  templatesPage: {
    title: 'Agent Templates',
    subtitle: 'Browse {count} ready-made agent templates grouped by the kind of work they do. Pick a category to see the templates inside.',
    gridHeading: 'Browse templates by category',
    gridDescription: 'Templates are pre-configured Personas you can adopt with one click. Each template already has the prompt, tools, and triggers wired up for a specific job â€” no setup required.',
    changeCategory: 'Change category',
    complexityAll: 'All',
    complexityBasic: 'Basic',
    complexityProfessional: 'Professional',
    complexityEnterprise: 'Enterprise',
    searchPlaceholder: 'Search templates, tools, services...',
    searchAriaLabel: 'Search templates',
    showingCount: 'Showing {shown} of {total} templates',
    noMatches: 'No templates match your filters',
    clearFilters: 'Clear filters',
    viewDetails: 'View Details',
    filterByComplexity: 'Filter by complexity',
    backToTemplates: 'Back to Templates',
    keyBenefits: 'Key Benefits',
    triggers: 'Triggers',
    services: 'Services',
    configuration: 'Configuration',
    copied: 'Copied',
    copy: 'Copy',
    copyFailed: 'Copy failed',
    copyConfiguration: 'Copy Configuration',
    getStartedTitle: 'Get Started with This Template',
    getStartedDescription: 'Import this template directly into Personas, or copy the configuration to customize it yourself.',
    openInPersonas: 'Open in Personas',
    moreTemplates: 'More {category} Templates',
    appNotFoundTitle: 'Personas App Not Found',
    appNotFoundDescription: "It looks like Personas isn't installed on your device yet. Download it to import templates directly, or copy the configuration to set it up manually.",
    templateNotFound: 'Template not found',
    templateNotFoundDescription: "This template doesn't exist or has been retired. Browse the gallery for the current collection.",
    browseTemplates: 'Browse templates',
    backToHome: 'Back to home',
    customTrigger: 'Custom trigger',
  },
  roadmapSection: {
    inProgress: 'In Progress',
    next: 'Next',
    planned: 'Planned',
    completed: 'Completed',
    empty: 'Nothing planned right now.',
    emptyHint: 'Check back soon â€” the next milestones land here as we plan them.',
  },
  eventBusSection: {
    dynamicSwarm: 'Dynamic Swarm',
    latencyLanes: 'Latency Lanes',
    ephemeralConnections: 'Ephemeral connections',
    queueDepth: 'Queue depth + throughput',
  },
  guide: {
    title: 'User',
    subtitle: 'Everything you need to know about Personas â€” from your first agent to advanced multi-agent pipelines.',
    searchPlaceholder: 'Search 100+ topics...',
    searchInCategory: 'Search in this category...',
    topics: 'topics',
    backToGuide: 'Back to Guide',
    showAllResults: 'Show all results',
    noResults: 'No topics found. Try a different search term.',
    stillQuestions: 'Still have questions?',
    joinDiscord: 'Join our Discord',
    copyAnchor: 'Copy link to section',
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
      triggers: "Set up when and how your agents run â€” schedules, webhooks, file watchers, and more.",
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
      description: "Build visual pipelines where multiple agents collaborate on complex tasks. One agent's output feeds into the next â€” no glue code, no manual steps, no limits on what you can orchestrate.",
      cta: "Build your first pipeline",
    },
    security: {
      headline: "Your secrets stay yours",
      description: "Every password, API key, and access token is encrypted on your device using bank-grade AES-256 encryption. Your credentials are stored in your operating system's own secure vault â€” nothing is ever sent to the cloud.",
      cta: "Secure your connections",
    },
    "multi-provider": {
      headline: "Not locked to one AI",
      description: "Use Claude, OpenAI, Gemini, or run models locally with Ollama. Switch between providers freely, assign different models to different agents, and if one provider goes down â€” your agents automatically switch to another.",
      cta: "Choose your AI",
    },
    genome: {
      headline: "Your agents get smarter automatically",
      description: "Instead of manually tweaking prompts for hours, let the Genome system do it for you. It tests variations, keeps what works, and discards the rest â€” like natural selection for your AI agents.",
      cta: "Evolve your agents",
    },
  },
  blogPage: {
    eyebrow: 'Blog',
    heading: 'Updates &',
    headingGradient: 'insights',
    description: 'Product announcements, engineering deep-dives, tutorials, and real-world use cases from the Personas team.',
    searchPlaceholder: 'Search posts...',
    searchAriaLabel: 'Search blog posts',
    clearSearch: 'Clear search',
    showing: 'Showing',
    of: 'of',
    posts: 'posts',
    noMatches: 'No posts match your search',
    clearFilters: 'Clear all filters',
    allPosts: 'All posts',
    featured: 'Featured',
    min: 'min',
    minRead: 'min read',
    read: 'Read',
    readArticle: 'Read article',
    article: 'Article',
    backToBlog: 'Back to blog',
    published: 'Published',
    continueExploring: 'Continue exploring',
    seeItInAction: 'See it in action',
    browseTemplates: 'Browse templates',
    postNotFound: 'Blog post not found',
    postNotFoundDescription: "We couldn't find the article you're looking for. It may have been renamed or moved.",
    browseAllPosts: 'Browse all posts',
    backToHome: 'Back to home',
  },
  accessibility: {
    changeLanguage: 'Change language',
    selectLanguage: 'Select language',
    selectTheme: 'Select theme: {name}',
  },
  pageNav: {
    onThisPage: 'On this page',
    closeMenu: 'Close menu',
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
  tour: {
    launch: 'Take the tour',
    play: 'Play',
    pause: 'Pause',
    next: 'Next step',
    previous: 'Previous step',
    exit: 'Exit tour',
    volume: 'Volume',
    skipTo: 'Jump to',
    chapterHome: 'Homepage',
    begin: 'Begin',
    skip: 'Skip',
    introTitle: 'Meet Athena, your guide',
    introBody: 'Athena will walk you through Personas in about a minute — what a persona is, how it works, and how to get started. Pause, skip, or replay any step.',
    bridgePrompt: 'That is Personas at a glance. Want to go deeper and see how each piece actually works, feature by feature?',
    bridgeConfirm: 'Show me the features',
    bridgeDismiss: 'Maybe later',
    bridgeToDashboardPrompt: 'Now see Personas in action — try the demo dashboard.',
    bridgeToDashboardConfirm: 'Open the dashboard',
    step1: 'Meet a persona — a single AI agent with one stable identity and a composable set of skills. Give it the tools it needs, from Gmail and Slack to GitHub and your calendar, and it learns to act across all of them. One persona, many jobs, all working together.',
    step2: 'Now hand that persona a goal in plain language, like "triage my Gmail." Watch its mind work in real time: it reads the request, breaks it into steps, and plans its approach before touching a thing. Then it executes — and shows you every move as it goes.',
    step3: 'An agent is only as useful as the moments it wakes up for. Personas can be triggered ten ways — on a schedule, by an event, by polling a source, or from an incoming webhook. The orchestrator routes each signal to the right agent and keeps everything moving, healing itself if a step ever fails.',
    step4: 'All of this rests on one platform built for trust and scale. An encrypted vault guards your credentials, ready-made templates get you moving fast, and bring-your-own-model keeps you in control of the AI. Live monitoring, an experimentation lab, and team orchestration round it out — six pillars, one place.',
    step5: 'Ready to put a persona to work? Personas runs on your own machine through Claude Code — Anthropic\'s command-line tool — so you stay private and in control. Download the installer for Windows 11, connect the CLI, and your first agent is live in minutes.',
    features1: 'Every agent is born from a single sentence of intent. Personas reads what you want and fills an eight-dimension persona matrix — tasks, memory, triggers, review, and more — asking you only when it truly needs a decision. In moments, a vague idea becomes a structured, executable agent.',
    features2: 'Then it starts to learn. Every task it runs leaves a trace, and the lessons that matter rise into its memory layers while noise settles to the bottom. The more your agent works, the sharper and more context-aware it becomes.',
    features3: 'Real work breaks, so Personas is built to recover. When a step fails, the circuit does not stall — it diagnoses what went wrong, repairs the path, and retries on its own. No 3 a.m. alerts, no manual restarts; the workflow simply keeps moving.',
    features4: 'And you never lose sight of any of it. Every execution, message, event, and memory streams live through one observability deck — sparklines, costs, and status, all in real time. Full transparency, zero setup.',
    features5: 'Great agents are rarely right the first time, so the Lab is where you refine them. Chat with a persona to coach it, pit two versions against each other in the arena, evolve it across generations, or score it on the dimensions that matter. Every improvement you keep is versioned and reversible.',
    features6: 'Personas ships with six purpose-built plugins, each a self-contained workspace your agents can drive. Take Dev Tools: it turns a persona into a coding teammate that runs tasks, reads the output, and iterates. Switch a tab and you meet another specialist — all sharing the same credentials and memory.',
    dashboardHome: 'Welcome to mission control — your whole fleet on one screen. Up top, the vitals: success rate, runs in flight, active agents, open alerts, and reviews waiting on you. Below that, the optimizer surfaces one high-leverage fix at a time — right now, a routing change that trims cost without touching quality. The two panels beneath track each agent\'s health and the new memories they\'ve learned and want to promote. Then the live picture: every execution as it lands on the left, fourteen days of traffic and errors on the right. The heatmap shows runs per agent, day by day, and the bottom row rounds it out — your top performers, the next scheduled routines, and every credential rotation. One page, the entire operation.',
    dashboardAgents: 'This is your roster. Each card is a persona — a single agent with one identity and a set of skills it can compose. The portrait is generated to match its character; below it, the live stats: success rate, runs, and spend. Hit Execute to run one on demand, or open Details to inspect its configuration and recent history. Five agents here, each quietly doing one job well.',
    dashboardExecutions: 'Every run the fleet has made lives here, newest first. The table shows the persona, status, duration, cost, and when it started — filter down to just the failures, or the ones still running. Click any row and the full execution opens: a metrics strip, any error explanation, and the live output streaming line by line, exactly as the agent produced it.',
    dashboardEvents: 'Agents don\'t work in isolation — they react to events. This is the event bus: every signal flowing through the system, from schedules and webhooks to messages between agents. Each row shows the event type, its source, status, and how long ago it fired. Failed events can be retried in place, and related events chain together so you can follow a single cascade end to end.',
    dashboardReviews: 'Some decisions need a human. When an agent hits something it shouldn\'t decide alone, it pauses and routes the call here. Each item carries the persona, the context, and the action it\'s proposing — approve it, reject it, or skip for later, by click or by keyboard. Nothing risky ships without your sign-off, and the queue keeps the rest of the fleet moving while you decide.',
    roadmap1: 'Here is where we are now: each phase on the roadmap is graded by status as it ships.',
    roadmap2: 'What comes next is up to you — vote on the features you want most, and the top ideas shape what we build.',
    roadmap3: 'And here is everything already shipped — every release laid out in order, newest first.',
  },
  playgroundPage: {
    heroHeading: 'See agents in',
    heroHeadingGradient: 'action',
    heroDescription: 'Pick a task below and watch how a Personas agent breaks it down, selects the right tools, and delivers results — all in seconds.',
    ctaTitle: 'Ready to build your own agents?',
    ctaDescription: 'Download Personas and create autonomous agents that connect to your tools, follow your rules, and run on your schedule.',
    ctaDownload: 'Download Personas',
    ctaBrowseTemplates: 'Browse Templates',
    selectTask: 'Select a task above to start the simulation',
    simulatedExecution: 'Simulated execution',
    statusExecuting: 'executing…',
    statusComplete: 'complete',
    statusReady: 'ready',
    chromeTitle: 'agent-playground — live',
    reset: 'Reset',
  },
};