import Link from "next/link";
import ModuleBadge from "@/components/guide/ModuleBadge";
import GuideSearchLauncher from "@/components/guide/GuideSearchLauncher";
import { TOPIC_MODULE_MAP } from "@/data/guide/desktop-modules";
import type { GuideCategory, GuideTopic } from "@/data/guide/types";

/** Breadcrumb + full-guide search trigger, the desktop module badge, and the topic tags. */
export default function TopicHeader({ category, topic, title }: { category: GuideCategory; topic: GuideTopic; title: string }) {
  return (
    <>
      {/* Breadcrumb + full-guide search trigger */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-base text-muted-dark">
          <Link href="/guide" className="transition-colors hover:text-brand-cyan">Guide</Link>
          <span>/</span>
          <Link href={`/guide/${category.id}`} className="transition-colors hover:text-brand-cyan">
            {category.name}
          </Link>
          <span>/</span>
          <span className="truncate text-foreground" aria-current="page">{title}</span>
        </nav>
        <GuideSearchLauncher />
      </div>

      {/* Desktop app reference + Tags */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {TOPIC_MODULE_MAP[topic.id] && (
          <ModuleBadge moduleRef={TOPIC_MODULE_MAP[topic.id]} categoryColor={category.color} />
        )}
      </div>

      {/* Tags */}
      {topic.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${category.color}15`, color: category.color }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
