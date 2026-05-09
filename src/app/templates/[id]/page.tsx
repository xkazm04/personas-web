import { notFound } from "next/navigation";
import { getTemplateById, getTemplateStaticParams } from "@/lib/template-queries";
import TemplateDetail from "./TemplateDetail";

export function generateStaticParams() {
  return getTemplateStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTemplateById(id);
  return {
    title: t ? `${t.title} — Template` : "Template",
    description: t?.description,
  };
}

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getTemplateById(id)) notFound();

  // Pass only the ID — TemplateDetail is a client component that imports
  // templates directly, avoiding server→client serialization of React components (toolIcon).
  return <TemplateDetail templateId={id} />;
}
