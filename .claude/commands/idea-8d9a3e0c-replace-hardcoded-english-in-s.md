Execute this requirement immediately without asking questions.

## REQUIREMENT

# Replace hardcoded English in SubscriptionCard with i18n

## Metadata
- **Category**: code_quality
- **Effort**: High (3/3)
- **Impact**: Unknown (5/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:20:07 AM

## Description
SubscriptionCard.tsx hardcodes user-facing English: `"Unknown agent"` fallback and the toggle title attributes `"Disable subscription"`/`"Enable subscription"`. Add keys (e.g. eventsPage.unknownAgent, eventsPage.disableSubscription, eventsPage.enableSubscription) to en.ts and hand-translate into all 13 other locales, then reference them via useTranslation.

## Reasoning
The project treats hardcoded JSX/aria/title English as a non-negotiable violation, and these strings ship untranslated to 13 locales today. Fixing them restores i18n completeness and keeps the tooltip and fallback consistent with the rest of the surface.

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