import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { isTopicVisible } from "@/lib/guide-utils";
import { templateList as templates } from "@/lib/templates";
import { BLOG_POSTS } from "@/data/blog";

export const dynamic = "force-static";
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  /* ── Static pages ─────────────────────────────────────────────────── */
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/how`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/connections`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/security`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/roadmap`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/playground`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  /* ── Guide category pages ─────────────────────────────────────────── */
  const guideCategories: MetadataRoute.Sitemap = GUIDE_CATEGORIES.map((c) => ({
    url: `${SITE_URL}/guide/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  /* ── Guide topic pages ────────────────────────────────────────────── */
  const guideTopics: MetadataRoute.Sitemap = GUIDE_TOPICS.filter(isTopicVisible).map((t) => ({
    url: `${SITE_URL}/guide/${t.categoryId}/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  /* ── Template detail pages ────────────────────────────────────────── */
  const templatePages: MetadataRoute.Sitemap = templates.map((t) => ({
    url: `${SITE_URL}/templates/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  /* ── Blog post pages ──────────────────────────────────────────────── */
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...guideCategories, ...guideTopics, ...templatePages, ...blogPages];
}
