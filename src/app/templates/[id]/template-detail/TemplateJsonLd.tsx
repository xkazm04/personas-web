import type { AgentTemplate } from "@/lib/templates";
import { safeJsonLd } from "@/lib/seo";

interface TemplateJsonLdProps {
  template: AgentTemplate;
}

export function TemplateJsonLd({ template }: TemplateJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd({
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: template.title,
          description: template.description,
          programmingLanguage: "YAML",
          runtimePlatform: "Personas",
          applicationCategory: template.category,
          url: `https://personas.ai/templates/${template.id}`,
        }),
      }}
    />
  );
}
