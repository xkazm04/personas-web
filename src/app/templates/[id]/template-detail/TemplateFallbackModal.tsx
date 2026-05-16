import Link from "next/link";
import { Copy, Download, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useTranslation } from "@/i18n/useTranslation";

interface TemplateFallbackModalProps {
  open: boolean;
  onClose: () => void;
  onCopy: () => void;
}

export function TemplateFallbackModal({ open, onClose, onCopy }: TemplateFallbackModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-glass-hover bg-surface p-6 shadow-2xl"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-muted-dark transition-colors hover:text-foreground" aria-label={t.common.close}>
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-purple/20 bg-brand-purple/10">
                <Download className="h-7 w-7 text-brand-purple" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t.templatesPage.appNotFoundTitle}</h3>
              <p className="text-sm leading-relaxed text-muted-dark">{t.templatesPage.appNotFoundDescription}</p>
              <div className="mt-1 flex w-full flex-col gap-2">
                <Link href="/#download" onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-purple px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-brand-purple/80">
                  <Download className="h-4 w-4" /> {t.hero.downloadForWindows}
                </Link>
                <button
                  onClick={() => {
                    onCopy();
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-glass-hover bg-white/5 px-5 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" /> {t.templatesPage.copyConfiguration}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
