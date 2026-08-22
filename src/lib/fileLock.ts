/**
 * IN-PROCESS mutex for read-modify-write serialization on the filesystem.
 *
 * ── What this actually is ───────────────────────────────────────────────
 * A `Map<string, Promise<void>>` — a per-key promise chain, nothing more.
 * There is no lockfile, no `O_EXCL` create, no `flock`/`fcntl`, and no
 * advisory lock of any kind. Despite living next to filesystem code, this
 * does NOT take a lock the operating system or any other process can see.
 *
 * ── What it guarantees ──────────────────────────────────────────────────
 * Within ONE Node process, all `withWriteLock(key, …)` callbacks for the same
 * key run strictly one at a time, in call order. That is enough to remove the
 * TOCTOU window between a `readJsonFile` and its matching `writeJsonFile` when
 * concurrent requests are handled by the same process — which is the case for
 * `next dev` and a single `next start`.
 *
 * ── Where it fails ──────────────────────────────────────────────────────
 * The moment there are TWO processes, this provides nothing. Both hold their
 * own empty `Map`, both read the same JSON, both apply their edit to their own
 * copy, and the second `fs.rename` wins — the first writer's change is silently
 * lost. That is not a corner case in this deployment:
 *   - serverless (Vercel/Lambda) runs many concurrent instances by design;
 *   - `next start` behind a process manager / multiple workers;
 *   - any `scripts/*.mjs` run against `.data/` while the server is up.
 * The `.data/*.json` store is already documented as local-dev-only for exactly
 * this reason (see the header of src/app/api/waitlist/route.ts). Treat this
 * lock as a single-process correctness aid, never as a durability guarantee.
 *
 * Making this cross-process is a design change (lockfile + retry/steal policy,
 * or moving the store to Postgres), not a comment fix — do not reach for that
 * here without deciding it deliberately.
 *
 * Each lock key gets its own independent promise chain so unrelated files
 * don't block each other.
 */

const locks = new Map<string, Promise<void>>();

export function withWriteLock<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  // Update the chain so subsequent callers wait for this one.
  // Swallow errors to prevent a failed request from breaking the chain.
  locks.set(
    key,
    next.then(
      () => {},
      () => {},
    ),
  );
  return next;
}
