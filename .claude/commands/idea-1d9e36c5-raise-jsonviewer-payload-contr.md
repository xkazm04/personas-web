Execute this requirement immediately without asking questions.

## REQUIREMENT

# Raise JsonViewer payload contrast + drop raw text-white

## Metadata
- **Category**: ui
- **Effort**: Medium (2/3)
- **Impact**: Unknown (5/3)
- **Scan Type**: ui_perfectionist
- **Generated**: 5/24/2026, 10:22:41 AM

## Description
JsonViewer renders the payload <pre> at text-white/60 and JSON keys at raw text-white font-semibold. Monospace code at /60 sits at the WCAG AA edge and is tiring to read, and text-white violates the semantic-token rule. Move the body to text-foreground/80, keys to text-foreground, and route the syntax-highlight palette (cyan/amber/purple) through brand tokens so the payload reads crisply and matches the theme.

## Reasoning
The payload viewer is where engineers debug real event data, so legibility is functional, not cosmetic. Lifting body contrast above the AA threshold and removing palette literals improves readability for everyone and keeps the component on-theme.

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