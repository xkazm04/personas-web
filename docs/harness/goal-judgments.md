# personas-web — goal judgments

## Run #1 — 2026-04-10

**Mode:** improve
**Health scan:** 2 TS errors (phantom .next types), 39 lint errors (react-hooks), 2 TODOs, largest file 967 LOC
**Selected goal:** Landing Page Capability Refresh — Align with Desktop App
**Source:** domain-scan + user direction (marketing alignment with desktop app)
**Confidence at selection:** high
**Quality score:** 90/100
**User verdict:** accepted (user redirected from dashboard goals to marketing-only focus)
**Reasoning:** User specified that the web should be a complementary marketing component to the core desktop app. Original autonomous goals (interactive playground, onboarding wizard) were dashboard-focused and rejected in favor of marketing alignment.

**Lessons for future ranking:**
- This project is a marketing site — goals should focus on marketing pages, not dashboard features
- The desktop app at `C:\Users\kazda\kiro\personas` is the source of truth for capabilities to market
- User prefers goals that amplify the desktop app's differentiators over goals that add dashboard functionality
- Infrastructure goals (app shell, nav) don't apply here — the site already has full routing and layout

## Run #12 — 2026-04-10

**Mode:** improve
**Health scan:** 0 TS errors, 42 lint warnings (react-hooks), 2 TODOs, largest file 1926 LOC
**Selected goal:** Competitor Comparison Page — Personas vs CrewAI, LangChain, n8n, AutoGen
**Source:** competitive research (high-intent SEO page, buyer decision support)
**Confidence at selection:** high
**Quality score:** 90/100
**User verdict:** accepted (user selected from 5 autonomous goal candidates)
**Reasoning:** User chose comparison page from a ranked backlog of 5 goals. High-intent conversion page capturing "X vs Y" search traffic. Desktop-first positioning against cloud competitors.

**Lessons for future ranking:**
- User engages well with conversion/marketing-focused goals (comparison, features, guide) over infrastructure goals
- Competitive research goals that position the desktop app's unique advantages (privacy, free, local-first) resonate
- Multi-competitor comparison data should be periodically refreshed to stay accurate
- The i18n overhead is real (~14 file touches for any new nav item) — factor into task complexity estimates
