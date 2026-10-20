import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { join } from "node:path";
import { Linter } from "eslint";

/**
 * Golden inputs for the repo's custom ESLint rules (eslint-rules/*.js).
 *
 * These rules are the gates CLAUDE.md tells agents not to work around, so a
 * change that silently weakens one (a narrowed regex, a dropped accepted gate)
 * would let exactly the code they exist to stop through, with lint still
 * green. Each case below pins one input to its expected verdict. Cases are
 * plain JS/JSX so the default espree parser reads them — the rules only look
 * at syntax both share with the TSX they run on.
 */

const requireRule = createRequire(import.meta.url);
const loadRule = (name: string) => requireRule(join(process.cwd(), "eslint-rules", `${name}.js`));

function lint(ruleName: string, code: string, filename = "case.jsx", options?: unknown) {
  const rule = loadRule(ruleName);
  const level: Linter.RuleEntry = options === undefined ? "error" : ["error", options];
  const linter = new Linter();
  const messages = linter.verify(
    code,
    [
      {
        files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
        plugins: { golden: { rules: { [ruleName]: rule } } },
        rules: { [`golden/${ruleName}`]: level },
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
      },
    ],
    filename,
  );
  // A parse error would read as "no findings"; fail loudly instead.
  const fatal = messages.find((m) => m.fatal);
  if (fatal) throw new Error(`golden input did not parse: ${fatal.message}`);
  return messages.filter((m) => m.ruleId === `golden/${ruleName}`);
}

describe("custom-animation/require-animation-gating", () => {
  const RULE = "require-animation-gating";
  const raf = "function tick() { requestAnimationFrame(tick); }";

  it("flags an ungated requestAnimationFrame loop", () => {
    const found = lint(RULE, raf);
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("requestAnimationFrame");
  });

  it("flags an ungated <canvas>", () => {
    const found = lint(RULE, "export const C = () => <canvas />;");
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("<canvas>");
  });

  it("reports every trigger in an ungated file", () => {
    const code = `${raf}\nfunction stop(id) { cancelAnimationFrame(id); }\nexport const C = () => <canvas />;`;
    expect(lint(RULE, code)).toHaveLength(3);
  });

  it("does not accept an unrelated motion hook as a gate", () => {
    const code = `import { useMotionValue } from "framer-motion";\n${raf}`;
    expect(lint(RULE, code)).toHaveLength(1);
  });

  for (const gate of [
    "useStillMotion",
    "useIsVisible",
    "usePageVisibility",
    "useReducedMotion",
    "useReducedMotionPreference",
  ]) {
    it(`accepts an imported ${gate} as the gate`, () => {
      const code = `import { ${gate} } from "@/hooks/${gate}";\n${raf}\nexport const C = () => <canvas />;`;
      expect(lint(RULE, code)).toHaveLength(0);
    });
  }

  it("accepts a gate that is called without a named import", () => {
    const code = `export function C() { const still = useStillMotion(); ${raf} return still; }`;
    expect(lint(RULE, code)).toHaveLength(0);
  });

  it("leaves files with no animation frame or canvas alone", () => {
    expect(lint(RULE, "export const C = () => <div className=\"p-4\" />;")).toHaveLength(0);
  });
});

describe("custom-a11y/no-low-text-opacity", () => {
  const RULE = "no-low-text-opacity";
  // Cases are written `/@NN` and unmasked at runtime: this file is itself
  // linted by the rule under test, and a literal low-opacity class here would
  // count against the repo's --max-warnings ratchet.
  const unmask = (code: string) => code.replaceAll("/@", "/");
  const check = (code: string) => lint(RULE, unmask(code));

  it.each([
    ['const c = "text-foreground/@30";', "30"],
    ['const c = "p-2 hover:text-muted-dark/@40 rounded";', "40"],
    ['const c = "placeholder:text-muted-dark/@40";', "40"],
    ["const c = `text-brand-cyan/@59 ` + x;", "59"],
    ['export const C = () => <p className="text-foreground/@50">hi</p>;', "50"],
  ])("flags %s", (code, value) => {
    const found = check(code);
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain(`/${value}`);
  });

  it("flags each low-opacity class in one string", () => {
    expect(check('const c = "text-foreground/@30 md:text-muted-dark/@20";')).toHaveLength(2);
  });

  it.each([
    'const c = "text-foreground/@60";',
    'const c = "text-foreground/@90 hover:text-muted-dark/@75";',
    'const c = "bg-background/@20 border-glass/@10 ring-brand-cyan/@30 shadow-background/@5";',
    'const c = "text-foreground text-sm";',
    'export const C = () => <p className="text-muted-dark/@80">hi</p>;',
  ])("accepts %s", (code) => {
    expect(check(code)).toHaveLength(0);
  });
});

describe("custom-quality/no-confusable-minus", () => {
  const RULE = "no-confusable-minus";
  const glyph = (cp: number) => String.fromCodePoint(cp);

  it.each([
    ["U+2212", 0x2212],
    ["U+FF0D", 0xff0d],
    ["U+2010", 0x2010],
    ["U+2011", 0x2011],
  ])("flags %s in source", (_label, cp) => {
    const found = lint(RULE, `const x = ["${glyph(cp)}100%", "0%"];`, "case.js");
    expect(found).toHaveLength(1);
  });

  it("accepts ASCII hyphen-minus and the prose dashes it deliberately allows", () => {
    const code = `const x = ["-100%"]; const s = "a ${glyph(0x2013)} b ${glyph(0x2014)} c";`;
    expect(lint(RULE, code, "case.js")).toHaveLength(0);
  });
});

describe("custom-quality/max-tsx-lines", () => {
  const RULE = "max-tsx-lines";
  const lines = (n: number) => Array.from({ length: n }, (_, i) => `const v${i} = ${i};`).join("\n");

  it("flags a .tsx file at the line budget", () => {
    expect(lint(RULE, lines(5), "big.tsx", { max: 5 })).toHaveLength(1);
  });

  it("accepts a .tsx file under the budget", () => {
    expect(lint(RULE, lines(4), "small.tsx", { max: 5 })).toHaveLength(0);
  });

  it("ignores non-.tsx files whatever their size", () => {
    expect(lint(RULE, lines(50), "data.ts", { max: 5 })).toHaveLength(0);
  });
});
