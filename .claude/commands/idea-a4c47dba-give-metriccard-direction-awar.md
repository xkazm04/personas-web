Execute this requirement immediately without asking questions.

## REQUIREMENT

# Give MetricCard direction-aware trend colors

## Metadata
- **Category**: ui
- **Effort**: High (3/3)
- **Impact**: Unknown (6/3)
- **Scan Type**: delight_designer
- **Generated**: 5/24/2026, 10:34:02 AM

## Description
MetricCard.tsx colors any positive trend green and any negative trend red (lines 48-60). For cost, latency, and error-rate metrics a rising number is bad, so the green up-arrow is misleading. Add a goodDirection prop (up by default, down for cost/latency/errors) that picks the arrow icon and color from whether the change is favorable, not merely from its numeric sign. Apply it wherever cost and error metrics render.

## Reasoning
Showing a rise in spend or errors as a reassuring green signal trains users to misread the dashboard at a glance. Direction-aware coloring is a small, well-contained change that makes every metric tile honest and instantly scannable.

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