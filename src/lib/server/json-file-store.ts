import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { withWriteLock } from "@/lib/fileLock";

const DATA_DIR = path.join(process.cwd(), ".data");

function resolveDataPath(fileName: string): string {
  return path.join(DATA_DIR, fileName);
}

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  let raw: string;
  try {
    raw = await fs.readFile(resolveDataPath(fileName), "utf-8");
  } catch (err) {
    // A missing file is the only legitimate "use the fallback" case — it means
    // the store has not been created yet.
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return fallback;
    // Any other read failure (EACCES, EIO, EBUSY, …) must NOT be swallowed into
    // the empty fallback: the read-modify-write callers would then persist that
    // empty value over the real data on the next write. Fail loud instead.
    console.error(`[json-file-store] read failed for ${fileName}:`, err);
    throw err;
  }
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    // The file exists but is corrupt/unparseable. Returning the empty fallback
    // here is the data-loss bug: updateJsonFile / the votes RMW would treat
    // "empty" as authoritative and rename it over the real dataset. Refuse so a
    // corrupt read can never be persisted over good data; the file is preserved
    // in place for recovery.
    console.error(`[json-file-store] corrupt JSON in ${fileName}; refusing to use empty fallback:`, err);
    throw new Error(`Corrupt data file ${fileName}; refusing to overwrite. Inspect/restore .data/${fileName}.`);
  }
}

export async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = path.join(
    DATA_DIR,
    `.${fileName.replace(/[^a-z0-9.-]/gi, "-")}-${randomBytes(6).toString("hex")}.tmp`,
  );
  try {
    await fs.writeFile(tmpFile, JSON.stringify(data, null, 2));
    await fs.rename(tmpFile, resolveDataPath(fileName));
  } catch (err) {
    // If the write or the atomic rename fails (EXDEV, EACCES, ENOSPC, EPERM on
    // Windows when a reader holds the target open, …), unlink the temp file so a
    // unique-named `.tmp` orphan doesn't accumulate on every failure.
    await fs.rm(tmpFile, { force: true }).catch(() => {});
    throw err;
  }
}

export function updateJsonFile<T>(
  lockKey: string,
  fileName: string,
  fallback: T,
  update: (data: T) => Promise<T> | T,
): Promise<T> {
  return withWriteLock(lockKey, async () => {
    const current = await readJsonFile(fileName, fallback);
    const next = await update(current);
    await writeJsonFile(fileName, next);
    return next;
  });
}
