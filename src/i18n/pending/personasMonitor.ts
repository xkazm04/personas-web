/**
 * Pending-translation copy: the `personasMonitor` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `personasMonitorCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.personasMonitor`. See docs/features/platform/internationalization.md.
 */

export interface PersonasMonitorCopy {
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
    of: string;
    emptyFiltered: string;
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
      pause: string;
      resume: string;
      run: string;
      cancel: string;
      pauseAll: string;
      pauseAllStop: string;
      resumeAll: string;
      publish: string;
      revise: string;
      answerText: string;
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
    host: {
      label: string;
      online: string;
      offline: string;
      synced: string;
      justNow: string;
      secondsAgo: string;
      latency: string;
      latencyTitle: string;
      lastSeen: string;
      offlineNote: string;
      offlineBanner: string;
      asOf: string;
      slots: string;
      slotsValue: string;
      slotsAria: string;
      queued: string;
      queuedNone: string;
      paused: string;
      cpu: string;
      memory: string;
      memValue: string;
      notReported: string;
    };
    cmd: {
      pause: string;
      resume: string;
      run: string;
      cancel: string;
      pauseAll: string;
      resumeAll: string;
      controls: string;
      fleetControls: string;
      fleetCallsign: string;
      hints: {
        pause: string;
        resume: string;
        run: string;
        cancel: string;
        pauseAll: string;
        resumeAll: string;
      };
      status: {
        held: string;
        sending: string;
        acked: string;
        done: string;
      };
      pending: string;
      doing: {
        pause: string;
        resume: string;
        run: string;
        cancel: string;
        retry: string;
        answer: string;
        read: string;
        approve: string;
        sendback: string;
        publish: string;
        revise: string;
        pauseAll: string;
        resumeAll: string;
      };
      pausingShort: string;
      offline: string;
      pausedRunning: string;
      fleetPaused: string;
      fleetPausedNote: string;
      undo: string;
      undone: string;
      toasts: {
        pause: string;
        resume: string;
        run: string;
        cancel: string;
        pauseAll: string;
        pauseAllStop: string;
        resumeAll: string;
        publish: string;
        revise: string;
      };
      decided: {
        approve: string;
        sendback: string;
      };
      confirm: {
        title: string;
        lede: string;
        running: string;
        queued: string;
        triggers: string;
        alreadyOff: string;
        stopNow: string;
        stopping: string;
        confirm: string;
        confirmStop: string;
        keep: string;
      };
    };
    console: {
      tabs: {
        log: string;
        runs: string;
        events: string;
      };
      tabsLabel: string;
      logCaption: string;
      logEmpty: string;
      logFailed: string;
      logPaused: string;
      logLabel: string;
      runsCaption: string;
      cols: {
        result: string;
        ended: string;
        duration: string;
        cost: string;
      };
      lastRun: string;
      lastRunLine: string;
      eventsEmpty: string;
      prev: string;
      next: string;
      stepHint: string;
      kpis: string;
      schedule: string;
      everyMin: string;
      everyHour: string;
      everyHours: string;
      triggerOnly: string;
      nextAt: string;
      trigger: string;
      pausedPlan: string;
    };
    find: {
      placeholder: string;
      label: string;
      matchesOne: string;
      matches: string;
      none: string;
      clear: string;
      pilesLabel: string;
      pileHint: string;
      enterHint: string;
      shortcuts: string;
      bayMatches: string;
    };
    palette: {
      label: string;
      open: string;
      placeholder: string;
      groups: {
        actions: string;
        agents: string;
        teams: string;
        views: string;
      };
      empty: string;
      footer: string;
      agentVerb: string;
      teamMeta: string;
      actions: {
        triage: string;
        next: string;
        pauseAll: string;
        resumeAll: string;
        showNeeds: string;
        showWorking: string;
        showOff: string;
        clear: string;
        activity: string;
        city: string;
        scale: string;
      };
    };
    triage: {
      start: string;
      startHint: string;
      title: string;
      label: string;
      progress: string;
      decided: string;
      skipped: string;
      exit: string;
      upNext: string;
      nothingNext: string;
      kinds: {
        failed: string;
        input: string;
        draft: string;
        review: string;
      };
      since: string;
      skip: string;
      console: string;
      pauseAgent: string;
      approve: string;
      sendBack: string;
      publish: string;
      revise: string;
      retry: string;
      failedLog: string;
      draftNote: string;
      reviewNote: string;
      agentNote: string;
      agentNoteOne: string;
      doneTitle: string;
      allClear: string;
      doneStats: string;
      stillNeed: string;
      again: string;
      backToBoard: string;
      offline: string;
    };
    answer: {
      label: string;
      asks: string;
      placeholder: string;
      quickLabel: string;
      quick: {
        go: string;
        safe: string;
        hold: string;
        overseer: string;
      };
      send: string;
      sent: string;
    };
    list: {
      layoutLabel: string;
      field: string;
      list: string;
      fieldHint: string;
      listHint: string;
      label: string;
      cols: {
        agent: string;
        team: string;
        state: string;
        now: string;
        runs: string;
        success: string;
        cost: string;
        last12: string;
      };
      sortBy: string;
      attentionSort: string;
      selectAll: string;
      selectRow: string;
      selected: string;
      clearSel: string;
      bulkLabel: string;
      bulk: {
        pause: string;
        resume: string;
        run: string;
        cancel: string;
      };
      bulkToasts: {
        pause: string;
        resume: string;
        run: string;
        cancel: string;
      };
      teamFilter: string;
      none: string;
    };
    activity: {
      toggle: string;
      toggleHint: string;
      label: string;
      filtersLabel: string;
      filters: {
        all: string;
        attention: string;
        decisions: string;
        messages: string;
        runs: string;
        commands: string;
      };
      empty: string;
      commandsEmpty: string;
      commandsNote: string;
      cmdStatus: {
        held: string;
        sending: string;
        acked: string;
        done: string;
        undone: string;
      };
      fleetTarget: string;
      alertsOn: string;
      alertsOff: string;
      alertsHint: string;
      justIn: string;
      openAgent: string;
      dismiss: string;
      close: string;
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
}

export const personasMonitorCopy: PersonasMonitorCopy = {
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
    of: '{n} of {total}',
    emptyFiltered: 'None of the agents you found needs you.',
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
      pause: 'You paused it',
      resume: 'You resumed it',
      run: 'You started a run',
      cancel: 'You cancelled the run',
      pauseAll: 'You paused {n} agents',
      pauseAllStop: 'You paused {n} agents and stopped {m} runs',
      resumeAll: 'You resumed {n} agents',
      publish: 'You approved the draft',
      revise: 'You sent the draft back to revise',
      answerText: 'You answered: “{text}”',
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
    host: {
      label: 'The computer your agents run on',
      online: 'Online',
      offline: 'Offline',
      synced: 'synced {ago}',
      justNow: 'just now',
      secondsAgo: '{n}s ago',
      latency: '{ms} ms',
      latencyTitle: 'Round trip of its last report',
      lastSeen: 'Last seen {ago}',
      offlineNote: 'Showing the last state it reported. Nothing you send will reach it until it is back.',
      offlineBanner: '{name} is offline, last seen {ago}. You are looking at the last state it reported.',
      asOf: 'as of {time} UTC',
      slots: 'Run slots',
      slotsValue: '{used} of {total}',
      slotsAria: '{used} of {total} run slots in use, {queued} queued, {paused} paused',
      queued: '{n} queued',
      queuedNone: 'Nothing queued',
      paused: '{n} paused',
      cpu: 'CPU',
      memory: 'Memory',
      memValue: '{used}/{total} GB',
      notReported: 'not reported',
    },
    cmd: {
      pause: 'Pause',
      resume: 'Resume',
      run: 'Run now',
      cancel: 'Cancel run',
      pauseAll: 'Pause all',
      resumeAll: 'Resume {n}',
      controls: 'Controls for {callsign}',
      fleetControls: 'Fleet controls',
      fleetCallsign: 'Fleet',
      hints: {
        pause: 'Stops new runs, schedules and triggers. A run in progress finishes.',
        resume: 'Lets it run again on its schedule and triggers',
        run: 'Start a run now. It queues if every slot is busy.',
        cancel: 'Stop the run in progress',
        pauseAll: 'Pause every agent on {host}',
        resumeAll: 'Resume the {n} agents Pause all switched off',
      },
      status: {
        held: 'Sends in a moment',
        sending: 'Sending to {host}',
        acked: '{host} is on it',
        done: 'Done',
      },
      pending: '{doing} · {status}',
      doing: {
        pause: 'Pausing',
        resume: 'Resuming',
        run: 'Starting a run',
        cancel: 'Cancelling the run',
        retry: 'Retrying',
        answer: 'Sending your answer',
        read: 'Marking read',
        approve: 'Approving',
        sendback: 'Sending back',
        publish: 'Approving the draft',
        revise: 'Sending the draft back',
        pauseAll: 'Pausing all',
        resumeAll: 'Resuming all',
      },
      pausingShort: 'Pausing',
      offline: '{host} is offline. Commands cannot reach it.',
      pausedRunning: 'Paused, finishing its current run',
      fleetPaused: 'Fleet paused',
      fleetPausedNote: '{n} switched off',
      undo: 'Undo',
      undone: 'Undone. Nothing was sent to {host}.',
      toasts: {
        pause: '{callsign}: pausing',
        resume: '{callsign}: resuming',
        run: '{callsign}: run requested',
        cancel: '{callsign}: cancelling the run',
        pauseAll: 'Pausing {n} agents on {host}',
        pauseAllStop: 'Pausing {n} agents and stopping {m} runs on {host}',
        resumeAll: 'Resuming {n} agents on {host}',
        publish: '{callsign}: draft approved',
        revise: '{callsign}: draft sent back to revise',
      },
      decided: {
        approve: 'Approved',
        sendback: 'Sent back',
      },
      confirm: {
        title: 'Pause every agent on {host}?',
        lede: 'Nothing new starts until you resume. You can resume them all in one click.',
        running: '{n} runs in progress finish first',
        queued: '{n} queued runs will not start',
        triggers: 'No schedule or trigger fires while paused',
        alreadyOff: '{n} agents are already off and stay off',
        stopNow: 'Also stop the {n} runs in progress now',
        stopping: '{n} runs in progress stop now',
        confirm: 'Pause {n} agents',
        confirmStop: 'Pause {n} and stop {m} runs',
        keep: 'Keep running',
      },
    },
    console: {
      tabs: {
        log: 'Live log',
        runs: 'Runs',
        events: 'Events',
      },
      tabsLabel: 'Agent activity',
      logCaption: 'Tool calls: stylised illustration',
      logEmpty: 'No run in progress. The log fills when the next run starts.',
      logFailed: 'timed out after 30 s, run failed',
      logPaused: 'paused, waiting for your answer',
      logLabel: 'Tool calls of the current run, oldest first',
      runsCaption: 'Last 12 runs, newest first',
      cols: {
        result: 'Result',
        ended: 'Ended',
        duration: 'Took',
        cost: 'Cost',
      },
      lastRun: 'Last run',
      lastRunLine: '{result} · took {duration} · {cost} · {ago}',
      eventsEmpty: 'Nothing logged for this agent yet.',
      prev: 'Previous agent',
      next: 'Next agent',
      stepHint: 'J and K step through agents',
      kpis: 'Today',
      schedule: 'What starts it',
      everyMin: 'Every {n} min',
      everyHour: 'Every hour',
      everyHours: 'Every {n} h',
      triggerOnly: 'No schedule, only its trigger',
      nextAt: 'next at {time} UTC',
      trigger: 'On {trigger}',
      pausedPlan: 'Paused: no schedule or trigger fires until you resume',
    },
    find: {
      placeholder: 'Find an agent',
      label: 'Find agents by callsign, name, team, task or state',
      matchesOne: '{n} match',
      matches: '{n} matches',
      none: 'No agent matches',
      clear: 'Clear the search and filters',
      pilesLabel: 'Show only these piles',
      pileHint: 'Show only agents that are {pile}',
      enterHint: 'Enter opens {callsign}',
      shortcuts: 'Keyboard shortcuts',
      bayMatches: '{m} of {n}',
    },
    palette: {
      label: 'Command palette',
      open: 'Commands',
      placeholder: 'Type a command, or find an agent or team',
      groups: {
        actions: 'Actions',
        agents: 'Agents',
        teams: 'Teams',
        views: 'View',
      },
      empty: 'Nothing matches “{q}”',
      footer: 'Enter runs · ↑ ↓ move · Esc closes · start with pause, resume, run or cancel to act on an agent',
      agentVerb: '{verb} {callsign} {name}',
      teamMeta: '{n} agents · {need} need you',
      actions: {
        triage: 'Start triage: every decision waiting on you, one at a time',
        next: 'Go to the next agent that needs you',
        pauseAll: 'Pause every agent on {host}',
        resumeAll: 'Resume the {n} agents Pause all switched off',
        showNeeds: 'Show only agents that need you',
        showWorking: 'Show only working agents',
        showOff: 'Show only agents that are off',
        clear: 'Clear search and filters',
        activity: 'Show or hide the activity log and the commands you sent',
        city: 'Switch to Night shift',
        scale: 'Show {n} agents',
      },
    },
    triage: {
      start: 'Triage',
      startHint: 'Work through everyone who needs you, one decision at a time (T)',
      title: 'Triage',
      label: 'Triage: decisions waiting on you, one at a time',
      progress: '{i} of {n}',
      decided: '{n} decided',
      skipped: '{n} skipped',
      exit: 'Done',
      upNext: 'Up next',
      nothingNext: 'Nothing after this one.',
      kinds: {
        failed: 'Run failed',
        input: 'Needs your answer',
        draft: 'Draft ready',
        review: 'Review',
      },
      since: 'waiting {age}',
      skip: 'Skip',
      console: 'Open console',
      pauseAgent: 'Pause agent',
      approve: 'Approve',
      sendBack: 'Send back',
      publish: 'Approve and publish',
      revise: 'Send back to revise',
      retry: 'Retry run',
      failedLog: 'How the run ended',
      draftNote: 'It publishes when you approve. Sending it back starts a revision run.',
      reviewNote: 'Approving lets it go ahead. Sending it back returns it with your note.',
      agentNote: '{n} more decisions waiting on this agent',
      agentNoteOne: '1 more decision waiting on this agent',
      doneTitle: 'Triage done',
      allClear: 'All clear. Nobody needs you right now.',
      doneStats: '{d} decided · {s} skipped',
      stillNeed: '{n} decisions still wait on you, including the ones you skipped and any that came in while you worked.',
      again: 'Go through the {n} left',
      backToBoard: 'Back to the board',
      offline: '{host} is offline. You can look, but decisions wait until it is back.',
    },
    answer: {
      label: 'Your answer to {callsign}',
      asks: 'It asks',
      placeholder: 'Type your answer. Enter sends, Shift+Enter adds a line.',
      quickLabel: 'Quick answers',
      quick: {
        go: 'Go ahead as proposed',
        safe: 'Use the safer option',
        hold: 'Hold until I have checked',
        overseer: 'Ask the Overseer to decide',
      },
      send: 'Send and resume',
      sent: 'Answer sent. The run resumes when {host} picks it up.',
    },
    list: {
      layoutLabel: 'Layout',
      field: 'Field',
      list: 'List',
      fieldHint: 'Every agent as a tile in its team\'s bay (L switches)',
      listHint: 'Every agent as a sortable row, with bulk actions (L switches)',
      label: 'All agents as a table',
      cols: {
        agent: 'Agent',
        team: 'Team',
        state: 'State',
        now: 'Now',
        runs: 'Runs today',
        success: 'Success',
        cost: 'Cost today',
        last12: 'Last 12 runs',
      },
      sortBy: 'Sort by {col}',
      attentionSort: 'Sort by who needs you, then what is working',
      selectAll: 'Select all {n} shown',
      selectRow: 'Select {callsign}',
      selected: '{n} selected',
      clearSel: 'Clear',
      bulkLabel: 'Actions for the selected agents',
      bulk: {
        pause: 'Pause {n}',
        resume: 'Resume {n}',
        run: 'Run {n} now',
        cancel: 'Cancel {n} runs',
      },
      bulkToasts: {
        pause: 'Pausing {n} agents on {host}',
        resume: 'Resuming {n} agents on {host}',
        run: 'Starting {n} runs on {host}',
        cancel: 'Cancelling {n} runs on {host}',
      },
      teamFilter: 'Show only {team}',
      none: 'No agent matches the search or filters.',
    },
    activity: {
      toggle: 'Activity',
      toggleHint: 'Show the activity log (E)',
      label: 'Activity log',
      filtersLabel: 'Show',
      filters: {
        all: 'All',
        attention: 'Needs you',
        decisions: 'Your decisions',
        messages: 'Messages',
        runs: 'Runs',
        commands: 'Commands',
      },
      empty: 'Nothing here yet.',
      commandsEmpty: 'You have not sent anything to {host} yet.',
      commandsNote: 'Everything you sent to {host} this session, newest first',
      cmdStatus: {
        held: 'Held for Undo',
        sending: 'Sending',
        acked: 'Received',
        done: 'Done',
        undone: 'Undone, never sent',
      },
      fleetTarget: 'every agent',
      alertsOn: 'Alerts on',
      alertsOff: 'Alerts off',
      alertsHint: 'Show a card when an agent newly needs you',
      justIn: 'Just in',
      openAgent: 'Open',
      dismiss: 'Dismiss',
      close: 'Close the activity log',
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
};
