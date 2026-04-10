import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { USE_CASES } from "@/data/use-cases";
import { SITE_URL } from "@/lib/seo";
import UseCaseDetail from "./UseCaseDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return USE_CASES.map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (!uc) return {};
  return {
    title: uc.title,
    description: uc.description,
    openGraph: {
      title: `${uc.title} — Personas Use Cases`,
      description: uc.description,
      url: `${SITE_URL}/use-cases/${slug}`,
    },
    alternates: { canonical: `${SITE_URL}/use-cases/${slug}` },
  };
}

export default async function UseCaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (!uc) notFound();
  return <UseCaseDetail useCase={uc} />;
}
