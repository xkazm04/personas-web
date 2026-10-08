/**
 * Pending-translation copy: the `playgroundSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `playgroundSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.playgroundSection`. See docs/features/platform/internationalization.md.
 */

export interface PlaygroundSectionCopy {
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
}

export const playgroundSectionCopy: PlaygroundSectionCopy = {
  heading: 'The Agent',
  headingGradient: 'Mind',
  description: 'Watch the agent\'s thought process unfold in real time. Pick a prompt and see how it parses, plans, and executes.',
  reset: 'Reset',
  splitView: 'Split View',
  executing: 'Executing...',
  executionComplete: 'execution complete',
  srRunning: 'Running simulation',
  srDone: 'Execution complete, results available',
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
      messages: 'Draft reply to sarah@acme.com: \u201cThanks for the update, I\u2019ll review by Friday.\u201d',
      humanReview: 'Approve billing dispute reply before sending to legal@acme.com',
      memories: 'legal@acme.com \u2192 always priority sender',
    },
    pr: {
      label: 'Review this PR',
      prompt: 'Review PR #142 for bugs, style issues, and missing tests',
      messages: 'Inline comment on auth.ts:42 says \u201cMissing null check on user.session\u201d',
      humanReview: 'Approve suggested refactor of loginFlow() before merge',
      memories: 'Team prefers early-return over nested if-else',
    },
    slack: {
      label: 'Summarize Slack',
      prompt: 'Summarize #engineering and #product channels from the last 24h',
      messages: 'Digest posted to #my-digest: \u201c3 decisions, 2 blockers, 1 release\u201d',
      humanReview: 'Confirm which blocker to escalate to @oncall',
      memories: '\u201cRelease cut\u201d is a recurring topic on Thursdays',
    },
    schedule: {
      label: 'Optimize my schedule',
      prompt: 'Analyze next week\'s calendar and block focus time',
      messages: 'Added Tue 10\u201312 as \u201cDeep work: do not schedule\u201d',
      humanReview: 'Approve moving 1:1 with Maya from Fri 2pm \u2192 Fri 4pm',
      memories: 'You prefer mornings for deep work, afternoons for calls',
    },
  },
};
