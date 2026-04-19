"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import StageSection from "@/components/StageSection";
import PageShell from "@/components/PageShell";
import ConnectionsCatalog from "@/components/sections/ConnectionsCatalog";
import ConnectorModal from "@/components/sections/ConnectorModal";
import { connectors, type Connector } from "@/data/connectors";

const scrollMapItems = [
  { label: "CATALOG", href: "#connections-catalog" },
];

function ConnectionsContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get("category") || "all",
  );
  const [search, setSearch] = useState(
    () => searchParams.get("q") || "",
  );
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(
    () => {
      const name = searchParams.get("connector");
      return name ? connectors.find((c) => c.name === name) ?? null : null;
    },
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (search) params.set("q", search);
    if (selectedConnector) params.set("connector", selectedConnector.name);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [activeCategory, search, selectedConnector, pathname]);

  const handleConnectorClick = useCallback((c: Connector) => {
    setSelectedConnector(c);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedConnector(null);
  }, []);

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        <StageSection glow="cyan" toColor="purple">
          <ConnectionsCatalog
            activeCategory={activeCategory}
            search={search}
            onCategoryChange={setActiveCategory}
            onSearchChange={setSearch}
            onConnectorClick={handleConnectorClick}
          />
        </StageSection>
      </PageShell>
      <ConnectorModal connector={selectedConnector} onClose={handleCloseModal} />
      <Footer />
    </>
  );
}

export default function Connections() {
  return (
    <Suspense>
      <ConnectionsContent />
    </Suspense>
  );
}
