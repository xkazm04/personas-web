import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Golden output of the `icon-gen` skill: the icon set it exported into this repo.
 *
 * icon-gen's tools call Leonardo, Gemini and `sharp` and run their CLI on
 * import, so CI cannot re-run them. What CI can do is hold the files they
 * produced to the contract in `.claude/skills/icon-gen/SKILL.md` ("Targets"):
 * a PNG-in-ICO favicon with 16/32/48 entries, a 512 px `icon.png` that keeps
 * its transparent corners, a 180 px `apple-icon.png` flattened with no alpha,
 * and PWA icons whose pixels match what `src/app/manifest.ts` declares. A
 * regenerated set that ships the wrong sizes, a BMP favicon, a transparent
 * apple-touch icon or a manifest pointing at the wrong size fails here.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel));
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Width, height and colour type from a PNG's IHDR chunk. */
function pngHeader(buf: Buffer): { width: number; height: number; colorType: number } {
  expect(buf.subarray(0, 8).equals(PNG_SIGNATURE), "not a PNG").toBe(true);
  expect(buf.toString("latin1", 12, 16)).toBe("IHDR");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf.readUInt8(25) };
}

/** PNG colour types 4 (grey + alpha) and 6 (RGBA) carry an alpha channel. */
const hasAlpha = (colorType: number) => colorType === 4 || colorType === 6;

describe("icon-gen golden output", () => {
  it("src/app/favicon.ico is a PNG-in-ICO with 16, 32 and 48 px entries", () => {
    const ico = read("src/app/favicon.ico");
    expect(ico.readUInt16LE(0), "reserved").toBe(0);
    expect(ico.readUInt16LE(2), "type 1 = icon").toBe(1);
    const count = ico.readUInt16LE(4);
    const sizes: number[] = [];
    for (let i = 0; i < count; i++) {
      const entry = 6 + i * 16;
      const size = ico.readUInt8(entry) || 256;
      const length = ico.readUInt32LE(entry + 8);
      const offset = ico.readUInt32LE(entry + 12);
      expect(offset + length, `entry ${i} runs past the end`).toBeLessThanOrEqual(ico.length);
      const png = pngHeader(ico.subarray(offset, offset + length));
      expect([png.width, png.height], `entry ${i} pixels match its directory size`).toEqual([size, size]);
      sizes.push(size);
    }
    expect(sizes.sort((a, b) => a - b)).toEqual([16, 32, 48]);
  });

  it("src/app/icon.png is 512 px square and keeps an alpha channel", () => {
    const png = pngHeader(read("src/app/icon.png"));
    expect([png.width, png.height]).toEqual([512, 512]);
    expect(hasAlpha(png.colorType), `colour type ${png.colorType}`).toBe(true);
  });

  it("src/app/apple-icon.png is 180 px square and flattened (no alpha)", () => {
    const png = pngHeader(read("src/app/apple-icon.png"));
    expect([png.width, png.height]).toEqual([180, 180]);
    expect(hasAlpha(png.colorType), `colour type ${png.colorType}`).toBe(false);
  });

  it("every icon src/app/manifest.ts declares exists at the size it declares", () => {
    const manifest = fs.readFileSync(path.join(ROOT, "src", "app", "manifest.ts"), "utf8");
    const icons = [...manifest.matchAll(/src:\s*"([^"]+)",\s*sizes:\s*"(\d+)x(\d+)"/g)];
    expect(icons.length).toBeGreaterThan(0);
    for (const [, src, w, h] of icons) {
      const png = pngHeader(read(path.join("public", src)));
      expect([png.width, png.height], src).toEqual([Number(w), Number(h)]);
    }
  });
});
