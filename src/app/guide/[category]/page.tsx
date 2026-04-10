import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Rocket, Bot, Zap, ShieldCheck, GitBranch,
  FlaskConical, Brain, BarChart3, Cloud, Wrench, ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import CategoryTopics from "./CategoryTopics";

/* ── Icon map ────────────────────────────────────────────────────────── */

const iconMap: Record<string, LucideIcon> = {
  Rocket, Bot, Zap, ShieldCheck, GitBranch,
  FlaskConical, Brain, BarChart3, Cloud, Wrench,
};

/* ── Static generation ───────────────────────────────────────────────── */

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = GUIDE_CATEGORIES.find((c) => c.id === category);
  return {
    title: cat?.name ?? "Guide",
    description: cat?.description,
  };
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = GUIDE_CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();

  const topics = GUIDE_TOPICS.filter((t) => t.categoryId === cat.id);
  const Icon = iconMap[cat.icon];

  return (
    <>
      <Navbar />
      <div className="h-24" />

      <main className="min-h-screen px-6 pb-32">
        <div className="mx-auto max-w-5xl">
          {/* Back link */}
          <Link
            href="/guide"
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-dark transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Guide
          </Link>

          {/* Category header */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            {Icon && (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                <Icon className="h-7 w-7" style={{ color: cat.color }} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {cat.name}
                </h1>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  {topics.length} topic{topics.length !== 1 && "s"}
                </span>
              </div>
              <p className="mt-2 text-base text-muted-dark leading-relaxed">
                {cat.description}
              </p>
            </div>
          </div>

          {/* Interactive topics list */}
          <CategoryTopics topics={topics} color={cat.color} />
        </div>
      </main>

      <Footer />
    </>
  );
}
