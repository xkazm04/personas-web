import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Holds every JSON body in docs/api/openapi.json to a worked example that
 * satisfies its own schema.
 *
 * apiSchemaStatuses.test.ts sees which statuses a handler sends, not what the
 * body looks like, so a schema could say `{ totals }` while the handler sends
 * `{ ok: true }` and nothing would notice. An orchestrator client or an agent
 * writing a caller reads the example first; this fails when a JSON request or
 * response has none, or when the example breaks the schema beside it.
 *
 * The validator is deliberately small: it knows the keywords the spec uses and
 * throws on any other, so a new keyword cannot pass unchecked. A media type
 * with an empty schema (the orchestrator relay) accepts anything and is exempt.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const VERBS = ["get", "post", "put", "delete", "patch", "head", "options"];

type Schema = { [keyword: string]: unknown };
type Media = { schema?: Schema; example?: unknown };
type Body = { $ref?: string; content?: Record<string, Media> };

const spec = JSON.parse(readFileSync(path.join(REPO_ROOT, "docs", "api", "openapi.json"), "utf8")) as {
  paths: Record<string, Record<string, unknown>>;
};

/** `#/components/schemas/Error` -> the object at that pointer. */
function resolve<T>(ref: string): T {
  let node: unknown = spec;
  for (const key of ref.replace(/^#\//, "").split("/")) node = (node as Record<string, unknown>)[key];
  if (node === undefined) throw new Error(`unresolved $ref ${ref}`);
  return node as T;
}

/** Keywords that describe a value without constraining it. */
const ANNOTATIONS = new Set(["description", "format", "title"]);
const CHECKED = new Set([
  "$ref", "type", "required", "properties", "additionalProperties", "enum", "const",
  "items", "minLength", "maxLength", "pattern",
]);

function typeOf(value: unknown): string[] {
  if (value === null) return ["null"];
  if (Array.isArray(value)) return ["array"];
  if (typeof value === "number") return Number.isInteger(value) ? ["integer", "number"] : ["number"];
  return [typeof value];
}

/** Problems with `value` against `schema`, each prefixed with its JSON path. */
function validate(value: unknown, schema: Schema, at = "$"): string[] {
  for (const keyword of Object.keys(schema)) {
    if (!CHECKED.has(keyword) && !ANNOTATIONS.has(keyword)) {
      throw new Error(`${at}: schema keyword "${keyword}" is not supported by this spec's validator`);
    }
  }
  if (typeof schema.$ref === "string") return validate(value, resolve<Schema>(schema.$ref), at);

  const out: string[] = [];
  if (schema.type !== undefined) {
    const allowed = Array.isArray(schema.type) ? (schema.type as string[]) : [schema.type as string];
    if (!typeOf(value).some((t) => allowed.includes(t))) {
      return [`${at}: expected ${allowed.join(" | ")}, got ${typeOf(value)[0]}`];
    }
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    out.push(`${at}: ${JSON.stringify(value)} is not one of ${JSON.stringify(schema.enum)}`);
  }
  if ("const" in schema && schema.const !== value) {
    out.push(`${at}: expected ${JSON.stringify(schema.const)}`);
  }
  if (typeof value === "string") {
    if (typeof schema.minLength === "number" && value.length < schema.minLength) out.push(`${at}: shorter than ${schema.minLength}`);
    if (typeof schema.maxLength === "number" && value.length > schema.maxLength) out.push(`${at}: longer than ${schema.maxLength}`);
    if (typeof schema.pattern === "string" && !new RegExp(schema.pattern).test(value)) out.push(`${at}: does not match ${schema.pattern}`);
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, i) => out.push(...validate(item, schema.items as Schema, `${at}[${i}]`)));
  }
  if (typeOf(value)[0] === "object") {
    const obj = value as Record<string, unknown>;
    const props = (schema.properties ?? {}) as Record<string, Schema>;
    for (const key of (schema.required ?? []) as string[]) {
      if (!(key in obj)) out.push(`${at}: missing required "${key}"`);
    }
    for (const [key, child] of Object.entries(obj)) {
      if (props[key]) out.push(...validate(child, props[key], `${at}.${key}`));
      else if (schema.additionalProperties === false) out.push(`${at}: unexpected "${key}"`);
      else if (typeof schema.additionalProperties === "object" && schema.additionalProperties !== null) {
        out.push(...validate(child, schema.additionalProperties as Schema, `${at}.${key}`));
      }
    }
  }
  return out;
}

/** Every application/json media object in a request body or response, by label. */
function jsonMedia(): Array<[string, Media]> {
  const out: Array<[string, Media]> = [];
  const add = (label: string, body: Body | undefined) => {
    const resolved = body?.$ref ? resolve<Body>(body.$ref) : body;
    const media = resolved?.content?.["application/json"];
    if (media && Object.keys(media.schema ?? {}).length > 0) out.push([label, media]);
  };
  for (const [route, item] of Object.entries(spec.paths)) {
    for (const verb of VERBS) {
      const op = item[verb] as { requestBody?: Body; responses?: Record<string, Body> } | undefined;
      if (!op) continue;
      add(`${verb.toUpperCase()} ${route} request`, op.requestBody);
      for (const [code, response] of Object.entries(op.responses ?? {})) {
        add(`${verb.toUpperCase()} ${route} ${code}`, response);
      }
    }
  }
  return out;
}

const media = jsonMedia();

describe("docs/api/openapi.json examples", () => {
  it("finds JSON bodies to check", () => {
    expect(media.length).toBeGreaterThan(10);
  });

  it("the validator rejects a body that breaks its schema", () => {
    const error = { $ref: "#/components/schemas/Error" };
    expect(validate({ error: "bad_path" }, error)).toEqual([]);
    expect(validate({}, error)).toEqual(['$: missing required "error"']);
    expect(validate({ error: 7 }, error)).toEqual(["$.error: expected string, got integer"]);
    expect(validate({ tierValue: 10 }, { properties: { tierValue: { $ref: "#/components/schemas/BoostTier" } } })).toEqual([
      "$.tierValue: 10 is not one of [5,15,25]",
    ]);
    expect(validate("short", { $ref: "#/components/schemas/VoterId" })).toEqual([
      "$: does not match ^[A-Za-z0-9_-]{16,64}$",
    ]);
  });

  it.each(media)("%s carries an example that fits its schema", (label, m) => {
    expect(m.example, `${label}: add an "example" beside its schema`).toBeDefined();
    expect(validate(m.example, m.schema as Schema), label).toEqual([]);
  });
});
