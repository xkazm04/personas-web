import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { Search, Home, BookOpen, Download, ArrowRight, Puzzle, BarChart3, Shield } from "lucide-react";

const POPULAR_PAGES = [
  { label: "Home", href: "/", icon: Home, color: "#06b6d4" },
  { label: "Features", href: "/features", icon: BarChart3, color: "#a855f7" },
  { label: "Get Started", href: "/#get-started", icon: ArrowRight, color: "#34d399" },
  { label: "Guide", href: "/guide", icon: BookOpen, color: "#fbbf24" },
  { label: "Templates", href: "/templates", icon: Puzzle, color: "#06b6d4" },
  { label: "Download", href: "/download", icon: Download, color: "#34d399" },
  { label: "Compare", href: "/compare", icon: Search, color: "#a855f7" },
  { label: "Security", href: "/security", icon: Shield, color: "#f43f5e" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* 404 badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-base font-mono font-medium text-brand-cyan/70">
            404
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Page not found
          </h1>

          <p className="mt-4 text-base text-muted leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Try one of these instead:
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
                    style={{ backgroundColor: `${page.color}12` }}
                  >
                    <Icon
                      className="h-4 w-4 transition-transform group-hover:scale-110"
                      style={{ color: page.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted group-hover:text-foreground transition-colors">
                    {page.label}
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
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
