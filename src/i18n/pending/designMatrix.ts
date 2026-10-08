/**
 * Pending-translation copy: the `designMatrix` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `designMatrixCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.designMatrix`. See docs/features/platform/internationalization.md.
 */

export interface DesignMatrixCopy {
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
}

export const designMatrixCopy: DesignMatrixCopy = {
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
};
