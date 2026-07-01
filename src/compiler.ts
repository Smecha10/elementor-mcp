/**
 * Compiles a friendly blueprint into import-ready Elementor v4 JSON.
 */
import {
  genId,
  htmlV3,
  str,
  image,
  bool,
  link as linkValue,
  svgSrc,
  videoSrc,
  email as emailValue,
  options as optionsValue,
  stringArray,
  TypedValue,
  DynamicTag,
  dynamicTag as dynamicTagStr,
} from "./elementor/primitives.js";
import {
  buildStyle,
  widgetNode,
  layoutNode,
  classicWidgetNode,
  ElementNode,
  StyleObject,
  StyleVariantSpec,
} from "./elementor/nodes.js";
import { resolveStyle } from "./styling.js";
import { resolveTokens, resolveTheme, deepMerge } from "./theme.js";
import { WIDGET_BY_TYPE, WidgetInfo } from "./widgets.js";
import { expandTemplates } from "./templates.js";
import { compileMotion, MotionSpec } from "./motion.js";
import { KeyframeSpec } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Compilation context passed through the node tree. */
export interface CompileCtx {
  globals?: Record<string, BlueprintNode>;
  collectedKeyframes?: KeyframeSpec[];
}

export interface BlueprintNode {
  type: string;
  title?: string;
  style?: Record<string, unknown>;
  children?: BlueprintNode[];
  settings?: Record<string, unknown>;
  // Content widgets
  text?: string;
  level?: number;
  tag?: string;
  href?: string;
  targetBlank?: boolean;
  src?: string;
  alt?: string;
  size?: string;
  // Layout
  direction?: string;
  height?: string;
  // Form
  name?: string;
  email?: { to: string; subject?: string };
  for?: string;
  inputType?: string;
  placeholder?: string;
  required?: boolean;
  cssId?: string;
  fieldName?: string;
  value?: string;
  fileTypes?: string;
  options?: { key: string; value: string }[];
  // Tabs
  tabs?: { label: string; children?: BlueprintNode[] }[];
  defaultTab?: number;
  // Template expansion
  template?: string;
  params?: Record<string, unknown>;
  // Classic Pro
  props?: Record<string, unknown>;
  // Raw
  node?: ElementNode;
  // Icon
  iconName?: string;
  library?: string;
  link?: { href: string; targetBlank?: boolean };
  // Icon List
  items?: Record<string, unknown>[];
  // Image Box
  image?: { src: string; alt?: string };
  heading?: { text: string; tag?: string };
  description?: string;
  hover?: Record<string, unknown>;
  // Accordion
  accordionItems?: { label: string; content: string; defaultActive?: boolean }[];
  // HTML widget
  html?: string;
  // Motion effects
  motion?: MotionSpec;
  // Dynamic tags (__dynamic__)
  dynamic?: Record<string, DynamicTag>;
  // Global widget reference — looks up blueprint.globals[global] and merges
  global?: string;
  // Per-node keyframes (injected at page level into custom_css)
  keyframes?: KeyframeSpec[];
}

export interface Blueprint {
  title?: string;
  fileName?: string;
  theme?: Record<string, unknown>;
  tree: BlueprintNode[];
  type?: string; // "page" | "header" | "footer" | "single" | "archive" | "popup"
  seo?: Record<string, unknown>;
  // Popup settings (when type === "popup")
  popup?: PopupSettings;
  // Theme Builder conditions (for header/footer/single/archive types)
  conditions?: { include: string; name: string; sub_name?: string; sub_id?: string; sub_id2?: string }[];
  // CSS custom properties for dark mode / theme token injection
  // Keys are variable names (without the `--` prefix), values are CSS values.
  cssVars?: Record<string, string>;
  // @keyframes CSS animations injected into page_settings.custom_css
  keyframes?: KeyframeSpec[];
  // Named global widget definitions — nodes with `global: "name"` merge from here
  globals?: Record<string, BlueprintNode>;
}

export interface PopupSettings {
  triggers?: PopupTrigger[];
  entranceAnimation?: string;
  exitAnimation?: string;
  timing?: PopupTiming[];
}

export interface PopupTrigger {
  type: "page_load" | "scrolling" | "scrolling_to_element" | "click" | "exit_intent" | "on_click";
  settings?: Record<string, unknown>;
}

export interface PopupTiming {
  type: "times" | "days" | "sessions" | "url" | "sources" | "logged_in" | "devices";
  settings?: Record<string, unknown>;
}

export interface PageBlueprint {
  title: string;
  fileName?: string;
  theme?: Record<string, unknown>;
  tree: BlueprintNode[];
  seo?: Record<string, unknown>;
  // Page-level global widget definitions (merged with site-level globals)
  globals?: Record<string, BlueprintNode>;
}

export interface SiteBlueprint {
  title?: string;
  theme?: Record<string, unknown>;
  header?: BlueprintNode[];
  footer?: BlueprintNode[];
  pages: PageBlueprint[];
  seo?: Record<string, unknown>;
  // Site-level global widget definitions, merged into each page's globals
  globals?: Record<string, BlueprintNode>;
}

export interface CompiledDocument {
  content: ElementNode[];
  page_settings: unknown[] | Record<string, unknown>;
  version: string;
  title: string;
  type: string;
  conditions?: { include: string; name: string; sub_name?: string; sub_id?: string; sub_id2?: string }[];
}

export interface CompiledPage {
  title: string;
  fileNameHint: string;
  document: CompiledDocument;
}

// ---------------------------------------------------------------------------
// Style application
// ---------------------------------------------------------------------------

/** Attach a generated style to a node's settings, if the spec produces any variants. */
function applyStyle(id: string, spec: Record<string, unknown> | undefined, _settings: Record<string, unknown>): { className?: string; styles?: Record<string, StyleObject> } {
  const variants = resolveStyle(spec);
  if (variants.length === 0) return {};
  const { className, styles } = buildStyle(id, variants as StyleVariantSpec[]);
  return { className, styles };
}

function compileChildren(children: BlueprintNode[] | undefined, ctx?: CompileCtx): ElementNode[] {
  return (children ?? []).map((child) => compileNode(child, ctx));
}

// ---------------------------------------------------------------------------
// Motion application
// ---------------------------------------------------------------------------

/** Apply motion settings to a node, returning updated settings + interactions. */
function applyMotion(node: BlueprintNode): {
  settings: Record<string, unknown>;
  interactions: unknown[];
} {
  if (!node.motion) return { settings: {}, interactions: [] };
  return compileMotion(node.motion);
}

// ---------------------------------------------------------------------------
// Node compilation
// ---------------------------------------------------------------------------

export function compileNode(node: BlueprintNode, ctx?: CompileCtx): ElementNode {
  // Global widget resolution: merge from ctx.globals, with node-level props winning.
  if (node.global && ctx?.globals) {
    const globalDef = ctx.globals[node.global];
    if (globalDef) {
      const merged = { ...globalDef, ...node } as BlueprintNode;
      // Remove the `global` key so we don't recurse
      delete (merged as Partial<BlueprintNode>).global;
      return compileNode(merged, ctx);
    }
  }

  // Collect node-level keyframes for page-level injection
  if (node.keyframes && node.keyframes.length > 0 && ctx) {
    if (!ctx.collectedKeyframes) ctx.collectedKeyframes = [];
    for (const kf of node.keyframes) {
      if (!ctx.collectedKeyframes.some((k) => k.name === kf.name)) {
        ctx.collectedKeyframes.push(kf);
      }
    }
  }

  const id = genId();
  const info = WIDGET_BY_TYPE[node.type];
  if (!info) {
    throw new Error(`Unknown node type "${node.type}". Known types: ${Object.keys(WIDGET_BY_TYPE).join(", ")}`);
  }

  // Raw escape hatch: pass the node through, ensuring it has an id.
  if (node.type === "raw") {
    if (!node.node || typeof node.node !== "object") {
      throw new Error(`"raw" node requires a "node" object holding atomic-widget JSON.`);
    }
    const raw = { ...node.node } as ElementNode;
    if (!raw.id) raw.id = genId();
    return raw;
  }

  const extra = node.settings ?? {};
  const { settings: motionSettings, interactions } = applyMotion(node);

  // Compile dynamic tags into __dynamic__ settings
  const dynamicSettings: Record<string, string> = {};
  if (node.dynamic) {
    for (const [key, dt] of Object.entries(node.dynamic)) {
      dynamicSettings[key] = dynamicTagStr(dt.tag, dt.settings);
    }
  }

  // Merge motion settings into the element settings
  const mergedExtra = { ...motionSettings, ...extra };
  if (Object.keys(dynamicSettings).length > 0) {
    mergedExtra["__dynamic__"] = dynamicSettings;
  }

  switch (info.type) {
    case "heading": {
      const level = node.level && node.level >= 1 && node.level <= 6 ? node.level : undefined;
      const tag = node.tag ?? (level ? `h${level}` : "h2");
      const settings: Record<string, unknown> = {
        tag: str(tag),
        title: htmlV3(node.text ?? ""),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-heading", { id, settings, className, styles, editorTitle: node.title ?? "Heading" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "text": {
      const settings: Record<string, unknown> = {
        tag: str(node.tag ?? "p"),
        paragraph: htmlV3(node.text ?? ""),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-paragraph", { id, settings, className, styles, editorTitle: node.title ?? "Text" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "button": {
      const settings: Record<string, unknown> = {
        text: htmlV3(node.text ?? "Button"),
        ...(node.href ? { link: linkValue({ href: node.href, targetBlank: node.targetBlank, tag: "a" }) } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-button", { id, settings, className, styles, editorTitle: node.title ?? "Button" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "image": {
      if (!node.src) throw new Error(`image node requires "src".`);
      const settings: Record<string, unknown> = { image: image(node.src, node.size ?? "large", node.alt), ...mergedExtra };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-image", { id, settings, className, styles, editorTitle: node.title ?? "Image" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "svg": {
      const settings: Record<string, unknown> = {
        ...(node.src ? { svg: svgSrc(node.src) } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-svg", { id, settings, className, styles, editorTitle: node.title ?? "Icon" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "divider": {
      const settings: Record<string, unknown> = { ...mergedExtra };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-divider", { id, settings, className, styles, editorTitle: node.title ?? "Divider" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "youtube": {
      const settings: Record<string, unknown> = {
        source: str(node.src ?? ""),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-youtube", { id, settings, className, styles, editorTitle: node.title ?? "YouTube" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "video": {
      const settings: Record<string, unknown> = {
        ...(node.src ? { video: videoSrc(node.src) } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-self-hosted-video", { id, settings, className, styles, editorTitle: node.title ?? "Video" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    // ---- HTML widget ----
    case "html": {
      const settings: Record<string, unknown> = {
        html: str(node.html ?? ""),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-html", { id, settings, className, styles, editorTitle: node.title ?? "HTML" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    // ---- Tier 1 Free widgets ----
    case "icon": {
      const settings: Record<string, unknown> = {
        icon_name: str(node.iconName ?? "fa-star"),
        library: str(node.library ?? "fa-solid"),
        ...(node.link ? { link: linkValue(node.link) } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-icon", { id, settings, className, styles, editorTitle: node.title ?? "Icon" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "icon-list": {
      const items = (node.items ?? []).map((item: Record<string, unknown>) => ({
        _id: genId().slice(0, 7),
        icon_name: str(String(item.iconName ?? "")),
        text: str(String(item.text ?? "")),
        ...(item.link ? { link: linkValue(item.link as { href: string; targetBlank?: boolean }) } : {}),
      }));
      const settings: Record<string, unknown> = {
        icon_list: items,
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-icon-list", { id, settings, className, styles, editorTitle: node.title ?? "Icon List" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "image-box": {
      const img = node.image as { src: string; alt?: string } | undefined;
      const hdg = node.heading as { text: string; tag?: string } | undefined;
      const settings: Record<string, unknown> = {
        ...(img ? { image: image(img.src, "large", img.alt) } : {}),
        ...(hdg ? { title: htmlV3(hdg.text), title_tag: str(hdg.tag ?? "h3") } : {}),
        ...(node.description ? { description: htmlV3(node.description) } : {}),
        ...(node.link ? { link: linkValue(node.link as { href: string; targetBlank?: boolean }) } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-image-box", { id, settings, className, styles, editorTitle: node.title ?? "Image Box" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "social-icons": {
      const items = (node.items ?? []).map((item: Record<string, unknown>) => ({
        _id: genId().slice(0, 7),
        icon_name: str(String(item.iconName ?? "")),
        url: str(String(item.url ?? "#")),
        ...(item.label ? { label: str(String(item.label)) } : {}),
      }));
      const settings: Record<string, unknown> = {
        social_icon_list: items,
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-social-icons", { id, settings, className, styles, editorTitle: node.title ?? "Social Icons" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "accordion": {
      const items = (node.items ?? []).map((item: Record<string, unknown>, i: number) => ({
        _id: genId().slice(0, 7),
        tab_title: str(String(item.label ?? "")),
        tab_content: htmlV3(String(item.content ?? "")),
        ...(item.defaultActive ? { default_active: bool(true) } : {}),
      }));
      const settings: Record<string, unknown> = {
        tabs: items,
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-accordion", { id, settings, className, styles, editorTitle: node.title ?? "Accordion" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    // ---- section / flex / spacer ----
    case "section": {
      const settings: Record<string, unknown> = { tag: str(node.tag ?? "div"), ...mergedExtra };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = layoutNode("e-div-block", { id, settings, className, styles, children: compileChildren(node.children, ctx), editorTitle: node.title ?? "Section" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "flex": {
      const dir = node.type === "row" ? "row" : node.type === "column" || node.type === "stack" ? "column" : node.direction;
      const style = { ...(node.style ?? {}) };
      if (style.display === undefined) style.display = "flex";
      if (dir && style.flexDirection === undefined && style["flex-direction"] === undefined) {
        style.flexDirection = dir;
      }
      const settings: Record<string, unknown> = { ...mergedExtra };
      const { className, styles } = applyStyle(id, style, settings);
      const n = layoutNode("e-flexbox", { id, settings, className, styles, children: compileChildren(node.children, ctx), editorTitle: node.title ?? "Flex" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "spacer": {
      const style = { height: node.height ?? "2rem", ...(node.style ?? {}) };
      const settings: Record<string, unknown> = {};
      const { className, styles } = applyStyle(id, style, settings);
      const n = layoutNode("e-div-block", { id, settings, className, styles, editorTitle: node.title ?? "Spacer" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    // ---- form ----
    case "form": {
      const settings: Record<string, unknown> = {
        "form-name": str(node.name ?? "Form"),
        "form-state": str("default"),
        "actions-after-submit": stringArray(node.email ? ["email"] : []),
        ...(node.email ? { email: emailValue(node.email) } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = layoutNode("e-form", { id, settings, className, styles, children: compileChildren(node.children, ctx), editorTitle: node.title ?? "Form" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "form-label": {
      const settings: Record<string, unknown> = {
        text: htmlV3(node.text ?? ""),
        ...(node.for ? { "input-id": str(node.for) } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-label", { id, settings, className, styles, editorTitle: "Label" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "input": {
      const settings: Record<string, unknown> = {
        ...(node.placeholder ? { placeholder: str(node.placeholder) } : {}),
        type: str(node.inputType ?? "text"),
        required: bool(node.required ?? false),
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-input", { id, settings, className, styles, editorTitle: "Input" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "textarea": {
      const settings: Record<string, unknown> = {
        ...(node.placeholder ? { placeholder: str(node.placeholder) } : {}),
        required: bool(node.required ?? false),
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-textarea", { id, settings, className, styles, editorTitle: "Textarea" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "select": {
      const settings: Record<string, unknown> = {
        ...(node.options ? { options: optionsValue(node.options) } : {}),
        required: bool(node.required ?? false),
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-select", { id, settings, className, styles, editorTitle: "Select" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "submit": {
      const settings: Record<string, unknown> = { text: htmlV3(node.text ?? "Submit"), ...mergedExtra };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-submit-button", { id, settings, className, styles, editorTitle: "Submit" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "checkbox": {
      const settings: Record<string, unknown> = {
        ...(node.fieldName ? { name: str(node.fieldName) } : {}),
        ...(node.value ? { value: str(node.value) } : {}),
        required: bool(node.required ?? false),
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-checkbox", { id, settings, className, styles, editorTitle: "Checkbox" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "radio": {
      const settings: Record<string, unknown> = {
        ...(node.fieldName ? { name: str(node.fieldName) } : {}),
        ...(node.value ? { value: str(node.value) } : {}),
        required: bool(node.required ?? false),
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-radio-button", { id, settings, className, styles, editorTitle: "Radio" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "date": {
      const settings: Record<string, unknown> = {
        ...(node.placeholder ? { placeholder: str(node.placeholder) } : {}),
        required: bool(node.required ?? false),
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-date-picker", { id, settings, className, styles, editorTitle: "Date" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "time": {
      const settings: Record<string, unknown> = {
        ...(node.placeholder ? { placeholder: str(node.placeholder) } : {}),
        required: bool(node.required ?? false),
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-time-picker", { id, settings, className, styles, editorTitle: "Time" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "file-upload": {
      const settings: Record<string, unknown> = {
        ...(node.fileTypes ? { "file-types": str(node.fileTypes) } : {}),
        required: bool(node.required ?? false),
        ...(node.cssId ? { _cssid: node.cssId } : {}),
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = widgetNode("e-form-file-upload", { id, settings, className, styles, editorTitle: "File Upload" });
      if (interactions.length) n.interactions = interactions;
      return n;
    }
    case "tabs": {
      const tabs = node.tabs ?? [];
      if (tabs.length === 0) throw new Error(`tabs node requires a non-empty "tabs" array.`);
      const menu = layoutNode("e-tabs-menu", {
        id: genId(),
        children: tabs.map((t) =>
          layoutNode("e-tab", {
            id: genId(),
            children: [
              widgetNode("e-paragraph", {
                id: genId(),
                settings: { tag: str("span"), paragraph: htmlV3(t.label) },
                editorTitle: "Tab Label",
              }),
            ],
            editorTitle: "Tab",
          })
        ),
      });
      const contentArea = layoutNode("e-tabs-content-area", {
        id: genId(),
        children: tabs.map((t) =>
          layoutNode("e-tab-content", {
            id: genId(),
            children: compileChildren(t.children, ctx),
            editorTitle: "Tab Content",
          })
        ),
      });
      const settings: Record<string, unknown> = {
        "default-active-tab": { $$type: "number", value: node.defaultTab ?? 0 },
        ...mergedExtra,
      };
      const { className, styles } = applyStyle(id, node.style, settings);
      const n = layoutNode("e-tabs", { id, settings, className, styles, children: [menu, contentArea], editorTitle: node.title ?? "Tabs" });
      if (interactions.length) n.interactions = interactions;
      return n;
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
    case "call-to-action": {
      const settings = normalizeClassicSettings({
        ...(CLASSIC_DEFAULTS[info.maps_to] ?? {}),
        ...(node.props ?? {}),
      });
      return classicWidgetNode(info.maps_to, { id, settings });
    }
    default:
      throw new Error(`Node type "${node.type}" is recognized but not yet implemented.`);
  }
}

/** Default flat settings for classic widgets, derived from a real export. */
const CLASSIC_DEFAULTS: Record<string, Record<string, unknown>> = {
  "price-table": {
    heading: "Plan",
    sub_heading: "",
    price: "0",
    period: "Monthly",
    features_list: [],
    button_text: "Get Started",
  },
  "nav-menu": { menu_name: "Menu" },
  "loop-grid": { text: "Load More" },
  posts: { text: "Load More" },
  login: { button_text: "Log In" },
  reviews: { slides_name: "Slides", slides: [] },
  rating: {},
  "animated-headline": { before_text: "This is", highlighted_text: "Amazing", rotating_text: "" },
  slides: { slides: [] },
  "media-carousel": { images: [] },
  portfolio: {},
  "call-to-action": {},
};

/**
 * Classic list-of-object settings (features_list, slides, …) require an `_id`
 * per item. Auto-fill any missing ids so authors don't have to.
 */
function normalizeClassicSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(settings)) {
    if (Array.isArray(v)) {
      out[k] = v.map((item: unknown) =>
        item && typeof item === "object" && !Array.isArray(item)
          ? { ...(item as Record<string, unknown>), _id: (item as Record<string, unknown>)._id ?? genId().slice(0, 7) }
          : item
      );
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Popup page_settings
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

// ---------------------------------------------------------------------------
// Theme Builder conditions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// CSS Custom Properties (dark mode / theme token injection)
// ---------------------------------------------------------------------------

/**
 * Generate CSS custom properties from theme tokens.
 * Returns a CSS string like "--color-primary: #1A2D5A; --color-accent: ..."
 */
function compileThemeCssVars(theme: Record<string, unknown>): string {
  const parts: string[] = [];

  // Colors
  const colors = theme.colors as Record<string, string> | undefined;
  if (colors) {
    for (const [key, val] of Object.entries(colors)) {
      if (typeof val === "string") {
        parts.push(`--color-${key}: ${val};`);
      }
    }
  }

  // Radius
  const radius = theme.radius as Record<string, string> | undefined;
  if (radius) {
    for (const [key, val] of Object.entries(radius)) {
      if (typeof val === "string") {
        parts.push(`--radius-${key}: ${val};`);
      }
    }
  }

  // Fonts
  const fonts = theme.fonts as Record<string, string> | undefined;
  if (fonts) {
    for (const [key, val] of Object.entries(fonts)) {
      if (typeof val === "string") {
        parts.push(`--font-${key}: ${val};`);
      }
    }
  }

  // Shadows
  const shadow = theme.shadow as Record<string, string> | undefined;
  if (shadow) {
    for (const [key, val] of Object.entries(shadow)) {
      if (typeof val === "string") {
        parts.push(`--shadow-${key}: ${val};`);
      }
    }
  }

  return parts.join(" ");
}

/**
 * Compile CSS custom properties into a :root block for page_settings custom_css.
 */
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

// ---------------------------------------------------------------------------
// @keyframes CSS generation
// ---------------------------------------------------------------------------

/** Convert a camelCase CSS property name to kebab-case. */
function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Compile a KeyframeSpec into CSS like:
 *   @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
 */
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

/** Compile an array of KeyframeSpecs into a single CSS string. */
function compileKeyframes(keyframes: KeyframeSpec[] | undefined): string | undefined {
  if (!keyframes || keyframes.length === 0) return undefined;
  return keyframes.map(compileKeyframe).join(" ");
}

// ---------------------------------------------------------------------------
// Site / Blueprint compilation
// ---------------------------------------------------------------------------

/** Compile every page of a site, sharing theme and optional header/footer. */
export function compileSite(site: SiteBlueprint): CompiledPage[] {
  return site.pages.map((page) => {
    const tree = [...(site.header ?? []), ...page.tree, ...(site.footer ?? [])];
    // Page theme overrides the site theme; defaults are applied in compileBlueprint.
    const userTheme = deepMerge(site.theme ?? {}, page.theme);
    // Merge site-level globals with page-level globals (page wins on conflicts)
    const globals = { ...(site.globals ?? {}), ...(page.globals ?? {}) };
    const document = compileBlueprint({ title: page.title, theme: userTheme, tree, globals });
    return { title: page.title, fileNameHint: page.fileName || page.title, document };
  });
}

export function compileBlueprint(blueprint: Blueprint): CompiledDocument {
  // Layer the blueprint theme over the defaults so templates always resolve.
  const theme = resolveTheme(blueprint.theme);
  // Expand any `template` nodes into friendly subtrees, then resolve {tokens}.
  const expanded = expandTemplates(blueprint.tree);
  const resolvedTree = resolveTokens(expanded, theme);

  // Build compilation context with globals + keyframes collector
  const ctx: CompileCtx = {
    globals: blueprint.globals,
    collectedKeyframes: [],
  };
  const content = resolvedTree.map((node) => compileNode(node, ctx));

  // Determine document type from blueprint type field
  const docType = blueprint.type ?? "page";

  // Build page_settings
  let pageSettings: unknown[] | Record<string, unknown> = [];
  if (docType === "popup") {
    pageSettings = compilePopupSettings(blueprint.popup);
  }

  // Compile CSS custom properties from theme tokens and user-provided cssVars
  const cssCustomProperties = compileCssCustomProperties(blueprint.cssVars, theme);
  if (cssCustomProperties) {
    if (Array.isArray(pageSettings)) {
      pageSettings = {};
    }
    // Store the full :root block in custom_css
    pageSettings.custom_css = cssCustomProperties;
    // Also store the raw CSS variable string (without :root wrapper) in css_custom_properties
    // Extract just the variable declarations from inside :root { ... }
    const inner = cssCustomProperties.replace(/^:root\s*\{\s*/, "").replace(/\s*\}\s*$/, "");
    pageSettings.css_custom_properties = inner;
  }

  // Merge blueprint-level keyframes with node-collected keyframes
  const allKeyframes: KeyframeSpec[] = [
    ...(blueprint.keyframes ?? []),
    ...(ctx.collectedKeyframes ?? []),
  ];
  const keyframesCss = compileKeyframes(allKeyframes);
  if (keyframesCss) {
    if (Array.isArray(pageSettings)) {
      pageSettings = {};
    }
    // Append keyframes CSS to any existing custom_css
    if (pageSettings.custom_css) {
      pageSettings.custom_css = (pageSettings.custom_css as string) + " " + keyframesCss;
    } else {
      pageSettings.custom_css = keyframesCss;
    }
  }

  // Build Theme Builder conditions for header/footer/single/archive
  const conditions = compileConditions(docType, blueprint.conditions);

  return {
    content,
    page_settings: pageSettings,
    version: "0.4",
    title: blueprint.title ?? "Untitled",
    type: docType,
    ...(conditions ? { conditions } : {}),
  };
}