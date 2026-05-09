import { templates } from "@/lib/templates";

const templatesById = new Map(templates.map((template) => [template.id, template]));

export function getTemplateById(id: string) {
  return templatesById.get(id) ?? null;
}

export function getTemplateStaticParams() {
  return templates.map((template) => ({ id: template.id }));
}

export function getRelatedTemplates(templateId: string, limit = 3) {
  const template = getTemplateById(templateId);
  if (!template) return [];

  return templates
    .filter((candidate) => (
      candidate.category === template.category &&
      candidate.id !== template.id
    ))
    .slice(0, limit);
}
