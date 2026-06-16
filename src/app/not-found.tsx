"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { useTranslation } from "@/i18n/useTranslation";
import type { Translations } from "@/i18n/en";
import { Home, BookOpen, Download, ArrowRight, Puzzle, BarChart3, Shield } from "lucide-react";

type PopularPage = {
  href: string;
  icon: typeof Home;
  color: string;
  /** Resolve the label off the translation bundle so it stays localized. */
  label: (t: Translations) => string;
};

const POPULAR_PAGES: PopularPage[] = [
  { href: "/", icon: Home, color: "#06b6d4", label: (t) => t.notFound.home },
  { href: "/features", icon: BarChart3, color: "#a855f7", label: (t) => t.nav.features },
  { href: "/#get-started", icon: ArrowRight, color: "#34d399", label: (t) => t.notFound.getStarted },
  { href: "/guide", icon: BookOpen, color: "#fbbf24", label: (t) => t.nav.guide },
  { href: "/templates", icon: Puzzle, color: "#06b6d4", label: (t) => t.nav.templates },
  { href: "/#download", icon: Download, color: "#34d399", label: (t) => t.nav.download },
  { href: "/security", icon: Shield, color: "#f43f5e", label: (t) => t.nav.security },
];

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* 404 badge — a numeral, language-neutral */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-base font-mono font-medium text-brand-cyan/70">
            404
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t.notFound.title}
          </h1>

          <p className="mt-4 text-base text-muted leading-relaxed">
            {t.notFound.description}
          </p>

          {/* Popular pages grid */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {POPULAR_PAGES.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-glass bg-white/[0.02] p-4 transition-colors hover:border-glass-strong hover:bg-white/[0.04]"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${page.color} 7%, transparent)`,
                    }}
                  >
                    <Icon
                      className="h-4 w-4 transition-transform group-hover:scale-110"
                      style={{ color: page.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted group-hover:text-foreground transition-colors">
                    {page.label(t)}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Back home link */}
          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-6 py-2.5 text-base font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/20"
            >
              <Home className="h-4 w-4" />
              {t.notFound.backToHome}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
