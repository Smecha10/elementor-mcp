/**
 * Self-improving schema extraction.
 *
 * Ingests any Elementor export and derives a settings schema for every widget /
 * element it contains, merging the result into a growing registry file. This
 * lets the system learn the exact shape of widgets and settings that were not
 * present in the original reference export — without code changes.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");

export const REGISTRY_PATH = path.join(PKG_ROOT, "reference", "widget-schemas.json");

interface SettingTypeInfo {
  kind: string;
  type: string;
  seenCount: number;
  itemKeys?: string[];
}

interface RegistryEntry {
  elType: string;
  widgetType: string | null;
  kind: string;
  instances: number;
  settings: Record<string, SettingTypeInfo>;
  example: Record<string, unknown> | null;
  sources: string[];
}

interface ElementorNode {
  elType?: string;
  widgetType?: string;
  settings?: Record<string, unknown>;
  elements?: ElementorNode[];
  styles?: unknown;
  version?: string;
}

interface ElementorDoc {
  content?: ElementorNode[];
  elements?: ElementorNode[]; // raw format (from active Elementor data, not export)
}

function classify(node: ElementorNode): string {
  if (node.elType === "container") return "container";
  if (node.widgetType) {
    // Atomic widgets carry a styles/version field; classic ones don't.
    return node.styles !== undefined || node.version !== undefined ? "widget" : "classic";
  }
  return "structural"; // elType == the type itself (e-flexbox, e-form, e-tabs, ...)
}

function settingType(value: unknown): SettingTypeInfo {
  if (value && typeof value === "object" && !Array.isArray(value) && "$$type" in value) {
    return { kind: "atomic", type: String((value as Record<string, unknown>).$$type), seenCount: 1 };
  }
  if (Array.isArray(value)) {
    const keys = new Set<string>();
    for (const item of value) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        for (const k of Object.keys(item as Record<string, unknown>))
          keys.add(k);
      }
    }
    return { kind: "flat", type: "array", itemKeys: keys.size ? [...keys] : undefined, seenCount: 1 };
  }
  if (value === null) return { kind: "flat", type: "null", seenCount: 1 };
  return { kind: "flat", type: typeof value, seenCount: 1 };
}

/** Extract a registry from a single Elementor document. */
export function extractSchemas(doc: ElementorDoc, source = "inline"): Record<string, RegistryEntry> {
  const reg: Record<string, RegistryEntry> = {};
  function visit(node: ElementorNode) {
    const key = node.widgetType ?? node.elType ?? "unknown";
    const kind = classify(node);
    let entry = reg[key];
    if (!entry) {
      entry = {
        elType: node.elType ?? "unknown",
        widgetType: node.widgetType ?? null,
        kind,
        instances: 0,
        settings: {},
        example: null,
        sources: [source],
      };
      reg[key] = entry;
    }
    entry.instances += 1;
    const settings = node.settings;
    if (settings && typeof settings === "object" && !Array.isArray(settings)) {
      const sObj = settings;
      if (!entry.example || Object.keys(sObj).length > Object.keys(entry.example).length) {
        entry.example = sObj;
      }
      for (const [k, v] of Object.entries(sObj)) {
        const t = settingType(v);
        const prev = entry.settings[k];
        if (prev) {
          prev.seenCount += 1;
          if (t.itemKeys)
            prev.itemKeys = [...new Set([...(prev.itemKeys ?? []), ...t.itemKeys])];
        } else {
          entry.settings[k] = t;
        }
      }
    }
    for (const child of node.elements ?? []) visit(child);
  }
  const nodes = doc.content ?? doc.elements ?? [];
  for (const node of nodes) visit(node);
  return reg;
}

/** Merge a freshly-extracted registry into an existing one. */
export function mergeRegistry(base: Record<string, RegistryEntry>, add: Record<string, RegistryEntry>): Record<string, RegistryEntry> {
  const out: Record<string, RegistryEntry> = JSON.parse(JSON.stringify(base));
  for (const [key, schema] of Object.entries(add)) {
    const existing = out[key];
    if (!existing) {
      out[key] = schema;
      continue;
    }
    existing.instances += schema.instances;
    existing.sources = [...new Set([...existing.sources, ...schema.sources])];
    if (schema.example && (!existing.example || Object.keys(schema.example).length > Object.keys(existing.example).length)) {
      existing.example = schema.example;
    }
    for (const [k, t] of Object.entries(schema.settings)) {
      const prev = existing.settings[k];
      if (prev) {
        prev.seenCount += t.seenCount;
        if (t.itemKeys)
          prev.itemKeys = [...new Set([...(prev.itemKeys ?? []), ...t.itemKeys])];
        if (prev.type !== t.type)
          prev.type = `${prev.type}|${t.type}`;
      } else {
        existing.settings[k] = t;
      }
    }
  }
  return out;
}

export async function loadRegistry(): Promise<Record<string, RegistryEntry>> {
  if (!existsSync(REGISTRY_PATH)) return {};
  try {
    return JSON.parse(await readFile(REGISTRY_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export async function saveRegistry(reg: Record<string, RegistryEntry>): Promise<void> {
  const dir = path.dirname(REGISTRY_PATH);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(REGISTRY_PATH, JSON.stringify(reg, null, 2), "utf-8");
}

/** Ingest one export into the persistent registry; returns a learning summary. */
export async function learnFromDoc(doc: ElementorDoc, source: string): Promise<{ registry: Record<string, RegistryEntry>; summary: string }> {
  const before = await loadRegistry();
  const fresh = extractSchemas(doc, source);
  const merged = mergeRegistry(before, fresh);
  await saveRegistry(merged);
  const newWidgets = Object.keys(fresh).filter((k) => !(k in before));
  const updated = Object.keys(fresh).filter((k) => k in before);
  const lines: string[] = [];
  lines.push(`Learned from "${source}". Elements in file: ${Object.keys(fresh).length}.`);
  if (newWidgets.length) lines.push(`New widgets: ${newWidgets.join(", ")}`);
  for (const k of [...newWidgets, ...updated]) {
    const s = fresh[k];
    const keys = Object.keys(s.settings);
    lines.push(`  \u2022 ${k} [${s.kind}] — ${keys.length} setting(s): ${keys.slice(0, 12).join(", ")}${keys.length > 12 ? "…" : ""}`);
  }
  lines.push(`Registry now covers ${Object.keys(merged).length} element types → ${REGISTRY_PATH}`);
  return { registry: merged, summary: lines.join("\n") };
}
