/**
 * Module-level "people waiting" count cache (same shape as
 * src/hooks/useLiveStats.ts).
 *
 * The waitlist modal has two mount points (navbar + download CTA) and re-opens
 * freely, so an un-cached GET on every open meant one request per open, per
 * surface. Cached for the session; `primeWaitlistCount` folds the authoritative
 * count from a POST response back in so both surfaces agree after a signup.
 */
export type PlatformCounts = Record<string, number>;

let cachedCounts: PlatformCounts | null = null;
let inflightCounts: Promise<PlatformCounts | null> | null = null;

export function loadWaitlistCounts(): Promise<PlatformCounts | null> {
  if (cachedCounts) return Promise.resolve(cachedCounts);
  inflightCounts ??= fetch("/api/waitlist")
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { counts?: PlatformCounts } | null) => {
      // A non-ok response (e.g. 429) stays uncached and leaves the count null,
      // exactly as before — the modal header degrades gracefully.
      const counts = data?.counts ?? null;
      if (counts) cachedCounts = counts;
      return counts;
    })
    .finally(() => {
      inflightCounts = null;
    });
  return inflightCounts;
}

export function primeWaitlistCount(platform: string, count: number) {
  cachedCounts = { ...(cachedCounts ?? {}), [platform]: count };
}
