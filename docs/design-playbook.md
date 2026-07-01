# Elementor Site Design Playbook

This is the design system the agent should follow when generating sites. It is
intentionally **brief-driven**: derive concrete tokens from the client's brief,
then apply these rules consistently. Output goes through the MCP `build_page`
tool, which compiles a friendly blueprint into Elementor v4 JSON.

---

## 0. The workflow — never skip the brief

A site that doesn't look like "every other AI website" comes from real inputs,
not defaults. Always run this order:

1. **Intake first.** Call `get_intake_brief` and actually ask the client the
   company + design + content + SEO questions. Do not invent a brand or guess —
   a unique site requires unique inputs (real services, real proof, real voice,
   real brand color, things to *avoid*).
2. **Generate the theme from the brand.** Feed the brand color + chosen
   personality to `generate_theme`. This produces a full, contrast-checked
   palette and a font/radius/shadow system built around *their* brand — use the
   returned `theme` verbatim. Fix any contrast warnings it reports.
3. **Choose structure from the brief**, not a fixed template. Pick the pages and
   the section order that fit this business (see §5 and §10). Vary it.
4. **Write specific copy.** Use the client's actual services, audience pains and
   proof. No "Lorem", no "We provide best-in-class solutions."
5. **Build** with `build_page` / `build_site`.
6. **SEO** — attach a `seo` object to each page/site so a `.seo.json` sidecar is
   written (meta, Open Graph, JSON-LD). See §11. Or call `generate_seo` directly.

---

## 1. Always start with theme tokens

Define a `theme` per site and reference it everywhere with `{token.path}`.
Never hard-code a hex value or a font twice.

```json
"theme": {
  "colors": {
    "primary":   "#1A2D5A",
    "accent":    "#E8743B",
    "bg":        "#FFFFFF",
    "surface":   "#F6F8FB",
    "text":      "#1A1A1A",
    "muted":     "#5B6472",
    "border":    "#E3E8EF"
  },
  "fonts":   { "heading": "Poppins, sans-serif", "body": "Inter, sans-serif" },
  "radius":  { "sm": "0.5rem", "md": "1rem", "lg": "1.75rem", "pill": "999px" },
  "shadow":  { "card": "0 10px 40px rgba(26,45,90,0.10)" }
}
```

**Choosing colors from a brief:** pick ONE primary brand color, ONE accent for
CTAs, a near-black text, a muted gray, and a light surface for alternating
sections. Verify text/background contrast meets WCAG AA (4.5:1 body, 3:1 large).

---

## 2. Spacing scale (8px system)

Use only these step values for gaps, padding, and margins:
`0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem, 6rem`.

- **Section vertical padding:** `4rem`–`6rem` desktop, `2.5rem`–`3rem` mobile.
- **Gap between cards / items:** `1.5rem`–`2rem`.
- **Gap between a heading and its supporting text:** `0.75rem`–`1rem`.

---

## 3. Type scale

Modular scale (~1.25). Map to heading levels:

| Role            | Size desktop | Size mobile | Weight |
|-----------------|--------------|-------------|--------|
| Display / H1    | `3rem`       | `2rem`      | 700    |
| Section / H2    | `2.25rem`    | `1.6rem`    | 700    |
| Subsection / H3 | `1.5rem`     | `1.25rem`   | 600    |
| Body            | `1.125rem`   | `1rem`      | 400    |
| Small / caption | `0.875rem`   | `0.875rem`  | 400    |

- Line-height: `1.1`–`1.2` for headings, `1.6` for body (set via `lineHeight`).
- Limit body line length: `maxWidth: "65ch"` on long paragraphs.
- Exactly **one H1 per page.**

---

## 4. Layout

- The top-level of every page is a list of **`section`** blocks (one per band of
  content). Give sections their vertical `padding` and an optional background.
- Inside a section, use a centered **content container**: a `flex` (column) with
  `maxWidth: "1200px"`, `width: "100%"`, `margin: "0 auto"`, horizontal padding
  `1.5rem`.
- Use `flex` with `direction: "row"` for multi-column rows; set `gap`,
  `alignItems`, `justifyContent`. For card grids use row + `flexWrap: "wrap"`,
  giving each child `flex: "1 1 300px"` (via the `css` escape hatch / `flexBasis`).
- **Mobile:** stack rows by setting `mobile: { flexDirection: "column" }`.

---

## 5. Section patterns (a typical marketing page)

> **Fast path:** most of these patterns exist as ready-made, theme-aware
> templates. Layout/structure: `hero`, `hero-split`, `feature-grid`,
> `feature-zigzag`, `bento`, `stats`, `logos`, `steps`, `cta-band`,
> `testimonials`, `pricing`, `faq`, `contact`, `navbar`, `footer`. Prefer a
> `template` node and only hand-build sections when you need something custom.
> See `list_templates`. For multi-page sites use `build_site` with a shared
> `navbar`/`footer`.
>
> **To avoid the generic look, vary your archetypes:** use `hero-split` (not
> always the centered `hero`), `feature-zigzag` or `bento` instead of always a
> 3-card `feature-grid`, and add `stats`/`logos`/`steps` for rhythm. Don't ship
> the same section stack for every client.


1. **Hero** — H1 + supporting paragraph + primary button (+ secondary), hero
   image or background. Strong, generous spacing.
2. **Logos / social proof** — a row of muted logos or a one-line stat.
3. **Features / services** — 3-column card grid; each card = icon + H3 + text.
4. **How it works / steps** — numbered steps in a row or alternating rows.
5. **Testimonials / reviews** — quote cards or the `reviews` widget (via `raw`).
6. **Pricing** — `price-table` widgets (via `raw`) in a row.
7. **FAQ** — `tabs` or an accordion (via `raw`).
8. **CTA band** — full-width accent background, H2 + button, centered.
9. **Contact** — `form` with labeled inputs + a submit button.
10. **Footer** — multi-column flex of nav links + copyright.

Alternate section backgrounds (`bg` ↔ `surface`) to create rhythm.

---

## 6. Buttons

- Primary CTA: accent background, white text, `padding: { top:"1rem", right:"2.5rem", bottom:"1rem", left:"2.5rem" }`, `borderRadius: "{radius.md}"`, bold.
- Add a `hover` variant (slightly darker bg or lift via `transform`).
- One primary CTA per section; secondary actions use an outline/ghost style.

---

## 7. Responsiveness

Always provide `mobile` (and when useful `tablet`) overrides for:
- Heading sizes (drop ~30%).
- Row → column stacking.
- Reduced section padding.

---

## 8. Accessibility & quality

- One H1; logical heading order (don't skip levels for styling — use `style`).
- Buttons/links have descriptive text (not "click here").
- Images come from real URLs; provide meaningful content.
- Sufficient color contrast (see §1).
- Don't rely on color alone to convey meaning.

---

## 9. What maps to what

Native typed props (compiled to Elementor's real prop system, so they're
editable in the visual editor): `display`, `flexDirection`, `flexWrap`,
`justifyContent`, `alignItems`, `gap`, `fontSize`, `fontWeight`, `textAlign`,
`width`, `maxWidth`, `padding`, `color`, `borderRadius`.

Everything else you put in `style` (background, border, boxShadow, margin,
lineHeight, letterSpacing, textTransform, transform, position, etc.) is
automatically emitted as scoped `custom_css`. You can also pass a raw block with
`"css": "..."`.

Most rich widgets now have friendly types: `tabs`, `nav-menu`, `login`,
`price-table`, `rating`, `animated-headline`, `reviews`, `loop-grid`, `posts`.
The classic Pro ones take a `props` object of flat settings (see
`get_widget_schema`). Buttons take `href`/`targetBlank`; `svg`/`video` take a
`src`. For anything still uncovered, use a `raw` node with the atomic JSON in
`node` — and consider running `learn_from_export` on a real export so the exact
settings become known.

---

## 10. Don't look like every other AI website (advanced design)

The generic AI look = centered hero, three identical icon cards, a purple
gradient, one testimonial row, a CTA band. Avoid it deliberately:

- **Pick a personality and commit.** `generate_theme` supports `corporate`,
  `modern`, `elegant`, `bold`, `playful`, `minimal` — each changes the font
  pairing, radii, shadow and spacing rhythm. A law firm and a taco truck must
  not share a look. Match the personality to the brief's tone/industry.
- **Vary the layout, don't stamp it.** Mix section archetypes:
  - *Asymmetric hero* (text 55% / image 45%), not always centered.
  - *Alternating "zig-zag" feature rows* (image left, then image right) instead
    of three identical cards.
  - *Off-grid / overlapping* elements via negative `margin` + `position`.
  - *Bento grid* (mixed-size cards) for features or work.
  - *Editorial split* sections with a sticky-feeling label column.
- **Real visual hierarchy.** One dominant focal point per section. Use scale
  contrast (big H1 vs small eyebrow label), weight, and color — not five things
  all shouting. Add an **eyebrow/kicker** (small uppercase label in `{colors.accent}`)
  above section headings.
- **Color with restraint and intent.** Brand color carries identity; accent is
  reserved almost entirely for CTAs and key highlights so it actually pops. Use
  `surface`/`surfaceAlt` to create section rhythm. Don't tint everything.
- **Type pairing does heavy lifting.** Keep the personality's heading/body
  pairing. Use `{type.letterSpacing}` on display headings; generous
  `lineHeight` (1.6) on body; cap measure at `65ch`.
- **Whitespace is a feature.** Generous section padding (`{space.section}`) and
  gaps read as premium. Cramped = cheap.
- **Specific imagery.** Prefer the client's real photos. If using stock, choose
  consistent, on-brand shots — never the obvious clichés (handshake, generic
  team-at-laptop). Every image needs descriptive `alt`.
- **Micro-detail.** Hover states on every interactive element, a consistent
  radius from the theme, one cohesive shadow (`{shadow.card}`), and consistent
  icon style.
- **Honor `avoid`.** Whatever the client said to avoid (competitor look-alikes,
  colors, clichés) — actively steer away from it.

Use `{type.*}` and `{space.*}` tokens that `generate_theme` emits:
`{type.headingWeight}`, `{type.letterSpacing}`, `{space.section}`,
`{space.sectionMobile}`.

---

## 11. SEO (built in)

Each page should carry a `seo` object; `build_page`/`build_site` write it as a
`<page>.seo.json` sidecar (meta tags, Open Graph, Twitter card, JSON-LD). The
imported Elementor JSON stays clean — apply the sidecar at the WordPress level
(an SEO plugin like Yoast/Rank Math, or the page `<head>`).

```jsonc
"seo": {
  "metaTitle": "Outsourced HR in Utah",          // ≤ 60 chars; brand auto-suffixed
  "metaDescription": "Compliant, human HR for growing Utah teams …",  // 150–160 chars
  "slug": "services",
  "keywords": ["outsourced HR Utah", "HR compliance consulting"],
  "canonical": "https://northpeakhr.com/services",
  "ogImage": "https://northpeakhr.com/og/services.png",  // 1200×630
  "siteName": "Northpeak HR",
  "pageType": "Service",                          // WebPage | AboutPage | ContactPage | Service …
  "business": {                                   // → JSON-LD; put on the site seo, inherited by pages
    "name": "Northpeak HR", "type": "ProfessionalService",
    "telephone": "+1-801-555-0100", "email": "hello@northpeakhr.com",
    "address": { "city": "Salt Lake City", "region": "UT", "country": "US" },
    "sameAs": ["https://www.linkedin.com/company/northpeakhr"]
  }
}
```

On-page SEO rules the layout must follow:
- Exactly **one H1** per page, containing the page's primary keyword naturally.
- Logical heading order (H1 → H2 → H3); don't skip levels for size — use `style`.
- Descriptive `alt` on **every** image (and meaningful link text).
- Keyword-aware but human copy in the hero, section headings and first paragraph.
- Unique `metaTitle` + `metaDescription` per page; descriptive `slug`.
- Put site-wide fields (`siteName`, `business`, default `ogImage`) on the
  **site** `seo`; per-page `seo` overrides win.
