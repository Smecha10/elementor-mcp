# Elementor Page Builder Architecture — Deep Research

## 1. Page Data Storage (JSON Structure & v4 Atomic Widgets Format)

### Top-Level Document Structure

An Elementor export (version 0.4, the "Atomic Widgets" format) is a JSON object with these top-level keys:

```json
{
  "content": [ /* ElementNode[] */ ],
  "page_settings": [],
  "version": "0.4",
  "title": "Page Title",
  "type": "page"
}
```

**`type` field values** (document types):
- `"page"` — standard page
- `"header"` — Theme Builder header
- `"footer"` — Theme Builder footer
- `"single"` — Theme Builder single post template
- `"archive"` — Theme Builder archive template
- `"popup"` — Popup Builder
- `"product"` — WooCommerce product template
- `"section"` — saved section
- `"kit"` — site kit

### ElementNode Structure (v4 Atomic)

Every element in the `content` array (and recursively in `elements`) follows this shape:

```json
{
  "id": "218762da",                    // 8-hex-char unique ID
  "settings": { /* typed settings */ },
  "elements": [ /* child ElementNode[] */ ],
  "isInner": false,
  "elType": "widget",                  // or "e-div-block", "e-flexbox", "e-form", "container"
  "widgetType": "e-heading",           // only when elType === "widget"
  "styles": { /* style objects keyed by class name */ },
  "interactions": [],                  // interaction sequences
  "editor_settings": { "title": "Heading" },
  "version": "0.0"
}
```

**Three element categories:**

1. **Atomic widgets** (`elType: "widget"`, `widgetType: "e-*"`) — carry `styles`, `interactions`, `editor_settings`, `version`. These are the new v4 format.
2. **Structural/layout elements** (`elType: "e-div-block"`, `"e-flexbox"`, `"e-form"`, `"e-tabs"`, etc.) — no `widgetType`, but carry `styles`/`interactions`/`version`.
3. **Classic Pro widgets** (`elType: "widget"`, `widgetType: "price-table"`, `"nav-menu"`, etc.) — minimal wrapper, NO `styles`/`interactions`/`editor_settings`/`version` fields. Flat settings (no $$type wrapping).
4. **Legacy containers** (`elType: "container"`) — used to host classic Pro widgets in the Flexbox Container layout.

### The $$type Typed Value System

Every setting value in atomic widgets is wrapped as `{ "$$type": "<type>", "value": <actual> }`. This is the core of the v4 format. Known $$type values from the Elementor source:

| $$type | Value shape | Used for |
|--------|-------------|----------|
| `"string"` | plain string | tag, text content, form-name, etc. |
| `"number"` | number | default-active-tab, etc. |
| `"boolean"` | boolean | required, isTargetBlank |
| `"url"` | string (URL) | link destination, image URL |
| `"size"` | `{ unit: string, size: number }` | font-size, gap, width, max-width |
| `"dimensions"` | `{ block-start: size, inline-end: size, block-end: size, inline-start: size }` | padding |
| `"color"` | CSS color string | text color, background color |
| `"border-radius"` | `{ start-start: size, start-end: size, end-start: size, end-end: size }` | border radius (logical properties) |
| `"border-width"` | same shape as border-radius | border width |
| `"classes"` | `string[]` | CSS class list |
| `"html-v3"` | `{ content: string, children: [] }` | rich text (headings, paragraphs, button labels) |
| `"html-v2"` | similar to v3 | legacy rich text |
| `"html"` | plain string | legacy rich text |
| `"image"` | `{ src: image-src, size: string, alt?: string }` | image widget |
| `"image-src"` | `{ id: null\|number, url: url }` | image source reference |
| `"link"` | `{ destination: url, isTargetBlank: boolean, tag?: string }` | hyperlinks |
| `"svg-src"` | `{ id: null, url: url }` | SVG/icon source |
| `"video-src"` | `{ id: null, url: url }` | self-hosted video |
| `"email"` | `{ to: string, subject?: string }` | form email action |
| `"string-array"` | `string[]` (wrapped) | actions-after-submit |
| `"key-value"` | `{ key: string, value: string }` | select options |
| `"options"` | `key-value[]` | select options list |
| `"image-attachment-id"` | number | media library image ID |
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
| `"query-array"` | array | multiple queries |
| `"query-filter"` | structured object | query filter |
| `"date-string"` | string | date value |
| `"date-range"` | structured object | date range |
| `"date-time"` | structured object | date+time |
| `"number-range"` | structured object | number range |
| `"selection-size"` | structured object | selection size |
| `"shadow"` | structured object | box/text shadow |
| `"color-stop"` | structured object | gradient color stop |
| `"gradient-color-stop"` | structured object | gradient color stop |
| `"attributes"` | structured object | HTML attributes |
| `"background-image-position-offset"` | structured object | bg position offset |
| `"background-image-overlay-size-scale"` | structured object | bg size scale |

### Style Object Structure

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
- When `props` is empty, Elementor serializes it as `[]` (empty array), not `{}`
- `state: null` means normal/default state; `state: "hover"` is the hover state
- Breakpoints: `"desktop"`, `"tablet"`, `"mobile"`, `"widescreen"`
- The class name pattern is `e-<elementId>-<7hex>`

### Known Atomic Widget Types (widgetType values)

From the Elementor source code and exports:

**Content widgets:** `e-heading`, `e-paragraph`, `e-button`, `e-image`, `e-divider`, `e-icon`, `e-icon-list`, `e-image-box`, `e-social-icons`, `e-accordion`, `e-svg`, `e-youtube`, `e-self-hosted-video`, `e-text`, `e-video`, `e-star-rating`, `e-progress`, `e-counter`, `e-alert`, `e-html`

**Form widgets:** `e-form`, `e-form-label`, `e-form-input`, `e-form-textarea`, `e-form-select`, `e-form-checkbox`, `e-form-radio-button`, `e-form-date-picker`, `e-form-time-picker`, `e-form-file-upload`, `e-form-submit-button`, `e-form-message`, `e-form-steps`

**Layout widgets:** `e-div-block`, `e-flexbox`, `e-tabs`, `e-tabs-menu`, `e-tab`, `e-tabs-content-area`, `e-tab-content`, `e-accordion`, `e-toggle`

**Classic Pro widgets (flat settings, no styles):** `price-table`, `nav-menu`, `loop-grid`, `posts`, `login`, `reviews`, `rating`, `animated-headline`, `slides`, `media-carousel`, `portfolio`, `call-to-action`, `form` (legacy), `countdown`, `blockquote`, `testimonial`, `share-buttons`, `author-box`, `flip-box`, `hotspot`, `lottie`, `mega-menu`, `search-form`, `woocommerce-*`

---

## 2. Widget System

### Widget Registration (PHP)

Widgets are registered via the `Elementor\Widgets_Manager` class. Each widget extends `\Elementor\Widget_Base` and defines:

```php
class Widget_Heading extends \Elementor\Widget_Base {
  public function get_name() { return 'heading'; }        // widgetType
  public function get_title() { return 'Heading'; }
  public function get_icon() { return 'eicon-t-letter'; }
  public function get_categories() { return ['basic']; }

  protected function register_controls() {
    // Content controls
    $this->start_controls_section('section_title', [
      'label' => 'Title',
    ]);
    $this->add_control('title', [
      'label' => 'Title',
      'type' => \Elementor\Controls_Manager::TEXTAREA,
    ]);
    $this->end_controls_section();

    // Style controls
    $this->start_controls_section('section_title_style', [
      'label' => 'Title',
      'tab' => \Elementor\Controls_Manager::TAB_STYLE,
    ]);
    // ...
  }
}
```

For **atomic widgets**, the registration is different — they use the `modules/atomic-widgets/` module and define prop types instead of controls:

```php
class Atomic_Heading extends \Elementor\Modules\AtomicWidgets\Widgets\Atomic_Widget_Base {
  // Uses prop-types system instead of controls
  protected $prop_types = [
    'tag' => 'string',
    'title' => 'html-v3',
  ];
}
```

### Settings Schema

**Atomic widgets** use the $$type system for all settings. The settings object contains only the widget's content props (e.g., `tag`, `title` for heading). Styling is handled entirely through the `styles` → `variants` system, not in settings.

**Classic Pro widgets** use flat settings (plain values, no $$type wrapping). Example for `price-table`:

```json
{
  "heading": "Plan",
  "sub_heading": "",
  "price": "0",
  "period": "Monthly",
  "features_list": [
    { "_id": "abc1234", "item_text": "Feature 1" },
    { "_id": "def5678", "item_text": "Feature 2" }
  ],
  "button_text": "Get Started",
  "ribbon_title": "Popular"
}
```

Each item in a list must have a unique `_id` (7 hex chars).

---

## 3. Template System (Theme Builder)

### Document Types

Elementor's Theme Builder defines these document types in `core/document-types/`:

| Class | type value | Purpose |
|-------|-----------|---------|
| `Page` | `page` | Standard page |
| `Post` | `post` | Single post |
| `PageBase` | (abstract) | Base for page-like documents |

The Theme Builder (Elementor Pro) adds:
- `header` — Site header template
- `footer` — Site footer template
- `single` — Single post/page template (with conditions)
- `archive` — Archive/category/tag template
- `product` — WooCommerce single product template
- `product-archive` — WooCommerce shop/archive template
- `error-404` — 404 page template
- `landing-page` — Landing page (from the landing-pages module)
- `popup` — Popup (from the popup module)

### Template Conditions

Each Theme Builder template has display conditions stored in post meta (`_elementor_conditions`):

```json
[
  {
    "name": "include/general",
    "sub_name": "",
    "sub_id": ""
  },
  {
    "name": "include/archives",
    "sub_name": "category",
    "sub_id": "5"
  }
]
```

Condition format: `include/exclude` + `type/subtype` + optional `sub_id`.

### How Template Type Affects Document Structure

The `type` field in the compiled document determines how Elementor renders it:
- `"page"` — rendered as a standalone page
- `"header"` — rendered in `<header>` position across the site
- `"footer"` — rendered in `<footer>` position
- `"single"` — rendered as the single post template
- `"archive"` — rendered as the archive template
- `"popup"` — rendered as a popup with its own trigger/display rules

The document structure (content array) is the same regardless of type — only the `type` field and `page_settings` differ.

---

## 4. Popup Builder

The Popup Builder (Elementor Pro) creates documents with `type: "popup"`. Popups have additional settings stored in `page_settings`:

```json
{
  "content": [ /* popup content */ ],
  "page_settings": {
    "popup": {
      "triggers": [
        { "type": "page_load", "settings": { "delay": 0 } },
        { "type": "scrolling", "settings": { "offset": 25 } },
        { "type": "click", "settings": { "selector": ".my-trigger" } },
        { "type": "exit_intent", "settings": {} },
        { "type": "on_click", "settings": {} }
      ],
      "show_after_close": true,
      "close_button_delay": 0,
      "prevent_close_on_background_click": false,
      "prevent_close_on_esc_key": false,
      "avoid_multiple_popups": false,
      "entrance_animation": "fadeIn",
      "exit_animation": "fadeOut",
      "entrance_animation_duration": "1.2",
      "timing": [
        { "type": "times", "settings": { "count": 1, "period": "session" } },
        { "type": "days", "settings": { "days": [] } },
        { "type": "sessions", "settings": {} }
      ]
    }
  },
  "version": "0.4",
  "title": "Newsletter Popup",
  "type": "popup"
}
```

**Trigger types:** `page_load`, `scrolling`, `scrolling_to_element`, `click`, `exit_intent`, `on_click`

**Timing rules:** `times` (frequency), `days` (day of week), `sessions` (per session), `url` (URL match), `sources` (post type), `logged_in`, `devices`

---

## 5. REST API Endpoints

Elementor registers WordPress REST API routes. Key endpoints from `core/wp-api.php` and `modules/wp-rest/`:

### Elementor Core REST API

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/elementor/v1/global-colors` | Get global colors |
| POST | `/elementor/v1/global-colors` | Update global colors |
| GET | `/elementor/v1/global-typography` | Get global typography |
| POST | `/elementor/v1/global-typography` | Update global typography |
| GET | `/elementor/v1/kit` | Get site kit settings |
| POST | `/elementor/v1/kit` | Update site kit |
| GET | `/elementor/v1/kit/settings` | Get kit settings |
| POST | `/elementor/v1/kit/settings` | Update kit settings |
| GET | `/elementor/v1/templates` | List saved templates |
| POST | `/elementor/v1/templates` | Create template |
| DELETE | `/elementor/v1/templates/{id}` | Delete template |
| GET | `/elementor/v1/templates/{id}` | Get template data |
| POST | `/elementor/v1/templates/{id}/export` | Export template as JSON |
| POST | `/elementor/v1/templates/import` | Import template JSON |
| GET | `/elementor/v1/globals` | Get global widgets |
| POST | `/elementor/v1/globals` | Save global widget |
| DELETE | `/elementor/v1/globals/{id}` | Delete global widget |
| GET | `/elementor/v1/disconnected` | Check if site is disconnected |
| GET | `/elementor/v1/atomic-widgets/status` | Check atomic widgets status |
| POST | `/elementor/v1/atomic-widgets/opt-in` | Opt in/out of atomic widgets |
| GET | `/elementor/v1/atomic-widgets/prop-types` | List available prop types |
| GET | `/elementor/v1/atomic-widgets/widgets` | List atomic widgets |
| GET | `/elementor/v1/atomic-widgets/widgets/{type}` | Get widget schema |
| POST | `/elementor/v1/atomic-widgets/validate` | Validate atomic widget data |
| GET | `/elementor/v1/experiments` | List experiments/features |
| POST | `/elementor/v1/experiments/{id}` | Toggle experiment |
| GET | `/elementor/v1/breakpoints` | Get responsive breakpoints |
| POST | `/elementor/v1/breakpoints` | Update breakpoints |
| GET | `/elementor/v1/notes` | Get notes (Elementor Notes feature) |
| POST | `/elementor/v1/notes` | Create note |
| GET | `/elementor/v1/user/{id}` | Get user capabilities |
| POST | `/elementor/v1/user/{id}/capabilities` | Update user capabilities |
| GET | `/elementor/v1/role-manager` | Get role manager settings |
| POST | `/elementor/v1/role-manager` | Update role manager |
| GET | `/elementor/v1/usage` | Get usage data |
| GET | `/elementor/v1/system-info` | Get system info |
| GET | `/elementor/v1/maintenance-mode` | Get maintenance mode status |
| POST | `/elementor/v1/maintenance-mode` | Set maintenance mode |

### Elementor Pro REST API (additional)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/elementor/v1/theme-builder/conditions` | List theme conditions |
| POST | `/elementor/v1/theme-builder/conditions` | Save conditions |
| GET | `/elementor/v1/theme-builder/templates` | List theme templates |
| POST | `/elementor/v1/theme-builder/templates` | Create theme template |
| GET | `/elementor/v1/popups` | List popups |
| POST | `/elementor/v1/popups` | Create popup |
| GET | `/elementor/v1/popups/{id}` | Get popup settings |
| POST | `/elementor/v1/popups/{id}/settings` | Update popup settings |
| GET | `/elementor/v1/forms` | List forms |
| POST | `/elementor/v1/forms/{id}/submissions` | Get form submissions |
| GET | `/elementor/v1/motion-effects` | Get motion effect presets |
| GET | `/elementor/v1/loop-grid` | List loop grid templates |
| POST | `/elementor/v1/loop-grid` | Create loop grid template |

### WordPress Core REST API (used by Elementor)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/wp/v2/posts` | List posts (for dynamic content) |
| GET | `/wp/v2/pages` | List pages |
| GET | `/wp/v2/media` | List media library items |
| POST | `/wp/v2/media` | Upload media |
| GET | `/wp/v2/categories` | List categories |
| GET | `/wp/v2/tags` | List tags |
| GET | `/wp/v2/users` | List users |
| GET | `/wp/v2/types` | List post types |
| GET | `/wp/v2/statuses` | List post statuses |
| GET | `/wp/v2/taxonomies` | List taxonomies |
| GET | `/wp/v2/menus` | List menus (if Jetpack or custom) |
| GET | `/wp/v2/menu-items` | List menu items |

---

## 6. WordPress Hooks/Filters for Extensibility

### Key Action Hooks

```php
// Elementor lifecycle
do_action('elementor/init');                          // Plugin fully loaded
do_action('elementor/widgets/widgets_registered');     // After widget registration
do_action('elementor/controls/controls_registered');  // After control registration
do_action('elementor/editor/after_enqueue_scripts');  // Editor JS loaded
do_action('elementor/editor/after_enqueue_styles');   // Editor CSS loaded
do_action('elementor/frontend/after_enqueue_scripts');// Frontend JS loaded
do_action('elementor/frontend/after_enqueue_styles'); // Frontend CSS loaded
do_action('elementor/preview/enqueue_styles');        // Preview iframe loaded
do_action('elementor/documents/register');            // Document types registered
do_action('elementor/ajax/register_actions');          // AJAX actions registered
do_action('elementor/import-export/export');          // Before export
do_action('elementor/import-export/import');          // After import

// Template library
do_action('elementor/template-library/after_save_template');
do_action('elementor/template-library/after_update_template');
do_action('elementor/template-library/after_delete_template');
do_action('elementor/template-library/after_import_template');

// Theme Builder (Pro)
do_action('elementor/theme/before_do_header');
do_action('elementor/theme/after_do_header');
do_action('elementor/theme/before_do_footer');
do_action('elementor/theme/after_do_footer');
do_action('elementor/theme/before_do_single');
do_action('elementor/theme/after_do_single');
do_action('elementor/theme/before_do_archive');
do_action('elementor/theme/after_do_archive');

// Popup (Pro)
do_action('elementor/popup/before_render');
do_action('elementor/popup/after_render');
```

### Key Filter Hooks

```php
// Document / content
apply_filters('elementor/document/config', $config, $post_id);
apply_filters('elementor/document/settings', $settings, $post_id);
apply_filters('elementor/frontend/builder_content', $content, $post_id);
apply_filters('elementor/frontend/the_content', $content);
apply_filters('elementor/frontend/section/should_render', $should_render, $section);
apply_filters('elementor/frontend/widget/should_render', $should_render, $widget);
apply_filters('elementor/element/get_edit_settings', $settings, $element);

// Widget system
apply_filters('elementor/widgets/black_list', $black_list);  // Disable widgets
apply_filters('elementor/widget/register_controls', $widget);
apply_filters('elementor/widget/render_content', $content, $widget);
apply_filters('elementor/widget/print_template', $template, $widget);
apply_filters('elementor/widget/render_template', $template, $widget);

// Controls
apply_filters('elementor/control/get_value', $value, $control);
apply_filters('elementor/control/get_initial_value', $value, $control);
apply_filters('elementor/controls/get_available_controls', $controls);
apply_filters('elementor/controls/get_control_types', $control_types);

// Styles / CSS
apply_filters('elementor/element/parse_css', $css, $element);
apply_filters('elementor/css-file/post/parse', $post_css);
apply_filters('elementor/css-file/global/parse', $global_css);
apply_filters('elementor/frontend/print_responsive_custom_css', $css, $post_id);
apply_filters('elementor/frontend/enqueue_styles', $styles);
apply_filters('elementor/frontend/enqueue_scripts', $scripts);

// Editor
apply_filters('elementor/editor/localize_settings', $settings);
apply_filters('elementor/editor/editor_assets', $assets);
apply_filters('elementor/editor/preview_assets', $assets);
apply_filters('elementor/editor/templates', $templates);

// Template library
apply_filters('elementor/template-library/get_templates', $templates, $source);
apply_filters('elementor/template-library/get_template', $template_data, $template_id);
apply_filters('elementor/template-library/is_template_active', $is_active, $template_id);
apply_filters('elementor/template-library/sources', $sources);

// Theme Builder (Pro)
apply_filters('elementor/theme/conditions', $conditions, $post_id);
apply_filters('elementor/theme/get_location_templates', $templates, $location);
apply_filters('elementor/theme/dynamic_tags/register_tags', $tags);
apply_filters('elementor_pro/theme_builder/conditions/register_condition', $condition);

// Popup (Pro)
apply_filters('elementor/popup/display_settings', $settings, $popup_id);
apply_filters('elementor/popup/triggers', $triggers);
apply_filters('elementor/popup/timing', $timing);

// Dynamic tags
apply_filters('elementor/dynamic_tags/register_tags', $dynamic_tags);
apply_filters('elementor/dynamic_tags/get_value', $value, $tag);

// Import / Export
apply_filters('elementor/export/kit_data', $data);
apply_filters('elementor/import/site_settings', $settings);
apply_filters('elementor/import/post_meta', $meta, $post_id);
apply_filters('elementor/import/content', $content);

// Atomic widgets
apply_filters('elementor/atomic-widgets/prop-types', $prop_types);
apply_filters('elementor/atomic-widgets/widgets', $widgets);
apply_filters('elementor/atomic-widgets/validate', $is_valid, $data);
apply_filters('elementor/atomic-widgets/schema', $schema, $widget_type);

// Interactions
apply_filters('elementor/interactions/register', $interactions);
apply_filters('elementor/interactions/validate', $is_valid, $interaction_data);
```

---

## 7. Motion Effects & Interactions

### Motion Effects Storage

Motion effects are stored in the element's `settings` object (not in styles). Key settings:

```json
{
  "motion_fx_motion_fx_scrolling": "yes",
  "motion_fx_translateY_effect": "yes",
  "motion_fx_translateY_direction": "alternate",
  "motion_fx_translateY_speed": { "unit": "px", "size": 4 },
  "motion_fx_translateY_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } },
  "motion_fx_motion_fx_mouse": "yes",
  "motion_fx_mouseTrack_effect": "yes",
  "motion_fx_mouseTrack_direction": "opposite",
  "motion_fx_tilt_effect": "yes",
  "motion_fx_tilt_direction": "alternate",
  "motion_fx_tilt_speed": { "unit": "px", "size": 4 },
  "motion_fx_blur_effect": "yes",
  "motion_fx_blur_level": { "unit": "px", "size": 7 },
  "motion_fx_opacity_effect": "yes",
  "motion_fx_opacity_level": { "unit": "px", "size": 10 },
  "motion_fx_rotateZ_effect": "yes",
  "motion_fx_rotateZ_speed": { "unit": "px", "size": 3 },
  "motion_fx_scale_effect": "yes",
  "motion_fx_scale_speed": { "unit": "px", "size": 4 }
}
```

### Interactions System

Interactions are stored in the `interactions` array on each element node. From the `modules/interactions/` source:

```json
{
  "interactions": [
    {
      "id": "interaction-1",
      "trigger": "scroll",
      "actions": [
        {
          "id": "action-1",
          "type": "transform",
          "settings": {
            "transform": {
              "translateX": { "unit": "px", "size": 100 },
              "translateY": { "unit": "px", "size": 0 },
              "rotate": { "unit": "deg", "size": 45 },
              "scale": { "unit": "px", "size": 1.2 }
            },
            "duration": { "unit": "ms", "size": 500 },
            "easing": "ease-out",
            "delay": { "unit": "ms", "size": 0 }
          }
        }
      ],
      "settings": {
        "viewport": {
          "start": "0%",
          "end": "100%",
          "unit": "%"
        }
      }
    }
  ]
}
```

**Trigger types:** `scroll`, `mouse`, `click`, `hover`, `keypress`, `media-query`

**Action types:** `transform` (translate/rotate/scale), `opacity`, `blur`, `color`, `background`, `class-toggle`, `attribute`, `css-custom-property`

---

## 8. Gaps in the Current MCP Server

Based on this research, the existing MCP server at `/home/smecham2000/ai-control-tower/projects/elementor_mcp/` has these gaps:

1. **No motion effects support** — motion_fx_* settings are not emitted
2. **No interactions support** — the `interactions: []` field is always empty
3. **No popup type** — `type: "popup"` with popup-specific `page_settings` is not handled
4. **No Theme Builder conditions** — no way to set display conditions for header/footer/single/archive templates
5. **Limited native props** — only `font-size`, `gap`, `width`, `max-width`, `display`, `flex-direction`, `flex-wrap`, `text-align`, `font-weight`, `padding`, `color`, `border-radius` are emitted as native typed props. Many more could be native (e.g., `background-color`, `border-width`, `box-shadow`, `margin`, `line-height`, `letter-spacing`, `text-transform`, `opacity`, `height`, `min-height`, `flex`, `align-self`, `order`)
6. **No `page_settings` support** — the field is always `[]`
7. **No global widget support** — the `globals` field on elements
8. **No dynamic tags** — no `__dynamic__` settings
9. **No CSS transforms** — `transform`, `rotate`, `scale`, `translate` not handled
10. **No background prop types** — background is always custom_css, but Elementor has native `background`, `background-overlay`, `background-color-overlay`, `background-gradient-overlay`, `background-image-overlay` prop types
