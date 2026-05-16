"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { getRelatedTemplates, getTemplateById } from "@/lib/template-queries";
import { useTranslation } from "@/i18n/useTranslation";
import { RelatedTemplates } from "./template-detail/RelatedTemplates";
import { TemplateConfiguration } from "./template-detail/TemplateConfiguration";
import { TemplateDownloadCta } from "./template-detail/TemplateDownloadCta";
import { TemplateFallbackModal } from "./template-detail/TemplateFallbackModal";
import { TemplateHero } from "./template-detail/TemplateHero";
import { TemplateJsonLd } from "./template-detail/TemplateJsonLd";

function fallbackCopyToClipboard(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export default function TemplateDetail({ templateId }: { templateId: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const template = getTemplateById(templateId);
  if (!template) notFound();
  const related = getRelatedTemplates(templateId);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const scheduleReset = useCallback((ms: number, fn: () => void) => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      resetTimerRef.current = null;
      fn();
    }, ms);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(template.config);
      setCopyFailed(false);
      setCopied(true);
      scheduleReset(2000, () => setCopied(false));
    } catch {
      if (fallbackCopyToClipboard(template.config)) {
        setCopyFailed(false);
        setCopied(true);
        scheduleReset(2000, () => setCopied(false));
      } else {
        setCopied(false);
        setCopyFailed(true);
        scheduleReset(3000, () => setCopyFailed(false));
      }
    }
  }, [template.config, scheduleReset]);

  const handleOpenInPersonas = useCallback(() => {
    const deepLink = `personas://template/${template.id}`;
    const start = Date.now();
    const onBlur = () => {
      clearTimeout(timer);
      window.removeEventListener("blur", onBlur);
    };
    const timer = setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      if (Date.now() - start >= 1500 && !document.hidden) setShowFallback(true);
    }, 1500);

    window.addEventListener("blur", onBlur);
    window.location.href = deepLink;
  }, [template.id]);

  useEffect(() => {
    if (!showFallback) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowFallback(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showFallback]);

  return (
    <>
      <TemplateJsonLd template={template} />
      <Navbar />
      <main id="main-content" className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Link href="/templates" className="mb-8 inline-flex items-center gap-1.5 text-base text-muted-dark transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> {t.templatesPage.backToTemplates}
            </Link>
          </motion.div>

          <TemplateHero template={template} />
          <TemplateConfiguration code={template.config} copied={copied} copyFailed={copyFailed} onCopy={handleCopy} />
          <TemplateDownloadCta copied={copied} copyFailed={copyFailed} onCopy={handleCopy} onOpenInPersonas={handleOpenInPersonas} />
          <RelatedTemplates category={template.category} templates={related} />
        </motion.div>
      </main>

      <TemplateFallbackModal open={showFallback} onClose={() => setShowFallback(false)} onCopy={handleCopy} />
      <Footer />
    </>
  );
}
