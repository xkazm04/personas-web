import { initSentry } from "@/lib/sentry";

initSentry({
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
