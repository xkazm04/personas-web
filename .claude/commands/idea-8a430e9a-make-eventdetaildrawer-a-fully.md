Execute this requirement immediately without asking questions.

## REQUIREMENT

# Make EventDetailDrawer a fully accessible dialog

## Metadata
- **Category**: ui
- **Effort**: Unknown (4/3)
- **Impact**: Unknown (6/3)
- **Scan Type**: delight_designer
- **Generated**: 5/24/2026, 10:34:02 AM

## Description
EventDetailDrawer.tsx renders a slide-in overlay panel but omits role=dialog, aria-modal, focus trapping, Escape-to-close, and focus restore on dismiss. The sibling AgentDetailDrawer.tsx already implements this pattern. Port it over: add role=dialog/aria-modal/aria-labelledby, trap Tab focus inside the panel, close on Escape, and return focus to the triggering node on close. Also replace the hardcoded green Active status (lines 95-100) with the real node status.

## Reasoning
Keyboard and screen-reader users currently cannot escape or navigate the drawer, and the always-green status misleads every viewer. Reusing the existing AgentDetailDrawer pattern keeps this low-risk and brings the event drawer to WCAG parity with the rest of the dashboard.

## Context

**Note**: This section provides supporting architectural documentation and is NOT a hard requirement. Use it as guidance to understand existing code structure and maintain consistency.

### Context: Event Bus & Observability

**Description**: Dashboard event bus visualization, swimlane/topology diagram, observability charts (latency, cost, exec, traffic), system health, SLA tracking, leaderboard, home overview.
**Related Files**:
- `src/app/dashboard/events/page.tsx`
- `src/app/dashboard/observability/page.tsx`
- `src/app/dashboard/home/page.tsx`
- `src/app/dashboard/sla/page.tsx`
- `src/app/dashboard/leaderboard/page.tsx`
- `src/app/api/events/stream/route.ts`
- `src/components/dashboard/EventBusVisualization.tsx`
- `src/components/dashboard/EventBusStats.tsx`
- `src/components/dashboard/EventDetailDrawer.tsx`
- `src/components/dashboard/EventsListPanel.tsx`
- `src/components/dashboard/EventSwimlane.tsx`
- `src/components/dashboard/TrafficChart.tsx`
- `src/components/dashboard/LatencyChart.tsx`
- `src/components/dashboard/ObservabilityCharts.tsx`
- `src/components/dashboard/ObservabilityCostChart.tsx`
- `src/components/dashboard/ObservabilityExecChart.tsx`
- `src/components/dashboard/ObservabilitySpendPieChart.tsx`
- `src/components/dashboard/CostChartWithCompare.tsx`
- `src/components/dashboard/ExecChartWithCompare.tsx`
- `src/components/dashboard/HealthDigestPanel.tsx`
- `src/components/dashboard/HealthIssueRow.tsx`
- `src/components/dashboard/MetricCard.tsx`
- `src/components/dashboard/Sparkline.tsx`
- `src/components/dashboard/UsageCharts.tsx`
- `src/components/dashboard/JsonViewer.tsx`
- `src/components/dashboard/ConnectionStatusIndicator.tsx`
- `src/stores/eventStore.ts`
- `src/stores/systemStore.ts`
- `src/hooks/useEventStream.ts`
- `src/hooks/useEventTopology.ts`
- `src/hooks/useLiveStats.ts`

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