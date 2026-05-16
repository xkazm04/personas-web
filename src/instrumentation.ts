import * as Sentry from "@sentry/nextjs";
import { validateOrchestratorUrl } from "./lib/orchestrator-config";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }

  // Fail-fast on a malformed orchestrator URL so a bad deploy surfaces here
  // (with the offending value named) instead of as a generic "Invalid URL"
  // DOMException on every API call. Skipped when running mock-mode dev where
  // the URL is intentionally absent.
  if (
    process.env.NEXT_PUBLIC_USE_MOCK_API !== "true" &&
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL !== undefined &&
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL.trim() !== ""
  ) {
    validateOrchestratorUrl(process.env.NEXT_PUBLIC_ORCHESTRATOR_URL);
  }
}

export const onRequestError = Sentry.captureRequestError;
