import { BLOG_POSTS, BLOG_CATEGORIES } from "@/data/blog";
import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Personas Blog";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const category = BLOG_CATEGORIES.find((c) => c.id === post?.category);

  return ogCard({
    title: post?.title ?? "Personas Blog",
    subtitle: post?.description,
    badge: category?.label ?? "Blog",
    badgeColor: category?.color ?? "#06b6d4",
    accentColor: category?.color ?? "#06b6d4",
    footer: `personas.ai/blog · ${post?.readingTime ?? 5} min read`,
  });
}
