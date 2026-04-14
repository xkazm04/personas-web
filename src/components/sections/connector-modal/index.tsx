"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Connector } from "@/data/connectors";
import ConnectorModalHeader from "./components/ConnectorModalHeader";
import UseCaseList from "./components/UseCaseList";
import TryItToggle from "./components/TryItToggle";

export default function ConnectorModal({
  connector,
  onClose,
}: {
  connector: Connector | null;
  onClose: () => void;
}) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [simKey, setSimKey] = useState(0);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    setShowSimulator(false);
    setSimKey((k) => k + 1);
  }, [connector]);

  useEffect(() => {
    if (connector) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [connector]);

  return (
    <AnimatePresence>
      {connector && (
        <motion.div
          key="connector-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            key="connector-modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-background shadow-2xl shadow-black/50"
          >
            <button
              onClick={onClose}
              aria-label="Close connector details"
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-muted-dark transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{
                background: `linear-gradient(90deg, transparent, ${connector.color}60, transparent)`,
              }}
            />

            <ConnectorModalHeader connector={connector} />
            <div className="mx-8 h-px bg-white/[0.06]" />
            <UseCaseList connector={connector} />
            <div className="mx-8 h-px bg-white/[0.06]" />
            <TryItToggle
              connector={connector}
              showSimulator={showSimulator}
              simKey={simKey}
              onToggle={() => {
                if (!showSimulator) setSimKey((k) => k + 1);
                setShowSimulator(!showSimulator);
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
