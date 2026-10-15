# Scope - demo dashboard (2026-10-15)

**Thesis:** turn the demo from fifteen well-made rooms into one fleet the visitor operates - what
they click, fix and decide carries across every view and can be traced to the run behind it.

Council: 4 live seats (Gemini 4 Argon, GPT-6.1 Sol, Grok 4.7, Claude Opus 5.5), 2 rounds,
26 proposals. Judge: claude-opus-5-5. Not single-family.

## Core (build order)

| # | item | outcome | effort | verify | sources | deps |
|---|---|---|---|---|---|---|
| D1 | Exact-row links + honest provenance | Evidence chips, review execution ids and blast-radius persona chips open the exact run/agent; `/dashboard/executions?focus=<id>` opens its modal even under a table filter; seeded pattern provenance cites the right persona's run; unknown id reads "unavailable", never "completed" | S | Playwright: chip -> modal for that id, Back returns; `?focus=nope` opens no modal; vitest: every `kp_*` lastExecutionId owned by its persona, `getExecution('nope')` unavailable | P17 P11 P08 P19 (4 seats) | - |
| D2 | One crew on the stage | Board and Night shift share one sim (a pause survives a tab round trip); five named fleet.json agents are the five synced personas, so pausing/running/approving one moves it on the phone, Executions and Reviews; the other 94 and the 47-run window stay as they are | M | consistency test: crew ids share name/colour; Playwright: pause on phone -> Board/Night/Board stays paused; Run on Board -> `exec-<commandId>` once in Executions | P25 P16 P02 P12 P06 (4 seats) | - |
| D3 | Fix the cause once, every surface settles | Configuring the broken Slack webhook settles its whole thread: Health badge, SLA breach, Observability issue, the correlated incident (Incidents now runs `correlate()`), Mission Control recovery; "Undo fix" re-injects the outage | M | vitest: `settleThread` leaves zero open members of `slack-circuit-break`, other threads by reference; Playwright no-reload walk across 5 views; Undo restores all; `correlate` has a non-test importer | P21 P03 P24 P26 (4 seats) | - |
| D4 | A verdict becomes learned memory | Approving/rejecting a review (after the undo window) adds "Human {verdict}: {title}" to Knowledge > Memories exactly as the desktop's `flip_status` does, with a chip back to the run | M | parity vitest citing `manual_reviews.rs` (decision 7 / constraint 8, dedup by title, undo adds none); Playwright: approve -> memory first -> chip opens run | P22 P19 P05 (3 seats) | D1 |

## Supporting

| # | item | outcome | effort | verify | sources | deps |
|---|---|---|---|---|---|---|
| S1 | Scope bar filters what claims it | Persona + window in the scope bar slice executions, reviews, leaderboard, knowledge, SLA and Mission Control; empty slice says "nothing in this window" (distinct from not-served); one Compare toggle | S-M | before/after: Incident Responder + 24h changes the four surfaces; All + 7d restores exact counts; `inScope` unit test | P15 P01 (2 seats) | - |
| S2 | Tour you do, not watch | Tour starts on the Board, spotlight is click-through, steps advance on the visitor's action (dwell + "Show me" fallback), old cockpit anchors retired, ends on the visitor's own review verdict -> its run. No CTA (owner rule). New captions in 14 locales; audio optional | M | tour.spec: lands on personas; approve step waits for a real approve; recap matches command log; no old anchor names left | P09 P18 P04 P20 (3 seats) | D1 (end link); better with D2/D3 |

## Leaps

| # | item | outcome | effort | verify | sources | deps |
|---|---|---|---|---|---|---|
| L1 | Shareable fault drills | `?drill=slack-outage&t=180` opens the outage at that moment; the visitor fixes it; End drill restores; persistent DEMO DRILL marker. The slate's one new-surface feature | M | two loads of same `t` identical; fix clears 4 readings + badge; End drill restores; no drill param = today's values | P26 P07 P20 (3 seats) | D3 |
| L2 | Pick your team, watch a real run | `?team=finance` zooms the Board to that bay; an agent's console plays an authored run with the team's real tools on the run-script clock, ending in a draft in triage (personasMonitor pending EN namespace) | M | vitest: each team script uses only TEAM_TOOLS and ends draft_ready; seek == play; Playwright `/demo?team=finance` | P10 (1 seat) | better with D2 |
| L3 | One world through the real engines | Analytic views (Leaderboard, SLA, Incidents) computed by `standings()`, `sloEngine`, `correlate()` over a fleet-projected log; metrics drill to the executions behind them | L | cross-view equalities test (board runs today == observability == executions rows); `check:bundle` <= 1413 KB | P06 P23 P12 P14 (3 seats) | D2 |

## Left out

- P13 rewind-and-branch: L effort, low peer score, implies predictive simulation the desktop lacks.
- Director verdict on review (P05 half): the desktop writes none - would teach something untrue.
- Standalone timeline scrubber (P14): folded into L3; L1's `t=` carries the shareable moment.
- Any download/sign-up CTA in the demo: owner decision 2026-10-06.
