# Outcome - 2026-10-15-demo-dashboard

Integration branch: `revamp/stage-fit` (dossier commit 23b2b075). Builder worktrees were created by the
harness from `origin/master` (1f9418ec), not the run's branch; each item commit was cherry-picked onto
the run branch and re-gated there. Build/bundle gates run from the main checkout at the end.

| item | commit | verify (re-run by the caller on the integration branch) | gates after merge | notes |
|---|---|---|---|---|
| D3 fix the cause once | 76f6030e | settleThread + demoCauseFix vitest 17/17 pass; correlate has a production importer (mockApi); MOCK_HEALTH_ALERTS/MOCK_OPEN_INCIDENTS gone; e2e/cause-fix.spec.ts written, NOT run | tsc 0, lint 9/9, vitest 1486/1486, i18n cov+enc OK, copy OK | clean cherry-pick; "Undo fix" in 14 locales |
| D2 one crew | a8cc2ab3 | fleet-monitor + mockFleetConsistency vitest 86/86 (shared sim survives Board->Night->Board; exec-<id> once; phone pause moves tile); e2e/crew-sync.spec.ts written, NOT run | tsc 0, lint 9/9, vitest 1514/1514 | clean cherry-pick; Board agents renamed to persona names (p004/p063/p085/p094/p047); triage fixture counts moved 45->47 decisions, 16->21 groups |
| D1 exact-row links | 7b7273d7 | knowledgeProvenance + incidentThreads vitest 20/20; e2e/execution-focus.spec.ts written, NOT run | tsc 0, lint 9/9, vitest 1523/1523, i18n OK, copy OK | conflicts: executions view (run branch had no useExecutionsList; re-extracted to stay under the 200-line lint rule), context-map, health.md. Real-mode change: a 404 run detail now reads "unavailable" instead of polling forever |
| D4 verdict -> learned memory | b01d6d55 | reviewLearning.desktopParity + reviewStore.learning + crew world vitest 33/33 | tsc 0, lint 9/9, vitest 1533/1533 | conflicts with D2/D3 in mockCommandPlane/mockApi/commandStore resolved (both refreshers kept; `changed()` fires on every flip). VERIFY CORRECTED: the scope's "decision 7 / constraint 8" holds only for team agents on the desktop; a solo agent (every demo agent) gets category learned, importance 5, with the run id - mirrored as the desktop actually behaves |

**Build gate (main checkout, after D1-D4):** `npm run build` FAILS - `./src/app/favicon.ico: Processing image failed - Format error decoding Ico: The PNG is not in RGBA format!`. The favicon was last changed by 0c316c3d (brand mark), before the run's base 23b2b075, so the build was already red on `revamp/stage-fit`; no tiger item touches it. Consequence: `check:bundle` could not run (no stats) - the /dashboard 1413 KB ceiling is NOT verified for this run.

| item | commit | verify (re-run by the caller on the integration branch) | gates after merge | notes |
|---|---|---|---|---|
| S1 scope bar filters | a9bc4b62 | dashboardScope + spa scope-honesty vitest 19/19 (builder: 40/40 scope tests incl. store round-trip); e2e/scope-bar.spec.ts written, NOT run | tsc 0, lint 9/9, vitest 1568/1568, i18n OK, copy OK | OWNER CHECK: home default window now 7 d (run total 47 -> 24, header labels the window; 30d/90d shows all 14 d). Compare removed from the scope bar; Observability's own toggles read the store's compareEnabled (one control per page) |
| S2 tour you do | cc704160 | tour-progress + tour-anchors + demoEntry vitest 68/68; e2e/tour.spec.ts 7 new tests written, NOT run | tsc 0, lint 9/9, vitest 1585/1585 (one load-timeout flake in deadLetterTriage on the first run; passes alone and on rerun - master already has c10d8234 raising that timeout) | clean cherry-pick. Kept dashboardReviews.mp3 only; deleted the stale home/executions/events clips + keys in 14 locales. `check:i18n-ledger` was already red on the base (39 unpinned pairs); 104 new pairs added - owner runs `npm run i18n:ledger --update` |
| L3 one world, real engines | 9b565b48 | cross-view equalities PASS: demoWorld + mockFleetConsistency + observabilityFixtures + sloEngine + scope + fleet-monitor vitest 139/139 (Board today 1,634 runs = observability today = executions rows today; spend equal to 1e-4 USD at $145.15; leaderboard == standings(); SLA == breachEpisodes(); every drill-down sums to its figure). **`check:bundle <= 1413 KB` FAILED: /dashboard 1425 KB** (see below). e2e/metric-drill.spec.ts written, NOT run | tsc 0, lint 9/9, vitest 1608/1608, i18n cov+enc OK, copy OK | fast-forward (branch head was its base). fleet.json + fleetReads stay out of first-load JS (checked in the chunks); crew/generate/shape are synchronous by design (SLA + D3 read them at once). OWNER CHECK: every analytic demo number moves; SLA objectives re-declared to engine metrics; br_3/br_4 now yesterday's closed episodes; Standup tile shows the outage's 3 failed runs; 15 idle fleet.json tiles $0 spend (Board $148.15 -> $145.15); nav active-runs badge ~30 instead of 2; executions demo store ~24.4k rows |

**Bundle, measured after all items (caller, 2026-10-15).** The favicon was swapped for an RGBA re-encode of the same three images *only for the measurement* and restored (`git status` clean on it); builds of the earlier commits ran in a scratch worktree with a copied (not linked) node_modules, since removed. First-load uncompressed JS, KB:

| commit | /dashboard (ceiling 1413) | /demo (1270) | /blog/[slug] (1050) |
|---|---|---|---|
| 23b2b075 run base | 1400.9 | 1258.3 | 1057.5 - already over |
| cc704160 after D1-D4, S1, S2 | 1417.4 | 1269.5 | 1062.4 |
| 9b565b48 after L3 | 1425 | 1277 | 1063 |

The run adds +24 KB to /dashboard (+16.5 from D1-S2, +7.5 from L3) and +19 KB to /demo; /blog/[slug] was over its ceiling before the run. `check:bundle` is red: the owner either re-baselines (`npm run check:bundle -- --update`, which also re-baselines /blog's pre-run growth) or asks for a trim. Not re-baselined by the run.
