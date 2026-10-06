import type { Translations } from "@/i18n/en";
import { untilLabel } from "../home-page/relativeLabels";
import { judge, type DimensionId, type MissionReadings, type Reading, type Verdict } from "./readings";

type MissionCopy = Translations["dashboard"]["home"]["mission"];

export interface DimensionView {
  id: DimensionId;
  /** 1-based keyboard shortcut. */
  key: number;
  label: string;
  question: string;
  verdict: Verdict;
  state: string;
  /** The big number; an em dash when there is nothing to show. */
  figure: string;
  evidence: string;
  /** Bars for the cell's trace, with the value that fills a bar; null for none. */
  trace: { values: number[]; max: number } | null;
}

/** Fill `{name}` placeholders. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

const money = (usd: number) => `$${usd.toFixed(2)}`;

/** Turns one reading into what its cell shows. Pure: `now` comes from the caller's clock. */
export function describeDimension(
  id: DimensionId,
  index: number,
  readings: MissionReadings,
  copy: MissionCopy,
  now: number,
): DimensionView {
  const verdict = judge(id, readings[id]);
  const base = {
    id,
    key: index + 1,
    label: copy.dims[id].label,
    question: copy.dims[id].question,
    verdict,
    state: copy.verdicts[verdict],
  };
  const reading = readings[id];
  if (reading.status !== "ready") {
    return {
      ...base,
      figure: "—",
      evidence:
        reading.status === "failed"
          ? reading.error
          : reading.status === "unmeasured"
            ? copy.evidence.unmeasured
            : copy.evidence.pending,
      trace: null,
    };
  }
  return { ...base, ...describeReady(readings, id, copy, now) };
}

function describeReady(
  readings: MissionReadings,
  id: DimensionId,
  copy: MissionCopy,
  now: number,
): Pick<DimensionView, "figure" | "evidence" | "trace"> {
  const e = copy.evidence;
  switch (id) {
    case "outcomes": {
      const v = ready(readings.outcomes);
      return {
        figure: v.successRate === null ? "—" : `${v.successRate}%`,
        evidence: v.runs > 0 ? fill(e.outcomes, { runs: v.runs, failed: v.failed }) : e.noRuns,
        trace: { values: v.trace, max: 1 },
      };
    }
    case "agents": {
      const v = ready(readings.agents);
      return {
        figure: v.score === null ? "—" : `${v.score}${copy.scoreSuffix}`,
        evidence: fill(e.agents, { critical: v.critical, degraded: v.degraded, healthy: v.healthy }),
        trace: { values: v.trace, max: 100 },
      };
    }
    case "queue": {
      const v = ready(readings.queue);
      return {
        figure: String(v.total),
        evidence: v.total > 0 ? fill(e.queue, { ...v }) : e.queueEmpty,
        trace: { values: [v.alerts, v.reviews, v.memory, v.reports], max: Math.max(1, v.alerts, v.reviews, v.memory, v.reports) },
      };
    }
    case "recovery": {
      const v = ready(readings.recovery);
      return {
        figure: String(v.open),
        evidence: fill(e.recovery, { open: v.open, paused: v.paused, fixed: v.autoFixed }),
        trace: null,
      };
    }
    case "spend": {
      const v = ready(readings.spend);
      return {
        figure: money(v.total),
        evidence:
          v.anomalies > 0
            ? fill(e.spendSpikes, { n: v.anomalies })
            : v.perDay === null
              ? e.noRuns
              : fill(e.spendPerDay, { value: money(v.perDay) }),
        trace: { values: v.trace, max: Math.max(0.0001, ...v.trace) },
      };
    }
    case "autonomy": {
      const v = ready(readings.autonomy);
      return {
        figure: String(v.scheduled),
        evidence:
          v.scheduled > 0 && v.nextAtMs !== null
            ? fill(e.autonomy, { n: v.scheduled, time: untilLabel(v.nextAtMs, now) })
            : e.autonomyEmpty,
        trace: null,
      };
    }
    case "vault": {
      const v = ready(readings.vault);
      return {
        figure: String(v.overdue + v.anomalies),
        evidence: fill(e.vault, { overdue: v.overdue, anomalies: v.anomalies, events: v.events }),
        trace: null,
      };
    }
    case "instruments": {
      const v = ready(readings.instruments);
      return {
        figure: `${v.ok}/${v.total}`,
        evidence: v.ok < v.total ? fill(e.instruments, { failed: v.total - v.ok }) : e.instrumentsOk,
        trace: null,
      };
    }
  }
}

/** The value of a reading the caller has already checked is ready. */
function ready<T>(reading: Reading<T>): T {
  if (reading.status !== "ready") throw new Error(`mission reading is ${reading.status}`);
  return reading.value;
}
