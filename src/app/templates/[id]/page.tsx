import { notFound } from "next/navigation";
import { templates } from "@/lib/templates";
import TemplateDetail from "./TemplateDetail";

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = templates.find((tpl) => tpl.id === id);
  return {
    title: t ? `${t.title} — Template` : "Template",
    description: t?.description,
  };
}

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!templates.some((t) => t.id === id)) notFound();

  // Pass only the ID — TemplateDetail is a client component that imports
  // templates directly, avoiding server→client serialization of React components (toolIcon).
  return <TemplateDetail templateId={id} />;
}
