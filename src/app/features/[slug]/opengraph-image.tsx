import { FEATURE_PAGES } from "@/data/feature-pages";
import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Personas Feature";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = FEATURE_PAGES.find((f) => f.slug === slug);

  return ogCard({
    title: feature?.title ?? "Feature",
    subtitle: feature?.description,
    badge: "Feature",
    badgeColor: feature?.color ?? "#06b6d4",
    accentColor: feature?.color ?? "#06b6d4",
    footer: "personas.ai/features",
  });
}
