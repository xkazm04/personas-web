/*
 * The server-readable locale signal for /guide/**.
 *
 * The reader's language otherwise lives only in client localStorage (the
 * zustand store), so the server cannot see it and renders English. The store
 * mirrors it into this one cookie; the topic page reads it and resolves the
 * whole translated unit in SSR. Read it ONLY through guideLocaleFromCookie:
 * it applies the same release predicate as every other language door, so an
 * unreleased locale (production ships none) reads as English whatever the
 * cookie says.
 *
 * Pure TS - no React, no store import - so vitest runs it in node.
 */
import { RELEASE, normalizePersisted, type Language, type ReleaseConfig } from "./localeRelease";

/** Named apart from the localStorage key so the cookie policy lists each name once. */
export const GUIDE_LOCALE_COOKIE = "personas-guide-language";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** The locale a cookie value names, or "en" when it is absent, unknown or not reachable. */
export function guideLocaleFromCookie(value: string | undefined, cfg: ReleaseConfig = RELEASE): Language {
  return normalizePersisted(value, cfg);
}

/** The `document.cookie` assignment that mirrors `lang`; English clears the cookie. */
export function guideLocaleCookieString(lang: Language): string {
  const base = `${GUIDE_LOCALE_COOKIE}=${lang}; path=/guide; samesite=lax`;
  return lang === "en" ? `${GUIDE_LOCALE_COOKIE}=; path=/guide; max-age=0; samesite=lax` : `${base}; max-age=${ONE_YEAR_SECONDS}`;
}
