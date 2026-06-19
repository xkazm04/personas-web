"use client";

import { Cookie } from "lucide-react";
import { reopenCookieConsent } from "@/components/CookieConsent";

/**
 * User-facing control to withdraw cookie consent and re-open the consent banner,
 * satisfying the GDPR/ePrivacy requirement that consent be as easy to withdraw as
 * to give. Rendered in the Cookie Policy "Managing Cookies" section.
 */
export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={reopenCookieConsent}
      className="inline-flex items-center gap-2 rounded-lg border border-glass bg-white/[0.03] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-glass-hover hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50"
    >
      <Cookie size={15} className="text-brand-cyan" />
      Manage cookie preferences
    </button>
  );
}
