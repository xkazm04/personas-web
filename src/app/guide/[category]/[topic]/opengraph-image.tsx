import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Personas Guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ category: string; topic: string }> }) {
  const { category: categoryId, topic: topicId } = await params;
  const topic = GUIDE_TOPICS.find((t) => t.id === topicId);
  const category = GUIDE_CATEGORIES.find((c) => c.id === categoryId);

  return ogCard({
    title: topic?.title ?? "Guide",
    subtitle: topic?.description,
    badge: category?.name ?? "Guide",
    badgeColor: category?.color ?? "#06b6d4",
    accentColor: category?.color ?? "#06b6d4",
    footer: "personas.ai/guide",
  });
}
