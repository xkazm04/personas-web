/**
 * In-process mutex for read-modify-write serialization on the filesystem.
 *
 * Chains all mutating operations so concurrent requests are serialized,
 * preventing TOCTOU race conditions when multiple requests read-modify-write
 * the same JSON file.
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
