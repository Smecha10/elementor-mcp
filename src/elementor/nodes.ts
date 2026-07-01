/**
 * Builders for Elementor v4 element nodes and their style objects.
 */
import { classes, encodeCustomCss, genClass, TypedValue } from "./primitives.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StyleVariant {
  meta: { breakpoint: string; state: string | null };
  props: Record<string, TypedValue>;
  custom_css: { raw: string } | null;
}

/** Flat variant spec as produced by resolveStyle in styling.ts */
export interface StyleVariantSpec {
  breakpoint?: string;
  state?: string | null;
  props: Record<string, TypedValue>;
  customCss?: string;
}

export interface StyleObject {
  id: string;
  label: string;
  type: string;
  variants: StyleVariant[];
}

export interface BuildStyleResult {
  className: string;
  styles: Record<string, StyleObject>;
}

export interface BaseNodeOpts {
  id: string;
  settings?: Record<string, unknown>;
  children?: ElementNode[];
  isInner?: boolean;
  styles?: Record<string, StyleObject>;
  className?: string;
  editorTitle?: string;
}

export interface ElementNode {
  id: string;
  settings: Record<string, unknown>;
  elements: ElementNode[];
  isInner: boolean;
  elType: string;
  widgetType?: string;
  styles?: Record<string, StyleObject>;
  interactions?: unknown[];
  editor_settings?: Record<string, unknown>;
  version?: string;
}

// ---------------------------------------------------------------------------
// Style builder
// ---------------------------------------------------------------------------

/**
 * Build a local style object keyed by a generated class name.
 * Returns the className (to put in `settings.classes`) and the style map entry.
 */
export function buildStyle(elementId: string, variants: StyleVariantSpec[]): BuildStyleResult {
  const className = genClass(elementId);
  const style: StyleObject = {
    id: className,
    label: "local",
    type: "class",
    variants: variants.map((v) => {
      const props = v.props ?? {};
      const hasProps = Object.keys(props).length > 0;
      return {
        meta: { breakpoint: v.breakpoint ?? "desktop", state: v.state ?? null },
        // Elementor serializes empty props as [] (seen in real exports).
        props: hasProps ? props : ([] as unknown as Record<string, TypedValue>),
        custom_css: v.customCss && v.customCss.trim() ? encodeCustomCss(v.customCss) : null,
      };
    }),
  };
  return { className, styles: { [className]: style } };
}

// ---------------------------------------------------------------------------
// Node builders
// ---------------------------------------------------------------------------

function baseNode(opts: BaseNodeOpts): ElementNode {
  const settings = { ...(opts.settings ?? {}) };
  if (opts.className) {
    settings.classes = classes([opts.className]);
  }
  return {
    id: opts.id,
    settings,
    elements: opts.children ?? [],
    isInner: opts.isInner ?? false,
    elType: "widget", // overwritten by callers as needed
    styles: opts.styles ?? {},
    interactions: [],
    editor_settings: opts.editorTitle ? { title: opts.editorTitle } : {},
    version: "0.0",
  };
}

/** A content widget, e.g. e-heading, e-button, e-image, e-form-input. */
export function widgetNode(widgetType: string, opts: BaseNodeOpts): ElementNode {
  const node = baseNode(opts);
  node.elType = "widget";
  node.widgetType = widgetType;
  return node;
}

/**
 * A structural element where elType == the type itself and there is no
 * widgetType. Covers e-div-block, e-flexbox, e-form, e-tabs/e-tab, the form
 * message elements, etc.
 */
export function layoutNode(elType: string, opts: BaseNodeOpts): ElementNode {
  const node = baseNode(opts);
  node.elType = elType;
  delete node.widgetType;
  return node;
}

/**
 * A classic (pre-atomic) Pro widget, e.g. price-table, nav-menu, loop-grid.
 * These use a minimal wrapper with FLAT settings (no $$type wrapping) and no
 * styles/interactions/editor_settings/version fields.
 */
export function classicWidgetNode(widgetType: string, opts: BaseNodeOpts): ElementNode {
  return {
    id: opts.id,
    settings: opts.settings ?? {},
    elements: opts.children ?? [],
    isInner: opts.isInner ?? false,
    elType: "widget",
    widgetType,
  } as ElementNode;
}

/** Legacy `container` element used to host classic Pro widgets. */
export function containerNode(opts: BaseNodeOpts): ElementNode {
  return {
    id: opts.id,
    settings: opts.settings ?? {},
    elements: opts.children ?? [],
    isInner: opts.isInner ?? false,
    elType: "container",
  } as ElementNode;
}
