"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/icons/brand-icons";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useTranslation } from "@/i18n/useTranslation";

function useColumns() {
  const { t } = useTranslation();
  return [
    {
      title: t.footer.product,
      links: [
        { label: t.sections.features, href: "/#features" },
        { label: t.nav.useCases, href: "/use-cases" },
        { label: t.sections.pricing, href: "/#pricing" },
        { label: t.sections.download, href: "/#download" },
        { label: t.nav.tour, href: "/tour" },
      ],
    },
    {
      title: t.footer.resources,
      links: [
        { label: t.nav.blog, href: "/blog" },
        { label: t.nav.changelog, href: "/changelog" },
        { label: t.nav.roadmap, href: "/roadmap" },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { label: t.nav.security, href: "/security" },
        { label: t.footer.privacy, href: "/legal" },
        { label: t.footer.terms, href: "/legal" },
      ],
    },
  ];
}

function FooterLinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-w-0">
      {/* Desktop: static heading; Mobile: accordion trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between md:pointer-events-none md:cursor-default focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none focus-visible:rounded-lg"
      >
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          {title}
        </h4>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-dark transition-transform duration-200 md:hidden ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className="mt-1.5 h-px w-8 bg-linear-to-r from-brand-cyan/10 to-transparent" />

      {/* Desktop: always visible */}
      <ul className="mt-3 hidden md:block space-y-1">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="group/link flex min-h-[44px] items-center gap-1.5 text-sm text-muted-dark transition-colors duration-300 hover:text-foreground"
            >
              <div className="h-1 w-1 rounded-full bg-white/8 transition-all duration-300 group-hover/link:bg-brand-cyan/40 group-hover/link:shadow-[0_0_4px_rgba(6,182,212,0.3)]" />
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile: accordion with AnimatePresence */}
      <div className="md:hidden">
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden mt-2 space-y-0.5"
            >
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group/link flex min-h-[44px] items-center gap-1.5 text-sm text-muted-dark transition-colors duration-300 hover:text-foreground"
                  >
                    <div className="h-1 w-1 rounded-full bg-white/8 transition-all duration-300 group-hover/link:bg-brand-cyan/40 group-hover/link:shadow-[0_0_4px_rgba(6,182,212,0.3)]" />
                    {link.label}
                  </a>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const columns = useColumns();
  return (
    <footer className="relative border-t border-white/3 px-6 pb-8 pt-16">
      {/* Top gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-cyan/15 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image
                src="/imgs/logo.png"
                alt="Personas logo"
                width={24}
                height={24}
                className="h-6 w-auto object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
              />
              <span className="font-semibold tracking-tight">Personas</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-dark">
              {t.footer.motto}
            </p>
            {/* Social */}
            <div className="mt-4 flex items-center gap-3">
              <a href="https://github.com/personas-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="group flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/4 bg-white/2 text-muted-dark transition-all duration-300 hover:border-white/10 hover:text-muted hover:bg-white/4 hover:shadow-[0_0_10px_rgba(255,255,255,0.02)] focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none">
                <GithubIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
              <a href="https://twitter.com/personas_ai" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="group flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/4 bg-white/2 text-muted-dark transition-all duration-300 hover:border-white/10 hover:text-muted hover:bg-white/4 hover:shadow-[0_0_10px_rgba(255,255,255,0.02)] focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none">
                <TwitterIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
              <a href="https://discord.gg/personas" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="group flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/4 bg-white/2 text-muted-dark transition-all duration-300 hover:border-white/10 hover:text-muted hover:bg-white/4 hover:shadow-[0_0_10px_rgba(255,255,255,0.02)] focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none">
                <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Link columns — 2-col grid on mobile, 3 individual cols on desktop */}
          <div className="col-span-1 grid grid-cols-2 gap-6 md:col-span-3 md:grid-cols-3 md:gap-12">
            {columns.map((col) => (
              <FooterLinkColumn key={col.title} {...col} />
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/3 pt-6 text-sm text-muted-dark md:flex-row">
          <span>&copy; {new Date().getFullYear()} {t.footer.copyright}</span>
          <ThemeSwitcher />
          <span className="text-muted-dark flex items-center gap-2">
            <div className="h-px w-4 bg-linear-to-r from-brand-cyan/20 to-transparent" />
            {t.footer.slogan}
            <div className="h-px w-4 bg-linear-to-l from-brand-cyan/20 to-transparent" />
          </span>
        </div>
      </div>
    </footer>
  );
}
