import { Sparkles, Github, Twitter } from "lucide-react";

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
      { label: "Changelog", href: "#" },
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

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.03] px-6 pb-8 pt-16">
      {/* Top gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/15 to-transparent" />

      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 bottom-0 h-[300px] w-[300px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)" }}
        />
        <div
          className="absolute right-1/4 bottom-0 h-[200px] w-[200px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 60%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cyan/10 ring-1 ring-brand-cyan/[0.06] shadow-[0_0_10px_rgba(6,182,212,0.06)]">
                <Sparkles className="h-4 w-4 text-brand-cyan" />
              </div>
              <span className="font-semibold tracking-tight">Personas</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-dark">
              Build intelligent AI agents that work for you. Design in natural
              language, run locally or in the cloud.
            </p>
            {/* Social */}
            <div className="mt-5 flex items-center gap-3">
              <a href="#" className="group flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] text-muted-dark transition-all duration-300 hover:border-white/[0.10] hover:text-muted hover:bg-white/[0.04] hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                <Github className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
              <a href="#" className="group flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] text-muted-dark transition-all duration-300 hover:border-white/[0.10] hover:text-muted hover:bg-white/[0.04] hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                <Twitter className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-dark/70">
                {col.title}
              </h4>
              <div className="mt-1.5 h-px w-8 bg-gradient-to-r from-brand-cyan/10 to-transparent" />
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group/link flex items-center gap-1.5 text-sm text-muted-dark transition-colors duration-300 hover:text-foreground"
                    >
                      <div className="h-1 w-1 rounded-full bg-white/[0.08] transition-all duration-300 group-hover/link:bg-brand-cyan/40 group-hover/link:shadow-[0_0_4px_rgba(6,182,212,0.3)]" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.03] pt-6 text-xs text-muted-dark md:flex-row">
          <span>&copy; {new Date().getFullYear()} Personas. All rights reserved.</span>
          <span className="text-muted-dark/50 flex items-center gap-2">
            <div className="h-px w-4 bg-gradient-to-r from-brand-cyan/20 to-transparent" />
            Built for developers who automate everything.
            <div className="h-px w-4 bg-gradient-to-l from-brand-cyan/20 to-transparent" />
          </span>
        </div>
      </div>
    </footer>
  );
}
