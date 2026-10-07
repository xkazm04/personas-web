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
};
