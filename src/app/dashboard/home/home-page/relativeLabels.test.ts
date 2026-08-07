import { describe, expect, it } from "vitest";

import { effectiveNextRunMs, sinceLabel, untilLabel } from "./relativeLabels";

const NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
const MIN = 60_000;
const iso = (offsetMinutes: number) => new Date(NOW + offsetMinutes * MIN).toISOString();

describe("sinceLabel", () => {
  it("ages as the clock advances", () => {
    const changedAt = iso(-4);
    expect(sinceLabel(changedAt, NOW)).toBe("4m");
    // The same fixture, twenty minutes later in the same session.
    expect(sinceLabel(changedAt, NOW + 20 * MIN)).toBe("24m");
  });

  it("rolls minutes into hours and days", () => {
    expect(sinceLabel(iso(-120), NOW)).toBe("2h");
    expect(sinceLabel(iso(-1440), NOW)).toBe("1d");
  });

  it("clamps future timestamps to 0m and ignores garbage", () => {
    expect(sinceLabel(iso(5), NOW)).toBe("0m");
    expect(sinceLabel("not-a-date", NOW)).toBe("");
  });
});

describe("untilLabel + effectiveNextRunMs", () => {
  it("counts an ETA down", () => {
    const nextRunAt = iso(6);
    expect(untilLabel(effectiveNextRunMs(nextRunAt, undefined, NOW), NOW)).toBe("6m");
    const later = NOW + 4 * MIN;
    expect(untilLabel(effectiveNextRunMs(nextRunAt, undefined, later), later)).toBe("2m");
  });

  it("rolls a cadenced run forward instead of pinning at 0m", () => {
    // Seeded 6 minutes out, repeating every 30. Twenty minutes into the session
    // the first run has already fired, so the card shows the next occurrence
    // (+36m) rather than freezing at "0m"; forty minutes in it shows the one
    // after that (+66m).
    const nextRunAt = iso(6);
    const at = (m: number) => untilLabel(effectiveNextRunMs(nextRunAt, 30, NOW + m * MIN), NOW + m * MIN);
    expect(at(20)).toBe("16m");
    expect(at(40)).toBe("26m");
  });

  it("leaves un-cadenced past runs alone (real triggers refetch)", () => {
    const later = NOW + 60 * MIN;
    expect(untilLabel(effectiveNextRunMs(iso(6), undefined, later), later)).toBe("0m");
  });

  it("returns an empty label for unparseable timestamps", () => {
    expect(untilLabel(effectiveNextRunMs("nope", 30, NOW), NOW)).toBe("");
  });
});
