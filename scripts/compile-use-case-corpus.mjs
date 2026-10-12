/**
 * Compile the use-case corpus from the desktop app's real template catalog.
 *
 *   node scripts/compile-use-case-corpus.mjs            # write src/data/use-case-corpus.json + print the stack-fit table
 *   node scripts/compile-use-case-corpus.mjs --check    # fail if the committed JSON differs from a fresh compile
 *   PERSONAS_DESKTOP_REPO=<path> node scripts/compile-use-case-corpus.mjs   # desktop checkout (default ../personas)
 *
 * SOURCE: `scripts/templates/<category>/<id>.json` (schema v3, locale variants
 * `<id>.<lang>.json` skipped, `_`-prefixed working dirs skipped) read with
 * `git show` AT THE PINNED COMMIT below, never from the working tree, so desktop
 * churn reaches the landing only when someone bumps DESKTOP_COMMIT and reviews
 * the diff. Bump it, rerun, commit the JSON.
 *
 * EMITTED (public fields only): id, name, description, category, published,
 * connectors resolved to web connector names via src/data/connectors.ts.
 * The `payload` (persona prompt, identity, operating instructions) is NEVER
 * emitted; the allowlist below is the only path to the output.
 *
 * Zero dependencies beyond `typescript` (same loader pattern as
 * generate-tour-audio.mjs / check-i18n-coverage.mjs): connectors.ts is
 * transpiled and evaluated in a vm sandbox whose `require` throws.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { writeFileAtomic } from "./atomic-write.mjs";

/** Desktop commit the corpus is compiled from. */
export const DESKTOP_COMMIT = "3797ab21735cc3280a302daea412b52ef87544b2";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "data", "use-case-corpus.json");
const DESKTOP = resolve(process.env.PERSONAS_DESKTOP_REPO ?? join(ROOT, "..", "personas"));
const TEMPLATES_DIR = "scripts/templates";

function git(...args) {
  return execFileSync("git", ["-C", DESKTOP, ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function loadTs(rel) {
  const file = join(ROOT, rel);
  const out = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(out, {
    exports: mod.exports,
    module: mod,
    require: (s) => {
      throw new Error(`${rel} must stay a pure data module (it required "${s}")`);
    },
  });
  return mod.exports;
}

export function compile() {
  if (!existsSync(join(DESKTOP, ".git"))) throw new Error(`desktop checkout not found at ${DESKTOP} (set PERSONAS_DESKTOP_REPO)`);
  git("cat-file", "-e", `${DESKTOP_COMMIT}^{commit}`);
  const { connectors } = loadTs("src/data/connectors.ts");
  const { categories } = loadTs("src/data/connectors.ts");
  const webNames = new Set(connectors.map((c) => c.name));
  const webCategories = new Set(categories.map((c) => c.key));

  const paths = git("ls-tree", "-r", "--name-only", DESKTOP_COMMIT, `${TEMPLATES_DIR}/`)
    .split("\n")
    .filter((p) => {
      const rel = p.slice(TEMPLATES_DIR.length + 1);
      const parts = rel.split("/");
      return parts.length === 2 && !parts[0].startsWith("_") && /^[^.]+\.json$/.test(parts[1]);
    })
    .sort();

  const templates = [];
  for (const p of paths) {
    const d = JSON.parse(git("show", `${DESKTOP_COMMIT}:${p}`));
    if (d.schema_version !== 3) continue;
    const declared = d.payload?.persona?.connectors ?? [];
    const names = [...new Set(declared.map((c) => c.name))].sort();
    // A desktop connector is either a concrete service (web name) or a role
    // ("email", "crm"); roles resolve to the web catalog category they share a key with.
    const cats = new Set();
    for (const c of declared) {
      if (webNames.has(c.name)) cats.add(connectors.find((w) => w.name === c.name).category);
      else if (webCategories.has(c.category)) cats.add(c.category);
      else if (webCategories.has(c.name)) cats.add(c.name);
    }
    templates.push({
      id: d.id,
      name: d.name,
      description: d.description,
      category: Array.isArray(d.category) ? d.category[0] : d.category,
      published: d.is_published === true,
      connectors: names.filter((n) => webNames.has(n)),
      connectorCategories: [...cats].sort(),
      unresolvedConnectors: names.filter((n) => !webNames.has(n)),
      useCaseCount: (d.payload?.use_cases ?? []).length,
    });
  }
  templates.sort((a, b) => a.id.localeCompare(b.id));
  return { desktopCommit: DESKTOP_COMMIT, templates };
}

function webTemplateIds() {
  const src = readFileSync(join(ROOT, "src", "lib", "templates.ts"), "utf8");
  return new Set([...src.matchAll(/^\s{4}id: "([^"]+)",/gm)].map((m) => m[1]));
}

function printFit(corpus) {
  const web = webTemplateIds();
  const rows = corpus.templates;
  const pub = rows.filter((r) => r.published);
  console.log(`desktop @ ${corpus.desktopCommit.slice(0, 10)}: ${rows.length} templates, ${pub.length} published`);
  console.log("id".padEnd(38) + "pub  conn(web/all)  cats  in-web-gallery");
  for (const r of rows) {
    console.log(
      r.id.padEnd(38) + (r.published ? "yes" : "no ").padEnd(5) +
        `${r.connectors.length}/${r.connectors.length + r.unresolvedConnectors.length}`.padEnd(16) + String(r.connectorCategories.length).padEnd(6) + (web.has(r.id) ? "yes" : "no"),
    );
  }
  const shared = rows.filter((r) => web.has(r.id)).length;
  console.log(`shared ids with src/lib/templates.ts: ${shared} of ${rows.length} desktop / ${web.size} web`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const corpus = compile();
  const text = JSON.stringify(corpus, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    const have = existsSync(OUT) ? readFileSync(OUT, "utf8").split("\r\n").join("\n") : "";
    if (have !== text) {
      console.error("src/data/use-case-corpus.json is stale. Run: node scripts/compile-use-case-corpus.mjs");
      process.exit(1);
    }
    console.log(`use-case-corpus.json is current (${corpus.templates.length} templates @ ${DESKTOP_COMMIT.slice(0, 10)})`);
  } else {
    writeFileAtomic(OUT, text);
    printFit(corpus);
  }
}
