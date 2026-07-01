/**
 * Classic format compiler — outputs flat settings Elementor JSON.
 *
 * This is a parallel compiler path that produces the "classic" / "container"
 * format used by the vast majority of real-world Elementor templates. Instead
 * of $$type-wrapped values and a styles/variants model, it emits:
 *
 *   - Flat settings: {"title": "Hello", "title_color": "#FFF"}
 *   - Classic widget types: heading, text-editor, button, image, icon, etc.
 *   - Container elType for layout (with section/column as a legacy option)
 *   - Responsive via _tablet/_mobile suffixes
 *   - Hover via hover_* prefixed settings
 *   - Motion via flat _animation, motion_fx_* settings
 *   - 7-char hex IDs
 *
 * The compiler shares token resolution, template expansion, and motion
 * compilation with the atomic path — only the output formatting differs.
 */
import {
  Blueprint,
  BlueprintNode,
  CompileCtx,
  PopupSettings,
  CompiledDocument,
} from "./compiler.js";
import { resolveStyle } from "./styling.js";
import { resolveTokens, resolveTheme } from "./theme.js";
import { expandTemplates } from "./templates.js";
import { WIDGET_BY_TYPE } from "./widgets.js";
import { compileMotionSettings, MotionSpec } from "./motion.js";
import { KeyframeSpec } from "./types.js";
import { dynamicTag as dynamicTagStr, DynamicTag } from "./elementor/primitives.js";

// ---------------------------------------------------------------------------
// Widget type mapping: atomic e-* → classic flat names
// ---------------------------------------------------------------------------

const CLASSIC_WIDGET_MAP: Record<string, string> = {
  "e-heading": "heading",
  "e-paragraph": "text-editor",
  "e-button": "button",
  "e-image": "image",
  "e-svg": "icon",
  "e-divider": "divider",
  "e-html": "html",
  "e-icon": "icon",
  "e-icon-list": "icon-list",
  "e-image-box": "image-box",
  "e-social-icons": "social-icons",
  "e-accordion": "accordion",
  "e-youtube": "youtube",
  "e-self-hosted-video": "video",
  "e-form": "form",
  "e-form-input": "form-input",
  "e-form-label": "form-label",
  "e-form-textarea": "form-textarea",
  "e-form-select": "form-select",
  "e-form-submit-button": "form-submit-button",
  "e-form-checkbox": "form-checkbox",
  "e-form-radio-button": "form-radio-button",
  "e-form-date-picker": "form-date-picker",
  "e-form-time-picker": "form-time-picker",
  "e-form-file-upload": "form-file-upload",
  "e-tabs": "tabs",
  // Classic Pro widgets keep the same names
  "price-table": "price-table",
  "nav-menu": "nav-menu",
  "loop-grid": "loop-grid",
  posts: "posts",
  login: "login",
  reviews: "reviews",
  rating: "rating",
  "animated-headline": "animated-headline",
  slides: "slides",
  "media-carousel": "media-carousel",
  portfolio: "portfolio",
  "call-to-action": "call-to-action",
};

// ---------------------------------------------------------------------------
// ID generation — 7-char hex
// ---------------------------------------------------------------------------

function hex7(): string {
  let s = "";
  while (s.length < 7) s += Math.floor(Math.random() * 16).toString(16);
  return s.slice(0, 7);
}

// ---------------------------------------------------------------------------
// CSS size parsing helpers
// ---------------------------------------------------------------------------

/** Parse a CSS size string like "14px", "1.5rem", "100%" into {unit, size}. */
function parseCssSize(input: string | number): { unit: string; size: number } | undefined {
  if (typeof input === "number") return { unit: "px", size: input };
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim();
  const match = trimmed.match(/^(-?\d*\.?\d+)\s*([a-z%]*)$/i);
  if (!match) return undefined;
  const size = parseFloat(match[1]);
  const unit = (match[2] || "px").toLowerCase();
  return { unit, size };
}

/** Convert a CSS size to the Elementor flat format: {"unit":"px","size":14}. */
function toSizeObj(input: string | number): { unit: string; size: number } | undefined {
  return parseCssSize(input);
}

/**
 * Convert a padding/margin/border-width value to the classic dimension object:
 * {"unit":"px","top":"0","right":"0","bottom":"0","left":"0","isLinked":true}
 */
function toDimensionObj(
  input: number | string | { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string } | undefined,
  defaultUnit = "px",
): Record<string, unknown> | undefined {
  if (input === undefined) return undefined;
  if (typeof input === "number") {
    return { unit: defaultUnit, top: String(input), right: String(input), bottom: String(input), left: String(input), isLinked: true };
  }
  if (typeof input === "string") {
    const parsed = parseCssSize(input);
    if (parsed) return { unit: parsed.unit, top: String(parsed.size), right: String(parsed.size), bottom: String(parsed.size), left: String(parsed.size), isLinked: true };
    return undefined;
  }
  // Object with top/right/bottom/left
  const top = parseDimValue(input.top, defaultUnit);
  const right = parseDimValue(input.right, defaultUnit);
  const bottom = parseDimValue(input.bottom, defaultUnit);
  const left = parseDimValue(input.left, defaultUnit);
  const isLinked = top === right && right === bottom && bottom === left;
  return { unit: defaultUnit, top, right, bottom, left, isLinked };
}

/** Parse a dimension value string (e.g. "4rem") to its numeric string in the default unit. */
function parseDimValue(input: number | string | undefined, defaultUnit: string): string {
  if (input === undefined) return "0";
  if (typeof input === "number") return String(input);
  const parsed = parseCssSize(input);
  if (!parsed) return String(input);
  // Convert to the default unit if possible (rem → px by multiplying by 16)
  if (parsed.unit === defaultUnit) return String(parsed.size);
  if (defaultUnit === "px" && parsed.unit === "rem") return String(parsed.size * 16);
  if (defaultUnit === "px" && parsed.unit === "em") return String(parsed.size * 16);
  return String(parsed.size);
}

/**
 * Convert a border-radius value to the classic dimension object.
 * Accepts a single size or {topLeft, topRight, bottomRight, bottomLeft}.
 */
function toBorderRadiusObj(
  input: number | string | { topLeft?: number | string; topRight?: number | string; bottomRight?: number | string; bottomLeft?: number | string } | undefined,
  defaultUnit = "px",
): Record<string, unknown> | undefined {
  if (input === undefined) return undefined;
  if (typeof input === "number" || typeof input === "string") {
    const parsed = parseCssSize(input);
    if (parsed) return { unit: parsed.unit, top: String(parsed.size), right: String(parsed.size), bottom: String(parsed.size), left: String(parsed.size), isLinked: true };
    return undefined;
  }
  const tl = input.topLeft !== undefined ? String(input.topLeft) : "0";
  const tr = input.topRight !== undefined ? String(input.topRight) : "0";
  const br = input.bottomRight !== undefined ? String(input.bottomRight) : "0";
  const bl = input.bottomLeft !== undefined ? String(input.bottomLeft) : "0";
  return { unit: defaultUnit, top: tl, right: tr, bottom: br, left: bl, isLinked: tl === tr && tr === br && br === bl };
}

// ---------------------------------------------------------------------------
// Classic element node type
// ---------------------------------------------------------------------------

interface ClassicElement {
  id: string;
  elType: string;
  widgetType?: string;
  settings: Record<string, unknown>;
  elements: ClassicElement[];
}

// ---------------------------------------------------------------------------
// Style → flat settings conversion
// ---------------------------------------------------------------------------

/** Determine the color setting key based on widget type. */
function colorKeyForWidget(widgetType: string): string {
  switch (widgetType) {
    case "heading": return "title_color";
    case "text-editor": return "text_color";
    case "button": return "button_text_color";
    case "icon": return "icon_color";
    case "icon-list": return "text_color";
    case "divider": return "color";
    default: return "text_color";
  }
}

/** Determine the typography font size key (usually typography_font_size). */
function typographyKey(prop: string): string {
  return `typography_${prop}`;
}

interface FlatStyleResult {
  settings: Record<string, unknown>;
  cssClasses?: string;
}

/**
 * Convert a style spec into flat Elementor settings.
 *
 * This is the core difference from the atomic path: instead of building a
 * styles object with variants, we emit flat keys like:
 *   typography_font_size, title_color, background_color, padding, etc.
 *
 * Responsive variants are emitted as key_tablet / key_mobile suffixes.
 * Hover variants are emitted as hover_* prefixed keys.
 */
function styleToFlatSettings(
  spec: Record<string, unknown> | undefined,
  widgetType: string,
): FlatStyleResult {
  const settings: Record<string, unknown> = {};
  let cssClasses: string | undefined;
  if (!spec) return { settings };

  // Process desktop (base) styles
  const baseResult = resolveFlatStyleLevel(spec, widgetType);
  Object.assign(settings, baseResult.settings);
  if (baseResult.cssClasses) cssClasses = baseResult.cssClasses;

  // Process responsive: tablet
  if (spec.tablet && typeof spec.tablet === "object") {
    const tabletResult = resolveFlatStyleLevel(spec.tablet as Record<string, unknown>, widgetType);
    for (const [key, val] of Object.entries(tabletResult.settings)) {
      settings[`${key}_tablet`] = val;
    }
  }

  // Process responsive: mobile
  if (spec.mobile && typeof spec.mobile === "object") {
    const mobileResult = resolveFlatStyleLevel(spec.mobile as Record<string, unknown>, widgetType);
    for (const [key, val] of Object.entries(mobileResult.settings)) {
      settings[`${key}_mobile`] = val;
    }
  }

  // Process hover
  if (spec.hover && typeof spec.hover === "object") {
    const hoverResult = resolveFlatStyleLevel(spec.hover as Record<string, unknown>, widgetType, true);
    for (const [key, val] of Object.entries(hoverResult.settings)) {
      settings[`hover_${key}`] = val;
    }
  }

  return { settings, cssClasses };
}

/** Convert a single level of style props (desktop/tablet/mobile/hover) to flat settings. */
function resolveFlatStyleLevel(
  spec: Record<string, unknown>,
  widgetType: string,
  isHover = false,
): FlatStyleResult {
  const settings: Record<string, unknown> = {};
  let cssClasses: string | undefined;
  const cKey = isHover ? "color" : colorKeyForWidget(widgetType);
  const hasTypography = new Set<string>();

  for (const [rawKey, value] of Object.entries(spec)) {
    // Skip responsive/hover sub-objects (handled at higher level)
    if (rawKey === "tablet" || rawKey === "mobile" || rawKey === "hover" || rawKey === "widescreen") continue;
    if (value === undefined) continue;

    const key = toKebab(rawKey);

    switch (key) {
      case "font-size":
        settings["typography_font_size"] = toSizeObj(value as string | number) ?? value;
        hasTypography.add("font_size");
        break;
      case "font-family":
        settings["typography_font_family"] = String(value);
        hasTypography.add("font_family");
        break;
      case "font-weight":
        settings["typography_font_weight"] = String(value);
        hasTypography.add("font_weight");
        break;
      case "text-align":
        settings["align"] = String(value);
        break;
      case "letter-spacing":
        settings["typography_letter_spacing"] = toSizeObj(value as string | number) ?? value;
        hasTypography.add("letter_spacing");
        break;
      case "line-height":
        settings["typography_line_height"] = toSizeObj(value as string | number) ?? value;
        hasTypography.add("line_height");
        break;
      case "text-transform":
        settings["typography_text_transform"] = String(value);
        hasTypography.add("text_transform");
        break;
      case "color":
        settings[cKey] = String(value);
        break;
      case "background":
        if (typeof value === "string") {
          // Solid color background
          settings["background_background"] = "classic";
          settings["background_color"] = String(value);
        } else if (value && typeof value === "object") {
          // Structured background (gradient, image, etc.)
          const bg = value as Record<string, unknown>;
          const bgType = (bg.background_type as string) ?? (bg.type as string) ?? "classic";
          settings["background_background"] = bgType;
          if (bg.color !== undefined) settings["background_color"] = String(bg.color);
          if (bg.gradient_first_color !== undefined) settings["background_color"] = String(bg.gradient_first_color);
          if (bg.gradient_second_color !== undefined) settings["background_color_b"] = String(bg.gradient_second_color);
          if (bg.gradient_angle !== undefined) {
            const angleParsed = parseCssSize(bg.gradient_angle as string | number);
            settings["background_gradient_angle"] = angleParsed ?? { unit: "deg", size: Number(bg.gradient_angle) };
          }
          if (bg.background_image !== undefined) {
            settings["background_image"] = { id: null, url: String(bg.background_image) };
          }
        }
        break;
      case "background-color":
        settings["background_background"] = settings["background_background"] ?? "classic";
        settings["background_color"] = String(value);
        break;
      case "border-radius":
        settings["border_radius"] = toBorderRadiusObj(value as number | string | { topLeft?: number | string; topRight?: number | string; bottomRight?: number | string; bottomLeft?: number | string });
        break;
      case "padding": {
        const dim = toDimensionObj(value as number | string | { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string });
        if (dim) settings["padding"] = dim;
        break;
      }
      case "margin": {
        const dim = toDimensionObj(value as number | string | { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string });
        if (dim) settings["margin"] = dim;
        break;
      }
      case "gap": {
        const parsed = parseCssSize(value as string | number);
        if (parsed) {
          settings["flex_gap"] = { column: String(parsed.size), row: String(parsed.size), unit: parsed.unit, size: parsed.size };
        }
        break;
      }
      case "width": {
        const parsed = parseCssSize(value as string | number);
        if (parsed) settings["width"] = parsed;
        break;
      }
      case "max-width": {
        const parsed = parseCssSize(value as string | number);
        if (parsed) settings["max_width"] = parsed;
        break;
      }
      case "min-height": {
        const parsed = parseCssSize(value as string | number);
        if (parsed) settings["min_height"] = parsed;
        break;
      }
      case "height": {
        const parsed = parseCssSize(value as string | number);
        if (parsed) settings["height"] = parsed;
        break;
      }
      case "flex-direction":
        settings["flex_direction"] = String(value);
        break;
      case "flex-wrap":
        settings["flex_wrap"] = String(value);
        break;
      case "justify-content":
        settings["flex_justify_content"] = String(value);
        break;
      case "align-items":
        settings["flex_align_items"] = String(value);
        break;
      case "align-content":
        settings["flex_align_content"] = String(value);
        break;
      case "box-shadow":
        // Route to custom CSS since classic box-shadow flat format is complex
        settings["_css_classes"] = settings["_css_classes"] ?? "";
        // We'll store as raw CSS via a css string if present
        break;
      case "opacity": {
        const parsed = parseCssSize(value as string | number);
        if (parsed) settings["opacity"] = parsed;
        break;
      }
      case "display":
        // Container display is handled by flex settings
        if (String(value) === "flex") settings["flex_direction"] = settings["flex_direction"] ?? "row";
        break;
      case "css":
        // Raw CSS string — emit as css_classes or custom_css
        // We'll append it to a custom_css field that the node can use
        if (typeof value === "string") {
          const cssText = value.trim();
          if (cssText.startsWith(".")) {
            // Looks like a CSS class name
            cssClasses = cssText.replace(/^\./, "").split(/\s+/)[0];
          }
        }
        break;
      case "css-classes":
      case "css_classes":
        cssClasses = String(value);
        break;
      default:
        // Unknown props: try to emit as flat with the kebab key
        if (value !== null && typeof value !== "object") {
          settings[key.replace(/-/g, "_")] = String(value);
        }
        break;
    }
  }

  // Set typography_typography: "custom" when any typography prop is present
  if (hasTypography.size > 0) {
    settings["typography_typography"] = "custom";
  }

  return { settings, cssClasses };
}

/** Convert camelCase to kebab-case. */
function toKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

// ---------------------------------------------------------------------------
// Classic node compilation
// ---------------------------------------------------------------------------

function compileClassicChildren(children: BlueprintNode[] | undefined, ctx?: CompileCtx): ClassicElement[] {
  return (children ?? []).map((child) => compileClassicNode(child, ctx));
}

function compileClassicNode(node: BlueprintNode, ctx?: CompileCtx): ClassicElement {
  // Global widget resolution
  if (node.global && ctx?.globals) {
    const globalDef = ctx.globals[node.global];
    if (globalDef) {
      const merged = { ...globalDef, ...node } as BlueprintNode;
      delete (merged as Partial<BlueprintNode>).global;
      return compileClassicNode(merged, ctx);
    }
  }

  // Collect node-level keyframes
  if (node.keyframes && node.keyframes.length > 0 && ctx) {
    if (!ctx.collectedKeyframes) ctx.collectedKeyframes = [];
    for (const kf of node.keyframes) {
      if (!ctx.collectedKeyframes.some((k) => k.name === kf.name)) {
        ctx.collectedKeyframes.push(kf);
      }
    }
  }

  const id = hex7();
  const info = WIDGET_BY_TYPE[node.type];
  if (!info) {
    throw new Error(`Unknown node type "${node.type}". Known types: ${Object.keys(WIDGET_BY_TYPE).join(", ")}`);
  }

  // Raw escape hatch
  if (node.type === "raw") {
    if (!node.node || typeof node.node !== "object") {
      throw new Error(`"raw" node requires a "node" object holding Elementor JSON.`);
    }
    const raw = { ...node.node } as ClassicElement;
    if (!raw.id) raw.id = hex7();
    return raw;
  }

  // Compile motion settings (flat — same as atomic path's motion settings)
  const motionSettings: Record<string, unknown> = {};
  if (node.motion) {
    Object.assign(motionSettings, compileMotionSettings(node.motion as MotionSpec));
  }

  // Compile dynamic tags
  const dynamicSettings: Record<string, string> = {};
  if (node.dynamic) {
    for (const [key, dt] of Object.entries(node.dynamic)) {
      dynamicSettings[key] = dynamicTagStr((dt as DynamicTag).tag, (dt as DynamicTag).settings);
    }
  }

  // Merge extra settings
  const extra = node.settings ?? {};
  const mergedExtra = { ...motionSettings, ...extra };
  if (Object.keys(dynamicSettings).length > 0) {
    mergedExtra["__dynamic__"] = dynamicSettings;
  }

  // Determine the classic widget type
  const atomicWidgetType = info.maps_to;
  const classicWidgetType = CLASSIC_WIDGET_MAP[atomicWidgetType] ?? atomicWidgetType;

  switch (info.type) {
    // ---- Layout ----
    case "section": {
      // Section → container (modern classic format)
      const styleResult = styleToFlatSettings(node.style, "container");
      const settings: Record<string, unknown> = { ...mergedExtra, ...styleResult.settings };
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      const children = compileClassicChildren(node.children, ctx);
      return { id, elType: "container", settings, elements: children };
    }
    case "flex": {
      const styleResult = styleToFlatSettings(node.style, "container");
      const settings: Record<string, unknown> = { ...mergedExtra, ...styleResult.settings };
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      // Ensure flex_direction is set
      if (!settings["flex_direction"]) {
        const dir = node.type === "row" ? "row" : node.type === "column" || node.type === "stack" ? "column" : node.direction;
        if (dir) settings["flex_direction"] = dir;
      }
      const children = compileClassicChildren(node.children, ctx);
      return { id, elType: "container", settings, elements: children };
    }
    case "spacer": {
      const style = { height: node.height ?? "2rem", ...(node.style ?? {}) } as Record<string, unknown>;
      const styleResult = styleToFlatSettings(style, "container");
      const settings: Record<string, unknown> = { ...mergedExtra, ...styleResult.settings };
      return { id, elType: "container", settings, elements: [] };
    }

    // ---- Content widgets ----
    case "heading": {
      const level = node.level && node.level >= 1 && node.level <= 6 ? node.level : undefined;
      const tag = node.tag ?? (level ? `h${level}` : "h2");
      const settings: Record<string, unknown> = {
        title: node.text ?? "",
        header_size: tag,
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "heading");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "heading", settings, elements: [] };
    }
    case "text": {
      const settings: Record<string, unknown> = {
        editor: `<p>${node.text ?? ""}</p>`,
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "text-editor");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "text-editor", settings, elements: [] };
    }
    case "button": {
      const settings: Record<string, unknown> = {
        text: node.text ?? "Button",
        ...mergedExtra,
      };
      if (node.href) {
        settings["link"] = { url: node.href, is_external: node.targetBlank ?? false };
      }
      const styleResult = styleToFlatSettings(node.style, "button");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "button", settings, elements: [] };
    }
    case "image": {
      if (!node.src) throw new Error(`image node requires "src".`);
      const settings: Record<string, unknown> = {
        image: { url: node.src, id: null },
        image_size: node.size ?? "large",
        ...mergedExtra,
      };
      if (node.alt) settings["alt"] = node.alt;
      const styleResult = styleToFlatSettings(node.style, "image");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "image", settings, elements: [] };
    }
    case "svg":
    case "icon": {
      const settings: Record<string, unknown> = {
        selected_icon: { value: node.iconName ?? "fa-star", library: node.library ?? "fa-solid" },
        ...mergedExtra,
      };
      if (node.src) {
        // SVG source
        settings["icon_svg"] = { url: node.src, id: null };
      }
      if (node.link) {
        settings["link"] = { url: (node.link as { href: string }).href, is_external: (node.link as { targetBlank?: boolean }).targetBlank ?? false };
      }
      const styleResult = styleToFlatSettings(node.style, "icon");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "icon", settings, elements: [] };
    }
    case "divider": {
      const settings: Record<string, unknown> = { ...mergedExtra };
      const styleResult = styleToFlatSettings(node.style, "divider");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "divider", settings, elements: [] };
    }
    case "youtube": {
      const settings: Record<string, unknown> = {
        link: node.src ?? "",
        video_type: "youtube",
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "youtube");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "youtube", settings, elements: [] };
    }
    case "video": {
      const settings: Record<string, unknown> = {
        video_type: "hosted",
        ...(node.src ? { link: { url: node.src, id: null } } : {}),
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "video");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "video", settings, elements: [] };
    }
    case "html": {
      const settings: Record<string, unknown> = {
        html: node.html ?? "",
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "html");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "html", settings, elements: [] };
    }
    case "icon-list": {
      const items = (node.items ?? []).map((item: Record<string, unknown>) => ({
        _id: hex7(),
        text: String(item.text ?? ""),
        selected_icon: { value: String(item.iconName ?? "fa-check"), library: "fa-solid" },
        ...(item.link ? { link: { url: (item.link as { href: string }).href, is_external: (item.link as { targetBlank?: boolean }).targetBlank ?? false } } : {}),
      }));
      const settings: Record<string, unknown> = {
        icon_list: items,
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "icon-list");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "icon-list", settings, elements: [] };
    }
    case "image-box": {
      const img = node.image as { src: string; alt?: string } | undefined;
      const hdg = node.heading as { text: string; tag?: string } | undefined;
      const settings: Record<string, unknown> = {
        ...(img ? { image: { url: img.src, id: null } } : {}),
        ...(hdg ? { title_text: hdg.text, title_tag: hdg.tag ?? "h3" } : {}),
        ...(node.description ? { description_text: node.description } : {}),
        ...(node.link ? { link: { url: (node.link as { href: string }).href, is_external: (node.link as { targetBlank?: boolean }).targetBlank ?? false } } : {}),
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "image-box");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "image-box", settings, elements: [] };
    }
    case "social-icons": {
      const items = (node.items ?? []).map((item: Record<string, unknown>) => ({
        _id: hex7(),
        social_icon: String(item.iconName ?? "fa-facebook"),
        url: String(item.url ?? "#"),
        ...(item.label ? { label: String(item.label) } : {}),
      }));
      const settings: Record<string, unknown> = {
        social_icon_list: items,
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "social-icons");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "social-icons", settings, elements: [] };
    }
    case "accordion": {
      const items = (node.items ?? []).map((item: Record<string, unknown>) => ({
        _id: hex7(),
        tab_title: String(item.label ?? ""),
        tab_content: String(item.content ?? ""),
        ...(item.defaultActive ? { default_active: true } : {}),
      }));
      const settings: Record<string, unknown> = {
        tabs: items,
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "accordion");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "accordion", settings, elements: [] };
    }

    // ---- Form widgets ----
    case "form": {
      const settings: Record<string, unknown> = {
        form_name: node.name ?? "Form",
        form_fields: [],
        ...mergedExtra,
      };
      if (node.email) {
        settings["email_to"] = (node.email as { to: string }).to;
        if ((node.email as { subject?: string }).subject) {
          settings["email_subject"] = (node.email as { subject?: string }).subject;
        }
      }
      const styleResult = styleToFlatSettings(node.style, "form");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      const children = compileClassicChildren(node.children, ctx);
      return { id, elType: "container", widgetType: "form", settings, elements: children };
    }
    case "form-label": {
      const settings: Record<string, unknown> = {
        label: node.text ?? "",
        ...(node.for ? { input_id: node.for } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-label", settings, elements: [] };
    }
    case "input": {
      const settings: Record<string, unknown> = {
        field_type: node.inputType ?? "text",
        placeholder: node.placeholder ?? "",
        required: node.required ?? false,
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-input", settings, elements: [] };
    }
    case "textarea": {
      const settings: Record<string, unknown> = {
        placeholder: node.placeholder ?? "",
        required: node.required ?? false,
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-textarea", settings, elements: [] };
    }
    case "select": {
      const settings: Record<string, unknown> = {
        ...(node.options ? { options: node.options } : {}),
        required: node.required ?? false,
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-select", settings, elements: [] };
    }
    case "submit": {
      const settings: Record<string, unknown> = {
        text: node.text ?? "Submit",
        ...mergedExtra,
      };
      const styleResult = styleToFlatSettings(node.style, "button");
      Object.assign(settings, styleResult.settings);
      if (styleResult.cssClasses) settings["css_classes"] = styleResult.cssClasses;
      return { id, elType: "widget", widgetType: "form-submit-button", settings, elements: [] };
    }
    case "checkbox": {
      const settings: Record<string, unknown> = {
        field_label: node.text ?? "",
        ...(node.fieldName ? { field_name: node.fieldName } : {}),
        ...(node.value ? { field_value: node.value } : {}),
        required: node.required ?? false,
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-checkbox", settings, elements: [] };
    }
    case "radio": {
      const settings: Record<string, unknown> = {
        field_label: node.text ?? "",
        ...(node.fieldName ? { field_name: node.fieldName } : {}),
        ...(node.value ? { field_value: node.value } : {}),
        required: node.required ?? false,
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-radio-button", settings, elements: [] };
    }
    case "date": {
      const settings: Record<string, unknown> = {
        placeholder: node.placeholder ?? "",
        required: node.required ?? false,
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-date-picker", settings, elements: [] };
    }
    case "time": {
      const settings: Record<string, unknown> = {
        placeholder: node.placeholder ?? "",
        required: node.required ?? false,
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-time-picker", settings, elements: [] };
    }
    case "file-upload": {
      const settings: Record<string, unknown> = {
        ...(node.fileTypes ? { file_types: node.fileTypes } : {}),
        required: node.required ?? false,
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      return { id, elType: "widget", widgetType: "form-file-upload", settings, elements: [] };
    }

    // ---- Tabs ----
    case "tabs": {
      const tabs = node.tabs ?? [];
      if (tabs.length === 0) throw new Error(`tabs node requires a non-empty "tabs" array.`);
      // Classic tabs: a tabs widget with items
      const items = tabs.map((t, i) => ({
        _id: hex7(),
        tab_title: t.label,
        ...(i === (node.defaultTab ?? 0) ? { is_active: true } : {}),
      }));
      const settings: Record<string, unknown> = {
        tabs: items,
        ...mergedExtra,
      };
      // Tab content as child containers
      const children = tabs.map((t) => {
        const childContent = compileClassicChildren(t.children, ctx);
        return { id: hex7(), elType: "container", settings: {}, elements: childContent } as ClassicElement;
      });
      return { id, elType: "widget", widgetType: "tabs", settings, elements: children };
    }

    // ---- Classic Pro widgets ----
    case "price-table":
    case "nav-menu":
    case "loop-grid":
    case "posts":
    case "login":
    case "reviews":
    case "rating":
    case "animated-headline":
    case "slides":
    case "carousel":
    case "portfolio":
    case "call-to-action":
    case "post-title":
    case "post-excerpt":
    case "post-content":
    case "featured-image":
    case "post-info":
    case "site-logo":
    case "site-title":
    case "page-title":
    case "author-box":
    case "search-bar":
    case "breadcrumbs":
    case "post-navigation":
    case "off-canvas":
    case "media-carousel":
    case "hotspot":
    case "code-highlight":
    case "video-playlist":
    case "text-path":
    case "link-in-bio":
    case "share-buttons": {
      // Classic Pro widgets: flat settings, no $$type
      const settings = normalizeClassicSettings({
        ...(node.props ?? {}),
      });
      return { id, elType: "widget", widgetType: classicWidgetType, settings, elements: [] };
    }

    default:
      throw new Error(`Node type "${node.type}" is recognized but not yet implemented in classic compiler.`);
  }
}

/** Auto-fill _id on array items in classic settings. */
function normalizeClassicSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(settings)) {
    if (Array.isArray(v)) {
      out[k] = v.map((item: unknown) =>
        item && typeof item === "object" && !Array.isArray(item)
          ? { ...(item as Record<string, unknown>), _id: (item as Record<string, unknown>)._id ?? hex7() }
          : item
      );
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Shared compilation helpers (same as atomic compiler)
// ---------------------------------------------------------------------------

function compilePopupSettings(popup?: PopupSettings): Record<string, unknown> {
  if (!popup) return {};
  const settings: Record<string, unknown> = {};
  const popupConfig: Record<string, unknown> = {};

  if (popup.triggers) {
    popupConfig.triggers = popup.triggers.map((t) => ({
      type: t.type,
      settings: t.settings ?? {},
    }));
  }
  if (popup.entranceAnimation) popupConfig.entrance_animation = popup.entranceAnimation;
  if (popup.exitAnimation) popupConfig.exit_animation = popup.exitAnimation;
  if (popup.timing) {
    popupConfig.timing = popup.timing.map((t) => ({
      type: t.type,
      settings: t.settings ?? {},
    }));
  }

  settings.popup = popupConfig;
  return settings;
}

type Condition = { include: string; name: string; sub_name?: string; sub_id?: string; sub_id2?: string };

const DEFAULT_CONDITIONS: Record<string, Condition[]> = {
  header: [{ include: "include", name: "general" }],
  footer: [{ include: "include", name: "general" }],
  single: [{ include: "include", name: "singular" }],
  archive: [{ include: "include", name: "archive" }],
};

function compileConditions(docType: string, userConditions?: Condition[]): Condition[] | undefined {
  if (docType === "page" || docType === "popup") return undefined;
  if (userConditions && userConditions.length > 0) return userConditions;
  return DEFAULT_CONDITIONS[docType] ?? undefined;
}

function compileThemeCssVars(theme: Record<string, unknown>): string {
  const parts: string[] = [];
  const colors = theme.colors as Record<string, string> | undefined;
  if (colors) {
    for (const [key, val] of Object.entries(colors)) {
      if (typeof val === "string") parts.push(`--color-${key}: ${val};`);
    }
  }
  const radius = theme.radius as Record<string, string> | undefined;
  if (radius) {
    for (const [key, val] of Object.entries(radius)) {
      if (typeof val === "string") parts.push(`--radius-${key}: ${val};`);
    }
  }
  const fonts = theme.fonts as Record<string, string> | undefined;
  if (fonts) {
    for (const [key, val] of Object.entries(fonts)) {
      if (typeof val === "string") parts.push(`--font-${key}: ${val};`);
    }
  }
  const shadow = theme.shadow as Record<string, string> | undefined;
  if (shadow) {
    for (const [key, val] of Object.entries(shadow)) {
      if (typeof val === "string") parts.push(`--shadow-${key}: ${val};`);
    }
  }
  return parts.join(" ");
}

function compileCssCustomProperties(
  userCssVars: Record<string, string> | undefined,
  theme: Record<string, unknown>,
): string | undefined {
  const themeVars = compileThemeCssVars(theme);
  const userParts: string[] = [];
  if (userCssVars) {
    for (const [key, val] of Object.entries(userCssVars)) {
      userParts.push(`--${key}: ${val};`);
    }
  }
  const allParts: string[] = [];
  if (themeVars.trim()) allParts.push(themeVars);
  if (userParts.length) allParts.push(userParts.join(" "));
  if (allParts.length === 0) return undefined;
  return `:root { ${allParts.join(" ")} }`;
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function compileKeyframe(kf: KeyframeSpec): string {
  const stepParts: string[] = [];
  for (const [selector, props] of Object.entries(kf.steps)) {
    const propParts: string[] = [];
    for (const [prop, val] of Object.entries(props)) {
      propParts.push(`${camelToKebab(prop)}: ${val};`);
    }
    stepParts.push(`${selector} { ${propParts.join(" ")} }`);
  }
  return `@keyframes ${kf.name} { ${stepParts.join(" ")} }`;
}

function compileKeyframes(keyframes: KeyframeSpec[] | undefined): string | undefined {
  if (!keyframes || keyframes.length === 0) return undefined;
  return keyframes.map(compileKeyframe).join(" ");
}

// ---------------------------------------------------------------------------
// Main entry: compileBlueprintClassic
// ---------------------------------------------------------------------------

/**
 * Compile a blueprint using the classic (flat settings) format.
 * Shares token resolution, template expansion, and motion compilation with
 * the atomic path — only the output formatting differs.
 */
export function compileBlueprintClassic(blueprint: Blueprint): CompiledDocument {
  const theme = resolveTheme(blueprint.theme);
  const expanded = expandTemplates(blueprint.tree);
  const resolvedTree = resolveTokens(expanded, theme);

  const ctx: CompileCtx = {
    globals: blueprint.globals,
    collectedKeyframes: [],
  };
  const content = resolvedTree.map((node) => compileClassicNode(node, ctx));

  const docType = blueprint.type ?? "page";

  // Build page_settings (same structure as atomic — works in both formats)
  let pageSettings: unknown[] | Record<string, unknown> = [];
  if (docType === "popup") {
    pageSettings = compilePopupSettings(blueprint.popup);
  }

  // CSS custom properties — same in both formats
  const cssCustomProperties = compileCssCustomProperties(blueprint.cssVars, theme);
  if (cssCustomProperties) {
    if (Array.isArray(pageSettings)) pageSettings = {};
    pageSettings.custom_css = cssCustomProperties;
    const inner = cssCustomProperties.replace(/^:root\s*\{\s*/, "").replace(/\s*\}\s*$/, "");
    pageSettings.css_custom_properties = inner;
  }

  // Keyframes — same in both formats
  const allKeyframes: KeyframeSpec[] = [
    ...(blueprint.keyframes ?? []),
    ...(ctx.collectedKeyframes ?? []),
  ];
  const keyframesCss = compileKeyframes(allKeyframes);
  if (keyframesCss) {
    if (Array.isArray(pageSettings)) pageSettings = {};
    if (pageSettings.custom_css) {
      pageSettings.custom_css = (pageSettings.custom_css as string) + " " + keyframesCss;
    } else {
      pageSettings.custom_css = keyframesCss;
    }
  }

  const conditions = compileConditions(docType, blueprint.conditions);

  return {
    content: content as unknown as CompiledDocument["content"],
    page_settings: pageSettings,
    version: "0.4",
    title: blueprint.title ?? "Untitled",
    type: docType,
    ...(conditions ? { conditions } : {}),
  };
}