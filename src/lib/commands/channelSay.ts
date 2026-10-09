/**
 * `channel_say` (weekend item E): a direction from the phone to an App Master
 * persona, sent as a signed command. The desk writes it as the operator's
 * message in the master's channel and starts no run; the headless App Master
 * reads it at its next wake (personas 7653b0be85, `channel_say.rs`). Pure: the
 * params, the size rule, and how a settled command reads as a delivery.
 *
 * The phone masks credential-looking tokens with the desk's own rules
 * (`redactText`) before it signs, so a pasted key never reaches the cloud row.
 * Both the typed text and the masked text are bounded by `SAY_MAX_CHARS`
 * (masking can make a short value longer). The desk masks again on arrival.
 */
import type { InflightCommand } from "./commandReducer";
import { redactText } from "./redactText";

/** The contract's cap on a say, in Unicode code points, counted after the trim. */
export const SAY_MAX_CHARS = 2000;

export interface ChannelSayParams {
  message: string;
}

/** Characters as the desk counts them (Rust `chars().count()`): code points, not UTF-16 units. */
export function sayLength(message: string): number {
  return Array.from(message.trim()).length;
}

/**
 * `{"message"}`: the one key, trimmed, then masked with the desk's rules before
 * signing so a pasted key never reaches the cloud row. Refused rather than cut:
 * an empty message throws `empty_message`; a typed text over the cap, or a
 * masked text over it, throws `message_too_long`. The desk masks again on
 * arrival.
 */
export function channelSayParams(message: string): ChannelSayParams {
  const text = message.trim();
  if (text.length === 0) throw new Error("empty_message");
  if (Array.from(text).length > SAY_MAX_CHARS) throw new Error("message_too_long");
  const masked = redactText(text);
  if (Array.from(masked).length > SAY_MAX_CHARS) throw new Error("message_too_long");
  return { message: masked };
}

/**
 * A settled command as a delivery. Only `completed` counts; `changed: false`
 * (a re-delivery that wrote nothing) is delivered too. Anything else is a
 * failure carrying the desk's token (or the plane's own).
 */
export function channelSayOutcome(
  cmd: InflightCommand | null,
): { ok: true; messageId: string | null; changed: boolean } | { ok: false; reason: string } {
  if (!cmd) return { ok: false, reason: "unknown" };
  if (cmd.status !== "completed") return { ok: false, reason: cmd.error ?? cmd.status };
  const messageId = typeof cmd.result?.messageId === "string" ? cmd.result.messageId : null;
  return { ok: true, messageId, changed: cmd.result?.changed !== false };
}

/** `api.sayToMaster`'s input. */
export interface ChannelSayInput {
  /** The App Master persona: the command's `persona_id` and the envelope's `persona`. */
  personaId: string;
  message: string;
  /** The persona's own device, when the caller knows it. */
  deviceId?: string | null;
}
