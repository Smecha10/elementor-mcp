# Competitor & Ecosystem Research for Elementor MCP Server

## 1. Existing MCP Servers for WordPress

### Top WordPress MCP Servers (by GitHub stars)

| Server | Stars | Language | Approach | Key Features |
|--------|-------|----------|----------|-------------|
| **msrbuilds/elementor-mcp** (OURS) | 477 | PHP (plugin) + TS (compiler) | WordPress plugin + MCP compiler | 120+ tools, Elementor v4 Atomic Widgets JSON, blueprint-to-Elementor compilation, self-improving schema learning |
| **use-novamira/novamira** | 473 | PHP | WordPress plugin | Full WP access via PHP execution + filesystem ops, "Novamira Visual" browser workspace |
| **deus-h/claudeus-wp-mcp** | 154 | TypeScript | External Node.js server (REST API wrapper) | 145 tools, FSE support, Astra Pro integration, WooCommerce, site health |
| **AgriciDaniel/wp-mcp-ultimate** | 111 | PHP | WordPress plugin | 58 WP abilities, admin dashboard, API key generation |
| **aguaitech/Elementor-MCP** | 66 | JavaScript | External Node.js server | Simple Elementor MCP, Docker support, Smithery deployable |
| **cosmincraciun97/stonewright-wp-mcp** | 5 | PHP | WordPress plugin | Elementor + Gutenberg + WP-CLI + PHP runtime execution |

### npm Packages

| Package | Downloads | Tools | Description |
|---------|-----------|-------|-------------|
| **claudeus-wp-mcp** | 6,973 | 145 | Most downloaded. TypeScript, REST API wrapper. Content CRUD, FSE, Astra Pro, WooCommerce |
| **@respira/wordpress-mcp-server** | ~1,000+ | 200+ (275+ w/ add-ons) | Fastest growing. 16 page builders, Elementor 4 atomic write path, Playbooks, CPT creation |
| **@adsim/wordpress-mcp-server** | 223 | 180 | Enterprise focus. Modular architecture, governance, audit trail, WooCommerce, Schema.org |
| **@cavort-it-systems/wordpress-mcp** | 206 | Lightweight | Token-optimized REST API access |

### MCP Registry (registry.modelcontextprotocol.io)

Only **one** WordPress MCP server is listed in the official registry:
- **io.github.webmyc/respira-wordpress** (v7.2.12) — "200+ tools, 16 builders, context-aware filtering. SafeEdit safety."

Our server is NOT yet listed in the MCP registry.

## 2. Existing MCP Servers Specifically for Elementor

Only **two** Elementor-specific MCP servers exist:

1. **msrbuilds/elementor-mcp** (ours) — 477 stars, PHP plugin + TypeScript compiler. The most starred Elementor MCP. Focuses on blueprint-to-Elementor v4 JSON compilation.

2. **aguaitech/Elementor-MCP** — 66 stars, JavaScript, simple Node.js server. Last updated May 2025. Basic Elementor page creation via REST API. No longer actively maintained (10 commits total).

**Respira** (@respira/wordpress-mcp-server) has Elementor as one of 16 supported builders, with an "Elementor 4 atomic write path" (partial: 20 atomic element types with $$type envelopes).

## 3. WordPress Automation Tools (Non-MCP Competitors)

### WP-CLI
- The original WordPress command-line tool
- Can manage posts, users, plugins, themes, database operations
- **Elementor-specific WP-CLI commands exist** but are minimal:
  - `Nikschavan/elementor-commands` (4 stars, abandoned since 2017)
  - `lmoncany/elementor-claude-skill` (3 stars) — Claude Code skill for building Elementor pages from CLI
  - `get-proofpilot/claude-elementor-skill` (3 stars) — host-agnostic Claude Code skill
- **Limitation**: WP-CLI has no native Elementor page building capability. It can't create Elementor widget content.

### WordPress REST API
- Built-in REST API for CRUD on posts, pages, media, users, taxonomies
- Elementor stores page content as serialized PHP in `_elementor_data` post meta
- REST API can read/write this meta field, but the format is complex and undocumented
- **No official Elementor REST API** — Elementor's developer page (elementor.com/developers) returns a 404

### Headless CMS Tools
- **WPGraphQL**: GraphQL layer for WordPress, popular for headless setups
- **Faust.js**: Headless WordPress framework
- **Frontity**: React-based headless WordPress framework
- **Limitation**: None of these can generate Elementor-native content. They work with Gutenberg blocks or ACF, not page builder data.

## 4. AI-Powered WordPress Builders

### 10Web (10web.io)
- **Pricing**: $10/mo (Starter, 1 site), $15/mo (Premium, 2 sites), $23/mo (Ultimate, 4 sites)
- AI website builder with managed WordPress hosting
- Features: AI agentic builder, redesign/clone/Figma agents, ecommerce dashboard, 90+ PageSpeed score
- **Not MCP-compatible** — closed platform, no AI agent integration
- Competes at the "build a whole site" level, not the "edit via AI agent" level

### Wix ADI (Artificial Design Intelligence)
- Prompt-to-website builder
- Aria AI agent for in-editor assistance
- **Not WordPress** — proprietary platform, no Elementor integration
- Pricing: starts at $17/mo

### Duda
- AI-powered website builder for agencies
- Not WordPress-based
- Pricing: starts at $25/mo

### Key Insight
These AI builders compete at the **"replace WordPress entirely"** level. They are not tools that work *with* WordPress/Elementor. Our MCP server is complementary — it enhances existing WordPress sites rather than replacing them.

## 5. Elementor-Specific Automation

### Elementor API
- **No official public REST API** exists for Elementor
- Elementor stores data in `_elementor_data` (serialized PHP array) and `_elementor_version` post meta
- Elementor Pro has internal AJAX actions but no documented external API
- The developer page (elementor.com/developers) is a 404

### Third-Party Connectors
- **Zapier**: Has WordPress integration but no Elementor-specific triggers/actions
- **Make (Integromat)**: WordPress modules available, no Elementor-specific ones
- **Uncanny Automator**: WordPress automation plugin, can trigger on Elementor form submissions but cannot create Elementor content

### Elementor Form Integrations
- Elementor Pro forms can connect to: Mailchimp, ActiveCampaign, Slack, Zapier, Webhooks
- These are **form submission only** — not page/content creation

### Key Gap
There is **no existing tool** (MCP or otherwise) that can programmatically generate Elementor v4 Atomic Widgets JSON for import. Our server fills a unique niche.

## 6. Gaps in the Current Ecosystem

### What Our MCP Server Does That Nothing Else Can

1. **Blueprint-to-Elementor-v4-JSON compilation**: No other tool takes a high-level design description and produces import-ready Elementor v4 Atomic Widgets JSON. Others wrap the REST API for basic CRUD; we generate the actual page builder format.

2. **Self-improving schema learning** (`learn_from_export`): Our server can ingest any Elementor export and learn its widgets' exact settings. No competitor has this capability.

3. **Theme generation with WCAG checking**: `generate_theme` produces full color/font/radius/shadow themes with accessibility validation built in.

4. **Multi-page site generation** (`build_site`): Shared theme + header/footer across multiple pages in one operation.

5. **39 widget types with $$type envelopes**: Deep Elementor v4 format knowledge including per-breakpoint + per-state styling, responsive/hover variants, base64 custom_css.

### Gaps in Competitors

| Gap | Respira | Claudeus | Novamira | WP-MCP-Ultimate |
|-----|---------|----------|----------|-----------------|
| Elementor v4 Atomic Widgets | Partial (20 types) | None | None | None |
| Blueprint abstraction | No | No | No | No |
| Schema learning | No | No | No | No |
| Theme generation | No | No | No | No |
| Offline compilation | No | No | No | No |
| WCAG validation | No | No | No | No |

### What Competitors Do Better

| Feature | Respira | Claudeus | Novamira |
|---------|---------|----------|----------|
| Total tool count | 200+ | 145 | N/A (PHP exec) |
| Page builders supported | 16 | 1 (Gutenberg/FSE) | N/A |
| WooCommerce | Yes (add-on) | 3 tools | Via PHP |
| Live site editing | Yes | Yes | Yes |
| Multi-builder support | Yes | No | No |
| Playbooks/workflows | Yes | No | No |
| CPT creation | Yes | No | No |
| In-WP MCP endpoint | Yes | No | No |

## 7. How Other MCP Servers Handle Content Management (CRUD Patterns)

### Common CRUD Pattern (Claudeus, Respira, @adsim)

All WordPress MCP servers follow the same REST-API-wrapping pattern:

```
get_posts / get_post      → GET /wp/v2/posts
create_post               → POST /wp/v2/posts
update_post               → PUT /wp/v2/posts/{id}
delete_post               → DELETE /wp/v2/posts/{id}
```

This pattern is repeated for: pages, media, users, comments, taxonomies, menus, blocks, templates, WooCommerce products/orders.

**Respira's innovation**: Context-aware tool filtering (only show tools relevant to the active page builder), Playbooks (multi-step workflows crystallized into single tools), and an agent persona loaded into every handshake.

**Claudeus's approach**: 20+ specialized TypeScript modules, each handling a domain (content, media, users, FSE, Astra, WooCommerce, site health). Pure REST API wrapper — no page builder format knowledge.

**Novamira's approach**: Radical — gives AI agents raw PHP execution and filesystem access. Maximum power, maximum risk. No structured tools, just "run any PHP code."

### Our Different Approach
We don't wrap the REST API at all. We're a **compiler** — from a high-level blueprint to Elementor's native format. This is fundamentally different from the CRUD pattern.

## 8. Pricing Models for Similar Tools

### Respira (respira.press)
- **Free tier**: 7-day trial, no credit card
- **Maker**: Free for 7 days, then paid
- **Agency/Enterprise**: Custom pricing
- Model: SaaS subscription, runs on user's own AI (Claude, ChatGPT, Cursor)
- Key differentiator: "No extra AI bill" — you bring your own AI

### 10Web
- **AI Starter**: $10/mo (1 site, 100 AI credits/mo)
- **AI Premium**: $15/mo (2 sites, 200 AI credits/mo)
- **AI Ultimate**: $23/mo (4 sites, 300 AI credits/mo)
- Model: All-inclusive (hosting + builder + AI)
- 30-day money back guarantee

### Claudeus WP MCP
- **Open source** (MIT license on GitHub)
- Free to use, self-hosted
- No paid tier identified

### WP-MCP-Ultimate
- **Open source** (GPL license)
- Free WordPress plugin
- No paid tier identified

### Our Project
- Currently open source (no license file visible in package.json)
- No pricing model established
- **Potential models**: Freemium WordPress plugin (like Respira), SaaS compilation service, or open-source with paid support

## Summary of Competitive Landscape

1. **Respira** is the dominant competitor — 200+ tools, 16 builders, active development, commercial pricing. They have partial Elementor v4 support (20 types vs our 39).

2. **Claudeus** is the most downloaded npm package (6,973 downloads) but has no page builder support — only Gutenberg/FSE.

3. **Novamira** takes a radically different approach (PHP execution) and is more of a security concern than a direct competitor.

4. **No existing MCP server** offers blueprint-to-Elementor-JSON compilation, schema learning, or theme generation.

5. **Our unique value proposition**: We're not a REST API wrapper — we're a design-to-Elementor compiler. This is a fundamentally different category.

6. **Key risk**: Respira is actively adding Elementor v4 support and has a 16-builder head start. They're well-funded and commercially motivated.

7. **Key opportunity**: The MCP registry has only 1 WordPress server listed (Respira). Listing ours would give immediate visibility.
