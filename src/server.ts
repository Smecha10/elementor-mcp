#!/usr/bin/env node
/**
 * Elementor MCP server.
 *
 * Exposes tools that let an agent design complete websites and emit import-ready
 * Elementor v4 (Atomic Widgets) JSON files. The agent makes design decisions;
 * this server guarantees the output is structurally valid.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "node:http";
import { z } from "zod";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileBlueprint, compileSite, Blueprint, BlueprintNode, CompiledDocument } from "./compiler.js";
import { WIDGETS, WIDGET_BY_TYPE } from "./widgets.js";
import { learnFromDoc, loadRegistry } from "./learn.js";
import { TEMPLATE_INFO } from "./templates.js";
import { INTAKE, BRIEF_TEMPLATE, renderIntakeMarkdown, suggestPersonality } from "./intake.js";
import { buildTheme, PERSONALITIES, PERSONALITY_NAMES } from "./design.js";
import { buildSeo } from "./seo.js";
import { ENTRANCE_ANIMATIONS, HOVER_ANIMATIONS } from "./motion.js";
import { dynamicTag, DynamicTag } from "./elementor/primitives.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");

function defaultOutputDir(): string {
  return process.env.ELEMENTOR_MCP_OUT || path.join(process.cwd(), "output");
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "page"
  );
}

function ok(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function fail(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true };
}

/**
 * Tool arguments declared as `z.any()` can arrive as either a parsed object or a
 * JSON string, depending on how the MCP client serializes structured input.
 * Coerce a string to an object so the rest of the pipeline always sees an object.
 */
function coerceObject<T>(v: T | string): T {
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "") return v as T;
    return JSON.parse(trimmed) as T;
  }
  return v;
}

const server = new McpServer({
  name: "elementor-mcp",
  version: "0.4.0",
});

// ---------------------------------------------------------------------------
// list_widgets
// ---------------------------------------------------------------------------
server.registerTool("list_widgets", {
  title: "List blueprint widgets",
  description: "List all blueprint node types the compiler supports, grouped by category. Use this to discover what you can place in a blueprint tree. Optionally filter by category.",
  inputSchema: {
    category: z
      .enum(["layout", "content", "media", "form", "interactive", "dynamic", "special"] as const)
      .optional()
      .describe("Filter to a single category."),
  },
}, async ({ category }) => {
  const list = category ? WIDGETS.filter((w) => w.category === category) : WIDGETS;
  const lines = list.map((w) => `- ${w.type}${w.aliases?.length ? ` (aka ${w.aliases.join(", ")})` : ""} → ${w.maps_to} [${w.category}]\n    ${w.description}`);
  return ok(`Available blueprint node types:\n\n${lines.join("\n")}`);
});

// ---------------------------------------------------------------------------
// get_widget_schema
// ---------------------------------------------------------------------------
const EXAMPLES: Record<string, unknown> = {
  heading: { type: "heading", level: 1, text: "Welcome", style: { fontSize: "3rem", color: "{colors.primary}" }, motion: { entrance: "fadeInUp", entranceDelay: 0.2 } },
  text: { type: "text", text: "Supporting copy.", style: { fontSize: "1.125rem", maxWidth: "65ch" } },
  button: {
    type: "button",
    text: "Get Started",
    href: "/contact",
    targetBlank: false,
    style: { color: "#fff", background: "{colors.accent}", padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" }, borderRadius: "{radius.md}", hover: { background: "#cf5f2b" } },
    motion: { hover: "grow", interactions: [{ trigger: "hover", effect: "scale", type: "in", duration: 300, easing: "easeOut" }] },
  },
  svg: { type: "svg", src: "https://example.com/icon.svg", style: { width: "48px" } },
  video: { type: "video", src: "https://example.com/clip.mp4", style: { borderRadius: "1rem" } },
  tabs: {
    type: "tabs",
    defaultTab: 0,
    tabs: [
      { label: "Overview", children: [{ type: "heading", level: 3, text: "Overview" }, { type: "text", text: "..." }] },
      { label: "Pricing", children: [{ type: "text", text: "..." }] },
    ],
  },
  "price-table": {
    type: "price-table",
    props: { heading: "Pro", price: "39", period: "Monthly", ribbon_title: "Popular", button_text: "Choose Pro", features_list: [{ item_text: "Everything in Basic" }, { item_text: "Priority support" }] },
  },
  reviews: {
    type: "reviews",
    props: { slides: [{ content: "Fantastic service!", name: "Jane Doe", title: "CEO, Acme", image: { url: "https://example.com/jane.jpg" } }] },
  },
  "animated-headline": {
    type: "animated-headline",
    props: { before_text: "We make HR", highlighted_text: "simple", rotating_text: "simple\nfast\npainless" },
  },
  "nav-menu": { type: "nav-menu", props: { menu_name: "Header", menu: "header-menu" } },
  image: { type: "image", src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800", style: { borderRadius: "1rem" }, motion: { entrance: "zoomIn", entranceDuration: 0.8 } },
  section: { type: "section", style: { background: "{colors.surface}", padding: { top: "4rem", bottom: "4rem" } }, children: [], motion: { scroll: { translateY: { direction: "up", speed: 4 } } } },
  flex: { type: "flex", direction: "row", style: { gap: "2rem", alignItems: "center", flexWrap: "wrap", mobile: { flexDirection: "column" } }, children: [] },
  form: {
    type: "form",
    name: "Contact",
    email: { to: "hello@example.com", subject: "New enquiry" },
    children: [
      { type: "label", text: "Email", for: "email" },
      { type: "input", inputType: "email", placeholder: "you@example.com", required: true, cssId: "email" },
      { type: "submit", text: "Send" },
    ],
  },
  raw: {
    type: "raw",
    node: {
      elType: "container",
      settings: {},
      elements: [{ id: "", widgetType: "price-table", elType: "widget", settings: {}, elements: [] }],
    },
  },
  icon: { type: "icon", iconName: "fa-star", library: "fa-solid", style: { color: "{colors.accent}", fontSize: "2rem" } },
  "icon-list": { type: "icon-list", items: [{ iconName: "fa-check", text: "Feature one" }, { iconName: "fa-star", text: "Feature two" }] },
  "image-box": { type: "image-box", image: { src: "https://example.com/img.jpg", alt: "desc" }, heading: { text: "Title" }, description: "Some text." },
  "social-icons": { type: "social-icons", items: [{ iconName: "fa-facebook", url: "https://fb.com" }, { iconName: "fa-twitter", url: "https://twitter.com" }] },
  accordion: { type: "accordion", items: [{ label: "Q1", content: "Answer 1" }, { label: "Q2", content: "Answer 2" }] },
  slides: { type: "slides", props: { slides: [{ heading: "Slide 1" }, { heading: "Slide 2" }] } },
  carousel: { type: "carousel", props: { images: [{ url: "https://example.com/1.jpg" }, { url: "https://example.com/2.jpg" }] } },
  portfolio: { type: "portfolio", props: {} },
  "call-to-action": { type: "call-to-action", props: { heading: "Act Now", description: "Limited time offer" } },
  html: { type: "html", html: "<div class=\"my-embed\"><iframe src=\"https://example.com\" width=\"100%\" height=\"400\"></iframe></div>" },
};

server.registerTool("get_widget_schema", {
  title: "Get widget schema",
  description: "Get the fields and a concrete blueprint example for one node type. Call before using an unfamiliar widget.",
  inputSchema: {
    type: z.string().describe("A blueprint node type, e.g. 'heading', 'flex', 'form', 'html', 'raw'."),
  },
}, async ({ type }) => {
  const info = WIDGET_BY_TYPE[type];
  if (!info) return fail(`Unknown type "${type}". Call list_widgets to see options.`);
  const example = EXAMPLES[info.type];
  // Surface any learned schema for the underlying Elementor element.
  const registry = await loadRegistry();
  const learned = registry[info.maps_to] ?? undefined;
  const payload = {
    type: info.type,
    maps_to: info.maps_to,
    category: info.category,
    description: info.description,
    fields: info.fields,
    aliases: info.aliases ?? [],
    universal_fields: {
      style: "StyleSpec — CSS props (camelCase). Native props are typed; others become custom_css. Supports tablet/mobile/widescreen/hover sub-objects and a raw `css` string.",
      title: "Editor label shown in the Elementor navigator.",
      children: "Child nodes (for layout/form containers).",
      settings: "Raw settings merged in (values must be $$type-wrapped).",
      props: "Flat settings for classic Pro widgets (plain values).",
      motion: "MotionSpec — entrance/hover animations, transforms, sticky, scroll effects, mouse effects, and v4 interactions. See list_motion_options.",
      dynamic: "Record<string, DynamicTag> — dynamic content tags (post-title, featured-image, etc.). See list_dynamic_tags.",
      cssVars: "Record<string, string> — CSS custom properties for theme tokens and dark mode. Auto-generated from theme if not provided.",
    },
    example: example ?? "(no example; see list_widgets)",
    learned_schema: learned
      ? { kind: learned.kind, settings: learned.settings, instances: learned.instances, sources: learned.sources }
      : "(none yet — feed an export via learn_from_export to learn this widget's exact settings)",
  };
  return ok(JSON.stringify(payload, null, 2));
});

// ---------------------------------------------------------------------------
// list_motion_options
// ---------------------------------------------------------------------------
server.registerTool("list_motion_options", {
  title: "List motion & animation options",
  description: "List all available entrance animations, hover animations, and interaction triggers/effects/easing options for use in the `motion` field of any node. Call before adding motion to a blueprint.",
  inputSchema: {},
}, async () => {
  const lines = [
    "## Entrance Animations (motion.entrance)",
    ENTRANCE_ANIMATIONS.join(", "),
    "",
    "## Hover Animations (motion.hover)",
    HOVER_ANIMATIONS.join(", "),
    "",
    "## Interaction Triggers (motion.interactions[].trigger)",
    "load, scrollIn (free) | scrollOut, scrollOn, hover, click (Pro)",
    "",
    "## Interaction Effects (motion.interactions[].effect)",
    "fade, slide, scale (free) | custom (Pro)",
    "",
    "## Easing Options (motion.interactions[].easing)",
    "easeIn (free) | easeOut, easeInOut, backIn, backInOut, backOut, linear (Pro)",
    "",
    "## Repeat Options (motion.interactions[].repeat)",
    '"", "loop", "times"',
    "",
    "## Transform Controls (motion.transform)",
    "rotate (deg), scale (multiplier), skewX/skewY (deg), translateX/translateY (px), perspective (px)",
    "",
    "## Scroll Effects (motion.scroll)",
    "translateY, translateX, opacity, blur, rotateZ, scale — each with {direction, speed: 1-10}",
    "",
    "## Mouse Effects (motion.mouse)",
    "track: {direction: opposite|direct, speed}, tilt: {direction: alternate|direct|opposite, speed}",
    "",
    "## Sticky (motion.sticky)",
    'position: "top"|"bottom", devices: ["desktop","tablet","mobile"], offset (px), effectsOffset (px)',
  ];
  return ok(lines.join("\n"));
});

// ---------------------------------------------------------------------------
// list_dynamic_tags
// ---------------------------------------------------------------------------
const DYNAMIC_TAG_NAMES = [
  "post-title", "post-excerpt", "post-featured-image", "post-date",
  "post-author-name", "post-url", "site-title", "site-tagline",
  "site-url", "archive-title", "archive-description",
  "current-user-display-name", "woocommerce-product-title",
  "woocommerce-product-price", "internal-url", "lightbox",
] as const;

server.registerTool("list_dynamic_tags", {
  title: "List dynamic tags",
  description: "List all available dynamic tag names for use in the `dynamic` field of any blueprint node. Dynamic tags pull content from WordPress (post title, featured image, author, etc.). Use them in template-type documents (single, archive) to create dynamic content.",
  inputSchema: {},
}, async () => {
  const lines = [
    "## Dynamic Tags (node.dynamic)",
    "Use on any widget: { dynamic: { '<setting_key>': { tag: '<name>', settings?: {...} } } }",
    "",
    "Available tag names:",
    ...DYNAMIC_TAG_NAMES.map((n) => `  - ${n}`),
    "",
    "Example:",
    '  { type: "heading", dynamic: { title: { tag: "post-title" } } }',
    '  { type: "image", dynamic: { image: { tag: "post-featured-image" } } }',
    "",
    "The compiler generates the [elementor-tag ...] syntax automatically.",
  ];
  return ok(lines.join("\n"));
});

// ---------------------------------------------------------------------------
// get_design_playbook
// ---------------------------------------------------------------------------
server.registerTool("get_design_playbook", {
  title: "Get design playbook",
  description: "Return the design system and best-practice rules to follow when generating a site (theme tokens, spacing scale, type scale, layout, section patterns, accessibility). Read this before building.",
  inputSchema: {},
}, async () => {
  try {
    const md = await readFile(path.join(PKG_ROOT, "docs", "design-playbook.md"), "utf-8");
    return ok(md);
  } catch {
    return fail("Design playbook not found. Expected docs/design-playbook.md in the package.");
  }
});

// ---------------------------------------------------------------------------
// get_intake_brief — structured discovery before designing
// ---------------------------------------------------------------------------
server.registerTool("get_intake_brief", {
  title: "Get client intake questionnaire",
  description: "Return the structured intake to run BEFORE designing: company facts, audience/goals, brand & design direction, content/structure, and SEO. Ask the client these, fill the returned brief skeleton, then feed brandColor+personality to generate_theme and the answers into the page copy. This is what makes each site specific instead of generic.",
  inputSchema: {
    format: z.enum(["markdown", "json"] as const).optional().describe("`markdown` (ask-through script) or `json` (questions + brief skeleton). Default markdown."),
  },
}, async ({ format }) => {
  if (format === "json") {
    return ok(JSON.stringify({ sections: INTAKE, briefTemplate: BRIEF_TEMPLATE, personalities: PERSONALITY_NAMES }, null, 2));
  }
  return ok(renderIntakeMarkdown());
});

// ---------------------------------------------------------------------------
// generate_theme — brand color + personality → full accessible theme
// ---------------------------------------------------------------------------
server.registerTool("generate_theme", {
  title: "Generate a brand theme",
  description: "Turn a brand color (+ optional accent) and a design 'personality' into a complete, WCAG-checked Elementor theme (colors, font pairing, radii, shadow, spacing). Drop the returned `theme` straight into a blueprint/site. Run after intake so the palette is built around the client's brand, not a generic template.",
  inputSchema: {
    brandColor: z.string().describe("Primary brand color as hex, e.g. '#1A2D5A'."),
    personality: z
      .enum(PERSONALITY_NAMES as [string, ...string[]])
      .optional()
      .describe(`Design character. One of: ${PERSONALITY_NAMES.join(", ")}. Default 'modern'.`),
    accentColor: z.string().optional().describe("Optional accent (CTA) hex. If omitted, one is derived from the brand color."),
    accentStrategy: z.enum(["complementary", "analogous", "triadic", "auto"] as const).optional().describe("How to derive the accent when none is given. Default 'auto'."),
    scheme: z.enum(["light", "dark"] as const).optional().describe("Light (default) or dark base."),
    tone: z.string().optional().describe("Brand voice adjectives — used only to suggest a personality if none is given."),
    industry: z.string().optional().describe("Industry — used only to suggest a personality if none is given."),
  },
}, async ({ brandColor, personality, accentColor, accentStrategy, scheme, tone, industry }) => {
  try {
    let chosen = personality;
    let suggestion = "";
    if (!chosen) {
      const s = suggestPersonality(tone ?? "", industry ?? "");
      chosen = s.personality;
      suggestion = ` (auto-picked '${chosen}' from ${s.reason})`;
    }
    const res = buildTheme(brandColor, { personality: chosen, accent: accentColor, accentStrategy, scheme });
    const payload = {
      personality: res.personality,
      personalityNote: PERSONALITIES[res.personality].description,
      theme: res.theme,
      contrastChecks: res.checks.map((c) => `${c.pair}: ${c.ratio.toFixed(2)}:1 ${c.pass ? "✓" : "✗"} (${c.level})`),
      warnings: res.warnings,
      usage: "Put `theme` on your blueprint/site; reference tokens like {colors.primary}, {colors.accent}, {colors.surface}, {colors.text}, {fonts.heading}, {radius.md}, {shadow.card}.",
    };
    return ok(JSON.stringify(payload, null, 2) + (suggestion ? `\n\nNote:${suggestion}` : ""));
  } catch (e: unknown) {
    return fail(`Theme generation failed: ${(e as Error).message}`);
  }
});

// ---------------------------------------------------------------------------
// generate_seo — meta + Open Graph + JSON-LD sidecar for one page
// ---------------------------------------------------------------------------
server.registerTool("generate_seo", {
  title: "Generate SEO meta + schema",
  description: "Produce an SEO sidecar for a page: trimmed meta title/description, slug, robots, canonical, Open Graph + Twitter tags, JSON-LD business/page schema, and a ready-to-paste <head> block. Returns warnings (missing description, no OG image, etc.). Keep page JSON clean — apply this at the WordPress/SEO-plugin level.",
  inputSchema: {
    seo: z.any().describe("SeoInput: { title, metaTitle?, metaDescription?, slug?, keywords?, canonical?, ogImage?, siteName?, pageType?, noindex?, business?: { name, type?, telephone?, email?, address?, sameAs?, ... } }."),
  },
}, async ({ seo }) => {
  try {
    const input = coerceObject(seo);
    if (!input || !input.title) return fail("seo.title is required.");
    const sidecar = buildSeo(input);
    return ok(JSON.stringify(sidecar, null, 2));
  } catch (e: unknown) {
    return fail(`SEO generation failed: ${(e as Error).message}`);
  }
});

// ---------------------------------------------------------------------------
// list_templates
// ---------------------------------------------------------------------------
server.registerTool("list_templates", {
  title: "List section templates",
  description: "List ready-made, theme-aware section templates (hero, feature-grid, cta-band, testimonials, pricing, faq, contact, navbar, footer). Use them in a blueprint via a node: { type: \"template\", template: \"<name>\", params: {…} }.",
  inputSchema: {},
}, async () => {
  const lines = TEMPLATE_INFO.map((t) => `- ${t.name}: ${t.description}\n    params: ${t.params}`);
  return ok(`Section templates (use as { type: "template", template, params }):\n\n${lines.join("\n")}`);
});

// ---------------------------------------------------------------------------
// get_template
// ---------------------------------------------------------------------------
server.registerTool("get_template", {
  title: "Get template params + example",
  description: "Get the parameters and a concrete example for one section template.",
  inputSchema: { name: z.string().describe("Template name, e.g. 'hero'.") },
}, async ({ name }) => {
  const info = TEMPLATE_INFO.find((t) => t.name === name);
  if (!info) return fail(`Unknown template "${name}". Call list_templates to see options.`);
  return ok(JSON.stringify({ name: info.name, description: info.description, params: info.params, usage: { type: "template", template: info.name, params: info.example } }, null, 2));
});

// ---------------------------------------------------------------------------
// validate_blueprint
// ---------------------------------------------------------------------------
server.registerTool("validate_blueprint", {
  title: "Validate blueprint",
  description: "Compile a blueprint in-memory without writing a file. Returns the element count and any errors so you can fix issues before building. Supports keyframes (CSS @keyframes animations) and globals (named widget definitions for reuse).",
  inputSchema: {
    blueprint: z.any().describe("The blueprint object: { title?, theme?, tree: [...], type?, popup?, cssVars?, conditions?, keyframes?, globals? }."),
  },
}, async ({ blueprint }) => {
  try {
    const bp = coerceObject(blueprint) as Blueprint;
    const doc = compileBlueprint(bp);
    const count = countNodes(doc.content);
    const typeInfo = doc.type !== "page" ? ` (type: ${doc.type})` : "";
    const popupInfo = doc.page_settings && typeof doc.page_settings === "object" && !Array.isArray(doc.page_settings)
      ? " (popup settings attached)"
      : "";
    return ok(`Valid. Title: "${doc.title}"${typeInfo}. Top-level sections: ${doc.content.length}. Total elements: ${count}${popupInfo}.`);
  } catch (e: unknown) {
    return fail(`Invalid blueprint: ${(e as Error).message}`);
  }
});

// ---------------------------------------------------------------------------
// build_page
// ---------------------------------------------------------------------------
server.registerTool("build_page", {
  title: "Build Elementor page",
  description: "Compile a blueprint into import-ready Elementor v4 JSON and write it to a file. The file can be imported in Elementor (Site Settings → Import/Export, or paste into the page template import). Supports popup type with triggers/timing via the `popup` field, Theme Builder conditions via `conditions`, dynamic tags via `dynamic` on nodes, CSS custom properties via `cssVars`, native background/box-shadow props in style, @keyframes CSS animations via `keyframes`, and reusable widget definitions via `globals`.",
  inputSchema: {
    blueprint: z.any().describe("The blueprint object: { title?, fileName?, theme?, tree: [...], type?, popup?, cssVars?, conditions?, keyframes?, globals? }."),
    outputDir: z
      .string()
      .optional()
      .describe("Directory to write into. Defaults to $ELEMENTOR_MCP_OUT or ./output."),
  },
}, async ({ blueprint, outputDir }) => {
  let doc: CompiledDocument;
  let bp: Blueprint;
  try {
    bp = coerceObject(blueprint) as Blueprint;
    doc = compileBlueprint(bp);
  } catch (e: unknown) {
    return fail(`Build failed: ${(e as Error).message}`);
  }
  const dir = outputDir || defaultOutputDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const name = slug(bp.fileName || doc.title);
  const file = path.join(dir, `${name}.json`);
  await writeFile(file, JSON.stringify(doc), "utf-8");
  const count = countNodes(doc.content);
  const seoRes = await writeSeoSidecar(dir, name, doc.title, bp.seo);
  const seoLine = seoRes.written
    ? `\nSEO sidecar: ${name}.seo.json${seoRes.warnings.length ? ` (notes: ${seoRes.warnings.join(" ")})` : ""}`
    : `\n(no seo provided — add a "seo" object to emit meta + schema)`;
  const typeLine = doc.type !== "page" ? ` • type: ${doc.type}` : "";
  const popupLine = doc.page_settings && typeof doc.page_settings === "object" && !Array.isArray(doc.page_settings)
    ? " • popup settings attached"
    : "";
  return ok(`Wrote ${file}\nTitle: "${doc.title}"${typeLine} • sections: ${doc.content.length} • elements: ${count}${popupLine}${seoLine}\nImport the .json into Elementor; apply the .seo.json at the WordPress/SEO-plugin level.`);
});

// ---------------------------------------------------------------------------
// build_popup — popup builder with triggers + timing
// ---------------------------------------------------------------------------
server.registerTool("build_popup", {
  title: "Build Elementor popup",
  description: "Compile a popup blueprint into import-ready Elementor v4 JSON with popup triggers, entrance/exit animations, and timing rules in page_settings. Use type: 'popup' with a popup config. The popup content goes in the tree.",
  inputSchema: {
    title: z.string().describe("Popup title (shown in Elementor)."),
    tree: z.any().describe("Content tree for the popup body (same blueprint nodes as pages)."),
    triggers: z.any().optional().describe("Array of { type: 'page_load'|'scrolling'|'click'|'exit_intent', settings?: {...} }. E.g. scrolling needs { offset: 25 }, click needs { selector: '.my-trigger' }."),
    entranceAnimation: z.string().optional().describe("Entrance animation name, e.g. 'fadeIn', 'slideInDown'."),
    exitAnimation: z.string().optional().describe("Exit animation name, e.g. 'fadeOut'."),
    timing: z.any().optional().describe("Array of { type: 'times'|'days'|'sessions'|'devices', settings: {...} }. E.g. times: { count: 1, period: 'session' }."),
    theme: z.any().optional().describe("Theme object from generate_theme."),
    fileName: z.string().optional().describe("Output file name (without extension)."),
    outputDir: z.string().optional().describe("Directory to write into. Defaults to $ELEMENTOR_MCP_OUT or ./output."),
  },
}, async ({ title, tree, triggers, entranceAnimation, exitAnimation, timing, theme, fileName, outputDir }) => {
  let doc: CompiledDocument;
  try {
    const bp: Blueprint = {
      title,
      type: "popup",
      tree: coerceObject(tree) as BlueprintNode[],
      ...(theme ? { theme: coerceObject(theme) as Record<string, unknown> } : {}),
      popup: {
        ...(triggers ? { triggers: coerceObject(triggers) as any[] } : {}),
        ...(entranceAnimation ? { entranceAnimation } : {}),
        ...(exitAnimation ? { exitAnimation } : {}),
        ...(timing ? { timing: coerceObject(timing) as any[] } : {}),
      },
    };
    doc = compileBlueprint(bp);
  } catch (e: unknown) {
    return fail(`Popup build failed: ${(e as Error).message}`);
  }
  const dir = outputDir || defaultOutputDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const name = slug(fileName || title);
  const file = path.join(dir, `${name}.json`);
  await writeFile(file, JSON.stringify(doc), "utf-8");
  const count = countNodes(doc.content);
  const hasPopup = doc.page_settings && typeof doc.page_settings === "object" && !Array.isArray(doc.page_settings);
  return ok(`Wrote popup: ${file}\nTitle: "${doc.title}" • type: popup • elements: ${count} • popup settings: ${hasPopup ? "attached" : "none"}\nImport the .json into Elementor Popup Builder.`);
});

// ---------------------------------------------------------------------------
// build_site — multi-page site with shared theme + header/footer
// ---------------------------------------------------------------------------
server.registerTool("build_site", {
  title: "Build a multi-page site",
  description: "Compile a whole site to import-ready Elementor JSON: one file per page, all sharing a theme and an optional header/footer (e.g. navbar/footer templates). Supports site-level `globals` for reusable widget definitions across all pages. Writes a site-manifest.json alongside the pages.",
  inputSchema: {
    site: z
      .any()
      .describe("The site: { title?, theme?, header?: nodes[], footer?: nodes[], pages: [{ title, fileName?, theme?, tree: [...] }], globals? }."),
    outputDir: z.string().optional().describe("Directory to write into. Defaults to $ELEMENTOR_MCP_OUT or ./output."),
  },
}, async ({ site, outputDir }) => {
  let s: Record<string, unknown>;
  try {
    s = coerceObject(site) as Record<string, unknown>;
  } catch (e: unknown) {
    return fail(`Build failed: ${(e as Error).message}`);
  }
  if (!s || !Array.isArray(s.pages) || s.pages.length === 0) {
    return fail("Site must have a non-empty `pages` array.");
  }
  let compiled: ReturnType<typeof compileSite>;
  try {
    compiled = compileSite(s as any);
  } catch (e: unknown) {
    return fail(`Build failed: ${(e as Error).message}`);
  }
  const dir = outputDir || defaultOutputDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const manifest: Array<Record<string, unknown>> = [];
  const usedNames = new Set<string>();
  const allSeoWarnings: string[] = [];
  for (let i = 0; i < compiled.length; i++) {
    const page = compiled[i];
    let name = slug(page.fileNameHint);
    while (usedNames.has(name)) name = `${name}-2`;
    usedNames.add(name);
    const file = path.join(dir, `${name}.json`);
    await writeFile(file, JSON.stringify(page.document), "utf-8");
    // Site-wide SEO defaults layered with this page's overrides (page wins).
    const pageSeo = mergeSeo(s.seo as Record<string, unknown> | undefined, (s.pages as Array<Record<string, unknown>>)[i]?.seo as Record<string, unknown> | undefined);
    const seoRes = await writeSeoSidecar(dir, name, page.title, pageSeo);
    for (const w of seoRes.warnings) allSeoWarnings.push(`${page.title}: ${w}`);
    manifest.push({
      title: page.title,
      file: `${name}.json`,
      sections: page.document.content.length,
      elements: countNodes(page.document.content),
      ...(seoRes.written ? { seo: `${name}.seo.json` } : {}),
    });
  }
  const manifestPath = path.join(dir, "site-manifest.json");
  await writeFile(manifestPath, JSON.stringify({ title: s.title ?? "Site", pages: manifest }, null, 2), "utf-8");
  const lines = manifest.map((m) => `  • ${m.title} → ${m.file} (${m.sections} sections, ${m.elements} elements)${m.seo ? ` + ${m.seo}` : ""}`);
  const seoNote = allSeoWarnings.length ? `\nSEO notes:\n  - ${allSeoWarnings.join("\n  - ")}` : "";
  return ok(`Built ${manifest.length} page(s) in ${dir}\n${lines.join("\n")}\nManifest: ${manifestPath}${seoNote}\nImport each .json into Elementor; apply each .seo.json at the WordPress/SEO-plugin level.`);
});

// ---------------------------------------------------------------------------
// learn_from_export — self-improving schema extraction
// ---------------------------------------------------------------------------
server.registerTool("learn_from_export", {
  title: "Learn from an Elementor export",
  description: "Ingest an Elementor JSON export and extract the settings schema of every widget it contains, merging into a persistent registry. Use this to teach the server the exact shape of widgets/settings not yet known (then get_widget_schema will show them). Provide a file path OR the JSON inline.",
  inputSchema: {
    path: z.string().optional().describe("Path to an Elementor export .json file."),
    json: z.any().optional().describe("The export object inline (alternative to path)."),
  },
}, async ({ path: filePath, json }) => {
  try {
    let doc: Record<string, unknown>;
    let source: string;
    if (filePath) {
      doc = JSON.parse(await readFile(filePath, "utf-8"));
      source = path.basename(filePath);
    } else if (json) {
      doc = coerceObject(json) as Record<string, unknown>;
      source = "inline";
    } else {
      return fail("Provide either `path` or `json`.");
    }
    if (!doc || !Array.isArray(doc.content)) {
      return fail("Not a valid Elementor export: missing a top-level `content` array.");
    }
    const { summary } = await learnFromDoc(doc as Parameters<typeof learnFromDoc>[0], source);
    return ok(summary);
  } catch (e: unknown) {
    return fail(`Learning failed: ${(e as Error).message}`);
  }
});

/** Deep-merge site-wide SEO defaults with a page's SEO overrides (page wins). */
function mergeSeo(base?: Record<string, unknown>, override?: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...(base ?? {}) };
  for (const [k, v] of Object.entries(override ?? {})) {
    if (v === undefined) continue;
    if (k === "business" && out.business && v && typeof v === "object") {
      out.business = { ...(out.business as Record<string, unknown>), ...(v as Record<string, unknown>) };
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Build the SEO sidecar for a page and write it next to the page .json. */
async function writeSeoSidecar(dir: string, fileBase: string, title: string, seo?: Record<string, unknown>): Promise<{ written: boolean; warnings: string[] }> {
  if (!seo || Object.keys(seo).length === 0) return { written: false, warnings: [] };
  const input = { title, ...seo };
  const sidecar = buildSeo(input as Parameters<typeof buildSeo>[0]);
  await writeFile(path.join(dir, `${fileBase}.seo.json`), JSON.stringify(sidecar, null, 2), "utf-8");
  return { written: true, warnings: sidecar.warnings };
}

function countNodes(nodes: Array<{ elements?: unknown }>): number {
  let n = 0;
  for (const node of nodes) {
    n += 1;
    if (Array.isArray(node.elements)) n += countNodes(node.elements as Array<{ elements?: unknown }>);
  }
  return n;
}

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------
async function main() {
  const transportMode = process.env.ELEMENTOR_MCP_TRANSPORT ?? "stdio";

  if (transportMode === "http" || transportMode === "streamable-http") {
    const port = parseInt(process.env.ELEMENTOR_MCP_PORT ?? "3001", 10);
    const httpServer = http.createServer(async (req, res) => {
      // Health check endpoint
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
        return;
      }
      // MCP endpoint — create a fresh transport per request (stateless mode)
      try {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await server.connect(transport);
        await transport.handleRequest(req, res);
      } catch (err) {
        console.error("Request handling error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      }
    });

    httpServer.listen(port, () => {
      console.error(`elementor-mcp server running on HTTP at http://localhost:${port}/ (transport: ${transportMode})`);
      console.error(`  Health check: http://localhost:${port}/health`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // stderr is safe for logging; stdout is the MCP channel.
    console.error("elementor-mcp server running on stdio");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});