import { ogCard, OG_SIZE } from "@/lib/og";
import { getTemplateById, getTemplateStaticParams } from "@/lib/template-queries";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Personas agent template";

export function generateStaticParams() {
  return getTemplateStaticParams();
}

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTemplateById(id);
  if (!t) {
    return ogCard({ title: "Agent Templates", badge: "Templates", footer: "personas.so/templates" });
  }
  return ogCard({
    title: t.title,
    subtitle: t.serviceFlow.length > 0 ? t.serviceFlow.join("  →  ") : t.description,
    badge: t.category,
    badgeColor: "#a855f7",
    accentColor: "#a855f7",
    footer: `personas.so/templates/${t.id}`,
  });
}
