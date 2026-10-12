# Runbook: a route's first-load JS went over budget

**When:** CI's `npm run check:bundle` step is red, or a change adds a heavy import to a route.

`bundle-budget.json` holds a ceiling per route. `npm run check:bundle` reads the stats that
`npm run build` writes, so it always runs after a build.

## Steps

1. `npm run build`, then `npm run check:bundle`. Note which route rose and by how much.
2. Find the cause before you raise anything. The usual one is a heavy module imported
   statically into a route. Defer it with `dynamic(() => import(...), { ssr: false })` and
   pass in resolved values. An import back from the caller pulls the dependency into the
   static graph and undoes the split. The chart cards under `src/components/dashboard/`
   show the pattern. `npm run analyze` opens the bundle analyzer.
3. Only when the growth is legitimate: `npm run check:bundle -- --update`. This
   re-baselines the whole file. Never raise one ceiling by hand.
4. Commit `bundle-budget.json` with the change that caused the growth. The `Why:` line of
   the commit message says why the route legitimately grew.
