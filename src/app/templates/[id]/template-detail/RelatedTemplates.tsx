import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import type { AgentTemplate } from "@/lib/templates";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { complexityColors } from "./templateDetailMeta";

interface RelatedTemplatesProps {
  category: AgentTemplate["category"];
  templates: AgentTemplate[];
}

export function RelatedTemplates({ category, templates }: RelatedTemplatesProps) {
  const { t } = useTranslation();

  if (templates.length === 0) return null;

  return (
    <motion.section variants={fadeUp}>
      <h2 className="mb-6 text-xl font-semibold text-foreground">
        {t.templatesPage.moreTemplates.replace("{category}", category)}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {templates.map((template) => (
          <RelatedTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </motion.section>
  );
}

function RelatedTemplateCard({ template }: { template: AgentTemplate }) {
  const RelatedIcon = template.toolIcon;
  const iconColor = template.toolColor === "#e6e6e6" ? "#999" : template.toolColor;

  return (
    <Link href={`/templates/${template.id}`} className="group flex flex-col rounded-xl border border-glass bg-white/[0.02] p-5 backdrop-blur-sm transition-colors hover:border-glass-hover hover:bg-white/[0.04]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${template.toolColor}15` }}>
          <RelatedIcon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-brand-purple">{template.title}</h3>
      </div>
      <p className="mb-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-dark">{template.description}</p>
      <div className="flex items-center justify-between">
        <span className={`rounded-full border px-2 py-0.5 text-sm font-medium ${complexityColors[template.complexity]}`}>{template.complexity}</span>
        <ChevronRight className="h-4 w-4 text-muted-dark transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
