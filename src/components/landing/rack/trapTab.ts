import type { KeyboardEvent } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input,select,textarea';

/**
 * Keeps Tab inside a modal `<dialog>`: the browser lets focus escape to its own
 * chrome, which is not a trap. Wraps last to first and back. Ignores keys that
 * bubble up from a nested dialog (that one wraps for itself).
 */
export function trapTab(e: KeyboardEvent<HTMLDialogElement>) {
  if (e.key !== "Tab") return;
  const dialog = e.currentTarget;
  if ((e.target as HTMLElement).closest("dialog") !== dialog) return;
  const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.closest("dialog") === dialog && el.getClientRects().length > 0,
  );
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const at = document.activeElement;
  if (e.shiftKey && (at === first || at === dialog || !dialog.contains(at))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (at === last || !dialog.contains(at))) {
    e.preventDefault();
    first.focus();
  }
}
