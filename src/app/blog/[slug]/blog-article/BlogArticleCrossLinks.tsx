import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CROSS_LINKS = [
  { href: "/#get-started", key: "seeItInAction" },
  { href: "/templates", key: "browseTemplates" },
] as const;

type CrossLinkLabels = Record<(typeof CROSS_LINKS)[number]["key"], string>;

export function BlogArticleCrossLinks({
  heading,
  labels,
  links,
}: {
  heading: string;
  labels: CrossLinkLabels;
  /** Per-post contextual links; falls back to the generic defaults when absent. */
  links?: { href: string; label: string }[];
}) {
  const items =
    links && links.length > 0
      ? links
      : CROSS_LINKS.map((l) => ({ href: l.href, label: labels[l.key] }));

  return (
    <div className="mt-12 pt-8 border-t border-glass">
      <h3 className="text-base font-semibold text-foreground uppercase tracking-wider mb-4">
        {heading}
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-2 rounded-lg border border-glass bg-white/[0.02] px-4 py-3 text-base text-muted hover:border-glass-hover hover:text-foreground transition-colors"
          >
            {link.label}
            <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
