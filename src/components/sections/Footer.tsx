"use client";

import { useState } from "react";
import { Sparkles, Github, Twitter, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Pricing", href: "#pricing" },
      { label: "Download", href: "#download" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Changelog", href: "#changelog" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

function FooterLinkColumn({ title, links }: (typeof columns)[number]) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-w-0">
      {/* Desktop: static heading; Mobile: accordion trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between md:pointer-events-none md:cursor-default"
      >
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-dark/70">
          {title}
        </h4>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-dark/50 transition-transform duration-200 md:hidden ${open ? "rotate-180" : ""}`}
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
  return (
    <footer className="relative border-t border-white/3 px-6 pb-8 pt-16">
      {/* Top gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-cyan/15 to-transparent" />

      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 bottom-0 h-75 w-75 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)" }}
        />
        <div
          className="absolute right-1/4 bottom-0 h-50 w-50 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 60%)" }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cyan/10 ring-1 ring-brand-cyan/6 shadow-[0_0_10px_rgba(6,182,212,0.06)]">
                <Sparkles className="h-4 w-4 text-brand-cyan" />
              </div>
              <span className="font-semibold tracking-tight">Personas</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-dark">
              Build intelligent AI agents that work for you. Design in natural
              language, run locally or in the cloud.
            </p>
            {/* Social */}
            <div className="mt-5 flex items-center gap-3">
              <a href="#" className="group flex h-8 w-8 items-center justify-center rounded-lg border border-white/4 bg-white/2 text-muted-dark transition-all duration-300 hover:border-white/10 hover:text-muted hover:bg-white/4 hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                <Github className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
              <a href="#" className="group flex h-8 w-8 items-center justify-center rounded-lg border border-white/4 bg-white/2 text-muted-dark transition-all duration-300 hover:border-white/10 hover:text-muted hover:bg-white/4 hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                <Twitter className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Link columns — 2-col grid on mobile, 3 individual cols on desktop */}
          <div className="col-span-1 grid grid-cols-2 gap-6 md:col-span-3 md:grid-cols-3 md:gap-10">
            {columns.map((col) => (
              <FooterLinkColumn key={col.title} {...col} />
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/3 pt-6 text-xs text-muted-dark md:flex-row">
          <span>&copy; {new Date().getFullYear()} Personas. All rights reserved.</span>
          <span className="text-muted-dark/50 flex items-center gap-2">
            <div className="h-px w-4 bg-linear-to-r from-brand-cyan/20 to-transparent" />
            Built for developers who automate everything.
            <div className="h-px w-4 bg-linear-to-l from-brand-cyan/20 to-transparent" />
          </span>
        </div>
      </div>
    </footer>
  );
}
