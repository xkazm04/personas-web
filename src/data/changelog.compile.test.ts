import { describe, it, expect } from "vitest";
import { leadOf, parseChangelog, render, MAX_PER_RELEASE } from "../../scripts/compile-changelog.mjs";
import { COMPILED_RELEASES } from "./changelog.generated";

const SAMPLE = `# Changelog

## [Unreleased]

### Added
- **Deadlines on the canvas.** A checkbox asks for a date.
- internal bullet with no bold lead
- **Wrapped lead.** Detail that
  continues on the next line.

### Removed
- **The Artist plugin is gone.** Data too.

### Security
- **Ignored section.** Not mapped.

## [0.4.0] — 2026-04

### Fixed
- **Crash on empty run.** Fixed.
`;

describe("compile-changelog", () => {
  it("takes the bold lead, dropping the trailing period", () => {
    expect(leadOf("**Lead sentence.** rest")).toBe("Lead sentence");
    expect(leadOf("plain bullet")).toBeNull();
  });

  it("maps sections to change types, drops un-bolded bullets, breaking first", () => {
    const [unreleased, v04] = parseChangelog(SAMPLE);
    expect(unreleased.version).toBe("Unreleased");
    expect(unreleased.changes).toEqual([
      { text: "The Artist plugin is gone", type: "breaking" },
      { text: "Deadlines on the canvas", type: "feature" },
      { text: "Wrapped lead", type: "feature" },
    ]);
    expect(v04).toMatchObject({ version: "0.4.0", date: "2026-04", changes: [{ text: "Crash on empty run", type: "fix" }] });
  });

  it("caps each release", () => {
    const many = "## [1.2.0] — 2026-10-01\n\n### Added\n" + Array.from({ length: 30 }, (_, i) => `- **Item ${i}.** x`).join("\n");
    const [r] = parseChangelog(many);
    expect(r.total).toBe(30);
    expect(r.changes).toHaveLength(MAX_PER_RELEASE);
  });

  it("renders deterministically", () => {
    expect(render(parseChangelog(SAMPLE))).toBe(render(parseChangelog(SAMPLE)));
  });

  it("the committed generated file has a valid shape", () => {
    expect(COMPILED_RELEASES.length).toBeGreaterThan(0);
    for (const r of COMPILED_RELEASES) expect(r.changes.length).toBeLessThanOrEqual(MAX_PER_RELEASE);
  });
});
