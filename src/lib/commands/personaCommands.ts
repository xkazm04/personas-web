/**
 * The command half of `ApiClient` (PHASE2-SPEC.md 6.2): on a command plane
 * (the demo's scripted desktop, the live sync mirror) pause, resume, run and
 * cancel are commands, answered with the command id to follow in
 * `commandStore`, not with their effect.
 *
 * `mockApi` and `supabaseApi` load this lazily: `commandStore` reaches the
 * `api` proxy through `personaStore`, so a static import from the planes
 * would be a module cycle.
 */
import type { CommandAck } from "@/lib/api";
import { useCommandStore } from "@/stores/commandStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { usePersonaStore } from "@/stores/personaStore";
import { newestDevice } from "@/lib/sync/reachability";
import type { CommandVerb } from "./envelope";

/**
 * The desktop a persona's command goes to, from what this tab already holds:
 * the device that owns the persona (spec 2.2), else the newest synced device
 * (the phone's `fallbackDeviceId`). Undefined when the persona is not loaded
 * (ask the mirror), null when it is but no device is known.
 */
export function knownOwnerDevice(personaId: string): string | null | undefined {
  const persona = usePersonaStore.getState().personasById[personaId];
  if (!persona) return undefined;
  return persona.deviceId ?? newestDevice(useDeviceStore.getState().devices)?.deviceId ?? null;
}

export async function sendPersonaCommand(
  verb: CommandVerb,
  personaId: string,
  params: Record<string, unknown>,
  target: { demo: boolean; deviceId: string | null },
): Promise<CommandAck> {
  const commandId = await useCommandStore.getState().send(verb, { personaId, deviceId: target.deviceId, demo: target.demo }, params);
  return { commandId };
}
