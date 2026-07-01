/**
 * Compiler tests — verifies the core compilation pipeline works correctly
 * for both atomic (default) and classic (flat settings) formats.
 */
import { describe, it, expect } from "vitest";
import { compileBlueprint, compileSite, BlueprintNode } from "../compiler.js";
import { WIDGETS, WIDGET_BY_TYPE } from "../widgets.js";
import { TEMPLATES, TEMPLATE_INFO } from "../templates.js";
import { makeTestBlueprint, countAllNodes, hasAtomicType } from "./setup.js";

// ---------------------------------------------------------------------------

describe("Blueprint compilation", () => {
  it("compiles a blueprint to a valid document", () => {
    const bp = makeTestBlueprint();
    const doc = compileBlueprint(bp);
    expect(doc).toBeDefined();
    expect(doc.version).toBe("0.4");
    expect(doc.type).toBe("page");
    expect(Array.isArray(doc.content)).toBe(true);
    expect(doc.content.length).toBeGreaterThan(0);
    expect(doc.title).toBe("Test Page");
  });

  it("all widget types compile without error", () => {
    // Test each widget type that can be compiled standalone
    const testWidgets: BlueprintNode[] = [
      { type: "heading", level: 1, text: "Heading" },
      { type: "text", text: "Paragraph" },
      { type: "button", text: "Button", href: "/go" },
      { type: "image", src: "https://example.com/img.jpg" },
      { type: "svg", src: "https://example.com/icon.svg" },
      { type: "divider" },
      { type: "html", html: "<p>HTML</p>" },
      { type: "icon", iconName: "fa-star" },
      { type: "icon-list", items: [{ iconName: "fa-check", text: "Item" }] },
      { type: "image-box", image: { src: "https://example.com/img.jpg" }, heading: { text: "Title" }, description: "Desc" },
      { type: "social-icons", items: [{ iconName: "fa-facebook", url: "https://fb.com" }] },
      { type: "accordion", items: [{ label: "Q1", content: "A1" }] },
      { type: "youtube", src: "https://youtube.com/watch?v=test" },
      { type: "video", src: "https://example.com/vid.mp4" },
    ];
    for (const node of testWidgets) {
      const doc = compileBlueprint({ title: "Widget Test", tree: [node] });
      expect(doc.content.length).toBe(1);
    }
  });

  it("classic format produces flat settings (no $$type)", () => {
    const bp = makeTestBlueprint({
      format: "classic",
      tree: [
        {
          type: "section",
          children: [
            { type: "heading", level: 1, text: "Hello", style: { fontSize: "2rem", color: "#000" } },
            { type: "text", text: "World" },
            { type: "button", text: "Click" },
          ],
        },
      ],
    });
    const doc = compileBlueprint(bp);
    expect(doc.content[0].elType).toBe("container");

    // No $$type anywhere in the content
    const blob = JSON.stringify(doc.content);
    expect(blob).not.toContain("$$type");

    // Widget types are classic names
    const section = doc.content[0] as { elements: Array<{ widgetType?: string }> };
    expect(section.elements[0].widgetType).toBe("heading");
    expect(section.elements[1].widgetType).toBe("text-editor");
    expect(section.elements[2].widgetType).toBe("button");
  });

  it("classic format uses 7-char hex IDs", () => {
    const bp = makeTestBlueprint({ format: "classic" });
    const doc = compileBlueprint(bp);
    expect(doc.content[0].id).toMatch(/^[0-9a-f]{7}$/);
  });

  it("classic format uses _tablet/_mobile suffixes for responsive", () => {
    const bp = makeTestBlueprint({
      format: "classic",
      tree: [
        {
          type: "heading",
          level: 1,
          text: "Responsive",
          style: { fontSize: "2rem", mobile: { fontSize: "1.5rem" } },
        },
      ],
    });
    const doc = compileBlueprint(bp);
    const heading = doc.content[0] as { settings: Record<string, unknown> };
    expect(heading.settings.typography_font_size_mobile).toBeDefined();
  });
});

describe("Motion effects", () => {
  it("entrance animation produces flat settings", () => {
    const doc = compileBlueprint({
      title: "Motion Test",
      tree: [{ type: "heading", level: 1, text: "Animated", motion: { entrance: "fadeInUp", entranceDuration: 0.8 } }],
    });
    const heading = doc.content[0] as { settings: Record<string, unknown> };
    expect(heading.settings._animation).toBe("fadeInUp");
    expect(heading.settings.animation_duration).toBe(0.8);
  });

  it("hover animation produces _hover_animation setting", () => {
    const doc = compileBlueprint({
      title: "Hover Test",
      tree: [{ type: "heading", level: 1, text: "Hover Me", motion: { hover: "grow" } }],
    });
    const heading = doc.content[0] as { settings: Record<string, unknown> };
    expect(heading.settings._hover_animation).toBe("grow");
  });

  it("scroll effects produce motion_fx_* settings", () => {
    const doc = compileBlueprint({
      title: "Scroll Test",
      tree: [{ type: "heading", level: 1, text: "Scroll Me", motion: { scroll: { translateY: { direction: "up", speed: 5 } } } as any }],
    });
    const heading = doc.content[0] as { settings: Record<string, unknown> };
    expect(heading.settings.motion_fx_motion_fx_scrolling).toBe("yes");
    expect(heading.settings.motion_fx_translateY_effect).toBe("yes");
  });
});

describe("Global widgets", () => {
  it("global widget definitions resolve correctly", () => {
    const doc = compileBlueprint({
      title: "Globals Test",
      globals: {
        ctaBtn: { type: "button", style: { color: "#fff", background: "#E8743B" } },
      },
      tree: [
        { type: "button", global: "ctaBtn", text: "Click Me" },
        { type: "button", global: "ctaBtn", text: "Another", href: "/go" },
      ],
    });
    expect(doc.content.length).toBe(2);
    const btn1 = doc.content[0] as { widgetType: string; settings: Record<string, unknown> };
    expect(btn1.widgetType).toBe("e-button");
    expect((btn1.settings.text as any).value.content.value).toBe("Click Me");
  });
});

describe("Keyframes", () => {
  it("blueprint-level keyframes appear in custom_css", () => {
    const doc = compileBlueprint({
      title: "Keyframes Test",
      keyframes: [{ name: "shimmer", steps: { "0%": { opacity: "0" }, "100%": { opacity: "1" } } }],
      tree: [{ type: "heading", level: 1, text: "Shimmer" }],
    });
    expect(typeof doc.page_settings).toBe("object");
    expect((doc.page_settings as Record<string, string>).custom_css).toContain("@keyframes shimmer");
  });

  it("node-level keyframes are collected at page level", () => {
    const doc = compileBlueprint({
      title: "Node Keyframes",
      tree: [{
        type: "section",
        children: [{
          type: "button",
          text: "Pulse",
          keyframes: [{ name: "pulse", steps: { "0%": { opacity: "1" }, "50%": { opacity: "0.5" } } }],
        }],
      }],
    });
    expect((doc.page_settings as Record<string, string>).custom_css).toContain("@keyframes pulse");
  });
});

describe("Dynamic tags", () => {
  it("dynamic tags produce __dynamic__ settings", () => {
    const doc = compileBlueprint({
      title: "Dynamic Test",
      tree: [{
        type: "heading",
        level: 1,
        text: "Fallback",
        dynamic: { title: { tag: "post-title" } },
      }],
    });
    const heading = doc.content[0] as { settings: Record<string, unknown> };
    expect(heading.settings.__dynamic__).toBeDefined();
    expect(typeof (heading.settings.__dynamic__ as Record<string, string>).title).toBe("string");
    expect((heading.settings.__dynamic__ as Record<string, string>).title).toContain("[elementor-tag");
  });
});

describe("CSS custom properties", () => {
  it("CSS custom properties appear in page_settings", () => {
    const doc = compileBlueprint({
      title: "CSS Vars Test",
      cssVars: { "brand-color": "#FF0000" },
      tree: [{ type: "heading", level: 1, text: "Test" }],
    });
    expect(typeof doc.page_settings).toBe("object");
    expect((doc.page_settings as Record<string, string>).custom_css).toContain("--brand-color: #FF0000;");
  });
});

describe("Template expansion", () => {
  it("all templates expand without error", () => {
    for (const info of TEMPLATE_INFO) {
      const fn = TEMPLATES[info.name];
      expect(fn).toBeDefined();
      // Use the example params from TEMPLATE_INFO
      const node = fn(info.example);
      expect(node).toBeDefined();
      // Compile the expanded template
      const doc = compileBlueprint({
        title: `Template ${info.name}`,
        theme: {
          shadow: { soft: '0 2px 8px rgba(0,0,0,0.1)', card: '0 4px 12px rgba(0,0,0,0.1)' },
          radius: { md: '0.5rem', lg: '1rem' },
        },
        tree: [node],
      });
      expect(doc.content.length).toBeGreaterThan(0);
    }
  });
});

describe("Site compilation", () => {
  it("site compilation produces correct number of pages", () => {
    const pages = compileSite({
      theme: { colors: { accent: "#F60" } },
      header: [{ type: "template", template: "navbar", params: { brand: "Acme", links: [{ text: "Home", href: "/" }] } }],
      footer: [{ type: "template", template: "footer", params: { columns: [{ heading: "Co", links: [{ text: "About", href: "/about" }] }], copyright: "© 2026" } }],
      pages: [
        { title: "Home", tree: [{ type: "template", template: "hero", params: { heading: "Hi", text: "Yo" } }] },
        { title: "About", tree: [{ type: "template", template: "feature-grid", params: { heading: "Why", items: [{ title: "A", text: "a" }] } }] },
        { title: "Contact", tree: [{ type: "template", template: "contact", params: {} }] },
      ],
    });
    expect(pages.length).toBe(3);
    expect(pages[0].title).toBe("Home");
    expect(pages[1].title).toBe("About");
    expect(pages[2].title).toBe("Contact");
  });

  it("site with classic format passes format to pages", () => {
    const pages = compileSite({
      format: "classic",
      theme: { colors: { accent: "#F60" } },
      pages: [
        { title: "P1", tree: [{ type: "heading", level: 1, text: "Hello" }] },
      ],
    });
    expect(pages.length).toBe(1);
    // In classic format, elType should be container, not widget with $$type
    const blob = JSON.stringify(pages[0].document.content);
    expect(blob).not.toContain("$$type");
  });
});