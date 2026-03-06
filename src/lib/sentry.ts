import type { ErrorEvent } from "@sentry/nextjs";

export function stripPii(event: ErrorEvent): ErrorEvent {
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
  }
  if (event.request) {
    delete event.request.headers;
    delete event.request.data;
  }
  return event;
}

export const baseSentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: stripPii,
} as const;
