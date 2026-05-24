import { Check, Copy } from "lucide-react";
import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import YamlHighlighter from "../YamlHighlighter";

interface TemplateConfigurationProps {
  code: string;
  copied: boolean;
  copyFailed: boolean;
  onCopy: () => void;
}

export function TemplateConfiguration({ code, copied, copyFailed, onCopy }: TemplateConfigurationProps) {
  const { t } = useTranslation();

  return (
    <motion.section variants={fadeUp} className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{t.templatesPage.configuration}</h2>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-glass-hover bg-white/5 px-3 py-1.5 text-sm text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t.templatesPage.copied : copyFailed ? t.templatesPage.copyFailed : t.templatesPage.copy}
        </button>
      </div>
      <YamlHighlighter code={code} />
    </motion.section>
  );
}
