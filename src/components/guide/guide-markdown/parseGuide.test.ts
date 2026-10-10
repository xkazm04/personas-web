import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { HeadingAnchor } from "./HeadingAnchor";
import { headingsOf, parseGuide, stepsOf, type GuideNode } from "./parseGuide";
import { renderGuideDoc } from "./renderGuideDoc";

// One grammar for the guide dialect: the renderer, the content gate, the TOC
// and the HowTo JSON-LD all read the tree parseGuide builds, so none of them can
// disagree with the page about what a block holds.
const md = (...lines: string[]) => lines.join("\n");
const ofType = <T extends GuideNode["type"]>(doc: GuideNode[], type: T) =>
  doc.filter((n): n is Extract<GuideNode, { type: T }> => n.type === type);

describe("parseGuide - code-compare picks its side from structure, not English words", () => {
  it("routes the second version of testing.ts into the after panel", () => {
    const { doc } = parseGuide(md(
      ":::code-compare",
      "### v3 (baseline)",
      "Summarize the document.",
      "Keep it short.",
      "---",
      "### v4 (candidate)",
      "Summarize the document in exactly",
      "3 bullet points.",
      ":::",
    ));
    const [cc] = ofType(doc, "code-compare");
    expect(cc).toMatchObject({ beforeLabel: "v3 (baseline)", before: "Summarize the document.\nKeep it short.", afterLabel: "v4 (candidate)" });
    expect(cc.after.startsWith("Summarize the document in exactly")).toBe(true);
  });

  it("splits on the separator and heading order in any language", () => {
    const [cc] = ofType(parseGuide(":::code-compare\n### Version A\nx\n---\n### Version B\ny\n:::").doc, "code-compare");
    expect(cc).toMatchObject({ before: "x", after: "y", beforeLabel: "Version A", afterLabel: "Version B" });
  });
});

describe("parseGuide - payload diagnostics the gate can see", () => {
  it("reports a known block with no valid items as empty-block, and emits no node", () => {
    const { doc, diagnostics } = parseGuide(":::keys\nCtrl+K opens search\n:::");
    expect(doc).toEqual([]);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({ kind: "empty-block", directive: "keys", line: 1 });
  });

  it("keeps valid card items and reports the line it ignored", () => {
    const { doc, diagnostics } = parseGuide(":::cards\n[available] Slack | chat\n[planned] Teams | chat\n:::");
    const cards = ofType(doc, "cards");
    expect(cards).toHaveLength(1);
    expect(cards[0].items).toHaveLength(1);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({ kind: "ignored-line", directive: "cards", line: 3 });
  });

  it("GUARD: unknown directives and stray closers keep their diagnostics", () => {
    const unknown = parseGuide(":::tipp\ntypo\n:::");
    expect(unknown.doc).toEqual([]);
    expect(unknown.diagnostics.map((d) => [d.line, d.kind])).toEqual([[1, "unknown"]]);
    expect(parseGuide("para\n:::").diagnostics.map((d) => [d.line, d.kind])).toEqual([[2, "stray-close"]]);
  });
});

describe("parseGuide - projections", () => {
  it("headingsOf lists a heading the renderer renders after a nested opener closes tabs", () => {
    const { doc } = parseGuide(":::tabs\n### A\n:::tip\n## Real\n:::");
    expect(headingsOf(doc).map((h) => h.id)).toContain("real");
  });

  it("stepsOf keeps continuation lines, exactly as StepWizard receives them", () => {
    const { doc } = parseGuide(":::steps\n1. **Install** - get it\nthen restart\n:::");
    expect(stepsOf(doc)).toEqual([{ title: "Install", body: "get it then restart" }]);
    const [steps] = ofType(doc, "steps");
    expect(steps.steps).toEqual(stepsOf(doc));
  });
});

// ── Corpus: every topic body in English and the 13 locales ─────────────────
const ROOT = path.resolve(__dirname, "../../../..");
const contentDirs = [
  "src/data/guide/content",
  ...readdirSync(path.join(ROOT, "src/data/guide/locales"))
    .map((loc) => `src/data/guide/locales/${loc}/content`)
    .filter((dir) => existsSync(path.join(ROOT, dir))),
];

async function loadBodies(dirs: string[]): Promise<{ where: string; body: string }[]> {
  const out: { where: string; body: string }[] = [];
  for (const dir of dirs) {
    for (const file of readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(".ts") && f !== "index.ts")) {
      const mod = (await import(pathToFileURL(path.join(ROOT, dir, file)).href)) as { content?: Record<string, string> };
      for (const [topic, body] of Object.entries(mod.content ?? {})) out.push({ where: `${dir}/${file} ${topic}`, body });
    }
  }
  return out;
}

describe("parseGuide - corpus", () => {
  it("the tree is plain data for every English topic body", async () => {
    const bodies = await loadBodies([contentDirs[0]]);
    expect(bodies.length).toBeGreaterThan(50);
    for (const { body } of bodies) {
      const parsed = parseGuide(body);
      expect(JSON.parse(JSON.stringify(parsed))).toEqual(parsed);
    }
  }, 60_000);

  it("14 locales x every topic: zero diagnostics, and TOC ids equal rendered heading ids", async () => {
    const bodies = await loadBodies(contentDirs);
    expect(contentDirs.length).toBe(14);
    const failures: string[] = [];
    for (const { where, body } of bodies) {
      const { doc, diagnostics } = parseGuide(body);
      for (const d of diagnostics) failures.push(`${where} line ${d.line}: ${d.kind}`);
      const rendered = (renderGuideDoc(doc) as ReactElement[])
        .filter((el) => isValidElement(el) && el.type === HeadingAnchor)
        .map((el) => (el.props as { id: string }).id);
      const toc = headingsOf(doc).map((h) => h.id);
      if (JSON.stringify(rendered) !== JSON.stringify(toc)) failures.push(`${where}: TOC ids differ from rendered ids`);
    }
    expect(failures).toEqual([]);
  }, 60_000);
});
