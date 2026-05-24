import { Check, Link2, Zap } from "lucide-react";
import { motion } from "framer-motion";

import type { AgentTemplate } from "@/lib/templates";
import { categoryColors, difficultyColors } from "@/lib/templates";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import { complexityColors, triggerDescriptions, triggerIcons } from "./templateDetailMeta";

interface TemplateHeroProps {
  template: AgentTemplate;
}

export function TemplateHero({ template }: TemplateHeroProps) {
  const { t } = useTranslation();
  const ToolIcon = template.toolIcon;
  const iconColor = template.toolColor === "#e6e6e6" ? "#999" : template.toolColor;

  return (
    <motion.section variants={fadeUp} className="mb-12">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${template.toolColor}15` }}>
            <ToolIcon className="h-7 w-7" style={{ color: iconColor }} />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{template.title}</h1>
          <p className="mb-4 text-lg italic text-muted/80">{template.tool}</p>
          <p className="mb-6 text-base leading-relaxed text-muted">{template.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${categoryColors[template.category]}`}>{template.category}</span>
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${difficultyColors[template.difficulty]}`}>{template.difficulty}</span>
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${complexityColors[template.complexity]}`}>{template.complexity}</span>
          </div>
        </div>

        <div className="rounded-xl border border-glass bg-white/[0.02] p-6 backdrop-blur-sm">
          {template.designHighlights.length > 0 && (
            <>
              <h3 className="mb-4 text-base font-semibold uppercase tracking-wider text-foreground">{t.templatesPage.keyBenefits}</h3>
              <ul className="space-y-3">
                {template.designHighlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-base text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: iconColor }} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={`grid grid-cols-2 gap-4 ${template.designHighlights.length > 0 ? "mt-6 border-t border-glass pt-4" : ""}`}>
            <TemplateChips title={t.templatesPage.triggers} Icon={Zap} items={template.triggers} iconColor={iconColor} descriptions={triggerDescriptions} />
            <TemplateChips title={t.templatesPage.services} Icon={Link2} items={template.serviceFlow} iconColor={iconColor} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

interface TemplateChipsProps {
  title: string;
  Icon: typeof Zap;
  items: string[];
  iconColor: string;
  descriptions?: Record<string, string>;
}

function TemplateChips({ title, Icon, items, iconColor, descriptions }: TemplateChipsProps) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-muted">
        <Icon className="h-3 w-3" /> {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 5).map((item) => {
          const ItemIcon = descriptions ? (triggerIcons[item] ?? Zap) : null;
          return (
            <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-glass-hover bg-white/3 px-2.5 py-0.5 text-sm capitalize text-muted" title={descriptions?.[item]}>
              {ItemIcon && <ItemIcon className="h-3 w-3" style={{ color: iconColor }} />}
              {item}
            </span>
          );
        })}
        {items.length > 5 && <span className="rounded-full border border-glass-hover bg-white/3 px-2.5 py-0.5 text-sm text-muted">+{items.length - 5}</span>}
      </div>
    </div>
  );
}
