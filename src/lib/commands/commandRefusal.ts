/**
 * Refusals the desktop writes into a command's `error_message`, read as words.
 * Pure. The token is what precedes the first ':' once trimmed, the same shape
 * `reasonText` in `CommandChip` reads.
 */

/**
 * Did the desktop refuse because this decision belongs at the desk? It does so
 * for a phone's `review_decide` on an App Master probation packet or ask
 * (`desk_only`, with or without a detail after a colon).
 */
export function isDeskOnly(error: string | null): boolean {
  if (!error) return false;
  return error.split(":")[0].trim() === "desk_only";
}
