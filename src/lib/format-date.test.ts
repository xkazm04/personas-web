import { describe, it, expect } from "vitest";
import { formatDateShort, formatDateLong } from "./format-date";

describe("format-date (UTC-stable, regardless of host timezone)", () => {
  it("formats a YYYY-MM-DD date in UTC", () => {
    expect(formatDateShort("2026-03-15")).toBe("Mar 15, 2026");
    expect(formatDateLong("2026-03-15")).toBe("March 15, 2026");
  });

  it("does not slip a day for an early-month date (no local-tz drift)", () => {
    // Parsed as UTC midnight, formatted in UTC — a west-of-UTC host must not
    // render the previous day.
    expect(formatDateShort("2026-01-01")).toBe("Jan 1, 2026");
  });

  it("returns '' for malformed/empty input instead of the literal 'Invalid Date'", () => {
    expect(formatDateShort("")).toBe("");
    expect(formatDateShort("not-a-date")).toBe("");
    expect(formatDateLong("")).toBe("");
    expect(formatDateLong("2026-13-99")).toBe("");
  });
});
