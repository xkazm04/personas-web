import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { writeFileAtomic } from "../../scripts/atomic-write.mjs";

/**
 * scripts/atomic-write.mjs is what every committed-output generator writes
 * through. The contract: a reader sees the old file or the new file, never a
 * partial one, and a failed write leaves neither a changed target nor a temp
 * file behind.
 */

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "atomic-write-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("writeFileAtomic", () => {
  it("creates and then replaces the target", () => {
    const target = path.join(dir, "feed.json");
    writeFileAtomic(target, "first\n");
    expect(fs.readFileSync(target, "utf8")).toBe("first\n");
    writeFileAtomic(target, "second\n");
    expect(fs.readFileSync(target, "utf8")).toBe("second\n");
    expect(fs.readdirSync(dir)).toEqual(["feed.json"]);
  });

  it("writes binary data unchanged", () => {
    const target = path.join(dir, "blob.bin");
    const bytes = new Uint8Array([0, 255, 10, 13, 128]);
    writeFileAtomic(target, bytes);
    expect([...fs.readFileSync(target)]).toEqual([...bytes]);
  });

  it("leaves the target untouched and no temp file when the write throws", () => {
    const target = path.join(dir, "feed.json");
    fs.writeFileSync(target, "committed\n");
    // A target that is a directory makes the rename fail after the temp write.
    const blocked = path.join(dir, "blocked");
    fs.mkdirSync(path.join(blocked, "child"), { recursive: true });
    expect(() => writeFileAtomic(blocked, "new\n")).toThrow();
    expect(fs.readFileSync(target, "utf8")).toBe("committed\n");
    expect(fs.readdirSync(dir).sort()).toEqual(["blocked", "feed.json"]);
  });
});
