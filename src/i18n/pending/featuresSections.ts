/**
 * Pending-translation copy: the `featuresSections` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `featuresSectionsCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.featuresSections`. See docs/features/platform/internationalization.md.
 */

export interface FeaturesSectionsCopy {
  design: {
    artLabel: string;
    persona: string;
    yourSentence: string;
    reading: string;
    ready: string;
    decided: string;
    replay: string;
    asks: string;
    suggested: string;
    sources: {
      said: string;
      asked: string;
      inferred: string;
    };
    keywords: {
      tasks: string;
      apps: string;
      review: string;
      memory: string;
    };
    v2: {
      lede: string;
      stylised: string;
      sheet: string;
      testRun: string;
    };
    v3: {
      lede: string;
      stylised: string;
    };
    revise: {
      change: string;
      notNeeded: string;
      routine: string;
      urgent: string;
      testRunTwo: string;
      rebuilt: string;
      short: { triggers: string[]; review: string[] };
    };
  };
  memory: {
    stylised: string;
    categories: { fact: string; preference: string; instruction: string; context: string; learned: string; constraint: string };
    v1: { artLabel: string; retries: string; noRetries: string; recalled: string };
    v2: {
      artLabel: string;
      tiers: {
        core: { name: string; note: string };
        active: { name: string; note: string };
        working: { name: string; note: string };
        archive: { name: string; note: string };
      };
      run: string;
      recall: string;
      learn: string;
      firstTry: string;
      retries: string;
      oneRetry: string;
      pick: string;
      memories: string;
    };
    v3: {
      artLabel: string;
      run: string;
      ofRuns: string;
      rough: string;
      smooth: string;
      legend: string;
      show: string;
      hint: string;
      examples: { fact: string; preference: string; instruction: string; context: string; learned: string; constraint: string };
    };
  };
  healing: {
    heading: string;
    headingGradient: string;
    stylised: string;
    overseerNote: string;
    retry: string;
    cases: Record<
      'rateLimit' | 'timeout' | 'overload' | 'setup' | 'login',
      { name: string; error: string; diagnosis: string; fix: string; result: string; note: string }
    >;
    stages: { detect: string; diagnose: string; fix: string; done: string; yours: string };
    v1: {
      lede: string;
      artLabel: string;
      title: string;
      casesLabel: string;
      schedule: string;
      agent: string;
      report: string;
      log: string;
      healthy: string;
      healed: string;
      stopped: string;
    };
    v2: {
      lede: string;
      artLabel: string;
      failures: string;
      diagnose: string;
      diagnoseSub: string;
      fixed: string;
      forYou: string;
      budget: string;
      logged: string;
    };
    v3: {
      lede: string;
      artLabel: string;
      camera: string;
      overview: string;
      another: string;
      runName: string;
      shots: { fails: string; why: string; fixes: string; stops: string; after: string; asks: string };
      steps: { read: string; summarise: string; save: string; post: string };
      backoff: string;
      timeLimit: string;
      resumeAt: string;
      noBlindRetries: string;
      issueTitle: string;
      noAlert: string;
      secs: string;
      mins: string;
      overseer: string;
      shotOf: string;
    };
  };
  models: {
    stylised: string;
    yourMachine: string;
    viaClaudeCode: string;
    traits: { haiku: string; sonnet: string; opus: string; ollama: string };
    agents: { codeReview: string; inbox: string; brief: string; support: string; journal: string };
    v1: { lede: string; artLabel: string; pick: string };
    v2: {
      lede: string;
      artLabel: string;
      choose: string;
      captions: { haiku: string; sonnet: string; opus: string; ollama: string };
    };
    v3: { lede: string; artLabel: string; agentsTitle: string; onThisPc: string; hint: string; swap: string };
  };
  observe: {
    stylised: string;
    v1: { lede: string; artLabel: string; now: string; secondsAgo: string; failed: string; filtered: string };
    v2: {
      lede: string;
      artLabel: string;
      today: string;
      runsToday: string;
      openRun: string;
      fleet: string;
      legend: { ok: string; failed: string; review: string };
      kinds: { trigger: string; model: string; tool: string; review: string; memory: string; retry: string };
      status: { ok: string; failed: string; retried: string; approved: string; alert: string; running: string; queued: string };
      stats: { duration: string; cost: string; tokens: string };
      timeByStep: string;
      position: string;
      hintFollow: string;
      hintPinned: string;
      runs: {
        pr: {
          id: string;
          steps: { opened: string; read: string; fetch: string; write: string; post: string; retry: string; approve: string; merge: string };
          notes: { opened: string; read: string; fetch: string; write: string; post: string; retry: string; approve: string; merge: string };
        };
        deploy: {
          id: string;
          steps: { check: string; deploys: string; errors: string; diagnose: string; commit: string; rollback: string; revert: string; notify: string };
          notes: { check: string; deploys: string; errors: string; diagnose: string; commit: string; rollback: string; revert: string; notify: string };
        };
        email: {
          id: string;
          steps: { received: string; classify: string; file: string; remember: string; notify: string; archive: string };
          notes: { received: string; classify: string; file: string; remember: string; notify: string; archive: string };
        };
      };
    };
    v3: {
      lede: string;
      artLabel: string;
      allAgents: string;
      printer: string;
      statement: { title: string; spend: string; runs: string; failures: string; approvals: string; byAgent: string };
      stamps: { failed: string; retried: string; approved: string; needsYou: string };
      lines: {
        reviewPr: string;
        sorted: string;
        checked: string;
        digest: string;
        spike: string;
        rollback: string;
        indexed: string;
        standup: string;
        drafted: string;
        post: string;
        repost: string;
        filed: string;
        merged: string;
        synced: string;
        actions: string;
        archived: string;
      };
    };
  };
  plugins: {
    more: string;
    stylised: string;
    taglines: { drive: string; twin: string };
    v1: { artLabel: string; reach: string };
    drive: {
      title: string;
      where: string;
      files: string;
      browse: string;
      folder: string;
      kept: string;
      statusLanding: string;
      statusUpdating: string;
      statusKept: string;
      survives: string;
      agents: { report: string; design: string; leads: string; video: string; notes: string };
    };
    twin: {
      you: string;
      intent: string;
      name: string;
      speaksAs: string;
      traits: { identity: string; tone: string; memory: string };
      recalled: string;
      recallFact: string;
      tracked: string;
      typing: string;
      sender: string;
      contact: string;
      alsoReaches: string;
      channels: {
        slack: { tone: string; message: string; reply: string };
        gmail: { tone: string; subject: string; message: string; signoff: string; reply: string };
        linkedin: { tone: string; message: string; reply: string };
      };
      statusListening: string;
      statusRecalling: string;
      statusMirroring: string;
      statusReplies: string;
    };
  };
}

export const featuresSectionsCopy: FeaturesSectionsCopy = {
  design: {
    artLabel: 'Stylised illustration: the sentence "Triage my Gmail inbox and draft replies for urgent emails" becomes a complete agent. Personas decides its task, apps (Gmail and Slack), schedule, human review, messages, memory, error handling and events, and asks only two questions: how often to run and whether to approve drafts first.',
    persona: 'Inbox Triage',
    yourSentence: 'Your sentence',
    reading: 'Reading your sentence',
    ready: 'Ready to deploy',
    decided: '{n}/{total} decided',
    replay: 'Replay',
    asks: 'Personas asks',
    suggested: 'suggested',
    sources: {
      said: 'From your words',
      asked: 'Asked you',
      inferred: 'Inferred',
    },
    keywords: {
      tasks: 'Triage',
      apps: 'Gmail',
      review: 'draft replies',
      memory: 'urgent',
    },
    v2: {
      lede: 'Write one sentence. Personas draws the whole agent from it and asks only where it needs you.',
      stylised: 'Stylised',
      sheet: 'Agent blueprint',
      testRun: 'Test run: one email, end to end',
    },
    v3: {
      lede: 'One sentence in. Eight decisions out, grown into one agent.',
      stylised: 'Stylised',
    },
    revise: {
      change: 'Change: {label}',
      notNeeded: 'Not needed',
      routine: 'Routine',
      urgent: 'Urgent',
      testRunTwo: 'Test run: one routine email, one urgent',
      rebuilt: 'Rebuilt with your answers: {triggers}, {review}.',
      short: { triggers: ['15 min', '1 hour', 'Webhook'], review: ['Auto', 'Approve', 'Urgent only'] },
    },
  },
  memory: {
    stylised: 'Stylised',
    categories: { fact: 'Fact', preference: 'Preference', instruction: 'Instruction', context: 'Context', learned: 'Learned', constraint: 'Constraint' },
    v1: {
      artLabel: 'The same task run twice. Run 1 wanders and fails twice; each failure is kept as a memory, a warning and a learning. Before run 12 the agent recalls both and goes straight to the goal with no retries.',
      retries: '{n} retries',
      noRetries: 'No retries',
      recalled: 'Recalled',
    },
    v2: {
      artLabel: 'Four memory layers, core, active, working and archive. Before each run the agent recalls from core and active; after it, what it learned lands in working, memories it keeps using rise, and the ones it stops using sink to the archive. Retries fall from three on run 1 to none from run 4.',
      tiers: {
        core: { name: 'Core', note: 'Always loaded' },
        active: { name: 'Active', note: 'Used often' },
        working: { name: 'Working', note: 'Just learned' },
        archive: { name: 'Archive', note: 'Kept, on demand' },
      },
      run: 'Run {n}',
      recall: 'Recall',
      learn: 'Learn',
      firstTry: 'First try',
      retries: '{n} retries',
      oneRetry: '1 retry',
      pick: 'Show memory after run {n}',
      memories: '{n} memories',
    },
    v3: {
      artLabel: 'Growth rings: every run of the agent draws one ring. The first rings are rough, with a stumble wherever it went wrong; each stumble leaves a memory, and from then on the ring runs smooth past that point. Ten runs later the rings are clean circles.',
      run: 'Run',
      ofRuns: 'of {n}',
      rough: 'First runs',
      smooth: 'Run {n}',
      legend: 'What it keeps',
      show: 'Show {category} memories',
      hint: 'Pick one to see an example.',
      examples: {
        fact: 'Invoices go out on the first of the month.',
        preference: 'The client prefers formal language.',
        instruction: 'Always copy the account manager on replies.',
        context: 'This quarter the team is focused on renewals.',
        learned: 'Shorter subject lines get more opens.',
        constraint: 'Never invoice before the contract is signed.',
      },
    },
  },
  healing: {
    heading: 'Fixes itself when things',
    headingGradient: 'break',
    stylised: 'Stylised',
    overseerNote: 'Logged for the Overseer',
    retry: 'Retry {n} of 3',
    cases: {
      rateLimit: {
        name: 'Rate limit',
        error: 'Slack: too many requests',
        diagnosis: 'Slack wants a pause',
        fix: 'Waits 30 s, then retries',
        result: 'Posted on the retry',
        note: 'Slack slowed the 08:00 post. One retry fixed it.',
      },
      timeout: {
        name: 'Timeout',
        error: 'Notion step ran out of time',
        diagnosis: 'Slow, not broken',
        fix: 'Retries with twice the time',
        result: 'Saved on the retry',
        note: 'Notion was slow today. Twice the time limit was enough.',
      },
      overload: {
        name: 'Overloaded',
        error: 'Claude is overloaded',
        diagnosis: 'A busy provider, not your agent',
        fix: 'Resumes in 10 min, mid-run',
        result: 'Picked up where it stopped',
        note: 'Claude was busy at 08:00. Resumed at 08:10, nothing lost.',
      },
      setup: {
        name: 'Broken step',
        error: 'A step failed on its setup',
        diagnosis: 'Something the agent can repair',
        fix: 'Retries it with Claude Opus',
        result: 'Step repaired',
        note: 'A step broke on its setup. Opus repaired it on the retry.',
      },
      login: {
        name: 'Expired login',
        error: 'Gmail: login expired',
        diagnosis: 'Only you can renew it',
        fix: 'Stops instead of retrying',
        result: 'Waiting for you',
        note: 'Renew the Gmail login and the run goes on.',
      },
    },
    stages: {
      detect: 'Detect',
      diagnose: 'Diagnose',
      fix: 'Fix',
      done: 'Back on track',
      yours: 'For you',
    },
    v1: {
      lede: 'When a step fails, your agent works out why, applies the fix that error needs and carries on. Only what it can\'t fix comes to you.',
      artLabel: 'Stylised circuit of an agent\'s run: a schedule starts the agent, which reads Gmail, posts to Slack and saves to Notion. One step fails at a time; the agent detects it, diagnoses the error, applies its fix and the run carries on. An expired login is not retried: the run stops safely and the issue is sent to you.',
      title: 'Your agent\'s run',
      casesLabel: 'Pick a failure to watch',
      schedule: '08:00',
      agent: 'Agent',
      report: 'Report',
      log: 'Run log',
      healthy: 'All steps running',
      healed: 'Healed',
      stopped: 'Stopped safely',
    },
    v2: {
      lede: 'Every failure gets the fix its error needs: a pause, more time, a resume or a stronger model. Only an expired login comes to you.',
      artLabel: 'Stylised prism: failed steps enter a prism that diagnoses each error and splits them into beams. A rate limit waits 30 seconds and retries, a timeout retries with twice the time, an overloaded provider resumes in 10 minutes, a broken step is repaired by Claude Opus; all four get back on track. An expired login goes to you.',
      failures: 'Failed steps',
      diagnose: 'Diagnose',
      diagnoseSub: 'reads each error',
      fixed: 'back on track',
      forYou: 'for you',
      budget: 'Up to 3 tries, then it\'s yours',
      logged: 'Every fix logged for the Overseer',
    },
    v3: {
      lede: 'Follow one failure from the error to the fix. No 3 a.m. alert, just a note in the morning.',
      artLabel: 'Stylised storyboard in four shots: a morning digest run fails on one step, the agent works out why, applies the fix for that error, and the Overseer leaves a note. For an expired login it stops and asks you instead.',
      camera: 'Camera',
      overview: 'Overview',
      another: 'Another failure',
      runName: 'Morning digest',
      shots: {
        fails: 'It fails',
        why: 'It works out why',
        fixes: 'It fixes it',
        stops: 'It stops',
        after: 'It tells you after',
        asks: 'It asks you',
      },
      steps: {
        read: 'Read Gmail',
        summarise: 'Summarize',
        save: 'Save to Notion',
        post: 'Post to Slack',
      },
      backoff: 'Next waits',
      timeLimit: 'Time limit',
      resumeAt: 'Resumes at step {n}',
      noBlindRetries: 'No blind retries',
      issueTitle: 'Health issue',
      noAlert: 'No 3 a.m. alert',
      secs: '{n} s',
      mins: '{n} min',
      overseer: 'Overseer\'s note',
      shotOf: 'Show shot {n}: {title}',
    },
  },
  models: {
    stylised: 'Stylised',
    yourMachine: 'Your machine',
    viaClaudeCode: 'via Claude Code',
    traits: { haiku: 'Fast and light', sonnet: 'The default', opus: 'Hardest problems', ollama: 'Stays on your PC' },
    agents: { codeReview: 'Code review', inbox: 'Inbox digest', brief: 'Daily brief', support: 'Support replies', journal: 'Private journal' },
    v1: {
      lede: 'Every agent thinks with the model its job needs. Private ones never leave your machine.',
      artLabel: 'Four agents live on your machine. Code review thinks with Claude Opus, the inbox digest with Haiku and the daily brief with Sonnet, through Claude Code. The private journal runs on Ollama and never leaves the machine.',
      pick: 'Per-agent pick',
    },
    v2: {
      lede: 'Send the heavy lifting to Claude. Keep private work at home on Ollama.',
      artLabel: 'Your machine sends work up to Claude Haiku, Sonnet or Opus through Claude Code. Choose Ollama and the link pulls back: a dome closes over the machine and nothing leaves it.',
      choose: 'Choose an engine',
      captions: {
        haiku: 'Quick, light jobs',
        sonnet: 'The everyday default',
        opus: 'The hardest problems',
        ollama: 'Nothing leaves this machine',
      },
    },
    v3: {
      lede: 'Patch each agent into the engine its job deserves, and re-patch it any time.',
      artLabel: 'A patch bay. Five agents on the left are cabled to engines on the right: Claude Opus, Sonnet and Haiku through Claude Code, and Ollama on this PC for the private journal.',
      agentsTitle: 'Your agents',
      onThisPc: 'On this PC',
      hint: 'Click an agent to swap its engine',
      swap: '{agent} runs on {engine}. Swap engine.',
    },
  },
  observe: {
    stylised: 'Stylised data',
    v1: {
      lede: 'Every run, message and event, live in one deck. Pick a stream to light it up across the whole fleet.',
      artLabel: 'Stylised observability deck: six agent lanes stream their runs, messages, reviews and failures past a glowing now line, each drawn to its length and cost, with run counts and spend per agent.',
      now: 'now',
      secondsAgo: '-{n}s',
      failed: 'fail',
      filtered: 'Showing {name}',
    },
    v2: {
      lede: 'Open any run and replay it step by step: every model call, tool call, cost, failure and approval, in order.',
      artLabel: 'Stylised run trace: a strip of today\'s runs, one opened into a step-by-step timeline with its timing and cost, a failed Slack post that retried, and the approval it waited on.',
      today: 'Today',
      runsToday: '{n} runs',
      openRun: 'Open the {name} run',
      fleet: 'Fleet',
      legend: { ok: 'Done', failed: 'Failed', review: 'Needed you' },
      kinds: { trigger: 'Trigger', model: 'Model call', tool: 'Tool call', review: 'Your review', memory: 'Memory', retry: 'Retry' },
      status: { ok: 'Done', failed: 'Failed', retried: 'Recovered', approved: 'Approved by you', alert: 'Alert sent', running: 'Running', queued: 'Not yet run' },
      stats: { duration: 'Duration', cost: 'Cost', tokens: 'Tokens' },
      timeByStep: 'Time by step',
      position: 'Step {i} of {n}, at {t}',
      hintFollow: 'Press any step to inspect it',
      hintPinned: 'Pinned. Press it again to resume.',
      runs: {
        pr: {
          id: '#482',
          steps: {
            opened: 'Pull request opened',
            read: 'Read the diff',
            fetch: 'Fetch 4 files',
            write: 'Write the review',
            post: 'Post summary',
            retry: 'Post summary again',
            approve: 'Approve the merge?',
            merge: 'Merge PR #482',
          },
          notes: {
            opened: 'GitHub woke the agent the moment the PR landed.',
            read: '12.4k tokens across 4 changed files.',
            fetch: 'Pulled the changed files from GitHub.',
            write: '3 comments and one suggested fix.',
            post: 'Slack answered 429: rate limited.',
            retry: 'Retried after a second and posted.',
            approve: 'Waited on you. Approved from your phone.',
            merge: 'Merged with your sign-off on record.',
          },
        },
        deploy: {
          id: '#1207',
          steps: {
            check: 'Scheduled check',
            deploys: 'Read 3 deployments',
            errors: 'Error spike: 38 a minute',
            diagnose: 'Trace the cause',
            commit: 'Find the commit',
            rollback: 'Roll back v2.14?',
            revert: 'Roll back to v2.13',
            notify: 'Tell #ops',
          },
          notes: {
            check: 'Runs every 5 minutes.',
            deploys: 'v2.14 went live on Vercel 4 minutes ago.',
            errors: 'Sentry flagged it. An alert went out at once.',
            diagnose: '15.2k tokens. Points at a cache change.',
            commit: 'Commit a41f9c changed the cache.',
            rollback: 'You approved the rollback in one tap.',
            revert: 'Back on v2.13. Errors fell to zero.',
            notify: 'Posted the rollback to #ops.',
          },
        },
        email: {
          id: '#3391',
          steps: {
            received: 'Invoice received',
            classify: 'Classify: invoice',
            file: 'File the PDF',
            remember: 'Remember the vendor',
            notify: 'Tell #finance',
            archive: 'Archive the thread',
          },
          notes: {
            received: 'A new email in the finance inbox.',
            classify: '2.3k tokens. One cent.',
            file: 'Saved to Finance / 2026 / October.',
            remember: 'Their next invoice files itself.',
            notify: 'Finance knows it is filed.',
            archive: 'Inbox back to zero.',
          },
        },
      },
    },
    v3: {
      lede: 'Every run lands on the record: what it did, which tool it touched, what it cost and who signed off.',
      artLabel: 'Stylised activity log: six agents feed one printer, each run prints a line with its time, tool, action and cost, failures and sign-offs are stamped, and a statement totals the day.',
      allAgents: 'All agents',
      printer: 'Activity log',
      statement: { title: 'Today', spend: 'Spend', runs: 'Runs', failures: 'Failures caught', approvals: 'Signed off by you', byAgent: 'Spend by agent' },
      stamps: { failed: 'Failed', retried: 'Retried', approved: 'Approved', needsYou: 'Needs you' },
      lines: {
        reviewPr: 'Reviewed PR #482',
        sorted: 'Sorted 14 emails',
        checked: 'Checked 3 deploys',
        digest: 'Posted the digest',
        spike: 'Error spike found',
        rollback: 'Rolled back v2.14',
        indexed: 'Indexed 22 pages',
        standup: 'Summarized stand-up',
        drafted: 'Drafted 3 replies',
        post: 'Posted PR summary',
        repost: 'Posted PR summary',
        filed: 'Filed 6 PDFs',
        merged: 'Merged PR #482',
        synced: 'Synced 9 issues',
        actions: 'Saved action items',
        archived: 'Archived newsletters',
      },
    },
  },
  plugins: {
    more: '+{count}',
    stylised: 'Stylised',
    taglines: {
      drive: "Your agents' exports, kept and browsable",
      twin: "Speaks as you, in each channel's tone",
    },
    v1: {
      artLabel: 'Stylised plugin window: plug in a plugin to watch it work.',
      reach: 'Connects to {count} tools',
    },
    drive: {
      title: 'Local drive',
      where: 'Saved in your app data',
      files: '{count} files',
      browse: 'Browse',
      folder: 'exports',
      kept: 'kept',
      statusLanding: 'Exports landing · {count}/{total}',
      statusUpdating: 'Updating Personas to {version}',
      statusKept: 'Updated to {version} · every file kept',
      survives: 'Survives upgrades',
      agents: {
        report: 'Report writer',
        design: 'Designer',
        leads: 'Lead scout',
        video: 'Video editor',
        notes: 'Scribe',
      },
    },
    twin: {
      you: 'You',
      intent: 'Tell Dana the fix ships Thursday.',
      name: 'Your twin',
      speaksAs: 'Speaks as you',
      traits: { identity: 'Your identity', tone: 'Tone per channel', memory: 'Memory recall' },
      recalled: 'Recalled',
      recallFact: 'Dana reported the export bug',
      tracked: 'Replies tracked',
      typing: 'Writing as you',
      sender: 'Sam',
      contact: 'Dana',
      alsoReaches: 'Same voice, any channel',
      channels: {
        slack: { tone: 'Casual', message: "Fix lands Thursday 🚀 I'll ping you when it's live!", reply: '🙌 legend, thanks!' },
        gmail: {
          tone: 'Formal',
          subject: 'Re: Export bug',
          message: 'Hi Dana, I can confirm the fix ships on Thursday.',
          signoff: 'Kind regards, Sam',
          reply: 'Thank you, Sam.',
        },
        linkedin: { tone: 'Warm', message: 'Thanks again for flagging this, Dana. The fix ships Thursday!', reply: 'Great news, thank you!' },
      },
      statusListening: 'Listening to you',
      statusRecalling: 'Recalling who Dana is',
      statusMirroring: 'Mirroring to {count} channels',
      statusReplies: 'Replies back \u00b7 {count}/{total}',
    },
  },
};
