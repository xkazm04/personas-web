"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import GuideSearchLauncher from "@/components/guide/GuideSearchLauncher";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Top row of a category page: the back link plus the full-guide search
 * trigger. Client-side because both strings are translated (`t.guide.*`) and
 * the launcher owns dialog state — the surrounding page stays a server
 * component that only renders this strip.
 */
export default function CategoryHeaderBar() {
  const { t } = useTranslation();

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <Link
        href="/guide"
        className="inline-flex items-center gap-1.5 text-base text-muted-dark transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t.guide.backToGuide}
      </Link>
      <GuideSearchLauncher />
    </div>
  );
}
