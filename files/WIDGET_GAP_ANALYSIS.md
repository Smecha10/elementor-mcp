# Widget Gap Analysis — v0.5.0 → v0.6.0

## Current State

- **Our MCP supports**: 39 widget types (all basic + key pro widgets)
- **Elementor total catalog**: 107 widget types across 4 groups
- **Missing**: 65 widgets (but many are niche or WooCommerce-specific)

## Widget Inventory

### Basic (33 widgets) — Elementor Free
| Widget | In Our MCP? | Priority |
|--------|-------------|----------|
| inner-section | no | Medium — structural element |
| container | yes | — |
| columns | no | Low — legacy (use container) |
| heading | yes | — |
| image | yes | — |
| text-editor | yes | — |
| video | yes | — |
| button | yes | — |
| star-rating | yes | — |
| divider | yes | — |
| google-maps | yes | — |
| icon | yes | — |
| image-box | yes | — |
| icon-box | yes | — |
| basic-gallery | yes | — |
| image-carousel | yes | — |
| icon-list | yes | — |
| counter | yes | — |
| spacer | yes | — |
| testimonial | yes | — |
| tabs | yes | — |
| accordion | yes | — |
| toggle | yes | — |
| social-icons | yes | — |
| progress-bar | yes | — |
| soundcloud | no | Low — niche audio embed |
| shortcode | yes | — |
| html | yes | — |
| menu-anchor | yes | — |
| alert | yes | — |
| sidebar | no | Low — WP sidebar widget |
| text-path | no | Medium — creative text along path |
| link-in-bio | no | Medium — modern feature |

### Pro (35 widgets) — Elementor Pro Required
| Widget | In Our MCP? | Priority |
|--------|-------------|----------|
| posts | yes | — |
| portfolio | yes | — |
| slides | yes | — |
| form | yes | — |
| login | yes | — |
| share-buttons | no | Medium — social sharing |
| nav-menu | no | HIGH — essential for headers |
| animated-headline | yes | — |
| price-table | yes | — |
| price-list | yes | — |
| gallery | yes | — |
| flip-box | yes | — |
| call-to-action | yes | — |
| media-carousel | no | Medium — rich carousel |
| testimonial-carousel | no | Low — carousel variant |
| nested-carousel | no | Low — carousel variant |
| loop-carousel | no | Low — advanced loop |
| table-of-contents | yes | — |
| countdown | yes | — |
| facebook-page | no | Low — deprecated social |
| blockquote | yes | — |
| template | yes | — |
| reviews | no | Low — niche |
| facebook-button | no | Low — deprecated |
| facebook-embed | no | Low — deprecated |
| facebook-comments | no | Low — deprecated |
| paypal-button | no | Low — payment |
| lottie | yes | — |
| code-highlight | no | Medium — dev/tech sites |
| video-playlist | no | Medium — rich media |
| hotspot | no | Medium — interactive images |
| progress-tracker | no | Low — niche |
| stripe-button | no | Low — payment |
| mega-menu | no | Medium — large nav |
| off-canvas | no | Medium — modern UI pattern |

### Theme Builder (15 widgets) — Elementor Pro
| Widget | In Our MCP? | Priority |
|--------|-------------|----------|
| post-title | no | HIGH — Theme Builder essential |
| post-excerpt | no | HIGH — Theme Builder essential |
| post-content | no | HIGH — Theme Builder essential |
| featured-image | no | HIGH — Theme Builder essential |
| author-box | no | Medium — blog template |
| post-comments | no | Low — WP comments |
| post-navigation | no | Low — prev/next links |
| post-info | no | HIGH — meta info (date, author, etc.) |
| site-logo | no | HIGH — header template |
| site-title | no | HIGH — header template |
| page-title | no | HIGH — any page template |
| search-bar | no | Medium — header element |
| breadcrumbs | no | Medium — navigation aid |
| sitemap | no | Low — niche |
| loop-grid | no | Medium — modern Elementor feature |

### WooCommerce (24 widgets) — Elementor Pro + WooCommerce
All 24 are missing. Priority: Low unless building an e-commerce site.
Key ones if needed: product-title, product-price, add-to-cart, product-images, products.

## Schema Learning Results (from 64 templates)

| Metric | Before | After |
|--------|--------|-------|
| Element types | 21 | 26 |
| Total instances | 275 | 1,556 |
| Settings keys | ~200 | 1,939 |
| Sources | 7 | 30+ |

### New types learned
- spacer — spacer widget
- accordion — accordion widget
- nav-menu — navigation menu (Pro)
- form — form widget (Pro)
- tabs — tabs widget

### Richest schemas (by setting count)
1. container — 570 settings (full flexbox/grid control)
2. image — 431 settings (all responsive + transform variants)
3. heading — 385 settings (typography + transform + motion)
4. html — 72 settings
5. button — 62 settings

## Recommended Next Steps

### v0.6.0 — Theme Builder Support
Add the 7 HIGH-priority Theme Builder widgets (post-title, post-excerpt, post-content,
featured-image, post-info, site-logo, site-title, page-title). These are essential
for building header/footer/single templates that actually work.

### v0.6.1 — Navigation
Add nav-menu, mega-menu, off-canvas, search-bar, breadcrumbs. These complete the
header/navigation story.

### v0.6.2 — Modern Interactive
Add media-carousel, hotspot, code-highlight, video-playlist, text-path, link-in-bio.

### Future
WooCommerce widgets (24) — only if a client needs e-commerce.