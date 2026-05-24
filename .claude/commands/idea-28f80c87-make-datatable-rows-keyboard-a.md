Execute this requirement immediately without asking questions.

## REQUIREMENT

# Make DataTable rows keyboard and screen-reader accessible

## Metadata
- **Category**: code_quality
- **Effort**: Unknown (4/3)
- **Impact**: Unknown (7/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:25:02 AM

## Description
Expandable DataTable rows are bare div elements with onClick and cursor-pointer but no keyboard or ARIA support, so keyboard and screen-reader users cannot expand a run or perceive table structure. Add role=button, tabIndex=0, aria-expanded bound to isExpanded, and an onKeyDown handler firing toggle on Enter and Space (with preventDefault) to each clickable row, plus a visible focus-visible:ring-2 focus-visible:ring-brand-cyan/50 outline. Layer in table semantics via role=table/row/columnheader on the header and row wrappers so assistive tech announces it as a real table.

## Reasoning
Accessibility is a baseline requirement, not a nice-to-have, and clickable divs silently exclude keyboard and assistive-tech users from a core workflow. Because the fix lives in the shared DataTable, every dashboard table becomes operable and announceable at once, reducing legal/compliance risk and widening the usable audience. Visible focus rings also help mouse users track state.

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