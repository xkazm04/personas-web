Execute this requirement immediately without asking questions.

## REQUIREMENT

# Sliding active-pill indicator in FilterBar via layoutId

## Metadata
- **Category**: ui
- **Effort**: High (3/3)
- **Impact**: Unknown (6/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:24:56 AM

## Description
FilterBar renders the active filter as a static bg-white/[0.08] background that hard-cuts between pills, so switching All to Active to Failed has no continuity. Replace the static background with a framer-motion element using a shared layoutId of filter-pill rendered only behind the active option, so the highlight physically slides between filters with a spring transition. Render the label/count above it via relative z-10, and short-circuit to the static background when useReducedMotion returns true.

## Reasoning
A sliding indicator turns a row of buttons into a single coherent control and signals craftsmanship the instant a user interacts with it. FilterBar is shared by executions and other dashboard views, so the upgrade propagates everywhere for free. It is a well-trodden framer-motion pattern, keeping risk modest as long as reduced-motion is honored.

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