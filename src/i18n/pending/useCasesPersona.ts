/**
 * Pending-translation copy: the `useCasesPersona` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `useCasesPersonaCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.useCasesPersona`. See docs/features/platform/internationalization.md.
 */

export interface UseCasesPersonaCopy {
  groupLabel: string;
  identityNote: string;
  personaName: string;
  personaDescription: string;
  active: string;
  jobOne: string;
  jobMany: string;
  noConnectors: string;
  connectorCount: string;
  connectedTools: string;
  sampleTriggers: string;
  sampleLastRun: string;
  adds: string;
  emptyJobs: string;
  ledgerLabel: string;
  notConnected: string;
  tabsLabel: string;
  connected: string;
  pause: string;
  replay: string;
  play: string;
}

export const useCasesPersonaCopy: UseCasesPersonaCopy = {
  groupLabel: 'One persona, {persona}, shown as its card. Connecting each of {tools} tools adds that tool\'s jobs, {jobs} in all, while the persona\'s name, icon and color stay the same.',
  identityNote: 'Same name, same icon, same color through every tool. Connecting a tool only adds jobs to this one persona.',
  personaName: 'Chief of staff',
  personaDescription: 'Keeps your inbox, channels, repos and calendar moving.',
  active: 'Active',
  jobOne: '{count} job',
  jobMany: '{count} jobs',
  noConnectors: 'No connectors yet',
  connectorCount: '{attached} of {total} connectors',
  connectedTools: 'Connected tools',
  sampleTriggers: '3 triggers',
  sampleLastRun: '2 min ago',
  adds: '{tool} adds {count} jobs to {persona}',
  emptyJobs: 'No tools connected yet. Each tool you connect adds its jobs to this same persona.',
  ledgerLabel: 'Jobs {persona} can do',
  notConnected: 'not connected',
  tabsLabel: 'Connect a tool to the persona',
  connected: 'connected',
  pause: 'Pause',
  replay: 'Replay',
  play: 'Play',
};
