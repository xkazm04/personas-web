/**
 * Write a generated file so that a reader — `git add`, a dev server watcher, a
 * concurrent session staging the tree — only ever sees the old contents or the
 * new contents, never a half-written file.
 *
 * The data goes to a sibling temp file first (same directory, so the rename
 * stays on one filesystem and is atomic), then is renamed over the target. If
 * the write throws, the temp file is removed and the target is left untouched.
 *
 * Every generator under scripts/ that emits a committed file writes through
 * this; a plain fs.writeFileSync on a committed output is how a feed once got
 * captured mid-write and needed a follow-up commit.
 */
import fs from "node:fs";
import path from "node:path";

// Windows reports a transient EPERM/EBUSY/EACCES when another process (an
// editor, a watcher, antivirus) has the target open at the moment of rename.
const RETRYABLE = new Set(["EPERM", "EBUSY", "EACCES"]);
const RENAME_ATTEMPTS = 5;

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * @param {string} file target path
 * @param {string | Uint8Array} data contents
 * @param {BufferEncoding} [encoding] defaults to "utf8" for string data
 */
export function writeFileAtomic(file, data, encoding = "utf8") {
  const target = path.resolve(file);
  const tmp = path.join(path.dirname(target), `.${path.basename(target)}.tmp-${process.pid}`);
  try {
    fs.writeFileSync(tmp, data, typeof data === "string" ? encoding : undefined);
    for (let attempt = 1; ; attempt++) {
      try {
        fs.renameSync(tmp, target);
        return;
      } catch (err) {
        if (attempt >= RENAME_ATTEMPTS || !RETRYABLE.has(/** @type {NodeJS.ErrnoException} */ (err).code ?? "")) throw err;
        sleepSync(50 * attempt);
      }
    }
  } catch (err) {
    fs.rmSync(tmp, { force: true });
    throw err;
  }
}
