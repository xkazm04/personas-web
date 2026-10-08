"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionBreadcrumb from "@/components/SectionBreadcrumb";
import MobilePageTOC from "@/components/MobilePageTOC";
import TourLauncher, { type BridgeKey } from "@/components/tour/TourLauncher";
import type { ScrollMapItem } from "@/lib/types";
import type { TourId } from "@/lib/tour-script";

interface BreadcrumbItem {
  label: string;
  href: string;
  color: string;
}

export default function InfoPageLayout({
  scrollMapItems,
  breadcrumbItems,
  tourId,
  tourBridgeHref,
  tourBridgeKey,
  snap,
  children,
}: {
  scrollMapItems: ScrollMapItem[];
  breadcrumbItems?: BreadcrumbItem[];
  /** Optional tour to offer — id only (serializable across the RSC boundary);
   *  renders a `TourLauncher` when set. */
  tourId?: TourId;
  /** Where the tour bridges to after its last step (e.g. "/demo"). */
  tourBridgeHref?: string;
  /** Which bridge copy to use; default "features". */
  tourBridgeKey?: BridgeKey;
  /** Every section is a desktop stage: snap each scroll to one (PageShell). */
  snap?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems} snap={snap}>
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <SectionBreadcrumb items={breadcrumbItems} />
        )}
        <MobilePageTOC items={scrollMapItems} />
        {/* Spacer for fixed navbar (exactly the bar on the desktop stage, so the
            first stage starts right under it) */}
        <div className="h-24 stage:h-(--nav-h)" />
        {tourId && (
          <div className="mb-10 flex justify-center">
            <TourLauncher tourId={tourId} bridgeHref={tourBridgeHref} bridgeKey={tourBridgeKey} />
          </div>
        )}
        {children}
      </PageShell>
      <Footer />
    </>
  );
}
