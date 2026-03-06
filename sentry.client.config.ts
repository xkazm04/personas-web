import * as Sentry from "@sentry/nextjs";
import { baseSentryConfig } from "@/lib/sentry";

Sentry.init({
  ...baseSentryConfig,

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
