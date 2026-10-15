# Tiger backlog

Rolled forward from each hunt. Pool ids refer to the run's `pool.md`.

## Open from 2026-10-15-demo-dashboard

### Approved, landed with a failed check
- **L3 bundle ceiling** - `/dashboard` first-load 1425 KB vs 1413 KB (`/demo` 1277 vs 1270). Run added +24 KB over the base's 1400.9. Owner: re-baseline with a reason, or trim (candidates: the synchronous crew world `src/lib/demoWorld/{crew,generate,shape}.ts`, which SLA and D3 read at once). `/blog/[slug]` was over before the run. Needs the favicon fix below to measure at all. [outcome](hunts/2026-10-15-demo-dashboard/outcome.md)

### Kept, not chosen
- **L1 Shareable fault drills** (P26 P07 P20) - `?drill=slack-outage&t=180` opens the outage at a moment; fix it; End drill restores; DEMO DRILL marker. Builds on D3 (landed) and L3's clock (`DEMO_FLEET_NOW_MS`). [scope](hunts/2026-10-15-demo-dashboard/scope.md)
- **L2 Pick your team, watch a real run** (P10) - `?team=finance` zooms the Board to a bay; an authored run with the team's tools ends in a draft in triage. [scope](hunts/2026-10-15-demo-dashboard/scope.md)

### Found during the run (not council items)
- `src/app/favicon.ico` holds RGB PNGs; Next's build rejects them ("The PNG is not in RGBA format"), so `npm run build` and `check:bundle` are red on `revamp/stage-fit` since 0c316c3d. An RGBA re-encode of the same images builds.
- `check:i18n-ledger` red: 39 unpinned pairs before the run, +104 from S2/L3 - `npm run i18n:ledger --update`.
- Seven e2e specs written and not run: cause-fix, crew-sync, execution-focus, review-learning, scope-bar, tour, metric-drill.
