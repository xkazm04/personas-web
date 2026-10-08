import { api } from "@/lib/api";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

/**
 * The phone's persona actions, sent through the `api` proxy so demo (the
 * scripted desktop in mockCommandPlane) and live (a signed `pending_commands`
 * row) share one path. Each one lands in `commandStore`, whose chip on the
 * row shows the outcome, so these only report what never reached the plane.
 */
function report(err: unknown, action: string) {
  captureExceptionScrubbed(err, { tags: { scope: "phonePersonaAction", action } });
}

export function sendPersonaAction(action: "pause" | "resume", personaId: string): void {
  const call = action === "pause" ? api.pausePersona(personaId) : api.resumePersona(personaId);
  call.catch((err: unknown) => report(err, action));
}

/** `run_persona` with an already-validated prompt (`runParams`). */
export function sendRun(personaId: string, prompt: string): void {
  api.executePersona(personaId, prompt).catch((err: unknown) => report(err, "run"));
}

export function sendCancel(personaId: string, executionId: string): void {
  api.cancelExecution(executionId, personaId).catch((err: unknown) => report(err, "cancel"));
}
