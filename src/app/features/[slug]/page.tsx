import { notFound } from "next/navigation";
import { FEATURE_PAGES } from "@/data/feature-pages";
import FeatureDetail from "./FeatureDetail";

export function generateStaticParams() {
  return FEATURE_PAGES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = FEATURE_PAGES.find((f) => f.slug === slug);
  return {
    title: feature ? `${feature.title} — Personas` : "Feature",
    description: feature?.description,
  };
}

export default async function FeatureDeepDivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!FEATURE_PAGES.some((f) => f.slug === slug)) notFound();
  return <FeatureDetail slug={slug} />;
}
