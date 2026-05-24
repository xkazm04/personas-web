"use client";

import { useEffect, useCallback, Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import StageSection from "@/components/StageSection";
import PageShell from "@/components/PageShell";
import ConnectionsCatalog from "@/components/sections/connections-catalog";
import ConnectorModal from "@/components/sections/connector-modal";
import { connectors, type Connector } from "@/data/connectors";
import {
  useSearchParamState,
  useParsedSearchParamState,
} from "@/hooks/useSearchParamState";

const scrollMapItems = [
  { label: "CATALOG", href: "#connections-catalog" },
];

function ConnectionsContent() {
  const pathname = usePathname();

  const [activeCategory, setActiveCategory] = useSearchParamState("category", "all");
  const [search, setSearch] = useSearchParamState("q", "");
  const [selectedConnector, setSelectedConnector] = useParsedSearchParamState<Connector | null>(
    "connector",
    (name) => (name ? connectors.find((c) => c.name === name) ?? null : null),
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (search) params.set("q", search);
    if (selectedConnector) params.set("connector", selectedConnector.name);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [activeCategory, search, selectedConnector, pathname]);

  const handleConnectorClick = useCallback(
    (c: Connector) => {
      setSelectedConnector(c);
    },
    [setSelectedConnector],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedConnector(null);
  }, [setSelectedConnector]);

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
