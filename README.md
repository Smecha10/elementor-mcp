# Elementor MCP

![CI](https://github.com/Smecha10/elementor-mcp/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

An MCP (Model Context Protocol) server that lets AI agents design complete websites and emit **import-ready Elementor v4 JSON**. The agent makes design decisions; the server guarantees structurally valid output.

## Quick start

```bash
npm install @smecha10/elementor-mcp
npx elementor-mcp
```

### Register with an MCP client

**Claude Desktop** - add to claude_desktop_config.json:
```json
{
  "mcpServers": {
    "elementor": {
      "command": "npx",
      "args": ["-y", "@smecha10/elementor-mcp"],
      "env": { "ELEMENTOR_MCP_OUT": "./output" }
    }
  }
}
```

**HTTP transport:**
```bash
ELEMENTOR_MCP_TRANSPORT=http ELEMENTOR_MCP_PORT=3001 npx elementor-mcp
```

## Features

- **27 section templates** - hero, feature-grid, bento, timeline, portfolio-grid, team-section, countdown, error-404, and more
- **39 widget types** - heading, text, button, image, icon, accordion, form, tabs, pricing, carousel, portfolio, HTML, and more
- **Dual format output** - atomic (default, Elementor v4 $$type) or classic (flat settings, maximum import compatibility)
- **Motion effects** - entrance/hover animations, scroll effects, mouse effects, 3D transforms, sticky, v4 interactions
- **Dynamic tags** - bind WordPress content (post-title, featured-image, author, etc.)
- **@keyframes injection** - CSS keyframe animations in page-level custom_css
- **Global widgets** - reusable widget definitions shared across pages
- **CSS custom properties** - auto-generated from theme tokens, with dark mode support
- **Popup builder** - triggers, entrance/exit animations, timing rules
- **Theme Builder** - header/footer/single/archive templates with display conditions
- **Brand-driven theme generation** - 6 design personalities, WCAG contrast checks
- **SEO sidecar** - meta tags, Open Graph, Twitter cards, JSON-LD schema
- **Schema learning** - feed real Elementor exports to learn exact widget settings
- **HTTP + stdio transport** - use remotely or locally

## Tools (15)

| Tool | Purpose |
|------|---------|
| get_intake_brief | Client questionnaire - run first |
| get_design_playbook | Design system and best-practice rules |
| generate_theme | Brand color + personality to full WCAG-checked theme |
| generate_seo | Meta + Open Graph + JSON-LD schema sidecar |
| list_widgets | All blueprint node types (with pagination) |
| get_widget_schema | Fields, example, and learned schema for one widget |
| list_motion_options | All animation/effect/interaction options |
| list_dynamic_tags | Dynamic tag names for WordPress content binding |
| list_templates | All 27 section templates (with pagination) |
| get_template | Params + example for one template |
| validate_blueprint | Compile in memory, report errors |
| build_page | Compile and write one import-ready .json (supports dryRun) |
| build_popup | Compile a popup with triggers and timing |
| build_site | Compile a multi-page site (supports dryRun) |
| learn_from_export | Ingest Elementor exports, learn widget schemas |

## Prompt templates (3)

| Prompt | Purpose |
|--------|---------|
| design-website | Full intake to theme to build to SEO workflow |
| design-landing-page | Single landing page workflow |
| design-popup | Popup design workflow |

## Dual format output

| Format | Settings | Widget names | Layout | Use case |
|--------|----------|-------------|--------|----------|
| atomic (default) | $$type wrapped | e-heading, e-paragraph | e-flexbox | Elementor v4 editor |
| classic | Flat settings | heading, text-editor | container | Maximum import compatibility |

Most real-world Elementor installations use the flat settings format. Use "classic" for maximum compatibility.

## Development

```bash
git clone https://github.com/Smecha10/elementor-mcp.git
cd elementor-mcp
npm install
npm run build      # tsc
npm run selftest    # compile sample site + verify
npm test           # vitest (16 tests)
```

## License

MIT - see LICENSE file

## Changelog

### v0.5.0
- Classic format compiler (flat settings, container elType, classic widget names)
- 12 new template archetypes (27 total)
- Schema learning from 7 real Elementor templates (21 types, 275 instances)
- Vitest test framework (16 tests), GitHub Actions CI
- 3 MCP prompt templates, pagination, dryRun option

### v0.4.0
- @keyframes injection, global widgets, HTTP transport

### v0.3.0
- Motion effects, interactions, dynamic tags, popup builder, Theme Builder conditions, CSS custom properties

### v0.2.0
- 15 TypeScript source files, 9 new Tier 1 widgets, template type support

### v0.1.0
- Initial release: blueprint compiler, 15 section templates, 6 brand personalities, SEO sidecar, schema learning
