import * as Sentry from "@sentry/nextjs";
import { baseSentryConfig } from "@/lib/sentry";

Sentry.init({
  ...baseSentryConfig,
});
