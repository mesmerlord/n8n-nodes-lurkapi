// Reads LurkAPI's OpenAPI document and returns its endpoints in one plain shape.
// Every generator under integrations/ builds from this, so a new endpoint needs only a rebuild.
import { readFile } from "node:fs/promises";

export const SPEC_URL = "https://api.lurkapi.com/openapi.json";
export const BASE_URL = "https://api.lurkapi.com";

/** Loads the spec from a file path or URL (default: the live spec, or $LURKAPI_SPEC). */
export async function loadSpec(source = process.env.LURKAPI_SPEC || SPEC_URL) {
  if (!/^https?:/.test(source)) return JSON.parse(await readFile(source, "utf8"));
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(source, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`${source} answered ${res.status}`);
      return await res.json();
    } catch (error) {
      if (attempt >= 3) throw error;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

/**
 * @typedef {{ name: string, required: boolean, type: "string"|"number"|"boolean", integer: boolean, enum: string[]|null,
 *   default: unknown, example: unknown, description: string }} Param
 * @typedef {{ id: string, platform: string, platformId: string, path: string, title: string, summary: string,
 *   description: string, credits: number|null, docs: string|null, params: Param[] }} Endpoint
 */

/** @returns {Endpoint[]} in the spec's order (the registry's display order). */
export function endpoints(spec) {
  const out = [];
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    const op = item.get;
    if (!op?.operationId) continue;
    const platform = op.tags?.[0] ?? "Other";
    const platformId = op.operationId.split("_")[0];
    const description = (op.description ?? "").replace(/\n+Cost: [^\n]*$/, "").trim();
    out.push({
      id: op.operationId,
      platform,
      platformId,
      path,
      title: op.summary ?? op.operationId,
      summary: firstParagraph(op.description ?? op.summary ?? ""),
      description,
      credits: typeof op["x-credits"] === "number" ? op["x-credits"] : null,
      docs: op.externalDocs?.url ?? null,
      params: (op.parameters ?? [])
        .filter((p) => p.in === "query")
        .map((p) => {
          const s = p.schema ?? {};
          const flag = Array.isArray(s.enum) && s.enum.length === 2 && s.enum.includes("true") && s.enum.includes("false");
          return {
            name: p.name,
            required: p.required === true,
            type: flag ? "boolean" : s.type === "integer" || s.type === "number" ? "number" : "string",
            integer: s.type === "integer",
            enum: !flag && Array.isArray(s.enum) ? s.enum.map(String) : null,
            default: flag && s.default !== undefined ? s.default === "true" : s.default,
            example: p.example,
            description: (p.description ?? s.description ?? "").trim(),
          };
        }),
    });
  }
  return out;
}

/** Platforms in display order, each with its endpoints. */
export function platforms(list) {
  const map = new Map();
  for (const e of list) {
    if (!map.has(e.platformId)) map.set(e.platformId, { id: e.platformId, name: e.platform, endpoints: [] });
    map.get(e.platformId).endpoints.push(e);
  }
  return [...map.values()];
}

/** The price line every generated description ends with. */
export function costLine(e) {
  if (e.credits === null) return "";
  if (e.credits === 0) return "Free.";
  return `Costs ${e.credits} credit${e.credits === 1 ? "" : "s"}${e.params.some((p) => p.name === "max_credits") ? " or more (see max_credits)" : ""}.`;
}

function firstParagraph(text) {
  return text.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
}
