import * as Sentry from "@sentry/nextjs";
import { scrubEvent, scrubBreadcrumb } from "./sentry-pii";

export const baseSentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: scrubEvent,
  beforeBreadcrumb: scrubBreadcrumb,
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
