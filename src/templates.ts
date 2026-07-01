/**
 * Section-template library.
 *
 * Each template is a parameterized generator that returns a friendly
 * BlueprintNode subtree (one section). Templates use theme tokens so they style
 * automatically, and the defaults guarantee good best-practice design. Use them
 * in a blueprint via a node: { type: "template", template: "hero", params: {…} }.
 */

import { BlueprintNode } from "./compiler.js";

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/** A page section with standard vertical rhythm. */
function section(children: BlueprintNode[], style: Record<string, unknown> = {}, tag = "div"): BlueprintNode {
  return { type: "section", tag, style: { padding: { top: "4rem", bottom: "4rem" }, ...style }, children };
}

/** A centered, max-width content container. */
function container(children: BlueprintNode[], style: Record<string, unknown> = {}): BlueprintNode {
  return {
    type: "flex",
    direction: "column",
    style: {
      gap: "1.5rem",
      maxWidth: "1200px",
      width: "100%",
      margin: "0 auto",
      padding: { left: "1.5rem", right: "1.5rem" },
      ...style,
    },
    children,
  };
}

function sectionHeading(text: string, center = true): BlueprintNode {
  return {
    type: "heading",
    level: 2,
    text,
    style: {
      fontSize: "2.25rem",
      fontWeight: "700",
      color: "{colors.primary}",
      ...(center ? { textAlign: "center" } : {}),
      mobile: { fontSize: "1.6rem" },
    },
  };
}

/** Small uppercase "kicker" label above a heading — a cheap way to look bespoke. */
function eyebrow(text: string, center = false): BlueprintNode {
  return {
    type: "text",
    text,
    style: {
      fontSize: "0.8125rem",
      fontWeight: "700",
      color: "{colors.accent}",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      ...(center ? { textAlign: "center" } : {}),
    },
  };
}

function primaryButton(c: { text: string; href?: string }): BlueprintNode {
  return {
    type: "button",
    text: c.text,
    href: c.href,
    style: {
      color: "{colors.onAccent}",
      background: "{colors.accent}",
      fontWeight: "700",
      padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" },
      borderRadius: "{radius.md}",
      hover: { color: "{colors.onPrimary}", background: "{colors.primary}" },
    },
  };
}

function ghostButton(c: { text: string; href?: string }): BlueprintNode {
  return {
    type: "button",
    text: c.text,
    href: c.href,
    style: {
      color: "{colors.primary}",
      background: "transparent",
      fontWeight: "700",
      padding: { top: "1rem", right: "2rem", bottom: "1rem", left: "2rem" },
      borderRadius: "{radius.md}",
      css: "border: 2px solid {colors.border};",
    },
  };
}

function linkButton(c: { text: string; href?: string }): BlueprintNode {
  return {
    type: "button",
    text: c.text,
    href: c.href,
    style: {
      color: "{colors.text}",
      background: "transparent",
      fontWeight: "500",
      padding: { top: "0.25rem", right: "0.25rem", bottom: "0.25rem", left: "0.25rem" },
      hover: { color: "{colors.accent}" },
    },
  };
}

// ---------------------------------------------------------------------------
// Template parameter types
// ---------------------------------------------------------------------------

interface HeroParams {
  heading?: string;
  text?: string;
  primaryCta?: { text: string; href?: string };
  secondaryCta?: { text: string; href?: string };
  image?: string;
  align?: string;
}

interface FeatureGridParams {
  heading?: string;
  subheading?: string;
  items?: Array<{ title?: string; text?: string; icon?: string }>;
}

interface CtaBandParams {
  heading?: string;
  text?: string;
  cta?: { text: string; href?: string };
}

interface TestimonialsParams {
  heading?: string;
  items?: Array<{ content?: string; name?: string; title?: string; image?: string }>;
}

interface PricingParams {
  heading?: string;
  plans?: Array<{
    heading?: string;
    subheading?: string;
    price?: number | string;
    period?: string;
    features?: string[];
    buttonText?: string;
    ribbon?: string;
  }>;
}

interface FaqParams {
  heading?: string;
  items?: Array<{ q?: string; a?: string }>;
}

interface ContactParams {
  heading?: string;
  formName?: string;
  email?: { to: string; subject?: string };
  fields?: Array<{ label: string; name: string; type: string; required?: boolean; placeholder?: string }>;
  submitText?: string;
}

interface NavbarParams {
  brand?: string;
  brandImage?: string;
  links?: Array<{ text: string; href?: string }>;
  cta?: { text: string; href?: string };
}

interface FooterParams {
  columns?: Array<{ heading?: string; links?: Array<{ text: string; href?: string }> }>;
  copyright?: string;
}

interface HeroSplitParams {
  eyebrow?: string;
  heading?: string;
  text?: string;
  primaryCta?: { text: string; href?: string };
  secondaryCta?: { text: string; href?: string };
  image?: string;
  imageAlt?: string;
  imageSide?: string;
}

interface FeatureZigzagParams {
  eyebrow?: string;
  heading?: string;
  items?: Array<{
    title?: string;
    text?: string;
    image?: string;
    imageAlt?: string;
    tag?: string;
    cta?: { text: string; href?: string };
  }>;
}

interface BentoParams {
  eyebrow?: string;
  heading?: string;
  items?: Array<{
    title?: string;
    text?: string;
    icon?: string;
    span?: number;
    highlight?: boolean;
  }>;
}

interface StatsParams {
  heading?: string;
  onPrimary?: boolean;
  items?: Array<{ value?: string | number; label?: string }>;
}

interface LogosParams {
  heading?: string;
  logos?: Array<string | { src: string; alt?: string }>;
}

interface StepsParams {
  eyebrow?: string;
  heading?: string;
  items?: Array<{ number?: number; title?: string; text?: string }>;
}

interface HeroVideoParams {
  heading?: string;
  text?: string;
  cta?: { text: string; href?: string };
  backgroundType?: "slideshow" | "gradient" | "classic";
  backgroundImages?: string[];
  overlayColor?: string;
  overlayOpacity?: number;
  primaryCta?: { text: string; href?: string };
  secondaryCta?: { text: string; href?: string };
}

interface PortfolioGridParams {
  heading?: string;
  items?: Array<{ title?: string; category?: string; image?: string; link?: string }>;
  columns?: number; // 2-4
  gap?: string;
}

interface TeamSectionParams {
  heading?: string;
  members?: Array<{ name?: string; role?: string; image?: string; bio?: string; social?: Array<{ icon?: string; url?: string }> }>;
  columns?: number;
}

interface TimelineParams {
  heading?: string;
  items?: Array<{ date?: string; title?: string; description?: string; side?: "left" | "right" }>;
}

interface ServiceCardsParams {
  heading?: string;
  services?: Array<{ icon?: string; title?: string; description?: string; link?: string }>;
  columns?: number;
  hoverEffect?: "grow" | "float" | "lift";
}

interface ImageCarouselParams {
  heading?: string;
  images?: string[];
  autoplay?: boolean;
  loop?: boolean;
}

interface SocialStripParams {
  heading?: string;
  items?: Array<{ icon?: string; url?: string }>;
  align?: string;
}

interface CountdownParams {
  heading?: string;
  targetDate?: string;
  labels?: string[]; // 4 strings: days/hours/minutes/seconds
}

interface BlogGridParams {
  heading?: string;
  posts?: Array<{ title?: string; excerpt?: string; image?: string; date?: string; author?: string; link?: string }>;
  columns?: number;
}

interface Error404Params {
  heading?: string;
  text?: string;
  ctaText?: string;
  ctaHref?: string;
  image?: string;
}

interface ComingSoonParams {
  heading?: string;
  text?: string;
  countdown?: boolean;
  targetDate?: string;
  socialLinks?: Array<{ icon?: string; url?: string }>;
}

interface MapSectionParams {
  heading?: string;
  address?: string;
  phone?: string;
  email?: string;
  mapEmbed?: string; // iframe URL
  hours?: string;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function hero(p: HeroParams): BlueprintNode {
  const align = p.align || (p.image ? "left" : "center");
  const centered = align === "center";
  const heading: BlueprintNode = {
    type: "heading",
    level: 1,
    text: p.heading ?? "Headline",
    style: { fontSize: "3rem", fontWeight: "700", color: "{colors.primary}", lineHeight: "1.1", mobile: { fontSize: "2rem" }, ...(centered ? { textAlign: "center" } : {}) },
  };
  const sub: BlueprintNode = {
    type: "text",
    text: p.text ?? "",
    style: { fontSize: "1.125rem", color: "{colors.muted}", maxWidth: "60ch", ...(centered ? { textAlign: "center" } : {}) },
  };
  const ctas: BlueprintNode[] = [];
  if (p.primaryCta) ctas.push(primaryButton(p.primaryCta));
  if (p.secondaryCta) ctas.push(ghostButton(p.secondaryCta));
  const ctaRow: BlueprintNode = { type: "flex", direction: "row", style: { gap: "1rem", flexWrap: "wrap", ...(centered ? { justifyContent: "center" } : {}) }, children: ctas };
  const copy: BlueprintNode = {
    type: "flex",
    direction: "column",
    style: { gap: "1.5rem", ...(centered ? { alignItems: "center" } : {}) },
    children: [heading, ...(p.text ? [sub] : []), ...(ctas.length ? [ctaRow] : [])],
  };
  if (p.image) {
    const img: BlueprintNode = { type: "image", src: p.image, style: { borderRadius: "{radius.lg}", boxShadow: "{shadow.card}", width: "100%" } };
    return section([
      {
        type: "flex",
        direction: "row",
        style: { gap: "3rem", alignItems: "center", maxWidth: "1200px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" }, mobile: { flexDirection: "column" } },
        children: [copy, img],
      },
    ], { padding: { top: "5rem", bottom: "5rem" } });
  }
  return section([container([copy], { alignItems: "center" })], { padding: { top: "5rem", bottom: "5rem" } });
}

function featureCard(item: { title?: string; text?: string; icon?: string }): BlueprintNode {
  const kids: BlueprintNode[] = [];
  if (item.icon) kids.push({ type: "svg", src: item.icon, style: { width: "40px" } });
  kids.push({ type: "heading", level: 3, text: item.title ?? "", style: { fontSize: "1.5rem", fontWeight: "600", color: "{colors.primary}" } });
  if (item.text) kids.push({ type: "text", text: item.text, style: { color: "{colors.muted}" } });
  return {
    type: "flex",
    direction: "column",
    style: { gap: "0.75rem", background: "{colors.bg}", padding: "2rem", borderRadius: "{radius.md}", boxShadow: "{shadow.card}", css: "flex: 1 1 280px;" },
    children: kids,
  };
}

function featureGrid(p: FeatureGridParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  if (p.subheading) head.push({ type: "text", text: p.subheading, style: { color: "{colors.muted}", textAlign: "center", maxWidth: "60ch", margin: "0 auto" } });
  const grid: BlueprintNode = { type: "flex", direction: "row", style: { gap: "2rem", flexWrap: "wrap", mobile: { flexDirection: "column" } }, children: (p.items ?? []).map(featureCard) };
  return section([container([...head, grid], { gap: "2.5rem" })], { background: "{colors.surface}" });
}

function ctaBand(p: CtaBandParams): BlueprintNode {
  const kids: BlueprintNode[] = [{ type: "heading", level: 2, text: p.heading ?? "", style: { fontSize: "2.25rem", fontWeight: "700", color: "{colors.onPrimary}", textAlign: "center" } }];
  if (p.text) kids.push({ type: "text", text: p.text, style: { color: "{colors.onPrimary}", textAlign: "center", maxWidth: "60ch", css: "opacity: 0.9;" } });
  if (p.cta) kids.push({ type: "button", text: p.cta.text, href: p.cta.href, style: { color: "{colors.primary}", background: "{colors.bg}", fontWeight: "700", padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" }, borderRadius: "{radius.md}" } });
  return section([
    { type: "flex", direction: "column", style: { gap: "1.5rem", alignItems: "center", maxWidth: "800px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" } }, children: kids },
  ], { background: "{colors.primary}" });
}

function testimonials(p: TestimonialsParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const slides = (p.items ?? []).map((it) => ({
    content: it.content ?? "",
    name: it.name ?? "",
    title: it.title ?? "",
    image: { url: it.image ?? "" },
  }));
  const widget: BlueprintNode = { type: "reviews", props: { slides } };
  return section([container([...head, widget], { gap: "2rem" })]);
}

function pricing(p: PricingParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const cards = (p.plans ?? []).map((pl) => ({
    type: "flex" as const,
    direction: "column" as const,
    style: { css: "flex: 1 1 300px;" },
    children: [
      {
        type: "price-table" as const,
        props: {
          heading: pl.heading ?? "Plan",
          sub_heading: pl.subheading ?? "",
          price: String(pl.price ?? "0"),
          period: pl.period ?? "Monthly",
          features_list: (pl.features ?? []).map((f: string) => ({ item_text: f })),
          button_text: pl.buttonText ?? "Choose",
          ...(pl.ribbon ? { ribbon_title: pl.ribbon } : {}),
        },
      },
    ],
  }));
  const row: BlueprintNode = { type: "flex", direction: "row", style: { gap: "2rem", flexWrap: "wrap", alignItems: "stretch", mobile: { flexDirection: "column" } }, children: cards };
  return section([container([...head, row], { gap: "2.5rem" })], { background: "{colors.surface}" });
}

function faq(p: FaqParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const tabs = (p.items ?? []).map((it) => ({ label: it.q ?? "", children: [{ type: "text" as const, text: it.a ?? "", style: { color: "{colors.muted}" } }] }));
  const tabsNode: BlueprintNode = { type: "tabs", tabs };
  return section([container([...head, tabsNode], { gap: "2rem", maxWidth: "800px" })]);
}

function contact(p: ContactParams): BlueprintNode {
  const fields = p.fields ?? [
    { label: "Name", name: "name", type: "text", required: true },
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Message", name: "message", type: "textarea", required: true },
  ];
  const formChildren: BlueprintNode[] = [];
  for (const f of fields) {
    formChildren.push({ type: "label", text: f.label, for: f.name });
    if (f.type === "textarea") {
      formChildren.push({ type: "textarea", placeholder: f.placeholder ?? "", required: !!f.required, cssId: f.name });
    } else {
      formChildren.push({ type: "input", inputType: f.type ?? "text", placeholder: f.placeholder ?? "", required: !!f.required, cssId: f.name });
    }
  }
  formChildren.push({
    type: "submit",
    text: p.submitText ?? "Send Message",
    style: { color: "{colors.onAccent}", background: "{colors.accent}", fontWeight: "700", padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" }, borderRadius: "{radius.md}" },
  });
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const form: BlueprintNode = { type: "form", name: p.formName ?? "Contact", ...(p.email ? { email: p.email } : {}), style: { gap: "1rem", maxWidth: "560px", width: "100%", margin: "0 auto" }, children: formChildren };
  return section([container([...head, form], { gap: "2rem" })]);
}

function navbar(p: NavbarParams): BlueprintNode {
  const brand: BlueprintNode = p.brandImage
    ? { type: "image", src: p.brandImage, style: { width: "140px" } }
    : { type: "heading", level: 2, text: p.brand ?? "Brand", style: { fontSize: "1.5rem", fontWeight: "700", color: "{colors.primary}" } };
  const links: BlueprintNode = { type: "flex", direction: "row", style: { gap: "2rem", alignItems: "center", flexWrap: "wrap" }, children: (p.links ?? []).map(linkButton) };
  const rowKids: BlueprintNode[] = [brand, links];
  if (p.cta) rowKids.push(primaryButton(p.cta));
  const row: BlueprintNode = {
    type: "flex",
    direction: "row",
    style: { justifyContent: "space-between", alignItems: "center", gap: "2rem", maxWidth: "1200px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" }, mobile: { flexDirection: "column" } },
    children: rowKids,
  };
  return { type: "section", tag: "header", style: { background: "{colors.bg}", padding: { top: "1rem", bottom: "1rem" }, css: "border-bottom: 1px solid {colors.border};" }, children: [row] };
}

function footer(p: FooterParams): BlueprintNode {
  const cols = (p.columns ?? []).map((c) => ({
    type: "flex" as const,
    direction: "column" as const,
    style: { gap: "0.75rem", css: "flex: 1 1 200px;" },
    children: [
      { type: "heading" as const, level: 3, text: c.heading ?? "", style: { fontSize: "1.125rem", fontWeight: "600", color: "{colors.onPrimary}" } },
      ...(c.links ?? []).map((l) => ({
        type: "button" as const,
        text: l.text,
        href: l.href,
        style: { color: "{colors.onPrimary}", background: "transparent", fontWeight: "400", padding: { top: "0.1rem", right: "0.1rem", bottom: "0.1rem", left: "0.1rem" }, hover: { color: "{colors.accent}" } },
      })),
    ],
  }));
  const row: BlueprintNode = { type: "flex", direction: "row", style: { gap: "3rem", flexWrap: "wrap", maxWidth: "1200px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" } }, children: cols };
  const copy: BlueprintNode = { type: "text", text: p.copyright ?? "", style: { color: "{colors.onPrimary}", textAlign: "center", css: "opacity: 0.7;" } };
  return { type: "section", tag: "footer", style: { background: "{colors.primary}", padding: { top: "3rem", bottom: "2rem" } }, children: [{ type: "flex", direction: "column", style: { gap: "2rem" }, children: [row, copy] }] };
}

/**
 * Asymmetric hero (text ~55% / media ~45%) with an eyebrow kicker and an
 * accent panel behind the image. Reads as bespoke vs. the centered default.
 */
function heroSplit(p: HeroSplitParams): BlueprintNode {
  const reverse = p.imageSide === "left";
  const copyKids: BlueprintNode[] = [];
  if (p.eyebrow) copyKids.push(eyebrow(p.eyebrow));
  copyKids.push({
    type: "heading",
    level: 1,
    text: p.heading ?? "Headline",
    style: { fontSize: "3.25rem", fontWeight: "700", color: "{colors.primary}", lineHeight: "1.05", letterSpacing: "-0.01em", mobile: { fontSize: "2.1rem" } },
  });
  if (p.text) copyKids.push({ type: "text", text: p.text, style: { fontSize: "1.15rem", color: "{colors.muted}", lineHeight: "1.6", maxWidth: "52ch" } });
  const ctas: BlueprintNode[] = [];
  if (p.primaryCta) ctas.push(primaryButton(p.primaryCta));
  if (p.secondaryCta) ctas.push(ghostButton(p.secondaryCta));
  if (ctas.length) copyKids.push({ type: "flex", direction: "row", style: { gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }, children: ctas });
  const copy: BlueprintNode = { type: "flex", direction: "column", style: { gap: "1.25rem", css: "flex: 1 1 54%;" }, children: copyKids };
  const media: BlueprintNode = p.image
    ? {
        type: "section",
        style: { background: "{colors.surfaceAlt}", borderRadius: "{radius.lg}", padding: "1rem", css: "flex: 1 1 42%;" },
        children: [{ type: "image", src: p.image, alt: p.imageAlt ?? p.heading ?? "", style: { borderRadius: "{radius.md}", boxShadow: "{shadow.card}", width: "100%", css: "display:block;" } }],
      }
    : { type: "section", style: { background: "{colors.surfaceAlt}", borderRadius: "{radius.lg}", css: "flex: 1 1 42%; min-height: 320px;" }, children: [] };
  return section([
    {
      type: "flex",
      direction: "row",
      style: { gap: "3.5rem", alignItems: "center", maxWidth: "1200px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" }, flexDirection: reverse ? "row-reverse" : "row", mobile: { flexDirection: "column" } },
      children: [copy, media],
    },
  ], { padding: { top: "4rem", bottom: "4rem" } });
}

/** Alternating image/text "zig-zag" feature rows — the anti-3-identical-cards. */
function featureZigzag(p: FeatureZigzagParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.eyebrow) head.push(eyebrow(p.eyebrow, true));
  if (p.heading) head.push(sectionHeading(p.heading));
  const rows = (p.items ?? []).map((it, i) => {
    const reverse = i % 2 === 1;
    const textKids: BlueprintNode[] = [];
    if (it.tag) textKids.push(eyebrow(it.tag));
    textKids.push({ type: "heading", level: 3, text: it.title ?? "", style: { fontSize: "1.75rem", fontWeight: "600", color: "{colors.primary}" } });
    if (it.text) textKids.push({ type: "text", text: it.text, style: { color: "{colors.muted}", lineHeight: "1.6", maxWidth: "52ch" } });
    if (it.cta) textKids.push({ type: "flex", direction: "row", style: { marginTop: "0.25rem" }, children: [ghostButton(it.cta)] });
    const textCol: BlueprintNode = { type: "flex", direction: "column", style: { gap: "0.9rem", css: "flex: 1 1 48%;" }, children: textKids };
    const media: BlueprintNode = it.image
      ? { type: "image", src: it.image, alt: it.imageAlt ?? it.title ?? "", style: { borderRadius: "{radius.lg}", boxShadow: "{shadow.card}", width: "100%", css: "flex: 1 1 48%;" } }
      : { type: "section", style: { background: "{colors.surfaceAlt}", borderRadius: "{radius.lg}", css: "flex: 1 1 48%; min-height: 260px;" }, children: [] };
    return {
      type: "flex",
      direction: "row",
      style: { gap: "3rem", alignItems: "center", flexDirection: reverse ? "row-reverse" : "row", mobile: { flexDirection: "column" } },
      children: [media, textCol],
    };
  });
  return section([container([...head, ...rows], { gap: "4rem" })]);
}

/** Bento grid — mixed-size cards. `span` 2 = wide, 1 = standard. */
function bento(p: BentoParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.eyebrow) head.push(eyebrow(p.eyebrow, true));
  if (p.heading) head.push(sectionHeading(p.heading));
  const cards = (p.items ?? []).map((it) => {
    const wide = (it.span ?? 1) >= 2;
    const kids: BlueprintNode[] = [];
    if (it.icon) kids.push({ type: "svg", src: it.icon, style: { width: "40px" } });
    kids.push({ type: "heading", level: 3, text: it.title ?? "", style: { fontSize: wide ? "1.6rem" : "1.35rem", fontWeight: "600", color: "{colors.primary}" } });
    if (it.text) kids.push({ type: "text", text: it.text, style: { color: "{colors.muted}", lineHeight: "1.6" } });
    return {
      type: "flex",
      direction: "column",
      style: {
        gap: "0.6rem",
        justifyContent: "flex-end",
        background: it.highlight ? "{colors.primary}" : "{colors.surface}",
        padding: "2rem",
        borderRadius: "{radius.lg}",
        boxShadow: "{shadow.soft}",
        css: `flex: ${wide ? "2 1 420px" : "1 1 260px"}; min-height: ${wide ? "240px" : "200px"};${it.highlight ? " color: {colors.onPrimary};" : ""}`,
      },
      children: kids,
    };
  });
  const grid: BlueprintNode = { type: "flex", direction: "row", style: { gap: "1.25rem", flexWrap: "wrap", alignItems: "stretch", mobile: { flexDirection: "column" } }, children: cards };
  return section([container([...head, grid], { gap: "2.5rem" })]);
}

/** Big stat row — social proof through numbers. */
function stats(p: StatsParams): BlueprintNode {
  const items = (p.items ?? []).map((it) => ({
    type: "flex" as const,
    direction: "column" as const,
    style: { gap: "0.25rem", alignItems: "center", css: "flex: 1 1 180px;" },
    children: [
      { type: "heading" as const, level: 2, text: String(it.value ?? ""), style: { fontSize: "2.75rem", fontWeight: "700", color: "{colors.accent}", textAlign: "center" } },
      { type: "text" as const, text: it.label ?? "", style: { color: "{colors.muted}", textAlign: "center", fontWeight: "600" } },
    ],
  }));
  const row: BlueprintNode = { type: "flex", direction: "row", style: { gap: "2rem", flexWrap: "wrap", justifyContent: "space-around", maxWidth: "1100px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" } }, children: items };
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  return section([{ type: "flex", direction: "column", style: { gap: "2rem", alignItems: "center" }, children: [...head, row] }], { background: p.onPrimary ? "{colors.primary}" : "{colors.surface}" });
}

/** Quiet logo / social-proof strip. */
function logos(p: LogosParams): BlueprintNode {
  const line: BlueprintNode[] = [];
  if (p.heading) line.push({ type: "text", text: p.heading, style: { color: "{colors.muted}", textAlign: "center", fontSize: "0.95rem", letterSpacing: "0.04em" } });
  const row: BlueprintNode = {
    type: "flex",
    direction: "row",
    style: { gap: "2.5rem", flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
    children: (p.logos ?? []).map((l) => ({ type: "image", src: typeof l === "string" ? l : l.src, alt: typeof l === "string" ? "" : l.alt ?? "", style: { css: "height: 34px; width: auto; opacity: 0.6; filter: grayscale(100%);" } })),
  };
  return section([container([...line, row], { gap: "1.5rem", alignItems: "center" })], { padding: { top: "2.5rem", bottom: "2.5rem" } });
}

/** Numbered "how it works" steps. */
function steps(p: StepsParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.eyebrow) head.push(eyebrow(p.eyebrow, true));
  if (p.heading) head.push(sectionHeading(p.heading));
  const items = (p.items ?? []).map((it, i) => ({
    type: "flex" as const,
    direction: "column" as const,
    style: { gap: "0.75rem", css: "flex: 1 1 240px;" },
    children: [
      {
        type: "heading" as const,
        level: 3,
        text: String(it.number ?? i + 1),
        style: { fontSize: "1.25rem", fontWeight: "700", color: "{colors.onAccent}", background: "{colors.accent}", textAlign: "center", borderRadius: "{radius.pill}", width: "48px", css: "height:48px; line-height:48px;" },
      },
      { type: "heading" as const, level: 3, text: it.title ?? "", style: { fontSize: "1.3rem", fontWeight: "600", color: "{colors.primary}" } },
      ...(it.text ? [{ type: "text" as const, text: it.text, style: { color: "{colors.muted}", lineHeight: "1.6" } }] : []),
    ],
  }));
  const row: BlueprintNode = { type: "flex", direction: "row", style: { gap: "2.5rem", flexWrap: "wrap", alignItems: "flex-start", mobile: { flexDirection: "column" } }, children: items };
  return section([container([...head, row], { gap: "2.5rem" })]);
}

// ---------------------------------------------------------------------------
// New template archetypes (12 new templates)
// ---------------------------------------------------------------------------

/** 1. Hero with video/slideshow/gradient background. */
function heroVideo(p: HeroVideoParams): BlueprintNode {
  const bgType = p.backgroundType ?? "gradient";
  const bgStyle: Record<string, unknown> = {};
  if (bgType === "gradient") {
    bgStyle.background = { background_type: "gradient", gradient_first_color: "{colors.primary}", gradient_second_color: "{colors.surface}", gradient_angle: 135 };
  } else if (bgType === "classic") {
    bgStyle.background = "{colors.primary}";
  } else if (bgType === "slideshow" && p.backgroundImages?.length) {
    // For slideshow, use the first image as background (HTML/CSS workaround)
    bgStyle.background = p.backgroundImages[0];
    bgStyle.css = `background-size: cover; background-position: center;`;
  }
  if (p.overlayColor) {
    bgStyle.css = (bgStyle.css ?? "") + ` position: relative;`;
  }
  const heading: BlueprintNode = {
    type: "heading", level: 1, text: p.heading ?? "Headline",
    style: { fontSize: "3.5rem", fontWeight: "700", color: "#FFFFFF", textAlign: "center", lineHeight: "1.1", mobile: { fontSize: "2.2rem" } },
  };
  const sub: BlueprintNode = p.text ? {
    type: "text", text: p.text,
    style: { fontSize: "1.25rem", color: "#FFFFFF", textAlign: "center", maxWidth: "60ch", css: "opacity: 0.9;" },
  } : { type: "text", text: "", style: {} };
  const ctas: BlueprintNode[] = [];
  if (p.primaryCta) ctas.push({ ...primaryButton(p.primaryCta), style: { ...primaryButton(p.primaryCta).style, background: "{colors.accent}", color: "#fff" } });
  if (p.secondaryCta) ctas.push({ ...ghostButton(p.secondaryCta), style: { ...ghostButton(p.secondaryCta).style, color: "#fff", css: "border: 2px solid rgba(255,255,255,0.4);" } });
  const ctaRow: BlueprintNode = { type: "flex", direction: "row", style: { gap: "1rem", flexWrap: "wrap", justifyContent: "center" }, children: ctas };
  return section([
    { type: "flex", direction: "column", style: { gap: "1.5rem", alignItems: "center", maxWidth: "800px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" } }, children: [heading, sub, ...(ctas.length ? [ctaRow] : [])] },
  ], { padding: { top: "7rem", bottom: "7rem" }, ...bgStyle });
}

/** 2. Portfolio/gallery grid with filterable categories. */
function portfolioGrid(p: PortfolioGridParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const cols = p.columns ?? 3;
  const gap = p.gap ?? "1.5rem";
  const cards = (p.items ?? []).map((it) => ({
    type: "flex" as const,
    direction: "column" as const,
    style: { gap: "0.75rem", css: `flex: 1 1 ${Math.floor(100 / cols)}%;`, background: "{colors.surface}", borderRadius: "{radius.md}", overflow: "hidden", boxShadow: "{shadow.card}" },
    children: [
      ...(it.image ? [{ type: "image" as const, src: it.image, alt: it.title ?? "", style: { width: "100%", css: "height: 240px; object-fit: cover;" } }] : []),
      { type: "flex" as const, direction: "column" as const, style: { gap: "0.5rem", padding: "1.25rem" }, children: [
        ...(it.category ? [{ type: "text" as const, text: it.category, style: { fontSize: "0.75rem", fontWeight: "700", color: "{colors.accent}", textTransform: "uppercase", letterSpacing: "0.05em" } }] : []),
        { type: "heading" as const, level: 3, text: it.title ?? "", style: { fontSize: "1.25rem", fontWeight: "600", color: "{colors.primary}" } },
        ...(it.link ? [{ type: "button" as const, text: "View →", href: it.link, style: { color: "{colors.accent}", background: "transparent", fontWeight: "600", padding: "0.25rem" } }] : []),
      ] },
    ],
  }));
  const grid: BlueprintNode = { type: "flex", direction: "row", style: { gap, flexWrap: "wrap", mobile: { flexDirection: "column" } }, children: cards };
  return section([container([...head, grid], { gap: "2.5rem" })], { background: "{colors.bg}" });
}

/** 3. Team member cards. */
function teamSection(p: TeamSectionParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const cols = p.columns ?? 3;
  const cards = (p.members ?? []).map((m) => ({
    type: "flex" as const,
    direction: "column" as const,
    style: { gap: "0.75rem", alignItems: "center", css: `flex: 1 1 ${Math.floor(100 / cols)}%;`, background: "{colors.surface}", padding: "2rem", borderRadius: "{radius.md}", boxShadow: "{shadow.card}", textAlign: "center" },
    children: [
      ...(m.image ? [{ type: "image" as const, src: m.image, alt: m.name ?? "", style: { width: "120px", height: "120px", borderRadius: "{radius.pill}", css: "object-fit: cover;" } }] : []),
      { type: "heading" as const, level: 3, text: m.name ?? "", style: { fontSize: "1.25rem", fontWeight: "600", color: "{colors.primary}", textAlign: "center" } },
      { type: "text" as const, text: m.role ?? "", style: { fontSize: "0.875rem", fontWeight: "600", color: "{colors.accent}", textAlign: "center", textTransform: "uppercase" } },
      ...(m.bio ? [{ type: "text" as const, text: m.bio, style: { color: "{colors.muted}", textAlign: "center", fontSize: "0.95rem" } }] : []),
      ...(m.social?.length ? [{
        type: "flex" as const, direction: "row" as const,
        style: { gap: "0.75rem", justifyContent: "center" },
        children: m.social.map((s) => ({ type: "icon" as const, iconName: s.icon ?? "fa-link", link: { href: s.url ?? "#" }, style: { color: "{colors.muted}", fontSize: "1.1rem" } })),
      }] : []),
    ],
  }));
  const grid: BlueprintNode = { type: "flex", direction: "row", style: { gap: "1.5rem", flexWrap: "wrap", mobile: { flexDirection: "column" } }, children: cards };
  return section([container([...head, grid], { gap: "2.5rem" })], { background: "{colors.bg}" });
}

/** 4. Vertical timeline of events/experience. */
function timeline(p: TimelineParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const items = (p.items ?? []).map((it) => {
    const isLeft = (it.side ?? "left") === "left";
    const card: BlueprintNode = {
      type: "flex", direction: "column",
      style: { gap: "0.5rem", background: "{colors.surface}", padding: "1.5rem", borderRadius: "{radius.md}", boxShadow: "{shadow.card}", css: `flex: 1 1 45%; ${isLeft ? "" : "margin-left: auto;"}` },
      children: [
        ...(it.date ? [{ type: "text" as const, text: it.date, style: { fontSize: "0.8125rem", fontWeight: "700", color: "{colors.accent}", textTransform: "uppercase", letterSpacing: "0.05em" } }] : []),
        { type: "heading" as const, level: 3, text: it.title ?? "", style: { fontSize: "1.25rem", fontWeight: "600", color: "{colors.primary}" } },
        ...(it.description ? [{ type: "text" as const, text: it.description, style: { color: "{colors.muted}", lineHeight: "1.6" } }] : []),
      ],
    };
    return card;
  });
  const timelineCol: BlueprintNode = { type: "flex", direction: "column", style: { gap: "1.5rem", css: "position: relative; padding-left: 2rem; border-left: 2px solid {colors.border};" }, children: items };
  return section([container([...head, timelineCol], { gap: "2rem", maxWidth: "800px" })]);
}

/** 5. Service cards with hover effects. */
function serviceCards(p: ServiceCardsParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const cols = p.columns ?? 3;
  const hoverEffect = p.hoverEffect ?? "lift";
  const hoverCss = hoverEffect === "grow" ? "transform: scale(1.05);" : hoverEffect === "float" ? "transform: translateY(-8px);" : "transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.12);";
  const cards = (p.services ?? []).map((s) => ({
    type: "flex" as const,
    direction: "column" as const,
    style: { gap: "1rem", css: `flex: 1 1 ${Math.floor(100 / cols)}%; background: "{colors.surface}"; padding: "2rem"; border-radius: "{radius.md}"; boxShadow: "{shadow.card}"; transition: all 0.3s ease; hover: { css: hoverCss }` },
    children: [
      ...(s.icon ? [{ type: "icon" as const, iconName: s.icon, style: { color: "{colors.accent}", fontSize: "2.5rem" } }] : []),
      { type: "heading" as const, level: 3, text: s.title ?? "", style: { fontSize: "1.25rem", fontWeight: "600", color: "{colors.primary}" } },
      ...(s.description ? [{ type: "text" as const, text: s.description, style: { color: "{colors.muted}", lineHeight: "1.6" } }] : []),
      ...(s.link ? [{ type: "button" as const, text: "Learn more →", href: s.link, style: { color: "{colors.accent}", background: "transparent", fontWeight: "600", padding: "0.25rem" } }] : []),
    ],
  }));
  const grid: BlueprintNode = { type: "flex", direction: "row", style: { gap: "1.5rem", flexWrap: "wrap", mobile: { flexDirection: "column" } }, children: cards };
  return section([container([...head, grid], { gap: "2.5rem" })], { background: "{colors.bg}" });
}

/** 6. Simple image carousel. */
function imageCarousel(p: ImageCarouselParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const images = (p.images ?? []).map((url) => ({ url, caption: "" }));
  const widget: BlueprintNode = { type: "carousel", props: { images, autoplay: p.autoplay ?? false, loop: p.loop ?? true } };
  return section([container([...head, widget], { gap: "2rem" })]);
}

/** 7. Social icons strip. */
function socialStrip(p: SocialStripParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push({ type: "text", text: p.heading, style: { color: "{colors.muted}", textAlign: p.align ?? "center", fontSize: "0.95rem" } });
  const items = (p.items ?? []).map((it) => ({ iconName: it.icon ?? "fa-link", url: it.url ?? "#", label: "" }));
  const widget: BlueprintNode = { type: "social-icons", items, style: { ...(p.align ? { textAlign: p.align } : {}) } };
  return section([container([...head, widget], { gap: "1rem", alignItems: "center" })], { padding: { top: "2.5rem", bottom: "2.5rem" } });
}

/** 8. Countdown timer section. */
function countdown(p: CountdownParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const labels = p.labels ?? ["Days", "Hours", "Minutes", "Seconds"];
  const html = `<div class="countdown-timer" data-target="${p.targetDate ?? ""}">
    <div class="count-item"><span class="count-num" id="days">00</span><span class="count-label">${labels[0]}</span></div>
    <div class="count-item"><span class="count-num" id="hours">00</span><span class="count-label">${labels[1]}</span></div>
    <div class="count-item"><span class="count-num" id="minutes">00</span><span class="count-label">${labels[2]}</span></div>
    <div class="count-item"><span class="count-num" id="seconds">00</span><span class="count-label">${labels[3]}</span></div>
  </div>`;
  const css = `.countdown-timer{display:flex;gap:2rem;justify-content:center}.count-item{display:flex;flex-direction:column;align-items:center;gap:0.5rem}.count-num{font-size:3rem;font-weight:700;color:{colors.primary}}.count-label{font-size:0.875rem;color:{colors.muted};text-transform:uppercase}`;
  const htmlNode: BlueprintNode = { type: "html", html, style: { css } };
  return section([container([...head, htmlNode], { gap: "2rem", alignItems: "center" })], { background: "{colors.surface}" });
}

/** 9. Blog post grid. */
function blogGrid(p: BlogGridParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading));
  const cols = p.columns ?? 3;
  const cards = (p.posts ?? []).map((post) => ({
    type: "flex" as const,
    direction: "column" as const,
    style: { gap: "0.75rem", css: `flex: 1 1 ${Math.floor(100 / cols)}%;`, background: "{colors.surface}", borderRadius: "{radius.md}", overflow: "hidden", boxShadow: "{shadow.card}" },
    children: [
      ...(post.image ? [{ type: "image" as const, src: post.image, alt: post.title ?? "", style: { width: "100%", css: "height: 200px; object-fit: cover;" } }] : []),
      { type: "flex" as const, direction: "column" as const, style: { gap: "0.5rem", padding: "1.5rem" }, children: [
        ...(post.date || post.author ? [{ type: "text" as const, text: `${post.date ?? ""} ${post.author ? "· " + post.author : ""}`, style: { fontSize: "0.8125rem", color: "{colors.muted}" } }] : []),
        { type: "heading" as const, level: 3, text: post.title ?? "", style: { fontSize: "1.25rem", fontWeight: "600", color: "{colors.primary}" } },
        ...(post.excerpt ? [{ type: "text" as const, text: post.excerpt, style: { color: "{colors.muted}", lineHeight: "1.6" } }] : []),
        ...(post.link ? [{ type: "button" as const, text: "Read more →", href: post.link, style: { color: "{colors.accent}", background: "transparent", fontWeight: "600", padding: "0.25rem" } }] : []),
      ] },
    ],
  }));
  const grid: BlueprintNode = { type: "flex", direction: "row", style: { gap: "1.5rem", flexWrap: "wrap", mobile: { flexDirection: "column" } }, children: cards };
  return section([container([...head, grid], { gap: "2.5rem" })], { background: "{colors.bg}" });
}

/** 10. 404 error page section. */
function error404(p: Error404Params): BlueprintNode {
  const kids: BlueprintNode[] = [
    { type: "heading", level: 1, text: p.heading ?? "404", style: { fontSize: "8rem", fontWeight: "700", color: "{colors.primary}", textAlign: "center", lineHeight: "1", mobile: { fontSize: "5rem" } } },
    { type: "text", text: p.text ?? "Page not found", style: { fontSize: "1.25rem", color: "{colors.muted}", textAlign: "center" } },
  ];
  if (p.ctaText) kids.push({ type: "button", text: p.ctaText, href: p.ctaHref ?? "/", style: { color: "#fff", background: "{colors.accent}", fontWeight: "700", padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" }, borderRadius: "{radius.md}" } });
  if (p.image) kids.push({ type: "image", src: p.image, style: { width: "300px", borderRadius: "{radius.lg}" } });
  return section([
    { type: "flex", direction: "column", style: { gap: "1.5rem", alignItems: "center", justifyContent: "center", minHeight: "60vh", maxWidth: "600px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" } }, children: kids },
  ]);
}

/** 11. Coming soon / maintenance page. */
function comingSoon(p: ComingSoonParams): BlueprintNode {
  const kids: BlueprintNode[] = [
    { type: "heading", level: 1, text: p.heading ?? "Coming Soon", style: { fontSize: "3rem", fontWeight: "700", color: "#FFFFFF", textAlign: "center", mobile: { fontSize: "2rem" } } },
  ];
  if (p.text) kids.push({ type: "text", text: p.text, style: { fontSize: "1.125rem", color: "#FFFFFF", textAlign: "center", css: "opacity: 0.9;" } });
  if (p.countdown && p.targetDate) {
    kids.push({
      type: "html",
      html: `<div class="countdown" data-target="${p.targetDate}"><span id="cd-days"></span>d <span id="cd-hours"></span>h <span id="cd-mins"></span>m <span id="cd-secs"></span>s</div>`,
      style: { css: ".countdown{font-size:2rem;font-weight:700;color:#fff;text-align:center}" },
    });
  }
  if (p.socialLinks?.length) {
    kids.push({
      type: "social-icons",
      items: p.socialLinks.map((s) => ({ iconName: s.icon ?? "fa-link", url: s.url ?? "#" })),
      style: { textAlign: "center" },
    });
  }
  return section([
    { type: "flex", direction: "column", style: { gap: "2rem", alignItems: "center", justifyContent: "center", minHeight: "100vh", maxWidth: "600px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" } }, children: kids },
  ], { background: "{colors.primary}" });
}

/** 12. Map section with contact info. */
function mapSection(p: MapSectionParams): BlueprintNode {
  const head: BlueprintNode[] = [];
  if (p.heading) head.push(sectionHeading(p.heading, false));
  const infoKids: BlueprintNode[] = [];
  if (p.address) infoKids.push({ type: "text", text: `📍 ${p.address}`, style: { color: "{colors.muted}", fontSize: "1rem" } });
  if (p.phone) infoKids.push({ type: "text", text: `📞 ${p.phone}`, style: { color: "{colors.muted}", fontSize: "1rem" } });
  if (p.email) infoKids.push({ type: "text", text: `✉ ${p.email}`, style: { color: "{colors.muted}", fontSize: "1rem" } });
  if (p.hours) infoKids.push({ type: "text", text: `🕐 ${p.hours}`, style: { color: "{colors.muted}", fontSize: "1rem" } });
  const mapHtml = p.mapEmbed
    ? `<iframe src="${p.mapEmbed}" width="100%" height="400" style="border:0;border-radius:1rem" allowfullscreen="" loading="lazy"></iframe>`
    : "";
  const mapNode: BlueprintNode = mapHtml
    ? { type: "html", html: mapHtml, style: { css: "flex: 1 1 50%;" } }
    : { type: "section", style: { background: "{colors.surface}", borderRadius: "{radius.md}", css: "flex: 1 1 50%; min-height: 400px;" }, children: [] };
  const infoCol: BlueprintNode = { type: "flex", direction: "column", style: { gap: "1rem", css: "flex: 1 1 40%;" }, children: [...head, ...infoKids] };
  return section([
    { type: "flex", direction: "row", style: { gap: "3rem", alignItems: "center", maxWidth: "1200px", width: "100%", margin: "0 auto", padding: { left: "1.5rem", right: "1.5rem" }, mobile: { flexDirection: "column" } }, children: [infoCol, mapNode] },
  ]);
}

// ---------------------------------------------------------------------------
// Template registry
// ---------------------------------------------------------------------------

export const TEMPLATES: Record<string, (params: Record<string, unknown>) => BlueprintNode> = {
  hero,
  "hero-split": heroSplit,
  "feature-grid": featureGrid,
  "feature-zigzag": featureZigzag,
  bento,
  stats,
  logos,
  steps,
  "cta-band": ctaBand,
  testimonials,
  pricing,
  faq,
  contact,
  navbar,
  footer,
  // New archetypes
  "hero-video": heroVideo,
  "portfolio-grid": portfolioGrid,
  "team-section": teamSection,
  timeline,
  "service-cards": serviceCards,
  "image-carousel": imageCarousel,
  "social-strip": socialStrip,
  countdown,
  "blog-grid": blogGrid,
  "error-404": error404,
  "coming-soon": comingSoon,
  "map-section": mapSection,
};

export interface TemplateInfo {
  name: string;
  description: string;
  params: string;
  example: Record<string, unknown>;
}

export const TEMPLATE_INFO: TemplateInfo[] = [
  {
    name: "hero",
    description: "Above-the-fold hero. Side-by-side with an image, or centered when no image.",
    params: "heading, text, primaryCta {text,href}, secondaryCta?, image? (url), align? (left|center)",
    example: { heading: "Grow your business", text: "We make it simple.", primaryCta: { text: "Get started", href: "/contact" }, secondaryCta: { text: "Learn more", href: "/about" }, image: "https://example.com/hero.jpg" },
  },
  {
    name: "hero-split",
    description: "Asymmetric hero (~55% text / ~45% media) with an eyebrow kicker and an accent panel behind the image. Looks bespoke vs. the centered default.",
    params: "eyebrow?, heading, text?, primaryCta {text,href}, secondaryCta?, image? (url), imageAlt?, imageSide? (left|right)",
    example: { eyebrow: "HR, handled", heading: "Compliant, human HR for growing teams", text: "Outsource the paperwork; keep the people part.", primaryCta: { text: "Book a call", href: "/contact" }, secondaryCta: { text: "See services", href: "/services" }, image: "https://example.com/team.jpg", imageAlt: "Northpeak HR team" },
  },
  {
    name: "feature-grid",
    description: "Responsive grid of feature/service cards on a surface background.",
    params: "heading?, subheading?, items: [{ title, text, icon? (svg url) }]",
    example: { heading: "What we do", items: [{ title: "Fast", text: "Lightning quick." }, { title: "Secure", text: "Safe by default." }, { title: "Simple", text: "Easy to use." }] },
  },
  {
    name: "feature-zigzag",
    description: "Alternating image/text rows (zig-zag). Distinctive alternative to three identical cards; great for services or how-it-works.",
    params: "eyebrow?, heading?, items: [{ title, text, image? (url), imageAlt?, tag? (eyebrow), cta? {text,href} }]",
    example: { heading: "How we help", items: [{ tag: "Compliance", title: "Stay audit-ready", text: "Policies, postings and filings kept current.", image: "https://example.com/a.jpg" }, { tag: "People", title: "Onboard with ease", text: "Offer letters to day-one, handled.", image: "https://example.com/b.jpg" }] },
  },
  {
    name: "bento",
    description: "Bento grid of mixed-size cards (span 2 = wide, 1 = standard; highlight = filled with primary). Modern, editorial feel.",
    params: "eyebrow?, heading?, items: [{ title, text, icon? (svg url), span? (1|2), highlight? (bool) }]",
    example: { heading: "Why teams choose us", items: [{ title: "All-in-one HR", text: "One partner for the whole employee lifecycle.", span: 2, highlight: true }, { title: "Utah-based", text: "Local, responsive support." }, { title: "Fixed monthly fee", text: "No surprise invoices." }] },
  },
  {
    name: "stats",
    description: "Row of big numbers for social proof. Set onPrimary:true for a primary-color band.",
    params: "heading?, onPrimary? (bool), items: [{ value, label }]",
    example: { items: [{ value: "12+", label: "Years in HR" }, { value: "300+", label: "Clients served" }, { value: "98%", label: "Retention" }] },
  },
  {
    name: "logos",
    description: "Quiet client/partner logo strip (grayscale, muted).",
    params: "heading?, logos: [url] or [{ src, alt }]",
    example: { heading: "Trusted by teams across Utah", logos: ["https://example.com/logo1.svg", "https://example.com/logo2.svg"] },
  },
  {
    name: "steps",
    description: "Numbered how-it-works steps with accent number badges.",
    params: "eyebrow?, heading?, items: [{ number?, title, text }]",
    example: { heading: "Getting started", items: [{ title: "Book a call", text: "Tell us about your team." }, { title: "Get a plan", text: "We map your HR gaps." }, { title: "We run it", text: "You focus on the business." }] },
  },
  {
    name: "cta-band",
    description: "Full-width call-to-action band on the primary color.",
    params: "heading, text?, cta {text,href}",
    example: { heading: "Ready to start?", text: "Join thousands of teams.", cta: { text: "Sign up", href: "/signup" } },
  },
  {
    name: "testimonials",
    description: "Testimonials carousel (reviews widget).",
    params: "heading?, items: [{ content, name, title?, image? (url) }]",
    example: { heading: "Loved by customers", items: [{ content: "Fantastic!", name: "Jane Doe", title: "CEO, Acme", image: "https://example.com/jane.jpg" }] },
  },
  {
    name: "pricing",
    description: "Row of pricing tables on a surface background.",
    params: "heading?, plans: [{ heading, price, period?, features: [string], buttonText?, ribbon? }]",
    example: { heading: "Pricing", plans: [{ heading: "Pro", price: "39", features: ["Everything in Basic", "Priority support"], ribbon: "Popular", buttonText: "Choose Pro" }] },
  },
  {
    name: "faq",
    description: "FAQ as tabs (question = tab label, answer = panel).",
    params: "heading?, items: [{ q, a }]",
    example: { heading: "FAQ", items: [{ q: "Is there a free trial?", a: "Yes, 14 days." }] },
  },
  {
    name: "contact",
    description: "Contact form section. Defaults to Name/Email/Message fields.",
    params: "heading?, email {to,subject?}, fields? [{label,name,type,required}], submitText?",
    example: { heading: "Get in touch", email: { to: "hello@example.com", subject: "New enquiry" } },
  },
  {
    name: "navbar",
    description: "Sticky-style header with brand, nav links, and an optional CTA.",
    params: "brand (or brandImage url), links: [{text,href}], cta? {text,href}",
    example: { brand: "Acme", links: [{ text: "Home", href: "/" }, { text: "About", href: "/about" }], cta: { text: "Contact", href: "/contact" } },
  },
  {
    name: "footer",
    description: "Multi-column footer on the primary color with a copyright line.",
    params: "columns: [{ heading, links: [{text,href}] }], copyright",
    example: { columns: [{ heading: "Company", links: [{ text: "About", href: "/about" }] }], copyright: "© 2026 Acme, Inc." },
  },
  {
    name: "hero-video",
    description: "Hero section with video/slideshow/gradient background. Full-height with overlay and dual CTAs.",
    params: "heading, text?, backgroundType? (slideshow|gradient|classic), backgroundImages? [url], overlayColor?, overlayOpacity?, primaryCta? {text,href}, secondaryCta? {text,href}",
    example: { heading: "Build the Future", text: "Transform your business today.", backgroundType: "gradient", primaryCta: { text: "Get Started", href: "/start" }, secondaryCta: { text: "Learn More", href: "/about" } },
  },
  {
    name: "portfolio-grid",
    description: "Portfolio/gallery grid with filterable categories. Cards with image, category tag, title, and link.",
    params: "heading?, items: [{ title, category, image, link }], columns? (2-4), gap?",
    example: { heading: "Our Work", items: [{ title: "Project Alpha", category: "Web", image: "https://example.com/1.jpg", link: "/projects/1" }], columns: 3 },
  },
  {
    name: "team-section",
    description: "Team member cards with photo, name, role, bio, and social links.",
    params: "heading?, members: [{ name, role, image, bio, social: [{icon, url}] }], columns?",
    example: { heading: "Our Team", members: [{ name: "Jane Doe", role: "CEO", image: "https://example.com/jane.jpg", bio: "10+ years leading teams.", social: [{ icon: "fa-linkedin", url: "https://linkedin.com/jane" }] }], columns: 3 },
  },
  {
    name: "timeline",
    description: "Vertical timeline of events/experience with alternating left/right cards.",
    params: "heading?, items: [{ date, title, description, side: left|right }]",
    example: { heading: "Our Journey", items: [{ date: "2020", title: "Founded", description: "Started in a garage.", side: "left" }, { date: "2023", title: "Series A", description: "Raised $10M.", side: "right" }] },
  },
  {
    name: "service-cards",
    description: "Service cards with icon, title, description, link, and hover effects (grow/float/lift).",
    params: "heading?, services: [{ icon, title, description, link }], columns?, hoverEffect? (grow|float|lift)",
    example: { heading: "Services", services: [{ icon: "fa-code", title: "Development", description: "Full-stack web apps.", link: "/services/dev" }], columns: 3, hoverEffect: "lift" },
  },
  {
    name: "image-carousel",
    description: "Simple image carousel using the media-carousel widget.",
    params: "heading?, images: [url], autoplay? (bool), loop? (bool)",
    example: { heading: "Gallery", images: ["https://example.com/1.jpg", "https://example.com/2.jpg"], autoplay: true, loop: true },
  },
  {
    name: "social-strip",
    description: "Social icons strip for footer or header.",
    params: "heading?, items: [{ icon, url }], align? (left|center|right)",
    example: { heading: "Follow us", items: [{ icon: "fa-twitter", url: "https://twitter.com/acme" }, { icon: "fa-linkedin", url: "https://linkedin.com/acme" }], align: "center" },
  },
  {
    name: "countdown",
    description: "Countdown timer section using HTML widget with JavaScript target date.",
    params: "heading?, targetDate (ISO date string), labels? [days,hours,minutes,seconds]",
    example: { heading: "Launch Countdown", targetDate: "2026-12-31T23:59:59", labels: ["Days", "Hours", "Minutes", "Seconds"] },
  },
  {
    name: "blog-grid",
    description: "Blog post grid with image, date, author, title, excerpt, and read more link.",
    params: "heading?, posts: [{ title, excerpt, image, date, author, link }], columns?",
    example: { heading: "Latest Posts", posts: [{ title: "Getting Started", excerpt: "A beginner's guide.", image: "https://example.com/1.jpg", date: "Jan 15, 2026", author: "Jane", link: "/blog/1" }], columns: 3 },
  },
  {
    name: "error-404",
    description: "404 error page section with large heading, text, and CTA button.",
    params: "heading?, text?, ctaText?, ctaHref?, image?",
    example: { heading: "404", text: "Oops! Page not found.", ctaText: "Go Home", ctaHref: "/" },
  },
  {
    name: "coming-soon",
    description: "Coming soon / maintenance page with optional countdown and social links.",
    params: "heading?, text?, countdown? (bool), targetDate?, socialLinks? [{icon, url}]",
    example: { heading: "Coming Soon", text: "We're working on something amazing.", countdown: true, targetDate: "2026-12-31", socialLinks: [{ icon: "fa-twitter", url: "https://twitter.com/acme" }] },
  },
  {
    name: "map-section",
    description: "Map section with contact info (address, phone, email, hours) and an embedded map iframe.",
    params: "heading?, address?, phone?, email?, mapEmbed? (iframe URL), hours?",
    example: { heading: "Visit Us", address: "123 Main St, City", phone: "+1 555 0100", email: "hello@example.com", mapEmbed: "https://maps.google.com/embed", hours: "Mon-Fri 9am-5pm" },
  },
];

// ---------------------------------------------------------------------------
// Expansion
// ---------------------------------------------------------------------------

function expandNode(node: BlueprintNode): BlueprintNode {
  if (node.type === "template") {
    const fn = TEMPLATES[node.template ?? ""];
    if (!fn) {
      throw new Error(`Unknown template "${node.template}". Known: ${Object.keys(TEMPLATES).join(", ")}`);
    }
    return expandNode(fn(node.params ?? {}));
  }
  const out: BlueprintNode = { ...node };
  if (node.children) out.children = node.children.map(expandNode);
  if (node.tabs) {
    out.tabs = node.tabs.map((t) => ({ ...t, children: t.children ? t.children.map(expandNode) : t.children }));
  }
  return out;
}

/** Expand all `template` nodes in a tree into friendly subtrees. */
export function expandTemplates(tree: BlueprintNode[]): BlueprintNode[] {
  return tree.map(expandNode);
}
