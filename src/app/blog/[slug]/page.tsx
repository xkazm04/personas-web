import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/data/blog";
import { SITE_URL } from "@/lib/seo";
import BlogArticle from "./BlogArticle";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} — Personas Blog`,
      description: post.description,
      url: `${SITE_URL}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const category = BLOG_CATEGORIES.find((c) => c.id === post.category);

  return <BlogArticle post={post} categoryLabel={category?.label ?? post.category} categoryColor={category?.color ?? "#06b6d4"} />;
}
