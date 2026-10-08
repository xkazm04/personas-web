/**
 * Replace each `{name}` in a translated template with its value; an unknown
 * placeholder stays visible (so a missing variable shows up in review rather
 * than rendering as an empty gap).
 */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : whole,
  );
}
