"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Download } from "lucide-react";
import Image from "next/image";

const links = [
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.04] bg-background/70 backdrop-blur-2xl shadow-[0_1px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="group flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/imgs/logo.png"
              alt="Personas logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">Personas</span>
        </a>

        {/* Nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative rounded-lg px-4 py-2 text-sm text-muted transition-all duration-300 hover:text-foreground hover:bg-white/[0.03]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#download"
          className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-5 py-2 text-sm font-medium text-brand-cyan transition-all duration-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/12"
        >
          {/* Shimmer */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Download className="relative h-3.5 w-3.5" />
          <span className="relative hidden sm:inline">Download</span>
        </a>
      </nav>
    </motion.header>
  );
}
