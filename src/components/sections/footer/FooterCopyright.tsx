"use client";

import { useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export function FooterCopyright({ copyright, slogan }: { copyright: string; slogan: string }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-glass pt-6 text-base text-muted-dark md:flex-row">
      <span>&copy; <ClientYear /> {copyright}</span>
      <ThemeSwitcher />
      <span className="text-muted-dark flex items-center gap-2">
        <div className="h-px w-4 bg-linear-to-r from-brand-cyan/20 to-transparent" />
        {slogan}
        <div className="h-px w-4 bg-linear-to-l from-brand-cyan/20 to-transparent" />
      </span>
    </div>
  );
}

function ClientYear() {
  const [year] = useState(() => new Date().getFullYear());
  return <span suppressHydrationWarning>{year}</span>;
}
