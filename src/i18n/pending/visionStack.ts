/**
 * Pending-translation copy: the `visionStack` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `visionStackCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.visionStack`. See docs/features/platform/internationalization.md.
 */

export interface VisionStackCopy {
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
}

export const visionStackCopy: VisionStackCopy = {
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
      description: 'Eight trigger types wake personas in parallel: schedule, webhook, file watcher, clipboard, event, and more.',
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
      description: 'Bring your own model. Run personas against Claude or local Ollama: your machine, your choice.',
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
      description: 'Self-healing execution, human review queues, and persistent agent memory. Watch every run in real time.',
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
};
