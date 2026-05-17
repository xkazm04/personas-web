#!/usr/bin/env node
// One-shot regeneration of src/data/connectors.ts from the app's builtin
// connector JSON catalog. Idempotent — preserves existing hand-written
// useCases for connectors whose name appears in the current data file,
// and synthesizes 1-2 category-typed placeholder useCases for the rest.
//
// Run with:  node scripts/generate-connectors.mjs > src/data/connectors.ts
//
// Source of truth: ../personas/scripts/connectors/builtin/*.json
// Existing data:   src/data/connectors.ts (parsed at top of script)

import { readFileSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");
const APP_CONNECTORS_DIR = "C:/Users/kazda/kiro/personas/scripts/connectors/builtin";

// Source the existing data from git HEAD (or whatever ref CONNECTORS_BASE
// points to) instead of the working tree, because the script's typical
// invocation is `node ... > src/data/connectors.ts` and bash truncates
// the output file before node opens it — wiping out the useCases we
// wanted to preserve.
const BASE_REF = process.env.CONNECTORS_BASE || "HEAD";

// ── 1. Read all connector JSONs from the app ──────────────────────────
const files = readdirSync(APP_CONNECTORS_DIR).filter((f) => f.endsWith(".json"));
const raw = files.map((f) => {
  const p = join(APP_CONNECTORS_DIR, f);
  return { file: f, data: JSON.parse(readFileSync(p, "utf-8")) };
});

// ── 2. Extract existing hand-written useCases ─────────────────────────
// Crude but adequate: parse the existing connectors.ts and pull out the
// useCases array for each `name: "..."` entry. Anything we can't parse
// will fall through to placeholder generation.
let existingSource = "";
try {
  existingSource = execSync(`git show ${BASE_REF}:src/data/connectors.ts`, {
    cwd: REPO,
    encoding: "utf-8",
  });
} catch {
  // No git history or file at that ref — proceed with all placeholders.
  process.stderr.write(`# No prior connectors.ts at ${BASE_REF}; using placeholders for all.\n`);
}
const existingUseCases = {};
{
  // Match each connector object literal — anchored on `name:` and ending
  // at the closing `},` of the outer object.
  const connectorBlockRe = /name:\s*"([^"]+)",[\s\S]*?useCases:\s*\[([\s\S]*?)\],?\s*\}/g;
  let m;
  while ((m = connectorBlockRe.exec(existingSource)) !== null) {
    const name = m[1];
    const useCasesBody = m[2];
    existingUseCases[name] = useCasesBody.trim();
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
const PERSONAS_ICONS_DIR = "C:/Users/kazda/kiro/personas/public/icons/connectors";
const WEB_TOOLS_DIR = join(REPO, "public/tools");
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
// Each template takes the connector's label and the connector's name
// (used in the personas-run example command). Templates produce 1-2
// case objects per connector; existing hand-written cases take priority.
function placeholderUseCases(webCategory, label, name) {
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

// ── 9. Build the final connector list ────────────────────────────────
// Sort: first by category (in the WEB_CATEGORIES order), then label A→Z.
const categoryOrder = Object.fromEntries(
  WEB_CATEGORIES.map((c, i) => [c.key, i]),
);

const built = raw
  .map(({ data }) => {
    if (SKIP.has(data.name)) return null;
    const appCategory = data.category || "productivity";
    const webCategory = CATEGORY_MAP[appCategory] || "productivity";
    const auth = data.metadata?.auth_type_label || data.metadata?.auth_type || "API key";
    const summary = data.metadata?.summary || `Integrate ${data.label}.`;
    const monogram = makeMonogram(data.label);
    const icon = iconSlugFromUrl(data.name, data.icon_url);
    const useCases = existingUseCases[data.name] ||
      JSON.stringify(placeholderUseCases(webCategory, data.label, data.name))
        // pretty-print the inline array as multi-line useCases lines
        .replace(/\[\{/, "{\n      ")
        .replace(/\}\]/, "\n      }")
        .replace(/\},\{/g, "\n    },\n    {\n      ")
        .replace(/","/g, '", "');
    return {
      name: data.name,
      label: data.label,
      color: data.color || "#71717a",
      category: webCategory,
      summary,
      monogram,
      authType: auth,
      icon,
      useCasesRaw: existingUseCases[data.name],
      useCasesPlaceholder: existingUseCases[data.name] ? null : placeholderUseCases(webCategory, data.label, data.name),
    };
  })
  .filter(Boolean)
  .sort((a, b) => {
    const ca = categoryOrder[a.category] ?? 999;
    const cb = categoryOrder[b.category] ?? 999;
    if (ca !== cb) return ca - cb;
    return a.label.localeCompare(b.label);
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
lines.push(`// Generated from personas/scripts/connectors/builtin/*.json on `);
lines.push(`// ${new Date().toISOString().slice(0, 10)} by scripts/generate-connectors.mjs.`);
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
    lines.push(`    useCases: [${c.useCasesRaw}],`);
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

process.stdout.write(lines.join("\n"));

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
