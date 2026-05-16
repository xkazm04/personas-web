import Link from "next/link";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";

interface TemplateDownloadCtaProps {
  copied: boolean;
  copyFailed: boolean;
  onCopy: () => void;
  onOpenInPersonas: () => void;
}

export function TemplateDownloadCta({ copied, copyFailed, onCopy, onOpenInPersonas }: TemplateDownloadCtaProps) {
  const { t } = useTranslation();

  return (
    <motion.section variants={fadeUp} className="mb-16">
      <div className="relative overflow-hidden rounded-2xl border border-glass-hover bg-white/[0.03] p-8 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-purple/10 via-transparent to-brand-cyan/10" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl font-semibold text-foreground">{t.templatesPage.getStartedTitle}</h2>
          <p className="max-w-md text-base text-muted-dark">{t.templatesPage.getStartedDescription}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button onClick={onOpenInPersonas} className="inline-flex items-center gap-2 rounded-xl bg-brand-purple px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-brand-purple/80">
              <ExternalLink className="h-4 w-4" /> {t.templatesPage.openInPersonas}
            </button>
            <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-xl border border-glass-hover bg-white/5 px-5 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-white/10">
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? t.waitlist.copied : copyFailed ? t.templatesPage.copyFailed : t.templatesPage.copyConfiguration}
            </button>
            <Link href="/#download" className="inline-flex items-center gap-2 rounded-xl border border-glass-hover bg-white/5 px-5 py-2.5 text-base font-medium text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground">
              <Download className="h-4 w-4" /> {t.hero.downloadForWindows}
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
