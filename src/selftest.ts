// @ts-nocheck
/**
 * Self-test: compile a representative landing page and assert the output matches
 * the structural conventions of real Elementor v4 exports. Also writes the
 * result to examples/sample-home.json for inspection / import.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileBlueprint, compileSite, BlueprintNode } from "./compiler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const blueprint = {
  title: "Acme HR — Home",
  fileName: "sample-home",
  theme: {
    colors: {
      primary: "#1A2D5A",
      accent: "#E8743B",
      bg: "#FFFFFF",
      surface: "#F6F8FB",
      text: "#1A1A1A",
      muted: "#5B6472",
    },
    radius: { md: "1rem", lg: "1.75rem" },
  },
  tree: [
    // HERO
    {
      type: "section",
      title: "Hero",
      style: { background: "{colors.bg}", padding: { top: "5rem", bottom: "5rem" }, mobile: { padding: { top: "2.5rem", bottom: "2.5rem" } } },
      children: [
        {
          type: "flex",
          direction: "row",
          style: { gap: "3rem", alignItems: "center", maxWidth: "1200px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" }, mobile: { flexDirection: "column" } },
          children: [
            {
              type: "flex",
              direction: "column",
              style: { gap: "1.5rem" },
              children: [
                { type: "heading", level: 1, text: "HR Consulting for Growing Businesses", style: { fontSize: "3rem", fontWeight: "700", color: "{colors.primary}", lineHeight: "1.1", mobile: { fontSize: "2rem" } } },
                { type: "text", text: "Expert guidance tailored to your team — compliance, hiring, and culture handled.", style: { fontSize: "1.125rem", color: "{colors.muted}", maxWidth: "55ch" } },
                {
                  type: "button",
                  text: "Schedule a Consultation",
                  style: { color: "#fff", background: "{colors.accent}", fontWeight: "700", padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" }, borderRadius: "{radius.md}", hover: { background: "#cf5f2b" } },
                },
              ],
            },
            { type: "image", src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800", style: { borderRadius: "{radius.lg}", boxShadow: "0 10px 40px rgba(26,45,90,0.10)", width: "100%" } },
          ],
        },
      ],
    },
    // FEATURES
    {
      type: "section",
      title: "Services",
      style: { background: "{colors.surface}", padding: { top: "4rem", bottom: "4rem" } },
      children: [
        {
          type: "flex",
          direction: "column",
          style: { gap: "2.5rem", maxWidth: "1200px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" } },
          children: [
            { type: "heading", level: 2, text: "What we do", style: { fontSize: "2.25rem", fontWeight: "700", color: "{colors.primary}", textAlign: "center" } },
            {
              type: "flex",
              direction: "row",
              style: { gap: "2rem", flexWrap: "wrap", mobile: { flexDirection: "column" } },
              children: [
                card("Compliance", "Stay audit-ready with policies that fit your state."),
                card("Hiring", "Attract and onboard the right people, faster."),
                card("Culture", "Build a workplace people don't want to leave."),
              ],
            },
          ],
        },
      ],
    },
    // CTA BAND
    {
      type: "section",
      title: "CTA",
      style: { background: "{colors.primary}", padding: { top: "4rem", bottom: "4rem" } },
      children: [
        {
          type: "flex",
          direction: "column",
          style: { gap: "1.5rem", alignItems: "center", maxWidth: "800px", width: "100%", margin: "0 auto", textAlign: "center" },
          children: [
            { type: "heading", level: 2, text: "Ready to simplify HR?", style: { fontSize: "2.25rem", fontWeight: "700", color: "#fff" } },
            { type: "button", text: "Get Started", style: { color: "{colors.primary}", background: "#fff", fontWeight: "700", padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" }, borderRadius: "{radius.md}" } },
          ],
        },
      ],
    },
    // CONTACT FORM
    {
      type: "section",
      title: "Contact",
      style: { background: "{colors.bg}", padding: { top: "4rem", bottom: "4rem" } },
      children: [
        {
          type: "form",
          name: "Contact Form",
          email: { to: "hello@acmehr.com", subject: "New enquiry" },
          style: { gap: "1rem", maxWidth: "560px", width: "100%", margin: "0 auto" },
          children: [
            { type: "label", text: "Full Name", for: "name" },
            { type: "input", inputType: "text", placeholder: "Jane Doe", required: true, cssId: "name" },
            { type: "label", text: "Email", for: "email" },
            { type: "input", inputType: "email", placeholder: "you@example.com", required: true, cssId: "email" },
            { type: "submit", text: "Send Message", style: { color: "#fff", background: "{colors.accent}", fontWeight: "700", padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" }, borderRadius: "{radius.md}" } },
          ],
        },
      ],
    },
  ],
};

function card(title: string, body: string): BlueprintNode {
  return {
    type: "flex",
    direction: "column",
    style: { gap: "0.75rem", background: "#fff", padding: "2rem", borderRadius: "1rem", boxShadow: "0 10px 40px rgba(26,45,90,0.08)", css: "flex: 1 1 280px;" },
    children: [
      { type: "heading", level: 3, text: title, style: { fontSize: "1.5rem", fontWeight: "600", color: "{colors.primary}" } },
      { type: "text", text: body, style: { color: "{colors.muted}" } },
    ],
  };
}

// ----- run + assertions -----
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error("ASSERT FAILED: " + msg);
}

const doc = compileBlueprint(blueprint);

assert(doc.version === "0.4", "doc version is 0.4");
assert(doc.type === "page", "doc type is page");
assert(Array.isArray(doc.content) && doc.content.length === 4, "4 top-level sections");

const hero = doc.content[0];
assert(hero.elType === "e-div-block" && hero.widgetType === undefined, "section is e-div-block with no widgetType");
assert(typeof hero.id === "string" && hero.id.length === 8, "8-char id");

const heroFlex = hero.elements[0];
assert(heroFlex.elType === "e-flexbox", "flex is e-flexbox");
const flexClass = heroFlex.settings.classes.value[0];
assert(/^e-[0-9a-f]{8}-[0-9a-f]{7}$/.test(flexClass), "class name format");
assert(heroFlex.styles[flexClass].variants.length >= 1, "flex has style variants");

// token resolution + custom_css routing
const heading = heroFlex.elements[0].elements[0];
assert(heading.widgetType === "e-heading", "heading widgetType");
assert(heading.settings.title.value.content.value.includes("HR Consulting"), "heading text");
const hClass = heading.settings.classes.value[0];
const hVariant = heading.styles[hClass].variants[0];
assert(hVariant.props["font-size"].$$type === "size", "font-size is native size prop");
assert(hVariant.props["color"].$$type === "color", "color is native color prop");
assert(hVariant.props["color"].value === "#1A2D5A", "token-resolved color value: " + hVariant.props["color"].value);
// line-height is now a native size prop (in SIZE_PROPS), not custom_css
assert(hVariant.props["line-height"].$$type === "size", "line-height is native size prop");
assert(hVariant.custom_css === null, "no custom_css on heading (line-height is native)");

// responsive variant present (mobile font-size)
const mobileVariant = heading.styles[hClass].variants.find((v: { meta: { breakpoint: string } }) => v.meta.breakpoint === "mobile");
assert(!!mobileVariant, "mobile variant exists");

// border-radius native prop; box-shadow is now a native prop; background is now a native prop
const heroImg = heroFlex.elements[1];
assert(heroImg.widgetType === "e-image", "hero image widgetType");
const imgClass = heroImg.settings.classes.value[0];
const imgVariant = heroImg.styles[imgClass].variants[0];
assert(imgVariant.props["border-radius"].$$type === "border-radius", "border-radius is native prop");
assert(imgVariant.props["border-radius"].value["start-start"].$$type === "size", "border-radius corner is a size");
assert(imgVariant.props["box-shadow"].$$type === "box-shadow", "box-shadow is native prop");
assert(imgVariant.props["box-shadow"].value.horizontal.$$type === "size", "box-shadow horizontal is a size");
assert(imgVariant.props["box-shadow"].value.color.value === "rgba(26,45,90,0.10)", "box-shadow color parsed");
// background string is emitted as native background prop with type "classic"
const heroSection = doc.content[0];
const heroSectionClass = heroSection.settings.classes.value[0];
const heroSectionVariant = heroSection.styles[heroSectionClass].variants[0];
assert(heroSectionVariant.props["background"].$$type === "background", "background is native prop");
assert(heroSectionVariant.props["background"].value.background_type.value === "classic", "background type is classic");
assert(heroSectionVariant.props["background"].value.color.value === "#FFFFFF", "background color resolved");

// hover variant on hero button
const heroBtn = heroFlex.elements[0].elements[2];
assert(heroBtn.widgetType === "e-button", "button widgetType");
const bClass = heroBtn.settings.classes.value[0];
const hoverVariant = heroBtn.styles[bClass].variants.find((v: { meta: { state: string } }) => v.meta.state === "hover");
assert(!!hoverVariant, "hover variant exists on button");

// form structure
const form = doc.content[3].elements[0];
assert(form.elType === "e-form" && form.widgetType === undefined, "form is elType-style e-form");
assert(form.settings["form-name"].value === "Contact Form", "form name");
assert(form.settings.email.$$type === "email", "form email typed");
assert(form.elements.length === 5, "form has 5 children");

// ----- new widgets: link / svg / video / tabs / classic -----
const extra = compileBlueprint({
  title: "Extra",
  tree: [
    { type: "button", text: "Go", href: "https://acme.com", targetBlank: true },
    { type: "svg", src: "https://acme.com/i.svg" },
    { type: "video", src: "https://acme.com/v.mp4" },
    { type: "tabs", defaultTab: 1, tabs: [
      { label: "One", children: [{ type: "text", text: "first" }] },
      { label: "Two", children: [{ type: "heading", level: 3, text: "Second" }] },
    ] },
    { type: "price-table", props: { heading: "Pro", price: "39", features_list: [{ item_text: "A" }] } },
    { type: "checkbox", fieldName: "agree", value: "yes", required: true },
    { type: "file-upload", fileTypes: "pdf,jpg" },
  ],
});
const [btn, svg, vid, tabs, price, cb, file] = extra.content;
assert(btn.settings.link.$$type === "link", "button link is link prop");
assert(btn.settings.link.value.destination.value === "https://acme.com", "link destination");
assert(btn.settings.link.value.isTargetBlank.value === true, "link target blank");
assert(svg.settings.svg.$$type === "svg-src", "svg uses svg-src");
assert(vid.settings.video.$$type === "video-src", "video uses video-src");
assert(tabs.elType === "e-tabs" && tabs.elements[0].elType === "e-tabs-menu", "tabs scaffold");
assert(tabs.elements[0].elements.length === 2 && tabs.elements[1].elements.length === 2, "tab/panel counts match");
assert(tabs.settings["default-active-tab"].value === 1, "default tab index");
assert(price.elType === "widget" && price.widgetType === "price-table" && price.styles === undefined, "price-table is classic minimal");
assert(Array.isArray(price.settings.features_list) && price.settings.features_list[0]._id, "features_list item _id auto-filled");
assert(cb.widgetType === "e-form-checkbox" && cb.settings.name.value === "agree" && cb.settings.value.value === "yes", "checkbox name/value");
assert(file.widgetType === "e-form-file-upload" && file.settings["file-types"].value === "pdf,jpg", "file-upload file-types");

// ----- NEW TIER 1 WIDGET TESTS -----

// 1. Icon (e-icon) — Free atomic widget
const iconTest = compileBlueprint({
  title: "IconTest",
  tree: [{ type: "icon", iconName: "fa-star", library: "fa-solid", style: { color: "{colors.accent}", fontSize: "2rem" } }],
});
const iconNode = iconTest.content[0];
assert(iconNode.widgetType === "e-icon", "icon widgetType is e-icon");
assert(iconNode.settings.icon_name.value === "fa-star", "icon_name setting");
assert(iconNode.settings.library.value === "fa-solid", "library setting");
assert(iconNode.settings.classes !== undefined, "icon has style classes");

// 2. Icon List (e-icon-list) — Free atomic widget
const iconListTest = compileBlueprint({
  title: "IconListTest",
  tree: [{ type: "icon-list", items: [{ iconName: "fa-check", text: "Done" }, { iconName: "fa-star", text: "Star" }] }],
});
const iconListNode = iconListTest.content[0];
assert(iconListNode.widgetType === "e-icon-list", "icon-list widgetType is e-icon-list");
assert(Array.isArray(iconListNode.settings.icon_list), "icon_list is array");
assert(iconListNode.settings.icon_list.length === 2, "icon_list has 2 items");
assert(iconListNode.settings.icon_list[0].icon_name.value === "fa-check", "first item icon_name");
assert(iconListNode.settings.icon_list[0].text.value === "Done", "first item text");
assert(iconListNode.settings.icon_list[0]._id !== undefined, "first item has _id");

// 3. Image Box (e-image-box) — Free atomic widget
const imageBoxTest = compileBlueprint({
  title: "ImageBoxTest",
  tree: [{
    type: "image-box",
    image: { src: "https://example.com/img.jpg", alt: "desc" },
    heading: { text: "Title", tag: "h3" },
    description: "Some description text.",
    link: { href: "https://example.com", targetBlank: true },
  }],
});
const imageBoxNode = imageBoxTest.content[0];
assert(imageBoxNode.widgetType === "e-image-box", "image-box widgetType is e-image-box");
assert(imageBoxNode.settings.image.$$type === "image", "image-box has image setting");
assert(imageBoxNode.settings.title.value.content.value === "Title", "image-box heading text");
assert(imageBoxNode.settings.title_tag.value === "h3", "image-box heading tag");
assert(imageBoxNode.settings.description.value.content.value === "Some description text.", "image-box description");
assert(imageBoxNode.settings.link.$$type === "link", "image-box has link");

// 4. Social Icons (e-social-icons) — Free atomic widget
const socialTest = compileBlueprint({
  title: "SocialTest",
  tree: [{ type: "social-icons", items: [{ iconName: "fa-facebook", url: "https://fb.com", label: "FB" }, { iconName: "fa-twitter", url: "https://twitter.com" }] }],
});
const socialNode = socialTest.content[0];
assert(socialNode.widgetType === "e-social-icons", "social-icons widgetType is e-social-icons");
assert(Array.isArray(socialNode.settings.social_icon_list), "social_icon_list is array");
assert(socialNode.settings.social_icon_list.length === 2, "social_icon_list has 2 items");
assert(socialNode.settings.social_icon_list[0].icon_name.value === "fa-facebook", "first social icon_name");
assert(socialNode.settings.social_icon_list[0].url.value === "https://fb.com", "first social url");
assert(socialNode.settings.social_icon_list[0].label.value === "FB", "first social label");

// 5. Accordion (e-accordion) — Free atomic widget
const accordionTest = compileBlueprint({
  title: "AccordionTest",
  tree: [{ type: "accordion", items: [{ label: "Q1", content: "Answer 1", defaultActive: true }, { label: "Q2", content: "Answer 2" }] }],
});
const accordionNode = accordionTest.content[0];
assert(accordionNode.widgetType === "e-accordion", "accordion widgetType is e-accordion");
assert(Array.isArray(accordionNode.settings.tabs), "accordion tabs is array");
assert(accordionNode.settings.tabs.length === 2, "accordion has 2 tabs");
assert(accordionNode.settings.tabs[0].tab_title.value === "Q1", "first tab title");
assert(accordionNode.settings.tabs[0].tab_content.value.content.value === "Answer 1", "first tab content");
assert(accordionNode.settings.tabs[0].default_active.value === true, "first tab default active");

// 6. Slides (slides) — Classic Pro widget
const slidesTest = compileBlueprint({
  title: "SlidesTest",
  tree: [{ type: "slides", props: { slides: [{ heading: "Slide 1", subheading: "Sub 1", buttonText: "Go", buttonLink: "/go" }, { heading: "Slide 2" }] } }],
});
const slidesNode = slidesTest.content[0];
assert(slidesNode.widgetType === "slides", "slides widgetType is slides");
assert(slidesNode.styles === undefined, "slides is classic (no styles)");
assert(Array.isArray(slidesNode.settings.slides), "slides has slides array");
assert(slidesNode.settings.slides.length === 2, "slides has 2 items");
assert(slidesNode.settings.slides[0].heading === "Slide 1", "first slide heading");
assert(slidesNode.settings.slides[0]._id !== undefined, "first slide has _id");

// 7. Carousel (media-carousel) — Classic Pro widget
const carouselTest = compileBlueprint({
  title: "CarouselTest",
  tree: [{ type: "carousel", props: { images: [{ url: "https://example.com/1.jpg", caption: "Cap 1" }, { url: "https://example.com/2.jpg" }] } }],
});
const carouselNode = carouselTest.content[0];
assert(carouselNode.widgetType === "media-carousel", "carousel widgetType is media-carousel");
assert(Array.isArray(carouselNode.settings.images), "carousel has images array");
assert(carouselNode.settings.images.length === 2, "carousel has 2 images");
assert(carouselNode.settings.images[0].url === "https://example.com/1.jpg", "first image url");
assert(carouselNode.settings.images[0].caption === "Cap 1", "first image caption");

// 8. Portfolio (portfolio) — Classic Pro widget
const portfolioTest = compileBlueprint({
  title: "PortfolioTest",
  tree: [{ type: "portfolio", props: { heading: "Our Work" } }],
});
const portfolioNode = portfolioTest.content[0];
assert(portfolioNode.widgetType === "portfolio", "portfolio widgetType is portfolio");
assert(portfolioNode.settings.heading === "Our Work", "portfolio heading");

// 9. Call to Action (call-to-action) — Classic Pro widget
const ctaTest = compileBlueprint({
  title: "CTATest",
  tree: [{ type: "call-to-action", props: { heading: "Act Now", description: "Limited time", button_text: "Go" } }],
});
const ctaNode = ctaTest.content[0];
assert(ctaNode.widgetType === "call-to-action", "call-to-action widgetType is call-to-action");
assert(ctaNode.settings.heading === "Act Now", "cta heading");
assert(ctaNode.settings.description === "Limited time", "cta description");
assert(ctaNode.settings.button_text === "Go", "cta button_text");

// ----- CSS Custom Properties / Dark Mode tests -----

// The main blueprint has a theme with colors, radius, fonts, and shadow.
// Verify that page_settings includes css_custom_properties and custom_css.
assert(typeof doc.page_settings === "object" && !Array.isArray(doc.page_settings), "page_settings is an object (not array) when css vars present");
assert(typeof doc.page_settings.custom_css === "string", "page_settings.custom_css is a string");
assert(doc.page_settings.custom_css.startsWith(":root {"), "custom_css starts with :root {");
assert(doc.page_settings.custom_css.includes("--color-primary: #1A2D5A;"), "custom_css includes --color-primary");
assert(doc.page_settings.custom_css.includes("--color-accent: #E8743B;"), "custom_css includes --color-accent");
assert(doc.page_settings.custom_css.includes("--color-bg: #FFFFFF;"), "custom_css includes --color-bg");
assert(doc.page_settings.custom_css.includes("--color-surface: #F6F8FB;"), "custom_css includes --color-surface");
assert(doc.page_settings.custom_css.includes("--color-text: #1A1A1A;"), "custom_css includes --color-text");
assert(doc.page_settings.custom_css.includes("--color-muted: #5B6472;"), "custom_css includes --color-muted");
assert(doc.page_settings.custom_css.includes("--radius-md: 1rem;"), "custom_css includes --radius-md");
assert(doc.page_settings.custom_css.includes("--radius-lg: 1.75rem;"), "custom_css includes --radius-lg");
assert(doc.page_settings.custom_css.includes("--font-heading:"), "custom_css includes --font-heading");
assert(doc.page_settings.custom_css.includes("--font-body:"), "custom_css includes --font-body");
assert(doc.page_settings.custom_css.includes("--shadow-card:"), "custom_css includes --shadow-card");
assert(typeof doc.page_settings.css_custom_properties === "string", "page_settings.css_custom_properties is a string");
assert(!doc.page_settings.css_custom_properties.includes(":root"), "css_custom_properties does not contain :root wrapper");

// Test with explicit cssVars
const cssVarsTest = compileBlueprint({
  title: "CSS Vars Test",
  cssVars: {
    "color-primary": "#FF0000",
    "custom-spacing": "2rem",
  },
  tree: [{ type: "heading", level: 1, text: "Test" }],
});
assert(typeof cssVarsTest.page_settings === "object" && !Array.isArray(cssVarsTest.page_settings), "cssVarsTest page_settings is object");
assert(cssVarsTest.page_settings.custom_css.includes("--color-primary: #FF0000;"), "cssVarsTest includes explicit --color-primary");
assert(cssVarsTest.page_settings.custom_css.includes("--custom-spacing: 2rem;"), "cssVarsTest includes --custom-spacing");
// Theme defaults should also be present (from DEFAULT_THEME)
assert(cssVarsTest.page_settings.custom_css.includes("--color-bg:"), "cssVarsTest includes theme default --color-bg");

// Test without theme (no css vars expected)
const noThemeTest = compileBlueprint({
  title: "No Theme",
  tree: [{ type: "heading", level: 1, text: "Plain" }],
});
// Without a theme, DEFAULT_THEME is still applied, so css vars will be present
assert(typeof noThemeTest.page_settings === "object" && !Array.isArray(noThemeTest.page_settings), "noThemeTest page_settings is object");
assert(typeof noThemeTest.page_settings.custom_css === "string", "noThemeTest has custom_css from defaults");

console.log("CSS custom properties tests passed.");

// ----- TEMPLATE TYPE SUPPORT TESTS -----

// ----- DYNAMIC TAG TESTS -----

// 1. Dynamic tag on a heading
const dynamicHeadingTest = compileBlueprint({
  title: "DynamicHeadingTest",
  tree: [{
    type: "heading",
    level: 1,
    text: "Fallback Title",
    dynamic: {
      title: { tag: "post-title" },
    },
  }],
});
const dynHeading = dynamicHeadingTest.content[0];
assert(dynHeading.widgetType === "e-heading", "dynamic heading widgetType");
assert(typeof dynHeading.settings.__dynamic__ === "object" && dynHeading.settings.__dynamic__ !== null, "heading has __dynamic__");
assert(typeof dynHeading.settings.__dynamic__.title === "string", "__dynamic__.title is a string");
assert(dynHeading.settings.__dynamic__.title.startsWith("[elementor-tag id=\""), "__dynamic__.title starts with elementor-tag");
assert(dynHeading.settings.__dynamic__.title.includes("name=\"post-title\""), "__dynamic__.title has name=post-title");
assert(dynHeading.settings.__dynamic__.title.includes("settings=\"%7B%7D\""), "__dynamic__.title has empty settings");
// Fallback text should still be present
assert(dynHeading.settings.title.value.content.value === "Fallback Title", "heading still has fallback text");

// 2. Dynamic tag with settings
const dynamicWithSettingsTest = compileBlueprint({
  title: "DynamicWithSettingsTest",
  tree: [{
    type: "heading",
    level: 2,
    text: "Fallback",
    dynamic: {
      title: { tag: "post-title", settings: { before: "Page: " } },
    },
  }],
});
const dynWithSettings = dynamicWithSettingsTest.content[0];
assert(dynWithSettings.settings.__dynamic__.title.includes("name=\"post-title\""), "settings dynamic has name=post-title");
assert(dynWithSettings.settings.__dynamic__.title.includes("before"), "settings dynamic includes 'before' key");
assert(dynWithSettings.settings.__dynamic__.title.includes("Page%3A%20"), "settings dynamic includes encoded 'Page: '");

// 3. Multiple dynamic tags on one element
const multiDynamicTest = compileBlueprint({
  title: "MultiDynamicTest",
  tree: [{
    type: "image",
    src: "https://example.com/fallback.jpg",
    dynamic: {
      image: { tag: "post-featured-image" },
      caption: { tag: "post-title" },
    },
  }],
});
const multiDyn = multiDynamicTest.content[0];
assert(multiDyn.widgetType === "e-image", "multi-dynamic image widgetType");
assert(typeof multiDyn.settings.__dynamic__.image === "string", "multi-dynamic has image key");
assert(typeof multiDyn.settings.__dynamic__.caption === "string", "multi-dynamic has caption key");
assert(multiDyn.settings.__dynamic__.image.includes("name=\"post-featured-image\""), "image dynamic has name=post-featured-image");
assert(multiDyn.settings.__dynamic__.caption.includes("name=\"post-title\""), "caption dynamic has name=post-title");

// 4. No __dynamic__ when dynamic is not set
const noDynamicTest = compileBlueprint({
  title: "NoDynamicTest",
  tree: [{ type: "heading", level: 1, text: "Static" }],
});
const noDyn = noDynamicTest.content[0];
assert(noDyn.settings.__dynamic__ === undefined, "no __dynamic__ when dynamic not set");

console.log("Dynamic tag tests passed.");

// Test header type blueprint
const headerBlueprint = compileBlueprint({
  title: "Site Header",
  type: "header",
  tree: [{ type: "section", tag: "header", children: [{ type: "heading", level: 1, text: "Brand" }] }],
});
assert(headerBlueprint.type === "header", "header blueprint type is 'header'");
assert(Array.isArray(headerBlueprint.conditions), "header has conditions array");
assert(headerBlueprint.conditions!.length === 1, "header has 1 condition");
assert(headerBlueprint.conditions![0].include === "include", "header condition include");
assert(headerBlueprint.conditions![0].name === "general", "header condition name is 'general'");

// Test footer type blueprint
const footerBlueprint = compileBlueprint({
  title: "Site Footer",
  type: "footer",
  tree: [{ type: "section", tag: "footer", children: [{ type: "text", text: "Copyright" }] }],
});
assert(footerBlueprint.type === "footer", "footer blueprint type is 'footer'");
assert(Array.isArray(footerBlueprint.conditions), "footer has conditions array");
assert(footerBlueprint.conditions![0].name === "general", "footer condition name is 'general'");

// Test single type blueprint
const singleBlueprint = compileBlueprint({
  title: "Single Post",
  type: "single",
  tree: [{ type: "heading", level: 1, text: "Post Title" }],
});
assert(singleBlueprint.type === "single", "single blueprint type is 'single'");
assert(Array.isArray(singleBlueprint.conditions), "single has conditions array");
assert(singleBlueprint.conditions![0].name === "singular", "single condition name is 'singular'");

// Test archive type blueprint
const archiveBlueprint = compileBlueprint({
  title: "Archive",
  type: "archive",
  tree: [{ type: "heading", level: 1, text: "Archive" }],
});
assert(archiveBlueprint.type === "archive", "archive blueprint type is 'archive'");
assert(Array.isArray(archiveBlueprint.conditions), "archive has conditions array");
assert(archiveBlueprint.conditions![0].name === "archive", "archive condition name is 'archive'");

// Test custom conditions override
const customConditionsBlueprint = compileBlueprint({
  title: "Custom Header",
  type: "header",
  conditions: [{ include: "include", name: "singular", sub_name: "page" }],
  tree: [{ type: "heading", level: 1, text: "Page Header" }],
});
assert(customConditionsBlueprint.type === "header", "custom conditions blueprint type is 'header'");
assert(customConditionsBlueprint.conditions!.length === 1, "custom conditions has 1 condition");
assert(customConditionsBlueprint.conditions![0].name === "singular", "custom condition name is 'singular'");
assert(customConditionsBlueprint.conditions![0].sub_name === "page", "custom condition sub_name is 'page'");

// Test page type does NOT have conditions
const pageBlueprint = compileBlueprint({
  title: "Regular Page",
  type: "page",
  tree: [{ type: "heading", level: 1, text: "Hello" }],
});
assert(pageBlueprint.conditions === undefined, "page blueprint has no conditions");

// ----- templates + multi-page site -----
const site = compileSite({
  theme: { colors: { accent: "#F60" } },
  header: [{ type: "template", template: "navbar", params: { brand: "Acme", links: [{ text: "Home", href: "/" }] } }],
  footer: [{ type: "template", template: "footer", params: { columns: [{ heading: "Co", links: [{ text: "About", href: "/about" }] }], copyright: "© 2026" } }],
  pages: [
    { title: "Home", tree: [{ type: "template", template: "hero", params: { heading: "Hi", text: "Yo", primaryCta: { text: "Go", href: "/x" } } }] },
    { title: "About", tree: [{ type: "template", template: "feature-grid", params: { heading: "Why", items: [{ title: "A", text: "a" }] } }] },
  ],
});
assert(site.length === 2, "site has 2 pages");
const home = site[0].document;
assert(home.content[0].settings.tag.value === "header", "header injected first");
assert(home.content[home.content.length - 1].settings.tag.value === "footer", "footer injected last");
assert(home.content.length === 3, "home = header + hero + footer");
const blob = JSON.stringify(site);
assert(!/\{[a-zA-Z]+\.[a-zA-Z]+\}/.test(blob), "no unresolved tokens in site");
assert(blob.includes("#5B6472"), "default theme token applied where not overridden");
assert(blob.includes("#F60"), "site theme override applied");

console.log("All assertions passed.");
console.log("New Tier 1 widgets verified: icon, icon-list, image-box, social-icons, accordion, slides, carousel, portfolio, call-to-action");
console.log("Template type support verified: page, header, footer, single, archive");

// ----- @keyframes injection tests -----

// 1. Blueprint-level keyframes
const keyframesTest = compileBlueprint({
  title: "KeyframesTest",
  keyframes: [
    {
      name: "shimmer",
      steps: {
        "0%": { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
    },
  ],
  tree: [{ type: "heading", level: 1, text: "Shimmer" }],
});
assert(typeof keyframesTest.page_settings === "object" && !Array.isArray(keyframesTest.page_settings), "keyframesTest page_settings is object");
assert(typeof keyframesTest.page_settings.custom_css === "string", "keyframesTest has custom_css");
assert(keyframesTest.page_settings.custom_css.includes("@keyframes shimmer"), "keyframesTest custom_css contains @keyframes shimmer");
assert(keyframesTest.page_settings.custom_css.includes("background-position: -200% 0;"), "keyframesTest has kebab-case background-position 0%");
assert(keyframesTest.page_settings.custom_css.includes("background-position: 200% 0;"), "keyframesTest has kebab-case background-position 100%");

// 2. Node-level keyframes (injected at page level)
const nodeKeyframesTest = compileBlueprint({
  title: "NodeKeyframesTest",
  tree: [
    {
      type: "section",
      children: [
        {
          type: "button",
          text: "Pulse",
          keyframes: [
            { name: "pulse", steps: { "0%": { opacity: "1" }, "50%": { opacity: "0.5" }, "100%": { opacity: "1" } } },
          ],
        },
      ],
    },
  ],
});
assert(typeof nodeKeyframesTest.page_settings === "object" && !Array.isArray(nodeKeyframesTest.page_settings), "nodeKeyframesTest page_settings is object");
assert(typeof nodeKeyframesTest.page_settings.custom_css === "string", "nodeKeyframesTest has custom_css");
assert(nodeKeyframesTest.page_settings.custom_css.includes("@keyframes pulse"), "nodeKeyframesTest custom_css contains @keyframes pulse");
assert(nodeKeyframesTest.page_settings.custom_css.includes("opacity: 1;"), "nodeKeyframesTest has opacity 1");
assert(nodeKeyframesTest.page_settings.custom_css.includes("opacity: 0.5;"), "nodeKeyframesTest has opacity 0.5");

// 3. Keyframes appended to existing custom_css (from CSS vars/theme)
const keyframesWithCssVarsTest = compileBlueprint({
  title: "KeyframesWithVars",
  cssVars: { "brand": "#FF0000" },
  keyframes: [
    { name: "fade", steps: { "0%": { opacity: "0" }, "100%": { opacity: "1" } } },
  ],
  tree: [{ type: "heading", level: 1, text: "Fade" }],
});
assert(keyframesWithCssVarsTest.page_settings.custom_css.includes(":root {"), "keyframesWithVars still has :root block");
assert(keyframesWithCssVarsTest.page_settings.custom_css.includes("@keyframes fade"), "keyframesWithVars has @keyframes fade after :root");
assert(keyframesWithCssVarsTest.page_settings.custom_css.includes("--brand: #FF0000;"), "keyframesWithVars has --brand css var");

console.log("@keyframes injection tests passed.");

// ----- Global widget tests -----

// 1. Basic global widget usage
const globalsTest = compileBlueprint({
  title: "GlobalsTest",
  globals: {
    ctaBtn: {
      type: "button",
      style: { color: "#fff", background: "#E8743B", fontWeight: "700", padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" }, borderRadius: "0.5rem" },
    },
  },
  tree: [
    { global: "ctaBtn", text: "Click Me" },
    { global: "ctaBtn", text: "Another CTA", href: "/go" },
  ],
});
assert(globalsTest.content.length === 2, "globalsTest has 2 nodes");
const gBtn1 = globalsTest.content[0];
const gBtn2 = globalsTest.content[1];
assert(gBtn1.widgetType === "e-button", "global btn1 is e-button");
assert(gBtn1.settings.text.value.content.value === "Click Me", "global btn1 has overridden text");
assert(gBtn1.settings.classes !== undefined, "global btn1 has style classes (from global)");
const gBtn1Class = gBtn1.settings.classes.value[0];
const gBtn1Variant = gBtn1.styles[gBtn1Class].variants[0];
assert(gBtn1Variant.props["background"].$$type === "background", "global btn1 has background from global style");
assert(gBtn1Variant.props["color"].value === "#fff", "global btn1 has color from global style");

assert(gBtn2.widgetType === "e-button", "global btn2 is e-button");
assert(gBtn2.settings.text.value.content.value === "Another CTA", "global btn2 has overridden text");
assert(gBtn2.settings.link !== undefined, "global btn2 has link (node-level override)");
assert(gBtn2.settings.link.$$type === "link", "global btn2 link is typed");

// 2. Global widget with motion
const globalsMotionTest = compileBlueprint({
  title: "GlobalsMotionTest",
  globals: {
    fancyHeading: {
      type: "heading",
      level: 2,
      motion: { entrance: "fadeInUp", entranceDuration: 0.5 },
      style: { fontSize: "2rem", color: "{colors.primary}" },
    },
  },
  tree: [
    { global: "fancyHeading", text: "Custom Heading" },
  ],
});
const gHeading = globalsMotionTest.content[0];
assert(gHeading.widgetType === "e-heading", "global heading is e-heading");
assert(gHeading.settings.title.value.content.value === "Custom Heading", "global heading has overridden text");
assert(gHeading.settings.classes !== undefined, "global heading has style classes (from global)");
// entrance animation produces flat animation settings
assert(gHeading.settings["_animation"] === "fadeInUp", "global heading has _animation from global motion");
assert(gHeading.settings["animation_duration"] === 0.5, "global heading has animation_duration from global motion");

// 3. Site-level globals
const siteGlobalsTest = compileSite({
  theme: { colors: { accent: "#F60" } },
  globals: {
    siteBtn: { type: "button", style: { background: "{colors.accent}", color: "#fff" } },
  },
  pages: [
    { title: "P1", tree: [{ global: "siteBtn", text: "Page 1 CTA" }] },
    { title: "P2", tree: [{ global: "siteBtn", text: "Page 2 CTA" }] },
  ],
});
assert(siteGlobalsTest.length === 2, "siteGlobalsTest has 2 pages");
const siteBtn1 = siteGlobalsTest[0].document.content[0];
assert(siteBtn1.widgetType === "e-button", "site global btn is e-button");
assert(siteBtn1.settings.text.value.content.value === "Page 1 CTA", "site global btn has page 1 text");
assert(siteBtn1.settings.classes !== undefined, "site global btn has style from site globals");
const siteBtn2 = siteGlobalsTest[1].document.content[0];
assert(siteBtn2.settings.text.value.content.value === "Page 2 CTA", "site global btn has page 2 text");

console.log("Global widget tests passed.");

// ----- CLASSIC FORMAT TESTS -----

// 1. Compile a blueprint with format: "classic" and verify the output uses flat settings
const classicTest = compileBlueprint({
  title: "ClassicTest",
  format: "classic",
  theme: {
    colors: {
      primary: "#1A2D5A",
      accent: "#E8743B",
      bg: "#FFFFFF",
      surface: "#F6F8FB",
      text: "#1A1A1A",
      muted: "#5B6472",
    },
    radius: { md: "1rem", lg: "1.75rem" },
  },
  tree: [
    {
      type: "section",
      style: { background: "{colors.surface}", padding: { top: "4rem", bottom: "4rem" } },
      children: [
        {
          type: "flex",
          direction: "column",
          style: { gap: "1.5rem" },
          children: [
            {
              type: "heading",
              level: 1,
              text: "Hello World",
              style: { fontSize: "3rem", fontWeight: "700", color: "{colors.primary}", mobile: { fontSize: "2rem" } },
            },
            {
              type: "text",
              text: "This is a paragraph.",
              style: { color: "{colors.muted}", fontSize: "1.125rem" },
            },
            {
              type: "button",
              text: "Click Me",
              href: "/go",
              style: { color: "#fff", background: "{colors.accent}", borderRadius: "0.5rem", hover: { background: "#cf5f2b" } },
            },
            {
              type: "image",
              src: "https://example.com/img.jpg",
              style: { borderRadius: "1rem" },
            },
          ],
        },
      ],
    },
  ],
});

// Assert: widget types are classic names (heading, text-editor, button, image)
const classicSection = classicTest.content[0];
assert(classicSection.elType === "container", "classic section is container elType");
const classicFlex = classicSection.elements[0];
assert(classicFlex.elType === "container", "classic flex is container elType");
const classicHeading = classicFlex.elements[0];
assert(classicHeading.elType === "widget", "classic heading elType is widget");
assert(classicHeading.widgetType === "heading", "classic heading widgetType is heading (not e-heading)");
const classicText = classicFlex.elements[1];
assert(classicText.widgetType === "text-editor", "classic text widgetType is text-editor");
const classicBtn = classicFlex.elements[2];
assert(classicBtn.widgetType === "button", "classic button widgetType is button");
const classicImg = classicFlex.elements[3];
assert(classicImg.widgetType === "image", "classic image widgetType is image");

// Assert: settings are flat (no $$type)
assert(typeof classicHeading.settings.title === "string", "classic heading title is flat string");
assert(classicHeading.settings.title === "Hello World", "classic heading title value");
assert(typeof classicHeading.settings.title_color === "string", "classic heading title_color is flat string");
assert(classicHeading.settings.title_color === "#1A2D5A", "classic heading title_color resolved token");
// Typography should be flat
assert(classicHeading.settings.typography_typography === "custom", "classic heading has typography_typography: custom");
assert(typeof classicHeading.settings.typography_font_size === "object", "classic heading typography_font_size is object");
assert((classicHeading.settings.typography_font_size as { unit: string; size: number }).unit === "rem", "classic heading font_size unit is rem");
assert((classicHeading.settings.typography_font_size as { unit: string; size: number }).size === 3, "classic heading font_size value");
assert(classicHeading.settings.typography_font_weight === "700", "classic heading font_weight is flat string");

// Assert: elType is "container" for layout
assert(classicSection.elType === "container", "classic section uses container elType");
assert(classicFlex.elType === "container", "classic flex uses container elType");

// Assert: responsive uses _tablet/_mobile suffixes
const headingMobileFontSize = classicHeading.settings.typography_font_size_mobile;
assert(typeof headingMobileFontSize === "object", "classic heading has typography_font_size_mobile");
assert((headingMobileFontSize as { unit: string; size: number }).size === 2, "classic heading mobile font_size is 2rem");

// Assert: IDs are 7-char hex
assert(typeof classicSection.id === "string" && classicSection.id.length === 7, "classic section id is 7-char hex");
assert(typeof classicHeading.id === "string" && classicHeading.id.length === 7, "classic heading id is 7-char hex");
assert(/^[0-9a-f]{7}$/.test(classicSection.id), "classic section id matches 7-char hex pattern");
assert(/^[0-9a-f]{7}$/.test(classicHeading.id), "classic heading id matches 7-char hex pattern");

// Assert: button has flat text and link
assert(typeof classicBtn.settings.text === "string", "classic button text is flat string");
assert(classicBtn.settings.text === "Click Me", "classic button text value");
assert(typeof classicBtn.settings.link === "object", "classic button link is object");
assert((classicBtn.settings.link as { url: string }).url === "/go", "classic button link url");

// Assert: background is flat settings
assert(classicSection.settings.background_background === "classic", "classic section background_background is classic");
assert(classicSection.settings.background_color === "#F6F8FB", "classic section background_color is flat hex");

// Assert: padding is flat dimension object
const sectionPadding = classicSection.settings.padding as Record<string, unknown>;
assert(typeof sectionPadding === "object", "classic section padding is object");
assert(sectionPadding.unit === "px", "classic section padding unit");
assert(sectionPadding.top === "64", "classic section padding top is 4rem→64px"); // 4rem → but we store as-is string

// Assert: hover uses hover_* prefix
assert(typeof classicBtn.settings.hover_background_color === "string", "classic button has hover_background_color");
assert(classicBtn.settings.hover_background_color === "#cf5f2b", "classic button hover_background_color value");

// Assert: no styles object present
assert((classicHeading as { styles?: unknown }).styles === undefined, "classic heading has no styles object");
assert((classicSection as { styles?: unknown }).styles === undefined, "classic section has no styles object");

console.log("Classic format tests passed.");

// 2. Test classic format with motion
const classicMotionTest = compileBlueprint({
  title: "ClassicMotionTest",
  format: "classic",
  tree: [
    {
      type: "heading",
      level: 1,
      text: "Animated",
      motion: { entrance: "fadeInUp", entranceDuration: 0.8 },
    },
  ],
});
const motionHeading = classicMotionTest.content[0];
assert(motionHeading.settings._animation === "fadeInUp", "classic motion heading has _animation flat setting");
assert(motionHeading.settings.animation_duration === 0.8, "classic motion heading has animation_duration flat setting");

console.log("Classic motion tests passed.");

// 3. Test classic format with dynamic tags
const classicDynamicTest = compileBlueprint({
  title: "ClassicDynamicTest",
  format: "classic",
  tree: [
    {
      type: "heading",
      level: 1,
      text: "Fallback",
      dynamic: { title: { tag: "post-title" } },
    },
  ],
});
const classicDynHeading = classicDynamicTest.content[0];
assert(typeof classicDynHeading.settings.__dynamic__ === "object", "classic dynamic heading has __dynamic__");
assert(typeof (classicDynHeading.settings.__dynamic__ as Record<string, string>).title === "string", "classic __dynamic__.title is string");
assert((classicDynHeading.settings.__dynamic__ as Record<string, string>).title.startsWith("[elementor-tag"), "classic __dynamic__.title has elementor-tag syntax");

console.log("Classic dynamic tag tests passed.");

// 4. Test classic format with global widgets
const classicGlobalsTest = compileBlueprint({
  title: "ClassicGlobalsTest",
  format: "classic",
  globals: {
    cta: { type: "button", style: { color: "#fff", background: "#E8743B" } },
  },
  tree: [
    { global: "cta", text: "Click Here" },
  ],
});
const gBtn = classicGlobalsTest.content[0];
assert(gBtn.widgetType === "button", "classic global button widgetType");
assert(gBtn.settings.text === "Click here" || gBtn.settings.text === "Click Here", "classic global button has overridden text");
assert(gBtn.settings.background_color === "#E8743B", "classic global button has background_color from global style");

console.log("Classic global widget tests passed.");

// 5. Test classic format with keyframes
const classicKeyframesTest = compileBlueprint({
  title: "ClassicKeyframesTest",
  format: "classic",
  keyframes: [
    { name: "fade", steps: { "0%": { opacity: "0" }, "100%": { opacity: "1" } } },
  ],
  tree: [{ type: "heading", level: 1, text: "Fade" }],
});
assert(typeof classicKeyframesTest.page_settings === "object", "classic keyframes page_settings is object");
assert(typeof (classicKeyframesTest.page_settings as Record<string, string>).custom_css === "string", "classic keyframes has custom_css");
assert((classicKeyframesTest.page_settings as Record<string, string>).custom_css.includes("@keyframes fade"), "classic keyframes has @keyframes fade");

console.log("Classic keyframes tests passed.");

// 6. Test classic format with CSS custom properties
const classicCssVarsTest = compileBlueprint({
  title: "ClassicCssVarsTest",
  format: "classic",
  cssVars: { "brand-color": "#FF0000" },
  tree: [{ type: "heading", level: 1, text: "Test" }],
});
assert(typeof classicCssVarsTest.page_settings === "object", "classic cssVars page_settings is object");
assert((classicCssVarsTest.page_settings as Record<string, string>).custom_css.includes("--brand-color: #FF0000;"), "classic cssVars includes brand-color");

console.log("Classic CSS vars tests passed.");

// write example output
const outDir = path.join(ROOT, "examples");
if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "sample-home.json"), JSON.stringify(doc), "utf-8");
await writeFile(path.join(outDir, "sample-home.blueprint.json"), JSON.stringify(blueprint, null, 2), "utf-8");
console.log("Wrote examples/sample-home.json and sample-home.blueprint.json");
