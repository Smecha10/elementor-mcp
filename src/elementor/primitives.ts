/**
 * Low-level constructors for Elementor v4 "Atomic Widgets" JSON.
 *
 * Every typed value in the format is wrapped as { "$$type": <name>, "value": ... }.
 * These helpers produce exactly the shapes observed in real Elementor exports
 * (version 0.4), so the output imports cleanly.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TypedValue<T = unknown> {
  $$type: string;
  value: T;
}

export interface SizeValue {
  unit: string;
  size: number;
}

export interface DimensionsValue {
  "block-start": TypedValue<SizeValue>;
  "inline-end": TypedValue<SizeValue>;
  "block-end": TypedValue<SizeValue>;
  "inline-start": TypedValue<SizeValue>;
}

export interface HtmlV3Value {
  content: TypedValue<string>;
  children: unknown[];
}

export interface ImageSrcValue {
  id: null;
  url: TypedValue<string>;
}

export interface ImageValue {
  src: TypedValue<ImageSrcValue>;
  size: TypedValue<string>;
  alt?: TypedValue<string>;
}

export interface LinkValue {
  destination: TypedValue<string>;
  isTargetBlank: TypedValue<boolean>;
  tag?: TypedValue<string>;
}

export interface CustomCssValue {
  raw: string;
}

export interface BackgroundValue {
  background_type: TypedValue<string>;
  color?: TypedValue<string>;
  gradient_first_color?: TypedValue<string>;
  gradient_second_color?: TypedValue<string>;
  gradient_angle?: TypedValue<SizeValue>;
  gradient_position?: TypedValue<string>;
  background_image?: TypedValue<ImageSrcValue>;
  background_size?: TypedValue<string>;
  background_position?: TypedValue<string>;
  background_repeat?: TypedValue<string>;
  background_attachment?: TypedValue<string>;
}

export interface BoxShadowValue {
  horizontal: TypedValue<SizeValue>;
  vertical: TypedValue<SizeValue>;
  blur: TypedValue<SizeValue>;
  spread: TypedValue<SizeValue>;
  color: TypedValue<string>;
  position?: TypedValue<string>;
}

// ---------------------------------------------------------------------------
// IDs and class names
// ---------------------------------------------------------------------------

function hex(len: number): string {
  let s = "";
  while (s.length < len) s += Math.floor(Math.random() * 16).toString(16);
  return s.slice(0, len);
}

/** Element id: 8 hex chars, e.g. "714b8f80". */
export function genId(): string {
  return hex(8);
}

/** Local style class name: "e-<elementId>-<7hex>", e.g. "e-714b8f80-4c6c146". */
export function genClass(elementId: string): string {
  return `e-${elementId}-${hex(7)}`;
}

export const str = (value: string): TypedValue<string> => ({ $$type: "string", value });

// ---------------------------------------------------------------------------
// Dynamic Tags (__dynamic__)
// ---------------------------------------------------------------------------

export interface DynamicTag {
  tag: string;       // e.g. "post-title", "post-featured-image"
  settings?: Record<string, string>;  // optional settings for the tag
}

/**
 * Generate an Elementor dynamic tag string.
 * Produces: [elementor-tag id="<8hex>" name="<tag>" settings="<url-encoded-JSON>"]
 */
export function dynamicTag(tag: string, settings?: Record<string, string>): string {
  const id = hex(8);
  const encodedSettings = settings ? encodeURIComponent(JSON.stringify(settings)) : "%7B%7D";
  return `[elementor-tag id="${id}" name="${tag}" settings="${encodedSettings}"]`;
}
export const bool = (value: boolean): TypedValue<boolean> => ({ $$type: "boolean", value });
export const num = (value: number): TypedValue<number> => ({ $$type: "number", value });
export const url = (value: string): TypedValue<string> => ({ $$type: "url", value });

const SIZE_UNITS = ["rem", "px", "em", "%", "vh", "vw", "vmin", "vmax", "ch", "fr"];

/**
 * Parse a CSS size into the { unit, size } shape.
 * Accepts numbers (treated as px), or strings like "3rem", "100%", "16px".
 */
export function parseSize(input: number | string): SizeValue {
  if (typeof input === "number") return { unit: "px", size: input };
  const trimmed = input.trim();
  const match = trimmed.match(/^(-?\d*\.?\d+)\s*([a-z%]*)$/i);
  if (!match) throw new Error(`Cannot parse size: "${input}"`);
  const size = parseFloat(match[1]);
  let unit = (match[2] || "px").toLowerCase();
  if (!SIZE_UNITS.includes(unit)) unit = "px";
  return { unit, size };
}

export const size = (input: number | string): TypedValue<SizeValue> => ({
  $$type: "size",
  value: parseSize(input),
});

export function dimensions(input: number | { top?: number; right?: number; bottom?: number; left?: number }): TypedValue<DimensionsValue> {
  let top: number, right: number, bottom: number, left: number;
  if (typeof input === "object") {
    top = input.top ?? 0;
    right = input.right ?? 0;
    bottom = input.bottom ?? 0;
    left = input.left ?? 0;
  } else {
    top = right = bottom = left = input;
  }
  return {
    $$type: "dimensions",
    value: {
      "block-start": size(top),
      "inline-end": size(right),
      "block-end": size(bottom),
      "inline-start": size(left),
    },
  };
}

export const classes = (names: string[]): TypedValue<string[]> => ({ $$type: "classes", value: names });

/** Color value (atomic "color" prop type): a plain CSS color string. */
export const color = (value: string): TypedValue<string> => ({ $$type: "color", value });

/**
 * Border-radius value (atomic "border-radius" prop type).
 * Logical corners: start-start = top-left, start-end = top-right,
 * end-start = bottom-left, end-end = bottom-right.
 */
export function borderRadius(input: number | string | { topLeft?: number | string; topRight?: number | string; bottomRight?: number | string; bottomLeft?: number | string }): TypedValue<Record<string, TypedValue<SizeValue>>> {
  let tl: number | string, tr: number | string, br: number | string, bl: number | string;
  if (typeof input === "object") {
    tl = input.topLeft ?? 0;
    tr = input.topRight ?? 0;
    br = input.bottomRight ?? 0;
    bl = input.bottomLeft ?? 0;
  } else {
    tl = tr = br = bl = input;
  }
  return {
    $$type: "border-radius",
    value: {
      "start-start": size(tl),
      "start-end": size(tr),
      "end-start": size(bl),
      "end-end": size(br),
    },
  };
}

/** Rich-text value used by headings, paragraphs, button labels, etc. */
export const htmlV3 = (text: string): TypedValue<HtmlV3Value> => ({
  $$type: "html-v3",
  value: { content: str(text), children: [] },
});

/**
 * Image value pointing at an external URL (no media-library id).
 *
 * `alt` is included when provided. Real exports of external-URL images only
 * carry { src, size } (alt normally rides on the media-library attachment),
 * so this is an additive, best-effort hint: harmless if the editor ignores it,
 * and the WordPress plugin layer can set the true attachment alt on import.
 */
export function image(srcUrl: string, sizeName = "large", alt?: string): TypedValue<ImageValue> {
  const value: ImageValue = {
    src: { $$type: "image-src", value: { id: null, url: url(srcUrl) } },
    size: str(sizeName),
  };
  if (alt && alt.trim()) value.alt = str(alt.trim());
  return { $$type: "image", value };
}

export const stringArray = (values: string[]): TypedValue<TypedValue<string>[]> => ({
  $$type: "string-array",
  value: values.map(str),
});

export const keyValue = (key: string, value: string): TypedValue<{ key: TypedValue<string>; value: TypedValue<string> }> => ({
  $$type: "key-value",
  value: { key: str(key), value: str(value) },
});

export const options = (pairs: { key: string; value: string }[]): TypedValue<TypedValue<{ key: TypedValue<string>; value: TypedValue<string> }>[]> => ({
  $$type: "options",
  value: pairs.map((p) => keyValue(p.key, p.value)),
});

/**
 * Link value (atomic "link" prop type).
 * Shape (from Elementor source): { destination: url, isTargetBlank: boolean, tag: "a"|"button" }.
 */
export function link(opts: { href: string; targetBlank?: boolean; tag?: string }): TypedValue<LinkValue> {
  const value: LinkValue = {
    destination: url(opts.href),
    isTargetBlank: bool(opts.targetBlank ?? false),
  };
  if (opts.tag) value.tag = str(opts.tag);
  return { $$type: "link", value };
}

/** SVG source value (atomic "svg-src" prop type): { id, url }. */
export function svgSrc(srcUrl: string): TypedValue<{ id: null; url: TypedValue<string> }> {
  return { $$type: "svg-src", value: { id: null, url: url(srcUrl) } };
}

/** Self-hosted video source value (atomic "video-src" prop type): { id, url }. */
export function videoSrc(srcUrl: string): TypedValue<{ id: null; url: TypedValue<string> }> {
  return { $$type: "video-src", value: { id: null, url: url(srcUrl) } };
}

export function email(opts: { to: string; subject?: string }): TypedValue<{ to: TypedValue<string>; subject?: TypedValue<string> }> {
  const value: { to: TypedValue<string>; subject?: TypedValue<string> } = { to: str(opts.to) };
  if (opts.subject) value.subject = str(opts.subject);
  return { $$type: "email", value };
}

/**
 * Time-size value (atomic "time-size" prop type): { unit: "ms"|"s", size }.
 * Used for interaction duration/delay. Accepts numbers (ms) or strings like "600ms", "2s".
 */
export function timeSize(input: number | string): TypedValue<SizeValue> {
  if (typeof input === "number") return { $$type: "time-size", value: { unit: "ms", size: input } };
  const trimmed = input.trim();
  const match = trimmed.match(/^(-?\d*\.?\d+)\s*(ms|s)$/i);
  if (!match) return { $$type: "time-size", value: parseSize(input) };
  return { $$type: "time-size", value: { unit: match[2].toLowerCase(), size: parseFloat(match[1]) } };
}

// ---------------------------------------------------------------------------
// Background (atomic "background" prop type)
// ---------------------------------------------------------------------------

/**
 * Create a background value (atomic "background" prop type).
 * When given a CSS color string, creates a "classic" (solid) background.
 * When given an object, passes through as the structured background type.
 */
export function background(
  input: string | {
    background_type?: string;
    color?: string;
    gradient_first_color?: string;
    gradient_second_color?: string;
    gradient_angle?: number | string;
    gradient_position?: string;
    background_image?: string;
    background_size?: string;
    background_position?: string;
    background_repeat?: string;
    background_attachment?: string;
  }
): TypedValue<BackgroundValue> {
  if (typeof input === "string") {
    return {
      $$type: "background",
      value: {
        background_type: str("classic"),
        color: str(input),
      },
    };
  }
  const value: BackgroundValue = {
    background_type: str(input.background_type ?? "classic"),
  };
  if (input.color !== undefined) value.color = str(input.color);
  if (input.gradient_first_color !== undefined) value.gradient_first_color = str(input.gradient_first_color);
  if (input.gradient_second_color !== undefined) value.gradient_second_color = str(input.gradient_second_color);
  if (input.gradient_angle !== undefined) value.gradient_angle = size(input.gradient_angle);
  if (input.gradient_position !== undefined) value.gradient_position = str(input.gradient_position);
  if (input.background_image !== undefined) {
    value.background_image = { $$type: "image-src", value: { id: null, url: url(input.background_image) } };
  }
  if (input.background_size !== undefined) value.background_size = str(input.background_size);
  if (input.background_position !== undefined) value.background_position = str(input.background_position);
  if (input.background_repeat !== undefined) value.background_repeat = str(input.background_repeat);
  if (input.background_attachment !== undefined) value.background_attachment = str(input.background_attachment);
  return { $$type: "background", value };
}

// ---------------------------------------------------------------------------
// Box Shadow (atomic "box-shadow" prop type)
// ---------------------------------------------------------------------------

/**
 * Parse a CSS box-shadow string into the structured box-shadow format.
 * Supports: "h v blur spread color", "h v blur color", "h v color", "inset h v blur spread color", etc.
 */
export function parseBoxShadow(cssValue: string): BoxShadowValue {
  const trimmed = cssValue.trim();
  let position = "";
  let rest = trimmed;

  // Check for "inset" prefix
  if (rest.startsWith("inset")) {
    position = "inset";
    rest = rest.slice(5).trim();
  }

  // Split on whitespace, but handle rgba/hsla values with spaces
  // Simple approach: split by spaces, rejoin color parts
  const parts = rest.split(/\s+/).filter(Boolean);

  // We need at least 3 parts: h v color, or 4: h v blur color, or 5: h v blur spread color
  // Color could be a named color, hex, rgb(), rgba(), hsl(), hsla()
  // For simplicity, the last 1-3 parts that look like a color are the color
  let colorStr: string;
  let h: string, v: string, blur: string, spread: string;

  if (parts.length >= 5) {
    // h v blur spread color
    h = parts[0];
    v = parts[1];
    blur = parts[2];
    spread = parts[3];
    colorStr = parts.slice(4).join(" ");
  } else if (parts.length === 4) {
    // h v blur color
    h = parts[0];
    v = parts[1];
    blur = parts[2];
    spread = "0";
    colorStr = parts[3];
  } else if (parts.length === 3) {
    // h v color
    h = parts[0];
    v = parts[1];
    blur = "0";
    spread = "0";
    colorStr = parts[2];
  } else {
    throw new Error(`Cannot parse box-shadow value: "${cssValue}"`);
  }

  const result: BoxShadowValue = {
    horizontal: size(h),
    vertical: size(v),
    blur: size(blur),
    spread: size(spread),
    color: str(colorStr),
  };
  if (position) result.position = str(position);
  return result;
}

export function boxShadow(input: string | BoxShadowValue): TypedValue<BoxShadowValue> {
  if (typeof input === "string") {
    return { $$type: "box-shadow", value: parseBoxShadow(input) };
  }
  return { $$type: "box-shadow", value: input };
}

// ---------------------------------------------------------------------------
// custom_css (raw CSS, stored base64-encoded)
// ---------------------------------------------------------------------------

export function encodeCustomCss(rawCss: string): CustomCssValue {
  return { raw: Buffer.from(rawCss, "utf-8").toString("base64") };
}

export function decodeCustomCss(raw: string): string {
  return Buffer.from(raw, "base64").toString("utf-8");
}