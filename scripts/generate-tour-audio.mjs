/**
 * Generate guided-tour narration audio with ElevenLabs.
 *
 *   node --env-file=.env scripts/generate-tour-audio.mjs            # all below
 *   node --env-file=.env scripts/generate-tour-audio.mjs step1 step3  # subset
 *
 * Falls back to parsing .env itself if --env-file isn't supported. Writes
 * <key>.mp3 into the configured outputDir (public/tour/). Voice / model /
 * settings come from scripts/tour-audio.config.mjs.
 *
 * LINES below are the ENGLISH narration — keep in sync with the matching
 * `tour.*` keys in src/i18n/en.ts (the source of truth for on-screen text).
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
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
loadEnv();

const API_KEY = process.env[cfg.apiKeyEnv];
if (!API_KEY) {
  console.error(`Missing ${cfg.apiKeyEnv} (set it in .env).`);
  process.exit(1);
}

// Homepage narration (the set being evaluated). Add features*/roadmap* here
// when expanding generation beyond the homepage.
const LINES = {
  step1:
    "Meet a persona — a single AI agent with one stable identity and a composable set of skills. Give it the tools it needs, from Gmail and Slack to GitHub and your calendar, and it learns to act across all of them. One persona, many jobs, all working together.",
  step2:
    'Now hand that persona a goal in plain language, like "triage my Gmail." Watch its mind work in real time: it reads the request, breaks it into steps, and plans its approach before touching a thing. Then it executes — and shows you every move as it goes.',
  step3:
    "An agent is only as useful as the moments it wakes up for. Personas can be triggered eight ways — on a schedule, by an event, by polling a source, or from an incoming webhook. The orchestrator routes each signal to the right agent and keeps everything moving, healing itself if a step ever fails.",
  step4:
    "All of this rests on one platform built for trust and scale. An encrypted vault guards your credentials, ready-made templates get you moving fast, and bring-your-own-model keeps you in control of the AI. Live monitoring, an experimentation lab, and team orchestration round it out.",
  step5:
    "Ready to put a persona to work? Personas runs on your own machine through Claude Code — Anthropic's command-line tool — so you stay private and in control. Download the installer for Windows 11, connect the CLI, and your first agent is live in minutes.",

  // Athena's spoken greeting for the intro pop-up.
  intro:
    "Project loaded. Hello, Commander, my name is Athena, and I'll assist you in getting familiar with Personas. I'll walk you through it in about a minute... Pause or skip anytime.",

  // /features narration (matches tour.features1-6 in src/i18n/en.ts).
  features1:
    "Every agent is born from a single sentence of intent. Personas reads what you want and fills an eight-dimension persona matrix — tasks, memory, triggers, review, and more — asking you only when it truly needs a decision. In moments, a vague idea becomes a structured, executable agent.",
  features2:
    "Then it starts to learn. Every task it runs leaves a trace, and the lessons that matter rise into its memory layers while noise settles to the bottom. The more your agent works, the sharper and more context-aware it becomes.",
  features3:
    "Real work breaks, so Personas is built to recover. When a step fails, the circuit does not stall — it diagnoses what went wrong, repairs the path, and retries on its own. No 3 a.m. alerts, no manual restarts; the workflow simply keeps moving.",
  features4:
    "And you never lose sight of any of it. Every execution, message, event, and memory streams live through one observability deck — sparklines, costs, and status, all in real time. Full transparency, zero setup.",
  features5:
    "Great agents are rarely right the first time, so the Lab is where you refine them. Chat with a persona to coach it, pit two versions against each other in the arena, evolve it across generations, or score it on the dimensions that matter. Every improvement you keep is versioned and reversible.",
  features6:
    "Personas ships with six purpose-built plugins, each a self-contained workspace your agents can drive. Take Dev Tools: it turns a persona into a coding teammate that runs tasks, reads the output, and iterates. Switch a tab and you meet another specialist — all sharing the same credentials and memory.",

  // /dashboard narration — one recording per page (matches tour.dashboard* in
  // src/i18n/en.ts). The home clip is one continuous track; the spotlight
  // sweeps across its sections in time with the narration.
  dashboardHome:
    "Welcome to mission control — your whole fleet on one screen. Up top, the vitals: success rate, runs in flight, active agents, open alerts, and reviews waiting on you. Below that, the optimizer surfaces one high-leverage fix at a time — right now, a routing change that trims cost without touching quality. The two panels beneath track each agent's health and the new memories they've learned and want to promote. Then the live picture: every execution as it lands on the left, fourteen days of traffic and errors on the right. The heatmap shows runs per agent, day by day, and the bottom row rounds it out — your top performers, the next scheduled routines, and every credential rotation. One page, the entire operation.",
  dashboardAgents:
    "This is your roster. Each card is a persona — a single agent with one identity and a set of skills it can compose. The portrait is generated to match its character; below it, the live stats: success rate, runs, and spend. Hit Execute to run one on demand, or open Details to inspect its configuration and recent history. Five agents here, each quietly doing one job well.",
  dashboardExecutions:
    "Every run the fleet has made lives here, newest first. The table shows the persona, status, duration, cost, and when it started — filter down to just the failures, or the ones still running. Click any row and the full execution opens: a metrics strip, any error explanation, and the live output streaming line by line, exactly as the agent produced it.",
  dashboardEvents:
    "Agents don't work in isolation — they react to events. This is the event bus: every signal flowing through the system, from schedules and webhooks to messages between agents. Each row shows the event type, its source, status, and how long ago it fired. Failed events can be retried in place, and related events chain together so you can follow a single cascade end to end.",
  dashboardReviews:
    "Some decisions need a human. When an agent hits something it shouldn't decide alone, it pauses and routes the call here. Each item carries the persona, the context, and the action it's proposing — approve it, reject it, or skip for later, by click or by keyboard. Nothing risky ships without your sign-off, and the queue keeps the rest of the fleet moving while you decide.",
};

const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LINES);
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
