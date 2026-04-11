import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_ILLUSTRATIONS } from "@/data/guide/illustrations";
import { SITE_URL } from "@/lib/seo";
import CategoryTopics from "./CategoryTopics";

/* ── Static generation ───────────────────────────────────────────────── */

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = GUIDE_CATEGORIES.find((c) => c.id === category);
  const topicCount = GUIDE_TOPICS.filter((t) => t.categoryId === category).length;
  return {
    title: cat ? `${cat.name} — ${topicCount} Topics` : "Guide",
    description: cat?.description,
    alternates: {
      canonical: cat ? `${SITE_URL}/guide/${category}` : undefined,
    },
  };
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = GUIDE_CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();

  const topics = GUIDE_TOPICS.filter((t) => t.categoryId === cat.id);
  const illus = GUIDE_ILLUSTRATIONS[cat.id];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.name,
    description: cat.description,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: topics.length,
      itemListElement: topics.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/guide/${cat.id}/${t.id}`,
        name: t.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Guide", item: `${SITE_URL}/guide` },
      { "@type": "ListItem", position: 2, name: cat.name, item: `${SITE_URL}/guide/${cat.id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    <div className="px-6 pb-24">
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <Link
          href="/guide"
          className="mt-8 inline-flex items-center gap-1.5 text-base text-muted-dark transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Guide
        </Link>

        {/* Illustration banner — dark/light variants swap via CSS */}
        {illus && (
          <div className="relative mt-6 overflow-hidden rounded-2xl">
            <Image
              src={illus.dark}
              alt={cat.name}
              width={800}
              height={400}
              aria-hidden="true"
              className="hidden dark:block h-auto max-h-48 w-full object-cover opacity-60"
              priority
            />
            <Image
              src={illus.light}
              alt={cat.name}
              width={800}
              height={400}
              className="block dark:hidden h-auto max-h-48 w-full object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        )}

        {/* Category header */}
        <div className="mt-6 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {cat.name}
            </h1>
            <span
              className="rounded-full px-2.5 py-0.5 text-sm font-semibold"
              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
            >
              {topics.length} topic{topics.length !== 1 && "s"}
            </span>
          </div>
          <p className="mt-2 text-base text-muted-dark leading-relaxed">
            {cat.description}
          </p>
        </div>

        {/* Interactive topics list */}
        <CategoryTopics topics={topics} color={cat.color} categoryId={cat.id} />
      </div>
    </div>
    </>
  );
}
