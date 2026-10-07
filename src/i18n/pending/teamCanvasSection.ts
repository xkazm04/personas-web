/**
 * Pending-translation copy: the `teamCanvasSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `teamCanvasSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.teamCanvasSection`. See docs/features/platform/internationalization.md.
 */

export interface TeamCanvasSectionCopy {
  heading: string;
  headingGradient: string;
  lede: string;
  goalLabel: string;
  goal: string;
  shipped: string;
  compositeHealth: string;
  base: string;
  target: string;
  stations: Record<"plan" | "build" | "test" | "review", { label: string; sub: string }>;
  kpis: Record<"leadTime" | "coverage" | "errorRate" | "review" | "cost" | "adoption", string>;
  status: Record<"met" | "ok" | "warn" | "crit", string>;
}

export const teamCanvasSectionCopy: TeamCanvasSectionCopy = {
  heading: 'From goal to',
  headingGradient: 'shipped',
  lede: 'Triggers wake a single agent — the team canvas wires many. A goal fans out to personas that move real KPIs toward target along the line, then converges into a reviewed, shippable release.',
  goalLabel: 'Goal',
  goal: 'Ship the v0.5 release',
  shipped: 'Shipped',
  compositeHealth: 'composite health',
  base: 'base',
  target: 'target',
  stations: {
    plan: { label: 'Plan', sub: 'scope + estimate' },
    build: { label: 'Build', sub: 'implement' },
    test: { label: 'Test', sub: 'verify' },
    review: { label: 'Review', sub: 'approve' },
  },
  kpis: {
    leadTime: 'Lead time',
    coverage: 'Test coverage',
    errorRate: 'Error rate',
    review: 'Review pass rate',
    cost: 'Cost / run',
    adoption: 'Weekly users',
  },
  status: { met: 'Target met', ok: 'On track', warn: 'At risk', crit: 'Off track' },
};
