/**
 * Pending-translation copy: the `pluginsExtra` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `pluginsExtraCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.pluginsExtra`. See docs/features/platform/internationalization.md.
 */

export interface PluginsExtraCopy {
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
}

export const pluginsExtraCopy: PluginsExtraCopy = {
  variantBlurbs: {
    athenaFleet: 'A grid of CLIs under Athena\'s watch: her orb glides to whatever blocks them and answers on-policy',
    brain: 'Knowledge graph view: your notes, connected and alive',
  },
  fleet: {
    title: 'Agent fleet',
    subtitle: '16 CLIs \u00b7 Athena on watch',
    blocked: 'Blocked',
    working: 'Working',
    done: 'Done',
    autonomous: 'autonomous',
    statusSpawning: 'spawning {spawned}/16\u2026',
    statusBlocked: '{needs} blocked: Athena dispatching',
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
      quarantine: '\u2713 approved: quarantine 3',
      focusRing: '\u2713 approved: focus-ring fix',
      release: '\u26a1 nudged: release resumed',
      budget: '\u2713 answered: keep 2.5s budget',
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
};
