export class OrchestratorConfigError extends Error {
  constructor(message?: string) {
    super(
      message ??
        "Missing NEXT_PUBLIC_ORCHESTRATOR_URL. Set this env var to the orchestrator's base URL " +
          "(e.g. https://orchestrator.example.com) in your deployment environment, then redeploy.",
    );
    this.name = "OrchestratorConfigError";
  }
}

export function validateOrchestratorUrl(raw: string | undefined): string {
  if (!raw || raw.trim() === "") {
    throw new OrchestratorConfigError();
  }
  const base = raw.trim();
  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    throw new OrchestratorConfigError(
      `Malformed NEXT_PUBLIC_ORCHESTRATOR_URL: ${JSON.stringify(raw)}. ` +
        "Expected an absolute URL like https://orchestrator.example.com.",
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new OrchestratorConfigError(
      `Invalid NEXT_PUBLIC_ORCHESTRATOR_URL protocol "${parsed.protocol}" in ${JSON.stringify(raw)}. ` +
        "Only http: and https: are supported.",
    );
  }
  return base;
}
