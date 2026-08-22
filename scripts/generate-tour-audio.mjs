/**
 * Generate guided-tour narration audio with ElevenLabs.
 *
 *   node --env-file=.env scripts/generate-tour-audio.mjs            # all below
 *   node --env-file=.env scripts/generate-tour-audio.mjs step1 step3  # subset
 *   node scripts/generate-tour-audio.mjs --check   # print resolved lines, no API call
 *
 * Falls back to parsing .env itself if --env-file isn't supported. Writes
 * <key>.mp3 into the configured outputDir (public/tour/). Voice / model /
 * settings come from scripts/tour-audio.config.mjs.
 *
 * NARRATION SOURCE: the spoken lines are READ FROM `src/i18n/en.ts` at run
 * time — they are not copied here. `tour.*` in the locale is the single
 * source of truth for both the on-screen caption and the voiceover, so the
 * two cannot drift. (They had: the previous hand-maintained copy of these
 * lines, kept in step by a "keep in sync" comment, had already fallen behind
 * en.ts on `step3` and `step4`.)
 *
 * The locale is loaded the same zero-dependency way `check-i18n-coverage.mjs`
 * does it: transpile the .ts with the TypeScript compiler API and evaluate it
 * in a `vm` sandbox whose `require` throws. No Next build, no app runtime,
 * no bundler — en.ts is a pure data module with no imports, and the sandbox
 * enforces that.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { tourAudioConfig as cfg } from "./tour-audio.config.mjs";

// Minimal .env loader so the script works without --env-file too.
function loadEnv() {
  if (process.env[cfg.apiKeyEnv]) return;
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const LOCALE_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "i18n", "en.ts");

/** Evaluate `src/i18n/en.ts` and return its `tour` block. Throws if it moved. */
function loadTourCopy() {
  const source = readFileSync(LOCALE_PATH, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: LOCALE_PATH,
  }).outputText;

  const sandbox = {
    exports: {},
    module: { exports: {} },
    // en.ts must stay a pure data module — a runtime import would mean the
    // narration can no longer be read without the app's build.
    require: (specifier) => {
      throw new Error(`Unexpected runtime import "${specifier}" in ${LOCALE_PATH}`);
    },
  };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(compiled, sandbox, { filename: LOCALE_PATH });

  const en = sandbox.module.exports.en ?? sandbox.exports.en;
  if (!en || typeof en.tour !== "object") {
    throw new Error(`Could not read \`en.tour\` from ${LOCALE_PATH}`);
  }
  return en.tour;
}

// Lines with no on-screen counterpart, so they cannot come from the locale.
// Athena's spoken greeting is voiceover-only — the intro pop-up shows
// `tour.introBody`, which is different copy written for reading, not speech.
const SPOKEN_ONLY = {
  intro:
    "Project loaded. Hello, Commander, my name is Athena, and I'll assist you in getting familiar with Personas. I'll walk you through it in about a minute... Pause or skip anytime.",
};

// The generated set, in recording order. Every entry not in SPOKEN_ONLY is a
// `tour.<key>` lookup in en.ts. `tour.roadmap1-3` exist in the locale but are
// not generated yet — add them here to start recording them.
const NARRATION_ORDER = [
  // Homepage.
  "step1",
  "step2",
  "step3",
  "step4",
  "step5",
  "intro",
  // /features.
  "features1",
  "features2",
  "features3",
  "features4",
  "features5",
  "features6",
  // /dashboard — one recording per page. The home clip is one continuous
  // track; the spotlight sweeps across its sections in time with it.
  "dashboardHome",
  "dashboardAgents",
  "dashboardExecutions",
  "dashboardEvents",
  "dashboardReviews",
];

const tour = loadTourCopy();
const LINES = {};
const missingFromLocale = [];
for (const key of NARRATION_ORDER) {
  if (key in SPOKEN_ONLY) {
    LINES[key] = SPOKEN_ONLY[key];
    continue;
  }
  const text = tour[key];
  if (typeof text !== "string" || text.trim() === "") {
    missingFromLocale.push(key);
    continue;
  }
  LINES[key] = text;
}
// Fail loudly rather than silently recording a shorter tour: a renamed or
// deleted locale key must stop the run, not quietly drop a chapter.
if (missingFromLocale.length > 0) {
  console.error(
    `Missing/empty tour.* keys in ${LOCALE_PATH}: ${missingFromLocale.join(", ")}\n` +
      "Either restore them in the locale or remove them from NARRATION_ORDER.",
  );
  process.exit(1);
}

const args = process.argv.slice(2);

// `--check` resolves the narration and prints it without calling ElevenLabs,
// so the exact text about to be recorded can be reviewed (and diffed) before
// spending API credits. Runs before the API-key gate on purpose.
if (args.includes("--check")) {
  for (const [key, text] of Object.entries(LINES)) {
    const origin = key in SPOKEN_ONLY ? "script" : "en.tour";
    console.log(`${key}\t[${origin}]\t${text}`);
  }
  console.log(`\n${Object.keys(LINES).length} lines resolved from ${LOCALE_PATH}.`);
  process.exit(0);
}

loadEnv();

const API_KEY = process.env[cfg.apiKeyEnv];
if (!API_KEY) {
  console.error(`Missing ${cfg.apiKeyEnv} (set it in .env).`);
  process.exit(1);
}

const keys = args.length ? args : Object.keys(LINES);
mkdirSync(cfg.outputDir, { recursive: true });

for (const key of keys) {
  const text = LINES[key];
  if (!text) {
    console.warn(`! no text for "${key}" — skipping`);
    continue;
  }
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${cfg.voiceId}?output_format=${cfg.outputFormat}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: cfg.modelId,
      voice_settings: cfg.voiceSettings,
    }),
  });
  if (!res.ok) {
    console.error(`✗ ${key}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const out = join(cfg.outputDir, `${key}.mp3`);
  writeFileSync(out, buf);
  console.log(`✓ ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
}

console.log("Done.");
