"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

function isExternal(href: string | null | undefined) {
  return Boolean(href) && (href!.startsWith("http") || href!.startsWith("//"));
}

export function FooterLinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="min-w-0">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between md:pointer-events-none md:cursor-default focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none focus-visible:rounded-lg">
        <h4 className="text-base font-medium uppercase tracking-wider text-muted-dark">{title}</h4>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-dark transition-transform duration-200 md:hidden ${open ? "rotate-180" : ""}`} />
      </button>
      <div className="mt-1.5 h-px w-8 bg-linear-to-r from-brand-cyan/10 to-transparent" />
      <FooterLinks links={links} className="mt-3 hidden md:block space-y-1" />
      <div className="md:hidden">
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }} className="overflow-hidden mt-2 space-y-0.5">
              {links.map((link) => <FooterLinkItem key={link.label} link={link} />)}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FooterLinks({ links, className }: { links: { label: string; href: string }[]; className: string }) {
  return (
    <ul className={className}>
      {links.map((link) => <FooterLinkItem key={link.label} link={link} />)}
    </ul>
  );
}

function FooterLinkItem({ link }: { link: { label: string; href: string } }) {
  const cls = "group/link flex min-h-[44px] items-center gap-1.5 text-base text-muted-dark transition-colors duration-300 hover:text-foreground";
  const dot = <div className="h-1 w-1 rounded-full bg-white/8 transition-all duration-300 group-hover/link:bg-brand-cyan/40 group-hover/link:shadow-[0_0_4px_rgba(6,182,212,0.3)]" />;
  return (
    <li>
      {isExternal(link.href) ? (
        <a href={link.href} className={cls} target="_blank" rel="noopener noreferrer">{dot}{link.label}</a>
      ) : (
        <Link href={link.href} className={cls}>{dot}{link.label}</Link>
      )}
    </li>
  );
}
