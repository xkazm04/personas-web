Execute this requirement immediately without asking questions.

## REQUIREMENT

# Shape-matched skeleton + retry for AgentDetail

## Metadata
- **Category**: ui
- **Effort**: Medium (2/3)
- **Impact**: Unknown (5/3)
- **Scan Type**: delight_designer
- **Generated**: 5/24/2026, 10:31:05 AM

## Description
AgentDetail (src/components/dashboard/AgentDetail.tsx) shows a single generic pulse line while loading, then snaps into a multi-row executions list plus subscription/trigger counts, causing a visible layout jump. Replace the placeholder with a skeleton that mirrors the real structure: 3-4 status-badge rows of the same height and a faint counts row, so content settles in place. Add a Retry button to the error branch (currently a dead-end red line) that re-triggers the SWR fetch via mutate.

## Reasoning
Skeletons that match final layout eliminate the jarring reflow when data arrives and make perceived load time shorter, while a retry on the error state turns a dead end into a recoverable one. These are small, low-risk refinements that compound into a noticeably more finished detail view.

## Context

**Note**: This section provides supporting architectural documentation and is NOT a hard requirement. Use it as guidance to understand existing code structure and maintain consistency.

### Context: Agents (Personas) Management

**Description**: Dashboard agent/persona list and detail flows � drawer with detail/subscriptions/memory panels, optimistic updates with rollback in personaStore, agent detail cache, demo-only mock data layer.
**Related Files**:
- `src/app/dashboard/agents/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/AgentDetail.tsx`
- `src/components/dashboard/AgentDetailDrawer.tsx`
- `src/components/dashboard/PersonaAvatar.tsx`
- `src/components/dashboard/SubscriptionsPanel.tsx`
- `src/components/dashboard/MemoryActionsPanel.tsx`
- `src/stores/personaStore.ts`
- `src/lib/agentDetailCache.ts`
- `src/lib/dashboard-queries.ts`
- `src/lib/api.ts`
- `src/lib/mockApi.ts`
- `src/lib/mock-dashboard-data.ts`

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