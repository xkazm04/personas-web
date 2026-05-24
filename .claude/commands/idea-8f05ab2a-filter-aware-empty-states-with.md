Execute this requirement immediately without asking questions.

## REQUIREMENT

# Filter-aware empty states with one-click reset

## Metadata
- **Category**: ui
- **Effort**: Medium (2/3)
- **Impact**: Unknown (5/3)
- **Scan Type**: delight_designer
- **Generated**: 5/24/2026, 10:36:54 AM

## Description
When a status filter such as Failed matches zero rows but executions exist, DataTable still renders the generic No executions yet EmptyState, implying the system is idle. Detect the active-filter-with-data case in ExecutionsPage and show a contextual message such as No failed runs in this view plus a Show all button that calls handleFilterChange(all). Add the per-filter empty copy and the reset label to all 14 locales.

## Reasoning
A misleading empty state makes users think data is missing when it is merely filtered out, eroding trust in the dashboard. A targeted message with a single reset action removes the dead end and is a small, low-risk change with outsized clarity gains.

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