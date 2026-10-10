"use client";

import dynamic from "next/dynamic";
import { RELEASE, reachableLocales } from "@/i18n/localeRelease";

// Client-only: the offer depends on navigator.languages and the persisted
// locale, so no locale (or motion) value may decide server markup. With no
// locale released (production today) nothing renders and the chunk never loads.
const LocaleOffer = dynamic(() => import("./LocaleOffer"), { ssr: false });

const ANY_REACHABLE = reachableLocales(RELEASE).length > 1;

export default function LocaleOfferMount() {
  return ANY_REACHABLE ? <LocaleOffer /> : null;
}
