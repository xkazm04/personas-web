Execute this requirement immediately without asking questions.

## REQUIREMENT

# Fix DataTable collapse so exit animation actually plays

## Metadata
- **Category**: code_quality
- **Effort**: Medium (2/3)
- **Impact**: Unknown (5/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:24:44 AM

## Description
In DataTable.tsx the AnimatePresence is nested INSIDE the {isExpanded && expandable && ...} conditional, so on collapse the motion.div unmounts before AnimatePresence can run its exit transition � the row snaps shut instead of easing closed. Hoist AnimatePresence outside the conditional and move the isExpanded check onto the motion.div presence so framer-motion can animate height/opacity both in and out. Keep the existing cubic-bezier [0.22, 1, 0.36, 1] easing for symmetry.

## Reasoning
The current code pays the cost of AnimatePresence and motion but visibly drops half the animation, which reads as cheap and inconsistent. The fix is a small structural correction in the shared table that makes every expand/collapse feel smooth and intentional. Touches a shared primitive so it improves executions and all other expandable tables at once.

## Context

**Note**: This section provides supporting architectural documentation and is NOT a hard requirement. Use it as guidance to understand existing code structure and maintain consistency.

### Context: Execution History & Streaming

**Description**: Execution history table, filtering, and streaming logs for individual executions via SSE proxy. Filters persisted via dashboardFilterStore (date range, persona).
**Related Files**:
- `src/app/dashboard/executions/page.tsx`
- `src/app/api/executions/[id]/stream/route.ts`
- `src/components/dashboard/DataTable.tsx`
- `src/components/dashboard/FilterBar.tsx`
- `src/stores/executionStore.ts`
- `src/stores/dashboardFilterStore.ts`
- `src/hooks/useExecutionPolling.ts`

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