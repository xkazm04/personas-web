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
