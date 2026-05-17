import type { Translations } from "@/i18n/en";

export function getFooterColumns(t: Translations) {
  const isDev = process.env.NODE_ENV === "development";
  return [
    {
      title: t.footer.product,
      links: [
        { label: t.sections.features, href: "/features" },
        { label: t.nav.templates, href: "/templates" },
      ],
    },
    ...(isDev
      ? [
          {
            title: t.footer.resources,
            links: [
              { label: t.nav.guide, href: "/guide" },
              { label: t.nav.how, href: "/how" },
              { label: t.nav.blog, href: "/blog" },
              { label: t.nav.connections, href: "/connections" },
              { label: t.nav.compare, href: "/compare" },
              { label: t.nav.community, href: "/community" },
              { label: t.nav.roadmap, href: "/roadmap" },
            ],
          },
        ]
      : []),
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
