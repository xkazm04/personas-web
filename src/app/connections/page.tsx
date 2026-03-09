"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import StageSection from "@/components/StageSection";
import PageShell from "@/components/PageShell";
import ConnectionsCatalog from "@/components/sections/ConnectionsCatalog";
import ConnectorModal from "@/components/sections/ConnectorModal";
import type { Connector } from "@/data/connectors";

const scrollMapItems = [
  { label: "CATALOG", href: "#connections-catalog" },
];

export default function Connections() {
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        {/* Spacer for fixed navbar */}
        <div className="h-24" />

        <StageSection glow="cyan" toColor="purple">
          <ConnectionsCatalog onConnectorClick={setSelectedConnector} />
        </StageSection>
      </PageShell>
      <ConnectorModal connector={selectedConnector} onClose={() => setSelectedConnector(null)} />
      <Footer />
    </>
  );
}
