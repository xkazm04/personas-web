import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  cacheComponents: true,
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
