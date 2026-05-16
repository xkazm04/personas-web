import { ImageResponse } from "next/og";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/data/blog";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Personas Blog";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  // Unknown slugs return 404 instead of a polished fallback card. A
  // generic preview at /blog/<arbitrary-string> would let anyone craft
  // misleading link unfurls (Slack/Twitter/LinkedIn) under our domain.
  // Aligns OG behavior with the page route's notFound().
  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#09090b",
            color: "rgba(255,255,255,0.5)",
            fontSize: 48,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Not found
        </div>
      ),
      { ...OG_SIZE, status: 404 },
    );
  }

  const category = BLOG_CATEGORIES.find((c) => c.id === post.category);

  return ogCard({
    title: post.title,
    subtitle: post.description,
    badge: category?.label ?? "Blog",
    badgeColor: category?.color ?? "#06b6d4",
    accentColor: category?.color ?? "#06b6d4",
    footer: `personas.ai/blog · ${post.readingTime} min read`,
  });
}
