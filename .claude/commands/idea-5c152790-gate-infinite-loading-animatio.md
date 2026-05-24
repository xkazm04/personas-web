Execute this requirement immediately without asking questions.

## REQUIREMENT

# Gate infinite loading animations on prefers-reduced-motion

## Metadata
- **Category**: ui
- **Effort**: High (3/3)
- **Impact**: Unknown (6/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:27:53 AM

## Description
SkeletonCard shimmer, its animate-pulse placeholders, the StatusBadge running ping dot, UndoToast undo-shrink CSS animation, and BulkProgressBar spinner all loop forever without honoring reduced motion. Import useReducedMotion from framer-motion in each and short-circuit to a static state: skip the motion.div sweep, drop animate-ping, and render a static progress fill. StatBadge already models the correct pattern to copy.

## Reasoning
Continuous looping motion triggers discomfort for users with vestibular sensitivity, and the repo enforces animation gating as a custom lint rule. Gating costs little and makes the loading and review surfaces feel calm and respectful rather than busy, while aligning these components with the existing StatBadge precedent.

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