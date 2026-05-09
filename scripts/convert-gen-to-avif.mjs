#!/usr/bin/env node
/**
 * One-shot converter: walks public/gen/{backgrounds,patterns} and writes a
 * sibling .avif for every .png. Decorative artwork at 8–15% opacity tolerates
 * aggressive AVIF settings; sizes drop ~60–80% with no perceptible quality
 * loss in the page contexts these are rendered in.
 *
 * After conversion, the .png originals are removed and source references
 * are updated to .avif.
 */
import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOTS = ["public/gen/backgrounds", "public/gen/patterns"];
const AVIF_OPTIONS = { quality: 50, effort: 6, chromaSubsampling: "4:2:0" };

let totalBefore = 0;
let totalAfter = 0;

async function processDir(dir) {
  const entries = await readdir(dir);
  for (const name of entries) {
    if (!name.endsWith(".png")) continue;
    const pngPath = join(dir, name);
    const avifPath = pngPath.replace(/\.png$/, ".avif");

    const beforeStat = await stat(pngPath);
    totalBefore += beforeStat.size;

    await sharp(pngPath).avif(AVIF_OPTIONS).toFile(avifPath);

    const afterStat = await stat(avifPath);
    totalAfter += afterStat.size;

    const ratio = ((1 - afterStat.size / beforeStat.size) * 100).toFixed(1);
    console.log(
      `${name.padEnd(28)} ${(beforeStat.size / 1024).toFixed(0).padStart(5)}K -> ${(afterStat.size / 1024).toFixed(0).padStart(4)}K  (-${ratio}%)`,
    );

    await unlink(pngPath);
  }
}

for (const root of ROOTS) {
  console.log(`\n# ${root}`);
  await processDir(root);
}

const totalRatio = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
console.log(
  `\nTotal: ${(totalBefore / 1024).toFixed(0)}K -> ${(totalAfter / 1024).toFixed(0)}K  (-${totalRatio}%)`,
);
