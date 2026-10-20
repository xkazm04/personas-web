# Runbooks for recurring agent tasks

Each runbook is a task an agent session does again and again. Each one names when it
applies, the exact commands, and what not to do. The commands are real `package.json`
scripts or script paths. `node scripts/check-agent-commands.mjs` fails when one of them
stops existing.

| Task | Runbook |
| --- | --- |
| A UI string changed; the translation ledger is red | [i18n-ledger-refresh.md](i18n-ledger-refresh.md) |
| English guide content changed; translations to refresh | [guide-translation.md](guide-translation.md) |
| A route went over its first-load JS budget | [bundle-rebaseline.md](bundle-rebaseline.md) |
| The desktop changelog moved; regenerate the feed | [changelog-feed.md](changelog-feed.md) |

The Definition-of-Done that every change must meet is in [../AI_HARNESS.md](../AI_HARNESS.md).
