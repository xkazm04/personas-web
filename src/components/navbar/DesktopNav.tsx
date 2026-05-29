"use client";

import { motion } from "framer-motion";
import { Download, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { useRoutes } from "./useRoutes";

const preloadHowImage = () => {
  if (document.querySelector('link[data-preload-how-bg]')) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = "/imgs/illustration_photo.jpg";
  link.setAttribute("data-preload-how-bg", "");
  document.head.appendChild(link);
};

interface DesktopNavProps {
  onDownloadClick: () => void;
}

/**
 * Desktop-only navigation — pill tab bar + download CTA.
 * Mobile uses MobilePanel instead.
 */
export default function DesktopNav({ onDownloadClick }: DesktopNavProps) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const pathname = usePathname();

  return (
    <>
      {/* Route tabs */}
      <div className="hidden items-center gap-1 rounded-full border border-glass bg-white/2 p-1 backdrop-blur-sm lg:flex">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              onMouseEnter={route.href === "/how" ? preloadHowImage : undefined}
              className={`relative rounded-full px-6 py-1.5 min-h-11 flex items-center text-base font-medium transition-all duration-300 focus-ring ${
                isActive
                  ? "bg-white/8 text-foreground shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                  : "text-muted hover:text-foreground hover:bg-white/3"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full border border-brand-cyan/20 bg-brand-cyan/6"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{route.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right cluster — desktop only */}
      <div className="hidden items-center gap-2 lg:flex">
        {/* Open the dashboard */}
        <Link
          href="/dashboard"
          aria-label={t.nav.dashboard}
          title={t.nav.dashboard}
          className="group flex items-center justify-center min-h-11 min-w-11 rounded-full border border-glass bg-white/2 text-muted backdrop-blur-sm transition-all duration-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/8 hover:text-brand-cyan focus-ring"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Link>

        {/* Download CTA */}
        <button
          type="button"
          onClick={onDownloadClick}
          className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-6 py-2 text-base font-medium text-brand-cyan transition-all duration-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/12 focus-ring"
        >
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Download className="relative h-3.5 w-3.5" />
          <span className="relative">{t.nav.download}</span>
        </button>
      </div>
    </>
  );
}
