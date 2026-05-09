import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function BlogPostNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-base font-mono font-medium text-brand-cyan/70">
            404
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Blog post not found
          </h1>
          <p className="mt-4 text-base text-muted leading-relaxed">
            We couldn&apos;t find the article you&apos;re looking for. It may
            have been renamed or moved.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-6 py-2.5 text-base font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/20"
            >
              <BookOpen className="h-4 w-4" />
              Browse all posts
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-glass-hover bg-white/[0.03] px-6 py-2.5 text-base font-medium text-muted transition-colors hover:text-foreground hover:bg-white/[0.05]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
