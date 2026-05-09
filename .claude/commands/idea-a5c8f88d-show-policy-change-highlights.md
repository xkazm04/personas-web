Execute this requirement immediately without asking questions.

## REQUIREMENT

# Show policy change highlights since last visit

## Metadata
- **Category**: user_benefit
- **Effort**: High (3/3)
- **Impact**: Unknown (6/3)
- **Scan Type**: user_empathy_champion
- **Generated**: 4/14/2026, 2:33:20 PM

## Description
Add a "What changed" expandable section below the "Last updated: April 2026" date on each policy tab. When users return to the legal page after a policy update, they see a brief changelog (e.g., "Added clarity on cloud feature data storage") instead of having to re-read the entire document. Use a subtle badge or indicator on the tab itself if that policy has been updated since the date stored in localStorage.

## Reasoning
Users who revisit legal pages feel anxious about what might have changed � did they silently add tracking? Did terms get worse? The current design only shows "Last updated: April 2026" with no context on what changed. This creates distrust through ambiguity. A changelog transforms a moment of suspicion into one of transparency, reinforcing the privacy-first brand promise. For a product that prides itself on zero telemetry and user trust, this is a natural fit.

## Context

**Note**: This section provides supporting architectural documentation and is NOT a hard requirement. Use it as guidance to understand existing code structure and maintain consistency.

### Context: Legal & Security Pages

**Description**: Legal page with terms of service, privacy policy, and cookie policy tabs, plus security page with trust signals and data protection information
**Related Files**:
- `src/app/legal/page.tsx`
- `src/app/legal/LegalContent.tsx`
- `src/app/legal/policies/CookiePolicy.tsx`
- `src/app/legal/policies/PrivacyPolicy.tsx`
- `src/app/legal/policies/TermsOfService.tsx`
- `src/app/security/page.tsx`
- `src/app/security/layout.tsx`
- `src/data/security.ts`
- `src/data/tour.ts`

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