import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { getBySlug } from "@/app/api/personas/storage";
import SharePersonaView from "./SharePersonaView";

export const dynamic = "force-dynamic"; // gallery rows are user-published at runtime

interface Bundle {
  persona?: { name?: string; description?: string | null; system_prompt?: string };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getBySlug(slug);
  if (!row) {
    return { title: "Agent not found", robots: { index: false, follow: false } };
  }
  const url = `${SITE_URL}/p/${slug}`;
  const title = `${row.name} — a Personas agent`;
  const description = row.description || "Open this shared AI agent in Personas in one click.";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, siteName: SITE_NAME, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedPersonaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getBySlug(slug);
  if (!row) notFound();

  const bundle = row.bundle as Bundle;
  const systemPrompt = bundle?.persona?.system_prompt ?? "";
  const promptPreview = systemPrompt.slice(0, 600);

  return (
    <SharePersonaView
      slug={row.slug}
      name={row.name}
      description={row.description}
      icon={row.icon}
      color={row.color}
      category={row.category}
      publisher={row.publisher}
      installCount={row.install_count}
      promptPreview={promptPreview}
      promptTruncated={systemPrompt.length > promptPreview.length}
      bundleJson={JSON.stringify(row.bundle, null, 2)}
      shareUrl={`${SITE_URL}/p/${row.slug}`}
    />
  );
}
