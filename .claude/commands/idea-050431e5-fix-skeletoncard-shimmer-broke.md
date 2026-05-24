Execute this requirement immediately without asking questions.

## REQUIREMENT

# Fix SkeletonCard shimmer broken by Unicode minus glyph

## Metadata
- **Category**: code_quality
- **Effort**: Low (1/3)
- **Impact**: Unknown (5/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:28:09 AM

## Description
SkeletonCard.tsx line 23 animates translateX across two keyframes, but the first value is written with a Unicode minus sign (U+2212) instead of an ASCII hyphen-minus, so it reads as -100% to a human yet is unparseable to Framer Motion. The shimmer overlay therefore never sweeps in from off-screen left and the loading state looks frozen or offset. Replace the glyph with a plain ASCII -100% and add a no-irregular-whitespace style guard to prevent regressions.

## Reasoning
Loading skeletons are the first thing users see on a slow network, and a frozen shimmer reads as a hung or broken app rather than a polished load. The fix is a single-character change with essentially zero risk and an immediate lift to the perceived smoothness of every skeleton in the app.

## Context

**Note**: This section provides supporting architectural documentation and is NOT a hard requirement. Use it as guidance to understand existing code structure and maintain consistency.

### Context: Reviews, Knowledge & Settings

**Description**: Manual review queue with batch approval/rejection, knowledge-base, messages, and user settings � all dashboard back-office surfaces. Bulk actions surface progress + undo toasts via reviewStore + useReviewBulkActions.
**Related Files**:
- `src/app/dashboard/reviews/page.tsx`
- `src/app/dashboard/messages/page.tsx`
- `src/app/dashboard/knowledge/page.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/components/dashboard/BatchReviewModal.tsx`
- `src/components/dashboard/EmptyState.tsx`
- `src/components/dashboard/SkeletonCard.tsx`
- `src/components/dashboard/StalenessIndicator.tsx`
- `src/components/dashboard/FleetOptimizationCard.tsx`
- `src/components/dashboard/StatusBadge.tsx`
- `src/components/dashboard/StatBadge.tsx`
- `src/stores/reviewStore.ts`
- `src/hooks/useReviewBulkActions.ts`
- `src/lib/reviewUtils.ts`
- `src/components/BulkProgressBar.tsx`
- `src/components/BulkResultToast.tsx`
- `src/components/UndoToast.tsx`
- `src/components/ConfirmDialog.tsx`

**Post-Implementation**: After completing this requirement, evaluate if the context description or file paths need updates. Use the appropriate API/DB query to update the context if architectural changes were made.

## Recommended Skills

Use Claude Code skills as appropriate for implementation guidance. Check `.claude/skills/` directory for available skills.

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