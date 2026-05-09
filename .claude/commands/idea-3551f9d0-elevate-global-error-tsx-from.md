Execute this requirement immediately without asking questions.

## REQUIREMENT

# Elevate global-error.tsx from functional to delightful

## Metadata
- **Category**: ui
- **Effort**: High (3/3)
- **Impact**: Unknown (7/3)
- **Scan Type**: delight_designer
- **Generated**: 4/14/2026, 2:45:59 PM

## Description
Redesign global-error.tsx with brand personality: add an illustrated error icon with subtle animation, a friendlier heading (e.g. "Oops, something broke"), sanitized error context instead of raw error.message, and multiple recovery paths � a prominent "Reload Page" button plus secondary links to Home and a support/status page. Include the Sentry error digest as a copyable reference code for support tickets.

## Reasoning
The current error page is bare-bones � generic heading, raw error text, single retry button. Error pages are high-emotion moments where users are frustrated; a polished, empathetic error UX with clear recovery options reduces bounce rate and builds trust. This is visible to every user who hits an unhandled error.

## Context

**Note**: This section provides supporting architectural documentation and is NOT a hard requirement. Use it as guidance to understand existing code structure and maintain consistency.

### Context: SEO, Analytics & Error Tracking

**Description**: SEO utilities with sitemap and robots generation, OG image rendering, Sentry error tracking with PII scrubbing, analytics tracking, and app-level configuration
**Related Files**:
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/manifest.ts`
- `src/app/opengraph-image.tsx`
- `src/app/not-found.tsx`
- `src/app/global-error.tsx`
- `src/app/layout.tsx`
- `src/app/template.tsx`
- `src/app/globals.css`
- `src/lib/seo.ts`
- `src/lib/og.tsx`
- `src/lib/analytics.ts`
- `src/lib/sentry.ts`
- `src/lib/sentry-pii.ts`
- `src/lib/constants.ts`
- `src/lib/format-date.ts`
- `src/lib/format.ts`
- `src/lib/dev.ts`
- `src/app/api/stats/route.ts`
- `src/app/api/waitlist/route.ts`
- `src/app/api/events/stream/route.ts`
- `src/components/PageViewTracker.tsx`
- `src/components/CookieConsent.tsx`
- `next.config.ts`
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

**Post-Implementation**: After completing this requirement, evaluate if the context description or file paths need updates. Use the appropriate API/DB query to update the context if architectural changes were made.

## Recommended Skills

- **compact-ui-design**: Use `.claude/skills/compact-ui-design.md` for high-quality UI design references and patterns

## Notes

This requirement was generated from an AI-evaluated project idea. No specific goal is associated with this idea.

## DURING IMPLEMENTATION

- Use `get_memory` MCP tool when you encounter unfamiliar code or need context about patterns/files
- Use `report_progress` MCP tool at each major phase (analyzing, planning, implementing, testing, validating)
- Use `get_related_tasks` MCP tool before modifying shared files to check for parallel task conflicts

## AFTER IMPLEMENTATION

1. Log your implementation using the `log_implementation` MCP tool with:
   - requirementName: the requirement filename (without .md)
   - title: 2-6 word summary
   - overview: 1-2 paragraphs describing what was done
   - category: one of feature/bugfix/refactor/performance/security/infrastructure/ui/docs/test
   - patternsApplied: comma-separated patterns used (e.g. "repository pattern, debounce, memoization")

2. Check for test scenario using `check_test_scenario` MCP tool
   - If hasScenario is true, call `capture_screenshot` tool
   - If hasScenario is false, skip screenshot

3. Verify: `npx tsc --noEmit` (fix any type errors)

Begin implementation now.