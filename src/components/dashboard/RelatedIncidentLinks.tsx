"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import type { RelatedLink } from "@/lib/incidentThreads";

/**
 * "Related: SLA · Observability · Health" — chips that deep-link, with
 * `?focus=`, to the same incident's fragment on another route. Labels reuse
 * the dashboard nav names. Renders nothing when the row has no thread, and its
 * shape depends only on the row id, never on the URL, so it hydrates cleanly.
 */
export default function RelatedIncidentLinks({ links }: { links: RelatedLink[] }) {
  const { t } = useTranslation();
  if (links.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-dark">{t.dashboard.related}</span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-1 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-2 py-0.5 font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/15 focus-ring"
        >
          {t.dashboard[link.route]}
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}
