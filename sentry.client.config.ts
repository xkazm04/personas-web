import * as Sentry from "@sentry/nextjs";
import { baseSentryConfig } from "@/lib/sentry";
import { scrubEvent, scrubBreadcrumb } from "./src/lib/sentry-pii";

Sentry.init({
  ...baseSentryConfig,

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  sendDefaultPii: false,

  beforeSend(event) {
    return scrubEvent(event);
  },

  beforeBreadcrumb(breadcrumb) {
    return scrubBreadcrumb(breadcrumb);
  },
});
