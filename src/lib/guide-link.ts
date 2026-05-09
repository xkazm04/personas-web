// ── Platform-agnostic link handler for guide content ────────────────
// Uses button onClick instead of <a href> so the desktop app can
// intercept and open links in the system browser rather than navigating
// inside the webview.
// ────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    __PERSONAS_DESKTOP__?: boolean;
  }
}

export function isDesktopApp(): boolean {
  return typeof window !== "undefined" && !!window.__PERSONAS_DESKTOP__;
}

/**
 * Open a URL using the appropriate mechanism for the current platform.
 * - Web browser: window.open (new tab)
 * - Desktop app: dispatches a CustomEvent that the host can intercept
 */
export function openGuideLink(url: string): void {
  if (isDesktopApp()) {
    window.dispatchEvent(
      new CustomEvent("personas:open-external", { detail: { url } }),
    );
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
