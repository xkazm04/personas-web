import type { ToolUsageByPersona } from "./types";

/**
 * Blast radius of a failing integration check: which agents actually call its
 * tools, how many invocations that is, and which open SLA breaches belong to
 * those agents. Pure and derived from tool usage (who calls which tool), so
 * the radius heals when the check settles.
 *
 * A tool belongs to an integration by name prefix (`slack_send_message` ->
 * `slack_`). Custom tools that match no integration's prefix cannot be
 * attributed; they are counted in `unmappedTools` rather than hidden.
 */

/** Check id -> tool-name prefixes that integration owns. */
export type IntegrationPrefixes = Readonly<Record<string, readonly string[]>>;

/** The slice of an SLA breach the radius needs. */
export interface BreachRef {
  id: string;
  persona: string;
  resolvedAt: string | null;
}

/** Everything the health panel needs to compute radii (one demo fetch). */
export interface BlastRadiusInputs {
  usage: ToolUsageByPersona[];
  breaches: BreachRef[];
  totalPersonas: number;
  /** Persona id -> its most recent run's id, so an affected agent's chip can open that run. */
  latestRunByPersona?: Readonly<Record<string, string>>;
}

export interface BlastRadius {
  /** Agents with at least one invocation of the integration's tools. */
  personas: { id: string; name: string; color: string; invocations: number }[];
  /** Total invocations of the integration's tools across the fleet. */
  invocations: number;
  /** Ids of open breaches owned by an affected agent. */
  slaAtRisk: string[];
  /** Distinct tools in the usage data that no integration prefix claims. */
  unmappedTools: number;
}

/** Health check ids -> the tool prefixes their integration exposes. */
export const INTEGRATION_PREFIXES: IntegrationPrefixes = {
  in_github: ["github_"],
  in_slack: ["slack_"],
  in_gcal: ["gcal_", "google_calendar_"],
  in_openai: ["openai_"],
  in_stripe: ["stripe_"],
  in_gemini: ["gemini_"],
};

function matches(tool: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => tool.startsWith(p));
}

/**
 * Radius of `checkId`, or null when the check is not an integration with a
 * prefix map (runtime / service / resource rows have no tool dependency).
 */
export function blastRadius(
  checkId: string,
  usage: readonly ToolUsageByPersona[],
  prefixesByCheck: IntegrationPrefixes,
  breaches: readonly BreachRef[],
): BlastRadius | null {
  const prefixes = prefixesByCheck[checkId];
  if (!prefixes) return null;

  const allPrefixes = Object.values(prefixesByCheck).flat();
  const unmapped = new Set<string>();
  const personas: BlastRadius["personas"] = [];
  let invocations = 0;

  for (const p of usage) {
    let mine = 0;
    for (const [tool, count] of Object.entries(p.tools)) {
      if (matches(tool, prefixes)) mine += count;
      else if (!matches(tool, allPrefixes)) unmapped.add(tool);
    }
    if (mine > 0) {
      personas.push({ id: p.personaId, name: p.personaName, color: p.personaColor, invocations: mine });
      invocations += mine;
    }
  }

  const affected = new Set(personas.map((p) => p.name));
  const slaAtRisk = breaches.filter((b) => b.resolvedAt === null && affected.has(b.persona)).map((b) => b.id);

  return { personas, invocations, slaAtRisk, unmappedTools: unmapped.size };
}
