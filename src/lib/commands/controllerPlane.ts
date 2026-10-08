/**
 * Pairing and unpairing this browser as a controller (PHASE2-SPEC.md 3.2,
 * 3.4). The key itself stays in `signer`; this module moves only the
 * controller id, the public key and the HMAC proof. Loaded lazily by
 * `controllerStore`, on the supabase plane only.
 */
import { getSupabase } from "@/lib/supabase";
import { controllerName, pairingProof, type PairFragment } from "./pairing";
import { createController, deleteController, loadController, signingSupported, type ControllerIdentity } from "./signer";

export type ControllerRowStatus = "pending" | "active" | "refused" | "revoked";

export interface ControllerRow {
  controller_id: string;
  status: ControllerRowStatus;
  revoke_requested_at: string | null;
}

export { loadController, signingSupported, type ControllerIdentity };

/** The cloud row for a controller id, or null when it is gone. */
export async function fetchControllerRow(controllerId: string): Promise<ControllerRow | null> {
  const { data, error } = await getSupabase()
    .from("command_controllers")
    .select("controller_id,status,revoke_requested_at")
    .eq("controller_id", controllerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ControllerRow | null) ?? null;
}

/** Ask the desktop to revoke a controller (it honours this at its next poll). */
async function requestRevoke(controllerId: string, nowIso: string): Promise<void> {
  const { error } = await getSupabase()
    .from("command_controllers")
    .update({ revoke_requested_at: nowIso })
    .eq("controller_id", controllerId);
  if (error) throw new Error(error.message);
}

/**
 * Generate a key, prove the QR was seen, and insert the `pending` controller
 * row for the desktop to verify and activate. A previous pairing on this
 * browser is replaced, and its row is asked to be revoked.
 */
export async function pairController(fragment: PairFragment, deviceId: string, userAgent: string, nowIso: string): Promise<ControllerIdentity> {
  const previous = await loadController();
  const controllerId = crypto.randomUUID();
  const identity = await createController(controllerId, deviceId, nowIso);
  const proof = await pairingProof(fragment.secret, fragment.pairingId, controllerId, identity.publicKey);
  const { error } = await getSupabase().from("command_controllers").insert({
    controller_id: controllerId,
    device_id: deviceId,
    pairing_id: fragment.pairingId,
    name: controllerName(userAgent),
    public_key: identity.publicKey,
    proof,
  });
  if (error) {
    // Nothing usable was paired: drop the new key rather than keep an orphan.
    await deleteController().catch(() => {});
    throw new Error(error.message);
  }
  if (previous) await requestRevoke(previous.controllerId, nowIso).catch(() => {});
  return identity;
}

/** "Unpair this phone": forget the key here, and ask the desktop to revoke it. */
export async function unpairController(nowIso: string): Promise<void> {
  const current = await loadController();
  await deleteController();
  if (current) await requestRevoke(current.controllerId, nowIso);
}
