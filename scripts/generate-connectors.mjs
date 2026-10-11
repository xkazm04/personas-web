#!/usr/bin/env node
// Regenerates src/data/connectors.ts from the desktop app's builtin
// connector JSON catalog. Deterministic and idempotent - preserves existing
// hand-written useCases for connectors whose name appears in the current data
// file, and synthesizes 1-2 category-typed placeholder useCases for the rest.
//
// Usage:
//   node scripts/generate-connectors.mjs --write   # regenerate src/data/connectors.ts
//   node scripts/generate-connectors.mjs --check   # drift gate (no writes)
//   node scripts/generate-connectors.mjs           # print to stdout
//
// --check contract (same as emit-guide-status / check-guide-coverage):
//   exit 0  the file matches the desktop catalog
//   exit 1  stale: names the connectors added/removed, or says the text differs
//   exit 3  the desktop catalog is unavailable - never a silent pass
//
// Source of truth: <desktop repo>/scripts/connectors/builtin/*.json, where the
// desktop repo is PERSONAS_DESKTOP_REPO when set (authoritative, no fallback),
// else the sibling checkout ../personas.
// Existing data:   src/data/connectors.ts (working tree)

import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");
const DATA_FILE = join(REPO, "src/data/connectors.ts");
const ARGS = new Set(process.argv.slice(2));
const CHECK = ARGS.has("--check");
const WRITE = ARGS.has("--write");

function resolveDesktopRepo() {
  const override = process.env.PERSONAS_DESKTOP_REPO;
  const root = override ? resolve(override) : resolve(REPO, "..", "personas");
  const dir = join(root, "scripts/connectors/builtin");
  if (!existsSync(dir)) {
    return { root, dir: null, reason: `${override ? "PERSONAS_DESKTOP_REPO" : "sibling ../personas"} has no scripts/connectors/builtin (${dir})` };
  }
  return { root, dir };
}
const desktop = resolveDesktopRepo();
if (!desktop.dir) {
  process.stderr.write(`connectors: desktop catalog unavailable - ${desktop.reason}\n`);
  process.exit(3);
}
const APP_CONNECTORS_DIR = desktop.dir;

// ── 1. Read all connector JSONs from the app ──────────────────────────
const files = readdirSync(APP_CONNECTORS_DIR).filter((f) => f.endsWith(".json"));
const raw = files.map((f) => {
  const p = join(APP_CONNECTORS_DIR, f);
  return { file: f, data: JSON.parse(readFileSync(p, "utf-8")) };
});

// ── 2. Extract existing hand-written useCases ─────────────────────────
// Crude but adequate: parse the existing connectors.ts and pull out the
// useCases array for each `name: "..."` entry. Anything we can't parse
// will fall through to placeholder generation. Read (LF-normalized, since a
// Windows checkout is CRLF) before any write, so the output never truncates
// its own input.
const existingSource = existsSync(DATA_FILE) ? readFileSync(DATA_FILE, "utf-8").replace(/\r\n/g, "\n") : "";
const existingUseCases = {};
{
  // Match each connector object literal - anchored on `name:` and ending
  // at the closing `},` of the outer object.
  const connectorBlockRe = /name:\s*"([^"]+)",[\s\S]*?useCases:\s*(\[[\s\S]*?\]),?\s*\}/g;
  let m;
  while ((m = connectorBlockRe.exec(existingSource)) !== null) {
    existingUseCases[m[1]] = m[2]; // verbatim "[...]" text, so re-emitting is byte-stable
  }
}

// ── 3. App primary category → web consolidated category ──────────────
const CATEGORY_MAP = {
  // direct
  messaging: "messaging",
  email: "email",
  notifications: "notifications",
  database: "database",
  vector_search: "database",
  storage: "storage",
  cloud: "cloud",
  containers: "cloud",
  monitoring: "monitoring",
  crm: "crm",
  design: "design",
  social: "social",
  advertising: "social",
  analytics: "analytics",
  bi: "analytics",
  ai: "ai",
  personalization: "ai",
  research: "research",
  web_scraping: "research",
  finance: "finance",
  ecommerce: "finance",
  // development family
  source_control: "development",
  ci_cd: "development",
  development: "development",
  // productivity family
  project_management: "project_management",
  knowledge_base: "productivity",
  spreadsheet: "productivity",
  calendar: "productivity",
  scheduling: "productivity",
  time_tracking: "productivity",
  forms: "productivity",
  productivity: "productivity",
  // automation family
  automation: "automation",
  integration: "automation",
  browser_automation: "automation",
  // edge cases
  support: "messaging",
};

// ── 4. Category accent + display label ───────────────────────────────
const WEB_CATEGORIES = [
  { key: "messaging", label: "Messaging", accent: "cyan" },
  { key: "email", label: "Email", accent: "cyan" },
  { key: "notifications", label: "Notifications", accent: "amber" },
  { key: "development", label: "Development", accent: "purple" },
  { key: "project_management", label: "Project Management", accent: "purple" },
  { key: "database", label: "Databases", accent: "emerald" },
  { key: "storage", label: "Storage", accent: "emerald" },
  { key: "cloud", label: "Cloud & Hosting", accent: "amber" },
  { key: "productivity", label: "Productivity", accent: "cyan" },
  { key: "analytics", label: "Analytics", accent: "purple" },
  { key: "monitoring", label: "Monitoring", accent: "amber" },
  { key: "crm", label: "CRM", accent: "emerald" },
  { key: "design", label: "Design", accent: "purple" },
  { key: "social", label: "Social", accent: "cyan" },
  { key: "ai", label: "AI", accent: "purple" },
  { key: "research", label: "Research", accent: "emerald" },
  { key: "finance", label: "Finance", accent: "amber" },
  { key: "automation", label: "Automation", accent: "amber" },
];

// ── 5. Monogram generator ────────────────────────────────────────────
function makeMonogram(label) {
  const cleaned = label.replace(/[^A-Za-z0-9 ]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase() || "??";
}

// ── 6. Icon mapper ───────────────────────────────────────────────────
// Use the app's `icon_url` field as the source of truth — it points to
// `/icons/connectors/<slug>.svg` in the desktop app. We mirror that
// filename into personas-web's `/tools/<slug>.svg`. Connectors with no
// `icon_url`, an external CDN URL, or a non-SVG asset (e.g. the personas
// internal logo PNG) return null and fall through to the monogram. We
// also try to copy the file from the app's public/icons/connectors/ and
// only emit a slug if the SVG actually exists there.
const PERSONAS_ICONS_DIR = join(desktop.root, "public/icons/connectors");
// Connectors whose app icon_url is an external simpleicons CDN URL —
// the SVGs were fetched and committed to public/tools/<slug>.svg.
const CDN_SLUGS = {
  clockify: "clockify",
  toggl: "toggl",
};

function iconSlugFromUrl(name, iconUrl) {
  if (CDN_SLUGS[name]) return CDN_SLUGS[name];
  if (!iconUrl) return null;
  // Reject external (http/https) URLs we don't have local copies of.
  if (/^https?:/.test(iconUrl)) return null;
  // Reject non-SVG assets (e.g. /illustrations/logo-v1-geometric-nobg.png).
  if (!iconUrl.endsWith(".svg")) return null;
  // Only accept paths under /icons/connectors/ so we don't accidentally
  // reference an app-internal asset that won't exist in personas-web.
  if (!iconUrl.startsWith("/icons/connectors/")) return null;
  const m = iconUrl.match(/([^/]+?)\.svg$/);
  if (!m) return null;
  const slug = m[1];
  // Drop the slug if the source file doesn't exist on disk — keeps the
  // generated data file honest about what will actually render.
  try {
    readFileSync(join(PERSONAS_ICONS_DIR, `${slug}.svg`));
    return slug;
  } catch {
    return null;
  }
}

// ── 7. useCases templates by consolidated category ───────────────────
// Each template takes the connector's label. Templates produce 1-2
// case objects per connector; existing hand-written cases take priority.
function placeholderUseCases(webCategory, label) {
  const cmd = (txt) => `personas run "${txt}"`;
  const cases = {
    messaging: [
      { title: "Send Updates to a Channel", description: `Post status updates, alerts, or daily digests to a ${label} channel automatically.`, command: cmd(`Post daily standup summary to ${label}`) },
      { title: "Route Notifications by Priority", description: `Direct high-severity alerts to on-call and low-priority chatter to a quiet channel.`, command: cmd(`Send critical alerts to oncall via ${label}`) },
    ],
    email: [
      { title: "Send Transactional Emails", description: `Deliver receipts, password resets, and notifications through ${label}.`, command: cmd(`Send a welcome email via ${label}`) },
      { title: "Run Weekly Digests", description: `Compile this week's highlights and email the team or your subscribers.`, command: cmd(`Send weekly digest via ${label}`) },
    ],
    notifications: [
      { title: "Pipe Alerts Anywhere", description: `Forward agent events to ${label} so monitoring and on-call see the same signal.`, command: cmd(`Send incident alert via ${label}`) },
      { title: "Trigger Webhooks on Completion", description: `Fire a ${label} call when a long-running agent finishes.`, command: cmd(`Notify ${label} when nightly job completes`) },
    ],
    development: [
      { title: "Triage Issues Automatically", description: `Read open work in ${label}, label by area, and route to the right team.`, command: cmd(`Triage new issues in ${label}`) },
      { title: "Generate Release Notes", description: `Summarize merged work in ${label} since the last release.`, command: cmd(`Draft release notes from ${label}`) },
    ],
    project_management: [
      { title: "Roll Up Sprint Progress", description: `Pull status from ${label} and post a single-screen view of where everything stands.`, command: cmd(`Summarize current sprint in ${label}`) },
      { title: "Find Blocked Work", description: `Surface tasks stuck in blocked or waiting for too long.`, command: cmd(`Find blocked tasks in ${label}`) },
    ],
    database: [
      { title: "Run Saved Queries", description: `Execute SQL or queries against ${label} and return readable results.`, command: cmd(`Run last week's revenue query on ${label}`) },
      { title: "Audit Schema or Indexes", description: `Find missing indexes, orphan tables, or unused columns in ${label}.`, command: cmd(`Audit ${label} schema for issues`) },
    ],
    storage: [
      { title: "Sync or Mirror Folders", description: `Move files between ${label} and your local or cloud workspace.`, command: cmd(`Sync project assets to ${label}`) },
      { title: "Audit Sharing & Access", description: `Find publicly shared files and links and report what's exposed.`, command: cmd(`Audit shared links in ${label}`) },
    ],
    cloud: [
      { title: "Deploy or Roll Back", description: `Trigger ${label} deploys from a chat command or revert on failure.`, command: cmd(`Deploy main to ${label}`) },
      { title: "Track Cost & Health", description: `Watch your ${label} bill and surface anomalies before they balloon.`, command: cmd(`Show ${label} spend over the last 7 days`) },
    ],
    productivity: [
      { title: "Capture & Organize", description: `Pull notes, events, or tasks from ${label} into the right place automatically.`, command: cmd(`Pull this week's ${label} entries`) },
      { title: "Generate Reports", description: `Summarize work logged or scheduled in ${label}.`, command: cmd(`Build a weekly report from ${label}`) },
    ],
    analytics: [
      { title: "Investigate Drop-Offs", description: `Find where users disengage in ${label} and rank the biggest leaks.`, command: cmd(`Find funnel drop-offs in ${label}`) },
      { title: "Compare Cohorts or Releases", description: `Spot meaningful shifts between time windows or builds in ${label}.`, command: cmd(`Compare last 2 releases in ${label}`) },
    ],
    monitoring: [
      { title: "Catch Spikes Early", description: `Watch ${label} for error or latency anomalies and alert the right team.`, command: cmd(`Alert on ${label} error spike`) },
      { title: "Compile Incident Reports", description: `Compile timelines and dashboards from ${label} into a shareable post-mortem.`, command: cmd(`Build post-mortem from ${label} incident`) },
    ],
    crm: [
      { title: "Score & Route Leads", description: `Rescore contacts in ${label} from latest activity and assign to the right rep.`, command: cmd(`Rescore stale leads in ${label}`) },
      { title: "Pipeline Health Report", description: `Get a weekly view of deal stages, slip risk, and forecast from ${label}.`, command: cmd(`Show ${label} pipeline weekly report`) },
    ],
    design: [
      { title: "Export Tokens & Assets", description: `Pull colors, type, and components out of ${label} and into code.`, command: cmd(`Export design tokens from ${label}`) },
      { title: "Audit Component Usage", description: `Find detached or outdated instances across files in ${label}.`, command: cmd(`Audit ${label} component drift`) },
    ],
    social: [
      { title: "Schedule a Batch", description: `Queue up posts on ${label} for the week or month with the right timing.`, command: cmd(`Schedule next 10 posts on ${label}`) },
      { title: "Track Engagement", description: `See what's working on ${label} and what's not, ranked.`, command: cmd(`Show top performing posts on ${label}`) },
    ],
    ai: [
      { title: "Generate Content", description: `Use ${label} to produce text, audio, images, or video from a prompt.`, command: cmd(`Generate intro VO via ${label}`) },
      { title: "Plug Into a Workflow", description: `Route inputs through ${label} as one step of a larger agent flow.`, command: cmd(`Pipe transcript through ${label}`) },
    ],
    research: [
      { title: "Search & Summarize", description: `Query ${label} on a topic and pull the highest-signal results.`, command: cmd(`Search ${label} for recent papers on agents`) },
      { title: "Save Sources to a Notebook", description: `Persist ${label} results into your local knowledge base for later.`, command: cmd(`Save top ${label} results to notes`) },
    ],
    finance: [
      { title: "Reconcile Transactions", description: `Match payments, refunds, and payouts across ${label} and your ledger.`, command: cmd(`Reconcile yesterday's ${label} transactions`) },
      { title: "Watch For Anomalies", description: `Flag unusual charges, failed payments, or unexpected spend in ${label}.`, command: cmd(`Flag ${label} anomalies in last 24h`) },
    ],
    automation: [
      { title: "Orchestrate Cross-Tool Flows", description: `Trigger ${label} jobs from agent decisions, and bring results back.`, command: cmd(`Trigger ${label} workflow on review approved`) },
      { title: "Listen for External Events", description: `React to events arriving from ${label} as agent triggers.`, command: cmd(`Subscribe to ${label} new-event webhook`) },
    ],
  };
  return cases[webCategory] || cases.productivity;
}

// ── 8. Skip list (not user-facing or duplicates) ─────────────────────
const SKIP = new Set([
  "google_workspace_oauth_template", // OAuth scaffold, not a real connector
]);

// Web-only label overrides. The desktop catalog labels both Obsidian
// connectors "Obsidian"; the site disambiguates them (commit 92b5c23), so a
// regeneration must not reset the label.
const LABEL_OVERRIDES = {
  desktop_obsidian: "Obsidian (Desktop Bridge)",
};

// ── 9. Build the final connector list ────────────────────────────────
// Sort: first by category (in the WEB_CATEGORIES order), then label A→Z.
const categoryOrder = Object.fromEntries(
  WEB_CATEGORIES.map((c, i) => [c.key, i]),
);

const built = raw
  .map(({ data: rawData }) => {
    let data = rawData;
    if (SKIP.has(data.name)) return null;
    data = { ...data, label: LABEL_OVERRIDES[data.name] ?? data.label };
    const appCategory = data.category || "productivity";
    const webCategory = CATEGORY_MAP[appCategory] || "productivity";
    const auth = data.metadata?.auth_type_label || data.metadata?.auth_type || "API key";
    const summary = data.metadata?.summary || `Integrate ${data.label}.`;
    // Monogram and sort order key off the desktop label, not the web-only override.
    const monogram = makeMonogram(rawData.label);
    const icon = iconSlugFromUrl(data.name, data.icon_url);
    return {
      name: data.name,
      label: data.label,
      color: data.color || "#71717a",
      category: webCategory,
      summary,
      monogram,
      sortLabel: rawData.label,
      authType: auth,
      icon,
      useCasesRaw: existingUseCases[data.name],
      useCasesPlaceholder: existingUseCases[data.name] ? null : placeholderUseCases(webCategory, data.label),
    };
  })
  .filter(Boolean)
  .sort((a, b) => {
    const ca = categoryOrder[a.category] ?? 999;
    const cb = categoryOrder[b.category] ?? 999;
    if (ca !== cb) return ca - cb;
    return a.sortLabel.localeCompare(b.sortLabel);
  });

// ── 10. Emit the TypeScript file ─────────────────────────────────────
const lines = [];
lines.push(`export interface ConnectorUseCase {`);
lines.push(`  title: string;`);
lines.push(`  description: string;`);
lines.push(`  command: string;`);
lines.push(`}`);
lines.push(``);
lines.push(`export interface Connector {`);
lines.push(`  name: string;`);
lines.push(`  label: string;`);
lines.push(`  color: string;`);
lines.push(`  category: string;`);
lines.push(`  summary: string;`);
lines.push(`  monogram: string;`);
lines.push(`  authType: string;`);
lines.push(`  /** SVG filename in /public/tools/ (without extension). Defaults to \`name\`. */`);
lines.push(`  icon?: string;`);
lines.push(`  useCases: [ConnectorUseCase, ...ConnectorUseCase[]];`);
lines.push(`}`);
lines.push(``);
lines.push(`export interface ConnectorCategory {`);
lines.push(`  key: string;`);
lines.push(`  label: string;`);
lines.push(`  accent: "cyan" | "purple" | "emerald" | "amber";`);
lines.push(`}`);
lines.push(``);
lines.push(`export const categories: ConnectorCategory[] = [`);
for (const c of WEB_CATEGORIES) {
  lines.push(`  { key: "${c.key}", label: "${c.label}", accent: "${c.accent}" },`);
}
lines.push(`];`);
lines.push(``);
lines.push(`// Generated from personas/scripts/connectors/builtin/*.json by`);
lines.push(`// scripts/generate-connectors.mjs (drift check: node scripts/generate-connectors.mjs --check).`);
lines.push(`// Hand-written useCases for the marquee connectors are preserved;`);
lines.push(`// the rest carry category-typed placeholder useCases.`);
lines.push(``);
lines.push(`export const connectors: Connector[] = [`);

let lastCategory = null;
for (const c of built) {
  if (c.category !== lastCategory) {
    if (lastCategory !== null) lines.push(``);
    const catLabel = WEB_CATEGORIES.find((x) => x.key === c.category)?.label ?? c.category;
    lines.push(`  // ── ${catLabel} ${"─".repeat(Math.max(0, 60 - catLabel.length))}`);
    lastCategory = c.category;
  }
  lines.push(`  {`);
  lines.push(`    name: "${c.name}",`);
  lines.push(`    label: ${JSON.stringify(c.label)},`);
  lines.push(`    color: "${c.color}",`);
  lines.push(`    category: "${c.category}",`);
  lines.push(`    summary: ${JSON.stringify(c.summary)},`);
  lines.push(`    monogram: "${c.monogram}",`);
  lines.push(`    authType: ${JSON.stringify(c.authType)},`);
  if (c.icon) lines.push(`    icon: "${c.icon}",`);
  if (c.useCasesRaw) {
    lines.push(`    useCases: ${c.useCasesRaw},`);
  } else {
    lines.push(`    useCases: [`);
    for (const uc of c.useCasesPlaceholder) {
      lines.push(`      { title: ${JSON.stringify(uc.title)}, description: ${JSON.stringify(uc.description)}, command: ${JSON.stringify(uc.command)} },`);
    }
    lines.push(`    ],`);
  }
  lines.push(`  },`);
}
lines.push(`];`);
lines.push(``);

const output = lines.join("\n");

if (CHECK) {
  const nameRe = /^ {4}name:\s*"([^"]+)",/gm;
  const have = new Set([...existingSource.matchAll(nameRe)].map((m) => m[1]));
  const want = new Set(built.map((c) => c.name));
  const missing = [...want].filter((n) => !have.has(n));
  const extra = [...have].filter((n) => !want.has(n));
  if (missing.length || extra.length || output !== existingSource) {
    process.stderr.write(`connectors: src/data/connectors.ts is stale vs desktop (${have.size} on web, ${want.size} on desktop)\n`);
    if (missing.length) process.stderr.write(`  missing on web (+${missing.length}): ${missing.join(", ")}\n`);
    if (extra.length) process.stderr.write(`  only on web (-${extra.length}): ${extra.join(", ")}\n`);
    if (!missing.length && !extra.length) process.stderr.write("  same connector set, generated text differs\n");
    process.stderr.write("  fix: node scripts/generate-connectors.mjs --write\n");
    process.exit(1);
  }
  process.stdout.write(`connectors: in sync with desktop (${built.length} connectors)\n`);
  process.exit(0);
}

if (WRITE) writeFileSync(DATA_FILE, output, "utf-8");
else process.stdout.write(output);

// ── debug summary on stderr ──────────────────────────────────────────
const byCategory = {};
for (const c of built) byCategory[c.category] = (byCategory[c.category] || 0) + 1;
const preserved = built.filter((c) => c.useCasesRaw).length;
process.stderr.write(`\n# Generated ${built.length} connectors\n`);
process.stderr.write(`# Preserved existing useCases: ${preserved}\n`);
process.stderr.write(`# Generated placeholder useCases: ${built.length - preserved}\n`);
process.stderr.write(`# Categories:\n`);
for (const [k, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
  process.stderr.write(`#   ${k.padEnd(20)} ${n}\n`);
}
