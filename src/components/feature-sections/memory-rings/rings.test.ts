import { describe, it, expect } from "vitest";

import snapshot from "@/lib/product-facts/desktop-facts.json";
import { MEMORY_KINDS } from "./shared/categories";
import { SEEDS, STUMBLES, isStumble } from "./rings";

const INVENTED = ["decision", "insight", "learning", "warning"];

describe("memory rings: the kinds are the desktop's memory categories", () => {
  it("MEMORY_KINDS equals the desktop's MEMORY_CATEGORIES and none of the invented kinds", () => {
    expect([...MEMORY_KINDS]).toEqual(snapshot.memoryCategories);
    expect(MEMORY_KINDS.some((k) => INVENTED.includes(k))).toBe(false);
  });

  it("every seed is a real kind, and every kind is on at least one seed", () => {
    const kinds: string[] = snapshot.memoryCategories;
    for (const s of SEEDS) expect(kinds).toContain(s.k);
    for (const k of kinds) expect(SEEDS.some((s) => s.k === k)).toBe(true);
  });

  it("a stumble is exactly a learned or constraint memory", () => {
    for (const s of SEEDS) expect(isStumble(s)).toBe(s.k === "learned" || s.k === "constraint");
    expect(STUMBLES.length).toBe(SEEDS.filter((s) => s.k === "learned" || s.k === "constraint").length);
  });
});
