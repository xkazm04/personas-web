/**
 * Pending-translation copy: the `getStartedSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `getStartedSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.getStartedSection`. See docs/features/platform/internationalization.md.
 */

export interface GetStartedSectionCopy {
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
}

export const getStartedSectionCopy: GetStartedSectionCopy = {
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
};
