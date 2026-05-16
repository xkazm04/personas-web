"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { FooterBrand } from "./footer/FooterBrand";
import { FooterCopyright } from "./footer/FooterCopyright";
import { FooterLinkColumn } from "./footer/FooterLinkColumn";
import { getFooterColumns } from "./footer/footerColumns";

export default function Footer() {
  const { t } = useTranslation();
  const columns = getFooterColumns(t);

  return (
    <footer className="relative border-t border-glass px-6 pb-8 pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-cyan/15 to-transparent" />
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-12">
          <FooterBrand motto={t.footer.motto} />
          <div className={`col-span-1 grid grid-cols-2 gap-6 md:col-span-3 md:gap-12 ${columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {columns.map((column) => (
              <FooterLinkColumn key={column.title} {...column} />
            ))}
          </div>
        </div>
        <FooterCopyright copyright={t.footer.copyright} slogan={t.footer.slogan} />
      </div>
    </footer>
  );
}
