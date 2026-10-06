export interface Translations {
  notFound: {
    title: string;
    description: string;
    home: string;
    getStarted: string;
    backToHome: string;
  };
  errorPage: {
    title: string;
    description: string;
    tryAgain: string;
    errorReference: string;
    copyReference: string;
    backToHome: string;
  };
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
    offerBadges: string[];
    offerBody: string;
    ctaLabel: string;
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
    comingSoon: string;
  };
  hero: {
    downloadCta: string;
    trustLine: string;
    badge: string;
    headingLine1: string;
    headingLine2: string;
    description: string;
    descriptionBold: string;
    mode2: string;
    mode3: string;
    mode5: string;
    viewOnGithub: string;
    downloadForWindows: string;
    commandCenter: string;
    adoptionSnapshot: string;
    scroll: string;
    publicBeta: string;
    agents: string;
    connectors: string;
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
    downloadFor: string;
    joinWaitlist: string;
    connectCli: string;
    launchAgent: string;
    exploreFirst: string;
    requiresCli: string;
    installerSize: string;
    noSignupLine: string;
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
    personas: string;
    missionControl: string;
    /** aria-label of the dashboard's level-1 section rail. */
    navSectionsLabel: string;
    /** Captions of the Overview section's level-2 groups. */
    navGroups: {
      mission: string;
      monitoring: string;
      reliability: string;
      memory: string;
    };
    director: string;
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
    workers: string;
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
      /** Mission Control's annunciator wall (desktop parity, 2026-10). */
      mission: {
        windowNote: string;
        hint: string;
        wallLabel: string;
        /** {label} = the dimension's label. */
        openDimension: string;
        backToWall: string;
        railLabel: string;
        verdicts: {
          pending: string;
          failed: string;
          unmeasured: string;
          ok: string;
          watch: string;
          yours: string;
          act: string;
        };
        dims: {
          outcomes: { label: string; question: string };
          agents: { label: string; question: string };
          queue: { label: string; question: string };
          recovery: { label: string; question: string };
          spend: { label: string; question: string };
          autonomy: { label: string; question: string };
          vault: { label: string; question: string };
          instruments: { label: string; question: string };
        };
        /** One line under each cell's figure. Placeholders in braces are numbers. */
        evidence: {
          outcomes: string;
          noRuns: string;
          agents: string;
          queue: string;
          queueEmpty: string;
          recovery: string;
          spendSpikes: string;
          /** {value} = a currency amount. */
          spendPerDay: string;
          /** {time} = a compact duration such as 6m. */
          autonomy: string;
          autonomyEmpty: string;
          vault: string;
          instruments: string;
          instrumentsOk: string;
          pending: string;
          unmeasured: string;
        };
        scoreSuffix: string;
        detail: {
          issuesTitle: string;
          issuesEmpty: string;
          issueStatus: { open: string; auto_fixed: string; resolved: string };
          pausedBadge: string;
          costTitle: string;
          costSpike: string;
          sourcesTitle: string;
          sourceStatus: { pending: string; ok: string; failed: string };
          sources: { observability: string; healing: string; reviews: string; routines: string };
        };
      };
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
        tickerPause: string;
        tickerResume: string;
      };
      fleetSessions: {
        title: string;
        needsYou: string;
        athenaOnIt: string;
        states: {
          working: string;
          needsYou: string;
          finished: string;
          frozen: string;
        };
      };
      approvedWork: {
        title: string;
        summary: string;
        stale: string;
        neverDispatched: string;
        dispatched: string;
        dispatch: string;
        sendAll: string;
        toast: string;
        empty: string;
      };
      heatmap: {
        title: string;
        subtitle: string;
        less: string;
        more: string;
        empty: string;
      };
      medals: {
        first: string;
        second: string;
        third: string;
      };
      errors: {
        topPerformers: string;
        routines: string;
        executions: string;
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
    related: string;
  };
  dashboardUi: {
    status: {
      queued: string;
      running: string;
      completed: string;
      processed: string;
      failed: string;
      cancelled: string;
      pending: string;
      approved: string;
      rejected: string;
      processing: string;
      dead_letter: string;
      discarded: string;
    };
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
    undo: string;
    retry: string;
    bulkFailedApprove: string;
    bulkFailedReject: string;
    bulkSucceededReselected: string;
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
    /** Empty state for a demo-only view (no synced source) in a real, non-demo session. */
    liveUnavailableTitle: string;
    liveUnavailableDescription: string;
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
    /** Undo toast of the review decision ledger ({count} = rows in the window). */
    undo: {
      approved: string;
      rejected: string;
      refused: string;
    };
    /** SLA chip + header count. {when} = Intl.RelativeTimeFormat phrase ("in 16 minutes" / "16 hours ago"). */
    sla: {
      due: string;
      wasDue: string;
      overdueCount: string;
    };
    /** Detail-panel resolved line. {when} = Intl.RelativeTimeFormat phrase, {name} = resolver. */
    resolved: string;
    resolvedBy: string;
    /** Display names for the store's resolvedBy sentinels (src/lib/review-display.ts). */
    resolver: {
      you: string;
      system: string;
    };
    /** Shown in place of the escalation's persisted auto-approve reviewer note. */
    autoApprovedNote: string;
    /** Bulk commit progress bar. {count} = rows in the commit. */
    bulkProcessing: string;
    /** Standalone severity label (pill / detail header). The voice copy's severity words are inflected for its sentence. */
    severity: {
      critical: string;
      warning: string;
      info: string;
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
  directorPage: {
    title: string;
    subtitle: string;
    periodLabel: string;
    kpi: {
      valueRate: string;
      valueRateHint: string;
      avgVerdict: string;
      avgVerdictHint: string;
      costPerValue: string;
      costPerValueHint: string;
      inScope: string;
      inScopeHint: string;
    };
    momentum: {
      label: string;
      improving: string;
      flat: string;
      declining: string;
      steady: string;
    };
    breakdown: {
      title: string;
      empty: string;
      bands: {
        delivered: string;
        partial: string;
        blocked: string;
        noInput: string;
        unassessed: string;
      };
    };
    distribution: {
      title: string;
      avgLabel: string;
      empty: string;
      agents: string;
    };
    coaching: {
      title: string;
      agent: string;
      latest: string;
      trend: string;
      value: string;
      attention: string;
      lastReview: string;
      never: string;
      healthy: string;
      filterEmpty: string;
      clearFilter: string;
      flags: {
        needsReview: string;
        low: string;
        declining: string;
        stale: string;
      };
      flagHints: {
        needsReview: string;
        low: string;
        declining: string;
        stale: string;
      };
    };
    verdictFeed: {
      title: string;
      empty: string;
      categories: {
        prompt: string;
        health: string;
        triggers: string;
        credentials: string;
        memory: string;
        usefulness: string;
      };
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
    viewThreads: string;
    viewList: string;
    reply: string;
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
    athenaActionMix: string;
    athenaOps: {
      chat: string;
      fleetSpawn: string;
      canvasControl: string;
      recall: string;
      proactiveNudge: string;
      execTriage: string;
      msgTriage: string;
      reviewResolution: string;
    };
    turnsCount: string;
    athenaSpendLane: string;
    spendTurns: string;
    spendCost: string;
    spendAvgPerTurn: string;
    spendTokens: string;
    spendTokensDetail: string;
    athenaVsFleet: string;
    athenaVsFleetCaption: string;
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
    discardEvent: string;
    columnSelect: string;
    columnState: string;
    columnPersona: string;
    columnRetries: string;
    columnActions: string;
    discardAll: string;
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
    deadLetter: string;
    durationMs: string;
    durationFast: string;
    durationNormal: string;
    durationSlow: string;
    swimlane: {
      title: string;
      subtitle: string;
      empty: string;
      eventAt: string;
      axisNow: string;
      axisMinutes: string;
      status: {
        success: string;
        failure: string;
        processing: string;
      };
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
      /** Review escalation ladder on/off (reviewStore.escalationEnabled). */
      escalation: {
        label: string;
        description: string;
      };
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
    rotation: {
      title: string;
      subtitle: string;
      hasPolicy: string;
      noPolicy: string;
      auto: string;
      manual: string;
      anomaly: string;
      next: string;
      overdue: string;
    };
  };
  legalPage: {
    title: string;
    heading: string;
    description: string;
  };
  cookiePolicy: {
    tldr: string[];
    lastUpdated: string;
    approachHeading: string;
    approachBody: string;
    registerHeading: string;
    registerIntro: string;
    categories: Record<"necessary" | "preferences" | "functional" | "analytics", { title: string; description: string }>;
    mechanisms: { cookie: string; localStorage: string };
    lifetimes: { oneYear: string; untilCleared: string; untilSignOut: string };
    purposes: {
      consent: string;
      authSession: string;
      theme: string;
      language: string;
      tourVolume: string;
      dashboardPrefs: string;
      tourSeen: string;
      policySeen: string;
      dashboardActivity: string;
      checklist: string;
      voting: string;
    };
    notUsedHeading: string;
    notUsed: string[];
    thirdPartyHeading: string;
    thirdPartyBody: string;
    managingHeading: string;
    managingBody: string;
    manageButton: string;
  };
  cookieConsent: {
    message: string;
    details: string;
    essentialOnly: string;
    acceptAll: string;
    /** aria-label of the banner's close button; closing keeps essential storage only. */
    close: string;
  };
  waitlist: {
    title: string;
    emailPlaceholder: string;
    earlyBeta: string;
    earlyBetaHint: string;
    joining: string;
    success: string;
    duplicate: string;
    joinCount: string;
    spotSaved: string;
    spotAlreadySaved: string;
    betaFlagged: string;
    emailUseOnly: string;
    announceWhere: string;
    roadmapLink: string;
    share: string;
    manualCopy: string;
    invalidEmail: string;
    errorTimeout: string;
    errorRateLimited: string;
    errorInvalidPlatform: string;
    errorRetryable: string;
    copied: string;
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
    useTemplate: string;
    moreTemplates: string;
    installTitle: string;
    installDescription: string;
    templateNotFound: string;
    templateNotFoundDescription: string;
    browseTemplates: string;
    backToHome: string;
    customTrigger: string;
  };
  connectorModal: {
    simulatedLabel: string;
    connecting: string;
    working: string;
    done: string;
  };
  roadmapSection: {
    inProgress: string;
    next: string;
    planned: string;
    completed: string;
    empty: string;
    emptyHint: string;
    heading: string;
    gradient: string;
    description: string;
    progress: {
      phasesComplete: string;
      noneDone: string;
      firstDone: string;
      rangeDone: string;
      toGoOne: string;
      toGoOther: string;
    };
    areas: {
      i18n: { title: string; caption: string };
      devices: { title: string; caption: string };
      collaboration: { title: string; caption: string };
      platform: { title: string; caption: string };
      templates: { title: string; caption: string };
    };
    bars: {
      europe: string;
      asiaPacific: string;
      southAsia: string;
      middleEast: string;
      windows: string;
      macos: string;
      linux: string;
      web: string;
      mobileCompanion: string;
      solo: string;
      team: string;
      enterprise: string;
      devMode: string;
      connectors: string;
      installersUpdates: string;
      allCategories: string;
      devops: string;
      productivity: string;
      communication: string;
      marketing: string;
      research: string;
      security: string;
      financeCluster: string;
    };
    detail: {
      localeOne: string;
      localeOther: string;
      shipped: string;
      inDevelopment: string;
      thisSite: string;
      preview: string;
      sharedAgents: string;
      ssoAudit: string;
      instantPreview: string;
      services: string;
      autoUpdate: string;
      templatesTotal: string;
    };
    barAria: string;
  };
  featureVoting: {
    eyebrow: string;
    heading: string;
    headingGradient: string;
    subheading: string;
    features: {
      macos: { title: string; description: string };
      dashboard: { title: string; description: string };
      enterprise: { title: string; description: string };
    };
    voteAria: string;
    commentsToggleAria: string;
    discussion: string;
    noComments: string;
    replying: string;
    reply: string;
    addCommentPlaceholder: string;
    writeReplyPlaceholder: string;
    sendCommentAria: string;
    summary: {
      totalVotes: string;
      commentOne: string;
      commentOther: string;
      boostOne: string;
      boostOther: string;
      live: string;
    };
    boost: {
      label: string;
      toggleAria: string;
      tierAria: string;
    };
    request: {
      title: string;
      subtitle: string;
      placeholder: string;
      submitAria: string;
      success: string;
      errorNetwork: string;
      errorRateLimit: string;
      errorInvalid: string;
      errorGeneric: string;
      sponsor: string;
    };
    timeAgo: {
      justNow: string;
      minutes: string;
      hours: string;
      days: string;
    };
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
    searchAllTopics: string;
    searchInCategory: string;
    topics: string;
    backToGuide: string;
    showAllResults: string;
    noResults: string;
    stillQuestions: string;
    joinDiscord: string;
    copyAnchor: string;
    guideHub: string;
    categoryNotFound: {
      title: string;
      description: string;
    };
    topicNotFound: {
      title: string;
      description: string;
    };
    categories: {
      "getting-started": string;
      companion: string;
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
      companion: string;
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
    translationNotice: {
      staleBody: string;
      showTranslation: string;
      showCurrent: string;
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
    landmarkLabel: string;
    scrollMap: string;
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
  athenaPage: {
    /** Scroll-map / mobile-TOC labels for the page's seven sections. */
    nav: {
      meet: string;
      onboarding: string;
      fleet: string;
      workshop: string;
      portfolio: string;
      memory: string;
      oneMind: string;
    };
    hero: {
      eyebrow: string;
      headline: string;
      headlineGradient: string;
      tagline: string;
      persona: string;
      ctaPrimary: string;
      ctaSecondary: string;
      statWhisper: string;
      avatarAlt: string;
      orbAria: string;
      acknowledgeLine: string;
      calloutsAria: string;
      callouts: { label: string; fact: string }[];
    };
    onboarding: {
      intro: { eyebrow: string; heading: string; gradient: string };
      chrome: {
        appName: string;
        search: string;
        nav: string[];
        usageLabel: string;
        usageValue: string;
        newAgent: string;
      };
      canvas: {
        crumbs: string[];
        filters: string[];
        templatesLabel: string;
        templatesHint: string;
        template: {
          title: string;
          meta: string;
          pill: string;
          schedule: string;
          runs: string;
          health: string;
        };
        templateAlt: {
          title: string;
          meta: string;
          pill: string;
          schedule: string;
          runs: string;
          health: string;
        };
        runsTitle: string;
        runsHint: string;
        runsCols: string[];
        runsRows: { name: string; state: string; took: string }[];
        connectLabel: string;
        connectCount: string;
        connectCountDone: string;
        slack: {
          name: string;
          detail: string;
          connect: string;
          connecting: string;
          connected: string;
        };
        chips: { name: string; detail: string; state: string }[];
        triggerLabel: string;
        triggerIdle: string;
        triggerIdleShort: string;
        triggerValue: string;
        triggerValueShort: string;
        triggerHint: string;
        triggerDays: string[];
        triggerZone: string;
        triggerOff: string;
        triggerOn: string;
        activityLabel: string;
        activityPill: string;
        stats: { value: string; label: string }[];
        action: string;
        actionDone: string;
      };
      /** The <=5-word lines she narrates beside the orb, one per route stop. */
      captions: { template: string; connect: string; trigger: string; action: string };
      /** `{n}` / `{total}` are filled with the step counter by ./status. */
      status: {
        setup: string;
        setupShort: string;
        step: string;
        stepShort: string;
        live: string;
        liveShort: string;
      };
    };
    fleet: {
      intro: { eyebrow: string; heading: string; gradient: string };
      request: { placeholder: string; voice: string; sent: string; clauses: string[][] };
      plan: {
        hint: string;
        hintShort: string;
        edited: string;
        start: string;
        working: string;
        done: string;
      };
      task: { working: string; finished: string };
      tasks: { title: string; scope: string; scopeEdited?: string; found: string }[];
      result: { title: string; rows: { label: string; meta: string }[]; footer: string };
      status: {
        speak: string;
        speakShort: string;
        planning: string;
        pieces: string;
        piecesShort: string;
        yourCall: string;
        yourCallShort: string;
        parallel: string;
        parallelShort: string;
        returning: string;
        returningShort: string;
        closing: string;
        closingShort: string;
      };
    };
    workshop: {
      intro: { eyebrow: string; heading: string; gradient: string };
      beds: { name: string; short: string }[];
      jobTitles: string[];
      fence: { plate: string; plateShort: string };
      dial: { label: string; labelShort: string; stops: string[]; stopsShort: string[] };
      job: { working: string; done: string };
      outside: { name: string; waits: string };
      status: {
        line: string;
        lineShort: string;
        draw: string;
        drawShort: string;
        places: string;
        placesShort: string;
        inside: string;
        insideShort: string;
        turnUp: string;
        turnUpShort: string;
        unmoved: string;
        unmovedShort: string;
        stops: string;
        stopsShort: string;
        waits: string;
        waitsShort: string;
        free: string;
        freeShort: string;
      };
    };
    portfolio: {
      intro: { eyebrow: string; heading: string; gradient: string };
      projects: string[];
      field: { handled: string };
      panel: {
        badge: string;
        rows: { name: string; since: string }[];
        rest: string;
        finding: string;
        findingShort: string;
        action: string;
        actionShort: string;
        done: string;
      };
      caption: {
        survey: string;
        surfaced: string;
        worst: string;
        found: string;
        opened: string;
      };
      status: {
        view: string;
        viewShort: string;
        checking: string;
        checkingShort: string;
        needing: string;
        needingShort: string;
        travel: string;
        travelShort: string;
        quiet: string;
        quietShort: string;
        opened: string;
        openedShort: string;
        back: string;
        backShort: string;
        settled: string;
        settledShort: string;
      };
    };
    memory: {
      intro: { eyebrow: string; heading: string; gradient: string };
      talk: string;
      rail: string;
      night: string;
      shelf: string;
      kept: string[];
      status: {
        day: string;
        dayShort: string;
        building: string;
        buildingShort: string;
        sleeps: string;
        sleepsShort: string;
        wakes: string;
        wakesShort: string;
        keeping: string;
        keepingShort: string;
        quiet: string;
        quietShort: string;
        notEnough: string;
        notEnoughShort: string;
        nothingLost: string;
        nothingLostShort: string;
        inUse: string;
        inUseShort: string;
        sleepsAgain: string;
        sleepsAgainShort: string;
        cost: string;
        costShort: string;
        oneMore: string;
        oneMoreShort: string;
        carries: string;
        carriesShort: string;
      };
    };
    oneMind: {
      intro: { eyebrow: string; heading: string; gradient: string };
      conversations: { name: string; short: string }[];
      open: {
        label: string;
        question: string;
        from: string;
        footer: string;
        footerShort: string;
      };
      rows: { claim: string; short: string }[];
      status: {
        live: string;
        liveShort: string;
        open: string;
        openShort: string;
        asked: string;
        askedShort: string;
        answers: string;
        answersShort: string;
        sources: string;
        sourcesShort: string;
        oneVoice: string;
        oneVoiceShort: string;
        samePerson: string;
        samePersonShort: string;
      };
    };
  };
  orchestrationHub: {
    previousTrigger: string;
    nextTrigger: string;
  };
  /** Lab version rail: the desktop Lab's Versions & Ratings table ({version} = a version id). */
  labVersions: {
    title: string;
    hint: string;
    live: string;
    experimental: string;
    rating: string;
    deltaVsBaseline: string;
    baseline: string;
    activate: string;
    activateVersion: string;
    pinBaseline: string;
    regression: string;
    nowLive: string;
  };
  /**
   * /features plugin showcase. {shipped}/{showcased} are derived counts (desktop manifest /
   * roster); {current}/{total} are the open tab's position. Product names stay untranslated.
   */
  pluginShowcase: {
    heading: string;
    headingGradient: string;
    introAll: string;
    introSome: string;
    introTail: string;
    tabsLabel: string;
    counter: string;
    taglines: {
      devTools: string;
      brain: string;
    };
  };
  // BEGIN pending-translation namespaces (English only; listed in PENDING_TRANSLATION)
  teamCanvasSection: {
    heading: string;
    headingGradient: string;
    lede: string;
    goalLabel: string;
    goal: string;
    shipped: string;
    compositeHealth: string;
    base: string;
    target: string;
    stations: Record<"plan" | "build" | "test" | "review", { label: string; sub: string }>;
    kpis: Record<"leadTime" | "coverage" | "errorRate" | "review" | "cost" | "adoption", string>;
    status: Record<"met" | "ok" | "warn" | "crit", string>;
  };
  pricingSection: {
    heading: string;
    headingGradient: string;
    lede: string;
    artLabel: string;
    replay: string;
    computer: string;
    tag: string;
    personas: string;
    cli: string;
    anthropic: string;
    claude: string;
    plan: string;
    beats: string[];
  };
  useCasesPersona: {
    groupLabel: string;
    identityNote: string;
    personaName: string;
    personaDescription: string;
    active: string;
    jobOne: string;
    jobMany: string;
    noConnectors: string;
    connectorCount: string;
    connectedTools: string;
    sampleTriggers: string;
    sampleLastRun: string;
    adds: string;
    emptyJobs: string;
    ledgerLabel: string;
    notConnected: string;
    tabsLabel: string;
    connected: string;
    pause: string;
    replay: string;
    play: string;
  };
  playgroundSection: {
    heading: string;
    headingGradient: string;
    description: string;
    reset: string;
    splitView: string;
    executing: string;
    executionComplete: string;
    srRunning: string;
    srDone: string;
    progressLabel: string;
    editorStatus: {
      running: string;
      done: string;
      idle: string;
    };
    mindStatus: {
      running: string;
      done: string;
      idle: string;
    };
    instructionComment: string;
    intentComment: string;
    selectPrompt: string;
    selectedTools: string;
    result: string;
    mindIdleTitle: string;
    mindIdleHint: string;
    nodes: {
      parse: string;
      select: string;
      execute: string;
      verify: string;
      result: string;
    };
    dimensions: {
      messages: string;
      humanReview: string;
      events: string;
      memories: string;
    };
    tools: {
      gmailApi: string;
      nlpClassifier: string;
      githubApi: string;
      astAnalyzer: string;
      testScanner: string;
      slackApi: string;
      summarizer: string;
      calendarApi: string;
      scheduleAnalyzer: string;
    };
    examples: {
      gmail: {
        label: string;
        prompt: string;
        messages: string;
        humanReview: string;
        memories: string;
      };
      pr: {
        label: string;
        prompt: string;
        messages: string;
        humanReview: string;
        memories: string;
      };
      slack: {
        label: string;
        prompt: string;
        messages: string;
        humanReview: string;
        memories: string;
      };
      schedule: {
        label: string;
        prompt: string;
        messages: string;
        humanReview: string;
        memories: string;
      };
    };
  };
  orchestrationSection: {
    heading: string;
    headingGradient: string;
    description: string;
    ringLabel: string;
    trigger: string;
    firesWhen: string;
    triggers: {
      schedule: {
        label: string;
        description: string;
        example: string;
        persona: string;
      };
      polling: {
        label: string;
        description: string;
        example: string;
        persona: string;
      };
      webhook: {
        label: string;
        description: string;
        persona: string;
      };
      file_watcher: {
        label: string;
        description: string;
        persona: string;
      };
      clipboard: {
        label: string;
        description: string;
        example: string;
        persona: string;
      };
      app_focus: {
        label: string;
        description: string;
        example: string;
        persona: string;
      };
      event_listener: {
        label: string;
        description: string;
        persona: string;
      };
      chain: {
        label: string;
        description: string;
        example: string;
        persona: string;
      };
      composite: {
        label: string;
        description: string;
        example: string;
        persona: string;
      };
      manual: {
        label: string;
        description: string;
        example: string;
        persona: string;
      };
    };
    docs: {
      scheduleGuide: string;
      howTriggersWork: string;
      webhookGuide: string;
      fileWatcherGuide: string;
      clipboardMonitor: string;
      eventBased: string;
      chainGuide: string;
      combining: string;
    };
  };
  companionSection: {
    heading: string;
    headingGradient: string;
    headingTrailing: string;
    description: string;
    avatarAlt: string;
    capabilities: {
      always: {
        label: string;
        blurb: string;
        line: string;
      };
      voice: {
        label: string;
        blurb: string;
        line: string;
      };
      memory: {
        label: string;
        blurb: string;
        line: string;
      };
      proactive: {
        label: string;
        blurb: string;
        line: string;
      };
    };
  };
  visionStack: {
    heading: string;
    headingGradient: string;
    headingTrailing: string;
    description: string;
    groupLabel: string;
    tabsLabel: string;
    layerOf: string;
    inThisAgent: string;
    backToTop: string;
    nextLayerDown: string;
    persona: {
      name: string;
      active: string;
      fromOrigin: string;
      origin: string;
      trigger: string;
      lastRun: string;
      credentialsLocal: string;
    };
    layers: {
      orchestration: {
        title: string;
        description: string;
        details: string[];
        guide: string;
        question: string;
        job: string;
        inAgent: string;
      };
      byom: {
        title: string;
        description: string;
        details: string[];
        guide: string;
        question: string;
        job: string;
        inAgent: string;
      };
      templates: {
        title: string;
        description: string;
        details: string[];
        guide: string;
        question: string;
        job: string;
        inAgent: string;
      };
      monitoring: {
        title: string;
        description: string;
        details: string[];
        guide: string;
        question: string;
        job: string;
        inAgent: string;
      };
      lab: {
        title: string;
        description: string;
        details: string[];
        guide: string;
        question: string;
        job: string;
        inAgent: string;
      };
      'credential-vault': {
        title: string;
        description: string;
        details: string[];
        guide: string;
        question: string;
        job: string;
        inAgent: string;
      };
    };
  };
  designMatrix: {
    heading: string;
    headingGradient: string;
    headingTrailing: string;
    lede: string;
    ledeStrong: string;
    title: string;
    subtitle: string;
    status: {
      running: string;
      done: string;
      idle: string;
    };
    replay: string;
    cellsResolved: string;
    footerStatus: {
      done: string;
      pending: string;
    };
    intent: string;
    intentPlaceholder: string;
    resolved: string;
    analyzing: string;
    userPrompt: string;
    cells: {
      tasks: {
        label: string;
        value: string;
      };
      apps: {
        label: string;
        value: string;
      };
      triggers: {
        label: string;
        value: string;
      };
      review: {
        label: string;
        value: string;
      };
      messages: {
        label: string;
        value: string;
      };
      memory: {
        label: string;
        value: string;
      };
      errors: {
        label: string;
        value: string;
      };
      events: {
        label: string;
        value: string;
      };
    };
    questions: {
      triggers: {
        prompt: string;
        options: string[];
      };
      review: {
        prompt: string;
        options: string[];
      };
    };
  };
  memorySection: {
    heading: string;
    headingGradient: string;
    lede: string;
    artLabel: string;
    run1: string;
    run12: string;
    memory: string;
    replay: string;
  };
  securitySection: {
    heading: string;
    headingGradient: string;
    lede: string;
    artLabel: string;
    replay: string;
    yourKeys: string;
    rings: {
      keychain: string;
      device: string;
    };
  };
  aiModelsSection: {
    heading: string;
    lede: string;
    artLabel: string;
    replay: string;
    local: string;
  };
  observeSection: {
    heading: string;
    headingGradient: string;
    description: string;
    modules: {
      executions: {
        title: string;
        blurb: string;
      };
      messages: {
        title: string;
        blurb: string;
      };
      events: {
        title: string;
        blurb: string;
      };
      memories: {
        title: string;
        blurb: string;
      };
      activity: {
        title: string;
        blurb: string;
      };
      health: {
        title: string;
        blurb: string;
      };
      analytics: {
        title: string;
        blurb: string;
      };
      knowledge: {
        title: string;
        blurb: string;
      };
    };
    agents: {
      prReviewer: string;
      emailTriage: string;
      slackDigest: string;
      deployMonitor: string;
      docIndexer: string;
      meetingNotes: string;
    };
    status: {
      snapshot: string;
      streaming: string;
      autoRefreshing: string;
    };
    chromeInfo: string;
    metrics: {
      successRate: string;
      avgDuration: string;
      avgCost: string;
      activeAgents: string;
    };
    showAll: string;
    footer: string;
    idle: string;
    durationTrend: string;
    eventShort: {
      'execution.completed': string;
      'execution.started': string;
      'message.sent': string;
      'event.emitted': string;
      'memory.stored': string;
      'review.requested': string;
      'knowledge.indexed': string;
      'health.checked': string;
    };
  };
  pluginsExtra: {
    variantBlurbs: {
      athenaFleet: string;
      brain: string;
    };
    fleet: {
      title: string;
      subtitle: string;
      blocked: string;
      working: string;
      done: string;
      autonomous: string;
      statusSpawning: string;
      statusBlocked: string;
      statusWorking: string;
      statusTriaging: string;
      statusAllGreen: string;
      statusWrapping: string;
      cell: {
        spawning: string;
        needsAnswer: string;
        stale: string;
        resolving: string;
        done: string;
        working: string;
      };
      asks: {
        flakyTests: string;
        focusRing: string;
        lcpBudget: string;
      };
      captions: {
        quarantine: string;
        focusRing: string;
        release: string;
        budget: string;
      };
    };
    brain: {
      title: string;
      recall: string;
      capture: string;
      vault: string;
      notes: string;
      links: string;
      recallRate: string;
      connections: string;
      recentThoughts: string;
      backlinkNotes: {
        leonardo: string;
        matrix: string;
        agents: string;
        roadmap: string;
      };
      captures: {
        wire: string;
        masks: string;
        graph: string;
      };
    };
  };
  getStartedSection: {
    heading: string;
    headingGradient: string;
    lede: string;
    artLabel: string;
    replay: string;
    lanes: { you: string; improve: string; agent: string };
    trigger: string;
    days: { mon: string; tue: string; wed: string; thu: string; fri: string };
    steps: { install: string; connect: string; describe: string; promote: string };
    claudeCode: string;
    firstRun: string;
    healed: { top: string; bottom: string };
    overseer: string;
    coachingNote: string;
    lab: string;
    arena: string;
    approve: string;
    scoreBefore: string;
    scoreAfter: string;
  };
  /**
   * /features Lab. {version} is a version id (v4.2) or an arena side (A/B);
   * {gen} a generation number; {dimensions}/{runs} are counts. The applied
   * diffs in the chat are config text and stay in code.
   */
  labSection: {
    heading: string;
    headingGradient: string;
    lede: string;
    tabs: {
      chat: { label: string; blurb: string };
      arena: { label: string; blurb: string };
      evolution: { label: string; blurb: string };
      eval: { label: string; blurb: string };
    };
    chat: {
      title: string;
      applying: string;
      synced: string;
      appliedDiff: string;
      placeholder: string;
      replay: string;
      messages: {
        tooManyUrgent: string;
        tighten: string;
        newsletters: string;
        preFilter: string;
        replayResult: string;
      };
    };
    arena: {
      title: string;
      round: string;
      input: string;
      version: string;
      win: string;
      lose: string;
      winsAria: string;
      losesAria: string;
      fitnessScore: string;
      fighting: string;
      roundComplete: string;
      inputs: {
        prodBug: string;
        declineMeeting: string;
        slackSummary: string;
        explainPr: string;
        flakyTest: string;
      };
    };
    evolution: {
      title: string;
      gen: string;
      best: string;
      lineage: string;
      genAxis: string;
      bestLineage: string;
      alive: string;
      culled: string;
      breed: string;
    };
    eval: {
      title: string;
      avg: string;
      deltaVsBaseline: string;
      current: string;
      baseline: string;
      footer: string;
      dimensions: {
        accuracy: string;
        clarity: string;
        tone: string;
        latency: string;
        cost: string;
        safety: string;
      };
    };
  };
  personasMonitor: {
    title: string;
    lede: string;
    demoBadge: string;
    artBadge: string;
    viewsLabel: string;
    views: {
      board: string;
      city: string;
    };
    viewHints: {
      board: string;
      city: string;
    };
    scaleLabel: string;
    rail: {
      title: string;
      empty: string;
      listLabel: string;
    };
    attention: {
      needs: string;
      working: string;
      resting: string;
      off: string;
    };
    loading: string;
    board: {
      label: string;
      states: {
        running: string;
        failed: string;
        input_required: string;
        draft_ready: string;
        queued: string;
        attention: string;
        idle: string;
        off: string;
      };
      shortStates: {
        running: string;
        failed: string;
        input_required: string;
        draft_ready: string;
        queued: string;
        attention: string;
        idle: string;
        off: string;
      };
      reasons: {
        failed: string;
        input_required: string;
        critical: string;
        draft_ready: string;
        warning: string;
        info: string;
      };
      severity: {
        critical: string;
        warning: string;
        info: string;
      };
      health: {
        healthy: string;
        degraded: string;
        critical: string;
      };
      tasks: {
        toolTimeout: string;
        revising: string;
        resuming: string;
        retrying: string;
        nextBatch: string;
        resting: string;
        draftFallback: string;
      };
      kinds: {
        run_completed: string;
        run_failed: string;
        review_requested: string;
        message: string;
        handoff: string;
        self_heal: string;
        decision: string;
      };
      simEvents: {
        run_completed: string;
        run_failed: string;
        self_heal: string;
      };
      decisions: {
        approve: string;
        sendback: string;
        retry: string;
        answer: string;
        read: string;
        readOne: string;
      };
      toasts: {
        approve: string;
        sendback: string;
        retry: string;
        answer: string;
        read: string;
        readOne: string;
        next: string;
        nobody: string;
      };
      time: {
        justNow: string;
        minutesAgo: string;
        hoursAgo: string;
        daysAgo: string;
      };
      top: {
        needsOne: string;
        needsMany: string;
        allClear: string;
      };
      nav: {
        fleet: string;
        back: string;
        backToFleet: string;
        backToTeam: string;
        breadcrumb: string;
        nextHint: string;
        escHint: string;
      };
      bay: {
        agentsCount: string;
        agentsCountOne: string;
        needCount: string;
        needCountOne: string;
        aria: string;
      };
      tile: {
        reviews: string;
        reviewsOne: string;
        unread: string;
        needsYou: string;
      };
      card: {
        reviews: string;
        reviewsOne: string;
        unread: string;
        unreadOne: string;
      };
      team: {
        title: string;
        titleOne: string;
        runsToday: string;
      };
      stats: {
        runsToday: string;
        success: string;
        costToday: string;
        progress: string;
        runningFor: string;
        last12: string;
        last12Aria: string;
        runs24h: string;
      };
      agent: {
        emblemCaption: string;
        traceCaption: string;
        currentRun: string;
        runStatus: string;
        recentEvents: string;
        nothingLogged: string;
        retry: string;
        retryNote: string;
        answer: string;
        answerNote: string;
        queuedNote: string;
        draftNote: string;
        started: string;
        lastResult: string;
        state: string;
        health: string;
        runsToday: string;
        successRate: string;
        liveToolCalls: string;
        reviewsCount: string;
        oldestDecides: string;
        approve: string;
        sendBack: string;
        waiting: string;
        noDecisions: string;
        unreadCount: string;
        markRead: string;
        inboxClear: string;
        steps: {
          plan: string;
          gather: string;
          tools: string;
          check: string;
          write: string;
          handoff: string;
        };
        results: {
          completed: string;
          failed: string;
        };
      };
      band: {
        used: string;
        hot: string;
        onPace: string;
        headroom: string;
        elapsed: string;
        system: string;
        procRunning: string;
        procDone: string;
        procQueued: string;
        live: string;
        liveNote: string;
      };
    };
    city: {
      label: string;
      states: {
        running: string;
        failed: string;
        input_required: string;
        draft_ready: string;
        queued: string;
        attention: string;
        idle: string;
        off: string;
      };
      reasons: {
        failed: string;
        input: string;
        critical: string;
        criticalMany: string;
        draft: string;
        review: string;
        reviewMany: string;
        info: string;
        infoMany: string;
      };
      moon: {
        five: string;
        seven: string;
        hot: string;
        onPace: string;
        resetsIn: string;
      };
      ago: {
        now: string;
        min: string;
        hour: string;
        day: string;
      };
      runningFor: string;
      reviewsOne: string;
      reviewsMany: string;
      unreadOne: string;
      unreadMany: string;
      pinHint: string;
      teamLine: string;
      windowAria: string;
      buildingAria: string;
      tickerLabel: string;
      live: string;
      hintNext: string;
      legendButton: string;
      legendTitle: string;
      legend: {
        working: string;
        failed: string;
        input: string;
        draft: string;
        review: string;
        queued: string;
        idle: string;
        off: string;
        unread: string;
      };
      legendNote: string;
      processes: {
        label: string;
        running: string;
        queued: string;
        done: string;
      };
    };
  };
  landingSections: {
    hero: {
      line1: string;
      line2: string;
      sub: string;
      aria: string;
      events: string[];
      done: string[];
    };
    featuresHero: {
      line1: string;
      line2: string;
      sub: string;
      aria: string;
      events: string[];
      handled: string;
      yourEvent: string;
      sendEvent: string;
      skipIntro: string;
    };
    useCases: {
      artLabel: string;
      needs: { reach: string; notes: string; book: string; track: string; code: string; pay: string };
      status: string;
      controls: string;
      prevCase: string;
      nextCase: string;
      capabilities: string;
      jobsCount: string;
    };
    agentMind: {
      stylised: string;
      idleHint: string;
      illustration: string;
      wholePlan: string;
      outcomeTitle: string;
      underAttention: string;
      beats: {
        parse: string;
        select: string;
        tools: string;
        execute: string;
        verify: string;
        result: string;
      };
    };
    hub: {
      /** The agent a trigger wakes (V1 fact label, V2/V3 story beat). */
      wakes: string;
    };
    getStarted: {
      replay: string;
      stylised: string;
      v3: {
        agent: string;
        lede: string;
        artLabel: string;
        yours: string;
        yoursLine: string;
        its: string;
        itsLine: string;
        setup: { install: string; describe: string; connect: string };
        day: string;
        dayParts: { coffee: string; meetings: string; lunch: string; focus: string; home: string; asleep: string };
        triggers: { schedule: string; email: string };
        runs: { client: string; invoice: string; overnight: string; digest: string };
        onYourPc: string;
      };
    };
  };
  featuresSections: {
    design: {
      artLabel: string;
      persona: string;
      yourSentence: string;
      reading: string;
      ready: string;
      decided: string;
      replay: string;
      asks: string;
      suggested: string;
      sources: {
        said: string;
        asked: string;
        inferred: string;
      };
      keywords: {
        tasks: string;
        apps: string;
        review: string;
        memory: string;
      };
      v2: {
        lede: string;
        stylised: string;
        sheet: string;
        testRun: string;
      };
      v3: {
        lede: string;
        stylised: string;
      };
    };
    memory: {
      stylised: string;
      categories: { fact: string; decision: string; insight: string; learning: string; warning: string };
      v1: { artLabel: string; retries: string; noRetries: string; recalled: string };
      v2: {
        artLabel: string;
        tiers: {
          core: { name: string; note: string };
          active: { name: string; note: string };
          working: { name: string; note: string };
          archive: { name: string; note: string };
        };
        run: string;
        recall: string;
        learn: string;
        firstTry: string;
        retries: string;
        oneRetry: string;
        pick: string;
        memories: string;
      };
      v3: {
        artLabel: string;
        run: string;
        ofRuns: string;
        rough: string;
        smooth: string;
        legend: string;
        show: string;
        hint: string;
        examples: { fact: string; decision: string; insight: string; learning: string; warning: string };
      };
    };
    healing: {
      heading: string;
      headingGradient: string;
      stylised: string;
      overseerNote: string;
      retry: string;
      cases: Record<
        'rateLimit' | 'timeout' | 'overload' | 'setup' | 'login',
        { name: string; error: string; diagnosis: string; fix: string; result: string; note: string }
      >;
      stages: { detect: string; diagnose: string; fix: string; done: string; yours: string };
      v1: {
        lede: string;
        artLabel: string;
        title: string;
        casesLabel: string;
        schedule: string;
        agent: string;
        report: string;
        log: string;
        healthy: string;
        healed: string;
        stopped: string;
      };
      v2: {
        lede: string;
        artLabel: string;
        failures: string;
        diagnose: string;
        diagnoseSub: string;
        fixed: string;
        forYou: string;
        budget: string;
        logged: string;
      };
      v3: {
        lede: string;
        artLabel: string;
        camera: string;
        overview: string;
        another: string;
        runName: string;
        shots: { fails: string; why: string; fixes: string; stops: string; after: string; asks: string };
        steps: { read: string; summarise: string; save: string; post: string };
        backoff: string;
        timeLimit: string;
        resumeAt: string;
        noBlindRetries: string;
        issueTitle: string;
        noAlert: string;
        secs: string;
        mins: string;
        overseer: string;
        shotOf: string;
      };
    };
    models: {
      stylised: string;
      yourMachine: string;
      viaClaudeCode: string;
      traits: { haiku: string; sonnet: string; opus: string; ollama: string };
      agents: { codeReview: string; inbox: string; brief: string; support: string; journal: string };
      v1: { lede: string; artLabel: string; pick: string };
      v2: {
        lede: string;
        artLabel: string;
        choose: string;
        captions: { haiku: string; sonnet: string; opus: string; ollama: string };
      };
      v3: { lede: string; artLabel: string; agentsTitle: string; onThisPc: string; hint: string; swap: string };
    };
    observe: {
      stylised: string;
      v1: { lede: string; artLabel: string; now: string; secondsAgo: string; failed: string; filtered: string };
      v2: {
        lede: string;
        artLabel: string;
        today: string;
        runsToday: string;
        openRun: string;
        fleet: string;
        legend: { ok: string; failed: string; review: string };
        kinds: { trigger: string; model: string; tool: string; review: string; memory: string; retry: string };
        status: { ok: string; failed: string; retried: string; approved: string; alert: string; running: string; queued: string };
        stats: { duration: string; cost: string; tokens: string };
        timeByStep: string;
        position: string;
        hintFollow: string;
        hintPinned: string;
        runs: {
          pr: {
            id: string;
            steps: { opened: string; read: string; fetch: string; write: string; post: string; retry: string; approve: string; merge: string };
            notes: { opened: string; read: string; fetch: string; write: string; post: string; retry: string; approve: string; merge: string };
          };
          deploy: {
            id: string;
            steps: { check: string; deploys: string; errors: string; diagnose: string; commit: string; rollback: string; revert: string; notify: string };
            notes: { check: string; deploys: string; errors: string; diagnose: string; commit: string; rollback: string; revert: string; notify: string };
          };
          email: {
            id: string;
            steps: { received: string; classify: string; file: string; remember: string; notify: string; archive: string };
            notes: { received: string; classify: string; file: string; remember: string; notify: string; archive: string };
          };
        };
      };
      v3: {
        lede: string;
        artLabel: string;
        allAgents: string;
        printer: string;
        statement: { title: string; spend: string; runs: string; failures: string; approvals: string; byAgent: string };
        stamps: { failed: string; retried: string; approved: string; needsYou: string };
        lines: {
          reviewPr: string;
          sorted: string;
          checked: string;
          digest: string;
          spike: string;
          rollback: string;
          indexed: string;
          standup: string;
          drafted: string;
          post: string;
          repost: string;
          filed: string;
          merged: string;
          synced: string;
          actions: string;
          archived: string;
        };
      };
    };
    plugins: {
      more: string;
      stylised: string;
      taglines: { drive: string; twin: string };
      v1: { artLabel: string; reach: string };
      drive: {
        title: string;
        where: string;
        files: string;
        browse: string;
        folder: string;
        kept: string;
        statusLanding: string;
        statusUpdating: string;
        statusKept: string;
        survives: string;
        agents: { report: string; design: string; leads: string; video: string; notes: string };
      };
      twin: {
        you: string;
        intent: string;
        name: string;
        speaksAs: string;
        traits: { identity: string; tone: string; memory: string };
        recalled: string;
        recallFact: string;
        tracked: string;
        typing: string;
        sender: string;
        contact: string;
        alsoReaches: string;
        channels: {
          slack: { tone: string; message: string; reply: string };
          gmail: { tone: string; subject: string; message: string; signoff: string; reply: string };
          linkedin: { tone: string; message: string; reply: string };
        };
        statusListening: string;
        statusRecalling: string;
        statusMirroring: string;
        statusReplies: string;
      };
    };
  };
  athenaSections: {
    quiet: {
      nav: string;
      intro: { eyebrow: string; heading: string; gradient: string };
      aria: string;
      moments: { event: string; line: string }[];
      passed: string[];
      status: string;
      statusShort: string;
      now: string;
    };
    onboarding: {
      v2: {
        aria: string;
        empty: string;
        you: string;
        askTools: string;
        askJobs: string;
        askStart: string;
        go: string;
        tools: string[];
        agentsLive: string;
        ready: string;
        running: string;
        statusEmpty: string;
        statusRunning: string;
      };
    };
    fleet: {
      v2: { art: string; serial: string; serialStep: string };
    };
    workshop: {
      v3: {
        art: string;
        items: string[];
        high: string;
        low: string;
        line: string;
        lineAria: string;
        done: string;
        forYou: string;
        more: string;
        status: { full: string[]; short: string[] };
      };
    };
    portfolio: {
      aria: { roots: string };
      cause: string;
      you: string;
    };
    memory: {
      stylised: string;
      v1: {
        artLabel: string;
      };
    };
    oneMind: {
      v3: {
        aria: string;
        extras: string[];
        ask: string;
        replies: string[];
        reopened: string;
        status: {
          face: string;
          faceShort: string;
          ask: string;
          askShort: string;
          there: string;
          thereShort: string;
        };
      };
    };
  };
  howSections: {
    /** Scroll-map / mobile-TOC labels for the /how sections, in page order. */
    scrollMap: {
      forYou: string;
      timeline: string;
      chat: string;
      layers: string;
      manifesto: string;
      events: string;
    };
    /** The opening "Start here" section: pick a role, see your path through the page. */
    rolePath: {
      aria: string;
      eyebrow: string;
      heading: string;
      gradient: string;
      lede: string;
      pickLabel: string;
      routeLabel: string;
      jump: string;
      /** {role} is the role name. */
      announce: string;
      roles: {
        developer: { name: string; want: string };
        productManager: { name: string; want: string };
        enterprise: { name: string; want: string };
      };
      /** The four sections below, in page order, each with a line per role. */
      stops: {
        title: string;
        developer: string;
        productManager: string;
        enterprise: string;
      }[];
    };
    /** "Your agents. Your rules. Your infrastructure." with a proof under each line. */
    manifesto: {
      aria: string;
      eyebrow: string;
      lines: { agents: string; rules: string; infra: string };
      agents: { kicker: string; prompt: string; agent: string; ready: string };
      rules: { kicker: string; levels: string[]; note: string };
      infra: { kicker: string; device: string; agents: string; keys: string; cloud: string; never: string };
    };
    timeline: {
      heading: { lead: string; gradient: string; trailing: string };
      stylised: string;
      replay: string;
      pause: string;
      resume: string;
      scenariosLabel: string;
      showScenario: string;
      /** The five live race scenarios: rule steps end with the stall stamp. */
      scenarios: {
        name: string;
        trigger: string;
      }[];
      v3: {
        lede: string;
        artLabel: string;
        start: string;
        finish: string;
        rails: string;
        route: string;
        stalled: string;
        announce: string;
        cases: { snag: string; wait: string; waypoints: string[]; result: string }[];
      };
    };
    chat: {
      aria: string;
      heading: string;
      gradient: string;
      lede: string;
      stylised: string;
      customer: string;
      scripted: string;
      agent: string;
      pickLabel: string;
      pause: string;
      resume: string;
      replay: string;
      inSeconds: string;
      scenarios: {
        name: string;
        message: string;
        scripted: string[];
        agent: string[];
        scriptedOutcome: string;
        agentOutcome: string;
      }[];
      v1: {
        artLabel: string;
        scriptedMode: string;
        agentMode: string;
        clock: string;
        resolved: string;
        unresolved: string;
        rating: string;
      };
    };
    layers: {
      eyebrow: string;
      heading: string;
      headingGradient: string;
      headingTrailing: string;
      stylised: string;
      names: { run: string; coordinate: string; design: string; monitor: string };
      v2: {
        lede: string;
        artLabel: string;
        scrubLabel: string;
        play: string;
        pause: string;
        agent: string;
        agents: string;
        sameLaptop: string;
        ledgerLabel: string;
        prompt: string;
        healed: string;
        stops: { when: string; what: string }[];
        layerLines: { run: string; coordinate: string; design: string; monitor: string };
      };
    };
    events: {
      heading: string;
      headingGradient: string;
      description: string;
      v1: {
        illustration: string;
        tabsLabel: string;
        tabLive: string;
        tabLiveHint: string;
        tabLanes: string;
        tabLanesHint: string;
        hub: string;
        inFlight: string;
        waiting: string;
        typical: string;
        perSecond: string;
        delivery: string;
        backlog: string;
        buildFlow: string;
        /** Keyed by the hub route id (gmail-jira, slack-drive, ...). */
        routes: Record<string, string>;
      };
    };
  };
  /** /m phone landing, "Hive Reels" (src/components/mobile-landing/hive). English only until the designs settle (PLAN.md decision M4). */
  mobileLanding: {
    metaTitle: string;
    metaDescription: string;
    brand: string;
    brandHome: string;
    railLabel: string;
    back: string;
    chapters: string[];
    chapterLabel: string;
    illustrationTag: string;
    hero: {
      kicker: string;
      line1: string;
      line2a: string;
      line2b: string;
      sub: string;
      artLabel: string;
      pickLabel: string;
      events: { ev: string; done: string }[];
      trust: string;
    };
    useCases: {
      title: string;
      lede: string;
      needs: string[];
      reelLabel: string;
      tapHint: string;
      openJobs: string;
      driveShort: string;
      personaName: string;
      personaLine: string;
      jobsUnit: string;
      prev: string;
      next: string;
      replay: string;
      status: string;
      sheetLabel: string;
      adds: string;
      hop: string;
    };
    athena: {
      title: string;
      sub: string;
      lensLabel: string;
      portraitAlt: string;
      note: string;
      caps: Record<'always' | 'voice' | 'memory' | 'proactive', { label: string; blurb: string; line: string }>;
    };
    pricing: {
      title: string;
      sub: string;
      beats: string[];
      artLabel: string;
      replay: string;
      computer: string;
      zero: string;
      personas: string;
      license: string;
      cli: string;
      cliSub: string;
      anthropic: string;
      claude: string;
      planLines: string[];
      onlyBill: string;
    };
    faq: {
      title: string;
      tiles: string[];
      sheetLabel: string;
      index: string;
      prev: string;
      next: string;
    };
    cta: {
      title: string;
      sub: string;
      artLabel: string;
      platformsLabel: string;
      emailLabel: string;
      emailPlaceholder: string;
      hintWin: string;
      hintMac: string;
      hintLin: string;
      copyLink: string;
      reminder: string;
      reminderLabel: string;
      steps: string[];
      fine: string;
      go: string;
      goLabel: string;
      send: string;
      sendSub: string;
      shared: string;
      copied: string;
      sentSub: string;
      join: string;
      joinSub: string;
      joining: string;
      joined: string;
      alreadyJoined: string;
      toastCopied: string;
      toastShared: string;
      manual: string;
      manualLabel: string;
      reminderToast: string;
      reminderFail: string;
      reminderTitle: string;
      reminderBody: string;
      shareTitle: string;
      shareText: string;
    };
  };
  /** /m2 "Around the Clock" phone landing (English only until launch; decision M4/M5). */
  mobileLanding2: {
    meta: { title: string; description: string };
    chrome: {
      chipAria: string;
      /** Day one, Every tool, While you sleep, All day, Ask the dial, Tomorrow. */
      chapters: string[];
      railLabel: string;
      rail: string[];
      stylized: string;
      scroll: string;
      pillGo: string;
      pillRemind: string;
      themeLabel: string;
    };
    dial: {
      aria: string;
      fixedAria: string;
      dayParts: Record<"asleep" | "coffee" | "meet" | "lunch" | "focus" | "home", string>;
      bill: string;
    };
    hero: {
      label: string;
      lines: string[];
      sub: string;
      legend: string;
      stepAria: string;
      steps: { name: string; body: string[] }[];
    };
    tools: {
      label: string;
      lines: string[];
      personaAria: string;
      personaTitle: string;
      personaSub: string;
      jobsAria: string;
      shift: string;
      beadAria: string;
      items: Record<
        "gmail" | "slack" | "github" | "drive" | "jira" | "notion" | "stripe",
        { name: string; jobs: { title: string; chip?: string; body: string }[] }
      >;
    };
    athena: {
      label: string;
      lines: string[];
      sub: string;
      imgAlt: string;
      momsAria: string;
      momTime: string;
      momAria: string;
      bubble: string;
      moments: { name: string; body: string; line: string }[];
    };
    price: {
      label: string;
      lines: string[];
      zero: string;
      sub: string;
      nodesAria: string;
      beats: string[];
      nodeAria: string;
      nodes: { name: string; short: string; body: string[] }[];
    };
    runs: {
      aria: string;
      kicker: string;
      items: { title: string; trigger: string; body: string[] }[];
    };
    faq: {
      kick: string;
      lines: string[];
      labels: string[];
      of: string;
      count: string;
      prev: string;
      next: string;
      dialAria: string;
      items: { q: string; a: string[] }[];
    };
    cta: {
      kick: string;
      lines: string[];
      sub: string;
      faces: string[];
      remind: string;
      remindFine: string;
      platsAria: string;
      plats: Record<"windows" | "macos" | "linux", { name: string; note: string }>;
      sendTitle: string;
      sendNote: string;
      copy: string;
      share: string;
      manual: string;
      waitlistTitle: string;
      waitlistNote: string;
      emailLabel: string;
      emailPlaceholder: string;
      join: string;
      joining: string;
      joined: string;
      already: string;
      need: string;
    };
    share: { title: string; text: string };
    toast: { copied: string; shared: string; reminder: string; reminderFailed: string };
    ics: { title: string; description: string; file: string };
    card: {
      back: string;
      note: string;
      jobKicker: string;
      jobExtra: string;
      stepKicker: string;
      momentNote: string;
      nodeKicker: string;
      nodeNote: string;
      persona: { kicker: string; title: string; body: string[] };
    };
    footer: { facts: string; stylized: string };
  };
  /** Phone layouts of the dashboard: the command plane (/m revival phase 2, PHASE2-SPEC.md 4.3 + 6.2). */
  mobile: {
    personas: {
      title: string;
      loading: string;
      empty: string;
      error: string;
      retry: string;
      active: string;
      paused: string;
      pause: string;
      resume: string;
      pauseLabel: string;
      resumeLabel: string;
      demoNote: string;
    };
    reach: {
      offlineTitle: string;
      offlineBody: string;
      yourComputer: string;
      neverTitle: string;
      neverBody: string;
      demoTitle: string;
      demoBody: string;
      downloadCta: string;
      linkCopied: string;
      shareFailed: string;
      unpairedTitle: string;
      unpairedBody: string;
      unpairedCta: string;
    };
    command: {
      pending: string;
      executing: string;
      completed: string;
      failed: string;
      rejected: string;
      expired: string;
    };
    pairing: {
      title: string;
      body: string;
      howTo: string;
      pairing: string;
      pending: string;
      active: string;
      refused: string;
      revoked: string;
      unsupported: string;
      error: string;
      noDevice: string;
      unpair: string;
    };
  };
  // END pending-translation namespaces
}

/**
 * Namespaces migrated from hardcoded English on 2026-09-25 by owner decision
 * ("Migrate hardcoded English, no need to translate for now"). They are
 * English-only until translated: the 13 non-en locales may omit them (see
 * `LocaleTranslations`), the runtime falls back to English via
 * `mergeWithEnglishFallback`, and `scripts/check-i18n-coverage.mjs` skips them
 * while printing the pending count. To translate one, add it to every locale
 * file and remove it from this list - tsc then requires it everywhere.
 */
export const PENDING_TRANSLATION = [
  'useCasesPersona',
  'teamCanvasSection',
  'pricingSection',
  'playgroundSection',
  'orchestrationSection',
  'companionSection',
  'visionStack',
  'designMatrix',
  'memorySection',
  'securitySection',
  'aiModelsSection',
  'observeSection',
  'pluginsExtra',
  'getStartedSection',
  'labSection',
  'landingSections',
  'featuresSections',
  'athenaSections',
  'howSections',
  'mobileLanding',
  'mobileLanding2',
  'personasMonitor',
  'mobile',
] as const;

export type PendingNamespace = (typeof PENDING_TRANSLATION)[number];

/** The shape a non-en locale file must satisfy: pending namespaces optional. */
export type LocaleTranslations = Omit<Translations, PendingNamespace> &
  Partial<Pick<Translations, PendingNamespace>>;

export const en: Translations = {
  notFound: {
    title: 'Page not found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved. Try one of these instead:',
    home: 'Home',
    getStarted: 'Get Started',
    backToHome: 'Back to home',
  },
  errorPage: {
    title: 'This page hit an unexpected turn',
    description: 'Something went wrong while loading this page. Our team has been notified \u2014 try again, or head back to home.',
    tryAgain: 'Try again',
    errorReference: 'Error reference',
    copyReference: 'Copy error reference',
    backToHome: 'Back to home',
  },
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
    description: 'The desktop app and every capability below ship free forever: a complete agent platform running on your machine.',
    offerBadges: ['Free forever', 'Self-hosted', 'Open source'],
    offerBody: 'Personas runs on your machine.',
    ctaLabel: 'Get started free',
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
          'Local-first, anonymous telemetry only',
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
    motto: 'AI agents that automate your work.',
    product: 'Product',
    resources: 'Resources',
    legal: 'Legal',
    privacy: 'Privacy',
    terms: 'Terms',
    copyright: 'Personas. All rights reserved.',
    slogan: 'Automate your work. Reclaim your time.',
  },
  pricing: {
    comingSoon: 'Coming Soon',
  },
  hero: {
    downloadCta: 'Download Personas',
    trustLine: 'No signup, no credit card. Runs on your machine.',
    badge: 'AI Agent Platform',
    headingLine1: 'Intelligent agents',
    headingLine2: 'that work for you',
    description: 'Design agents in natural language. Orchestrate them on your own machine.',
    descriptionBold: 'No workflow diagrams. No agent swarms. No code.',
    mode2: 'Simple setup',
    mode3: 'Free',
    mode5: 'Self-improving',
    viewOnGithub: 'View on GitHub',
    downloadForWindows: 'Download for Windows',
    commandCenter: 'Command Center',
    adoptionSnapshot: 'Adoption snapshot',
    scroll: 'Scroll',
    publicBeta: 'PUBLIC BETA',
    agents: 'Agents',
    connectors: 'Connectors',
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
        q: 'What is Claude Code and why do I need it?',
        a: 'Claude Code is Anthropic\'s official command-line tool for working with Claude. Personas uses it under the hood to run your agents locally. It handles authentication, model access, and streaming responses. You\'ll need an active Claude Pro or Max subscription and Claude Code installed before launching Personas.',
      },
      {
        q: 'Does Personas collect any telemetry or usage data?',
        a: 'Only anonymous diagnostics. Release builds of the desktop app send error reports and anonymous usage signals (app sessions, which sections you open, key actions) to Sentry. IP addresses, emails, and usernames are stripped first, and your prompts, agent configurations, credentials, and execution logs are never included. You can turn off usage signals in Settings > Account.',
      },
      {
        q: 'Is Personas free?',
        a: 'Yes. The desktop app is free and open source, with unlimited local agents. You need your own Claude subscription, and we never touch your Anthropic bill. Think of Personas as the orchestration layer, and Claude as the engine.',
      },
      {
        q: 'Are there any limits on the number of agents?',
        a: 'No. Create as many agents as you want.',
      },
    ],
  },
  downloadSection: {
    heading: 'Ready to build your',
    headingGradient: 'agent?',
    subtitle: 'Download Personas for free. Start building in minutes.',
    downloadInstaller: 'Download installer',
    downloadFor: 'Download for {platform}',
    joinWaitlist: 'Join waitlist',
    connectCli: 'Connect Claude Code',
    launchAgent: 'Launch first agent',
    exploreFirst: 'Explore capabilities first',
    requiresCli: 'Requires Claude Code',
    installerSize: '12 MB installer',
    noSignupLine: 'No signup, no credit card. Runs on your machine.',
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
    personas: 'Personas',
    missionControl: 'Mission Control',
    navSectionsLabel: 'Dashboard sections',
    navGroups: {
      mission: 'Mission',
      monitoring: 'Monitoring',
      reliability: 'Reliability',
      memory: 'Memory',
    },
    director: 'Director',
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
    workers: 'workers',
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
      mission: {
        windowNote: 'Readings cover the last 14 days',
        hint: 'Press 1 to 8 to open a dimension, Esc to return',
        wallLabel: 'Fleet dimensions',
        openDimension: 'Open {label}',
        backToWall: 'Back to the wall',
        railLabel: 'All dimensions',
        verdicts: {
          pending: 'Measuring',
          failed: 'Unavailable',
          unmeasured: 'Not measured',
          ok: 'Steady',
          watch: 'Watch',
          yours: 'Waiting on you',
          act: 'Needs you',
        },
        dims: {
          outcomes: { label: 'Outcomes', question: 'Are runs succeeding?' },
          agents: { label: 'Agents', question: 'Is any agent struggling?' },
          queue: { label: 'Waiting on you', question: 'What needs your hand?' },
          recovery: { label: 'Self-healing', question: 'Is the fleet fixing itself?' },
          spend: { label: 'Spend', question: 'Is spend behaving?' },
          autonomy: { label: 'Autonomy', question: 'What runs without you?' },
          vault: { label: 'Vault', question: 'Are credentials sound?' },
          instruments: { label: 'Instruments', question: 'Is this page up to date?' },
        },
        evidence: {
          outcomes: 'Runs {runs} · failed {failed}',
          noRuns: 'No runs in this window',
          agents: 'Outage {critical} · degraded {degraded} · operational {healthy}',
          queue: 'Alerts {alerts} · reviews {reviews} · memory {memory} · unread {reports}',
          queueEmpty: 'Nothing waits for you',
          recovery: 'Open {open} · paused {paused} · auto-fixed {fixed}',
          spendSpikes: 'Cost spikes: {n}',
          spendPerDay: '{value} per day',
          autonomy: 'Scheduled {n} · next in {time}',
          autonomyEmpty: 'Nothing scheduled',
          vault: 'Overdue {overdue} · anomalies {anomalies} · events {events}',
          instruments: 'Failed sources: {failed}',
          instrumentsOk: 'Every source answered',
          pending: 'Waiting for the first reading',
          unmeasured: 'No synced source for this yet',
        },
        scoreSuffix: '/100',
        detail: {
          issuesTitle: 'Healing issues',
          issuesEmpty: 'No healing issues in this window.',
          issueStatus: { open: 'Open', auto_fixed: 'Auto-fixed', resolved: 'Resolved' },
          pausedBadge: 'Paused',
          costTitle: 'Cost by day',
          costSpike: 'Cost spike',
          sourcesTitle: 'Sources',
          sourceStatus: { pending: 'Waiting', ok: 'Answered', failed: 'Failed' },
          sources: {
            observability: 'Observability',
            healing: 'Healing issues',
            reviews: 'Reviews',
            routines: 'Routines',
          },
        },
      },
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
        tickerPause: 'Pause status ticker',
        tickerResume: 'Resume status ticker',
      },
      fleetSessions: {
        title: 'Fleet sessions',
        needsYou: '{count} need you',
        athenaOnIt: "Athena's on it",
        states: {
          working: 'Working',
          needsYou: 'Needs you',
          finished: 'Finished',
          frozen: 'Frozen',
        },
      },
      approvedWork: {
        title: 'Approved work',
        summary: '{undispatched} of {total} approved ideas never became a task',
        stale: '{count} waiting over {days} days',
        neverDispatched: 'Never dispatched',
        dispatched: 'Dispatched',
        dispatch: 'Dispatch',
        sendAll: 'Send to Fleet ({count})',
        toast: '{count} sent — Fleet',
        empty: 'Nothing is waiting to be dispatched',
      },
      heatmap: {
        title: 'Execution activity',
        subtitle: 'Runs per agent · last 7 days',
        less: 'Less',
        more: 'More',
        empty: 'No executions yet.',
      },
      medals: {
        first: '1st',
        second: '2nd',
        third: '3rd',
      },
      errors: {
        topPerformers: 'Failed to load top performers',
        routines: 'Failed to load routines',
        executions: 'Failed to load executions',
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
    related: 'Related',
  },
  dashboardUi: {
    status: {
      queued: "Queued",
      running: "Running",
      completed: "Completed",
      processed: "Processed",
      failed: "Failed",
      cancelled: "Cancelled",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      processing: "Processing",
      dead_letter: "Dead letter",
      discarded: "Discarded",
    },
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
    rejectSelectedBody: "This will reject the selected reviews ({count}). You will have 5 seconds to undo this action.",
    undo: "Undo",
    retry: "Retry",
    bulkFailedApprove: "{failed} of {total} failed to approve",
    bulkFailedReject: "{failed} of {total} failed to reject",
    bulkSucceededReselected: "{count} succeeded · failed items re-selected",
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
    liveUnavailableTitle: "Not available for live workspaces yet",
    liveUnavailableDescription: "This view runs on demo data only. Your workspace doesn't sync this data yet, so it stays empty rather than showing sample data.",
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
      empty: 'All caught up — no pending reviews',
      approve: 'Approve',
      reject: 'Reject',
    },
    parseError: {
      label: 'Parse error',
      detail: 'Malformed payload — escalated to critical until reviewed',
    },
    undo: {
      approved: 'Reviews approved: {count}',
      rejected: 'Reviews rejected: {count}',
      refused: 'Some of these reviews already have a verdict pending. Undo it or wait for it to save.',
    },
    sla: {
      due: 'Due {when}',
      wasDue: 'Was due {when}',
      overdueCount: 'Overdue: {n}',
    },
    resolved: 'Resolved {when}',
    resolvedBy: 'Resolved {when} by {name}',
    resolver: {
      you: 'you',
      system: 'the system',
    },
    autoApprovedNote: 'Auto-approved: SLA expired',
    bulkProcessing: 'Processing reviews: {count}',
    severity: {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
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
  directorPage: {
    title: 'Director',
    subtitle: 'Coaching command center for your starred agents',
    periodLabel: 'Last {n} days',
    kpi: {
      valueRate: 'Value delivered',
      valueRateHint: 'Fleet executions that delivered value',
      avgVerdict: 'Avg verdict',
      avgVerdictHint: 'Mean latest score across reviewed agents',
      costPerValue: 'Cost / value',
      costPerValueHint: 'Spend per value-delivered run',
      inScope: 'In scope',
      inScopeHint: '{reviewed} reviewed · {unreviewed} pending',
    },
    momentum: {
      label: 'Momentum',
      improving: 'improving',
      flat: 'flat',
      declining: 'declining',
      steady: 'Holding steady',
    },
    breakdown: {
      title: 'Value breakdown',
      empty: 'No assessed runs in this period yet',
      bands: {
        delivered: 'Delivered',
        partial: 'Partial',
        blocked: 'Blocked',
        noInput: 'No input',
        unassessed: 'Unassessed',
      },
    },
    distribution: {
      title: 'Score distribution',
      avgLabel: 'avg',
      empty: 'No scored agents yet',
      agents: '{count} agents',
    },
    coaching: {
      title: 'Coaching scope',
      agent: 'Agent',
      latest: 'Latest',
      trend: 'Trend',
      value: 'Value',
      attention: 'Attention',
      lastReview: 'Last review',
      never: 'Never',
      healthy: 'All agents in scope are healthy',
      filterEmpty: 'No agents match this filter',
      clearFilter: 'Clear filter',
      flags: {
        needsReview: 'New',
        low: 'Low',
        declining: 'Declining',
        stale: 'Stale',
      },
      flagHints: {
        needsReview: 'In scope but never scored — run the Director to get a baseline.',
        low: 'Latest verdict is 2 or below — these agents need coaching.',
        declining: 'Latest score dropped from the previous review.',
        stale: 'Last reviewed over two weeks ago — re-check that they still earn their keep.',
      },
    },
    verdictFeed: {
      title: 'Recent coaching verdicts',
      empty: 'No verdicts yet — run a review to see coaching here',
      categories: {
        prompt: 'Prompt',
        health: 'Health',
        triggers: 'Triggers',
        credentials: 'Credentials',
        memory: 'Memory',
        usefulness: 'Usefulness',
      },
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
    viewThreads: 'Threads',
    viewList: 'List',
    reply: 'Reply',
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
    athenaActionMix: 'Cost by action type',
    athenaOps: {
      chat: 'Chat',
      fleetSpawn: 'Fleet spawn',
      canvasControl: 'Canvas control',
      recall: 'Recall',
      proactiveNudge: 'Proactive nudges',
      execTriage: 'Execution triage',
      msgTriage: 'Message triage',
      reviewResolution: 'Review resolution',
    },
    turnsCount: '{count} turns',
    athenaSpendLane: 'Athena spend lane',
    spendTurns: 'Turns',
    spendCost: 'Athena cost',
    spendAvgPerTurn: 'Avg / turn',
    spendTokens: 'Tokens',
    spendTokensDetail: '{in} in · {out} out',
    athenaVsFleet: 'Athena vs fleet',
    athenaVsFleetCaption: '{athena} of {total} total spend this window',
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
    discardEvent: 'Discard event',
    columnSelect: 'Select',
    columnState: 'State',
    columnPersona: 'Target persona',
    columnRetries: 'Retries',
    columnActions: 'Actions',
    discardAll: 'Discard',
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
    deadLetter: 'Dead Letter',
    durationMs: '{n} ms',
    durationFast: 'Fast',
    durationNormal: 'Normal',
    durationSlow: 'Slow',
    swimlane: {
      title: 'Event swim-lanes',
      subtitle: 'Time-ordered per-persona event trace',
      empty: 'No events in the selected window',
      eventAt: '{type} at {time}',
      // Chart-axis register: keep these terse in every locale, they are tick
      // labels sharing one column. Not the staleness-pill sentence form.
      axisNow: 'now',
      axisMinutes: '{n}m',
      status: {
        success: 'Success',
        failure: 'Failure',
        processing: 'Processing',
      },
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
    totalWorkers: 'Total Workers',
    queueLength: 'Queue Length',
    activeExecutions: 'Active Executions',
    notifications: {
      title: 'Notifications',
      subtitle: 'Healing alerts and digests',
      weeklyDigest: 'Weekly health digest',
      escalation: {
        label: "Escalate overdue reviews",
        description: "Pending reviews that pass their SLA are escalated. Where the policy says so, they are approved automatically instead (by default, Info reviews after 8 hours).",
      },
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
    rotation: {
      title: 'Credential rotation',
      subtitle: 'Vault rotation status',
      hasPolicy: 'Policy',
      noPolicy: 'No policy',
      auto: 'Auto',
      manual: 'Manual',
      anomaly: 'Anomaly',
      next: 'Next',
      overdue: 'Overdue',
    },
  },
  legalPage: {
    title: 'Legal',
    heading: 'Legal pages coming soon',
    description: 'Our privacy policy and terms of service are being finalized. In the meantime, if you have any questions please reach out to us.',
  },
  cookiePolicy: {
    tldr: [
      'This site sets no cookies of its own and keeps a few settings in your browser\'s local storage. Every item is listed below.',
      'No advertising, cross-site tracking, or fingerprinting of any kind.',
      'You can clear all of it anytime in your browser settings.',
    ],
    lastUpdated: 'Last updated: {date}',
    approachHeading: 'Our approach to cookies and storage',
    approachBody: 'We store only what the site needs. Browser storage such as local storage counts as a cookie under EU rules, so the list below covers both. We do not use advertising cookies, tracking pixels, or fingerprinting.',
    registerHeading: 'What we store on your device',
    registerIntro: 'Every cookie and storage key this website writes, grouped by purpose. A name ending in * stands for a family of keys, such as one per policy or checklist.',
    categories: {
      necessary: {
        title: 'Strictly necessary',
        description: 'Needed for the site to do what you asked. They are always on.',
      },
      preferences: {
        title: 'Preferences',
        description: 'Remember choices you made, so the site looks and behaves the way you set it.',
      },
      functional: {
        title: 'Functional',
        description: 'Keep features working across visits: your progress, what you have already seen, and your votes.',
      },
      analytics: {
        title: 'Analytics',
        description: 'Nothing is stored for analytics. If you choose "Accept All" in the cookie banner, the site counts page views and a few key actions anonymously, without writing anything to your device. If you choose "Essential Only", nothing is counted.',
      },
    },
    mechanisms: {
      cookie: 'Cookie',
      localStorage: 'Local storage',
    },
    lifetimes: {
      oneYear: '1 year',
      untilCleared: 'Until you clear it',
      untilSignOut: 'Until you sign out',
    },
    purposes: {
      consent: 'Remembers your choice in the cookie banner.',
      authSession: 'Keeps you signed in to the dashboard. Written by Supabase, our sign-in provider, and only if you sign in.',
      theme: 'Remembers the color theme you picked.',
      language: 'Remembers the language you picked.',
      tourVolume: 'Remembers the narration volume of the guided tour.',
      dashboardPrefs: 'Remembers your dashboard views, filters, and settings, such as review escalation and read-aloud.',
      tourSeen: 'Remembers that you have seen the guided tour, so it is not offered again.',
      policySeen: 'Remembers when you last read each policy on this page, so updates can be flagged.',
      dashboardActivity: 'Remembers when you last opened the dashboard and how often a demo event was retried.',
      checklist: 'Remembers which guide checklist items you ticked.',
      voting: 'A random ID that lets you vote once per feature, and a random nickname (such as SwiftFox) shown on your comments. Both are sent with your votes and comments, and neither contains personal information.',
    },
    notUsedHeading: 'What we do not use',
    notUsed: [
      'No advertising or remarketing cookies',
      'No cross-site tracking',
      'No social media tracking pixels',
      'No analytics cookies or analytics storage',
    ],
    thirdPartyHeading: 'Third-party cookies',
    thirdPartyBody: 'If you sign in, you pass through Supabase, our sign-in provider, and the account provider you choose, such as Google. They may set cookies on their own domains during sign-in, under their own policies. We do not use those cookies for tracking.',
    managingHeading: 'Managing cookies and storage',
    managingBody: 'You can clear or block cookies and site data in your browser settings at any time. Clearing them signs you out and resets your preferences. For questions, reach out to {email}.',
    manageButton: 'Manage cookie preferences',
  },
  cookieConsent: {
    message: 'We keep a few settings in your browser so the site works. "Accept All" also lets us count page views and a few key actions anonymously, without storing anything for it. No ads, no cross-site tracking.',
    details: 'Details',
    essentialOnly: 'Essential Only',
    acceptAll: 'Accept All',
    close: 'Close and use essential only',
  },
  waitlist: {
    title: 'Personas for {platform}',
    emailPlaceholder: 'Enter your email',
    earlyBeta: 'I want early beta access',
    earlyBetaHint: 'Get access to unstable builds before the public release',
    joining: 'Joining...',
    success: "You're on the list!",
    duplicate: 'Already registered',
    joinCount: 'Join {count} people waiting for {platform}',
    spotSaved: 'Your spot for {platform} is saved.',
    spotAlreadySaved: 'Your spot for {platform} was already saved.',
    betaFlagged: 'You opted into early beta, so your entry is flagged for the first build wave.',
    emailUseOnly: 'Your address is only used to size the waitlist - we send no marketing email.',
    announceWhere: 'Beta availability is announced on the {link} and on GitHub - watch either for the release.',
    roadmapLink: 'public roadmap',
    share: 'Share with a friend',
    manualCopy: 'Could not copy automatically - copy this link',
    invalidEmail: 'Please enter a valid email address',
    errorTimeout: 'Request timed out - please try again',
    errorRateLimited: 'Too many attempts - please wait a minute and try again.',
    errorInvalidPlatform: 'That platform is not supported yet.',
    errorRetryable: 'Could not save your spot right now - please try again in a moment.',
    copied: 'Copied!',
    errorGeneric: 'Something went wrong. Please try again.',
  },
  templatesPage: {
    title: 'Agent Templates',
    subtitle: 'Browse {count} ready-made agent templates grouped by the kind of work they do. Pick a category to see the templates inside.',
    gridHeading: 'Browse templates by category',
    gridDescription: 'Templates are reference configurations for specific jobs. Each one shows the prompt, tools, and triggers an agent needs. To use one, install the Personas desktop app and set it up there with your own accounts.',
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
    getStartedDescription: 'Download the Personas desktop app to build an agent like this one, or copy the configuration as a starting point.',
    useTemplate: 'Use This Template',
    moreTemplates: 'More {category} Templates',
    installTitle: 'Get Personas to use this template',
    installDescription: 'Templates are set up in the Personas desktop app, not in the browser. Download the app to build an agent like this one, or copy the configuration as a starting point.',
    templateNotFound: 'Template not found',
    templateNotFoundDescription: "This template doesn't exist or has been retired. Browse the gallery for the current collection.",
    browseTemplates: 'Browse templates',
    backToHome: 'Back to home',
    customTrigger: 'Custom trigger',
  },
  connectorModal: {
    simulatedLabel: 'Simulated example · nothing runs',
    connecting: 'Connecting to {label}…',
    working: 'Working on: {task}',
    done: 'Done: {task}',
  },
  roadmapSection: {
    inProgress: 'In Progress',
    next: 'Next',
    planned: 'Planned',
    completed: 'Completed',
    empty: 'Nothing planned right now.',
    emptyHint: 'Check back soon — the next milestones land here as we plan them.',
    heading: 'Product',
    gradient: 'Roadmap',
    description: 'Where each area of Personas stands today — fulfillment left to right, not promises top to bottom.',
    progress: {
      phasesComplete: '{completed} of {total} phases complete',
      noneDone: 'No phases done yet',
      firstDone: 'Phase 1 done',
      rangeDone: 'Phases 1-{count} done',
      toGoOne: '{count} phase to go',
      toGoOther: '{count} phases to go',
    },
    areas: {
      i18n: { title: 'Internationalization', caption: '{count} locales, hand-translated — each flag develops with coverage' },
      devices: { title: 'Device Support', caption: 'Personas on every machine you own' },
      collaboration: { title: 'Collaboration', caption: 'From one operator to the whole org' },
      platform: { title: 'Core Platform', caption: 'Dev mode, connectors, painless installs' },
      templates: { title: 'Template Gallery', caption: 'Starter agents by category — live gallery counts' },
    },
    bars: {
      europe: 'Europe',
      asiaPacific: 'Asia-Pacific',
      southAsia: 'South Asia',
      middleEast: 'Middle East · RTL',
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
      web: 'Web',
      mobileCompanion: 'Mobile companion',
      solo: 'Solo',
      team: 'Team',
      enterprise: 'Enterprise',
      devMode: 'Dev Mode',
      connectors: 'Connectors',
      installersUpdates: 'Installers & updates',
      allCategories: 'All categories',
      devops: 'DevOps',
      productivity: 'Productivity',
      communication: 'Communication',
      marketing: 'Marketing',
      research: 'Research',
      security: 'Security',
      financeCluster: 'Finance · Sales · Support · Legal',
    },
    detail: {
      localeOne: '{n} locale',
      localeOther: '{n} locales',
      shipped: 'shipped',
      inDevelopment: 'in development',
      thisSite: 'this site',
      preview: 'preview',
      sharedAgents: 'shared agents',
      ssoAudit: 'SSO · audit',
      instantPreview: 'instant preview',
      services: '{n} services',
      autoUpdate: 'auto-update',
      templatesTotal: '{n} / {total} templates',
    },
    barAria: '{label}: {pct}%',
  },
  featureVoting: {
    eyebrow: 'Community',
    heading: 'Vote for',
    headingGradient: "what's next",
    subheading: 'Help us prioritize. Pick the features that matter most to you and shape the future of Personas.',
    features: {
      macos: {
        title: 'macOS Support',
        description: 'Full native macOS build with Apple Silicon optimization, Spotlight integration, and menu bar agent controls.',
      },
      dashboard: {
        title: 'Web Dashboard',
        description: 'Browser-based dashboard for real-time agent monitoring, execution history, and fleet management from any device.',
      },
      enterprise: {
        title: 'Enterprise Projects',
        description: 'Multi-tenant workspaces, RBAC, audit logs, SSO integration, and shared agent templates across your organization.',
      },
    },
    voteAria: 'Vote for {feature}',
    commentsToggleAria: 'Show comments for {feature}',
    discussion: 'Discussion',
    noComments: 'No comments yet. Be the first to share your thoughts.',
    replying: 'Replying',
    reply: 'Reply',
    addCommentPlaceholder: 'Add a comment...',
    writeReplyPlaceholder: 'Write a reply...',
    sendCommentAria: 'Send comment',
    summary: {
      totalVotes: '{count} total votes',
      commentOne: '{count} comment',
      commentOther: '{count} comments',
      boostOne: '{count} boost',
      boostOther: '{count} boosts',
      live: 'Live',
    },
    boost: {
      label: 'Boost',
      toggleAria: 'Boost {feature}',
      tierAria: 'Boost with {amount}',
    },
    request: {
      title: 'Something else in mind?',
      subtitle: 'Suggest a feature',
      placeholder: "Describe the feature you'd like to see...",
      submitAria: 'Submit suggestion',
      success: 'Thanks! Your suggestion has been recorded.',
      errorNetwork: 'Network error — please check your connection and try again.',
      errorRateLimit: "You're sending suggestions too quickly. Please wait a moment.",
      errorInvalid: 'Please enter a valid suggestion (1–1000 characters).',
      errorGeneric: 'Something went wrong saving your suggestion. Please try again.',
      sponsor: 'Sponsor this request',
    },
    timeAgo: {
      justNow: 'just now',
      minutes: '{n}m ago',
      hours: '{n}h ago',
      days: '{n}d ago',
    },
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
    searchAllTopics: 'Search all topics',
    searchInCategory: 'Search in this category...',
    topics: 'topics',
    backToGuide: 'Back to Guide',
    showAllResults: 'Show all results',
    noResults: 'No topics found. Try a different search term.',
    stillQuestions: 'Still have questions?',
    joinDiscord: 'Join our Discord',
    copyAnchor: 'Copy link to section',
    guideHub: 'Guide hub',
    categoryNotFound: {
      title: 'Guide category not found',
      description: "That category doesn't exist. See all categories on the guide hub.",
    },
    topicNotFound: {
      title: 'Guide topic not found',
      description: "This topic doesn't exist. Use the guide search or browse the hub to find what you need.",
    },
    categories: {
      "getting-started": 'Getting Started',
      companion: 'Companion (Athena)',
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
      companion: "Meet Athena, your always-on assistant. Chat or talk to her, let her run the app for you, and rely on her to remember what matters.",
      credentials: "Connect to services securely. Understand the encrypted vault and how your data stays safe.",
      "agents-prompts": "Create, configure, and fine-tune your AI agents. Master simple and structured prompt modes.",
      triggers: "Set up when and how your agents run — schedules, webhooks, file watchers, and more.",
      pipelines: "Wire agents together into visual pipelines. Build multi-agent workflows on the team canvas.",
      memories: "Your agents learn and remember. Manage what they know and how they use past experience.",
      monitoring: "Track every execution in real time. See what your agents do, how well they perform, and what they cost.",
      testing: "Run arena tests, A/B comparisons, and let the genome system evolve your best prompts.",
      deployment: "Connect agents to GitHub Actions, GitLab CI, and n8n workflows.",
      troubleshooting: "Fix common issues, understand error messages, and get your agents back on track.",
    },
    translationNotice: {
      staleBody: "This page was updated in English after it was translated.",
      showTranslation: "Read the older translation",
      showCurrent: "Show the current English version",
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
      description: "Every password, API key, and access token is encrypted on your device using bank-grade AES-256 encryption. Your credentials are stored in your operating system's own secure vault.",
      cta: "Secure your connections",
    },
    "multi-provider": {
      headline: "Not locked to one AI",
      description: "Use Claude, OpenAI, Gemini, or run models locally with Ollama. Switch between providers freely and assign different models to different agents. If one provider goes down, your agents automatically switch to another.",
      cta: "Choose your AI",
    },
    genome: {
      headline: "Your agents get smarter automatically",
      description: "Instead of manually tweaking prompts for hours, let the Genome system do it for you. It tests variations, keeps what works, and discards the rest — like natural selection for your AI agents.",
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
    landmarkLabel: 'Page navigation',
    scrollMap: 'Scroll Map',
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
  athenaPage: {
    nav: {
      meet: "MEET ATHENA",
      onboarding: "ONBOARDING",
      fleet: "FROM A SENTENCE",
      workshop: "WHAT SHE RUNS",
      portfolio: "PORTFOLIO",
      memory: "MEMORY",
      oneMind: "ONE MIND"
    },
    hero: {
      eyebrow: 'Your chief of staff',
      headline: 'Meet',
      headlineGradient: 'Athena',
      tagline: 'She says nothing when nothing needs saying.',
      persona: 'A strategist, not a cheerful assistant \u2014 direct, opinionated, warm without performing. \u201CSpeed is not your job. Quality is.\u201D',
      ctaPrimary: 'See her work',
      ctaSecondary: 'Download Personas',
      statWhisper: 'Runs entirely on your machine \u00B7 you decide how far she goes',
      avatarAlt: 'Athena, the Personas companion',
      orbAria: 'Athena \u2014 press Enter and she acknowledges you',
      acknowledgeLine: 'I\'m listening.',
      calloutsAria: 'What Athena does for you',
      callouts: [
        { label: 'Talk to her', fact: 'Hold to speak \u2014 no typing' },
        { label: 'At a glance', fact: 'See what she\'s working on' },
        { label: 'Your desktop', fact: 'Drag her where you work' },
        { label: 'Always ready', fact: 'Cmd/Ctrl+Shift+A, from any app' },
      ],
    },
    onboarding: {
      intro: { eyebrow: 'Set up together', heading: 'Onboarding', gradient: 'partner' },
      chrome: {
        appName: 'Personas',
        search: 'Search\u2026',
        nav: ['Home', 'Agents', 'Templates', 'Connectors', 'Vault', 'Settings'],
        usageLabel: 'runs today',
        usageValue: '18 / 25',
        newAgent: 'New agent',
      },
      canvas: {
        crumbs: ['Workspace', 'Automation'],
        filters: ['All', 'Popular', 'Scheduled', 'New'],
        templatesLabel: 'Templates',
        templatesHint: '12 templates',
        template: {
          title: 'Daily digest',
          meta: 'summarize \u00B7 post \u00B7 9:00',
          pill: 'popular',
          schedule: 'Daily 9:00',
          runs: '142 runs',
          health: '98% ok',
        },
        templateAlt: {
          title: 'Inbox triage',
          meta: 'label \u00B7 draft \u00B7 archive',
          pill: 'new',
          schedule: 'On new mail',
          runs: '86 runs',
          health: '94% ok',
        },
        runsTitle: 'Recent runs',
        runsHint: 'last 24h',
        runsCols: ['agent', 'status', 'took'],
        runsRows: [
          { name: 'Daily digest', state: 'ok', took: '1.2s' },
          { name: 'PR review', state: 'ok', took: '0.8s' },
          { name: 'Notes sync', state: 'running', took: '\u2014' },
        ],
        connectLabel: 'Connect a tool',
        connectCount: '2 of 9 connected',
        connectCountDone: '3 of 9 connected',
        slack: {
          name: 'Slack',
          detail: '#general \u00B7 updates',
          connect: 'connect',
          connecting: 'connecting\u2026',
          connected: 'connected',
        },
        chips: [
          { name: 'GitHub', detail: 'synced 2m ago', state: 'connected' },
          { name: 'Notion', detail: '12 pages', state: 'connected' },
        ],
        triggerLabel: 'Trigger',
        triggerIdle: 'No schedule yet',
        triggerIdleShort: 'Not set',
        triggerValue: 'Every morning \u00B7 9:00',
        triggerValueShort: 'Daily \u00B7 9:00',
        triggerHint: 'edit',
        triggerDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        triggerZone: 'UTC+1',
        triggerOff: 'off',
        triggerOn: 'on',
        activityLabel: 'Monitoring',
        activityPill: 'live',
        stats: [
          { value: '24', label: 'runs' },
          { value: '98%', label: 'success' },
          { value: '1.4s', label: 'avg' },
        ],
        action: 'Create agent',
        actionDone: 'Agent created',
      },
      captions: {
        template: 'pick a starting point',
        connect: 'connect your Slack',
        trigger: 'choose when it runs',
        action: 'one click \u2014 it\'s live',
      },
      status: {
        setup: 'workspace \u00B7 setting up together',
        setupShort: 'setting up',
        step: 'step {n}/{total} \u00B7 built with you',
        stepShort: 'step {n}/{total}',
        live: 'agent live \u00B7 monitoring on',
        liveShort: 'live',
      },
    },
    fleet: {
      intro: { eyebrow: 'Say it in your own words', heading: 'Fleet', gradient: 'orchestration' },
      request: {
        placeholder: 'Ask Athena for anything\u2026',
        voice: 'or just say it',
        sent: 'sent',
        clauses: [
          ['Pull ', 'last week\'s tickets', ','],
          [' find ', 'the complaints that repeat', ','],
          [' check ', 'what we already fixed', ','],
          [' count ', 'how many it hit', ','],
          [' and ', 'tell the team what matters', '.'],
        ],
      },
      plan: {
        hint: 'Change anything before it starts',
        hintShort: 'Change anything first',
        edited: 'Changed',
        start: 'Start',
        working: 'Working',
        done: 'Done',
      },
      task: { working: 'working', finished: 'done' },
      tasks: [
        {
          title: 'Collect the tickets',
          scope: 'last 7 days',
          scopeEdited: 'last 14 days',
          found: '1,284 tickets',
        },
        { title: 'Group the repeat complaints', scope: 'all channels', found: '9 clusters' },
        { title: 'Check what we already shipped', scope: 'since May', found: '4 already fixed' },
        { title: 'Count the people affected', scope: 'by account', found: '612 accounts' },
      ],
      result: {
        title: 'What matters this week',
        rows: [
          { label: 'Checkout errors', meta: '214 people' },
          { label: 'Slow search', meta: '96 people' },
          { label: 'Login loop', meta: 'fixed Tuesday' },
        ],
        footer: 'sent to the team',
      },
      status: {
        speak: 'speak it or type it \u2014 same either way',
        speakShort: 'type it or say it',
        planning: 'Athena works out what it takes',
        pieces: 'one sentence, four pieces of work',
        piecesShort: 'four pieces of work',
        yourCall: 'nothing runs until you say so',
        yourCallShort: 'your call to start',
        parallel: 'all four at the same time',
        parallelShort: 'all four at once',
        returning: 'coming back as one answer',
        returningShort: 'coming back as one',
        closing: 'one sentence in \u00B7 one answer back',
        closingShort: 'one answer back',
      },
    },
    workshop: {
      intro: { eyebrow: 'However much you hand her', heading: 'The lines you drew', gradient: 'hold' },
      beds: [
        { name: 'Checkout app', short: 'Checkout' },
        { name: 'Marketing site', short: 'Website' },
        { name: 'Billing service', short: 'Billing' },
      ],
      jobTitles: [
        'run the tests',
        'check the links',
        'clean up the warnings',
        'fix the flaky test',
        'refresh the changelog',
        'tidy the old branches',
      ],
      fence: { plate: 'the places you opened', plateShort: 'places you opened' },
      dial: {
        label: 'how much she does on her own',
        labelShort: 'how much on her own',
        stops: ['check with me first', 'the small stuff', 'go ahead'],
        stopsShort: ['ask me first', 'small stuff', 'go ahead'],
      },
      job: { working: 'working', done: 'done' },
      outside: { name: 'Old client work', waits: 'waits for you' },
      status: {
        line: 'the line comes first',
        lineShort: 'the line comes first',
        draw: 'you draw it once',
        drawShort: 'you draw it once',
        places: 'these are the places you opened',
        placesShort: 'the places you opened',
        inside: 'she works inside it \u2014 all of it',
        insideShort: 'she works inside',
        turnUp: 'turn it up \u2014 more at once, fewer questions',
        turnUpShort: 'turn it up \u2014 more at once',
        unmoved: 'the line doesn\'t move with it',
        unmovedShort: 'the line doesn\'t move',
        stops: 'she stops where you stopped her',
        stopsShort: 'she stops at the line',
        waits: 'and waits \u2014 that one is yours',
        waitsShort: 'that one is yours',
        free: 'as free as you like, inside your lines',
        freeShort: 'free, inside your lines',
      },
    },
    portfolio: {
      intro: { eyebrow: 'While you are busy elsewhere', heading: 'Nothing quietly', gradient: 'rots' },
      projects: [
        'Marketing site',
        'Docs',
        'Mobile app',
        'Design system',
        'Support inbox',
        'Data pipeline',
        'Admin tools',
        'Payments API',
        'Search service',
        'Onboarding flow',
        'Notifications',
        'Internal wiki',
      ],
      field: { handled: 'handled' },
      panel: {
        badge: 'worst first',
        rows: [
          { name: 'Dependencies', since: 'quiet 11 days' },
          { name: 'Nightly build', since: 'red since Friday' },
        ],
        rest: '5 other checks fine',
        finding: 'Payment library is 3 versions behind, one with a known hole.',
        findingShort: '3 versions behind, one with a hole.',
        action: 'Open what fixes it',
        actionShort: 'Open the fix',
        done: 'Opened',
      },
      caption: {
        survey: 'Checking every project',
        surfaced: 'Three need you',
        worst: 'This one first',
        found: 'Quiet for 11 days',
        opened: 'Opened for you',
      },
      status: {
        view: 'every project you own, in view',
        viewShort: 'all of them, in view',
        checking: 'checking all of them at once',
        checkingShort: 'checking all of them',
        needing: '3 need you \u00B7 worst first',
        needingShort: '3 need you',
        travel: 'going straight to the worst one',
        travelShort: 'worst one first',
        quiet: 'payments api \u00B7 quiet for 11 days',
        quietShort: 'quiet for 11 days',
        opened: 'opened the thing that fixes it',
        openedShort: 'opened for you',
        back: 'back out to the whole picture',
        backShort: 'back out',
        settled: '1 handled \u00B7 2 still waiting',
        settledShort: '1 handled \u00B7 2 waiting',
      },
    },
    memory: {
      intro: { eyebrow: 'The longer you work together', heading: 'The more she', gradient: 'carries' },
      talk: 'each day\'s talk',
      rail: 'enough to sleep on',
      night: 'she sleeps on it',
      shelf: 'what she keeps',
      kept: [
        'You ship on Thursdays.',
        'Staging is where you try things.',
        'Billing is the one you worry about.',
        'You like the short version first.',
      ],
      status: {
        day: 'one ordinary day of working together',
        dayShort: 'one ordinary day',
        building: 'everything you two get through, building up',
        buildingShort: 'the day\'s talk, building up',
        sleeps: 'enough has built up \u2014 she sleeps on it',
        sleepsShort: 'she sleeps on it',
        wakes: 'she wakes with a little more than she had',
        wakesShort: 'a little more than before',
        keeping: 'another night, another thing worth keeping',
        keepingShort: 'another thing worth keeping',
        quiet: 'a quiet day \u2014 barely anything said',
        quietShort: 'a quiet day',
        notEnough: 'not enough to sleep on, so she doesn\'t',
        notEnoughShort: 'not enough to sleep on',
        nothingLost: 'nothing is lost \u2014 that day is still there',
        nothingLostShort: 'still there, nothing lost',
        inUse: 'and the first thing she kept is in use today',
        inUseShort: 'day one\'s, in use today',
        sleepsAgain: 'she sleeps on this one too',
        sleepsAgainShort: 'she sleeps on this one too',
        cost: 'it costs her less than one ordinary reply',
        costShort: 'less than one reply',
        oneMore: 'one more night, one more thing she carries',
        oneMoreShort: 'one more thing she carries',
        carries: 'the longer you work together, the more she carries',
        carriesShort: 'the more she carries',
      },
    },
    oneMind: {
      intro: { eyebrow: 'However many conversations', heading: 'Always the', gradient: 'same person' },
      conversations: [
        { name: 'The rewrite', short: 'The rewrite' },
        { name: 'Monday review', short: 'Monday' },
        { name: 'Getting set up', short: 'Setup' },
        { name: 'The outage', short: 'Outage' },
        { name: 'The pricing page', short: 'Pricing' },
        { name: 'Invoices', short: 'Invoices' },
      ],
      open: {
        label: 'this conversation',
        question: 'What else are we working on?',
        from: 'from',
        footer: 'Nothing else needs you today.',
        footerShort: 'Nothing else needs you.',
      },
      rows: [
        { claim: 'The last check passed about an hour ago', short: 'Last check passed' },
        {
          claim: 'Two projects are waiting on you, neither urgent',
          short: '2 waiting, none urgent',
        },
        { claim: 'Your calendar still isn\'t connected', short: 'Calendar not connected' },
      ],
      status: {
        live: 'every conversation you have going',
        liveShort: 'all your conversations',
        open: 'all of them open at the same time',
        openShort: 'all open at once',
        asked: 'you asked in one of them',
        askedShort: 'you asked here',
        answers: 'she answers from everything she knows',
        answersShort: 'she answers from all of it',
        sources: 'every line, and where it came from',
        sourcesShort: 'every line, and its source',
        oneVoice: 'one voice \u2014 you never hear two at once',
        oneVoiceShort: 'one voice, never two',
        samePerson: 'the same person, in all of them',
        samePersonShort: 'the same person, in all of them',
      },
    },
  },
  orchestrationHub: {
    previousTrigger: 'Previous trigger',
    nextTrigger: 'Next trigger',
  },
  labVersions: {
    title: 'Versions & ratings',
    hint: 'Activate a version to put it live. To roll back, activate the previous one.',
    live: 'Live',
    experimental: 'Experimental',
    rating: 'Rating',
    deltaVsBaseline: 'Δ vs baseline',
    baseline: 'Baseline',
    activate: 'Activate',
    activateVersion: 'Activate {version}',
    pinBaseline: 'Pin as baseline',
    regression: 'Regression',
    nowLive: '{version} is live',
  },
  pluginShowcase: {
    heading: 'Everything to',
    headingGradient: 'plug in',
    introAll: 'Personas ships with {shipped} plugins, and every one is at work below.',
    introSome: 'Personas ships with {shipped} plugins, and {showcased} of them are at work below.',
    introTail: 'Switch tabs to meet each one.',
    tabsLabel: 'Showcased plugins',
    counter: 'plugin {current} of {total}',
    taglines: {
      devTools: 'Parallel agent fleet, projects, triage',
      brain: 'Your vault, agent-ready',
    },
  },
  // BEGIN pending-translation namespaces (English only; listed in PENDING_TRANSLATION)
  teamCanvasSection: {
    heading: 'From goal to',
    headingGradient: 'shipped',
    lede: 'Triggers wake a single agent — the team canvas wires many. A goal fans out to personas that move real KPIs toward target along the line, then converges into a reviewed, shippable release.',
    goalLabel: 'Goal',
    goal: 'Ship the v0.5 release',
    shipped: 'Shipped',
    compositeHealth: 'composite health',
    base: 'base',
    target: 'target',
    stations: {
      plan: { label: 'Plan', sub: 'scope + estimate' },
      build: { label: 'Build', sub: 'implement' },
      test: { label: 'Test', sub: 'verify' },
      review: { label: 'Review', sub: 'approve' },
    },
    kpis: {
      leadTime: 'Lead time',
      coverage: 'Test coverage',
      errorRate: 'Error rate',
      review: 'Review pass rate',
      cost: 'Cost / run',
      adoption: 'Weekly users',
    },
    status: { met: 'Target met', ok: 'On track', warn: 'At risk', crit: 'Off track' },
  },
  pricingSection: {
    heading: 'Personas is',
    headingGradient: 'free',
    lede: "The app, its MIT source and every feature cost nothing, with no account or licence key. Your agents run through Claude Code on your own Claude Pro or Max plan, so the only bill is Anthropic's.",
    artLabel: 'An agent run leaves Personas on your computer, passes the Claude Code CLI and reaches Claude at Anthropic. Personas is tagged $0 with an MIT licence; the only payment line runs from your Claude Pro or Max plan to Anthropic.',
    replay: 'Replay the illustration',
    computer: 'Your computer',
    tag: '$0, MIT licence',
    personas: 'Personas',
    cli: 'Claude Code CLI',
    anthropic: 'Anthropic',
    claude: 'Claude',
    plan: 'Your Claude Pro or Max plan',
    beats: ['Run starts', 'On your plan', 'Claude works', 'No bill from Personas'],
  },
  useCasesPersona: {
    groupLabel: 'One persona, {persona}, shown as its card. Connecting each of {tools} tools adds that tool\'s jobs, {jobs} in all, while the persona\'s name, icon and colour stay the same.',
    identityNote: 'Same name, same icon, same colour through every tool. Connecting a tool only adds jobs to this one persona.',
    personaName: 'Chief of staff',
    personaDescription: 'Keeps your inbox, channels, repos and calendar moving.',
    active: 'Active',
    jobOne: '{count} job',
    jobMany: '{count} jobs',
    noConnectors: 'No connectors yet',
    connectorCount: '{attached} of {total} connectors',
    connectedTools: 'Connected tools',
    sampleTriggers: '3 triggers',
    sampleLastRun: '2 min ago',
    adds: '{tool} adds {count} jobs to {persona}',
    emptyJobs: 'No tools connected yet. Each tool you connect adds its jobs to this same persona.',
    ledgerLabel: 'Jobs {persona} can do',
    notConnected: 'not connected',
    tabsLabel: 'Connect a tool to the persona',
    connected: 'connected',
    pause: 'Pause',
    replay: 'Replay',
    play: 'Play',
  },
  playgroundSection: {
    heading: 'The Agent',
    headingGradient: 'Mind',
    description: 'Watch the agent\'s thought process unfold in real time. Pick a prompt and see how it parses, plans, and executes.',
    reset: 'Reset',
    splitView: 'Split View',
    executing: 'Executing...',
    executionComplete: 'execution complete',
    srRunning: 'Running simulation',
    srDone: 'Execution complete \u2014 results available',
    progressLabel: 'Simulation progress',
    editorStatus: {
      running: 'parsing',
      done: 'parsed',
      idle: 'ready',
    },
    mindStatus: {
      running: 'thinking',
      done: 'complete',
      idle: 'idle',
    },
    instructionComment: '// Agent instruction',
    intentComment: '// Detected intent:',
    selectPrompt: 'Select a prompt to begin...',
    selectedTools: 'Selected Tools',
    result: 'Result',
    mindIdleTitle: 'Agent mind visualization',
    mindIdleHint: 'Select a prompt to see the flowchart',
    nodes: {
      parse: 'Parse Intent',
      select: 'Select Tools',
      execute: 'Execute',
      verify: 'Verify',
      result: 'Result',
    },
    dimensions: {
      messages: 'Message',
      humanReview: 'Human review',
      events: 'Event emitted',
      memories: 'Memory learned',
    },
    tools: {
      gmailApi: 'Gmail API',
      nlpClassifier: 'NLP Classifier',
      githubApi: 'GitHub API',
      astAnalyzer: 'AST Analyzer',
      testScanner: 'Test Scanner',
      slackApi: 'Slack API',
      summarizer: 'Summarizer',
      calendarApi: 'Calendar API',
      scheduleAnalyzer: 'Schedule Analyzer',
    },
    examples: {
      gmail: {
        label: 'Triage my Gmail',
        prompt: 'Triage my Gmail inbox and draft replies for urgent emails',
        messages: 'Draft reply to sarah@acme.com \u2014 \u201cThanks for the update, I\u2019ll review by Friday.\u201d',
        humanReview: 'Approve billing dispute reply before sending to legal@acme.com',
        memories: 'legal@acme.com \u2192 always priority sender',
      },
      pr: {
        label: 'Review this PR',
        prompt: 'Review PR #142 for bugs, style issues, and missing tests',
        messages: 'Inline comment on auth.ts:42 \u2014 \u201cMissing null check on user.session\u201d',
        humanReview: 'Approve suggested refactor of loginFlow() before merge',
        memories: 'Team prefers early-return over nested if-else',
      },
      slack: {
        label: 'Summarize Slack',
        prompt: 'Summarize #engineering and #product channels from the last 24h',
        messages: 'Digest posted to #my-digest \u2014 \u201c3 decisions, 2 blockers, 1 release\u201d',
        humanReview: 'Confirm which blocker to escalate to @oncall',
        memories: '\u201cRelease cut\u201d is a recurring topic on Thursdays',
      },
      schedule: {
        label: 'Optimize my schedule',
        prompt: 'Analyze next week\'s calendar and block focus time',
        messages: 'Added Tue 10\u201312 as \u201cDeep work \u2014 do not schedule\u201d',
        humanReview: 'Approve moving 1:1 with Maya from Fri 2pm \u2192 Fri 4pm',
        memories: 'You prefer mornings for deep work, afternoons for calls',
      },
    },
  },
  orchestrationSection: {
    heading: 'Orchestration',
    headingGradient: 'hub',
    description: 'Ten trigger types, one persona hub. Any signal can wake any agent \u2014 or launch one yourself. Pick a trigger to see it fire.',
    ringLabel: 'Trigger types',
    trigger: 'Trigger',
    firesWhen: 'Fires when',
    triggers: {
      schedule: {
        label: 'Schedule',
        description: 'Runs on a time-based schedule \u2014 a cron expression, a fixed interval, or a specific calendar time.',
        example: 'Every morning at 08:00',
        persona: 'Morning Brief',
      },
      polling: {
        label: 'Polling',
        description: 'Checks an external source on a fixed interval and fires when it detects a new or changed item.',
        example: 'Every 5 min on Jira',
        persona: 'Blocker Watcher',
      },
      webhook: {
        label: 'Webhook',
        description: 'Exposes a public URL; fires the moment an external service sends it a payload.',
        persona: 'PR Reviewer',
      },
      file_watcher: {
        label: 'File watcher',
        description: 'Watches a folder path and fires whenever files are created, modified, or removed.',
        persona: 'Doc Parser',
      },
      clipboard: {
        label: 'Clipboard',
        description: 'Fires when the OS clipboard receives content matching a pattern \u2014 URLs, tokens, or snippets.',
        example: 'On copy of URL',
        persona: 'Link Archiver',
      },
      app_focus: {
        label: 'App focus',
        description: 'Fires when you switch to a specific application window, so agents adapt to your current task.',
        example: 'Switch to Figma',
        persona: 'Design Notes',
      },
      event_listener: {
        label: 'Event',
        description: 'Fires when another persona emits a named event on the internal event bus.',
        persona: 'Delivery Agent',
      },
      chain: {
        label: 'Chain',
        description: 'Fires when an upstream persona finishes \u2014 one agent\'s output becomes the next agent\'s input.',
        example: 'After Researcher runs',
        persona: 'Report Writer',
      },
      composite: {
        label: 'Composite',
        description: 'Fires only when multiple underlying triggers satisfy a boolean condition together.',
        example: 'Schedule AND webhook',
        persona: 'Gate Agent',
      },
      manual: {
        label: 'Manual',
        description: 'Run an agent on demand \u2014 straight from the dashboard, the CLI, or a hotkey. No automation required.',
        example: 'Click Run',
        persona: 'Ad-hoc Task',
      },
    },
    docs: {
      scheduleGuide: 'Schedule triggers guide',
      howTriggersWork: 'How triggers work',
      webhookGuide: 'Webhook triggers guide',
      fileWatcherGuide: 'File watcher guide',
      clipboardMonitor: 'Clipboard monitor',
      eventBased: 'Event-based triggers',
      chainGuide: 'Chain triggers guide',
      combining: 'Combining multiple triggers',
    },
  },
  companionSection: {
    heading: 'Meet',
    headingGradient: 'Athena',
    headingTrailing: ', always on',
    description: 'A persistent orb that lives on your desktop \u2014 hold it to talk, it remembers how you work, and it reaches out before you have to ask.',
    avatarAlt: 'Athena, the Personas companion',
    capabilities: {
      always: {
        label: 'Always on, never in the way',
        blurb: 'A floating orb lives on your desktop \u2014 her animated face is the interface. Drag it anywhere; it survives restarts and quietly pauses when you look away.',
        line: 'I\'m right here whenever you need me.',
      },
      voice: {
        label: 'Hold to talk',
        blurb: 'Press and hold the orb to speak \u2014 voice in, voice out. Runs on-device with local Whisper, or in your browser. No chat window required.',
        line: 'Hold to talk \u2014 I\'m listening.',
      },
      memory: {
        label: 'Remembers what matters',
        blurb: 'Athena keeps a long-term memory of your identity, goals, and how you work \u2014 and you\'re the editor. She never overwrites; every change is yours to approve.',
        line: 'I remember your goals and how you work.',
      },
      proactive: {
        label: 'Reaches out first',
        blurb: 'She surfaces what needs you \u2014 a goal due soon, an aging backlog, runs that failed overnight \u2014 and can even schedule her own check-ins.',
        line: 'Heads up \u2014 3 runs failed overnight.',
      },
    },
  },
  visionStack: {
    heading: 'The',
    headingGradient: 'platform',
    headingTrailing: ' behind your agents',
    description: 'Every agent you run stands on the same six layers. Pick one to see what it is doing for this one.',
    groupLabel: 'An "{persona}" agent card with the six layers beneath it, top to bottom: {names}. Select a layer to see what it does for this agent.',
    tabsLabel: 'Platform layers',
    layerOf: 'Layer {current} of {total}',
    inThisAgent: 'In this agent',
    backToTop: 'Back to the top',
    nextLayerDown: 'Next layer down',
    persona: {
      name: 'Inbox triage',
      active: 'Active',
      fromOrigin: 'from {origin}',
      origin: 'Inbox Triage template',
      trigger: 'Weekdays 08:00',
      lastRun: '2 min ago',
      credentialsLocal: 'Credentials stored locally',
    },
    layers: {
      orchestration: {
        title: 'Orchestration',
        description: 'Eight trigger types wake personas in parallel \u2014 schedule, webhook, file watcher, clipboard, event, and more.',
        details: [
          'Schedule, polling, webhook, event, composite',
          'File watcher and clipboard triggers',
          'App-focus trigger for contextual agents',
        ],
        guide: 'How triggers work',
        question: 'When does it run?',
        job: 'Wakes it on a schedule, webhook, file or event',
        inAgent: 'Schedule trigger: weekdays at 08:00',
      },
      byom: {
        title: 'BYOM',
        description: 'Bring your own model. Run personas against Claude or local Ollama \u2014 your machine, your choice.',
        details: [
          'Claude (via the official CLI)',
          'Ollama for fully local inference',
          'Automatic failover between providers',
        ],
        guide: 'Creating a new agent',
        question: 'What does it think with?',
        job: 'Runs it on Claude or on local Ollama',
        inAgent: 'Claude, through the official CLI',
      },
      templates: {
        title: 'Templates',
        description: 'Dozens of ready-made personas to start from, such as a PR reviewer or a morning brief. A guided wizard fits each one to your tools.',
        details: [
          'Guided adoption: answer a few questions, connect your credentials',
          'Remix templates into your own library',
        ],
        guide: 'Browse template library',
        question: 'Where did it start?',
        job: 'Starts it from a ready-made persona',
        inAgent: 'Adopted from the Inbox Triage template',
      },
      monitoring: {
        title: 'Monitoring',
        description: 'Self-healing execution, human review queues, and persistent agent memory \u2014 watch every run in real time.',
        details: [
          'Self-healing engine with automatic recovery',
          'Human-in-the-loop review queues',
          'Per-agent long-term memory',
        ],
        guide: 'Self-healing explained',
        question: 'Is it working?',
        job: 'Traces every run and recovers failures',
        inAgent: 'Last run 2 min ago, finished healthy',
      },
      lab: {
        title: 'Lab',
        description: 'Experiment with prompt variants, run A/B arenas, and let breeding cycles evolve higher-performing personas.',
        details: [
          'Arena for side-by-side prompt comparisons',
          'Fitness scoring across test suites',
          'Overnight breeding cycles',
        ],
        guide: 'Running a breeding cycle',
        question: 'How does it get better?',
        job: 'Tests prompt variants before you keep one',
        inAgent: 'Prompt v3, kept after an arena comparison',
      },
      'credential-vault': {
        title: 'Vault',
        description: 'AES-256-GCM encryption with OS-native keyring integration. Your secrets never leave your device.',
        details: [
          'OS keyring on Windows, macOS, Linux',
          'AI-assisted OAuth token refresh',
          'Zero-knowledge local-first architecture',
        ],
        guide: 'How Personas keeps your data safe',
        question: 'What can it touch?',
        job: 'Its keys, encrypted on this device',
        inAgent: 'Gmail, Slack and Calendar keys, stored locally',
      },
    },
  },
  designMatrix: {
    heading: 'One sentence. One',
    headingGradient: 'matrix',
    headingTrailing: '.',
    lede: 'Describe what you want.',
    ledeStrong: 'Personas fills the matrix cell by cell and asks only when it needs you.',
    title: 'Persona Matrix',
    subtitle: 'intent at center \u00b7 8 dimensions radiate outward',
    status: {
      running: 'building',
      done: 'ready to deploy',
      idle: 'idle',
    },
    replay: 'replay',
    cellsResolved: 'cells resolved',
    footerStatus: {
      done: 'deploy-ready',
      pending: 'radiate from center',
    },
    intent: 'Intent',
    intentPlaceholder: 'Describe what your agent should do\u2026',
    resolved: '{filled}/{total} resolved',
    analyzing: 'analyzing intent\u2026',
    userPrompt: 'Triage my Gmail inbox and draft replies for urgent emails.',
    cells: {
      tasks: {
        label: 'Tasks',
        value: 'Triage inbox + draft replies for urgent',
      },
      apps: {
        label: 'Apps & Services',
        value: 'Gmail - Slack',
      },
      triggers: {
        label: 'When It Runs',
        value: 'Every 15 minutes',
      },
      review: {
        label: 'Human Review',
        value: 'Approve drafts before sending',
      },
      messages: {
        label: 'Messages',
        value: 'Post digest to #triage-inbox',
      },
      memory: {
        label: 'Memory',
        value: 'Learns sender priorities over time',
      },
      errors: {
        label: 'Errors',
        value: 'Retry 3x then alert on Slack',
      },
      events: {
        label: 'Events',
        value: 'Emits email.processed',
      },
    },
    questions: {
      triggers: {
        prompt: 'How often should I check?',
        options: [
          'Every 15 min',
          'Every hour',
          'Real-time webhook',
        ],
      },
      review: {
        prompt: 'Send automatically or wait for approval?',
        options: [
          'Auto-send',
          'Approve first',
          'Ask only for urgent',
        ],
      },
    },
  },
  memorySection: {
    heading: 'Remembers what',
    headingGradient: 'works',
    lede: 'Your agents get better the more they work.',
    artLabel: 'Run 1 wanders, fails twice and loops back; each failure is kept as a memory, and run 12 goes straight to the goal.',
    run1: 'Run 1',
    run12: 'Run 12',
    memory: 'Memory',
    replay: 'Replay the animation',
  },
  securitySection: {
    heading: 'Your keys stay',
    headingGradient: 'yours',
    lede: 'Every credential is encrypted on your device and kept in your OS\'s own vault.',
    artLabel: 'Three nested rings, your device, the OS keychain and AES-256-GCM encryption, turn and lock one by one around your keys at the centre.',
    replay: 'Replay the animation',
    yourKeys: 'Your keys',
    rings: {
      keychain: 'OS keychain',
      device: 'Device',
    },
  },
  aiModelsSection: {
    heading: 'Powered by {claude}. Private via {ollama}.',
    lede: 'Two engines, one consistent agent runtime.',
    artLabel: 'Tasks of different weight pass through one router: light, default and heavy ones go to Claude Haiku, Sonnet and Opus, while a locked private task stays on your machine with Ollama.',
    replay: 'Replay animation',
    local: 'Local',
  },
  observeSection: {
    heading: 'See everything,',
    headingGradient: 'miss nothing',
    description: 'Every run, message and event \u2014 live, in one dashboard.',
    modules: {
      executions: {
        title: 'Executions',
        blurb: 'Every run, timed and traced',
      },
      messages: {
        title: 'Messages',
        blurb: 'Full I/O transcripts per step',
      },
      events: {
        title: 'Events',
        blurb: 'Bus stream + replay + retries',
      },
      memories: {
        title: 'Memories',
        blurb: 'What agents learned, searchable',
      },
      activity: {
        title: 'Activity',
        blurb: 'Live lanes across all personas',
      },
      health: {
        title: 'Health',
        blurb: 'Status, healing, dead-letters',
      },
      analytics: {
        title: 'Analytics',
        blurb: 'Success rate, duration, cost',
      },
      knowledge: {
        title: 'Knowledge',
        blurb: 'Cross-persona semantic search',
      },
    },
    agents: {
      prReviewer: 'PR Reviewer',
      emailTriage: 'Email Triage',
      slackDigest: 'Slack Digest',
      deployMonitor: 'Deploy Monitor',
      docIndexer: 'Doc Indexer',
      meetingNotes: 'Meeting Notes',
    },
    status: {
      snapshot: 'snapshot',
      streaming: 'streaming',
      autoRefreshing: 'auto-refreshing',
    },
    chromeInfo: 'pulse grid',
    metrics: {
      successRate: 'Success rate',
      avgDuration: 'Avg duration',
      avgCost: 'Avg cost',
      activeAgents: 'Active agents',
    },
    showAll: 'Show all',
    footer: 'Per-agent activity pulse',
    idle: 'idle',
    durationTrend: 'Duration trend',
    eventShort: {
      'execution.completed': 'done',
      'execution.started': 'run',
      'message.sent': 'msg',
      'event.emitted': 'evt',
      'memory.stored': 'mem',
      'review.requested': 'rev',
      'knowledge.indexed': 'kb',
      'health.checked': 'ok',
    },
  },
  pluginsExtra: {
    variantBlurbs: {
      athenaFleet: 'A grid of CLIs under Athena\'s watch \u2014 her orb glides to whatever blocks them and answers on-policy',
      brain: 'Knowledge graph view \u2014 your notes, connected and alive',
    },
    fleet: {
      title: 'Agent fleet',
      subtitle: '16 CLIs \u00b7 Athena on watch',
      blocked: 'Blocked',
      working: 'Working',
      done: 'Done',
      autonomous: 'autonomous',
      statusSpawning: 'spawning {spawned}/16\u2026',
      statusBlocked: '{needs} blocked \u2014 Athena dispatching',
      statusWorking: 'fleet working',
      statusTriaging: 'Athena triaging \u00b7 {resolved}/4 resolved',
      statusAllGreen: '16/16 green \u00b7 0 human interruptions',
      statusWrapping: 'wrapping up \u00b7 {done}/16 green',
      cell: {
        spawning: 'spawning\u2026',
        needsAnswer: 'needs an answer',
        stale: 'quiet for 4m',
        resolving: 'Athena responding\u2026',
        done: '\u2713 done',
        working: 'working\u2026',
      },
      asks: {
        flakyTests: 'Quarantine 3 flaky tests?',
        focusRing: 'Apply the focus-ring fix?',
        lcpBudget: 'Raise the LCP budget?',
      },
      captions: {
        quarantine: '\u2713 approved \u2014 quarantine 3',
        focusRing: '\u2713 approved \u2014 focus-ring fix',
        release: '\u26a1 nudged \u2014 release resumed',
        budget: '\u2713 answered \u2014 keep 2.5s budget',
      },
    },
    brain: {
      title: 'Second brain',
      recall: 'Recall a thought...',
      capture: 'Capture',
      vault: 'Vault:',
      notes: 'notes',
      links: 'links',
      recallRate: 'recall',
      connections: 'Connections',
      recentThoughts: 'Recent thoughts',
      backlinkNotes: {
        leonardo: 'tile illustrations',
        matrix: '3x3 layout - shipped',
        agents: 'orchestrator notes',
        roadmap: 'next milestone - queued',
      },
      captures: {
        wire: 'Wire dev-tools tab to runner',
        masks: 'Try gradient masks for tile borders',
        graph: 'Backlink graph would be a great demo',
      },
    },
  },
  getStartedSection: {
    heading: 'From download to',
    headingGradient: 'running agents',
    lede: 'Set it up once, with Claude Code signed in: Personas runs your agents through it, on your own Claude plan. Then the agent runs by itself and keeps improving: the Overseer companion reviews its runs, the Lab measures each fix, and you approve it.',
    artLabel: 'A week in three lanes. On Monday you install Personas with Claude Code signed in, connect Gmail and Slack, describe the agent, then test and promote it, and it runs once. From Tuesday it runs daily at 08:00, and the Tuesday run heals itself with a retry. The Overseer companion reads the runs, rated 3 of 5, and writes a coaching note; the Lab measures the fix in its Arena; you approve it; and the Friday run is rated 4 of 5.',
    replay: 'Replay the animation',
    lanes: { you: 'You', improve: 'Self-improvement', agent: 'Your agent' },
    trigger: 'Daily 08:00',
    days: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' },
    steps: {
      install: 'Install Personas',
      connect: 'Connect Gmail, Slack',
      describe: 'Describe the agent',
      promote: 'Test & promote',
    },
    claudeCode: 'Claude Code signed in',
    firstRun: 'First run',
    healed: { top: 'healed', bottom: 'via retry' },
    overseer: 'Overseer',
    coachingNote: 'Coaching note',
    lab: 'Lab',
    arena: 'Arena',
    approve: 'Approve',
    scoreBefore: '3/5',
    scoreAfter: '4/5',
  },
  labSection: {
    heading: 'The',
    headingGradient: 'Lab',
    lede: 'Four ways to make your personas better — chat with them, fight them against each other, evolve them across generations, or score them on the dimensions that matter. Every improvement you keep is versioned and reversible.',
    tabs: {
      chat: { label: 'Chat', blurb: 'Refine your persona by talking to it' },
      arena: { label: 'Arena', blurb: 'Two prompts enter, one wins' },
      evolution: { label: 'Evolution', blurb: 'Breed better prompts across generations' },
      eval: { label: 'Eval', blurb: 'Score personas across 6 dimensions' },
    },
    chat: {
      title: 'Refinement chat',
      applying: 'applying changes',
      synced: 'synced',
      appliedDiff: 'applied diff',
      placeholder: 'Tell the agent what to change…',
      replay: 'replay',
      messages: {
        tooManyUrgent: 'The triage agent is labeling too many emails as urgent. Dial it back.',
        tighten: "Got it. Looking at your last 200 runs — 31% were flagged urgent. Industry benchmark for this pattern is 8–12%. I'll tighten the urgency criteria.",
        newsletters: "Also stop flagging newsletters even if they say 'urgent' in the subject.",
        preFilter: 'Added a newsletter pre-filter. Anything with List-Unsubscribe headers or sender in marketing-domains list is now excluded from urgency scoring.',
        replayResult: 'Replaying the last 48h against the new config… 9.2% flagged urgent. Want me to promote this?',
      },
    },
    arena: {
      title: 'Prompt arena',
      round: 'Round',
      input: 'Input',
      version: 'Version {version}',
      win: 'win',
      lose: 'lose',
      winsAria: 'Version {version} wins this round',
      losesAria: 'Version {version} loses this round',
      fitnessScore: 'fitness score',
      fighting: 'fighting…',
      roundComplete: 'round complete',
      inputs: {
        prodBug: 'Urgent bug in prod — draft status update',
        declineMeeting: 'Politely decline a meeting',
        slackSummary: 'Summarize 40 unread Slack msgs',
        explainPr: 'Explain the PR in plain English',
        flakyTest: 'Reply to a flaky test notification',
      },
    },
    evolution: {
      title: 'Genome tree',
      gen: 'Gen',
      best: 'Best',
      lineage: 'Lineage',
      genAxis: 'G{gen}',
      bestLineage: 'best lineage',
      alive: 'alive',
      culled: 'culled',
      breed: 'breed next gen',
    },
    eval: {
      title: 'Eval radar',
      avg: 'Avg',
      deltaVsBaseline: 'Δ vs baseline',
      current: 'current',
      baseline: 'baseline',
      footer: '{dimensions} dimensions · {runs} sample runs',
      dimensions: {
        accuracy: 'Accuracy',
        clarity: 'Clarity',
        tone: 'Tone',
        latency: 'Latency',
        cost: 'Cost',
        safety: 'Safety',
      },
    },
  },
  personasMonitor: {
    title: 'Personas',
    lede: 'Every persona you run on one screen: who needs you, what is moving, where to go next.',
    demoBadge: 'Demo fleet',
    artBadge: 'Stylised illustration',
    viewsLabel: 'View',
    views: {
      board: 'Board',
      city: 'Night shift',
    },
    viewHints: {
      board: 'Every agent on one board, grouped by team',
      city: 'Showcase: the fleet as a city at night, one building per team',
    },
    scaleLabel: 'Agents',
    loading: 'Loading your personas',
    rail: {
      title: 'Needs you',
      empty: 'Nobody is waiting on you.',
      listLabel: 'Agents that need you, most urgent first',
    },
    attention: {
      needs: 'need you',
      working: 'working',
      resting: 'resting',
      off: 'off',
    },
    board: {
      label: 'Board: agents grouped by team',
      states: {
        running: 'Running',
        failed: 'Failed',
        input_required: 'Waiting for input',
        draft_ready: 'Draft ready',
        queued: 'Queued',
        attention: 'Review pending',
        idle: 'Resting',
        off: 'Off (disabled)',
      },
      shortStates: {
        running: 'Running',
        failed: 'Failed',
        input_required: 'Needs input',
        draft_ready: 'Draft ready',
        queued: 'Queued',
        attention: 'Review',
        idle: 'Resting',
        off: 'Off',
      },
      reasons: {
        failed: 'Run failed',
        input_required: 'Needs your answer',
        critical: 'Critical review',
        draft_ready: 'Draft ready',
        warning: 'Review',
        info: 'Review',
      },
      severity: {
        critical: 'Critical',
        warning: 'Warning',
        info: 'Info',
      },
      health: {
        healthy: 'Healthy',
        degraded: 'Degraded',
        critical: 'Critical',
      },
      tasks: {
        toolTimeout: 'Last run failed: tool timeout',
        revising: 'Revising the draft',
        resuming: 'Resuming with your answer',
        retrying: 'Retrying the last run',
        nextBatch: 'Working the next batch',
        resting: 'Resting between runs',
        draftFallback: 'Draft ready for review',
      },
      kinds: {
        run_completed: 'Run completed',
        run_failed: 'Run failed',
        review_requested: 'Review requested',
        message: 'Message',
        handoff: 'Handoff',
        self_heal: 'Self-heal',
        decision: 'Your decision',
      },
      simEvents: {
        run_completed: 'Run completed',
        run_failed: 'Run failed: tool timeout',
        self_heal: 'Retry succeeded, wrote a note for the Overseer',
      },
      decisions: {
        approve: 'You approved: {title}',
        sendback: 'You sent back: {title}',
        retry: 'You retried the failed run',
        answer: 'You answered; the run resumed',
        read: 'You read {n} messages',
        readOne: 'You read {n} message',
      },
      toasts: {
        approve: '{callsign}: approved “{title}”',
        sendback: '{callsign}: sent back “{title}”',
        retry: '{callsign}: retrying from the start',
        answer: '{callsign}: answer sent, run resumed',
        read: '{callsign}: {n} messages marked read',
        readOne: '{callsign}: {n} message marked read',
        next: '{i} of {n} needing you: {callsign} {name}',
        nobody: 'Nobody needs you right now',
      },
      time: {
        justNow: 'just now',
        minutesAgo: '{n}m ago',
        hoursAgo: '{n}h ago',
        daysAgo: '{n}d ago',
      },
      top: {
        needsOne: 'needs you',
        needsMany: 'need you',
        allClear: 'all clear',
      },
      nav: {
        fleet: 'Fleet',
        back: 'Back',
        backToFleet: 'Back to fleet',
        backToTeam: 'Back to {team}',
        breadcrumb: 'Breadcrumb',
        nextHint: 'next agent that needs you',
        escHint: 'back',
      },
      bay: {
        agentsCount: '{n} agents',
        agentsCountOne: '{n} agent',
        needCount: '{n} need you',
        needCountOne: '{n} needs you',
        aria: '{team} team: {agents}, {running} working, {need}. Open team',
      },
      tile: {
        reviews: '{n} pending reviews ({severity})',
        reviewsOne: '{n} pending review ({severity})',
        unread: '{n} unread',
        needsYou: 'needs you',
      },
      card: {
        reviews: '{n} reviews, oldest {age}',
        reviewsOne: '{n} review, {age} old',
        unread: '{n} unread messages',
        unreadOne: '{n} unread message',
      },
      team: {
        title: '{team} team, {n} agents',
        titleOne: '{team} team, {n} agent',
        runsToday: 'runs today',
      },
      stats: {
        runsToday: 'Runs today',
        success: 'Success',
        costToday: 'Cost today',
        progress: 'progress',
        runningFor: 'Running for',
        last12: 'Last 12 runs',
        last12Aria: 'Last 12 runs, newest first: {n} failed',
        runs24h: 'Runs, last 24h',
      },
      agent: {
        emblemCaption: 'Persona emblem, stylised illustration',
        traceCaption: 'Run trace: stylised illustration',
        currentRun: 'Current run',
        runStatus: 'Run status',
        recentEvents: 'Recent events',
        nothingLogged: 'Nothing logged in the last 14 hours.',
        retry: 'Retry run',
        retryNote: 'The Overseer will note the failure',
        answer: 'Answer and resume',
        answerNote: 'It paused for a decision',
        queuedNote: 'Starts when a slot frees up',
        draftNote: 'Approve the review on the right to publish',
        started: 'Started',
        lastResult: 'Last result',
        state: 'State',
        health: 'Health',
        runsToday: 'Runs today',
        successRate: 'success rate',
        liveToolCalls: 'Live tool calls',
        reviewsCount: 'Reviews, {n}',
        oldestDecides: 'oldest decides rank',
        approve: 'Approve',
        sendBack: 'Send back',
        waiting: 'waiting {age}',
        noDecisions: 'No decisions waiting.',
        unreadCount: 'Unread messages, {n}',
        markRead: 'Mark read',
        inboxClear: 'Inbox clear.',
        steps: {
          plan: 'Plan',
          gather: 'Gather',
          tools: 'Tool calls',
          check: 'Check',
          write: 'Write',
          handoff: 'Hand off',
        },
        results: {
          completed: 'Completed',
          failed: 'Failed',
        },
      },
      band: {
        used: '{label} used',
        hot: 'running hot',
        onPace: 'on pace',
        headroom: 'headroom',
        elapsed: '{pct}% of window elapsed, resets in {time}',
        system: 'System',
        procRunning: 'running {time}',
        procDone: 'done {ago}',
        procQueued: 'queued',
        live: 'Live',
        liveNote: 'Newest events',
      },
    },
    city: {
      label: 'The city: one building per team, one window per agent',
      states: {
        running: 'at work {pct}%',
        failed: 'failed',
        input_required: 'waiting for your answer',
        draft_ready: 'draft ready for review',
        queued: 'waiting its turn',
        attention: 'idle, reviews waiting',
        idle: 'idle',
        off: 'switched off',
      },
      reasons: {
        failed: 'run failed',
        input: 'needs answer',
        critical: 'critical review',
        criticalMany: 'critical ×{n}',
        draft: 'draft ready',
        review: 'review',
        reviewMany: 'review ×{n}',
        info: 'info review',
        infoMany: 'info ×{n}',
      },
      moon: {
        five: '5-hour {pct}%',
        seven: '7-day {pct}%',
        hot: 'running hot',
        onPace: 'on pace',
        resetsIn: 'resets in {t}',
      },
      ago: {
        now: 'just now',
        min: '{n}m ago',
        hour: '{n}h ago',
        day: '{n}d ago',
      },
      runningFor: 'running for {t} · {n} live tool calls',
      reviewsOne: '1 review · oldest {age}',
      reviewsMany: '{n} reviews · oldest {age}',
      unreadOne: '1 unread message',
      unreadMany: '{n} unread messages',
      pinHint: 'Click to pin this card · Esc to unpin',
      teamLine: '{n} windows · {run} at work · {ny} need you · {runs} runs today',
      windowAria: '{callsign} {name}, {team}, {state}',
      buildingAria: '{team} building, {n} agents, {ny} need you',
      tickerLabel: 'Newest events',
      live: 'Live',
      hintNext: 'next that needs you',
      legendButton: 'Legend',
      legendTitle: 'How to read a window',
      legend: {
        working: 'Working · lit, light rises with progress',
        failed: 'Needs you · failed run, beacon on the roof',
        input: 'Needs you · waiting for your answer',
        draft: 'Needs you · draft ready to review',
        review: 'Needs you · review waiting, flag in its severity',
        queued: 'Resting · queued, a dim lamp',
        idle: 'Resting · idle, curtains drawn',
        off: 'Off · shutters down',
        unread: 'Unread messages · envelope',
      },
      legendNote: 'Every window that needs you lights a beacon on its roof; the rail lists them, most urgent first. Wires are who talks to whom; moving lights are messages and handoffs.',
      processes: {
        label: 'System processes',
        running: '{label} · running {t}',
        queued: '{label} · queued',
        done: '{label} · done {age}',
      },
    },
  },
  landingSections: {
    hero: {
      line1: 'One event in.',
      line2: 'A whole team on it.',
      sub: 'A hive of AI agents on your own machine, coached and always on.',
      aria: 'Animated illustration: events fall onto a honeycomb of AI agents, ripple through a team of cells, and rise again as finished work.',
      events: ['Invoice in', 'New lead', 'Build failed'],
      done: ['Booked', 'Qualified', 'Fixed'],
    },
    featuresHero: {
      line1: 'A crew of AI agents,',
      line2: 'alive on your machine.',
      sub: 'They wake on events, team up, and get it done. Privately.',
      aria: 'Animated illustration: a swarm of AI agents drifting in teams. Whenever an event arrives, the nearest team gathers around it, works it, and lets go.',
      events: ['New email', 'Invoice in', 'PR opened', '9:00 standup', 'File changed', 'Price alert', 'Ticket filed'],
      handled: 'Handled',
      yourEvent: 'Your event',
      sendEvent: 'Send an event',
      skipIntro: 'Skip intro',
    },
    useCases: {
      artLabel: 'Animation: one persona, {persona}, meets one job at a time and picks the tool for it from your connectors.',
      needs: {
        reach: 'Write to a client',
        notes: 'Keep meeting notes',
        book: 'Book the follow-up',
        track: 'Track the tasks',
        code: 'Review the code',
        pay: 'Chase a failed payment',
      },
      status: 'Job {n} of {total}: {need}. Picked {tool} out of {options}.',
      controls: 'Animation playback',
      prevCase: 'Previous job',
      nextCase: 'Next job',
      capabilities: 'Capabilities',
      jobsCount: '{count} of {total} jobs covered',
    },
    agentMind: {
      stylised: 'Stylised simulation · no model is called',
      idleHint: 'Pick a prompt and watch it think',
      illustration: 'Illustration: how the agent works through the selected prompt, from reading it to handing back the result',
      wholePlan: 'Whole plan',
      outcomeTitle: 'What comes back',
      underAttention: 'Now',
      beats: {
        parse: 'Reads what you asked for',
        select: 'Picks the right tools',
        tools: 'Works inside your apps',
        execute: 'Does the work',
        verify: 'Checks its own work',
        result: 'Hands back the outcome',
      },
    },
    hub: {
      wakes: 'Wakes',
    },
    getStarted: {
      replay: 'Replay the animation',
      stylised: 'Stylised illustration',
      v3: {
        agent: 'Your agent',
        lede: 'A few minutes of your day, once. Then it works around the clock while you live yours.',
        artLabel: 'Stylised 24-hour dial. On day one you spend a few minutes at 09:00: install Personas, say what you want, connect Gmail and Slack. Around the dial your day goes on: meetings, lunch, focus time, home, sleep. On the inner ring your agent runs on its own: at 11:20 and 15:45 when new emails land, at 02:10 overnight, and at 08:00 it posts the morning digest to Slack.',
        yours: 'Your few minutes',
        yoursLine: 'Once, on day one.',
        its: 'Its whole day',
        itsLine: 'Every run, on its own.',
        setup: { install: 'Install Personas', describe: 'Say what you want', connect: 'Connect Gmail and Slack' },
        day: 'Day {n}',
        dayParts: { coffee: 'Coffee', meetings: 'Meetings', lunch: 'Lunch', focus: 'Focus time', home: 'Home', asleep: 'Asleep' },
        triggers: { schedule: 'Schedule', email: 'New email' },
        runs: {
          client: 'Client email flagged in Slack',
          invoice: 'Invoice summarized in Slack',
          overnight: 'Overnight email queued for the digest',
          digest: 'Morning digest: 6 highlights posted',
        },
        onYourPc: 'On your PC',
      },
    },
  },
  featuresSections: {
    design: {
      artLabel: 'Stylised illustration: the sentence "Triage my Gmail inbox and draft replies for urgent emails" becomes a complete agent. Personas decides its task, apps (Gmail and Slack), schedule, human review, messages, memory, error handling and events, and asks only two questions: how often to run and whether to approve drafts first.',
      persona: 'Inbox Triage',
      yourSentence: 'Your sentence',
      reading: 'Reading your sentence',
      ready: 'Ready to deploy',
      decided: '{n}/{total} decided',
      replay: 'Replay',
      asks: 'Personas asks',
      suggested: 'suggested',
      sources: {
        said: 'From your words',
        asked: 'Asked you',
        inferred: 'Inferred',
      },
      keywords: {
        tasks: 'Triage',
        apps: 'Gmail',
        review: 'draft replies',
        memory: 'urgent',
      },
      v2: {
        lede: 'Write one sentence. Personas draws the whole agent from it and asks only where it needs you.',
        stylised: 'Stylised',
        sheet: 'Agent blueprint',
        testRun: 'Test run: one email, end to end',
      },
      v3: {
        lede: 'One sentence in. Eight decisions out, grown into one agent.',
        stylised: 'Stylised',
      },
    },
    memory: {
      stylised: 'Stylised',
      categories: { fact: 'Fact', decision: 'Decision', insight: 'Insight', learning: 'Learning', warning: 'Warning' },
      v1: {
        artLabel: 'The same task run twice. Run 1 wanders and fails twice; each failure is kept as a memory, a warning and a learning. Before run 12 the agent recalls both and goes straight to the goal with no retries.',
        retries: '{n} retries',
        noRetries: 'No retries',
        recalled: 'Recalled',
      },
      v2: {
        artLabel: 'Four memory layers, core, active, working and archive. Before each run the agent recalls from core and active; after it, what it learned lands in working, memories it keeps using rise, and the ones it stops using sink to the archive. Retries fall from three on run 1 to none from run 4.',
        tiers: {
          core: { name: 'Core', note: 'Always loaded' },
          active: { name: 'Active', note: 'Used often' },
          working: { name: 'Working', note: 'Just learned' },
          archive: { name: 'Archive', note: 'Kept, on demand' },
        },
        run: 'Run {n}',
        recall: 'Recall',
        learn: 'Learn',
        firstTry: 'First try',
        retries: '{n} retries',
        oneRetry: '1 retry',
        pick: 'Show memory after run {n}',
        memories: '{n} memories',
      },
      v3: {
        artLabel: 'Growth rings: every run of the agent draws one ring. The first rings are rough, with a stumble wherever it went wrong; each stumble leaves a memory, and from then on the ring runs smooth past that point. Ten runs later the rings are clean circles.',
        run: 'Run',
        ofRuns: 'of {n}',
        rough: 'First runs',
        smooth: 'Run {n}',
        legend: 'What it keeps',
        show: 'Show {category} memories',
        hint: 'Pick one to see an example.',
        examples: {
          fact: 'The client prefers formal language.',
          decision: 'Chose express shipping: the order was urgent.',
          insight: 'Support tickets spike every Monday morning.',
          learning: 'Shorter subject lines get more opens.',
          warning: 'Never invoice before the contract is signed.',
        },
      },
    },
    healing: {
      heading: 'Fixes itself when things',
      headingGradient: 'break',
      stylised: 'Stylised',
      overseerNote: 'Logged for the Overseer',
      retry: 'Retry {n} of 3',
      cases: {
        rateLimit: {
          name: 'Rate limit',
          error: 'Slack: too many requests',
          diagnosis: 'Slack wants a pause',
          fix: 'Waits 30 s, then retries',
          result: 'Posted on the retry',
          note: 'Slack slowed the 08:00 post. One retry fixed it.',
        },
        timeout: {
          name: 'Timeout',
          error: 'Notion step ran out of time',
          diagnosis: 'Slow, not broken',
          fix: 'Retries with twice the time',
          result: 'Saved on the retry',
          note: 'Notion was slow today. Twice the time limit was enough.',
        },
        overload: {
          name: 'Overloaded',
          error: 'Claude is overloaded',
          diagnosis: 'A busy provider, not your agent',
          fix: 'Resumes in 10 min, mid-run',
          result: 'Picked up where it stopped',
          note: 'Claude was busy at 08:00. Resumed at 08:10, nothing lost.',
        },
        setup: {
          name: 'Broken step',
          error: 'A step failed on its setup',
          diagnosis: 'Something the agent can repair',
          fix: 'Retries it with Claude Opus',
          result: 'Step repaired',
          note: 'A step broke on its setup. Opus repaired it on the retry.',
        },
        login: {
          name: 'Expired login',
          error: 'Gmail: login expired',
          diagnosis: 'Only you can renew it',
          fix: 'Stops instead of retrying',
          result: 'Waiting for you',
          note: 'Renew the Gmail login and the run goes on.',
        },
      },
      stages: {
        detect: 'Detect',
        diagnose: 'Diagnose',
        fix: 'Fix',
        done: 'Back on track',
        yours: 'For you',
      },
      v1: {
        lede: 'When a step fails, your agent works out why, applies the fix that error needs and carries on. Only what it can\'t fix comes to you.',
        artLabel: 'Stylised circuit of an agent\'s run: a schedule starts the agent, which reads Gmail, posts to Slack and saves to Notion. One step fails at a time; the agent detects it, diagnoses the error, applies its fix and the run carries on. An expired login is not retried: the run stops safely and the issue is sent to you.',
        title: 'Your agent\'s run',
        casesLabel: 'Pick a failure to watch',
        schedule: '08:00',
        agent: 'Agent',
        report: 'Report',
        log: 'Run log',
        healthy: 'All steps running',
        healed: 'Healed',
        stopped: 'Stopped safely',
      },
      v2: {
        lede: 'Every failure gets the fix its error needs: a pause, more time, a resume or a stronger model. Only an expired login comes to you.',
        artLabel: 'Stylised prism: failed steps enter a prism that diagnoses each error and splits them into beams. A rate limit waits 30 seconds and retries, a timeout retries with twice the time, an overloaded provider resumes in 10 minutes, a broken step is repaired by Claude Opus; all four get back on track. An expired login goes to you.',
        failures: 'Failed steps',
        diagnose: 'Diagnose',
        diagnoseSub: 'reads each error',
        fixed: 'back on track',
        forYou: 'for you',
        budget: 'Up to 3 tries, then it\'s yours',
        logged: 'Every fix logged for the Overseer',
      },
      v3: {
        lede: 'Follow one failure from the error to the fix. No 3 a.m. alert, just a note in the morning.',
        artLabel: 'Stylised storyboard in four shots: a morning digest run fails on one step, the agent works out why, applies the fix for that error, and the Overseer leaves a note. For an expired login it stops and asks you instead.',
        camera: 'Camera',
        overview: 'Overview',
        another: 'Another failure',
        runName: 'Morning digest',
        shots: {
          fails: 'It fails',
          why: 'It works out why',
          fixes: 'It fixes it',
          stops: 'It stops',
          after: 'It tells you after',
          asks: 'It asks you',
        },
        steps: {
          read: 'Read Gmail',
          summarise: 'Summarise',
          save: 'Save to Notion',
          post: 'Post to Slack',
        },
        backoff: 'Next waits',
        timeLimit: 'Time limit',
        resumeAt: 'Resumes at step {n}',
        noBlindRetries: 'No blind retries',
        issueTitle: 'Health issue',
        noAlert: 'No 3 a.m. alert',
        secs: '{n} s',
        mins: '{n} min',
        overseer: 'Overseer\'s note',
        shotOf: 'Show shot {n}: {title}',
      },
    },
    models: {
      stylised: 'Stylised',
      yourMachine: 'Your machine',
      viaClaudeCode: 'via Claude Code',
      traits: { haiku: 'Fast and light', sonnet: 'The default', opus: 'Hardest problems', ollama: 'Stays on your PC' },
      agents: { codeReview: 'Code review', inbox: 'Inbox digest', brief: 'Daily brief', support: 'Support replies', journal: 'Private journal' },
      v1: {
        lede: 'Every agent thinks with the model its job needs. Private ones never leave your machine.',
        artLabel: 'Four agents live on your machine. Code review thinks with Claude Opus, the inbox digest with Haiku and the daily brief with Sonnet, through Claude Code. The private journal runs on Ollama and never leaves the machine.',
        pick: 'Per-agent pick',
      },
      v2: {
        lede: 'Send the heavy lifting to Claude. Keep private work at home on Ollama.',
        artLabel: 'Your machine sends work up to Claude Haiku, Sonnet or Opus through Claude Code. Choose Ollama and the link pulls back: a dome closes over the machine and nothing leaves it.',
        choose: 'Choose an engine',
        captions: {
          haiku: 'Quick, light jobs',
          sonnet: 'The everyday default',
          opus: 'The hardest problems',
          ollama: 'Nothing leaves this machine',
        },
      },
      v3: {
        lede: 'Patch each agent into the engine its job deserves, and re-patch it any time.',
        artLabel: 'A patch bay. Five agents on the left are cabled to engines on the right: Claude Opus, Sonnet and Haiku through Claude Code, and Ollama on this PC for the private journal.',
        agentsTitle: 'Your agents',
        onThisPc: 'On this PC',
        hint: 'Click an agent to swap its engine',
        swap: '{agent} runs on {engine}. Swap engine.',
      },
    },
    observe: {
      stylised: 'Stylised data',
      v1: {
        lede: 'Every run, message and event, live in one deck. Pick a stream to light it up across the whole fleet.',
        artLabel: 'Stylised observability deck: six agent lanes stream their runs, messages, reviews and failures past a glowing now line, each drawn to its length and cost, with run counts and spend per agent.',
        now: 'now',
        secondsAgo: '-{n}s',
        failed: 'fail',
        filtered: 'Showing {name}',
      },
      v2: {
        lede: 'Open any run and replay it step by step: every model call, tool call, cost, failure and approval, in order.',
        artLabel: 'Stylised run trace: a strip of today\'s runs, one opened into a step-by-step timeline with its timing and cost, a failed Slack post that retried, and the approval it waited on.',
        today: 'Today',
        runsToday: '{n} runs',
        openRun: 'Open the {name} run',
        fleet: 'Fleet',
        legend: { ok: 'Done', failed: 'Failed', review: 'Needed you' },
        kinds: { trigger: 'Trigger', model: 'Model call', tool: 'Tool call', review: 'Your review', memory: 'Memory', retry: 'Retry' },
        status: { ok: 'Done', failed: 'Failed', retried: 'Recovered', approved: 'Approved by you', alert: 'Alert sent', running: 'Running', queued: 'Not yet run' },
        stats: { duration: 'Duration', cost: 'Cost', tokens: 'Tokens' },
        timeByStep: 'Time by step',
        position: 'Step {i} of {n}, at {t}',
        hintFollow: 'Press any step to inspect it',
        hintPinned: 'Pinned. Press it again to resume.',
        runs: {
          pr: {
            id: '#482',
            steps: {
              opened: 'Pull request opened',
              read: 'Read the diff',
              fetch: 'Fetch 4 files',
              write: 'Write the review',
              post: 'Post summary',
              retry: 'Post summary again',
              approve: 'Approve the merge?',
              merge: 'Merge PR #482',
            },
            notes: {
              opened: 'GitHub woke the agent the moment the PR landed.',
              read: '12.4k tokens across 4 changed files.',
              fetch: 'Pulled the changed files from GitHub.',
              write: '3 comments and one suggested fix.',
              post: 'Slack answered 429: rate limited.',
              retry: 'Retried after a second and posted.',
              approve: 'Waited on you. Approved from your phone.',
              merge: 'Merged with your sign-off on record.',
            },
          },
          deploy: {
            id: '#1207',
            steps: {
              check: 'Scheduled check',
              deploys: 'Read 3 deployments',
              errors: 'Error spike: 38 a minute',
              diagnose: 'Trace the cause',
              commit: 'Find the commit',
              rollback: 'Roll back v2.14?',
              revert: 'Roll back to v2.13',
              notify: 'Tell #ops',
            },
            notes: {
              check: 'Runs every 5 minutes.',
              deploys: 'v2.14 went live on Vercel 4 minutes ago.',
              errors: 'Sentry flagged it. An alert went out at once.',
              diagnose: '15.2k tokens. Points at a cache change.',
              commit: 'Commit a41f9c changed the cache.',
              rollback: 'You approved the rollback in one tap.',
              revert: 'Back on v2.13. Errors fell to zero.',
              notify: 'Posted the rollback to #ops.',
            },
          },
          email: {
            id: '#3391',
            steps: {
              received: 'Invoice received',
              classify: 'Classify: invoice',
              file: 'File the PDF',
              remember: 'Remember the vendor',
              notify: 'Tell #finance',
              archive: 'Archive the thread',
            },
            notes: {
              received: 'A new email in the finance inbox.',
              classify: '2.3k tokens. One cent.',
              file: 'Saved to Finance / 2026 / October.',
              remember: 'Their next invoice files itself.',
              notify: 'Finance knows it is filed.',
              archive: 'Inbox back to zero.',
            },
          },
        },
      },
      v3: {
        lede: 'Every run lands on the record: what it did, which tool it touched, what it cost and who signed off.',
        artLabel: 'Stylised activity log: six agents feed one printer, each run prints a line with its time, tool, action and cost, failures and sign-offs are stamped, and a statement totals the day.',
        allAgents: 'All agents',
        printer: 'Activity log',
        statement: { title: 'Today', spend: 'Spend', runs: 'Runs', failures: 'Failures caught', approvals: 'Signed off by you', byAgent: 'Spend by agent' },
        stamps: { failed: 'Failed', retried: 'Retried', approved: 'Approved', needsYou: 'Needs you' },
        lines: {
          reviewPr: 'Reviewed PR #482',
          sorted: 'Sorted 14 emails',
          checked: 'Checked 3 deploys',
          digest: 'Posted the digest',
          spike: 'Error spike found',
          rollback: 'Rolled back v2.14',
          indexed: 'Indexed 22 pages',
          standup: 'Summarised stand-up',
          drafted: 'Drafted 3 replies',
          post: 'Posted PR summary',
          repost: 'Posted PR summary',
          filed: 'Filed 6 PDFs',
          merged: 'Merged PR #482',
          synced: 'Synced 9 issues',
          actions: 'Saved action items',
          archived: 'Archived newsletters',
        },
      },
    },
    plugins: {
      more: '+{count}',
      stylised: 'Stylised',
      taglines: {
        drive: "Your agents' exports, kept and browsable",
        twin: "Speaks as you, in each channel's tone",
      },
      v1: {
        artLabel: 'Stylised plugin window: plug in a plugin to watch it work.',
        reach: 'Connects to {count} tools',
      },
      drive: {
        title: 'Local drive',
        where: 'Saved in your app data',
        files: '{count} files',
        browse: 'Browse',
        folder: 'exports',
        kept: 'kept',
        statusLanding: 'Exports landing · {count}/{total}',
        statusUpdating: 'Updating Personas to {version}',
        statusKept: 'Updated to {version} · every file kept',
        survives: 'Survives upgrades',
        agents: {
          report: 'Report writer',
          design: 'Designer',
          leads: 'Lead scout',
          video: 'Video editor',
          notes: 'Scribe',
        },
      },
      twin: {
        you: 'You',
        intent: 'Tell Dana the fix ships Thursday.',
        name: 'Your twin',
        speaksAs: 'Speaks as you',
        traits: { identity: 'Your identity', tone: 'Tone per channel', memory: 'Memory recall' },
        recalled: 'Recalled',
        recallFact: 'Dana reported the export bug',
        tracked: 'Replies tracked',
        typing: 'Writing as you',
        sender: 'Sam',
        contact: 'Dana',
        alsoReaches: 'Same voice, any channel',
        channels: {
          slack: { tone: 'Casual', message: "Fix lands Thursday 🚀 I'll ping you when it's live!", reply: '🙌 legend, thanks!' },
          gmail: {
            tone: 'Formal',
            subject: 'Re: Export bug',
            message: 'Hi Dana, I can confirm the fix ships on Thursday.',
            signoff: 'Kind regards, Sam',
            reply: 'Thank you, Sam.',
          },
          linkedin: { tone: 'Warm', message: 'Thanks again for flagging this, Dana. The fix ships Thursday!', reply: 'Great news, thank you!' },
        },
        statusListening: 'Listening to you',
        statusRecalling: 'Recalling who Dana is',
        statusMirroring: 'Mirroring to {count} channels',
        statusReplies: 'Replies back \u00b7 {count}/{total}',
      },
    },
  },
  athenaSections: {
    quiet: {
      nav: 'QUIET',
      intro: { eyebrow: 'All day, in the background', heading: 'Quiet until it', gradient: 'matters' },
      aria: 'Your day streams past Athena along one line of light. She lets the noise go by and speaks up only when something matters: a moved meeting, a broken build, a client\'s reply.',
      moments: [
        { event: '3pm moved', line: '3pm moved. Prep is ready.' },
        { event: 'Build failed', line: 'Build broke overnight. Fix drafted.' },
        { event: 'Client replied', line: 'Client replied. Draft is waiting.' },
      ],
      passed: ['Newsletter', 'Build passed', 'Calendar sync', 'Auto-reply', '12 new likes', 'Backup done'],
      status: '{events} events today · she spoke {spoken} times',
      statusShort: '{events} events · she spoke {spoken}',
      now: 'Now',
    },
    onboarding: {
      v2: {
        aria: 'Illustration: an empty workspace that Athena sets up with you. You pick your tools and first jobs; she plugs the tools in, raises a desk for each agent and starts them running',
        empty: 'No agents yet',
        you: 'you',
        askTools: 'Which tools do you use?',
        askJobs: 'Which jobs first?',
        askStart: 'Start them now?',
        go: 'Go',
        tools: ['Slack', 'Gmail', 'GitHub', 'Notion'],
        agentsLive: 'agents running',
        ready: 'ready',
        running: 'running',
        statusEmpty: 'empty workspace · nothing set up',
        statusRunning: 'workspace live · {n} agents running',
      },
    },
    fleet: {
      v2: {
        art: 'One sentence becomes a team of four whose rings close together around Athena, long before one person working task by task would finish.',
        serial: 'one at a time',
        serialStep: '{n} of {total}',
      },
    },
    workshop: {
      v3: {
        art: 'Illustration: a field of work sorted by how much is at stake, cut by one line you set. She does everything under it on her own, at any volume; everything over it waits for you. Drag the line to move it.',
        items: [
          'fix a typo',
          'rerun the tests',
          'tidy old branches',
          'answer a teammate',
          'merge a small fix',
          'email a client',
          'refund $240',
          'ship to the live site',
        ],
        high: 'more at stake',
        low: 'routine',
        line: 'your line',
        lineAria: 'Your line. She does the work under it on her own; work over it waits for you.',
        done: 'done on her own',
        forYou: 'waits for you',
        more: '+{n} more',
        status: {
          full: [
            'you draw one line',
            'under it, she just does it',
            'over it, it comes to you',
            'hand her ten times more',
            'then a hundred more \u2014 the line holds',
            'drag it \u2014 you decide how far she goes',
          ],
          short: [
            'one line',
            'under it, she does it',
            'over it, it comes to you',
            'ten times more',
            'the line holds',
            'drag it \u2014 your call',
          ],
        },
      },
    },
    portfolio: {
      aria: {
        roots: 'Stylised garden of your projects and their roots: one is wilting, Athena traces it down to the rotten root and starts the fix.',
      },
      cause: 'Payment library',
      you: 'Your week',
    },
    memory: {
      stylised: 'stylised',
      v1: {
        artLabel: 'Five days of working with Athena. Each day\'s talk builds up; after each full day she keeps one thing about how you work on a growing shelf, and days later the first thing she kept comes back into the work.',
      },
    },
    oneMind: {
      v3: {
        aria: 'A wall of conversations with Athena, typed and spoken, one for every project, falls into register as a single face. Open any one of them and ask where you were: she picks it up exactly there.',
        extras: ['Hiring', 'The Q3 plan', 'Landing copy', 'Support inbox', 'Mobile app', 'Data import', 'Weekly notes', 'Team offsite'],
        ask: 'Where were we?',
        replies: [
          'The outage. The fix held overnight, one alert is left to close.',
          'Invoices. Two left to send, after the 1st, as you asked.',
        ],
        reopened: 'picked up',
        status: {
          face: 'all of them, one face',
          faceShort: 'one face',
          ask: 'ask any one of them where you were',
          askShort: 'ask where you were',
          there: 'she picks it up exactly there',
          thereShort: 'picked up exactly there',
        },
      },
    },
  },
  howSections: {
    scrollMap: {
      forYou: 'START HERE',
      timeline: 'AGENTS: TIMELINE',
      chat: 'AGENTS: CHAT',
      layers: 'PLATFORM: LAYERS',
      manifesto: 'WHAT STAYS YOURS',
      events: 'EVENTS',
    },
    rolePath: {
      aria: 'Start here: how Personas works for you',
      eyebrow: 'Start here',
      heading: 'How Personas works',
      gradient: 'for you',
      lede: 'Tell us who you are. We\'ll show you the four things on this page that matter most to you, and why.',
      pickLabel: 'I am a',
      routeLabel: 'Your path through this page',
      jump: 'Take me there',
      announce: 'Showing the path for {role}.',
      roles: {
        developer: { name: 'Developer', want: 'I build and automate things' },
        productManager: { name: 'Product manager', want: 'I want work to move without chasing it' },
        enterprise: { name: 'Enterprise', want: 'I need it safe, visible and ready to scale' },
      },
      stops: [
        {
          title: 'Rules break, agents adapt',
          developer: 'Stop writing a new if-statement for every edge case. An agent reads the request and finds its own way through.',
          productManager: 'Messy, real-world requests stop stalling in a queue. Work keeps moving even when the case is new.',
          enterprise: 'Fewer odd cases dropped on a person at 2 a.m. Agents handle them and tell you what they did.',
        },
        {
          title: 'Same message, different intelligence',
          developer: 'See why an agent beats a scripted bot on the exact message that breaks your flowchart.',
          productManager: 'Watch one customer message get a real answer instead of a hand-off. That is the experience you ship.',
          enterprise: 'Same customers, fewer escalations: a script and an agent side by side, on one clock.',
        },
        {
          title: 'Built to grow with you',
          developer: 'Start with one agent on your laptop. Add more when you need them, without rewriting what works.',
          productManager: 'Begin with one task this week and grow into a team of agents as the wins pile up.',
          enterprise: 'Go from a pilot to a fleet with monitoring at every step, so you always see what is running.',
        },
        {
          title: 'Agents that talk to each other',
          developer: 'Chain agents with events instead of glue code: one finishes, the next picks up.',
          productManager: 'Hand-offs between tools happen on their own. A new email can become a ticket and a team update.',
          enterprise: 'Connect the tools your teams already use, and keep every hand-off traceable.',
        },
      ],
    },
    manifesto: {
      aria: 'What stays yours',
      eyebrow: 'What stays yours',
      lines: { agents: 'Your agents.', rules: 'Your rules.', infra: 'Your infrastructure.' },
      agents: {
        kicker: 'Designed in plain words',
        prompt: '\u201CEvery Monday, sum up last week\'s support tickets and post the highlights for the team.\u201D',
        agent: 'Weekly ticket digest',
        ready: 'Ready to run',
      },
      rules: {
        kicker: 'You decide how far they go',
        levels: ['Ask me first', 'Act, then tell me', 'Act on its own'],
        note: 'Set it per agent. Change it any time.',
      },
      infra: {
        kicker: 'Runs on your machine',
        device: 'Your computer',
        agents: 'Your agents',
        keys: 'Your keys',
        cloud: 'Anyone else',
        never: 'Keys never leave it',
      },
    },
    timeline: {
      heading: { lead: 'The', gradient: 'Race', trailing: ' Is Already Over' },
      stylised: 'Stylised',
      replay: 'Replay',
      pause: 'Pause',
      resume: 'Resume',
      scenariosLabel: 'Scenarios',
      showScenario: 'Show scenario {n}: {name}',
      scenarios: [
        {
          name: 'Ambiguous email',
          trigger: '"Cancel my order... actually, change the address instead."',
        },
        {
          name: 'Split payment refund',
          trigger: 'A refund for an item paid with a gift card and a credit card.',
        },
        {
          name: 'Staging setup',
          trigger: '"Set up staging just like production, with debug logging on."',
        },
        {
          name: 'Error recovery',
          trigger: 'The payment server goes down in the middle of 200 payments.',
        },
        {
          name: 'VIP legacy discount',
          trigger: 'A VIP asks for a discount but already has a special rate from 2023.',
        },
      ],
      v3: {
        lede: 'Rules run on rails: fast until something blocks the track. An agent sees the snag, finds a way around it and still arrives.',
        artLabel: 'A stylised map: a train on fixed rails stops at a blocked track while an agent\'s route bends around the snag to the same destination.',
        start: 'Request in',
        finish: 'Done',
        rails: 'Fixed rules',
        route: 'Agent',
        stalled: 'Stalled',
        announce: '{name}. Fixed rules: stalled at "{snag}", {wait} Agent: {result}',
        cases: [
          {
            snag: 'Two requests in one email',
            wait: 'waits 47 minutes for a person.',
            waypoints: ['Reads the whole message', 'Spots the real request', 'Updates the address', 'Confirms with the customer'],
            result: 'Address updated.',
          },
          {
            snag: 'Paid with two cards',
            wait: 'waits 3 days for finance.',
            waypoints: ['Splits $40 / $60', 'Refunds the gift card', 'Refunds the credit card', 'Tells the customer'],
            result: 'Both refunds sent.',
          },
          {
            snag: '12 services need hand edits',
            wait: 'half done, 6 services broken.',
            waypoints: ['Lists all 12 services', 'Copies each with debugging', 'Deploys and checks each', 'Confirms all 12 work'],
            result: 'Staging ready.',
          },
          {
            snag: 'Server down at payment 148',
            wait: '147 good payments undone.',
            waypoints: ['Saves progress at 147', 'Waits, then retries', 'Server is back', 'Finishes the rest'],
            result: 'All 200 payments done.',
          },
          {
            snag: 'Already has a special rate',
            wait: 'request denied.',
            waypoints: ['Compares old and new rates', 'Sees 22% beats 15%', 'Writes a personal reply', 'Adds a loyalty perk'],
            result: 'Better rate kept, perk added.',
          },
        ],
      },
    },
    chat: {
      aria: 'The same customer message answered by a scripted bot and by an agent',
      heading: 'Same Message,',
      gradient: 'Different Intelligence',
      lede: 'Same customer message, two very different experiences. See why intelligence matters more than rules.',
      stylised: 'Stylised',
      customer: 'Customer',
      scripted: 'Scripted bot',
      agent: 'Agent',
      pickLabel: 'Pick a customer message',
      pause: 'Pause auto-play',
      resume: 'Resume auto-play',
      replay: 'Replay',
      inSeconds: 'in {n} s',
      scenarios: [
        {
          name: 'Changed mind',
          message: 'Cancel my order #4821… actually, never mind, just change the shipping address to 742 Evergreen Terrace.',
          scripted: [
            'Processing cancellation for order #4821.',
            'Order found. Cancellation started.',
            'Warning: conflicting instructions detected.',
            'I can only handle one request at a time.',
            'Transferred to our team. Expected wait: 47 minutes.',
          ],
          agent: [
            'You changed your mind, so I\'ll keep the order and change the address.',
            'Updating order #4821 to 742 Evergreen Terrace.',
            'Done. It ships to the new address tomorrow.',
          ],
          scriptedOutcome: 'Waiting for a human · 47 min',
          agentOutcome: 'Address changed',
        },
        {
          name: 'Split refund',
          message: 'Refund order #7733. I paid $40 by gift card and $60 by Visa.',
          scripted: [
            'Looking up order #7733.',
            'Refunding to the original payment method.',
            'Error: two payment methods found.',
            'I can\'t split refunds. Creating a ticket.',
            'Sent to finance. About 3 business days.',
          ],
          agent: [
            'Two payment methods, so I\'ll split the refund.',
            '$40 back to your gift card.',
            '$60 back to your Visa ending 4242.',
            'Done. Gift card now, Visa in 2-3 days.',
          ],
          scriptedOutcome: 'Sent to finance · 3 business days',
          agentOutcome: 'Both refunds sent',
        },
        {
          name: 'Staging setup',
          message: 'Set up staging like production, with debug logging on all 12 services.',
          scripted: [
            'Found the “create environment” template.',
            'Production copied. Applying the debug flag.',
            'Warning: 12 services each need their own change.',
            'Error: 47 possible paths. I can\'t decide.',
            'Half done. 6 of 12 services are broken.',
          ],
          agent: [
            'I\'ll list all 12 services first, then change each one.',
            'Cloning every config with debug logging on.',
            'Deploying one by one, health-checking each.',
            'All 12 services live and healthy.',
          ],
          scriptedOutcome: 'Half done · 6 services broken',
          agentOutcome: 'Staging live and healthy',
        },
        {
          name: 'Batch recovery',
          message: 'The payment API threw a 503 halfway through 200 transactions. Fix it.',
          scripted: [
            '147 of 200 transactions processed.',
            'Error: #148 failed. Retrying, 1 of 3.',
            'Error: all 3 retries failed.',
            'Rolling back all 200, even the 147 that worked.',
            'Failed. Someone must redo it by hand.',
          ],
          agent: [
            'The server is briefly down. Saving progress at #147.',
            'Waiting a moment before retrying #148.',
            'Provider is back. Resuming from #148.',
            'All 200 processed. Nothing lost.',
          ],
          scriptedOutcome: 'All 200 undone · redo by hand',
          agentOutcome: 'All 200 done, nothing lost',
        },
      ],
      v1: {
        artLabel: 'Stylised: one customer message forks into two conversations on one clock, a scripted bot on the left and an agent on the right',
        scriptedMode: 'follows a script',
        agentMode: 'understands the ask',
        clock: 'one clock',
        resolved: 'Resolved',
        unresolved: 'Not resolved',
        rating: 'Customer rating: {n} of 5',
      },
    },
    layers: {
      eyebrow: 'How It\'s Built',
      heading: 'Built to',
      headingGradient: 'grow',
      headingTrailing: ' with you',
      stylised: 'Stylised',
      names: { run: 'Run', coordinate: 'Coordinate', design: 'Design', monitor: 'Monitor' },
      v2: {
        lede: 'Start with one helper. A year later, run forty. Same computer, same four layers, nothing new to set up.',
        artLabel: 'Stylised growth scene: agents multiply above one laptop, from a single helper on day one to a fleet of forty after a year, while the laptop underneath stays the same.',
        scrubLabel: 'How far you have grown',
        play: 'Play',
        pause: 'Pause',
        agent: 'agent',
        agents: 'agents',
        sameLaptop: 'Same laptop. No servers.',
        ledgerLabel: 'What carries it',
        prompt: 'Draft the weekly report',
        healed: 'healed',
        stops: [
          { when: 'Day 1', what: 'One helper' },
          { when: 'Week 2', what: 'A chain' },
          { when: 'Month 3', what: 'A team' },
          { when: 'Year 1', what: 'A fleet' },
        ],
        layerLines: {
          run: 'Runs on your computer',
          coordinate: 'One event starts the next',
          design: 'Agents from plain words',
          monitor: 'Watches and heals itself',
        },
      },
    },
    events: {
      heading: 'Agents that',
      headingGradient: 'talk to each other',
      description: 'Your agents share what they finish through one hub. When one is done, the next one starts on its own, with no hand-off from you.',
      v1: {
        illustration: 'Stylised diagram: connected tools send messages into one hub, which passes each one on to the tool or agent that needs it',
        tabsLabel: 'Message hub view',
        tabLive: 'Live connections',
        tabLiveHint: 'who talks to whom',
        tabLanes: 'Performance view',
        tabLanesHint: 'speed and backlog',
        hub: 'Message hub',
        inFlight: 'being sent',
        waiting: 'waiting',
        typical: 'typical delivery',
        perSecond: 'msgs/s',
        delivery: 'delivery',
        backlog: 'waiting',
        buildFlow: 'Try it yourself: build a flow',
        routes: {
          'gmail-jira': 'New email → ticket filed',
          'slack-drive': 'Slack thread → summary saved',
          'github-figma': 'Pull request → design check',
          'calendar-stripe': 'Meeting ends → invoice sent',
        },
      },
    },
  },
  mobileLanding: {
    metaTitle: 'Design AI agents, run them on your computer',
    metaDescription: 'Personas is a free desktop app for designing AI agents in plain words and running them on your own computer. See how it works, then send the link to your computer.',
    brand: 'Personas',
    brandHome: 'Personas, back to the start',
    railLabel: 'Chapters',
    back: 'Back',
    chapters: ['Intro', 'Use cases', 'Athena', 'Free', 'Questions', 'Get it'],
    chapterLabel: 'Chapter {n}: {name}',
    illustrationTag: 'Stylized illustration',
    hero: {
      kicker: 'Free desktop app for AI agents',
      line1: 'One event in.',
      line2a: 'A whole team',
      line2b: 'on it.',
      sub: "Describe an AI agent in plain words. It runs on your own computer, and it's free.",
      artLabel: 'Animated illustration: events fall onto a honeycomb of AI agents, ripple through a team of cells, and rise again as finished work.',
      pickLabel: 'Pick an event and watch the team work',
      events: [
        { ev: 'Invoice in', done: 'Booked' },
        { ev: 'New lead', done: 'Qualified' },
        { ev: 'Build failed', done: 'Fixed' },
      ],
      trust: 'Free. No account. Runs on your computer.',
    },
    useCases: {
      title: 'One persona, many tools.',
      lede: 'A persona is one agent with its own name, memory and tools.',
      needs: ['Write to a client', 'Keep meeting notes', 'Book the follow-up', 'Track the tasks', 'Review the code', 'Chase a failed payment'],
      reelLabel: 'Tool reel: each job lands on the right tool',
      tapHint: 'Tap for its jobs',
      openJobs: 'Open the {tool} jobs',
      driveShort: 'Drive',
      personaName: 'Chief of staff',
      personaLine: 'Same name, same icon, same color through every tool.',
      jobsUnit: 'jobs',
      prev: 'Previous job',
      next: 'Next job',
      replay: 'Replay this job',
      status: 'Job {n} of 6: {need}. Picked {tool} out of 9.',
      sheetLabel: 'Tool jobs',
      adds: '{tool} adds 3 jobs to Chief of staff',
      hop: 'Hop to another tool',
    },
    athena: {
      title: 'Meet Athena, always on.',
      sub: 'A glowing companion that floats on your computer. Hold it to talk. It remembers how you work, and it reaches out before you ask.',
      lensLabel: 'Athena. Press and hold to talk (a demo: this page uses no microphone)',
      portraitAlt: 'Athena, the Personas companion',
      note: 'Press and hold her portrait to talk. A demo: this page uses no microphone.',
      caps: {
        always: { label: 'Always on', blurb: 'Her animated face is the interface. Drag her anywhere; she survives restarts and quietly pauses when you look away.', line: "I'm right here whenever you need me." },
        voice: { label: 'Hold to talk', blurb: 'Press and hold to speak: voice in, voice out. It runs on your computer with local Whisper, so no chat window is needed.', line: "Hold to talk. I'm listening." },
        memory: { label: 'Remembers', blurb: 'She keeps a long-term memory of your goals and how you work. You are the editor: she never overwrites, and every change is yours to approve.', line: 'I remember your goals and how you work.' },
        proactive: { label: 'Reaches out first', blurb: 'She surfaces what needs you, like a goal due soon or runs that failed overnight, and can even schedule her own check-ins.', line: 'Heads up: 3 runs failed overnight.' },
      },
    },
    pricing: {
      title: 'Personas is free.',
      sub: 'No account, no license key. The app and its open-source code cost nothing. You only pay for your own Claude Pro or Max plan.',
      beats: ['Run starts', 'On your plan', 'Claude works', 'No bill from Personas'],
      artLabel: 'An agent run leaves Personas on your computer, passes the Claude Code CLI and reaches Claude at Anthropic. Personas is tagged $0 with an MIT license; the only payment line runs from your Claude Pro or Max plan to Anthropic.',
      replay: 'Replay',
      computer: 'Your computer',
      zero: '$0',
      personas: 'Personas',
      license: 'MIT license',
      cli: 'Claude Code',
      cliSub: 'CLI',
      anthropic: 'Anthropic',
      claude: 'Claude',
      planLines: ['Your Claude', 'Pro or Max', 'plan'],
      onlyBill: 'The only bill',
    },
    faq: {
      title: 'Questions, answered.',
      tiles: ['What is Claude Code, and why do I need it?', 'Does Personas collect usage data?', 'Is Personas free?', 'Is there a limit on agents?'],
      sheetLabel: 'Answer',
      index: 'Question {n} of {total}',
      prev: 'Previous',
      next: 'Next',
    },
    cta: {
      title: 'Take it to your computer.',
      sub: "Personas is a desktop app, so this phone can't install it. Send yourself the link and finish in three steps.",
      artLabel: 'Stylized illustration: a phone sends a packet of light, the download link, to a computer.',
      platformsLabel: 'The computer you will install on',
      emailLabel: 'Your email',
      emailPlaceholder: 'you@example.com',
      hintWin: 'Windows has a free installer, about 12 MB. Send the link to yourself, then open it on your computer.',
      hintMac: 'macOS is on a waitlist for now. Leave your email and we will tell you when it is ready.',
      hintLin: 'Linux is on a waitlist for now. Leave your email and we will tell you when it is ready.',
      copyLink: 'Copy link',
      reminder: 'Add a reminder',
      reminderLabel: 'Download a calendar reminder (.ics) to install Personas on your computer',
      steps: ['Install', 'Connect Claude Code', 'Launch your first agent'],
      fine: 'Requires Claude Code. No signup, no credit card.',
      go: 'Get it on your computer',
      goLabel: 'Get it on your computer: jump to the last chapter',
      send: 'Send the link to my computer',
      sendSub: 'Share it or copy it, then open it there',
      shared: 'Link sent',
      copied: 'Link copied',
      sentSub: 'Open it on your computer',
      join: 'Join the {platform} waitlist',
      joinSub: 'No installer yet',
      joining: 'Joining...',
      joined: "You're on the {platform} waitlist",
      alreadyJoined: 'You were already on the {platform} waitlist',
      toastCopied: 'Link copied. Open it on your computer.',
      toastShared: 'Sent. Open it on your computer.',
      manual: "Copying isn't allowed here. Copy this link by hand:",
      manualLabel: 'The link to open on your computer',
      reminderToast: 'Reminder downloaded. Open it to add it to your calendar.',
      reminderFail: "Couldn't create the reminder file here.",
      reminderTitle: 'Install Personas on my computer',
      reminderBody: 'Open {url} on your computer. Personas is free; it needs Claude Code and your own Claude Pro or Max plan.',
      shareTitle: 'Personas',
      shareText: 'A free desktop app for designing AI agents in plain words. Open this on your computer.',
    },
  },
  mobileLanding2: {
    meta: {
      title: 'Say it once, it works all day',
      description: 'Personas is a free desktop app: describe an AI agent in plain words and it works around the clock on your own computer.',
    },
    chrome: {
      chipAria: 'Back to the start of the day',
      chapters: ['Day one', 'Every tool', 'While you sleep', 'All day', 'Ask the dial', 'Tomorrow'],
      railLabel: 'Chapters of the day',
      rail: [
        'Day one, 09:00',
        'One persona, every tool, 09:30 to 17:00',
        'While you sleep, Athena, 22:00',
        'All day, free',
        'Ask the dial, questions',
        'Tomorrow 9:00, get it on your computer',
      ],
      stylized: 'Stylized day',
      scroll: 'Scroll',
      pillGo: 'Get it on your computer',
      pillRemind: 'Add a 9:00 reminder',
      themeLabel: 'Theme',
    },
    dial: {
      aria: 'Stylized 24-hour dial. On day one you spend a few minutes at 09:00: install Personas, say what you want, connect Gmail and Slack. Around the dial your day goes on: meetings, lunch, focus time, home, sleep. On the inner ring your agent runs on its own: at 11:20 and 15:45 when new emails land, at 02:10 overnight, and at 08:00 it posts the morning digest to Slack.',
      fixedAria: 'Free all day: Personas on your computer, Claude Code, Anthropic',
      dayParts: { asleep: 'Asleep', coffee: 'Coffee', meet: 'Meetings', lunch: 'Lunch', focus: 'Focus time', home: 'Home' },
      bill: 'Your Claude plan',
    },
    hero: {
      label: 'Day one',
      lines: ['Say it once.', 'It works', 'all day.'],
      sub: 'Describe an AI agent in plain words. It runs on your own computer, free.',
      legend: 'Your few minutes, once, on day one.',
      stepAria: 'Step {n}: {name}',
      steps: [
        {
          name: 'Install Personas',
          body: [
            'A free installer for Windows, about 12 MB. macOS and Linux are on a waitlist.',
            'No account and no license key. Personas needs Claude Code on your own Claude Pro or Max plan.',
          ],
        },
        {
          name: 'Say what you want',
          body: [
            'Describe an AI agent in plain words. A persona is one agent with its own name, memory and tools.',
            'It keeps that name, icon and color, and you can add tools to it whenever you like.',
          ],
        },
        {
          name: 'Connect Gmail and Slack',
          body: ['Pick the tools it may use. Gmail and Slack first; GitHub, Google Drive, Jira, Notion, Stripe and more when you want them.'],
        },
      ],
    },
    tools: {
      label: 'One persona, every tool',
      lines: ['One persona.', 'Every tool.'],
      personaAria: 'Chief of staff: keeps your inbox, channels, repos and calendar moving. Open details.',
      personaTitle: '{tool} adds 3 jobs',
      personaSub: 'to Chief of staff: same name, icon and color',
      jobsAria: 'Jobs the persona does in this tool',
      shift: '{time} shift',
      beadAria: '{tool}, {time} shift. Jump to it.',
      items: {
        gmail: {
          name: 'Gmail',
          jobs: [
            { title: 'Inbox triage', body: 'Labels, prioritizes and drafts replies for inbound email.' },
            { title: 'Follow-up reminders', chip: 'Follow-ups', body: 'Spots unanswered threads and sends gentle follow-ups.' },
            { title: 'Meeting prep', body: 'Reads upcoming invites, pulls the threads, summarizes context.' },
          ],
        },
        slack: {
          name: 'Slack',
          jobs: [
            { title: 'Channel summarizer', body: 'Digests long channels into a morning summary for you.' },
            { title: 'Standup collector', body: 'Asks each teammate for status and compiles one standup post.' },
            { title: 'Alert router', body: 'Triages incoming alerts and escalates to the right channel.' },
          ],
        },
        github: {
          name: 'GitHub',
          jobs: [
            { title: 'PR reviewer', body: 'Reviews pull requests for bugs, style and missing tests.' },
            { title: 'Issue groomer', body: 'Labels stale issues, asks for more info, suggests duplicates.' },
            { title: 'Release notes', body: 'Writes changelog entries from merged PRs, grouped by impact.' },
          ],
        },
        drive: {
          name: 'Google Drive',
          jobs: [
            { title: 'Doc organizer', body: 'Files documents into folders by content, project and owner.' },
            { title: 'Permissions auditor', body: 'Weekly scan of shared files: flags over-shared docs.' },
            { title: 'Content indexer', body: 'Builds a searchable knowledge base from scattered documents.' },
          ],
        },
        jira: {
          name: 'Jira',
          jobs: [
            { title: 'Sprint planner', body: "Reads velocity history and suggests next sprint's allocation." },
            { title: 'Blocker detector', body: 'Watches ticket dependencies and alerts on a stuck critical path.' },
            { title: 'Status syncer', body: 'Keeps Jira tickets in sync with GitHub PRs.' },
          ],
        },
        notion: {
          name: 'Notion',
          jobs: [
            { title: 'Meeting notes', body: 'Transcribes recordings, extracts action items, links the pages.' },
            { title: 'Wiki gardener', body: 'Finds outdated docs, suggests updates, archives unused pages.' },
            { title: 'Template filler', body: 'Fills project brief templates from intake form responses.' },
          ],
        },
        stripe: {
          name: 'Stripe',
          jobs: [
            { title: 'Payment recovery', body: 'Emails customers with failed charges: retry links, other methods.' },
            { title: 'Revenue alerting', body: 'Watches MRR changes and tells Slack when churn spikes or upgrades surge.' },
            { title: 'Invoice reconciler', body: 'Matches Stripe payouts against your accounting and flags gaps.' },
          ],
        },
      },
    },
    athena: {
      label: 'While you sleep, Athena keeps watch',
      lines: ['While you sleep,', 'she keeps watch.'],
      sub: 'Athena is a companion that floats on your desktop: hold it to talk, it remembers how you work, and it reaches out first.',
      imgAlt: 'Athena, the Personas companion: a luminous portrait with a glowing heart',
      momsAria: 'What Athena does',
      momTime: '{time} · Athena',
      momAria: '{time}, {name}',
      bubble: 'Heads up: 3 runs failed overnight.',
      moments: [
        {
          name: 'Always on, never in the way',
          body: 'A floating companion lives on your desktop, and her animated face is the interface. Drag it anywhere; it survives restarts and quietly pauses when you look away.',
          line: "I'm right here whenever you need me.",
        },
        {
          name: 'Hold to talk',
          body: 'Press and hold to speak: voice in, voice out. Runs on-device with local Whisper, or in your browser. No chat window required.',
          line: "Hold to talk, I'm listening.",
        },
        {
          name: 'Remembers what matters',
          body: "Athena keeps a long-term memory of your identity, goals, and how you work, and you're the editor. She never overwrites; every change is yours to approve.",
          line: 'I remember your goals and how you work.',
        },
        {
          name: 'Reaches out first',
          body: 'She surfaces what needs you (a goal due soon, an aging backlog, runs that failed overnight) and can even schedule her own check-ins.',
          line: 'Heads up: 3 runs failed overnight.',
        },
      ],
    },
    price: {
      label: 'All day, free',
      lines: ['All day.', 'Free.'],
      zero: '$0',
      sub: 'No account, no license key. You only pay for your own Claude plan.',
      nodesAria: 'Where a run goes',
      beats: ['Run starts', 'On your plan', 'Claude works', 'No bill from Personas'],
      nodeAria: '{name}. Open details.',
      nodes: [
        {
          name: 'Your computer',
          short: 'Personas, $0',
          body: [
            'Personas runs here, on your computer: the app, its MIT-licensed source and every feature are free.',
            'No account and no license key. Your agents, credentials and run history stay on this machine.',
          ],
        },
        {
          name: 'Claude Code',
          short: 'Runs the agent',
          body: [
            'Claude Code is the command-line tool that runs your agents on your own Claude Pro or Max plan.',
            'Personas hands the run to it. You need Claude Code installed before you launch Personas.',
          ],
        },
        {
          name: 'Anthropic',
          short: "Your plan's bill",
          body: [
            'Claude does the work at Anthropic, and Anthropic bills your Claude Pro or Max plan.',
            'That is the only bill. Personas never touches it. Your prompts go to the AI provider you run, which is Claude via Anthropic.',
          ],
        },
      ],
    },
    runs: {
      aria: '{time}, {title}. Open details.',
      kicker: '{time} · {trigger} · On your PC',
      items: [
        { title: 'Client email flagged in Slack', trigger: 'New email', body: ['A new email lands at 11:20. The agent reads it, sees it is from a client, and flags it in Slack.', 'You did nothing. It runs on your PC.'] },
        { title: 'Invoice summarized in Slack', trigger: 'New email', body: ['An invoice arrives by email at 15:45. The agent summarizes it and posts the summary in Slack.', 'It runs on your PC.'] },
        { title: 'Overnight email queued for the digest', trigger: 'New email', body: ['While you sleep, an email arrives at 02:10. The agent queues it for the morning digest.', 'Nothing needs you yet. It runs on your PC.'] },
        { title: 'Morning digest: 6 highlights posted', trigger: 'Schedule', body: ['On a schedule, at 08:00, the agent posts the morning digest to Slack: six highlights.', 'It runs on your PC.'] },
      ],
    },
    faq: {
      kick: 'Questions',
      lines: ['Ask', 'the dial.'],
      labels: ['Claude Code', 'Telemetry', 'Free?', 'Limits'],
      of: 'of {n}',
      count: '{i} / {n}',
      prev: 'Previous question',
      next: 'Next question',
      dialAria: 'Question dial',
      items: [
        {
          q: 'What is Claude Code and why do I need it?',
          a: [
            "Claude Code is Anthropic's official command-line tool for working with Claude. Personas uses it under the hood to run your agents locally. It handles authentication, model access, and streaming responses.",
            "You'll need an active Claude Pro or Max subscription and Claude Code installed before launching Personas.",
          ],
        },
        {
          q: 'Does Personas collect any telemetry or usage data?',
          a: [
            'Only anonymous diagnostics. Release builds of the desktop app send error reports and anonymous usage signals (app sessions, which sections you open, key actions) to Sentry.',
            'IP addresses, emails, and usernames are stripped first, and your prompts, agent configurations, credentials, and execution logs are never included.',
            'You can turn off usage signals in Settings > Account.',
          ],
        },
        {
          q: 'Is Personas free?',
          a: [
            'Yes. The desktop app is free and open source, with unlimited local agents.',
            'You need your own Claude subscription, and we never touch your Anthropic bill. Think of Personas as the conductor, and Claude as the engine.',
          ],
        },
        { q: 'Are there any limits on the number of agents?', a: ['No. Create as many agents as you want.'] },
      ],
    },
    cta: {
      kick: 'One last thing',
      lines: ['Tomorrow, 9:00,', 'at your computer.'],
      sub: 'A phone cannot install Personas, so book it. Three steps, a few minutes, once.',
      faces: ['Install', 'Connect Claude Code', 'Launch your first agent'],
      remind: 'Put 9:00 in my calendar',
      remindFine: 'Saves a calendar file for the next 9:00, with the link and the three steps. Nothing is uploaded.',
      platsAria: 'Your computer',
      plats: {
        windows: { name: 'Windows', note: 'Installer, about 12 MB' },
        macos: { name: 'macOS', note: 'Waitlist' },
        linux: { name: 'Linux', note: 'Waitlist' },
      },
      sendTitle: 'Send the link to your computer',
      sendNote: 'Share it to yourself, or copy it, and open it on your PC to download the installer.',
      copy: 'Copy link',
      share: 'Share',
      manual: 'Copy this link by hand and open it on your computer:',
      waitlistTitle: 'Join the {platform} waitlist',
      waitlistNote: 'One email when Personas for {platform} is ready. Nothing else.',
      emailLabel: 'Your email',
      emailPlaceholder: 'you@example.com',
      join: 'Join waitlist',
      joining: 'Joining...',
      joined: "You're on the {platform} waitlist.",
      already: 'That address is already on the {platform} waitlist.',
      need: 'Requires Claude Code and your own Claude Pro or Max plan.',
    },
    share: {
      title: 'Personas',
      text: 'Install Personas on my computer',
    },
    toast: {
      copied: 'Link copied',
      shared: 'Link shared',
      reminder: 'Reminder saved for {day}, 9:00',
      reminderFailed: 'Could not create the calendar file here',
    },
    ics: {
      title: 'Install Personas on my computer',
      description: 'Install Personas (free) on your computer: {url}\n\n1. Install Personas (Windows installer, about 12 MB)\n2. Connect Claude Code\n3. Launch your first agent\n\nNeeds Claude Code on your own Claude Pro or Max plan.',
      file: 'install-personas-9am.ics',
    },
    card: {
      back: 'Back to the dial',
      note: 'Stylized day: the times are an illustration, not a product claim.',
      jobKicker: '{tool} · {time} shift',
      jobExtra: 'One more job for Chief of staff. Same name, same icon, same color: connecting {tool} only adds jobs.',
      stepKicker: '{time} · Your few minutes, once',
      momentNote: 'Athena is a companion that floats on your desktop. Her portrait is the only real product image on this page.',
      nodeKicker: 'Where a run goes · {n} of 3',
      nodeNote: 'Stylized illustration of where a run goes. Personas is free: the only bill is your own Claude Pro or Max plan, paid to Anthropic.',
      persona: {
        kicker: 'One persona',
        title: 'Chief of staff',
        body: [
          'Keeps your inbox, channels, repos and calendar moving.',
          'A persona is one agent with its own name, memory and tools. This one keeps the same name, the same icon and the same color through every tool. Connecting a tool only adds jobs to this one persona.',
        ],
      },
    },
    footer: {
      facts: 'Personas is free and open source (MIT), with no account and no license key. Agents, credentials and run history stay on your computer; prompts go to the AI provider you run, Claude via Anthropic. The app sends minimal, anonymous error and usage signals, and you can switch usage signals off in Settings.',
      stylized: 'The clock, its times and the day around it are a stylized illustration, not a product claim. Athena\'s portrait is the only real product image on this page.',
    },
  },
  mobile: {
    personas: {
      title: 'Your agents',
      loading: 'Loading your agents...',
      empty: 'No agents yet. Create one in Personas on your computer.',
      error: 'Couldn\'t load your agents.',
      retry: 'Try again',
      active: 'Active',
      paused: 'Paused',
      pause: 'Pause',
      resume: 'Resume',
      pauseLabel: 'Pause {name}',
      resumeLabel: 'Resume {name}',
      demoNote: 'Demo: a simulated computer answers these commands.',
    },
    reach: {
      offlineTitle: 'Personas isn\'t running on {device}',
      offlineBody: 'Last seen {ago}. Open it to manage your agents from here.',
      yourComputer: 'your computer',
      neverTitle: 'Connect your computer',
      neverBody: 'Install Personas on your computer and turn on sync in its Settings to manage your agents from this phone.',
      demoTitle: 'Run your own agents',
      demoBody: 'Personas runs on your computer. Send yourself the link and install it there.',
      downloadCta: 'Send the download to my computer',
      linkCopied: 'Link copied. Open it on your computer.',
      shareFailed: 'Couldn\'t share. Open {url} on your computer.',
      unpairedTitle: 'Pair this phone',
      unpairedBody: 'Your computer is online, but this phone isn\'t paired yet. Pair it once to pause and resume agents from here.',
      unpairedCta: 'How to pair',
    },
    command: {
      pending: 'Sending...',
      executing: 'Working...',
      completed: 'Done',
      failed: 'Failed: {reason}',
      rejected: 'Refused: {reason}',
      expired: 'Your computer didn\'t answer',
    },
    pairing: {
      title: 'Phone control',
      body: 'Pair this browser with Personas on your computer to pause and resume your agents from here.',
      howTo: 'On your computer, open Settings, then Cloud sync, then Pair a phone, and scan the code with this phone.',
      pairing: 'Pairing...',
      pending: 'Waiting for your computer to confirm...',
      active: 'This phone is paired.',
      refused: 'Your computer refused this pairing. Start again from your computer.',
      revoked: 'This phone is no longer paired.',
      unsupported: 'This browser can\'t hold a secure key. Try a current version of Safari or Chrome.',
      error: 'Pairing didn\'t work: {reason}',
      noDevice: 'No synced computer found. Turn on sync in Personas on your computer first.',
      unpair: 'Unpair this phone',
    },
  },
  // END pending-translation namespaces
};