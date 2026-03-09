import { NextRequest, NextResponse } from "next/server";

const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;

/**
 * GET /api/download
 * Redirects to the latest release artifact.
 */
export async function GET(req: NextRequest) {
  if (!DOWNLOAD_URL) {
    // If no download URL is configured, redirect back to home with the download hash
    // so the UI can show the waitlist modal fallback.
    return NextResponse.redirect(new URL("/#download", req.url));
  }

  // Tracking could be added here if needed, though client-side tracking is already in place.
  return NextResponse.redirect(DOWNLOAD_URL);
}
