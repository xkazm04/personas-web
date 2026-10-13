import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Contract evals for the project-owned skills under `.claude/skills/`.
 *
 * A skill is a prompt plus the tools it tells the agent to run. Neither can be
 * executed in CI: icon-gen's tools call Leonardo, Gemini and `sharp` and run
 * their CLI on import. What can be held is the agreement between the prompt and
 * the code it drives, which is where a skill silently gets worse: a flag the
 * prompt documents that the tool no longer reads, a default the prompt promises
 * that the tool changed, a model swapped under the prompt, a style or shared
 * component that was renamed away. Each case below is pinned inline; when one
 * fails, either the skill or the code moved, and the change has to be made on
 * purpose in both places.
 *
 * icon-gen's exported output is pinned separately by `iconSetGolden.test.ts`.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILLS_DIR = path.join(ROOT, ".claude", "skills");
const readText = (...parts: string[]) => fs.readFileSync(path.join(ROOT, ...parts), "utf8");
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Skill directories this spec covers. A new project-owned skill must be added here.
 * Registry skills are links (symlinks or junctions), not directories, and are skipped:
 * their evals belong with the skill in the registry.
 */
const COVERED_SKILLS = ["icon-gen", "ui-variant-prototype"];

describe("project-owned skills", () => {
  it("every skill directory under .claude/skills has a contract block here", () => {
    const dirs = fs
      .readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, "SKILL.md")))
      .map((d) => d.name)
      .sort();
    expect(dirs).toEqual([...COVERED_SKILLS].sort());
  });
});

/* ------------------------------------------------------------------ icon-gen */

const ICON_SKILL = readText(".claude", "skills", "icon-gen", "SKILL.md");
const toolSource = (file: string) => readText(".claude", "skills", "icon-gen", "tools", file);

/** Does the tool read `--flag` from its parsed args (`args.x`, `args['x']`, `opts.x`, `opts['x']`)? */
function toolReadsFlag(source: string, flag: string): boolean {
  const dotted = /^[a-z]+$/i.test(flag) ? `\\.${flag}\\b|` : "";
  return new RegExp(`(?:args|opts)(?:${dotted}\\['${escapeRe(flag)}'\\])`).test(source);
}

interface ToolCommand {
  tool: string;
  /** Sub-command, or null for a tool with no sub-commands. */
  command: string | null;
  flags: string[];
}

const ICON_COMMANDS: ToolCommand[] = [
  {
    tool: "leonardo-image.mjs",
    command: "generate",
    flags: ["prompt", "output", "width", "height", "style", "contrast", "no-cleanup"],
  },
  { tool: "leonardo-image.mjs", command: "remove-bg", flags: ["id", "output"] },
  { tool: "gemini-recognize.mjs", command: null, flags: ["input", "prompt"] },
  {
    tool: "icon-pipeline.mjs",
    command: "tile",
    flags: ["input", "output", "size", "bg", "radius", "pad", "trim", "trim-threshold", "glow", "glow-color"],
  },
  {
    tool: "icon-pipeline.mjs",
    command: "export",
    flags: ["input", "app-dir", "ico", "icon", "apple", "pwa-dir", "pwa", "bg"],
  },
];

/** Defaults SKILL.md states in its usage lines, and the tool must fall back to. */
const ICON_DEFAULTS: { tool: string; flag: string; value: string }[] = [
  { tool: "icon-pipeline.mjs", flag: "size", value: "1024" },
  { tool: "icon-pipeline.mjs", flag: "bg", value: "#0a0a12" },
  { tool: "icon-pipeline.mjs", flag: "radius", value: "0.22" },
  { tool: "icon-pipeline.mjs", flag: "pad", value: "0.10" },
  { tool: "icon-pipeline.mjs", flag: "trim-threshold", value: "10" },
  { tool: "icon-pipeline.mjs", flag: "glow-color", value: "6,182,212" },
  { tool: "icon-pipeline.mjs", flag: "ico", value: "16,32,48" },
  { tool: "icon-pipeline.mjs", flag: "icon", value: "512" },
  { tool: "icon-pipeline.mjs", flag: "apple", value: "180" },
];

describe("icon-gen skill contract", () => {
  it("frontmatter names the skill after its directory and describes it", () => {
    expect(ICON_SKILL.startsWith("---\n") || ICON_SKILL.startsWith("---\r\n")).toBe(true);
    expect(ICON_SKILL).toMatch(/^name: icon-gen\r?$/m);
    expect(ICON_SKILL).toMatch(/^description: \S.{40,}\r?$/m);
  });

  it("every tool the prompt runs exists, and every tool file is documented", () => {
    const referenced = new Set([...ICON_SKILL.matchAll(/tools\/([a-z-]+\.mjs)/g)].map((m) => m[1]));
    const onDisk = fs.readdirSync(path.join(SKILLS_DIR, "icon-gen", "tools")).filter((f) => f.endsWith(".mjs"));
    expect([...referenced].sort()).toEqual([...onDisk].sort());
  });

  for (const { tool, command, flags } of ICON_COMMANDS) {
    const label = command ? `${tool} ${command}` : tool;

    if (command) {
      it(`${label}: the tool dispatches the command the prompt runs`, () => {
        expect(toolSource(tool)).toContain(`case '${command}'`);
        expect(ICON_SKILL).toMatch(new RegExp(`${escapeRe(tool)} ${escapeRe(command)}\\b`));
      });
    }

    it(`${label}: every documented flag is read by the tool`, () => {
      const source = toolSource(tool);
      for (const flag of flags) {
        expect(ICON_SKILL, `SKILL.md documents --${flag}`).toContain(`--${flag}`);
        expect(toolReadsFlag(source, flag), `${tool} reads --${flag}`).toBe(true);
      }
    });
  }

  it("defaults stated in the prompt are the defaults the tool falls back to", () => {
    for (const { tool, flag, value } of ICON_DEFAULTS) {
      const documented =
        ICON_SKILL.includes(`--${flag} ${value}`) || ICON_SKILL.includes(`--${flag} "${value}"`);
      expect(documented, `SKILL.md states --${flag} defaults to ${value}`).toBe(true);
      const key = /^[a-z]+$/.test(flag) ? `(?:\\.${flag}|\\['${flag}'\\])` : `\\['${escapeRe(flag)}'\\]`;
      const fallback = new RegExp(`args${key}\\s*(?:\\|\\||\\?\\?)\\s*'${escapeRe(value)}'`);
      expect(fallback.test(toolSource(tool)), `${tool} falls back to --${flag} ${value}`).toBe(true);
    }
  });

  it("the Targets section agrees with the default export sizes", () => {
    const targets = ICON_SKILL.slice(ICON_SKILL.indexOf("## Targets"));
    expect(targets).toContain("`src/app/favicon.ico` — classic favicon (16/32/48)");
    expect(targets).toContain("`src/app/icon.png` — modern PNG icon (512)");
    expect(targets).toContain("`src/app/apple-icon.png` — apple-touch icon (180, square)");
    expect(targets).toContain("`public/icons/icon-192.png`, `icon-512.png`");
    const manifest = readText("src", "app", "manifest.ts");
    expect(manifest).toContain('"/icons/icon-192.png"');
    expect(manifest).toContain('"/icons/icon-512.png"');
  });

  it("the styles the prompt offers are exactly the styles the tool maps", () => {
    const documented = /Styles: `([^`]+)`/.exec(ICON_SKILL);
    expect(documented).not.toBeNull();
    const block = /const STYLE_UUIDS = \{([^}]*)\}/.exec(toolSource("leonardo-image.mjs"));
    expect(block).not.toBeNull();
    const mapped = [...block![1].matchAll(/^\s*([a-z]+):/gm)].map((m) => m[1]);
    expect(documented![1].split(/\s+/).sort()).toEqual(mapped.sort());
  });

  it("the stage-1 example uses a style and contrast the prompt lists", () => {
    const styles = /Styles: `([^`]+)`/.exec(ICON_SKILL)![1].split(/\s+/);
    const contrasts = /Contrast: `([^`]+)`/.exec(ICON_SKILL)![1].split(/\s+/);
    const example = /--style (\w+) --contrast ([\d.]+)/.exec(ICON_SKILL);
    expect(example).not.toBeNull();
    expect(styles).toContain(example![1]);
    expect(contrasts).toContain(example![2]);
  });

  it("models are pinned: a swap has to be made here on purpose", () => {
    // Lucid Origin is the model the prompt's anti-noise clauses were tuned against.
    expect(ICON_SKILL).toContain("Lucid Origin");
    expect(toolSource("leonardo-image.mjs")).toContain(
      "const LUCID_ORIGIN_MODEL = '7b592283-e8a7-4c5a-9ba6-d18c31f258b9';",
    );
    expect(toolSource("leonardo-image.mjs")).toContain("modelId: LUCID_ORIGIN_MODEL");
    expect(toolSource("gemini-recognize.mjs")).toContain(
      "const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';",
    );
  });

  it("every env var the prompt says to load is the one the tools read", () => {
    const env = ICON_SKILL.slice(ICON_SKILL.indexOf("## Environment"), ICON_SKILL.indexOf("## Brand direction"));
    const documented = [...env.matchAll(/^- `([A-Z_]+)`/gm)].map((m) => m[1]);
    expect(documented.sort()).toEqual(["GEMINI_API_KEY", "LEONARDO_API_KEY"]);
    const sources = ["leonardo-image.mjs", "gemini-recognize.mjs"].map(toolSource).join("\n");
    for (const name of documented) expect(sources).toContain(`process.env.${name}`);
  });

  it("the generation prompt keeps every anti-noise clause", () => {
    const stage1 = ICON_SKILL.slice(ICON_SKILL.indexOf("### 1. Generate"), ICON_SKILL.indexOf("### 2."));
    const flat = stage1.replace(/\s*\r?\n>\s*/g, " ");
    for (const clause of [
      "centered single emblem",
      "generous empty margin",
      "no text",
      "no words",
      "no watermark",
      "no scenery",
      "no environment",
      "no reflection",
      "no floor",
      "no background pattern",
      "crisp edges",
    ]) {
      expect(flat, clause).toContain(clause);
    }
  });

  it("the evaluation prompt scores five criteria and ends in a verdict", () => {
    const stage3 = ICON_SKILL.slice(ICON_SKILL.indexOf("### 3. Evaluate"), ICON_SKILL.indexOf("### 4."));
    for (const n of [1, 2, 3, 4, 5]) expect(stage3).toContain(`(${n})`);
    expect(stage3).toContain("reads at 16px");
    expect(stage3).toContain("VERDICT: ship / regenerate");
    expect(stage3).toContain("score ≤6");
  });

  it("the brand palette the prompt quotes matches src/styles/tokens.css", () => {
    const tokens = readText("src", "styles", "tokens.css");
    const quoted = [...ICON_SKILL.matchAll(/`(--[a-z-]+) (#[0-9a-f]{6})`/g)];
    expect(quoted.length).toBe(6);
    for (const [, name, hex] of quoted) expect(tokens, name).toContain(`${name}: ${hex};`);
  });
});

/* ------------------------------------------------------- ui-variant-prototype */

const VARIANT_SKILL = readText(".claude", "skills", "ui-variant-prototype", "SKILL.md");

describe("ui-variant-prototype skill contract", () => {
  it("names itself and its trigger", () => {
    expect(VARIANT_SKILL).toMatch(/^# UI Variant Prototyping\r?$/m);
    expect(VARIANT_SKILL).toContain("Trigger: `/ui-variant`");
  });

  it("the animation helpers its template imports are exported from @/lib/animations", () => {
    expect(VARIANT_SKILL).toContain('import { fadeUp, staggerContainer } from "@/lib/animations";');
    const animations = readText("src", "lib", "animations.ts");
    expect(animations).toMatch(/export const fadeUp\b/);
    expect(animations).toMatch(/export const staggerContainer\b/);
  });

  it("every shared component it tells the agent to reuse still exists", () => {
    const components: Record<string, string> = {
      GlowCard: "src/components/GlowCard.tsx",
      GradientText: "src/components/GradientText.tsx",
      MetricCard: "src/components/dashboard/MetricCard.tsx",
      FilterBar: "src/components/dashboard/FilterBar.tsx",
      StatusBadge: "src/components/dashboard/StatusBadge.tsx",
      PersonaAvatar: "src/components/dashboard/PersonaAvatar.tsx",
    };
    for (const [name, file] of Object.entries(components)) {
      expect(VARIANT_SKILL, `SKILL.md names ${name}`).toContain(name);
      expect(readText(file), file).toMatch(new RegExp(`export default function ${name}\\b`));
    }
  });

  it("the semantic tokens it prescribes are defined", () => {
    expect(VARIANT_SKILL).toContain("`text-foreground`");
    expect(VARIANT_SKILL).toContain("`text-muted-dark`");
    expect(readText("src", "styles", "tokens.css")).toContain("--muted-dark:");
  });

  it("its verify step is the repository's typecheck", () => {
    expect(VARIANT_SKILL).toContain("`npx tsc --noEmit`");
    const pkg = JSON.parse(readText("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts.typecheck).toBe("tsc --noEmit");
  });

  it("keeps the two-variant, no-modal, viewport-filling rules", () => {
    expect(VARIANT_SKILL).toContain("Creates **2 completely different UI/UX variants**");
    expect(VARIANT_SKILL).toContain("NOT a modal");
    expect(VARIANT_SKILL).toContain("`h-[calc(100vh-10rem)]`");
    expect(VARIANT_SKILL).toContain("Delete the rejected variant file");
  });
});
