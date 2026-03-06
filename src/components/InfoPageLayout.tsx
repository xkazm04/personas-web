"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionBreadcrumb from "@/components/SectionBreadcrumb";
import { SectionObserverProvider } from "@/contexts/SectionObserverContext";
import type { ScrollMapItem } from "@/lib/types";

interface BreadcrumbItem {
  label: string;
  href: string;
  color: string;
}

export default function InfoPageLayout({
  scrollMapItems,
  breadcrumbItems,
  children,
}: {
  scrollMapItems: ScrollMapItem[];
  breadcrumbItems: BreadcrumbItem[];
  children: React.ReactNode;
}) {
  const sectionIds = scrollMapItems.map((item) => item.href.replace("#", ""));

  return (
    <SectionObserverProvider sectionIds={sectionIds}>
      <Navbar />
      <SectionBreadcrumb items={breadcrumbItems} />
      <PageShell scrollMapItems={scrollMapItems}>
        {/* Spacer for fixed navbar */}
        <div className="h-24" />
        {children}
      </PageShell>
      <Footer />
    </SectionObserverProvider>
  );
}
