"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionBreadcrumb from "@/components/SectionBreadcrumb";
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
  breadcrumbItems?: BreadcrumbItem[];
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <SectionBreadcrumb items={breadcrumbItems} />
        )}
        {/* Spacer for fixed navbar */}
        <div className="h-24" />
        {children}
      </PageShell>
      <Footer />
    </>
  );
}
