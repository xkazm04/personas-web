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

/**
 * Canonical reference to a guide topic. Use this type wherever a
 * marketing surface (feature card, vision tile, scenario duel) wants to
 * link into the guide system. Centralizes the {category, topic} shape
 * so renames/locale prefixes only touch one place.
 */
export interface GuideTopicRef {
  label: string;
  category: string;
  topic: string;
}

/**
 * Build the canonical guide URL for a topic ref. Pair with openGuideLink
 * for the desktop-aware navigation:
 *
 *   <button onClick={() => openGuideLink(guideHref(ref))}>...</button>
 */
export function guideHref(ref: GuideTopicRef): string {
  return `/guide/${ref.category}/${ref.topic}`;
}
