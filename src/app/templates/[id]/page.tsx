import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTemplateById, getTemplateStaticParams } from "@/lib/template-queries";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import TemplateDetail from "./TemplateDetail";

export function generateStaticParams() {
  return getTemplateStaticParams();
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const t = getTemplateById(id);
  if (!t) {
    return {
      title: "Template not found",
      robots: { index: false, follow: false },
    };
  }
  // Canonical and OG were missing; previews on social and Slack
  // unfurled with the parent layout's defaults, and search indexers
  // had no per-template signal. Both this metadata and the JSON-LD
  // emitted by TemplateDetail share SITE_URL so canonical, OG, and
  // schema.org agree on every deployment.
  const url = `${SITE_URL}/templates/${id}`;
  const title = `${t.title} — Template`;
  const description = t.description;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getTemplateById(id)) notFound();

  // Pass only the ID — TemplateDetail is a client component that imports
  // templates directly, avoiding server→client serialization of React components (toolIcon).
  return <TemplateDetail templateId={id} />;
}
