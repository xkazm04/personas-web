/**
 * Pending-translation copy: the `athenaSections` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `athenaSectionsCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.athenaSections`. See docs/features/platform/internationalization.md.
 */

export interface AthenaSectionsCopy {
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
}

export const athenaSectionsCopy: AthenaSectionsCopy = {
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
};
