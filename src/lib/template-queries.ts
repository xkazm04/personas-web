import { templates } from "@/lib/templates";

const templatesById = new Map(templates.map((template) => [template.id, template]));

// Catch ID collisions at module load — without this, two templates sharing an
// id silently overwrite each other in the Map, getStaticParams emits the
// duplicate path twice (Next dedupes), and the second template renders on
// both /templates/<id> entries with no error in production.
if (templates.length !== templatesById.size) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const t of templates) {
    if (seen.has(t.id)) duplicates.add(t.id);
    seen.add(t.id);
  }
  throw new Error(
    `Duplicate template id${duplicates.size > 1 ? "s" : ""} in src/lib/templates.ts: ${[...duplicates].join(", ")}`,
  );
}

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
