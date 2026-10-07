/**
 * The actions the desktop data plane (NEXT_PUBLIC_DATA_SOURCE=desktop) cannot
 * serve. The reachability gate says `online` from the health probe alone, so
 * without this table these controls were enabled and failed on click with a
 * 501. `desktopUnsupported.test.ts` pins every entry to the code that makes it
 * true, so the table and `desktopApi` / `desktopShapes` cannot drift.
 *
 * Pure, like `reachability.ts`.
 */
import type { ReachabilityTier } from "./reachability";

/**
 * - `pause`, `resume`: `desktopApi` does not override them; `realApi` throws a 501.
 * - `chatSend`: same, for `sendChatMessage`.
 * - `reviewVerdict`: `decideReview` sends `PUT /api/events/:id`, a `not_on_desktop` shape.
 */
export const DESKTOP_UNSUPPORTED_ACTIONS = ["pause", "resume", "chatSend", "reviewVerdict"] as const;

export type DesktopUnsupportedAction = (typeof DESKTOP_UNSUPPORTED_ACTIONS)[number];

/**
 * Is this action explicitly unsupported right now? On the desktop plane,
 * `pause`, `resume` and `chatSend` qualify only while online (offline is already
 * blocked by its own gate). `reviewVerdict` qualifies in every tier, null
 * included: `PUT /api/events/:id` is `not_on_desktop` whatever the health. Every
 * other plane serves the action (or gates it) as before.
 */
export function desktopUnsupported(
  action: DesktopUnsupportedAction,
  tier: ReachabilityTier | null,
  desktopPlane: boolean,
): boolean {
  if (!desktopPlane) return false;
  if (action === "reviewVerdict") return true;
  return tier === "online" && DESKTOP_UNSUPPORTED_ACTIONS.includes(action);
}
