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
    "All of this rests on one platform built for trust and scale. An encrypted vault guards your credentials, ready-made templates get you moving fast, and bring-your-own-model keeps you in control of the AI. Live monitoring, an experimentation lab, and team orchestration round it out — six pillars, one place.",
  step5:
    "Ready to put a persona to work? Personas runs on your own machine through Claude Code — Anthropic's command-line tool — so you stay private and in control. Download the installer for Windows 11, connect the CLI, and your first agent is live in minutes.",
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
