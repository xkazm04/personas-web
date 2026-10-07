/**
 * Pending-translation copy: the `orchestrationSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `orchestrationSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.orchestrationSection`. See docs/features/platform/internationalization.md.
 */

export interface OrchestrationSectionCopy {
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
}

export const orchestrationSectionCopy: OrchestrationSectionCopy = {
  heading: 'Orchestration',
  headingGradient: 'hub',
  description: 'Ten trigger types, one persona hub. Any signal can wake any agent, or launch one yourself. Pick a trigger to see it fire.',
  ringLabel: 'Trigger types',
  trigger: 'Trigger',
  firesWhen: 'Fires when',
  triggers: {
    schedule: {
      label: 'Schedule',
      description: 'Runs on a time-based schedule: a cron expression, a fixed interval, or a specific calendar time.',
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
      description: 'Fires when the OS clipboard receives content matching a pattern: URLs, tokens, or snippets.',
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
      description: 'Fires when an upstream persona finishes: one agent\'s output becomes the next agent\'s input.',
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
      description: 'Run an agent on demand, straight from the dashboard, the CLI, or a hotkey. No automation required.',
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
};
