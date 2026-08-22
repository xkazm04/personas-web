import * as Sentry from "@sentry/nextjs";
import { safeScrubEvent, safeScrubBreadcrumb } from "./sentry-pii";

export const baseSentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
  sendDefaultPii: false,
  // Fail-closed wrappers, never the bare scrubbers: a thrown callback is
  // treated as "send the original" by several transports, which would ship the
  // exact payload these hooks exist to remove. See src/lib/sentry-pii.ts.
  beforeSend: safeScrubEvent,
  beforeBreadcrumb: safeScrubBreadcrumb,
} as const;

/**
 * Initialize Sentry with base configuration and optional overrides.
 * Used to deduplicate identical server/edge/client configs.
 */
export function initSentry(overrides: Parameters<typeof Sentry.init>[0] = {}) {
  Sentry.init({
    ...baseSentryConfig,
    ...overrides,
  });
}
