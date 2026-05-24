Execute this requirement immediately without asking questions.

## REQUIREMENT

# Auto-follow streaming console with jump-to-latest pill

## Metadata
- **Category**: ui
- **Effort**: Unknown (4/3)
- **Impact**: Unknown (7/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:24:50 AM

## Description
The ExecutionOutput console polls new stdout lines every 1s but never scrolls, so on a running execution the user stares at stale top-of-buffer text while live output piles up below. Add a ref to the scroll container that pins to the bottom when the user is already at the bottom, and pauses auto-follow the moment they scroll up. When paused and new lines arrive, surface a floating rounded-full bg-brand-cyan/15 text-brand-cyan pill reading jump to latest that scrolls back down on click. Gate the scroll animation behavior with useReducedMotion.

## Reasoning
Auto-following output is the defining behavior of a premium log/terminal view (think CI consoles); without it the live-streaming feature feels half-finished. The jump-to-latest affordance respects users who scroll back to read, avoiding the classic scroll-jacking frustration. Strong impact on the core observability workflow.

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