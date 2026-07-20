import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { fadeUp } from "@/lib/animations";
import { difficultyColors, type TemplateListItem } from "@/lib/templates";

import { categoryAccent, triggerIcons } from "./templatePageConfig";

export function TemplateCard({
  template,
  viewDetailsLabel,
}: {
  template: TemplateListItem;
  viewDetailsLabel: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/templates/${template.id}`}
        className={`group relative flex flex-col rounded-2xl border border-glass bg-white/[0.02] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 border-l-2 ${categoryAccent[template.category]} h-full`}
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {template.serviceFlow.map((service) => (
            <span key={service} className="rounded-full border border-glass-hover bg-white/[0.05] px-2.5 py-0.5 text-sm font-medium text-muted">
              {service}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1.5">
          {template.title}
        </h3>
        <p className="mb-4 flex-1 text-base leading-relaxed text-muted-dark line-clamp-2">
          {template.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize bg-white/[0.04] border-glass-hover text-muted">
            {template.complexity}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-sm font-medium ${difficultyColors[template.difficulty]}`}>
            {template.difficulty}
          </span>
          <span className="flex-1" />
          {template.triggers.map((trigger) => {
            const Icon = triggerIcons[trigger];
            return Icon ? <Icon key={trigger} className="h-3.5 w-3.5 text-muted-dark" aria-label={trigger} /> : null;
          })}
        </div>

        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none">
          <span className="flex items-center gap-1 text-base font-medium text-white">
            {viewDetailsLabel} <ChevronRight className="h-4 w-4" />
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
