import { describe, it, expect } from "vitest";
import { GUIDE_TOPICS } from "./topics";
import { DESKTOP_MODULES, TOPIC_MODULE_MAP } from "./desktop-modules";

/**
 * Direction: "Close the Find-in-App gaps". TOPIC_MODULE_MAP used to lag
 * GUIDE_TOPICS silently — 16 topics (all of Companion, plus templates/modes
 * and the Goals/KPIs/Director expansion) had no entry, so their pages simply
 * omitted the "Find in App" badge with no signal that anything was missing.
 *
 * These assertions make that drift impossible to reintroduce quietly: the set
 * of unmapped topics must stay empty, and every map key/moduleId must resolve.
 */

describe("TOPIC_MODULE_MAP coverage", () => {
  it("maps every guide topic (no topic silently loses its Find-in-App badge)", () => {
    const unmapped = GUIDE_TOPICS.filter((t) => !TOPIC_MODULE_MAP[t.id]).map((t) => t.id);
    // Known-unmapped set must be empty. If this fails, add an entry in
    // desktop-modules.ts for each listed topic id (or, if a topic is
    // intentionally location-less, document why here before excluding it).
    expect(unmapped, `Topics missing a TOPIC_MODULE_MAP entry: ${unmapped.join(", ")}`).toEqual([]);
  });

  it("has no orphan map keys pointing at a non-existent topic", () => {
    const topicIds = new Set(GUIDE_TOPICS.map((t) => t.id));
    const orphans = Object.keys(TOPIC_MODULE_MAP).filter((id) => !topicIds.has(id));
    expect(orphans, `TOPIC_MODULE_MAP keys with no matching topic: ${orphans.join(", ")}`).toEqual([]);
  });

  it("references a real module id and a non-empty path for every entry", () => {
    const moduleIds = new Set(DESKTOP_MODULES.map((m) => m.id));
    for (const [topicId, ref] of Object.entries(TOPIC_MODULE_MAP)) {
      expect(moduleIds.has(ref.moduleId), `${topicId} → unknown moduleId "${ref.moduleId}"`).toBe(true);
      expect(ref.path.length, `${topicId} has an empty path`).toBeGreaterThan(0);
      expect(ref.label.length, `${topicId} has an empty label`).toBeGreaterThan(0);
    }
  });
});

describe("TOPIC_MODULE_MAP breadcrumb against the mirror", () => {
  // The Agents editor tabs sit under an "Editor" breadcrumb segment that the
  // desktop shows as a tab strip, not as a sidebar node, so the mirror has no
  // child labelled "Editor". It is the one documented virtual segment.
  const VIRTUAL_SEGMENTS: Record<string, string> = { agents: "Editor" };

  it("starts every path at the label of its moduleId", () => {
    const labels = new Map(DESKTOP_MODULES.map((m) => [m.id, m.label]));
    const wrong = Object.entries(TOPIC_MODULE_MAP)
      .filter(([, ref]) => ref.path[0] !== labels.get(ref.moduleId))
      .map(([id, ref]) => `${id}: ${ref.moduleId} vs ${ref.path[0]}`);
    expect(wrong, `Paths whose first segment is not their module label: ${wrong.join("; ")}`).toEqual([]);
  });

  it("resolves the segment after the module (past a documented virtual one) to a mirror child label", () => {
    const byId = new Map(DESKTOP_MODULES.map((m) => [m.id, m]));
    const unresolved: string[] = [];
    for (const [id, ref] of Object.entries(TOPIC_MODULE_MAP)) {
      const children = byId.get(ref.moduleId)?.children;
      if (!children?.length) continue;
      let rest = ref.path.slice(1);
      if (rest[0] && rest[0] === VIRTUAL_SEGMENTS[ref.moduleId]) rest = rest.slice(1);
      if (rest.length && !children.some((c) => c.label === rest[0])) unresolved.push(`${id}: ${ref.path.join(" > ")}`);
    }
    expect(unresolved, `Paths naming a child the mirror does not have: ${unresolved.join("; ")}`).toEqual([]);
  });
});
