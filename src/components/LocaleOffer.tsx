"use client";

import { useEffect, useState } from "react";
import { Languages, X } from "lucide-react";
import { useI18nStore, LANGUAGES, type Language } from "@/stores/i18nStore";
import { RELEASE, negotiateLocale, readLangParam, shouldOffer } from "@/i18n/localeRelease";
import { catalog } from "@/i18n/catalog";
import type { Translations } from "@/i18n/en";

type OfferCopy = Translations["localeOffer"];

function browserPreferences(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

/**
 * Browser-language offer. A visitor whose browser asks for a RELEASED locale
 * (src/i18n/localeRelease.ts) gets one dismissible card, written in that
 * language, offering to switch; dismissing it records the locale in the
 * persisted `declined` list (inside the `personas-language` store) so it is
 * never offered again. Also applies a `?lang=` deep link once on load.
 *
 * Mounted client-only through LocaleOfferMount (next/dynamic, ssr:false), so
 * nothing here decides server markup. Static: no motion to gate.
 */
export default function LocaleOffer() {
  const language = useI18nStore((s) => s.language);
  const declined = useI18nStore((s) => s.declined);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const declineOffer = useI18nStore((s) => s.declineOffer);
  const [negotiated] = useState<Language | null>(() => negotiateLocale(browserPreferences(), RELEASE));
  const [offer, setOffer] = useState<{ lang: Language; copy: OfferCopy } | null>(null);

  // ?lang= deep link: applied once, through the store's one validation door.
  useEffect(() => {
    const linked = readLangParam(window.location.search, RELEASE);
    if (linked) useI18nStore.getState().setLanguage(linked);
  }, []);

  const wanted = shouldOffer({ negotiated, current: language, declined }) ? negotiated : null;

  // The offer's copy comes from the TARGET locale, so loading it is the same
  // chunk accepting needs: accepting is then instant.
  useEffect(() => {
    if (!wanted) return;
    let live = true;
    catalog.loadLocale(wanted).then(
      (t) => {
        if (live) setOffer({ lang: wanted, copy: t.localeOffer });
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, [wanted]);

  if (!wanted || !offer || offer.lang !== wanted) return null;

  const { lang, copy } = offer;
  const rtl = LANGUAGES.some((l) => l.id === lang && l.rtl);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-4">
      <section
        lang={lang}
        dir={rtl ? "rtl" : "ltr"}
        aria-labelledby="locale-offer-prompt"
        className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-glass-hover bg-card-bg/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
      >
        <Languages size={18} aria-hidden className="shrink-0 text-brand-cyan" />
        <p id="locale-offer-prompt" className="min-w-0 flex-1 text-sm leading-snug text-foreground">
          {copy.prompt}
        </p>
        <button
          type="button"
          onClick={() => setLanguage(lang)}
          className="shrink-0 rounded-lg bg-brand-cyan px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-brand-cyan/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50"
        >
          {copy.accept}
        </button>
        <button
          type="button"
          onClick={() => declineOffer(lang)}
          aria-label={copy.dismiss}
          title={copy.dismiss}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-dark transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50"
        >
          <X size={16} aria-hidden />
        </button>
      </section>
    </div>
  );
}
