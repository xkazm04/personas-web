import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { readFileSync } from "fs";
import { join } from "path";

const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8"));

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      // Supabase auth (REST `/auth/v1`, `/rest/v1`) + Realtime (wss). Without
      // these the browser blocks every Supabase call as a CSP violation, which
      // breaks Google sign-in and the live-sync subscription. Wildcard so it
      // works for any project ref (`<ref>.supabase.co`).
      [
        "connect-src 'self'",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        process.env.NEXT_PUBLIC_SENTRY_DSN ? "*.sentry.io" : "",
      ]
        .filter(Boolean)
        .join(" "),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_RELEASE_TITLE: process.env.RELEASE_TITLE ?? "",
    NEXT_PUBLIC_RELEASE_DATE: process.env.RELEASE_DATE ?? "",
  },
  // Prefer AVIF, then WebP for `next/image` requests; the browser receives
  // whichever modern format it advertises support for and falls back to the
  // source PNG/JPG only when neither is acceptable.
  images: {
    formats: ["image/avif", "image/webp"],
    // CinematicBg/ImageBackground request quality={80}; Next 16 only serves
    // qualities explicitly allowed here (default is just 75).
    qualities: [75, 80],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Upload source maps to Sentry only when auth token is available (CI)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress source-map upload logs during build
  silent: true,

  // Delete source maps after upload so they don't ship to the client
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
