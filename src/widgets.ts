/**
 * Catalog of blueprint node types ("friendly" widgets) the compiler understands,
 * with the atomic Elementor widget each maps to. Drives both compilation dispatch
 * and the list_widgets / get_widget_schema MCP tools.
 */

export interface WidgetInfo {
  type: string;
  maps_to: string;
  category: string;
  description: string;
  fields: string[];
  aliases?: string[];
}

export const WIDGETS: WidgetInfo[] = [
  // ---- layout ----
  {
    type: "section",
    maps_to: "e-div-block",
    category: "layout",
    description: "Block-level container for a page section. Default tag <div>. Put a flex/grid inside to lay out content.",
    fields: ["tag", "style", "children", "motion"],
    aliases: ["div", "block"],
  },
  {
    type: "flex",
    maps_to: "e-flexbox",
    category: "layout",
    description: "Flexbox container. Use `direction` row/column; controls gap, alignment, wrapping. The primary layout tool.",
    fields: ["direction", "style", "children", "motion"],
    aliases: ["row", "column", "stack"],
  },
  {
    type: "spacer",
    maps_to: "e-div-block",
    category: "layout",
    description: "Empty vertical space. Set `height`.",
    fields: ["height"],
  },
  // ---- content ----
  {
    type: "heading",
    maps_to: "e-heading",
    category: "content",
    description: "Heading text. `level` 1-6 sets the tag (default h2).",
    fields: ["text", "level", "tag", "style", "motion"],
  },
  {
    type: "text",
    maps_to: "e-paragraph",
    category: "content",
    description: "Paragraph / body text.",
    fields: ["text", "tag", "style", "motion"],
    aliases: ["paragraph"],
  },
  {
    type: "button",
    maps_to: "e-button",
    category: "content",
    description: "Call-to-action button. `text` label, `href` link, `targetBlank` to open in new tab.",
    fields: ["text", "href", "targetBlank", "style", "motion"],
  },
  {
    type: "image",
    maps_to: "e-image",
    category: "media",
    description: "Image from a URL. `src` required; `alt` is alt text (accessibility + SEO); `size` is the registered size name (default large).",
    fields: ["src", "alt", "size", "style", "motion"],
  },
  {
    type: "svg",
    maps_to: "e-svg",
    category: "media",
    description: "SVG icon. `src` is the URL of an uploaded .svg file.",
    fields: ["src", "style"],
    aliases: ["icon"],
  },
  {
    type: "divider",
    maps_to: "e-divider",
    category: "content",
    description: "Horizontal divider line.",
    fields: ["style"],
  },
  {
    type: "youtube",
    maps_to: "e-youtube",
    category: "media",
    description: "Embedded YouTube video. `src` is the watch URL.",
    fields: ["src", "style"],
  },
  {
    type: "video",
    maps_to: "e-self-hosted-video",
    category: "media",
    description: "Self-hosted video. `src` is the video file URL.",
    fields: ["src", "style"],
  },
  // ---- Tier 1 Free widgets ----
  {
    type: "icon",
    maps_to: "e-icon",
    category: "content",
    description: "Font icon. `iconName` (e.g. 'fa-star'), `library` (default 'fa-solid'), optional `link` {href, targetBlank}.",
    fields: ["iconName", "library", "link", "style", "motion"],
  },
  {
    type: "icon-list",
    maps_to: "e-icon-list",
    category: "content",
    description: "Icon list. `items` is an array of {iconName, text, link?}.",
    fields: ["items", "style"],
  },
  {
    type: "image-box",
    maps_to: "e-image-box",
    category: "content",
    description: "Image box with heading, description, and optional link. `image` {src, alt}, `heading` {text, tag?}, `description` text, `link` {href, targetBlank}.",
    fields: ["image", "heading", "description", "link", "style", "hover"],
  },
  {
    type: "social-icons",
    maps_to: "e-social-icons",
    category: "content",
    description: "Social icons row. `items` is an array of {iconName, url, label?}.",
    fields: ["items", "style"],
  },
  {
    type: "accordion",
    maps_to: "e-accordion",
    category: "interactive",
    description: "Accordion / toggle. `items` is an array of {label, content (rich text), defaultActive?}.",
    fields: ["items", "style"],
  },
  // ---- html ----
  {
    type: "html",
    maps_to: "e-html",
    category: "special",
    description: "Custom HTML/JS embed. `html` is the raw HTML string to render. Use for scripts, embeds, or markup not covered by other widgets.",
    fields: ["html", "style"],
  },
  // ---- Tier 1 Pro widgets (classic format) ----
  {
    type: "slides",
    maps_to: "slides",
    category: "interactive",
    description: "Slides carousel (classic Pro widget). `props.slides` array of {bgImage?, heading, subheading?, buttonText?, buttonLink?}.",
    fields: ["props"],
  },
  {
    type: "carousel",
    maps_to: "media-carousel",
    category: "media",
    description: "Media carousel (classic Pro widget). `props.images` array of {url, caption?}.",
    fields: ["props"],
  },
  {
    type: "portfolio",
    maps_to: "portfolio",
    category: "dynamic",
    description: "Filterable portfolio grid (classic Pro widget). `props` for grid settings.",
    fields: ["props"],
  },
  {
    type: "call-to-action",
    maps_to: "call-to-action",
    category: "content",
    description: "Call to Action banner (classic Pro widget). `props` with bgImage, heading, description, button.",
    fields: ["props"],
  },
  // ---- forms ----
  {
    type: "form",
    maps_to: "e-form",
    category: "form",
    description: "Form container. `name`, optional `email` {to, subject}. Children are labels/inputs/etc.",
    fields: ["name", "email", "style", "children"],
  },
  {
    type: "form-label",
    maps_to: "e-form-label",
    category: "form",
    description: "Label for an input. `text` and `for` (the input id).",
    fields: ["text", "for"],
    aliases: ["label"],
  },
  {
    type: "input",
    maps_to: "e-form-input",
    category: "form",
    description: "Text input. `inputType` (text/email/tel/...), `placeholder`, `required`, `cssId`.",
    fields: ["inputType", "placeholder", "required", "cssId", "style"],
  },
  {
    type: "textarea",
    maps_to: "e-form-textarea",
    category: "form",
    description: "Multi-line text input.",
    fields: ["placeholder", "required", "cssId", "style"],
  },
  {
    type: "select",
    maps_to: "e-form-select",
    category: "form",
    description: "Dropdown. `options` is a list of {key (label), value}.",
    fields: ["options", "required", "cssId", "style"],
  },
  {
    type: "checkbox",
    maps_to: "e-form-checkbox",
    category: "form",
    description: "Checkbox field. `fieldName`, `value`, `required`, `cssId`.",
    fields: ["fieldName", "value", "required", "cssId", "style"],
  },
  {
    type: "radio",
    maps_to: "e-form-radio-button",
    category: "form",
    description: "Radio button field. `fieldName`, `value`, `required`, `cssId`.",
    fields: ["fieldName", "value", "required", "cssId", "style"],
  },
  {
    type: "date",
    maps_to: "e-form-date-picker",
    category: "form",
    description: "Date picker field. `placeholder`, `required`, `cssId`.",
    fields: ["placeholder", "required", "cssId", "style"],
  },
  {
    type: "time",
    maps_to: "e-form-time-picker",
    category: "form",
    description: "Time picker field. `placeholder`, `required`, `cssId`.",
    fields: ["placeholder", "required", "cssId", "style"],
  },
  {
    type: "file-upload",
    maps_to: "e-form-file-upload",
    category: "form",
    description: "File upload field. `fileTypes` (e.g. \"pdf,jpg\"), `required`, `cssId`.",
    fields: ["fileTypes", "required", "cssId", "style"],
  },
  {
    type: "submit",
    maps_to: "e-form-submit-button",
    category: "form",
    description: "Form submit button.",
    fields: ["text", "style", "settings"],
  },
  // ---- interactive ----
  {
    type: "tabs",
    maps_to: "e-tabs",
    category: "interactive",
    description: "Tabbed content. `tabs` is a list of { label, children }. `defaultTab` (index) sets the open tab. Builds the e-tabs/e-tab/e-tab-content scaffold automatically.",
    fields: ["tabs", "defaultTab", "style"],
  },
  {
    type: "nav-menu",
    maps_to: "nav-menu",
    category: "interactive",
    description: "Site navigation menu (classic Pro widget). `props.menu` is the WordPress menu slug, `props.menu_name` a label.",
    fields: ["props"],
  },
  {
    type: "login",
    maps_to: "login",
    category: "interactive",
    description: "Login form (classic Pro widget). `props.button_text`, `props.user_label`, etc.",
    fields: ["props"],
  },
  {
    type: "price-table",
    maps_to: "price-table",
    category: "interactive",
    description: "Pricing table (classic Pro widget). `props`: heading, sub_heading, price, period, features_list:[{item_text}], button_text, ribbon_title. Item ids auto-filled.",
    fields: ["props"],
    aliases: ["pricing"],
  },
  {
    type: "rating",
    maps_to: "rating",
    category: "interactive",
    description: "Star rating (classic Pro widget). `props` for rating value/scale.",
    fields: ["props"],
  },
  {
    type: "animated-headline",
    maps_to: "animated-headline",
    category: "interactive",
    description: "Animated headline (classic Pro widget). `props`: before_text, highlighted_text, rotating_text (newline-separated phrases).",
    fields: ["props"],
  },
  // ---- dynamic ----
  {
    type: "reviews",
    maps_to: "reviews",
    category: "dynamic",
    description: "Testimonials carousel (classic Pro widget). `props.slides`: [{content, name, title, image:{url}}]. Slide ids auto-filled.",
    fields: ["props"],
    aliases: ["testimonials"],
  },
  {
    type: "loop-grid",
    maps_to: "loop-grid",
    category: "dynamic",
    description: "Loop grid of a custom template across a query (classic Pro widget). `props` for template/query/pagination.",
    fields: ["props"],
  },
  {
    type: "posts",
    maps_to: "posts",
    category: "dynamic",
    description: "Posts grid (classic Pro widget). `props` for layout/query/pagination.",
    fields: ["props"],
  },
  // ---- theme builder ----
  {
    type: "post-title",
    maps_to: "post-title",
    category: "theme",
    description: "Dynamic post title (Theme Builder). Renders the current post's title. Use in single post templates.",
    fields: ["props"],
  },
  {
    type: "post-excerpt",
    maps_to: "post-excerpt",
    category: "theme",
    description: "Dynamic post excerpt (Theme Builder). Renders the current post's excerpt.",
    fields: ["props"],
  },
  {
    type: "post-content",
    maps_to: "post-content",
    category: "theme",
    description: "Dynamic post content (Theme Builder). Renders the current post's full content. Essential for single templates.",
    fields: ["props"],
  },
  {
    type: "featured-image",
    maps_to: "featured-image",
    category: "theme",
    description: "Dynamic featured image (Theme Builder). Renders the current post's featured image.",
    fields: ["props"],
  },
  {
    type: "post-info",
    maps_to: "post-info",
    category: "theme",
    description: "Post meta info (Theme Builder). Shows date, author, categories, etc. `props.sections` controls which meta items appear.",
    fields: ["props"],
  },
  {
    type: "site-logo",
    maps_to: "site-logo",
    category: "theme",
    description: "Site logo (Theme Builder). Renders the site logo set in WordPress Customizer. Use in header templates.",
    fields: ["props"],
  },
  {
    type: "site-title",
    maps_to: "site-title",
    category: "theme",
    description: "Site title (Theme Builder). Renders the site name. Use in header templates.",
    fields: ["props"],
  },
  {
    type: "page-title",
    maps_to: "page-title",
    category: "theme",
    description: "Dynamic page title (Theme Builder). Renders the current page's title. Works in any template type.",
    fields: ["props"],
  },
  {
    type: "author-box",
    maps_to: "author-box",
    category: "theme",
    description: "Author box (Theme Builder). Shows the post author's avatar, name, and bio. Use in single post templates.",
    fields: ["props"],
  },
  {
    type: "search-bar",
    maps_to: "search-bar",
    category: "theme",
    description: "Search bar (Theme Builder). WordPress search form widget. Use in header templates.",
    fields: ["props"],
  },
  {
    type: "breadcrumbs",
    maps_to: "breadcrumbs",
    category: "theme",
    description: "Breadcrumbs (Theme Builder). Navigation breadcrumb trail. Use in header or page templates.",
    fields: ["props"],
  },
  {
    type: "post-navigation",
    maps_to: "post-navigation",
    category: "theme",
    description: "Post navigation (Theme Builder). Previous/next post links. Use at bottom of single post templates.",
    fields: ["props"],
  },
  // ---- escape hatch ----
  {
    type: "raw",
    maps_to: "(any)",
    category: "special",
    description: "Drop in a full atomic-widget JSON node verbatim via `node`. Use for any widget not covered above (reviews, loop-grid, posts, login, nav-menu, price-table, rating, tabs, animated-headline, etc.). The compiler only fills in a missing id.",
    fields: ["node"],
  },
];

export const WIDGET_BY_TYPE: Record<string, WidgetInfo> = (() => {
  const map: Record<string, WidgetInfo> = {};
  for (const w of WIDGETS) {
    map[w.type] = w;
    for (const a of w.aliases ?? []) map[a] = w;
  }
  return map;
})();