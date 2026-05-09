"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronRight, FlaskConical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import GradientText from "@/components/GradientText";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useTranslation } from "@/i18n/useTranslation";
import { nonBlank } from "@/lib/format";
import { navItemDefs } from "./DashboardNavigation";

interface BreadcrumbSegment {
  /** Visible label (translated nav label, resolved entity title, or slug). */
  label: string;
  /** Link target; null on the trailing segment so it renders as plain text. */
  href: string | null;
  /** Stable key for AnimatePresence — segment index + slug. */
  key: string;
}

/**
 * Derives the breadcrumb trail from the current pathname using `navItemDefs`
 * for the top-level page label. Detail segments (e.g. a persona id under
 * /dashboard/agents/) resolve through the relevant store and fall back to
 * the URL slug when no record matches.
 */
function useBreadcrumbSegments(): BreadcrumbSegment[] {
  const pathname = usePathname();
  const { t } = useTranslation();
  const personasById = usePersonaStore((s) => s.personasById);

  return useMemo(() => {
    if (!pathname || !pathname.startsWith("/dashboard")) return [];

    const tail = pathname.replace(/^\/dashboard\/?/, "");
    if (!tail || tail === "home") {
      return [{ label: t.dashboard.overview, href: null, key: "home" }];
    }

    const parts = tail.split("/").filter(Boolean);
    const segments: BreadcrumbSegment[] = [];

    const topHref = `/dashboard/${parts[0]}`;
    const navDef = navItemDefs.find((d) => d.href === topHref);
    const topLabel = navDef ? t.dashboard[navDef.labelKey] : parts[0];
    const topIsLast = parts.length === 1;
    segments.push({
      label: topLabel,
      href: topIsLast ? null : topHref,
      key: parts[0],
    });

    for (let i = 1; i < parts.length; i++) {
      const slug = parts[i];
      const isLast = i === parts.length - 1;
      // Resolve the trailing entity slug via the relevant store; otherwise the
      // raw slug remains visible so URLs are never silent dead-ends.
      let label = slug;
      if (parts[0] === "agents") {
        label = personasById[slug]?.name ?? slug;
      }
      segments.push({
        label,
        href: isLast ? null : `/dashboard/${parts.slice(0, i + 1).join("/")}`,
        key: `${i}:${slug}`,
      });
    }

    return segments;
  }, [pathname, t, personasById]);
}

export default function DashboardNavbar() {
  const { t } = useTranslation();
  const { user, signOut, isDemo } = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      signOut: s.signOut,
      isDemo: s.isDemo,
    })),
  );
  const segments = useBreadcrumbSegments();

  const avatarUrl = nonBlank(user?.user_metadata?.avatar_url);
  const displayName =
    nonBlank(user?.user_metadata?.full_name) ?? nonBlank(user?.email) ?? "User";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/20 backdrop-blur-3xl"
    >
      <nav
        className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6"
        aria-label="Primary"
      >
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/imgs/logo.png"
              alt="Personas"
              width={28}
              height={28}
              className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Personas
            </span>
          </Link>
          <ol
            className="flex items-center gap-3 min-w-0 overflow-hidden"
            aria-label="Breadcrumb"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {segments.map((segment, i) => {
                const isLast = i === segments.length - 1;
                return (
                  <motion.li
                    key={segment.key}
                    layout
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <ChevronRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-muted-dark flex-shrink-0"
                    />
                    {segment.href && !isLast ? (
                      <Link
                        href={segment.href}
                        className="text-sm font-medium text-muted-dark transition-colors hover:text-foreground truncate"
                      >
                        {segment.label}
                      </Link>
                    ) : (
                      <GradientText
                        variant="silver"
                        className="text-sm font-medium truncate"
                      >
                        <span aria-current={isLast ? "page" : undefined}>
                          {segment.label}
                        </span>
                      </GradientText>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
          {isDemo && (
            <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-0.5 text-[10px] font-medium text-amber-400 flex-shrink-0">
              <FlaskConical className="h-3 w-3" />
              {t.common.demo}
            </span>
          )}
        </div>

        {/* Right: User + sign-out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full border border-white/[0.1]"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-brand-cyan/10 text-xs font-medium text-brand-cyan">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden text-sm text-muted sm:inline">
              {displayName}
            </span>
          </div>

          <button
            onClick={signOut}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-muted transition-all duration-200 hover:bg-white/[0.06] hover:text-foreground sm:px-3"
          >
            <LogOut className="h-4 w-4 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">{t.common.signOut}</span>
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
