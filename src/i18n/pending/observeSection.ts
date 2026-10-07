/**
 * Pending-translation copy: the `observeSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `observeSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.observeSection`. See docs/features/platform/internationalization.md.
 */

export interface ObserveSectionCopy {
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
}

export const observeSectionCopy: ObserveSectionCopy = {
  heading: 'See everything,',
  headingGradient: 'miss nothing',
  description: 'Every run, message and event, live in one dashboard.',
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
};
