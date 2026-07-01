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
    style: { fontSize: "3.25rem", fontWeight: "{type.headingWeight}", color: "{colors.primary}", lineHeight: "1.05", letterSpacing: "{type.letterSpacing}", mobile: { fontSize: "2.1rem" } },
  });
  if (p.text) copyKids.push({ type: "text", text: p.text, style: { fontSize: "1.15rem", color: "{colors.muted}", lineHeight: "1.6", maxWidth: "52ch" } });
  const ctas: BlueprintNode[] = [];
  if (p.primaryCta) ctas.push(primaryButton(p.primaryCta));
  if (p.secondaryCta) ctas.push(ghostButton(p.secondaryCta));
  if (ctas.length) copyKids.push({ type: "flex", direction: "row", style: { gap: "1rem", flexWrap: "wrap", margin: "0.5rem 0 0 0" }, children: ctas });
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
  ], { padding: { top: "{space.section}", bottom: "{space.section}" } });
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
    if (it.cta) textKids.push({ type: "flex", direction: "row", style: { margin: "0.25rem 0 0 0" }, children: [ghostButton(it.cta)] });
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
      { type: "heading" as const, level: 2, text: String(it.value ?? ""), style: { fontSize: "2.75rem", fontWeight: "{type.headingWeight}", color: "{colors.accent}", textAlign: "center" } },
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
