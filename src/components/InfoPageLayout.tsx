"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionBreadcrumb from "@/components/SectionBreadcrumb";
import MobilePageTOC from "@/components/MobilePageTOC";
import TourLauncher from "@/components/tour/TourLauncher";
import type { ScrollMapItem } from "@/lib/types";
import type { TourStep } from "@/lib/tour-script";

interface BreadcrumbItem {
  label: string;
  href: string;
  color: string;
}

export default function InfoPageLayout({
  scrollMapItems,
  breadcrumbItems,
  tourSteps,
  children,
}: {
  scrollMapItems: ScrollMapItem[];
  breadcrumbItems?: BreadcrumbItem[];
  /** Optional per-page tour script — renders a `TourLauncher` when set. */
  tourSteps?: TourStep[];
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <SectionBreadcrumb items={breadcrumbItems} />
        )}
        <MobilePageTOC items={scrollMapItems} />
        {/* Spacer for fixed navbar */}
        <div className="h-24" />
        {tourSteps && tourSteps.length > 0 && (
          <div className="mb-10 flex justify-center">
            <TourLauncher steps={tourSteps} />
          </div>
        )}
        {children}
      </PageShell>
      <Footer />
    </>
  );
}
