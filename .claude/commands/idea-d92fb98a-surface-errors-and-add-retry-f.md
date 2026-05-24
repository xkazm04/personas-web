Execute this requirement immediately without asking questions.

## REQUIREMENT

# Surface errors and add retry for execute and detail load

## Metadata
- **Category**: code_quality
- **Effort**: Unknown (4/3)
- **Impact**: Unknown (6/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:20:07 AM

## Description
AgentsPage.handleExecute swallows failures in a bare catch (`// TODO: toast`) and AgentDetail renders load failures as a single red line with no recovery. Add an error toast/inline message for execute failures and a 'Retry' button on the AgentDetail error state that re-calls loadAgentDetail. Keep payloads scrubbed via sentry-pii before any capture.

## Reasoning
Silent failure is the worst outcome for a control surface—users cannot tell whether an action worked or how to recover. Visible, recoverable errors raise perceived reliability and reduce confusion on the most-used flows in this context.

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