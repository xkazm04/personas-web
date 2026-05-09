import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Personas Guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryId } = await params;
  const category = GUIDE_CATEGORIES.find((c) => c.id === categoryId);
  const topicCount = GUIDE_TOPICS.filter((t) => t.categoryId === categoryId).length;

  return ogCard({
    title: category?.name ?? "Guide",
    subtitle: category?.description,
    badge: `${topicCount} topics`,
    badgeColor: category?.color ?? "#06b6d4",
    accentColor: category?.color ?? "#06b6d4",
    footer: "personas.ai/guide",
  });
}
