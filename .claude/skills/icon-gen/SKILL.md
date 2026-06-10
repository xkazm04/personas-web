---
name: icon-gen
description: Generate branded app icons (favicons, PWA icons, logos) with Leonardo AI, evaluate with Gemini vision, and export a correctly-sized icon set. Optimized for clean icon SHAPE and CONTENT with minimal background noise — unlike /leonardo, which targets general scenes and illustrations.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node *), Bash(npx *)
argument-hint: <icon to create, e.g. "favicon" or "settings glyph">
---

# Icon Gen — Branded App Icons

Derived from `/leonardo`. Same generation + vision backend, but tuned for a
single job: a **clean, centered, single-subject mark** on a **deliberate
background** (transparent or a flat brand tile), exported at the **exact sizes**
each surface needs. The `/leonardo` model (Lucid Origin) loves to add scenery,
texture, and ambient lighting — great for hero art, fatal for a 16px favicon.
This skill fights that noise at three stages: prompt, generation params, and
post-processing.

## When to use this vs `/leonardo`
- **icon-gen**: favicons, app/PWA icons, apple-touch icons, toolbar/brand
  marks, monochrome glyphs — anything that must read at small sizes and tile
  cleanly.
- **leonardo**: hero images, backgrounds, state illustrations, anything with a
  scene or atmosphere.

## Interactive workflow
When invoked, confirm with the user:
1. **What** the icon depicts (subject / brand mark).
2. **Where** it ships → picks the size set (see *Targets* below).
3. **Background**: transparent, or a flat brand tile (color + corner radius).
Then run the pipeline.

---

## Pipeline (4 stages)

### 1. Generate — fight noise at the prompt
Always include these anti-noise clauses in the Leonardo prompt:
> *centered single emblem, app icon, vector logo, flat solid {bg} background,
> generous empty margin, perfectly symmetrical, no text, no words, no
> watermark, no scenery, no environment, no reflection, no floor, no
> background pattern, high contrast, crisp edges*

Generate **square** at high resolution (downscale later, never upscale):
```bash
node .claude/skills/icon-gen/tools/leonardo-image.mjs generate \
  --prompt "<subject>, <anti-noise clauses>" \
  --output .icon-gen-work/master.png \
  --width 1024 --height 1024 \
  --style dynamic --contrast 4 --no-cleanup
```
- `--style dynamic` + `--contrast 4` give clean separation; `vibrant` if you
  want more color pop in the glow.
- Keep `--no-cleanup` so the cloud `imageId` survives for `remove-bg`.

### 2. Background strategy
Lucid Origin **cannot** generate transparency. Two routes:
- **Flat brand tile** (recommended for app icons): prompt for the *same flat
  background color* you'll tile onto (e.g. `#0a0a12`). The `tile` step then just
  rounds the corners and re-pads — no extraction needed, zero halo.
- **Transparent mark**: generate on solid dark, then
  `leonardo-image.mjs remove-bg --id <imageId> --output .icon-gen-work/mark.png`,
  then `tile` with `--bg transparent` or composite onto your own tile.

### 3. Evaluate with Gemini — score, don't just describe
```bash
node .claude/skills/icon-gen/tools/gemini-recognize.mjs \
  --input .icon-gen-work/master.png \
  --prompt "You are reviewing an APP ICON. Score 1-10 on each and explain:
  (1) single clear subject, (2) centered with even margins,
  (3) background is flat/clean with NO scenery-texture-text,
  (4) reads at 16px (squint test), (5) on-brand. End with VERDICT: ship / regenerate."
```
**Also view the PNG yourself** (the Read tool renders images) — trust both.
If Gemini says *regenerate* or any score ≤6, tighten the prompt (more
anti-noise clauses, simpler subject) and loop stage 1. Cap at ~3 iterations,
then fall back to compositing an existing brand asset.

### 4. Export the size set
```bash
node .claude/skills/icon-gen/tools/icon-pipeline.mjs tile \
  --input .icon-gen-work/master.png \
  --output .icon-gen-work/tile-1024.png \
  --bg "#0a0a12" --radius 0.22 --pad 0.10 --trim --glow

node .claude/skills/icon-gen/tools/icon-pipeline.mjs export \
  --input .icon-gen-work/tile-1024.png \
  --app-dir src/app
```

---

## Tools

### Leonardo generation / bg-removal — `tools/leonardo-image.mjs`
`generate --prompt --output --width --height --style --contrast [--no-cleanup]`
`remove-bg --id <imageId> --output path.png`
Styles: `bokeh cinematic dynamic fashion portrait vibrant`.
Contrast: `1.0 1.3 1.8 2.5 3 3.5 4 4.5`.

### Gemini vision — `tools/gemini-recognize.mjs`
`--input path.png --prompt "..."`. Use the scoring prompt in stage 3.

### Icon post-processing — `tools/icon-pipeline.mjs` (sharp)
- **`tile`** — frame a mark on a rounded brand tile.
  `--input --output [--size 1024] [--bg "#0a0a12"|transparent] [--radius 0.22]
  [--pad 0.10] [--trim] [--trim-threshold 10] [--glow] [--glow-color "6,182,212"]`
  Trims the flat border, contain-fits with padding, composites onto a
  rounded-rect tile (optional radial brand glow behind the mark).
- **`export`** — emit the Next.js App Router icon set from a tile.
  `--input --app-dir src/app [--ico 16,32,48] [--icon 512] [--apple 180]
  [--pwa-dir public/icons] [--pwa 192,512] [--bg "#0a0a12"]`
  Writes `favicon.ico` (multi-size PNG-in-ICO), `icon.png`, `apple-icon.png`.
  `apple-icon.png` is flattened over `--bg` (square, no transparent corners,
  per Apple convention).

---

## Targets (Next.js 16 App Router)
Files placed in `src/app/` are auto-linked by Next — no `<link>` tags needed:
- `src/app/favicon.ico` — classic favicon (16/32/48). Replaces Next's default.
- `src/app/icon.png` — modern PNG icon (512). Next emits `<link rel="icon">`.
- `src/app/apple-icon.png` — apple-touch icon (180, square).
- PWA: `public/icons/icon-192.png`, `icon-512.png` referenced from
  `src/app/manifest.ts` (update its `icons` array if you regenerate these).

## Environment
Requires in env (load before running):
- `LEONARDO_API_KEY` — app.leonardo.ai
- `GEMINI_API_KEY` — Google AI Studio (for vision evaluation)

Load (bash): `set -a; . <(grep -E '^(LEONARDO_API_KEY|GEMINI_API_KEY)=' .env); set +a`
Load (PowerShell): `Get-Content .env | ForEach-Object { if ($_ -match '^(LEONARDO_API_KEY|GEMINI_API_KEY)=(.*)') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2]) } }`

## Brand direction
Personas: **neon multi-persona / android head** — three overlapping head
silhouettes in cyan→purple gradient glowing line-art, joined by network nodes.
Futuristic, geometric, clean. Palette (`src/styles/tokens.css`):
`--background #0a0a12`, `--brand-cyan #06b6d4`, `--brand-purple #a855f7`,
`--brand-emerald #34d399`, `--brand-amber #fbbf24`, `--brand-rose #f43f5e`.
