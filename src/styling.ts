/**
 * Resolves a friendly style object (from a blueprint) into Elementor variants.
 *
 * A small, confirmed-safe set of CSS properties is emitted as native typed
 * props (exactly how real Elementor exports store them). Everything else is
 * routed to `custom_css` as raw CSS declarations, which Elementor scopes to the
 * element automatically. This keeps imports robust while supporting any CSS.
 */
import { size, str, dimensions, color, borderRadius, background, boxShadow, TypedValue } from "./elementor/primitives.js";

const RESPONSIVE_KEYS = new Set(["tablet", "mobile", "widescreen", "hover", "css"]);

// Native typed props confirmed present in real Elementor v4 exports.
const SIZE_PROPS = new Set([
  "font-size", "gap", "width", "max-width", "min-height", "height",
  "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
  "line-height", "letter-spacing", "opacity",
]);
const STRING_PROPS = new Set([
  "display",
  "flex-direction",
  "flex-wrap",
  "text-align",
  "font-weight",
]);

const DIMENSION_PROPS = new Set(["padding"]);

const BACKGROUND_PROPS = new Set(["background"]);
const SHADOW_PROPS = new Set(["box-shadow"]);

// Flexbox alignment props use a typed "string", but Elementor v4 validates the
// value against the box-alignment keywords (NOT the legacy flex-* synonyms).
// Anything outside the accepted set must go to raw CSS or the import is rejected
// (e.g. "variants[0].align-items: invalid_value").
const ALIGN_SYNONYMS: Record<string, string> = { "flex-start": "start", "flex-end": "end" };
const ALIGN_ITEMS_OK = new Set(["start", "center", "end", "stretch"]);
const JUSTIFY_OK = new Set(["start", "center", "end", "stretch", "space-between", "space-around", "space-evenly"]);
const FLEX_ALIGN_PROPS: Record<string, Set<string>> = {
  "align-items": ALIGN_ITEMS_OK,
  "justify-content": JUSTIFY_OK,
};

function toKebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

interface ResolveFlatResult {
  props: Record<string, TypedValue>;
  css: string;
}

/**
 * Split a flat style map into native typed props and leftover raw CSS.
 */
function resolveFlat(map: Record<string, unknown>): ResolveFlatResult {
  const props: Record<string, TypedValue> = {};
  const cssLines: string[] = [];
  for (const [rawKey, value] of Object.entries(map)) {
    if (RESPONSIVE_KEYS.has(rawKey)) continue;
    if (value === undefined) continue;
    const key = toKebab(rawKey);
    if (SIZE_PROPS.has(key) && (typeof value === "string" || typeof value === "number")) {
      props[key] = size(value);
    } else if (FLEX_ALIGN_PROPS[key] && (typeof value === "string" || typeof value === "number")) {
      const raw = String(value);
      const normalized = ALIGN_SYNONYMS[raw] ?? raw;
      if (FLEX_ALIGN_PROPS[key].has(normalized)) {
        props[key] = str(normalized);
      } else {
        // Unsupported keyword (e.g. "baseline"): apply via scoped CSS instead so
        // the import stays valid.
        cssLines.push(`${key}: ${raw};`);
      }
    } else if (STRING_PROPS.has(key)) {
      props[key] = str(String(value));
    } else if (DIMENSION_PROPS.has(key)) {
      props[key] = dimensions(value as number | { top?: number; right?: number; bottom?: number; left?: number });
    } else if (key === "color" && (typeof value === "string" || typeof value === "number")) {
      props[key] = color(String(value));
    } else if (key === "border-radius") {
      // Accepts a single size ("1rem") or { topLeft, topRight, bottomRight, bottomLeft }.
      props[key] = borderRadius(value as number | string | { topLeft?: number | string; topRight?: number | string; bottomRight?: number | string; bottomLeft?: number | string });
    } else if (BACKGROUND_PROPS.has(key)) {
      // Native background prop: string (CSS color) -> classic type; object -> structured pass-through
      if (typeof value === "string" || typeof value === "number") {
        props[key] = background(String(value));
      } else if (value !== null && typeof value === "object") {
        props[key] = background(value as Record<string, unknown>);
      }
    } else if (SHADOW_PROPS.has(key) && (typeof value === "string" || typeof value === "number")) {
      // Native box-shadow prop: parse CSS string into structured format
      props[key] = boxShadow(String(value));
    } else if (key === "background-color" && (typeof value === "string" || typeof value === "number")) {
      // Route simple background-color through custom_css since there's no
      // confirmed native "background-color" prop type. This keeps imports valid.
      cssLines.push(`background-color: ${value};`);
    } else {
      // Route to raw CSS. Object values (per-side) are not supported here.
      if (value !== null && typeof value === "object") {
        throw new Error(`Style prop "${rawKey}" cannot take an object value; use a CSS string.`);
      }
      cssLines.push(`${key}: ${value};`);
    }
  }
  return { props, css: cssLines.join(" ") };
}

export interface StyleVariantSpec {
  breakpoint?: string;
  state?: string | null;
  props: Record<string, TypedValue>;
  customCss?: string;
}

/**
 * Build the full variant list for a style spec, covering desktop/responsive/hover.
 */
export function resolveStyle(spec?: Record<string, unknown> | null): StyleVariantSpec[] {
  if (!spec) return [];
  const variants: StyleVariantSpec[] = [];
  const desktop = resolveFlat(spec);
  const desktopCss = [desktop.css, typeof spec.css === "string" ? spec.css : ""]
    .filter(Boolean)
    .join(" ");
  if (Object.keys(desktop.props).length || desktopCss) {
    variants.push({ breakpoint: "desktop", state: null, props: desktop.props, customCss: desktopCss });
  }
  const breakpoints: [string, string][] = [
    ["widescreen", "widescreen"],
    ["tablet", "tablet"],
    ["mobile", "mobile"],
  ];
  for (const [key, bp] of breakpoints) {
    const sub = spec[key] as Record<string, unknown> | undefined;
    if (!sub) continue;
    const r = resolveFlat(sub);
    if (Object.keys(r.props).length || r.css) {
      variants.push({ breakpoint: bp, state: null, props: r.props, customCss: r.css });
    }
  }
  if (spec.hover) {
    const r = resolveFlat(spec.hover as Record<string, unknown>);
    const hoverState = "hover";
    if (Object.keys(r.props).length || r.css) {
      variants.push({ breakpoint: "desktop", state: hoverState, props: r.props, customCss: r.css });
    }
  }
  return variants;
}