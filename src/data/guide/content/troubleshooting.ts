export const content: Record<string, string> = {
  "common-error-messages": `
## Common Error Messages

Error messages can look scary, but most have simple solutions. This guide translates the most frequent errors into plain English and tells you exactly what to do. You don't need to understand the technical details — just match the error to the fix.

Most errors fall into a few categories: credential problems, timeout issues, and input format mismatches. Once you know the patterns, troubleshooting becomes second nature.

### Most Common Errors

- **"Authentication failed"** — your credential has expired or was entered incorrectly. Go to \`Credentials\` and refresh or re-enter it.
- **"Request timed out"** — the AI provider took too long to respond. Try running again, or increase the timeout in agent settings.
- **"Rate limit exceeded"** — you've made too many requests too quickly. Wait a minute and try again, or upgrade your provider plan.
- **"Invalid input format"** — the data sent to your agent wasn't in the expected format. Check the trigger or pipeline feeding data to this agent.

### How It Works

When an error occurs, it appears in the execution log with a code and description. Click the error to see a detailed explanation and suggested fix. Many errors include a \`Fix Now\` button that takes you directly to the setting that needs attention.

:::tip
Don't panic when you see an error. Read the message carefully — it almost always tells you what went wrong and points you toward the solution.
:::
  `,

  "agent-not-responding": `
## Agent Not Responding

If your agent seems frozen, stuck, or just isn't producing results, don't worry — it's usually a simple fix. The most common causes are a timed-out AI provider connection, a credential issue, or the agent hitting its maximum turn limit. Follow this checklist to get back on track.

Most unresponsive agent issues resolve themselves when you identify and fix the underlying cause, which is almost never a permanent problem.

### Diagnostic Checklist

:::steps
1. **Check the execution log** — look for error messages or warnings that explain the stall
2. **Verify your AI provider** — make sure your provider's API is online and your account is active
3. **Check credentials** — ensure the agent's credentials haven't expired
4. **Review limits** — the agent may have hit its timeout or max turns setting
5. **Try a manual run** — run the agent with simple test input to isolate the issue
:::

### How It Works

Open the agent and check its latest execution log. If it shows an error, follow the fix for that specific error. If the log shows the agent is still running, it may be processing a particularly complex task. Check the timeout setting — if it's too short, the agent may be stopping before it finishes.

:::tip
If an agent is truly stuck (no progress for several minutes), click \`Stop\` and then try a manual run with simpler input. This helps you determine if the issue is with the input or the agent itself.
:::
  `,

  "credential-errors": `
## Credential Errors

When an agent can't connect to a service, it's usually because a credential has expired, a password was changed, or a permission was revoked. These are the most common problems in any automation system, and they're almost always quick to fix.

The key is identifying which credential is causing the problem, then refreshing or replacing it.

### Common Causes

- **Expired token** — OAuth tokens expire periodically and need refreshing
- **Changed password** — if you changed a password elsewhere, update it in Personas too
- **Revoked permissions** — the service may have revoked the access you originally granted
- **Wrong credential assigned** — the agent may be using the wrong credential for the service

### How It Works

Check the error message in the execution log — it will mention which service failed. Go to \`Credentials\` and find the credential for that service. Check its health status. If it's red or yellow, click it to see what's wrong and follow the suggested fix — usually refreshing the token or re-entering the password.

:::tip
Set up credential health checks to run automatically. They'll catch expiring credentials before they cause agent failures, turning a potential crisis into a routine maintenance task.
:::
  `,

  "trigger-not-firing": `
## Trigger Not Firing

A trigger that doesn't fire is frustrating, but the cause is usually something small — a configuration typo, a timing issue, or a missing permission. This guide walks you through the most common culprits so you can get your automations running again.

The trigger log is your best friend here. It records every activation attempt, including ones that were filtered out or failed silently.

### Diagnostic Steps

:::steps
1. **Check the trigger log** — open the agent's trigger settings and click the \`Log\` tab to see every attempt, including failures
2. **Verify the trigger is enabled** — look for the toggle switch; disabled triggers don't fire
3. **Check filters** — review your filter conditions, which might be too strict and blocking all events
4. **Test manually** — use the trigger tester to simulate an event and verify the configuration
5. **Check permissions** — confirm that file watchers have folder access and webhooks have network access
:::

### How It Works

Open the agent's trigger settings and click the \`Log\` tab. Every trigger attempt is listed with a status: fired, filtered, or failed. Click any entry to see why it didn't fire. The most common finding is a filter that's slightly too strict — adjusting it usually solves the problem immediately.

:::tip
When setting up a new trigger, start without any filters. Once you confirm it fires correctly, add filters one at a time. This way you know each filter works as expected.
:::
  `,

  "self-healing-explained": `
## Self-Healing Explained

When something goes wrong during an agent run, the self-healing system tries to fix the problem and retry automatically. It's like having a safety net that catches most errors before you even notice them. Common issues like temporary network glitches, brief API outages, or rate limits are handled without your intervention.

Self-healing doesn't mean your agent never fails — it means it recovers from the kinds of small, temporary problems that would otherwise require you to manually restart it.

### Key Points

- **Automatic retry** — transient errors are retried with smart backoff timing
- **Error classification** — the system distinguishes between fixable and unfixable errors
- **Credential refresh** — expired tokens are refreshed automatically when possible
- **Transparent** — every self-healing action is logged so you can see what happened

### How It Works

When an error occurs, the self-healing system evaluates it. Transient errors (network timeouts, rate limits, temporary outages) trigger an automatic retry after a short wait. Credential expirations trigger an automatic refresh attempt. Permanent errors (invalid configuration, missing permissions) are reported to you immediately because they require your attention.

:::success
When self-healing succeeds, the agent continues as if nothing happened. The execution log marks the recovered error with a green "healed" badge so you can see what was caught and resolved automatically.
:::

:::tip
Check the self-healing log occasionally to see what's being caught. If the same error keeps getting healed, it might indicate an underlying issue worth fixing permanently.
:::
  `,

  "checking-system-health": `
## Checking System Health

The built-in health check scans your entire Personas installation and reports any issues — outdated components, missing files, configuration problems, or connectivity issues. Run it anytime something feels off for a quick assessment of your system's overall status.

Think of it as a visit to the doctor for your Personas setup. A quick check-up can catch small issues before they become big problems.

### What It Checks

- **App version** — whether you're running the latest version
- **Database integrity** — your local data files are intact and healthy
- **Credential status** — all stored credentials are valid and working
- **Provider connectivity** — your AI providers are reachable and responding
- **Cloud connection** — your orchestrator connection is active (if configured)

### How It Works

Go to \`Settings > System Health\` and click \`Run Health Check\`. The scan takes a few seconds and produces a report. Green items are healthy, yellow items need attention soon, and red items need immediate fixing. Each item includes a description of the issue and a suggested fix.

:::tip
Run a health check after installing updates, after connectivity issues, or before deploying a critical agent. It takes just seconds and gives you peace of mind.
:::
  `,

  "log-files-and-debugging": `
## Log Files and Debugging

Log files are like a flight recorder for your Personas installation. They capture everything that happened — agent runs, system events, errors, and more — in detailed chronological order. When something goes wrong and the execution log isn't enough, these files contain the full story.

You don't need to read logs regularly, but knowing where they are and how to use them is invaluable when troubleshooting a tricky problem.

### Key Points

- **Automatic logging** — everything is recorded without you turning anything on
- **Organized by date** — each day's events are in a separate file for easy browsing
- **Searchable** — find specific events by keyword, date, or severity level
- **Shareable** — if you contact support, you can share relevant log excerpts

### How It Works

Log files are stored locally on your computer. Access them from \`Settings > Logs\` or navigate to the log folder directly. Each file covers one day and contains timestamped entries. Use the built-in log viewer to search, filter, and browse. For support requests, the \`Export Log\` button creates a shareable excerpt.

:::tip
When contacting support about an issue, include the relevant log excerpt. It dramatically speeds up the troubleshooting process because the support team can see exactly what happened.
:::
  `,

  "resetting-to-defaults": `
## Resetting to Defaults

If you've changed a setting and can't figure out what's causing a problem, resetting to defaults gives you a clean starting point. This only resets your preferences and configuration settings — your agents, credentials, memories, and data are all preserved. Nothing important is lost.

Think of it as restoring a room to its original layout. All your belongings (agents and data) stay, but the furniture (settings) goes back to where it started.

:::warning
Resetting clears all customized preferences in one action. This includes your theme, default model, notification settings, and keyboard shortcuts. Your agents, credentials, memories, and data are not affected — but any carefully tuned preferences will need to be reconfigured manually afterward.
:::

### What Gets Reset

- **Display preferences** — theme, layout, sidebar width, and visual settings
- **Default model** — goes back to the recommended default
- **Notification settings** — reset to standard notification behavior
- **Keyboard shortcuts** — restored to original key combinations

### What Stays Safe

- All your **agents** and their prompts, histories, and configurations
- All your **credentials** in the vault
- All your **memories**, test results, and execution logs
- All your **pipelines** and team configurations

### How It Works

Go to \`Settings > Advanced > Reset to Defaults\`. Review what will be reset, then click \`Confirm\`. Your settings return to their factory values while all your work is preserved. You can then reconfigure settings one at a time to identify which change was causing the issue.

:::tip
Before resetting, make a note of any settings you've customized intentionally. This way you can quickly restore the ones you want after the reset fixes your issue.
:::
  `,
};
