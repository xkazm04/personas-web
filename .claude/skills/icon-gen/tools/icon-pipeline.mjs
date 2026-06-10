#!/usr/bin/env node

/**
 * Icon Pipeline — turn a generated master image into a branded app-icon set.
 *
 * Commands:
 *   tile   --input master.png --output tile.png
 *          [--size 1024] [--bg "#0a0a12"|transparent] [--radius 0.22] [--pad 0.10]
 *          [--trim] [--trim-threshold 10] [--glow] [--glow-color "6,182,212"]
 *     Frame a mark on a rounded brand tile: optional trim of the flat border,
 *     contain-fit with padding, composite onto a rounded-rect background
 *     (optional radial brand glow behind the mark).
 *
 *   export --input tile.png --app-dir src/app
 *          [--ico 16,32,48] [--icon 512] [--apple 180]
 *          [--pwa-dir public/icons] [--pwa 192,512] [--bg "#0a0a12"]
 *     Emit the Next.js App Router icon set: favicon.ico (multi-size PNG-in-ICO),
 *     icon.png, apple-icon.png (flattened over --bg, square). Optionally PWA pngs.
 *
 * Requires the 'sharp' package (already a project dependency).
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { dirname, resolve, join } from 'path';

function parseArgs(argv) {
  const args = {};
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { args[key] = next; i++; }
      else { args[key] = true; }
    } else { positional.push(argv[i]); }
  }
  return { command: positional[0], args };
}

function fail(obj) { console.error(JSON.stringify(obj)); process.exit(1); }

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function roundedRectSvg(size, radius) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );
}

function radialGlowSvg(size, triplet) {
  const [r, g, b] = String(triplet).split(',').map((n) => parseInt(n, 10));
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<defs><radialGradient id="g" cx="50%" cy="50%" r="55%">` +
    `<stop offset="0%" stop-color="rgb(${r},${g},${b})" stop-opacity="0.38"/>` +
    `<stop offset="55%" stop-color="rgb(${r},${g},${b})" stop-opacity="0.10"/>` +
    `<stop offset="100%" stop-color="rgb(${r},${g},${b})" stop-opacity="0"/>` +
    `</radialGradient></defs>` +
    `<rect width="${size}" height="${size}" fill="url(#g)"/></svg>`,
  );
}

async function tile(args) {
  if (!args.input || !args.output) fail({ error: 'tile requires --input and --output' });
  const size = parseInt(args.size || '1024', 10);
  const bgArg = args.bg || '#0a0a12';
  const transparentBg = String(bgArg).toLowerCase() === 'transparent';
  const bg = transparentBg ? { r: 0, g: 0, b: 0 } : hexToRgb(bgArg);
  if (!bg) fail({ error: `invalid --bg color: ${bgArg} (use #rrggbb or "transparent")` });
  const radius = Math.round(size * parseFloat(args.radius ?? '0.22'));
  const pad = parseFloat(args.pad ?? '0.10');
  const contentSize = Math.max(1, Math.round(size * (1 - 2 * pad)));

  // 1. Load mark, optionally trim the flat border (works for solid or alpha bg).
  let mark = sharp(resolve(args.input));
  if (args.trim) {
    mark = mark.trim({ threshold: parseInt(args['trim-threshold'] || '10', 10) });
  }
  // 2. Contain-fit the mark into the padded content box (transparent gutters).
  const markBuf = await mark
    .resize(contentSize, contentSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, withoutEnlargement: false })
    .png()
    .toBuffer();

  // 3. Base tile (solid brand color, or transparent).
  const base = sharp({
    create: { width: size, height: size, channels: 4, background: { ...bg, alpha: transparentBg ? 0 : 1 } },
  });

  // 4. Composite optional glow under the centered mark.
  const layers = [];
  if (args.glow) layers.push({ input: radialGlowSvg(size, args['glow-color'] || '6,182,212'), gravity: 'center' });
  layers.push({ input: markBuf, gravity: 'center' });
  const composed = await base.composite(layers).png().toBuffer();

  // 5. Round the corners (dest-in keeps only inside the rounded rect).
  const out = await sharp(composed)
    .composite([{ input: roundedRectSvg(size, radius), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const abs = resolve(args.output);
  mkdirSync(dirname(abs), { recursive: true });
  await sharp(out).toFile(abs);
  console.log(JSON.stringify({ success: true, output: abs, size, bg: transparentBg ? 'transparent' : bgArg, radius, pad, glow: !!args.glow }, null, 2));
}

// Pack a set of PNG buffers into a single .ico (PNG-in-ICO; supported by all
// modern browsers and Windows Vista+).
function buildIco(sizes, buffers) {
  const count = sizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);
  const dir = [];
  let offset = 6 + count * 16;
  for (let i = 0; i < count; i++) {
    const e = Buffer.alloc(16);
    const s = sizes[i];
    e.writeUInt8(s >= 256 ? 0 : s, 0); // width (0 = 256)
    e.writeUInt8(s >= 256 ? 0 : s, 1); // height
    e.writeUInt8(0, 2);  // palette
    e.writeUInt8(0, 3);  // reserved
    e.writeUInt16LE(1, 4);  // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buffers[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buffers[i].length;
    dir.push(e);
  }
  return Buffer.concat([header, ...dir, ...buffers]);
}

async function exportSet(args) {
  if (!args.input || !args['app-dir']) fail({ error: 'export requires --input and --app-dir' });
  const input = resolve(args.input);
  const appDir = resolve(args['app-dir']);
  mkdirSync(appDir, { recursive: true });
  const bgArg = args.bg || '#0a0a12';
  const bg = hexToRgb(bgArg) || { r: 10, g: 10, b: 18 };
  const written = [];

  const transparentResize = (s) =>
    sharp(input).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png();

  // favicon.ico (transparent, multi-size)
  const icoSizes = String(args.ico || '16,32,48').split(',').map((n) => parseInt(n, 10));
  const icoBufs = await Promise.all(icoSizes.map((s) => transparentResize(s).toBuffer()));
  const icoPath = join(appDir, 'favicon.ico');
  await (await import('fs')).promises.writeFile(icoPath, buildIco(icoSizes, icoBufs));
  written.push({ file: icoPath, sizes: icoSizes });

  // icon.png (modern PNG, transparent corners)
  const iconSize = parseInt(args.icon || '512', 10);
  const iconPath = join(appDir, 'icon.png');
  await transparentResize(iconSize).toFile(iconPath);
  written.push({ file: iconPath, size: iconSize });

  // apple-icon.png (square, corners flattened over bg)
  const appleSize = parseInt(args.apple || '180', 10);
  const applePath = join(appDir, 'apple-icon.png');
  await sharp(input)
    .resize(appleSize, appleSize, { fit: 'contain', background: bg })
    .flatten({ background: bg })
    .png()
    .toFile(applePath);
  written.push({ file: applePath, size: appleSize });

  // optional PWA icons (square, flattened — good for maskable)
  if (args['pwa-dir'] && args.pwa) {
    const pwaDir = resolve(args['pwa-dir']);
    mkdirSync(pwaDir, { recursive: true });
    for (const s of String(args.pwa).split(',').map((n) => parseInt(n, 10))) {
      const p = join(pwaDir, `icon-${s}.png`);
      await sharp(input).resize(s, s, { fit: 'contain', background: bg }).flatten({ background: bg }).png().toFile(p);
      written.push({ file: p, size: s });
    }
  }

  console.log(JSON.stringify({ success: true, written }, null, 2));
}

const { command, args } = parseArgs(process.argv);
switch (command) {
  case 'tile': tile(args); break;
  case 'export': exportSet(args); break;
  default:
    console.error(`Unknown command: ${command || '(none)'}\nCommands: tile, export`);
    process.exit(1);
}
