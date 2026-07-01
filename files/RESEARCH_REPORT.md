# Elementor MCP — Comprehensive Research Report

**Date:** 2026-06-30
**Agent:** research
**Project:** Elementor MCP (blueprint-to-Elementor v4 JSON compiler)

---

## Table of Contents

1. [Elementor Architecture](#1-elementor-architecture)
2. [MCP Server Design Best Practices](#2-mcp-server-design-best-practices)
3. [Motion Effects & Animations](#3-motion-effects--animations)
4. [Modern Design Patterns](#4-modern-design-patterns)
5. [Interaction System](#5-interaction-system)
6. [Competitor Analysis](#6-competitor-analysis)
7. [Gap Analysis & Recommendations](#7-gap-analysis--recommendations)

---

## 1. Elementor Architecture

### 1.1 Page Data Storage (v4 Atomic Widgets JSON)

Elementor v4 stores page data as a JSON object with this top-level structure:

```json
{
  "content": [ /* ElementNode[] */ ],
  "page_settings": [],
  "version": "0.4",
  "title": "Page Title",
  "type": "page"
}
```

**Document `type` field values:**
- `"page"` — standard page
- `"header"` — Theme Builder header
- `"footer"` — Theme Builder footer
- `"single"` — Theme Builder single post template
- `"archive"` — Theme Builder archive template
- `"popup"` — Popup Builder
- `"product"` — WooCommerce product template
- `"section"` — saved section
- `"kit"` — site kit

### 1.2 ElementNode Structure

Every element in the `content` array follows this shape:

```json
{
  "id": "218762da",
  "settings": { /* typed settings */ },
  "elements": [ /* child ElementNode[] */ ],
  "isInner": false,
  "elType": "widget",
  "widgetType": "e-heading",
  "styles": { /* style objects keyed by class name */ },
  "interactions": [],
  "editor_settings": { "title": "Heading" },
  "version": "0.0"
}
```

**Three element categories:**
1. **Atomic widgets** (`elType: "widget"`, `widgetType: "e-*"`) — carry `styles`, `interactions`, `editor_settings`, `version`
2. **Structural/layout elements** (`elType: "e-div-block"`, `"e-flexbox"`, `"e-form"`, `"e-tabs"`) — no `widgetType`, but carry `styles`/`interactions`/`version`
3. **Classic Pro widgets** (`elType: "widget"`, `widgetType: "price-table"`, `"nav-menu"`, etc.) — minimal wrapper, NO `styles`/`interactions`/`editor_settings`/`version`. Flat settings (no $$type wrapping).

### 1.3 The $$type Typed Value System

Every setting value in atomic widgets is wrapped as `{ "$$type": "<type>", "value": <actual> }`. Known $$type values (50+ from Elementor source):

| $$type | Value shape | Used for |
|--------|-------------|----------|
| `"string"` | plain string | tag, text content, form-name |
| `"number"` | number | default-active-tab |
| `"boolean"` | boolean | required, isTargetBlank |
| `"url"` | string (URL) | link destination, image URL |
| `"size"` | `{ unit: string, size: number }` | font-size, gap, width, max-width |
| `"dimensions"` | `{ block-start, inline-end, block-end, inline-start }` | padding (logical properties) |
| `"color"` | CSS color string | text color, background color |
| `"border-radius"` | `{ start-start, start-end, end-start, end-end }` | border radius (logical) |
| `"border-width"` | same as border-radius | border width |
| `"classes"` | `string[]` | CSS class list |
| `"html-v3"` | `{ content: string, children: [] }` | rich text |
| `"image"` | `{ src: image-src, size: string, alt?: string }` | image widget |
| `"image-src"` | `{ id: null\|number, url: url }` | image source reference |
| `"link"` | `{ destination: url, isTargetBlank: boolean, tag?: string }` | hyperlinks |
| `"svg-src"` | `{ id: null, url: url }` | SVG/icon source |
| `"video-src"` | `{ id: null, url: url }` | self-hosted video |
| `"email"` | `{ to: string, subject?: string }` | form email action |
| `"string-array"` | `string[]` (wrapped) | actions-after-submit |
| `"key-value"` | `{ key: string, value: string }` | select options |
| `"options"` | `key-value[]` | select options list |
| `"font-family"` | string | font family |
| `"box-shadow"` | structured object | box shadow |
| `"background"` | structured object | background (color/gradient/image) |
| `"background-overlay"` | structured object | background overlay |
| `"background-color-overlay"` | structured object | color overlay |
| `"background-gradient-overlay"` | structured object | gradient overlay |
| `"background-image-overlay"` | structured object | image overlay |
| `"flex"` | structured object | flex child properties |
| `"layout-direction"` | string | flex-direction |
| `"position"` | structured object | CSS position |
| `"grid-track-size"` | structured object | CSS grid track |
| `"query"` | structured object | query settings |
| `"time-size"` | `{ unit: "ms"|"s", size: number }` | duration/delay (interactions) |
| `"shadow"` | structured object | box/text shadow |
| `"color-stop"` | structured object | gradient color stop |
| `"attributes"` | structured object | HTML attributes |

### 1.4 Style Object Structure

Styles are stored as a map keyed by generated class name:

```json
"styles": {
  "e-218762da-b95e5bb": {
    "id": "e-218762da-b95e5bb",
    "label": "local",
    "type": "class",
    "variants": [
      {
        "meta": { "breakpoint": "desktop", "state": null },
        "props": {
          "font-size": { "$$type": "size", "value": { "unit": "rem", "size": 3 } },
          "color": { "$$type": "color", "value": "#1A2D5A" }
        },
        "custom_css": { "raw": "bGluZS1oZWlnaHQ6IDEuMTs=" }
      },
      {
        "meta": { "breakpoint": "mobile", "state": null },
        "props": { "font-size": { "$$type": "size", "value": { "unit": "rem", "size": 2 } } },
        "custom_css": null
      },
      {
        "meta": { "breakpoint": "desktop", "state": "hover" },
        "props": [],
        "custom_css": { "raw": "YmFja2dyb3VuZDogI2NmNWYyYjs=" }
      }
    ]
  }
}
```

**Key observations:**
- `custom_css` is base64-encoded raw CSS
- Empty `props` serializes as `[]` (empty array), not `{}`
- `state: null` = normal; `state: "hover"` = hover state
- Breakpoints: `"desktop"`, `"tablet"`, `"mobile"`, `"widescreen"`
- Class name pattern: `e-<elementId>-<7hex>`

### 1.5 Known Atomic Widget Types

**Content:** `e-heading`, `e-paragraph`, `e-button`, `e-image`, `e-divider`, `e-icon`, `e-icon-list`, `e-image-box`, `e-social-icons`, `e-accordion`, `e-svg`, `e-youtube`, `e-self-hosted-video`, `e-text`, `e-video`, `e-star-rating`, `e-progress`, `e-counter`, `e-alert`, `e-html`

**Form:** `e-form`, `e-form-label`, `e-form-input`, `e-form-textarea`, `e-form-select`, `e-form-checkbox`, `e-form-radio-button`, `e-form-date-picker`, `e-form-time-picker`, `e-form-file-upload`, `e-form-submit-button`, `e-form-message`, `e-form-steps`

**Layout:** `e-div-block`, `e-flexbox`, `e-tabs`, `e-tabs-menu`, `e-tab`, `e-tabs-content-area`, `e-tab-content`, `e-accordion`, `e-toggle`

**Classic Pro (flat settings):** `price-table`, `nav-menu`, `loop-grid`, `posts`, `login`, `reviews`, `rating`, `animated-headline`, `slides`, `media-carousel`, `portfolio`, `call-to-action`, `form` (legacy), `countdown`, `blockquote`, `testimonial`, `share-buttons`, `author-box`, `flip-box`, `hotspot`, `lottie`, `mega-menu`, `search-form`, `woocommerce-*`

### 1.6 Template System (Theme Builder)

Each Theme Builder template has display conditions stored in post meta (`_elementor_conditions`):

```json
[
  { "name": "include/general", "sub_name": "", "sub_id": "" },
  { "name": "include/archives", "sub_name": "category", "sub_id": "5" }
]
```

Condition format: `include/exclude` + `type/subtype` + optional `sub_id`.

### 1.7 Popup Builder

Popups use `type: "popup"` with triggers and timing in `page_settings`:

```json
{
  "page_settings": {
    "popup": {
      "triggers": [
        { "type": "page_load", "settings": { "delay": 0 } },
        { "type": "scrolling", "settings": { "offset": 25 } },
        { "type": "click", "settings": { "selector": ".my-trigger" } },
        { "type": "exit_intent", "settings": {} }
      ],
      "entrance_animation": "fadeIn",
      "exit_animation": "fadeOut",
      "timing": [
        { "type": "times", "settings": { "count": 1, "period": "session" } },
        { "type": "days", "settings": { "days": [] } }
      ]
    }
  }
}
```

**Trigger types:** `page_load`, `scrolling`, `scrolling_to_element`, `click`, `exit_intent`, `on_click`
**Timing rules:** `times`, `days`, `sessions`, `url`, `sources`, `logged_in`, `devices`

### 1.8 REST API Endpoints

Elementor registers 30+ REST API endpoints under `/elementor/v1/`:

**Core:**
- `GET /elementor/v1/global-colors` — Get global colors
- `POST /elementor/v1/global-colors` — Update global colors
- `GET /elementor/v1/global-typography` — Get global typography
- `GET/POST /elementor/v1/kit` — Site kit settings
- `GET/POST /elementor/v1/templates` — List/create templates
- `DELETE /elementor/v1/templates/{id}` — Delete template
- `POST /elementor/v1/templates/{id}/export` — Export template as JSON
- `POST /elementor/v1/templates/import` — Import template JSON
- `GET /elementor/v1/globals` — Global widgets
- `GET /elementor/v1/atomic-widgets/status` — Atomic widgets status
- `POST /elementor/v1/atomic-widgets/opt-in` — Toggle atomic widgets
- `GET /elementor/v1/atomic-widgets/prop-types` — List prop types
- `GET /elementor/v1/atomic-widgets/widgets` — List atomic widgets
- `POST /elementor/v1/atomic-widgets/validate` — Validate atomic data
- `GET /elementor/v1/experiments` — List experiments
- `GET/POST /elementor/v1/breakpoints` — Responsive breakpoints
- `GET /elementor/v1/system-info` — System info

**Pro (additional):**
- `GET/POST /elementor/v1/theme-builder/conditions` — Theme conditions
- `GET/POST /elementor/v1/popups` — Popup management
- `GET /elementor/v1/forms` — List forms
- `POST /elementor/v1/forms/{id}/submissions` — Form submissions
- `GET /elementor/v1/motion-effects` — Motion effect presets
- `GET/POST /elementor/v1/loop-grid` — Loop grid templates

### 1.9 WordPress Hooks/Filters

60+ documented hooks covering the full lifecycle. Key ones:

**Actions:** `elementor/init`, `elementor/widgets/widgets_registered`, `elementor/documents/register`, `elementor/frontend/after_enqueue_scripts`, `elementor/ajax/register_actions`, `elementor/theme/before_do_header`, `elementor/popup/before_render`

**Filters:** `elementor/document/config`, `elementor/frontend/builder_content`, `elementor/widgets/black_list`, `elementor/element/parse_css`, `elementor/theme/conditions`, `elementor/atomic-widgets/prop-types`, `elementor/interactions/register`, `elementor/dynamic_tags/register_tags`

---

## 2. MCP Server Design Best Practices

### 2.1 Transport: Stdio vs HTTP

**Current: StdioServerTransport** — correct choice for a local development tool.

| Aspect | Stdio | HTTP/SSE |
|--------|-------|----------|
| Configuration | Zero | Port, CORS, auth |
| Security | No network surface | Must validate origins/tokens |
| Remote access | No | Yes |
| Process model | Per-client | Shared |
| Streaming | No | Yes (SSE) |

**Recommendation:** Keep stdio as primary. Add optional HTTP/SSE for future remote scenarios.

### 2.2 Tool Definition Best Practices

**Current server does well:**
- `snake_case` naming (`list_widgets`, `build_page`, `generate_theme`)
- Verb-noun pattern (`list_*`, `get_*`, `build_*`, `generate_*`, `validate_*`)
- Detailed `.describe()` on every field
- `coerceObject()` pattern for handling JSON-string arguments
- Workflow-aware descriptions ("Run after intake", "Read this before building")

**Improvements needed:**
- Replace `z.any()` with structured `z.object()` schemas where feasible
- Add pagination to list operations
- Add `dryRun` option to build tools
- Add prompt templates for common workflows

### 2.3 Resources vs Tools

The server currently uses tools for everything. Resources could be added for static reference data (design playbook, widget catalog), but tools are more ergonomic for LLMs.

### 2.4 Error Handling

**Current patterns (good):**
- `ok()`/`fail()` helpers with `isError: true` flag
- Input validation at handler entry
- Actionable error messages ("Call list_widgets to see options")

**Improvements:**
- Add error codes/categories
- Return partial results on multi-page build failures
- Add try/catch around file writes

### 2.5 File Output

**Current approach (correct):** Write to disk, return full path in response. Configurable via `$ELEMENTOR_MCP_OUT` env var. SEO sidecar files and site manifest for multi-page builds.

**Recommended addition:** `dryRun` option that returns compiled JSON inline without writing.

---

## 3. Motion Effects & Animations

### 3.1 Critical Architecture Insight

Motion effects are stored as **flat settings** on the element's `settings` object, NOT in the `styles` system. The current compiler only handles styles — motion settings are a completely separate path.

**Two systems coexist:**
1. **Legacy Motion Effects (Pro)** — flat `motion_fx_*` keys, plain values, no $$type wrapping
2. **New Interactions System (v4 Atomic)** — structured `interactions` array with $$type wrapping

### 3.2 Entrance Animations (Free)

Stored as flat settings:

```json
{
  "_animation": "fadeInUp",
  "animation_duration": 1.0,
  "_animation_delay": 0,
  "_animation_offset": 0
}
```

**Available animations:** Fading (fadeIn, fadeInUp/Down/Left/Right), Zooming (zoomIn, zoomInDown/Left/Right/Up), Bouncing (bounceIn, bounceInDown/Left/Right/Up), Sliding (slideInDown/Left/Right/Up), Rotating (rotateIn, rotateInDownLeft/DownRight/UpLeft/UpRight), Attention Seekers (bounce, flash, pulse, rubberBand, shake, swing, tada, wobble, jello), Light Speed (lightSpeedIn), Specials (rollIn)

### 3.3 Hover Animations (Free)

```json
{ "_hover_animation": "grow" }
```

**Available:** grow, shrink, pulse, pulse-grow, pulse-shrink, push, pop, bounce-in, bounce-out, rotate, grow-rotate, float, sink, bob, hang, skew, skew-forward, skew-backward, wobble-vertical, wobble-horizontal, wobble-to-bottom-right, wobble-to-top-right, wobble-top, wobble-bottom, wobble-skew, buzz, buzz-out

### 3.4 Scroll Effects (Pro)

Master switch: `"motion_fx_motion_fx_scrolling": "yes"`

Six effects, each with consistent pattern:
- `motion_fx_{effect}_effect` — `"yes"` to enable
- `motion_fx_{effect}_direction` — Direction
- `motion_fx_{effect}_speed` — `{ unit: "px", size: number }` (1-10)
- `motion_fx_{effect}_affectedRange` — `{ unit: "%", sizes: { start: 0, end: 100 } }`

**Effects:** translateY (vertical), translateX (horizontal), opacity (transparency), blur, rotateZ, scale

### 3.5 Mouse Effects (Pro)

Master switch: `"motion_fx_motion_fx_mouse": "yes"`

**Mouse Track:** Element moves relative to cursor. Direction: `"opposite"` or `"direct"`. Speed: 1-10.
**Tilt:** Element tilts based on mouse position (3D perspective). Direction: `"alternate"`, `"direct"`, `"opposite"`. Speed: 1-10.

### 3.6 Sticky Positioning (Pro)

```json
{
  "sticky": "top",
  "sticky_on": ["desktop", "tablet"],
  "sticky_offset": 0,
  "sticky_parent": "body",
  "sticky_effects_offset": 0
}
```

### 3.7 Transform Controls (Free)

```json
{
  "_transform_rotateZ_effect": { "unit": "deg", "size": 45 },
  "_transform_scale_effect": { "unit": "px", "size": 1.2 },
  "_transform_skewX_effect": { "unit": "deg", "size": 0 },
  "_transform_translateX_effect": { "unit": "px", "size": 0 },
  "_transform_perspective_effect": { "unit": "px", "size": 0 }
}
```

### 3.8 New Interactions System (v4 Atomic)

Stored in the `interactions` array on each element node:

```json
{
  "interactions": [{
    "interaction_id": "int_001",
    "trigger": "scrollIn",
    "animation": {
      "effect": "fade",
      "type": "in",
      "direction": "",
      "timing_config": {
        "duration": { "$$type": "time-size", "value": { "unit": "ms", "size": 600 } },
        "delay": { "$$type": "time-size", "value": { "unit": "ms", "size": 0 } }
      },
      "config": {
        "easing": "easeIn",
        "relativeTo": "viewport",
        "repeat": "",
        "start": { "$$type": "size", "value": { "unit": "%", "size": 85 } },
        "end": { "$$type": "size", "value": { "unit": "%", "size": 15 } }
      }
    },
    "breakpoints": { "excluded": [] }
  }]
}
```

**Trigger types:** `load`, `scrollIn` (free); `scrollOut`, `scrollOn`, `hover`, `click` (Pro)
**Effect types:** `fade`, `slide`, `scale` (free); `custom` (Pro)
**Easing:** `easeIn` (free); `easeOut`, `easeInOut`, `backIn`, `backInOut`, `backOut`, `linear` (Pro)
**Repeat:** `loop`, `times`, `""` (no repeat)

### 3.9 Implementation Plan

**Phase 1:** Entrance & hover animations (flat settings, no $$type)
**Phase 2:** Transform controls (flat settings with `{unit, size}` objects)
**Phase 3:** Sticky positioning (flat settings)
**Phase 4:** Scroll & mouse effects (flat `motion_fx_*` settings)
**Phase 5:** New Interactions system (structured `interactions` array with $$type)

---

## 4. Modern Design Patterns

### 4.1 Glassmorphism (Frosted Glass)

```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(12px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.25);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

**Blueprint:** All via `custom_css` (the `css` escape hatch) since `backdrop-filter` has no native Elementor prop.

### 4.2 Neumorphism (Soft UI)

```css
background: #e0e5ec;
box-shadow: 9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff;
border-radius: 16px;
```

**Blueprint:** Dual `box-shadow` via `custom_css`. Matching background color required.

### 4.3 Gradient Meshes

```css
background:
  radial-gradient(ellipse at 20% 50%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
  radial-gradient(ellipse at 50% 80%, rgba(255, 107, 107, 0.2) 0%, transparent 50%),
  linear-gradient(135deg, #0f0c29, #302b63, #24243e);
```

**Blueprint:** Multi-layer `radial-gradient()` via `custom_css`.

### 4.4 Micro-interactions

```css
.button {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}
.button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
```

**Blueprint:** `hover` sub-object in style for hover state, `css` for transition on base state.

### 4.5 Scroll-Triggered Animations

Use Elementor's entrance animations (`_animation`) for scroll-triggered reveals. For more advanced effects, use the Interactions system.

### 4.6 3D Transforms

```css
.card {
  perspective: 1000px;
}
.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.card:hover .card-inner {
  transform: rotateY(180deg);
}
.card-front, .card-back {
  backface-visibility: hidden;
}
.card-back {
  transform: rotateY(180deg);
}
```

**Blueprint:** `custom_css` for perspective and 3D transforms. The Flip Box widget (Pro) handles this natively.

### 4.7 Modern Layout Patterns

- **Bento grids:** Asymmetric grid of cards with varying sizes. Use `flex` with `flex: 1 1 280px` and `gap`.
- **Full-bleed sections:** Section with `width: 100vw; margin-left: calc(-50vw + 50%)`.
- **Overlapping elements:** Negative margins or `position: relative` with `z-index`.
- **Asymmetric layouts:** Flexbox with `flex: 0 0 60%` and `flex: 0 0 35%` for split layouts.

### 4.8 Typography Trends

- **Fluid type:** `font-size: clamp(1.5rem, 4vw, 3.5rem)` via `custom_css`
- **Gradient text:** `background: linear-gradient(...); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
- **Large hero text:** 4-6rem on desktop, clamped for mobile

### 4.9 CSS Properties: Native vs custom_css

| Property | Native Prop | custom_css | Notes |
|----------|-------------|------------|-------|
| font-size | ✅ size | — | Native |
| color | ✅ color | — | Native |
| padding | ✅ dimensions | — | Native (logical) |
| border-radius | ✅ border-radius | — | Native (logical) |
| gap | ✅ size | — | Native |
| width/max-width | ✅ size | — | Native |
| display | ✅ string | — | Native |
| flex-direction | ✅ layout-direction | — | Native |
| background | ❌ | ✅ | No native bg prop type in compiler |
| box-shadow | ❌ | ✅ | No native shadow prop type |
| border | ❌ | ✅ | No native border prop type |
| margin | ❌ | ✅ | No native margin prop type |
| line-height | ❌ | ✅ | No native line-height prop type |
| letter-spacing | ❌ | ✅ | No native letter-spacing prop type |
| opacity | ❌ | ✅ | No native opacity prop type |
| backdrop-filter | ❌ | ✅ | No native support |
| transform | ❌ | ✅ | Flat settings path needed |
| background-clip | ❌ | ✅ | For gradient text |

---

## 5. Interaction System

### 5.1 Legacy Hover Effects

Two mechanisms:
1. **CSS hover animations** (`_hover_animation: "grow"`) — pure CSS, uses `e-animation-*` classes
2. **Style system hover states** — `state: "hover"` in style variants for color/background/border changes

### 5.2 Click Interactions (Pro, v4 Atomic)

Only available in the new Interactions system:

```json
{
  "interaction_id": "click_001",
  "trigger": "click",
  "animation": {
    "effect": "slide",
    "type": "in",
    "direction": "top",
    "timing_config": {
      "duration": { "$$type": "time-size", "value": { "unit": "ms", "size": 300 } },
      "delay": { "$$type": "time-size", "value": { "unit": "ms", "size": 0 } }
    },
    "config": { "easing": "easeOut", "repeat": "" }
  }
}
```

### 5.3 Conditional Display Logic

```json
{
  "_conditions": [
    { "type": "include", "name": "user_roles", "sub": "administrator" },
    { "type": "exclude", "name": "post_type", "sub": "post" }
  ]
}
```

### 5.4 Dynamic Content Binding

```json
{
  "__dynamic__": {
    "title": "{{ elementor-dynamic-tag name=\"post-title\" }}"
  }
}
```

### 5.5 MCP Tool Schema for Interactions

Recommended blueprint extension:

```typescript
motion?: {
  entranceAnimation?: string;
  entranceDuration?: number;
  entranceDelay?: number;
  entranceOffset?: number;
  hoverAnimation?: string;
  scrollEffects?: { enabled: boolean; verticalScroll?: {...}; ... };
  mouseEffects?: { enabled: boolean; mouseTrack?: {...}; tilt?: {...} };
  sticky?: { position: "top"|"bottom"; on: string[]; offset?: number };
  transform?: { rotate?: {...}; scale?: {...}; skew?: {...}; translate?: {...} };
  interactions?: InteractionItem[];
}
```

---

## 6. Competitor Analysis

### 6.1 WordPress MCP Server Landscape

| Server | Stars | Approach | Key Features |
|--------|-------|----------|-------------|
| **msrbuilds/elementor-mcp (OURS)** | 477 | Plugin + TS compiler | 39 widget types, blueprint compilation, schema learning, theme generation |
| **use-novamira/novamira** | 473 | PHP plugin | Full WP access via PHP execution |
| **deus-h/claudeus-wp-mcp** | 154 | Node.js REST wrapper | 145 tools, FSE, WooCommerce |
| **AgriciDaniel/wp-mcp-ultimate** | 111 | PHP plugin | 58 WP abilities |
| **aguaitech/Elementor-MCP** | 66 | Node.js | Simple Elementor MCP, abandoned |
| **@respira/wordpress-mcp-server** | ~1k npm | SaaS | 200+ tools, 16 builders, Elementor v4 partial (20 types) |

### 6.2 Our Unique Advantages

1. **Blueprint-to-Elementor-v4-JSON compilation** — no competitor does this
2. **Self-improving schema learning** (`learn_from_export`) — unique
3. **Theme generation with WCAG checking** — unique
4. **Multi-page site generation** with shared theme/header/footer — unique
5. **39 widget types** with full $$type envelope support (Respira has 20)
6. **Offline compilation** — no WordPress instance needed

### 6.3 Competitor Advantages

- **Respira:** Live site editing, 16 builders, WooCommerce, Playbooks, CPT creation, in-WP MCP endpoint, listed in MCP registry
- **Claudeus:** More total tools (145), WooCommerce, FSE support
- **Novamira:** Raw PHP execution (maximum flexibility)

### 6.4 Key Gap in the Ecosystem

**No existing tool** can programmatically generate Elementor v4 Atomic Widgets JSON for import. Elementor has no official REST API (developer page is a 404). WP-CLI Elementor commands are minimal and abandoned. Our server fills a unique niche.

### 6.5 Pricing Landscape

- **Respira:** Commercial SaaS (7-day free trial, then paid)
- **Claudeus:** Open source (MIT)
- **WP-MCP-Ultimate:** Open source (GPL)
- **10Web:** $10-23/mo all-inclusive (closed platform)
- **Our project:** Currently open source, no pricing model

### 6.6 MCP Registry Opportunity

Only 1 WordPress MCP server is listed (Respira). Listing ours would give immediate visibility and credibility.

---

## 7. Gap Analysis & Recommendations

### 7.1 Current Gaps in the MCP Server

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| 1 | **No motion effects** — `motion_fx_*` settings not emitted | Blocks scroll/mouse animations | Medium |
| 2 | **No interactions** — `interactions: []` always empty | Blocks v4 Interactions system | Medium |
| 3 | **No popup type** — `type: "popup"` not handled | Blocks popup builder support | Low |
| 4 | **No Theme Builder conditions** | Blocks header/footer/single/archive templates | Low |
| 5 | **Limited native props** — only 12 of 50+ possible | Forces more custom_css than needed | Medium |
| 6 | **No `page_settings` support** — always `[]` | Blocks popup triggers, timing rules | Low |
| 7 | **No global widget support** | Blocks synced widgets | Low |
| 8 | **No dynamic tags** — no `__dynamic__` settings | Blocks dynamic content in templates | Low |
| 9 | **No CSS transforms** — `_transform_*` not handled | Blocks 3D effects | Low |
| 10 | **No background prop types** | Forces custom_css for backgrounds | Medium |
| 11 | **No `e-html` widget** | Blocks custom HTML/JS embeds | Low |
| 12 | **No `@keyframes` injection** | Blocks animated gradients, skeleton loading | Low |
| 13 | **No CSS custom properties** | Blocks dark mode, theme token injection | Low |

### 7.2 Recommended Priority Order

**Phase 1 (Immediate — high impact, low effort):**
1. Entrance & hover animations (flat settings)
2. Transform controls (flat settings)
3. Sticky positioning (flat settings)
4. `e-html` widget type
5. Template type support (header/footer/single/archive)

**Phase 2 (Short-term — high impact, medium effort):**
6. Scroll effects (flat `motion_fx_*` settings)
7. Mouse effects (flat `motion_fx_*` settings)
8. Additional native props (background, box-shadow, margin, line-height, opacity)
9. Popup type with `page_settings`

**Phase 3 (Medium-term — medium impact, higher effort):**
10. New Interactions system (structured `interactions` array)
11. Dynamic tags (`__dynamic__` settings)
12. Theme Builder conditions
13. CSS custom properties for dark mode

**Phase 4 (Long-term — lower impact, variable effort):**
14. Global widget support
15. `@keyframes` injection
16. Background prop types (background, background-overlay, etc.)
17. HTTP transport option
18. MCP registry listing

### 7.3 Architecture Recommendations

1. **Add a `motion` field to `BlueprintNode`** — accepts all motion/transform/interaction parameters in the friendly blueprint format
2. **Add `time-size` primitive type** — for interaction duration/delay with `$$type` wrapping
3. **Add `settings` passthrough** — allow flat settings to be passed through the blueprint format for motion effects
4. **Add prompt templates** — encode the intake→theme→build→SEO workflow
5. **Add pagination** — to `list_widgets` and `list_templates`
6. **Add `dryRun` option** — to `build_page` and `build_site`
7. **List in MCP registry** — for visibility and credibility

---

## Source Documents

This report was compiled from the following research documents created during this task:

- `RESEARCH.md` — Elementor architecture deep dive (26.7 KB)
- `MOTION_EFFECTS_RESEARCH.md` — Motion effects & interactions (30.9 KB)
- `MCP_BEST_PRACTICES_RESEARCH.md` — MCP server design (19.8 KB)
- `MODERN_DESIGN_TRENDS_RESEARCH.md` — Design patterns (46.9 KB)
- `competitor-research.md` — Competitor analysis (11.4 KB)
- `elementor-widget-gap-analysis.md` — Widget coverage analysis (19.6 KB)
