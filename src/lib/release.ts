/**
 * The release authority: the ONE place that answers "is a download live",
 * "which version does the site show" and "is the latest release fresh".
 *
 * Before this module the answer lived in seven places under four rules: the
 * server route validated the installer URL against a host allowlist, while
 * the CTA, hero, pricing offer and platform pills trusted the raw env by
 * truthiness, and the navbar ignored it. A URL the route refused could still
 * render "Download for Windows" and loop the click back to `/#download`.
 * Now `resolveDownloadUrl` is the rule, `/api/download` redirects only on its
 * say-so, and every client surface reads `downloadPlan` (built on it), so
 * server and client cannot disagree.
 *
 * Pure and client-safe: no `server-only`, no heavy imports. It deliberately
 * does NOT import `@/data/changelog` - the navbar reads this module on every
 * page, so callers that need the latest release pass their own list to
 * `latestRelease`.
 *
 * `NEXT_PUBLIC_*` values are inlined by Next at build time, and only when
 * written out literally as `process.env.NEXT_PUBLIC_X` - which is why the
 * reads below stay literal and why nothing else in `src/` reads them
 * (`release.test.ts` scans for it).
 */

export type ReleasePlatform = "windows" | "macos" | "linux";

/**
 * Hostnames that may appear as the installer source. Restricting to known
 * release/CDN origins prevents an attacker who can flip
 * NEXT_PUBLIC_DOWNLOAD_URL (env-var compromise, leaked .env, misconfigured
 * preview deploy) from turning /api/download into an open redirect to
 * malware, phishing, or a javascript:/data: URI.
 */
export const ALLOWED_DOWNLOAD_HOSTS: ReadonlySet<string> = new Set<string>([
  "github.com",
  "objects.githubusercontent.com",
  "release-assets.githubusercontent.com",
  "personas.app",
  "downloads.personas.app",
  "cdn.personas.app",
]);

export type DownloadRejection = "unset" | "parse" | "protocol" | "host";

export type DownloadResolution =
  | { live: true; url: string }
  | { live: false; reason: DownloadRejection; detail?: { protocol?: string; host?: string } };

/** The one rule for "is this installer URL servable". */
export function resolveDownloadUrl(raw: string | null | undefined): DownloadResolution {
  if (!raw) return { live: false, reason: "unset" };
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { live: false, reason: "parse" };
  }
  if (parsed.protocol !== "https:") {
    return { live: false, reason: "protocol", detail: { protocol: parsed.protocol } };
  }
  if (!ALLOWED_DOWNLOAD_HOSTS.has(parsed.hostname)) {
    return { live: false, reason: "host", detail: { host: parsed.hostname } };
  }
  return { live: true, url: parsed.toString() };
}

/**
 * Operator-facing explanation of a misconfigured URL, for the route's log and
 * Sentry warning. `null` when there is nothing to report: the URL is live, or
 * the env is intentionally empty (the waitlist is the designed state then).
 */
export function rejectionMessage(res: DownloadResolution): string | null {
  if (res.live) return null;
  switch (res.reason) {
    case "unset":
      return null;
    case "parse":
      return "NEXT_PUBLIC_DOWNLOAD_URL is not a parseable URL; falling back to /#download.";
    case "protocol":
      return `NEXT_PUBLIC_DOWNLOAD_URL must use https (got ${res.detail?.protocol}); falling back to /#download.`;
    case "host":
      return `NEXT_PUBLIC_DOWNLOAD_URL host "${res.detail?.host}" is not in the allowlist; falling back to /#download.`;
  }
}

/** Where every "Download" CTA points when the plan says download. */
export const DOWNLOAD_ENDPOINT = "/api/download";

/**
 * Where a CTA points when there is nothing to download: the always-present
 * download wrapper (page.tsx `wrapperId`), not the inner `#download`, which
 * lives in a lazy section that is not in the DOM on first paint.
 */
export const DOWNLOAD_FALLBACK_HREF = "#download-section";

export type PlatformStatus = "download" | "waitlist";

export interface DownloadPlan {
  live: boolean;
  platforms: Record<ReleasePlatform, PlatformStatus>;
  primary:
    | { kind: "download"; href: typeof DOWNLOAD_ENDPOINT; platform: "windows" }
    | { kind: "waitlist" };
}

/**
 * What every surface offers, derived from the same resolution the route uses.
 * Only a Windows installer ships through the env today; macOS and Linux are
 * always the waitlist until they have their own artifact.
 */
export function downloadPlan(raw: string | null | undefined): DownloadPlan {
  const { live } = resolveDownloadUrl(raw);
  return {
    live,
    platforms: { windows: live ? "download" : "waitlist", macos: "waitlist", linux: "waitlist" },
    primary: live ? { kind: "download", href: DOWNLOAD_ENDPOINT, platform: "windows" } : { kind: "waitlist" },
  };
}

/** The href a plain "Download" link should carry under `plan`. */
export function ctaHref(plan: DownloadPlan): string {
  return plan.primary.kind === "download" ? plan.primary.href : DOWNLOAD_FALLBACK_HREF;
}

/** The raw installer URL, for the route. Clients read `DOWNLOAD_PLAN`. */
export const RAW_DOWNLOAD_URL: string | undefined = process.env.NEXT_PUBLIC_DOWNLOAD_URL;

/** The plan for this build. */
export const DOWNLOAD_PLAN: DownloadPlan = downloadPlan(RAW_DOWNLOAD_URL);

/* ── Versions ─────────────────────────────────────────────────────────── */

/**
 * The version the hero ring and the download badge display. It is the
 * WEBSITE's package.json version (next.config.ts maps it), not the desktop
 * app's. Switching the display to the desktop version (`latestRelease` over
 * `@/data/changelog`) is an owner decision that has not been made - keep
 * rendered surfaces on this value until it is.
 */
export function siteVersion(raw: string | undefined): string {
  return raw ?? "0.1.0";
}

export const SITE_VERSION: string = siteVersion(process.env.NEXT_PUBLIC_APP_VERSION);

/** Badge title beside the version ("Latest" unless the build names it). */
export const RELEASE_TITLE: string = process.env.NEXT_PUBLIC_RELEASE_TITLE || "Latest";

/**
 * The latest release by date, not by array position (release lists carry no
 * sort invariant). Entries with an unparseable date are skipped; ties keep the
 * first. Empty -> null.
 */
export function latestRelease<T extends { version: string; date: string }>(releases: readonly T[]): T | null {
  let best: T | null = null;
  let bestTs = -Infinity;
  for (const r of releases) {
    const ts = Date.parse(r.date);
    if (!Number.isNaN(ts) && ts > bestTs) {
      bestTs = ts;
      best = r;
    }
  }
  return best;
}

/* ── Freshness pulse ──────────────────────────────────────────────────── */

export const FRESH_RELEASE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Bare `YYYY-MM-DD` is UTC midnight; anything else goes through `Date.parse`. */
export function parseReleaseTimestamp(raw: string): number | null {
  if (!raw) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00Z` : raw;
  const ts = Date.parse(iso);
  return Number.isNaN(ts) ? null : ts;
}

/** A release is fresh for seven days after its date. `now` is passed in (purity). */
export function isFreshRelease(date: string, now: number): boolean {
  const ts = parseReleaseTimestamp(date);
  return ts !== null && now - ts < FRESH_RELEASE_WINDOW_MS;
}

/**
 * Whether the badge pulse may follow the changelog's latest date when the
 * RELEASE_DATE env is empty. OFF: the badge shows the SITE version, so pulsing
 * it because the DESKTOP app shipped would pair a new-release signal with a
 * version that did not change - and today, with the env empty, no pulse ever
 * renders. Turning this on is part of the same owner decision as the
 * displayed version above.
 */
export const PULSE_FROM_CHANGELOG = false;

/** The date the freshness pulse keys off: the env wins; the changelog only behind the flag. */
export function releasePulseDate(
  envDate: string,
  latest: { date: string } | null,
  fromChangelog: boolean = PULSE_FROM_CHANGELOG,
): string {
  if (envDate) return envDate;
  return fromChangelog && latest ? latest.date : "";
}

/** RELEASE_DATE as the build received it (empty when unset). */
export const RELEASE_DATE_ENV: string = process.env.NEXT_PUBLIC_RELEASE_DATE ?? "";
