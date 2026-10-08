/**
 * The live half of the command plane: signed `pending_commands` rows on the
 * user's Supabase tenant (PHASE2-SPEC.md 2.2-2.4). Loaded lazily by
 * `commandStore`, only on the supabase plane for a signed-in, paired browser.
 * RLS (`user_id = auth.uid()`) scopes every read and write to the user.
 */
import { getSupabase } from "@/lib/supabase";
import type { CommandRowUpdate } from "./commandReducer";
import { buildEnvelope, envelopeTimes, type CommandVerb } from "./envelope";
import { loadController, signEnvelope } from "./signer";

export interface LiveCommand {
  id: string;
  verb: CommandVerb;
  personaId: string;
  /** `synced_personas.device_id`: the desktop that owns the persona. */
  deviceId: string;
  params: Record<string, unknown>;
  nowMs: number;
}

/** Postgres unique_violation: the same id was inserted before (a resend after a network error). */
const UNIQUE_VIOLATION = "23505";

/** Sign and insert. Resolves once the row exists; the outcome arrives over Realtime or the poll. */
export async function sendLiveCommand(c: LiveCommand): Promise<{ expiresAt: number }> {
  const controller = await loadController();
  if (!controller) throw new Error("controller_not_paired");
  const { iat, exp } = envelopeTimes(c.nowMs);
  const envelope = buildEnvelope({
    id: c.id,
    dev: c.deviceId,
    type: c.verb,
    persona: c.personaId,
    params: c.params,
    iat,
    exp,
    ctl: controller.controllerId,
  });
  const signature = await signEnvelope(envelope);
  const { error } = await getSupabase()
    .from("pending_commands")
    .insert({
      id: c.id,
      command_type: c.verb,
      persona_id: c.personaId,
      params: c.params,
      // Older desktops read a run's prompt from the legacy column.
      prompt: c.verb === "run_persona" && typeof c.params.prompt === "string" ? c.params.prompt : null,
      target_device_id: c.deviceId,
      requested_from: "web",
      status: "pending",
      controller_id: controller.controllerId,
      envelope,
      signature,
      requested_at: iat,
      expires_at: exp,
    });
  if (error && error.code !== UNIQUE_VIOLATION) throw new Error(error.message);
  return { expiresAt: Date.parse(exp) };
}

/** The backstop poll: the current state of the given commands. */
export async function pollLiveCommands(ids: readonly string[]): Promise<CommandRowUpdate[]> {
  if (ids.length === 0) return [];
  const { data, error } = await getSupabase()
    .from("pending_commands")
    .select("id,status,result,error_message")
    .in("id", ids as string[]);
  if (error) throw new Error(error.message);
  return (data ?? []) as CommandRowUpdate[];
}

export const EXPIRED_MESSAGE = "expired: desktop did not pick it up";

/**
 * Mark a command expired, but only if it is still pending: the filter makes
 * this lose cleanly to a desktop claim that lands at the same moment.
 * Returns true when this call did the expiring.
 */
export async function expireLiveCommand(id: string, nowIso: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("pending_commands")
    .update({ status: "expired", resolved_at: nowIso, error_message: EXPIRED_MESSAGE })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}
