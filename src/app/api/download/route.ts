import { NextRequest, NextResponse } from "next/server";

import { RAW_DOWNLOAD_URL, rejectionMessage, resolveDownloadUrl } from "@/lib/release";

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

// The rule (https + host allowlist) lives in `@/lib/release`, the same
// resolution every client CTA reads through `downloadPlan`, so a URL this route
// refuses can never render as "Download for Windows".
const RESOLUTION = resolveDownloadUrl(RAW_DOWNLOAD_URL);
const DOWNLOAD_URL = RESOLUTION.live ? RESOLUTION.url : null;

const INVALID_ENV_MESSAGE = rejectionMessage(RESOLUTION);
if (INVALID_ENV_MESSAGE && !RESOLUTION.live) {
  console.warn(`[api/download] ${INVALID_ENV_MESSAGE}`);
  reportInvalidEnv(INVALID_ENV_MESSAGE, { ...RESOLUTION.detail });
}

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
