"use client";

import { ExecutionLink } from "@/components/dashboard/ExecutionLink";
import { useTranslation } from "@/i18n/useTranslation";
import type { BlastRadius, BlastRadiusInputs } from "@/lib/blastRadius";
import { fillTemplate } from "@/lib/fillTemplate";

const CHIP = "flex items-center gap-1.5 rounded-full border border-glass-hover px-2 py-0.5 text-muted";

/**
 * What a failing integration takes out: the agents that call its tools (each
 * chip opens that agent's latest run; no run, no link), the open SLAs they
 * own, and the tools no integration claims.
 */
export function BlastRadiusPanel({ radius, inputs }: { radius: BlastRadius; inputs: BlastRadiusInputs }) {
  const { t } = useTranslation();
  const blast = t.healthPage.blast;

  return (
    <div className="mt-1.5 space-y-1 pl-[1.125rem] text-sm" data-testid="blast-radius">
      <p className="text-foreground">
        {fillTemplate(blast.impact, {
          agents: radius.personas.length,
          total: inputs.totalPersonas,
          calls: radius.invocations,
        })}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {radius.personas.map((p) => {
          const runId = inputs.latestRunByPersona?.[p.id];
          const chip = (
            <>
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </>
          );
          return (
            <li key={p.id}>
              {runId ? (
                <ExecutionLink
                  executionId={runId}
                  aria-label={fillTemplate(blast.latestRun, { name: p.name })}
                  className={`${CHIP} transition-colors hover:text-foreground focus-ring focus-visible:ring-offset-0`}
                >
                  {chip}
                </ExecutionLink>
              ) : (
                <span className={CHIP}>{chip}</span>
              )}
            </li>
          );
        })}
      </ul>
      {radius.slaAtRisk.length > 0 && (
        <p className="text-muted-dark">{fillTemplate(blast.sla, { n: radius.slaAtRisk.length })}</p>
      )}
      {radius.unmappedTools > 0 && (
        <p className="text-muted-dark">{fillTemplate(blast.unmapped, { n: radius.unmappedTools })}</p>
      )}
    </div>
  );
}
