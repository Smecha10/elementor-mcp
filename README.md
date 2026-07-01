# Elementor MCP

An MCP server that lets an AI agent design complete websites and emit
**import-ready Elementor v4 ("Atomic Widgets") JSON**.

The agent makes the design decisions (layout, copy, palette, typography); the
server guarantees the output is structurally valid — it handles `$$type`
wrapping, ID/class generation, the `styles → variants → breakpoint/state` model,
base64 `custom_css`, and responsive/hover variants. The agent never hand-writes
the verbose Elementor format.

## How it works

You describe a site → the agent produces a compact **blueprint** → the server
compiles it to Elementor JSON → you import the file into Elementor.

```
[get_intake_brief] ─▶ answers ─▶ [generate_theme] ─▶ theme
                                       │
brief + theme ─▶ agent ─▶ blueprint ─▶ [build_page/build_site] ─▶ page.json (+ page.seo.json)
                                                                        └▶ Elementor import
```

The recommended flow: **intake → theme → build → SEO**. Run `get_intake_brief`
to gather company/design/content/SEO facts, feed the brand color + a
personality to `generate_theme`, design the blueprint around that theme, then
build. Add a `seo` object to each page to emit a `.seo.json` sidecar.

## Install & build

```bash
npm install
npm run build
npm run selftest   # compiles a sample site and verifies output vs the real format
```

## Register with an MCP client

### Claude Desktop
Add to `claude_desktop_config.json`
(Windows: `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "elementor": {
      "command": "node",
      "args": ["C:/Users/Smech/OneDrive/Desktop/Elementor MCP/dist/server.js"],
      "env": { "ELEMENTOR_MCP_OUT": "C:/Users/Smech/OneDrive/Desktop/Elementor MCP/output" }
    }
  }
}
```

### Claude Code
```bash
claude mcp add elementor -- node "C:/Users/Smech/OneDrive/Desktop/Elementor MCP/dist/server.js"
```

Then ask: *"Build me a landing page for a Utah HR consulting firm."* The agent
will read the playbook, design tokens, assemble a blueprint, and call
`build_page`.

## Tools

| Tool | Purpose |
|------|---------|
| `get_intake_brief` | The client questionnaire (company + design + content + SEO). Run first. |
| `get_design_playbook` | The design system & best-practice rules. Read early. |
| `generate_theme` | Brand color + personality → full WCAG-checked theme (colors/fonts/radii/shadow). |
| `generate_seo` | Meta + Open Graph + JSON-LD schema sidecar for a page. |
| `list_widgets` | All blueprint node types, by category. |
| `get_widget_schema` | Fields, example, and any *learned* schema for one node type. |
| `list_templates` | Ready-made, theme-aware section templates. |
| `get_template` | Params + example for one section template. |
| `validate_blueprint` | Compile in memory; report element count / errors. |
| `build_page` | Compile and write one import-ready `.json` file. |
| `build_site` | Compile a multi-page site (shared theme + header/footer) to many files. |
| `learn_from_export` | Ingest any Elementor export and learn its widgets' exact settings. |

## Section templates & multi-page sites

For speed, assemble pages from **theme-aware section templates** instead of
hand-building every node. Use a `template` node anywhere in a tree:

```json
{ "type": "template", "template": "hero", "params": {
    "heading": "Grow your business", "text": "We make it simple.",
    "primaryCta": { "text": "Get started", "href": "/contact" },
    "image": "https://example.com/hero.jpg" } }
```

Available: `hero`, `hero-split`, `hero-video`, `feature-grid`, `feature-zigzag`, `bento`,
`stats`, `logos`, `steps`, `cta-band`, `testimonials`, `pricing`, `faq`,
`contact`, `navbar`, `footer`, `portfolio-grid`, `team-section`, `timeline`,
`service-cards`, `image-carousel`, `social-strip`, `countdown`, `blog-grid`,
`error-404`, `coming-soon`, `map-section` (see `list_templates` / `get_template`).
The asymmetric/zig-zag/bento archetypes exist specifically to avoid the cookie-cutter
AI-site look — mix them per client. 27 templates total.

**`build_site`** compiles a whole site at once — every page shares the theme and
an optional `header`/`footer` (e.g. a navbar and footer template), and each page
is written as its own importable `.json` plus a `site-manifest.json`:

```jsonc
{
  "title": "Acme Co",
  "theme": { "colors": { "primary": "#13294B", "accent": "#E8743B" } },
  "header": [ { "type": "template", "template": "navbar", "params": { /* … */ } } ],
  "footer": [ { "type": "template", "template": "footer", "params": { /* … */ } } ],
  "pages": [
    { "title": "Home",    "tree": [ /* template/widget nodes */ ] },
    { "title": "Services","tree": [ /* … */ ] },
    { "title": "Contact", "tree": [ /* … */ ] }
  ]
}
```

A built example lives in `examples/sample-site/`.

### Theme defaults
Every blueprint/site theme layers over a built-in **default theme** (colors,
fonts, radii, shadow), so templates always resolve their tokens — you only
declare what you want to override.

## Covered widgets

**Friendly types** (first-class): `section`, `flex`/`row`/`column`, `spacer`,
`heading`, `text`, `button` (with `href`), `image`, `svg`, `divider`, `youtube`,
`video`, `form` + `label`/`input`/`textarea`/`select`/`submit`, `tabs`,
`nav-menu`, `login`, `price-table`, `rating`, `animated-headline`, `reviews`,
`loop-grid`, `posts`. Anything else → the `raw` node.

There are two underlying widget families, handled automatically:
- **Atomic `e-*` widgets** — typed `$$type` settings + the styles system.
- **Classic Pro widgets** (price-table, nav-menu, reviews, …) — flat legacy
  settings, minimal wrapper. Provide these via the `props` field.

## Filling coverage gaps (self-improving)

The compiler is reverse-engineered from real exports, so unseen settings can't
be guessed. To teach it precisely: export a page from your Elementor install
that uses the widget/settings you want, then:

```bash
npm run build
node dist/learn.js path/to/export.json     # or call the learn_from_export tool
```

This extracts every widget's settings schema (atomic vs flat, `$$type`s, list
item keys) into `reference/widget-schemas.json`, and `get_widget_schema` will
then report the exact shape. Feed it more exports over time and coverage grows
without code changes.

## The blueprint format

```jsonc
{
  "title": "Acme — Home",
  "fileName": "home",            // output filename (optional)
  "theme": {                     // per-site tokens, referenced as {path}
    "colors": { "primary": "#1A2D5A", "accent": "#E8743B", "surface": "#F6F8FB" },
    "radius": { "md": "1rem" }
  },
  "tree": [
    { "type": "section", "style": { "background": "{colors.surface}",
        "padding": { "top": "4rem", "bottom": "4rem" } },
      "children": [
        { "type": "flex", "direction": "column",
          "style": { "gap": "1.5rem", "maxWidth": "1200px", "width": "100%", "margin": "0 auto" },
          "children": [
            { "type": "heading", "level": 1, "text": "Welcome",
              "style": { "fontSize": "3rem", "color": "{colors.primary}",
                         "mobile": { "fontSize": "2rem" } } },
            { "type": "button", "text": "Get Started",
              "style": { "color": "#fff", "background": "{colors.accent}",
                         "padding": { "top": "1rem", "right": "2.5rem", "bottom": "1rem", "left": "2.5rem" },
                         "borderRadius": "{radius.md}", "hover": { "background": "#cf5f2b" } } }
          ] }
      ] }
  ]
}
```

### Styling
- **Native typed props** (compiled to Elementor's real prop system, editable in
  the visual editor): `display`, `flexDirection`, `flexWrap`, `justifyContent`,
  `alignItems`, `gap`, `fontSize`, `fontWeight`, `textAlign`, `width`,
  `maxWidth`, `padding`, `color`, `borderRadius`.
- **Everything else** (`background`, `border`, `boxShadow`, `margin`,
  `lineHeight`, …) → emitted as scoped `custom_css`.
- Responsive/interaction overrides: `tablet`, `mobile`, `widescreen`, `hover`
  sub-objects. Raw CSS escape hatch: `"css": "flex: 1 1 280px;"`.

### Tokens
Any string can reference a theme token with `{dotted.path}`
(e.g. `{colors.primary}`), resolved before compilation.

### Full widget coverage — the `raw` node
For any widget without a friendly type (reviews, loop-grid, posts, login,
nav-menu, price-table, rating, tabs, animated-headline, …), drop in the atomic
JSON directly:

```json
{ "type": "raw", "node": { "elType": "widget", "widgetType": "price-table",
  "settings": {}, "elements": [] } }
```

## Importing into Elementor

The generated file is a page template export. In WordPress/Elementor, use the
template import (Templates → Saved Templates → Import, or the page-level
import) and select the `.json`. Requires Elementor with the v4/Atomic Widgets
editor enabled (the format uses `version: 0.4`).

## Project layout

```
src/
  elementor/primitives.ts   $$type value constructors, IDs, base64 css
  elementor/nodes.ts        element + style-object builders
  styling.ts                friendly CSS → native props / custom_css
  theme.ts                  {token} resolution
  types.ts                  shared blueprint/site types
  widgets.ts                blueprint node catalog
  templates.ts              section-template library + expansion
  compiler.ts               blueprint/site → Elementor document(s)
  learn.ts                  schema extraction from exports (+ CLI)
  server.ts                 MCP server + tools
  selftest.ts               builds & validates a sample site
docs/design-playbook.md     the design system the agent follows
examples/                   sample blueprint + compiled output
reference/                  original export + widget-schemas.json (learned registry)
```
