import { NextRequest, NextResponse } from "next/server";

/**
 * Hostnames that may appear as the artifact source. Restricting to known
 * release/CDN origins prevents an attacker who can flip
 * NEXT_PUBLIC_DOWNLOAD_URL (env-var compromise, leaked .env, misconfigured
 * preview deploy) from turning /api/download into an open redirect to
 * malware, phishing, or a javascript:/data: URI.
 */
const ALLOWED_DOWNLOAD_HOSTS = new Set<string>([
  "github.com",
  "objects.githubusercontent.com",
  "release-assets.githubusercontent.com",
  "personas.app",
  "downloads.personas.app",
  "cdn.personas.app",
]);

function reportInvalidEnv(reason: string, data: Record<string, unknown>): void {
  // Module-load validation runs exactly once per process, so a single Sentry
  // breadcrumb here is enough for ops to spot a misconfigured deploy without
  // flooding the issue stream on every download click.
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.captureMessage(`[api/download] ${reason}`, {
        level: "warning",
        extra: data,
      });
    })
    .catch(() => {
      // Sentry is optional — never let telemetry failures break the route.
    });
}

function validateDownloadUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    const msg =
      "NEXT_PUBLIC_DOWNLOAD_URL is not a parseable URL; falling back to /#download.";
    console.warn(`[api/download] ${msg}`);
    reportInvalidEnv(msg, {});
    return null;
  }
  if (parsed.protocol !== "https:") {
    const msg = `NEXT_PUBLIC_DOWNLOAD_URL must use https (got ${parsed.protocol}); falling back to /#download.`;
    console.warn(`[api/download] ${msg}`);
    reportInvalidEnv(msg, { protocol: parsed.protocol });
    return null;
  }
  if (!ALLOWED_DOWNLOAD_HOSTS.has(parsed.hostname)) {
    const msg = `NEXT_PUBLIC_DOWNLOAD_URL host "${parsed.hostname}" is not in the allowlist; falling back to /#download.`;
    console.warn(`[api/download] ${msg}`);
    reportInvalidEnv(msg, { host: parsed.hostname });
    return null;
  }
  return parsed.toString();
}

const DOWNLOAD_URL = validateDownloadUrl(process.env.NEXT_PUBLIC_DOWNLOAD_URL);

/**
 * GET /api/download
 * Redirects to the latest release artifact.
 */
export async function GET(req: NextRequest) {
  if (!DOWNLOAD_URL) {
    // If no download URL is configured (or it failed validation), redirect
    // back to home with the download hash so the UI can show the waitlist
    // modal fallback.
    return NextResponse.redirect(new URL("/#download", req.url));
  }

  // Tracking could be added here if needed, though client-side tracking is already in place.
  return NextResponse.redirect(DOWNLOAD_URL);
}
