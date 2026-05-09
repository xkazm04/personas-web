import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let cleanupStarted = false;

function cleanupExpiredBuckets(now = Date.now()) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

function ensureCleanup() {
  if (cleanupStarted || typeof setInterval === "undefined") return;
  cleanupStarted = true;
  const timer = setInterval(() => cleanupExpiredBuckets(), 5 * 60_000);
  timer.unref?.();
}

export interface RateLimitOptions {
  namespace: string;
  key: string;
  limit: number;
  windowMs: number;
}

export function isRateLimited({
  namespace,
  key,
  limit,
  windowMs,
}: RateLimitOptions): boolean {
  ensureCleanup();
  const now = Date.now();
  const bucketKey = `${namespace}:${key}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
