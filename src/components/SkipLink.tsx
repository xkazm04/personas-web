"use client";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * The root layout is a server component, so it cannot read the client-side
 * locale store. This leaf keeps the skip link as the first focusable element
 * in the document while still resolving its label through i18n.
 */
export default function SkipLink() {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-brand-cyan/90 focus:px-4 focus:py-2 focus:text-base focus:font-semibold focus:text-black focus:shadow-lg focus:outline-none"
    >
      {t.common.skipToMain}
    </a>
  );
}
