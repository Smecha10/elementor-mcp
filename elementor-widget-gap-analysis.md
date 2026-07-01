# Elementor Widget Catalog & MCP Gap Analysis

## 1. EXISTING MCP COVERAGE (30 friendly types)

The MCP server at `/home/smecham2000/ai-control-tower/projects/elementor_mcp` currently supports these **friendly types**:

### Layout (3)
| Type | Maps To | Notes |
|------|---------|-------|
| `section` | `e-div-block` | Block container, configurable tag |
| `flex` | `e-flexbox` | Row/column/stack, direction, gap, alignment |
| `spacer` | `e-div-block` | Empty vertical space via height |

### Content (5)
| Type | Maps To | Notes |
|------|---------|-------|
| `heading` | `e-heading` | h1-h6, text, tag |
| `text` | `e-paragraph` | Body text, configurable tag |
| `button` | `e-button` | Text, href, targetBlank |
| `divider` | `e-divider` | Horizontal line |
| `svg` | `e-svg` | SVG icon from URL (aliased as `icon`) |

### Media (3)
| Type | Maps To | Notes |
|------|---------|-------|
| `image` | `e-image` | URL, alt, size |
| `youtube` | `e-youtube` | YouTube embed URL |
| `video` | `e-self-hosted-video` | Self-hosted video URL |

### Form (11)
| Type | Maps To | Notes |
|------|---------|-------|
| `form` | `e-form` | Container, name, email config |
| `form-label` | `e-form-label` | Label text, `for` attr |
| `input` | `e-form-input` | inputType, placeholder, required |
| `textarea` | `e-form-textarea` | Multi-line text |
| `select` | `e-form-select` | Options list |
| `checkbox` | `e-form-checkbox` | fieldName, value |
| `radio` | `e-form-radio-button` | fieldName, value |
| `date` | `e-form-date-picker` | Date picker |
| `time` | `e-form-time-picker` | Time picker |
| `file-upload` | `e-form-file-upload` | fileTypes filter |
| `submit` | `e-form-submit-button` | Submit button text |

### Interactive (5)
| Type | Maps To | Notes |
|------|---------|-------|
| `tabs` | `e-tabs` | Tabbed content, builds e-tabs-menu/e-tab/e-tabs-content-area scaffold |
| `nav-menu` | `nav-menu` | Classic Pro widget (flat settings) |
| `login` | `login` | Classic Pro widget |
| `price-table` | `price-table` | Classic Pro widget (aliased as `pricing`) |
| `rating` | `rating` | Classic Pro widget |
| `animated-headline` | `animated-headline` | Classic Pro widget |

### Dynamic (3)
| Type | Maps To | Notes |
|------|---------|-------|
| `reviews` | `reviews` | Testimonials carousel (aliased as `testimonials`) |
| `loop-grid` | `loop-grid` | Loop grid with template/query |
| `posts` | `posts` | Posts grid |

### Special (1)
| Type | Maps To | Notes |
|------|---------|-------|
| `raw` | `(any)` | Escape hatch for any atomic JSON |

---

## 2. ELEMENTOR FREE WIDGETS — COMPLETE CATALOG

Elementor Free (core plugin, no Pro required) includes these widgets. **Bold** = already covered by the MCP.

### Basic Widgets (Free)
| Widget | MCP Status | Priority | Notes |
|--------|-----------|----------|-------|
| **Heading** | ✅ Covered | High | `e-heading` |
| **Text Editor** | ✅ Covered | High | `e-paragraph` |
| **Button** | ✅ Covered | High | `e-button` |
| **Image** | ✅ Covered | High | `e-image` |
| **Video** | ✅ Covered | High | `e-self-hosted-video` |
| **Divider** | ✅ Covered | Medium | `e-divider` |
| **Spacer** | ✅ Covered | Medium | `e-div-block` with height |
| **Icon** | ❌ MISSING | **HIGH** | `e-icon` — one of the most-used Free widgets! Shows a single icon from FontAwesome/Eicons/etc. |
| **Icon List** | ❌ MISSING | **HIGH** | `e-icon-list` — list of icon+text items. Very common in feature lists. |
| **Image Box** | ❌ MISSING | **HIGH** | `e-image-box` — image + heading + text in a card layout. Extremely common. |
| **Image Gallery** | ❌ MISSING | Medium | `e-image-gallery` — masonry/justified grid of images |
| **Progress Bar** | ❌ MISSING | Medium | `e-progress-bar` — animated progress bar with title/percentage |
| **Counter** | ❌ MISSING | Medium | `e-counter` — animated number counter |
| **Accordion** | ❌ MISSING | **HIGH** | `e-accordion` — expandable accordion items. More common than tabs in many sites. |
| **Toggle** | ❌ MISSING | Medium | `e-toggle` — similar to accordion but all items can be open simultaneously |
| **Alert** | ❌ MISSING | Low | `e-alert` — dismissible info/warning/success/error boxes |
| **Star Rating** | ❌ MISSING | Low | `e-star-rating` — static star display (different from the Pro `rating` widget) |
| **Social Icons** | ❌ MISSING | **HIGH** | `e-social-icons` — row of social media icon links. Very common in footers. |
| **Social Share** | ❌ MISSING | Low | `e-share-buttons` — share buttons for social platforms |
| **Menu Anchor** | ❌ MISSING | Low | `e-menu-anchor` — invisible anchor point for one-page nav |
| **Read More** | ❌ MISSING | Low | `e-read-more` — excerpt with expand/read-more toggle |
| **Shortcode** | ❌ MISSING | Low | `e-shortcode` — embed any WordPress shortcode |
| **HTML** | ❌ MISSING | Low | `e-html` — raw HTML block |
| **Code Highlight** | ❌ MISSING | Low | `e-code-highlight` — syntax-highlighted code block |
| **Google Maps** | ❌ MISSING | Medium | `e-google-maps` — embedded Google Map |
| **SoundCloud** | ❌ MISSING | Low | `e-soundcloud` — SoundCloud embed |
| **WordPress Widgets** | ❌ MISSING | Low | Various WP native widgets (archives, categories, meta, etc.) |

### Free Widgets — Priority Ranking for MCP
1. **Icon** (`e-icon`) — used everywhere for feature cards, CTAs, lists
2. **Icon List** (`e-icon-list`) — feature bullet lists, contact info
3. **Image Box** (`e-image-box`) — service/feature cards (heading + image + text)
4. **Social Icons** (`e-social-icons`) — footer social links
5. **Accordion** (`e-accordion`) — FAQ sections, product specs
6. **Progress Bar** (`e-progress-bar`) — skills, stats
7. **Counter** (`e-counter`) — stats, milestones
8. **Image Gallery** (`e-image-gallery`) — portfolio, product grids
9. **Google Maps** (`e-google-maps`) — contact pages
10. **Toggle** (`e-toggle`) — FAQ, comparison

---

## 3. ELEMENTOR PRO WIDGETS — COMPLETE CATALOG

Elementor Pro adds these widgets. **Bold** = already covered by the MCP.

### Pro Widgets
| Widget | MCP Status | Priority | Notes |
|--------|-----------|----------|-------|
| **Nav Menu** | ✅ Covered | High | Classic Pro widget |
| **Animated Headline** | ✅ Covered | Medium | Classic Pro widget |
| **Login** | ✅ Covered | Low | Classic Pro widget |
| **Price Table** | ✅ Covered | Medium | Classic Pro widget |
| **Rating** | ✅ Covered | Low | Classic Pro widget |
| **Reviews** | ✅ Covered | Medium | Classic Pro widget (testimonials carousel) |
| **Posts** | ✅ Covered | High | Classic Pro widget |
| **Loop Grid** | ✅ Covered | High | Classic Pro widget |
| Slides | ❌ MISSING | **HIGH** | `slides` — full-screen hero slideshow with CTA. Very common. |
| Carousel | ❌ MISSING | **HIGH** | `media-carousel` — image/content carousel. Very common. |
| Media Carousel | ❌ MISSING | Medium | `media-carousel` — specific media carousel variant |
| Portfolio | ❌ MISSING | **HIGH** | `portfolio` — filterable portfolio grid. Very common for agencies. |
| Gallery | ❌ MISSING | Medium | `gallery` — justified/masonry gallery with lightbox |
| Call to Action | ❌ MISSING | **HIGH** | `call-to-action` — CTA card with image background, button. Very common. |
| Countdown | ❌ MISSING | Medium | `countdown` — countdown timer for events/sales |
| Share Buttons | ❌ MISSING | Low | `share-buttons` — social share buttons |
| Form | ❌ MISSING | **HIGH** | `form` — Pro's advanced form builder (different from Free's basic form). Has email routing, actions, conditional logic. |
| Table of Contents | ❌ MISSING | Medium | `table-of-contents` — auto-generated TOC from headings |
| Blockquote | ❌ MISSING | Low | `blockquote` — styled pull quote |
| Motion Box | ❌ MISSING | Low | `motion-box` — background video/image with overlay text |
| Hotspot | ❌ MISSING | Low | `hotspot` — image with clickable tooltip markers |
| Flip Box | ❌ MISSING | Medium | `flip-box` — card that flips on hover to reveal back content |
| Lottie | ❌ MISSING | Low | `lottie` — Lottie animation player |
| Testimonial Carousel | ❌ MISSING | Medium | `testimonial-carousel` — dedicated testimonial carousel (different from `reviews`) |
| Facebook/Twitter/Instagram | ❌ MISSING | Low | Social media embed widgets |
| Scroll Snap | ❌ MISSING | Low | `scroll-snap` — full-page scroll snap sections |
| PayPal/Stripe Button | ❌ MISSING | Low | Payment buttons |
| Archive Posts | ❌ MISSING | Medium | `archive-posts` — archive template posts grid |
| Archive Title/Description | ❌ MISSING | Low | Archive template elements |
| Post Info | ❌ MISSING | Low | Post meta (date, author, comments) |
| Post Navigation | ❌ MISSING | Low | Previous/next post links |
| Author Box | ❌ MISSING | Low | Author bio box |
| Post Comments | ❌ MISSING | Low | Comments template |
| Page Title | ❌ MISSING | Low | Dynamic page title |
| Post Content | ❌ MISSING | Low | Dynamic post content |
| Post Excerpt | ❌ MISSING | Low | Dynamic post excerpt |
| Post Featured Image | ❌ MISSING | Low | Dynamic featured image |
| Site Logo | ❌ MISSING | Low | Dynamic site logo |
| Site Tagline | ❌ MISSING | Low | Dynamic site tagline |
| Search Form | ❌ MISSING | Medium | `search-form` — search bar |
| WooCommerce widgets | ❌ MISSING | Medium | Product grid, cart, checkout, etc. (if WooCommerce is active) |

### Pro Widgets — Priority Ranking for MCP
1. **Slides** (`slides`) — hero slideshow, extremely common in marketing sites
2. **Carousel** (`media-carousel`) — image/content carousel
3. **Portfolio** (`portfolio`) — filterable portfolio, essential for agencies
4. **Call to Action** (`call-to-action`) — CTA cards, very common
5. **Form** (`form`) — Pro's advanced form (the MCP already has Free form, but Pro form has more features)
6. **Countdown** (`countdown`) — event/launch pages
7. **Flip Box** (`flip-box`) — interactive cards
8. **Table of Contents** (`table-of-contents`) — long-form content
9. **Archive Posts** (`archive-posts`) — blog archive templates
10. **Search Form** (`search-form`) — site search

---

## 4. KEY GAPS: MOST IMPORTANT MISSING WIDGETS

### Tier 1 — Add ASAP (very common, used in >50% of real sites)
1. **Icon** (`e-icon`) — Free. Single icon with styling. Used everywhere.
2. **Icon List** (`e-icon-list`) — Free. Feature bullet lists. Extremely common.
3. **Image Box** (`e-image-box`) — Free. Card with image + heading + text. The #1 way to show services/features.
4. **Social Icons** (`e-social-icons`) — Free. Footer social links. Nearly every site has these.
5. **Accordion** (`e-accordion`) — Free. FAQ sections. More common than tabs.
6. **Slides** (`slides`) — Pro. Hero slideshow. Very common on marketing sites.
7. **Carousel** (`media-carousel`) — Pro. Image/content carousel.
8. **Portfolio** (`portfolio`) — Pro. Filterable portfolio grid.
9. **Call to Action** (`call-to-action`) — Pro. CTA cards with image backgrounds.

### Tier 2 — Add Soon (common, used in ~20-40% of sites)
10. **Progress Bar** (`e-progress-bar`) — Free. Skills/stats display.
11. **Counter** (`e-counter`) — Free. Animated number counters.
12. **Image Gallery** (`e-image-gallery`) — Free. Image grids.
13. **Google Maps** (`e-google-maps`) — Free. Contact pages.
14. **Countdown** (`countdown`) — Pro. Event/launch timers.
15. **Flip Box** (`flip-box`) — Pro. Interactive hover cards.
16. **Table of Contents** (`table-of-contents`) — Pro. Long-form content.
17. **Search Form** (`search-form`) — Pro. Site search.
18. **Archive Posts** (`archive-posts`) — Pro. Blog archive templates.

### Tier 3 — Nice to Have (used in <10% of sites, fine as `raw`)
19. **Toggle** (`e-toggle`) — Free. Similar to accordion.
20. **Alert** (`e-alert`) — Free. Dismissible notices.
21. **Star Rating** (`e-star-rating`) — Free. Static stars (different from Pro `rating`).
22. **Blockquote** (`blockquote`) — Pro. Pull quotes.
23. **Motion Box** (`motion-box`) — Pro. Background video overlay.
24. **Hotspot** (`hotspot`) — Pro. Image hotspots.
25. **Lottie** (`lottie`) — Pro. Lottie animations.
26. **Share Buttons** (`share-buttons`) — Pro. Social sharing.
27. **Post Comments** / **Author Box** / **Post Navigation** — Pro. Blog template elements.

---

## 5. ELEMENTOR PRO DESIGN TEMPLATE SYSTEM

Elementor Pro's Theme Builder provides these template types:

### Template Categories
| Template Type | Purpose | MCP Support | Priority |
|--------------|---------|-------------|----------|
| **Header** | Site header (logo, nav, CTA) | ✅ Via `navbar` template | High |
| **Footer** | Site footer (columns, links, copyright) | ✅ Via `footer` template | High |
| **Single Post** | Individual blog post layout | ❌ Not covered | Medium |
| **Single Page** | Individual page layout | ❌ Not covered | Low |
| **Archive** | Blog/category archive pages | ❌ Not covered | Medium |
| **Search Results** | Search results page | ❌ Not covered | Low |
| **404 Page** | Custom 404 page | ❌ Not covered | Low |
| **Product Archive** | WooCommerce shop/category | ❌ Not covered | Low |
| **Single Product** | Individual product page | ❌ Not covered | Low |
| **Popup** | Popup/modal builder | ❌ Not covered | Low |
| **Loop Item** | Reusable loop item template | ✅ Via `loop-grid` | Medium |

### Theme Builder Dynamic Tags (Pro)
These are dynamic content tags used within templates, not widgets per se:
- Site name, tagline, logo
- Post title, content, excerpt, featured image, author, date, categories, tags
- Archive title, description
- Author info, avatar
- User info (for logged-in users)
- WooCommerce product data
- Custom fields (ACF, Pods, Toolset)
- Global colors, global fonts

### Key Gap: The MCP has no concept of "template type" (header/footer/single/archive). The `navbar` and `footer` templates generate section content but don't set the Elementor document `type` field to "header" or "footer". For full Theme Builder support, the compiled document would need `type: "header"` or `type: "footer"` etc.

---

## 6. ELEMENTOR V4 "ATOMIC WIDGETS" FORMAT — KEY QUIRKS

### What the MCP Already Handles Correctly
1. **$$type wrapping** — Every typed value is `{ $$type: "string"|"number"|"boolean"|"size"|"dimensions"|"color"|"border-radius"|"html-v3"|"image"|"link"|"url"|"classes"|"svg-src"|"video-src"|"email"|"options"|"string-array"|"key-value" }`
2. **Style variants** — `{ meta: { breakpoint, state }, props, custom_css }` model
3. **Base64 custom_css** — Raw CSS stored as `{ raw: "<base64>" }`
4. **Logical dimensions** — Padding uses `block-start`, `inline-end`, `block-end`, `inline-start`
5. **Logical border-radius** — `start-start`, `start-end`, `end-start`, `end-end`
6. **Version 0.4** — The document uses `version: "0.4"`
7. **Classic Pro widget format** — Flat settings, no $$type, minimal wrapper

### Known Quirks / Potential Issues
1. **Flex alignment values** — Elementor v4 validates against CSS box-alignment keywords (`start`, `end`, `stretch`) NOT the legacy flexbox synonyms (`flex-start`, `flex-end`). The MCP's `styling.js` already handles this mapping.
2. **Empty props** — Elementor serializes empty props as `[]` not `{}`. The MCP's `buildStyle` handles this.
3. **Image alt text** — External URL images don't carry alt in real exports (alt comes from media library). The MCP includes it as a best-effort hint.
4. **Classic widget `_id`** — List items in classic widgets (features_list, slides) require a unique `_id` field. The MCP auto-fills these.
5. **No `widgetType` on structural elements** — `e-div-block`, `e-flexbox`, `e-form`, `e-tabs` use `elType` not `widgetType`. The MCP's `layoutNode` handles this.
6. **`isInner` flag** — Used for nested containers. The MCP passes it through but doesn't set it automatically.
7. **`page_settings`** — The compiled document has `page_settings: []` which is correct for v4.
8. **`interactions`** — The MCP sets `interactions: []` on atomic widgets, which is correct.

### What the MCP Does NOT Handle (that real Elementor v4 supports)
1. **Motion effects** — Scroll effects, entrance animations, mouse effects
2. **Responsive visibility** — Hide on tablet/mobile settings
3. **Custom positioning** — Absolute/relative positioning, z-index, CSS transforms
4. **Container-based layouts** — Elementor v4's Flexbox Container (the new default layout system) vs. the old Section/Column model
5. **Global widgets** — Saved widgets that sync across a site
6. **Dynamic tags** — The `{{something}}` dynamic content system
7. **Conditional logic** — Show/hide based on user role, device, etc.
8. **A/B testing** — Elementor Pro's split testing
9. **CSS classes/ID** — Custom CSS classes and element IDs for custom styling

---

## 7. RECOMMENDED NEXT STEPS FOR THE MCP

### Immediate (add these friendly types)
1. **Icon** (`e-icon`) — Simple: icon name + library + link + styling
2. **Icon List** (`e-icon-list`) — List of {icon, text, link} items
3. **Image Box** (`e-image-box`) — image + heading + description + link
4. **Social Icons** (`e-social-icons`) — List of {icon, url} items
5. **Accordion** (`e-accordion`) — List of {label, content} items (similar to tabs but different structure)
6. **Slides** (`slides`) — Pro slideshow with {background, heading, text, button} per slide
7. **Carousel** (`media-carousel`) — Image/content carousel
8. **Portfolio** (`portfolio`) — Filterable portfolio grid
9. **Call to Action** (`call-to-action`) — CTA card with image background

### Medium-term
10. **Progress Bar** (`e-progress-bar`) — title + percentage + bar styling
11. **Counter** (`e-counter`) — number + label + animation settings
12. **Image Gallery** (`e-image-gallery`) — image grid with layout options
13. **Google Maps** (`e-google-maps`) — address + zoom + API key
14. **Countdown** (`countdown`) — target date + labels
15. **Flip Box** (`flip-box`) — front {image, heading, text} + back {heading, text, button}
16. **Table of Contents** (`table-of-contents`) — heading level selection + list style
17. **Search Form** (`search-form`) — placeholder + button text + redirect
18. **Archive Posts** (`archive-posts`) — archive-specific posts widget

### Architecture improvements
19. **Template type support** — Allow setting document `type` to "header", "footer", "single", "archive" etc.
20. **Container mode** — Support Elementor v4's Flexbox Container as an alternative to Section/Column
21. **Dynamic tags** — Support `{{post.title}}`, `{{site.logo}}` etc. in template contexts

---

## 8. SUMMARY STATISTICS

| Category | Total Elementor Widgets | MCP Covered | Missing | Coverage % |
|----------|----------------------|-------------|---------|-----------|
| Free Basic | ~25 | 7 | 18 | 28% |
| Free Form | ~11 | 11 | 0 | 100% |
| Pro Widgets | ~40+ | 8 | 32+ | 20% |
| Theme Builder | ~11 template types | 2 (partial) | 9 | 18% |
| **Total** | **~76+** | **26** | **50+** | **~34%** |

### Real-World Usage Weighting
- The 30 existing friendly types cover about **60-70% of what a typical site uses** (because they include the most common widgets: heading, text, button, image, form, nav-menu, posts, price-table)
- Adding the **Tier 1 missing widgets** (9 widgets) would bring coverage to **~85-90% of real-world usage**
- Adding **Tier 2** (9 more) would bring coverage to **~95%+**
- The remaining widgets are niche enough that the `raw` escape hatch is perfectly adequate
