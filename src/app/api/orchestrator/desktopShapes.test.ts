import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DESKTOP_SHAPES, matchDesktopShape } from "./desktopShapes";

/** Index just past the bracket group opening at `i`, honouring nesting. */
function skipGroup(src: string, i: number, open: string, close: string): number {
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === open) depth++;
    else if (src[i] === close && --depth === 0) return i + 1;
  }
  return i;
}

/** Every orchestratorFetch call in api.ts as "METHOD /pattern". */
function extractShapes(): string[] {
  const src = readFileSync(join(process.cwd(), "src/lib/api.ts"), "utf8");
  const shapes: string[] = [];
  for (const m of src.matchAll(/orchestratorFetch\s*(?=[<(])/g)) {
    let i = m.index + m[0].length;
    // Type arguments may span lines and hold arrows (`=>`), so balance on `<`/`>` ignoring `=>`.
    if (src[i] === "<") {
      let depth = 0;
      for (; i < src.length; i++) {
        if (src[i] === "<") depth++;
        else if (src[i] === ">" && src[i - 1] !== "=" && --depth === 0) break;
      }
      i++;
    }
    while (/\s/.test(src[i])) i++;
    if (src[i] !== "(") continue;
    const call = src.slice(i, skipGroup(src, i, "(", ")"));
    const arg = /^\(\s*([`"])(\/[^`"]*)\1/.exec(call);
    if (!arg) continue;
    const path = arg[2].replace(/\$\{[^}]*\}/g, ":id");
    const method = /method:\s*"([A-Z]+)"/.exec(call)?.[1] ?? "GET";
    shapes.push(`${method} ${path}`);
  }
  return shapes;
}

describe("desktop shape table", () => {
  it("has exactly one entry per call shape in api.ts", () => {
    const calls = extractShapes();
    // Call sites, not distinct shapes: a broken extractor finds none.
    expect(calls.length).toBeGreaterThanOrEqual(20);
    expect([...new Set(calls)].sort()).toEqual(Object.keys(DESKTOP_SHAPES).sort());
  });

  it("matches by method and segments, ignoring unknown shapes", () => {
    expect(matchDesktopShape("GET", ["api", "personas", "p1"])).toMatchObject({ served: "desktop" });
    expect(matchDesktopShape("DELETE", ["api", "personas", "p1"])).toMatchObject({ served: "not_on_desktop" });
    expect(matchDesktopShape("POST", ["api", "execute", "p1"])).toBeNull();
    expect(matchDesktopShape("GET", ["nope"])).toBeNull();
  });
});
