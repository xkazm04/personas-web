/**
 * Counted body scroll lock. Multiple overlays (modals, drawers, mobile menu)
 * can each call `lockBodyScroll`; the body stays locked until every locker
 * has called `unlockBodyScroll`. The original `overflow` value is captured
 * on the first lock and restored on the final unlock so any pre-existing
 * style (or the absence of one) is preserved.
 *
 * State lives on `globalThis` so HMR / Fast Refresh re-evaluating this
 * module doesn't reset the count to zero while `body.style.overflow` is
 * still `hidden` from the prior instance — a fresh `lockBodyScroll` on
 * the new module would otherwise capture `"hidden"` as the
 * "previousOverflow" and the eventual unlock would restore it, freezing
 * the page until a hard reload.
 */

interface ScrollLockState {
  lockCount: number;
  previousOverflow: string | null;
}

const STATE_KEY = Symbol.for("personas.bodyScrollLock.state");
type GlobalRegistry = { [STATE_KEY]?: ScrollLockState };

function getState(): ScrollLockState {
  const g = globalThis as GlobalRegistry;
  if (!g[STATE_KEY]) {
    g[STATE_KEY] = { lockCount: 0, previousOverflow: null };
  }
  return g[STATE_KEY];
}

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;
  const state = getState();
  if (state.lockCount === 0) {
    state.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  state.lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (typeof document === "undefined") return;
  const state = getState();
  if (state.lockCount === 0) return;
  state.lockCount -= 1;
  if (state.lockCount === 0) {
    document.body.style.overflow = state.previousOverflow ?? "";
    state.previousOverflow = null;
  }
}
