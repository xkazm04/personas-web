# 2026-10-13 The web changelog cuts a release at a version bump, not at a deploy

**Governs:** `CHANGELOG.md`

## Context

`CHANGELOG.md` kept every entry under `[Unreleased]`, with a bare `## [0.1.0]` stub at the bottom that called itself a "pre-release baseline". A reader or an agent could not tell which changes shipped together or when. The site deploys continuously, so "a deploy" happens on every merge and cannot serve as the release event: it would make every merge a release and the changelog a second `git log`.

`npm run compile:changelog` (`scripts/compile-changelog.mjs`) does not help here. It reads the **desktop** app's `CHANGELOG.md` and generates the site's public timeline (`src/data/changelog.generated.ts`). It never reads this file, so it cannot cut this file's sections.

## Decision

A release of the web repo is a **version bump in `package.json`**. Cutting one is a single commit that:

1. sets `package.json` `version` to `x.y.z` (SemVer: minor for user-visible features, patch for repairs only);
2. renames the `## [Unreleased]` heading's shipped entries to `## [x.y.z] - YYYY-MM-DD` (the commit's date) and opens a fresh, empty `## [Unreleased]` above it.

The deploy that carries that commit is the release. Between cuts, entries accumulate under `[Unreleased]` as before.

## The first cut

The content that sat under `[Unreleased]` was the open-source release pass: README, LICENSE, `.env.example`, the React 19 compiler fixes and the contrast and animation-gating sweeps. Its plan is `audit-reports/oss-release-2026-04-17.md`, and `package.json` has read `0.1.0` since then. That content is now `## [0.1.0] - 2026-04-17`, and the old stub is merged into it. The date comes from that report, not from `git log`, because the session that made the cut had no shell. A person who checks the pass's commits may correct the date. Only the connector-modal entry, which landed after the pass, stays under `[Unreleased]`.

## Consequences

- No compare links are written until a `v0.1.0` tag exists. Tagging is a push, so it is the owner's step.
- The next cut is `0.2.0`, together with the `package.json` bump. That is an owner-reviewed file under `.github/CODEOWNERS`, so a lane proposes the bump and does not make it.
- If the desktop's versioned sections ever get wired into `RELEASES` (see the header of `scripts/compile-changelog.mjs`), that is the public timeline. This file remains the repo's own record.
