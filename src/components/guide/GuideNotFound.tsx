"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

interface GuideNotFoundProps {
  title: string;
  description: string;
}

/**
 * 404 body shared by the guide category and topic routes.
 *
 * Next renders `not-found.tsx` *inside* the nearest layout, so the guide
 * shell (`src/app/guide/layout.tsx`) already supplies the Navbar and the
 * sidebar — this component must render the page body only. Mounting its own
 * Navbar/Footer here would stack a second header on top of the guide one.
 */
export default function GuideNotFound({ title, description }: GuideNotFoundProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        {/* 404 badge — a numeral, language-neutral */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-base font-mono font-medium text-brand-cyan/70">
          404
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base text-muted leading-relaxed">{description}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-6 py-2.5 text-base font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/20"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {t.guide.guideHub}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-glass-hover bg-white/[0.03] px-6 py-2.5 text-base font-medium text-muted transition-colors hover:text-foreground hover:bg-white/[0.05]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t.notFound.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
