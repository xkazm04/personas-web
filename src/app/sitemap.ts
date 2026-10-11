import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { isTopicVisible } from "@/lib/guide-utils";
import { templateList as templates } from "@/lib/templates";
import { BLOG_POSTS } from "@/data/blog";
import { lastModifiedFromGit } from "@/lib/git-dates";

export const dynamic = "force-static";
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // lastModified is derived from content history (git), never stamped "now":
  // crawlers should only be told a URL changed when its source did.
  const mod = (...files: string[]) => lastModifiedFromGit(files, now);

  /* ── Static pages ─────────────────────────────────────────────────── */
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: mod("src/app/page.tsx"), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/features`, lastModified: mod("src/app/features/page.tsx"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/how`, lastModified: mod("src/app/how/page.tsx"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: mod("src/data/guide/topics.ts"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/templates`, lastModified: mod("src/lib/templates.ts"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/connections`, lastModified: mod("src/data/connectors.ts"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: mod("src/data/blog.ts"), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/security`, lastModified: mod("src/data/security.ts"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/roadmap`, lastModified: mod("src/data/roadmap-phases.ts"), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/playground`, lastModified: mod("src/app/playground/page.tsx"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/legal`, lastModified: mod("src/app/legal/page.tsx"), changeFrequency: "yearly", priority: 0.3 },
  ];

  /* ── Guide category pages ─────────────────────────────────────────── */
  const guideCategories: MetadataRoute.Sitemap = GUIDE_CATEGORIES.map((c) => ({
    url: `${SITE_URL}/guide/${c.id}`,
    lastModified: mod(`src/data/guide/content/${c.id}.ts`, "src/data/guide/categories.ts"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  /* ── Guide topic pages ────────────────────────────────────────────── */
  const guideTopics: MetadataRoute.Sitemap = GUIDE_TOPICS.filter(isTopicVisible).map((t) => ({
    url: `${SITE_URL}/guide/${t.categoryId}/${t.id}`,
    lastModified: mod(`src/data/guide/content/${t.categoryId}.ts`, "src/data/guide/topics.ts"),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  /* ── Template detail pages ────────────────────────────────────────── */
  const templatePages: MetadataRoute.Sitemap = templates.map((t) => ({
    url: `${SITE_URL}/templates/${t.id}`,
    lastModified: mod("src/lib/templates.ts"),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  /* ── Blog post pages ──────────────────────────────────────────────── */
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    // A post carries its own publish date; prefer it over file history.
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...guideCategories, ...guideTopics, ...templatePages, ...blogPages];
}
