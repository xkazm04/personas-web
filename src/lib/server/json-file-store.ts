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
  try {
    const raw = await fs.readFile(resolveDataPath(fileName), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = path.join(
    DATA_DIR,
    `.${fileName.replace(/[^a-z0-9.-]/gi, "-")}-${randomBytes(6).toString("hex")}.tmp`,
  );
  await fs.writeFile(tmpFile, JSON.stringify(data, null, 2));
  await fs.rename(tmpFile, resolveDataPath(fileName));
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
