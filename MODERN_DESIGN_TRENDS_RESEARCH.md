# Modern WordPress + Elementor Design Trends — Implementation Research

## Overview

This document covers 12 modern design trends for premium Elementor sites, with
specific CSS/HTML implementation details and exact blueprint representations
for the Elementor MCP compiler. Each trend includes: the CSS properties needed,
how to achieve it in Elementor (native props vs custom_css), and the blueprint
style object that produces it.

---

## 1. Glassmorphism (Frosted Glass Effect)

### CSS Properties

```css
.glass-card {
  /* Core glass effect */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);

  /* Supporting properties */
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  /* Required for backdrop-filter to work */
  /* The element must be semi-transparent */
}
```

### Key Requirements

1. **Parent element must have a visible background** (image, gradient, or pattern)
   — backdrop-filter only shows the frosted effect on content *behind* the element.
2. **The glass element itself must be semi-transparent** — use `rgba()` or `hsla()`
   with alpha < 1 for the background.
3. **`backdrop-filter` is the core property** — `blur()` does the frosting,
   `saturate()` restores color vibrancy lost to blur.
4. **`-webkit-backdrop-filter`** is needed for Safari support.
5. **Border with low-opacity white** creates the "glass edge" effect.
6. **Box shadow** adds depth separating the glass from the background.

### Variations

```css
/* Dark glass (for light backgrounds) */
.glass-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Heavy glass (more opaque, less blur) */
.glass-heavy {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
}

/* Light glass (very transparent, more blur) */
.glass-light {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(200%);
}

/* Gradient glass */
.glass-gradient {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(12px);
}
```

### Blueprint Representation

```json
{
  "type": "section",
  "style": {
    "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "padding": { "top": "4rem", "bottom": "4rem" }
  },
  "children": [
    {
      "type": "flex",
      "direction": "row",
      "style": {
        "gap": "2rem",
        "maxWidth": "1200px",
        "width": "100%",
        "margin": "0 auto"
      },
      "children": [
        {
          "type": "section",
          "style": {
            "css": "background: rgba(255,255,255,0.15); backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); border: 1px solid rgba(255,255,255,0.25);",
            "borderRadius": "1rem",
            "padding": { "top": "2rem", "right": "2rem", "bottom": "2rem", "left": "2rem" }
          },
          "children": [
            {
              "type": "heading",
              "level": 3,
              "text": "Glass Card Title",
              "style": { "color": "#ffffff", "fontSize": "1.5rem" }
            }
          ]
        }
      ]
    }
  ]
}
```

### Notes for the Compiler

- `backdrop-filter` and `-webkit-backdrop-filter` must go through `custom_css`
  (the `css` escape hatch) — they are not native Elementor props.
- The glass card's `background` must use `rgba()` — also custom_css.
- `borderRadius` IS a native prop, so it can be set directly.
- `border` with `rgba()` goes through custom_css.

---

## 2. Neumorphism (Soft UI)

### CSS Properties

```css
.neumorph-card {
  /* Base surface color matching the background */
  background: #e0e5ec;

  /* Dual shadow: light from top-left, dark from bottom-right */
  box-shadow:
    9px 9px 16px rgba(163, 177, 198, 0.6),   /* dark shadow (bottom-right) */
    -9px -9px 16px rgba(255, 255, 255, 0.8);   /* light shadow (top-left) */

  border-radius: 16px;
}

/* Inset (pressed) state */
.neumorph-card:active {
  box-shadow:
    inset 9px 9px 16px rgba(163, 177, 198, 0.6),
    inset -9px -9px 16px rgba(255, 255, 255, 0.8);
}

/* Neumorphic button */
.neumorph-button {
  background: #e0e5ec;
  box-shadow:
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.8);
  border-radius: 50px;
  border: none;
  transition: all 0.2s ease;
}

.neumorph-button:hover {
  box-shadow:
    4px 4px 8px rgba(163, 177, 198, 0.5),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
}

.neumorph-button:active {
  box-shadow:
    inset 6px 6px 12px rgba(163, 177, 198, 0.6),
    inset -6px -6px 12px rgba(255, 255, 255, 0.8);
}
```

### Key Requirements

1. **Background must match the page/section background** — neumorphism works by
   creating the illusion of extruded/inset shapes on the same surface.
2. **Dual box-shadow** — one dark (bottom-right), one light (top-left).
3. **No border** — the effect relies entirely on shadows.
4. **Inset shadows for "pressed" state** on interactive elements.
5. **Works best on light, neutral backgrounds** (#e0e5ec, #d1d9e6, etc.).
6. **Dark mode neumorphism** uses inverted shadow colors (light from top-left
   becomes lighter than the surface, dark from bottom-right becomes darker).

### Blueprint Representation

```json
{
  "type": "section",
  "style": {
    "background": "#e0e5ec",
    "padding": { "top": "4rem", "bottom": "4rem" }
  },
  "children": [
    {
      "type": "section",
      "style": {
        "background": "#e0e5ec",
        "css": "box-shadow: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.8);",
        "borderRadius": "1rem",
        "padding": { "top": "2rem", "right": "2rem", "bottom": "2rem", "left": "2rem" }
      },
      "children": [
        {
          "type": "heading",
          "level": 3,
          "text": "Neumorphic Card",
          "style": { "color": "#4a5568" }
        }
      ]
    }
  ]
}
```

### Notes for the Compiler

- `box-shadow` with multiple values goes through `custom_css` — Elementor's native
  `box-shadow` prop type only supports a single shadow.
- The background color must match the parent for the illusion to work.
- Hover/active states use the `hover` key in the style object.

---

## 3. Gradient Meshes & Complex CSS Gradients

### CSS Properties

```css
/* Conic gradient (color wheel) */
.conic-bg {
  background: conic-gradient(
    from 0deg,
    #ff6b6b,
    #feca57,
    #48dbfb,
    #ff9ff3,
    #ff6b6b
  );
}

/* Radial gradient with multiple stops */
.radial-mesh {
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 107, 107, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(72, 219, 251, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(254, 202, 87, 0.3) 0%, transparent 50%);
}

/* Diagonal gradient with hard stops */
.diagonal-stripe {
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #667eea 25%,
    #764ba2 25%,
    #764ba2 50%,
    #667eea 50%,
    #667eea 75%,
    #764ba2 75%,
    #764ba2 100%
  );
  background-size: 200% 200%;
}

/* Gradient mesh (multiple layered gradients) */
.gradient-mesh {
  background-color: #0f0c29;
  background-image:
    radial-gradient(at 0% 0%, hsla(253, 16%, 20%, 1) 0px, transparent 50%),
    radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 1) 0px, transparent 50%),
    radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 1) 0px, transparent 50%);
}

/* Animated gradient */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animated-gradient {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}
```

### Blueprint Representation

```json
{
  "type": "section",
  "style": {
    "css": "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);",
    "padding": { "top": "6rem", "bottom": "6rem" }
  }
}
```

For gradient meshes (multiple layered gradients):

```json
{
  "type": "section",
  "style": {
    "css": "background-color: #0f0c29; background-image: radial-gradient(at 0% 0%, hsla(253,16%,20%,1) 0px, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0px, transparent 50%);",
    "padding": { "top": "6rem", "bottom": "6rem" }
  }
}
```

### Notes for the Compiler

- All complex gradients go through `custom_css` — Elementor's native `background`
  prop type supports simple linear/radial gradients but not multi-layered meshes.
- For simple linear gradients, Elementor's native `background` prop type CAN be
  used (structured object with `background-type: gradient`), but multi-stop and
  conic gradients require custom_css.
- Animated gradients need a `@keyframes` rule injected via custom_css or a
  site-wide CSS file.

---

## 4. Micro-Interactions (Hover Effects, Button Animations, Loading States)

### CSS Properties

```css
/* Button lift effect */
.btn-lift {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
}
.btn-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.btn-lift:active {
  transform: translateY(-1px);
}

/* Button border fill effect */
.btn-border-fill {
  position: relative;
  overflow: hidden;
  transition: color 0.3s ease;
}
.btn-border-fill::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
  z-index: -1;
}
.btn-border-fill:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}

/* Card hover lift */
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
}

/* Image zoom on hover */
.img-zoom-container {
  overflow: hidden;
}
.img-zoom-container img {
  transition: transform 0.5s ease;
}
.img-zoom-container:hover img {
  transform: scale(1.08);
}

/* Underline animation for links */
.link-underline {
  position: relative;
  text-decoration: none;
}
.link-underline::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}
.link-underline:hover::after {
  width: 100%;
}

/* Skeleton loading */
@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}

/* Ripple effect on click */
.btn-ripple {
  position: relative;
  overflow: hidden;
}
.btn-ripple .ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple-anim 0.6s ease-out;
  pointer-events: none;
}
@keyframes ripple-anim {
  to { transform: scale(4); opacity: 0; }
}
```

### Blueprint Representation

```json
{
  "type": "button",
  "text": "Get Started",
  "style": {
    "color": "#ffffff",
    "background": "{colors.accent}",
    "fontWeight": "700",
    "padding": { "top": "1rem", "right": "2.5rem", "bottom": "1rem", "left": "2.5rem" },
    "borderRadius": "{radius.md}",
    "css": "transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;",
    "hover": {
      "css": "transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.15);"
    }
  }
}
```

For card hover lift:

```json
{
  "type": "section",
  "style": {
    "background": "{colors.surface}",
    "borderRadius": "{radius.lg}",
    "padding": { "top": "2rem", "right": "2rem", "bottom": "2rem", "left": "2rem" },
    "css": "transition: transform 0.3s ease, box-shadow 0.3s ease;",
    "hover": {
      "css": "transform: translateY(-8px); box-shadow: 0 20px 50px rgba(0,0,0,0.12);"
    }
  }
}
```

### Notes for the Compiler

- `transition` goes through `custom_css` — not a native Elementor prop.
- Hover transforms (`translateY`, `scale`) go in the `hover.css` string.
- The `hover` key in the style object is already supported by the compiler
  (it creates a variant with `state: "hover"`).
- For `::before`/`::after` pseudo-elements, the CSS must be in `custom_css`.
- Skeleton loading states require a `@keyframes` rule — best injected at the
  site/theme level, not per-element.

---

## 5. Scroll-Triggered Animations

### Elementor's Native Motion Effects (Pro)

Elementor Pro has built-in scroll effects stored as flat settings on the element:

```json
{
  "settings": {
    "_animation": "fadeInUp",
    "animation_duration": 1.0,
    "_animation_delay": 0,
    "_animation_offset": 0,
    "motion_fx_motion_fx_scrolling": "yes",
    "motion_fx_translateY_effect": "yes",
    "motion_fx_translateY_direction": "alternate",
    "motion_fx_translateY_speed": { "unit": "px", "size": 4 },
    "motion_fx_translateY_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } },
    "motion_fx_opacity_effect": "yes",
    "motion_fx_opacity_direction": "in",
    "motion_fx_opacity_level": { "unit": "px", "size": 10 },
    "motion_fx_opacity_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } }
  }
}
```

### CSS-Only Scroll Animations (Modern Browsers)

```css
/* CSS Scroll-Driven Animations (Chrome 115+) */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

.reveal-on-scroll {
  animation: fade-in linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

/* Staggered reveal for children */
.stagger-children > * {
  animation: fade-in linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
.stagger-children > *:nth-child(1) { animation-range: entry 0% entry 80%; }
.stagger-children > *:nth-child(2) { animation-range: entry 10% entry 90%; }
.stagger-children > *:nth-child(3) { animation-range: entry 20% entry 100%; }
```

### Parallax (CSS)

```css
/* Simple parallax via background-attachment */
.parallax-section {
  background-image: url('hero.jpg');
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 60vh;
}

/* Parallax via 3D transform (more performant) */
.parallax-container {
  perspective: 1px;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100vh;
}
.parallax-layer-back {
  transform: translateZ(-1px) scale(2);
}
.parallax-layer-front {
  transform: translateZ(0);
}
```

### Sticky Sections

```css
/* Sticky section header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

/* Sticky column in a two-column layout */
.sticky-column {
  position: sticky;
  top: 2rem;
  align-self: flex-start;
}
```

### Blueprint Representation

For entrance animations (Elementor native):

```json
{
  "type": "heading",
  "level": 2,
  "text": "Reveal on Scroll",
  "settings": {
    "_animation": "fadeInUp",
    "animation_duration": 1.0,
    "_animation_delay": 0.2,
    "_animation_offset": 0
  },
  "style": {
    "fontSize": "2.25rem",
    "color": "{colors.primary}"
  }
}
```

For sticky positioning:

```json
{
  "type": "section",
  "settings": {
    "sticky": "top",
    "sticky_on": ["desktop", "tablet"],
    "sticky_offset": 0
  },
  "style": {
    "css": "backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);",
    "background": "rgba(255, 255, 255, 0.95)",
    "zIndex": "100"
  }
}
```

### Notes for the Compiler

- **Entrance animations** (`_animation`, `animation_duration`, etc.) are flat
  settings on the element, NOT in the style object. They go in `settings`.
- **Sticky positioning** (`sticky`, `sticky_on`, `sticky_offset`) are also flat
  settings, not style props.
- **Motion Effects (Pro)** (`motion_fx_*`) are flat settings.
- The compiler currently does NOT emit any of these flat motion settings — this
  is a gap that needs to be filled.
- CSS `animation-timeline` is bleeding-edge (Chrome 115+) and goes through
  `custom_css`. Not recommended as primary implementation — use Elementor's
  native entrance animations instead.

---

## 6. Particle Effects & Canvas-Based Backgrounds

### Implementation Approaches

**Approach 1: External Library (particles.js / tsParticles)**

```html
<!-- Add via custom HTML widget or enqueue -->
<script src="https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js"></script>
<div id="tsparticles"></div>
<script>
  tsParticles.load("tsparticles", {
    particles: {
      number: { value: 80, density: { enable: true } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      move: { enable: true, speed: 2, direction: "none" },
      links: { enable: true, distance: 150, color: "#ffffff", opacity: 0.3 }
    },
    background: { color: "transparent" }
  });
</script>
```

**Approach 2: Pure CSS particle-like effects**

```css
/* Floating dots via box-shadow trick */
.particle-bg {
  width: 1px; height: 1px;
  box-shadow:
    20px 30px 0 #fff,
    80px 120px 0 #fff,
    150px 50px 0 #fff,
    200px 180px 0 #fff,
    300px 90px 0 #fff,
    /* ... many more points ... */;
  animation: float 30s linear infinite;
}

@keyframes float {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100px); }
}
```

**Approach 3: CSS gradient "particle" illusion**

```css
.gradient-particles {
  background:
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 50px 160px, #ddd, transparent),
    radial-gradient(2px 2px at 90px 40px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 130px 80px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

### Blueprint Representation

For the CSS gradient particle approach (no JS dependency):

```json
{
  "type": "section",
  "style": {
    "css": "background: radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.4), transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.3), transparent), radial-gradient(2px 2px at 90px 40px, rgba(255,255,255,0.5), transparent); background-repeat: repeat; background-size: 200px 200px;",
    "background": "{colors.primary}",
    "padding": { "top": "6rem", "bottom": "6rem" }
  }
}
```

For tsParticles (via raw HTML widget):

```json
{
  "type": "raw",
  "node": {
    "elType": "widget",
    "widgetType": "e-html",
    "settings": {
      "html": {
        "$$type": "html-v3",
        "value": {
          "content": { "$$type": "string", "value": "<div id=\"particles-js\" style=\"position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;\"></div><script src=\"https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js\"></script><script>tsParticles.load('particles-js',{particles:{number:{value:60},color:{value:'#ffffff'},opacity:{value:0.4},size:{value:2},move:{enable:true,speed:1},links:{enable:true,distance:120,color:'#ffffff',opacity:0.2}},background:{color:'transparent'}});<\/script>" },
          "children": []
        }
      }
    }
  }
}
```

### Notes for the Compiler

- Particle effects are best achieved via the `e-html` widget (raw node) for
  tsParticles, or via `custom_css` for CSS-only approaches.
- The `e-html` widget is not currently in the widget catalog — it should be
  added as a new widget type.
- For the CSS gradient approach, the `background` shorthand with multiple
  `radial-gradient()` values goes through `custom_css`.

---

## 7. 3D Transforms (Perspective, RotateY, Card Flip)

### CSS Properties

```css
/* 3D card container */
.card-3d {
  perspective: 1000px;
}

/* 3D card inner (the rotating element) */
.card-3d-inner {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

/* Hover rotation */
.card-3d:hover .card-3d-inner {
  transform: rotateY(15deg) rotateX(5deg);
}

/* Card flip (front/back) */
.flip-card {
  perspective: 1000px;
  width: 300px;
  height: 400px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
}

.flip-card-back {
  transform: rotateY(180deg);
}

/* Tilt on mouse move (JS required) */
.tilt-card {
  transition: transform 0.1s ease;
  transform-style: preserve-3d;
  will-change: transform;
}
```

### Blueprint Representation

```json
{
  "type": "section",
  "style": {
    "css": "perspective: 1000px;",
    "padding": { "top": "4rem", "bottom": "4rem" }
  },
  "children": [
    {
      "type": "section",
      "style": {
        "css": "transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); transform-style: preserve-3d;",
        "background": "{colors.surface}",
        "borderRadius": "{radius.lg}",
        "padding": { "top": "2rem", "right": "2rem", "bottom": "2rem", "left": "2rem" },
        "hover": {
          "css": "transform: rotateY(15deg) rotateX(5deg);"
        }
      },
      "children": [
        {
          "type": "heading",
          "level": 3,
          "text": "3D Card",
          "style": { "color": "{colors.text}" }
        }
      ]
    }
  ]
}
```

### Elementor's Native Transform Controls

Elementor has native transform settings stored as flat settings:

```json
{
  "settings": {
    "_transform_rotate_popover": "rotate",
    "_transform_rotateZ_effect": { "unit": "deg", "size": 45 },
    "_transform_rotate_3d": "yes",
    "_transform_rotateX_effect": { "unit": "deg", "size": 10 },
    "_transform_rotateY_effect": { "unit": "deg", "size": 10 },
    "_transform_scale_popover": "scale",
    "_transform_scale_effect": { "unit": "px", "size": 1.2 },
    "_transform_perspective_effect": { "unit": "px", "size": 0 },
    "_transform_transformOriginX": { "unit": "%", "size": 50 },
    "_transform_transformOriginY": { "unit": "%", "size": 50 }
  }
}
```

### Notes for the Compiler

- `perspective` goes through `custom_css` — not a native Elementor prop.
- `transform-style: preserve-3d` goes through `custom_css`.
- `backface-visibility: hidden` goes through `custom_css`.
- Elementor's native `_transform_*` settings are flat settings, not style props.
- For card flip, the front and back need to be separate child elements with
  `position: absolute` and `backface-visibility: hidden` — this requires
  careful layout via `custom_css`.

---

## 8. Modern Layout Patterns

### 8.1 Bento Grid

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 1.5rem;
}

.bento-item-tall {
  grid-row: span 2;
}

.bento-item-wide {
  grid-column: span 2;
}

.bento-item-full {
  grid-column: 1 / -1;
}
```

### Blueprint Representation

```json
{
  "type": "section",
  "style": {
    "padding": { "top": "4rem", "bottom": "4rem" }
  },
  "children": [
    {
      "type": "flex",
      "direction": "row",
      "style": {
        "gap": "1.5rem",
        "flexWrap": "wrap",
        "maxWidth": "1200px",
        "width": "100%",
        "margin": "0 auto",
        "mobile": { "flexDirection": "column" }
      },
      "children": [
        {
          "type": "section",
          "style": {
            "flex": "2 1 400px",
            "background": "{colors.surface}",
            "borderRadius": "{radius.lg}",
            "padding": { "top": "2rem", "right": "2rem", "bottom": "2rem", "left": "2rem" },
            "css": "min-height: 300px;"
          },
          "children": [
            { "type": "heading", "level": 3, "text": "Large Feature", "style": { "color": "{colors.text}" } }
          ]
        },
        {
          "type": "flex",
          "direction": "column",
          "style": {
            "flex": "1 1 200px",
            "gap": "1.5rem"
          },
          "children": [
            {
              "type": "section",
              "style": {
                "background": "{colors.surfaceAlt}",
                "borderRadius": "{radius.md}",
                "padding": { "top": "1.5rem", "right": "1.5rem", "bottom": "1.5rem", "left": "1.5rem" }
              },
              "children": [
                { "type": "heading", "level": 4, "text": "Small Card", "style": { "color": "{colors.text}" } }
              ]
            },
            {
              "type": "section",
              "style": {
                "background": "{colors.surfaceAlt}",
                "borderRadius": "{radius.md}",
                "padding": { "top": "1.5rem", "right": "1.5rem", "bottom": "1.5rem", "left": "1.5rem" }
              },
              "children": [
                { "type": "heading", "level": 4, "text": "Small Card", "style": { "color": "{colors.text}" } }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 8.2 Asymmetric Layouts

```css
.asymmetric-hero {
  display: grid;
  grid-template-columns: 55% 45%;
  align-items: center;
  min-height: 80vh;
}

/* Offset content */
.offset-content {
  margin-top: -4rem;
  margin-left: -2rem;
  position: relative;
  z-index: 2;
}

/* Diagonal section split */
.diagonal-split {
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
}
```

### Blueprint Representation

```json
{
  "type": "section",
  "style": {
    "css": "clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);",
    "background": "{colors.primary}",
    "padding": { "top": "6rem", "bottom": "8rem" }
  },
  "children": [
    {
      "type": "flex",
      "direction": "row",
      "style": {
        "gap": "2rem",
        "maxWidth": "1200px",
        "width": "100%",
        "margin": "0 auto",
        "mobile": { "flexDirection": "column" }
      },
      "children": [
        {
          "type": "flex",
          "direction": "column",
          "style": {
            "flex": "55%",
            "gap": "1.5rem"
          },
          "children": [
            { "type": "heading", "level": 1, "text": "Asymmetric Hero", "style": { "color": "#ffffff", "fontSize": "3rem" } }
          ]
        },
        {
          "type": "section",
          "style": {
            "flex": "45%",
            "css": "position: relative; z-index: 2; margin-top: -2rem;",
            "background": "{colors.accent}",
            "borderRadius": "{radius.lg}",
            "padding": { "top": "2rem", "right": "2rem", "bottom": "2rem", "left": "2rem" }
          },
          "children": [
            { "type": "text", "text": "Offset content panel", "style": { "color": "#ffffff" } }
          ]
        }
      ]
    }
  ]
}
```

### 8.3 Full-Bleed Sections

```css
.full-bleed {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  /* or use: */
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
```

### 8.4 Overlapping Elements

```css
.overlap-container {
  position: relative;
}
.overlap-back {
  position: relative;
  z-index: 1;
}
.overlap-front {
  position: relative;
  z-index: 2;
  margin-top: -4rem;
  margin-left: 2rem;
}
```

### Notes for the Compiler

- `clip-path` goes through `custom_css`.
- `grid-template-columns` goes through `custom_css` — the compiler uses flexbox
  for layout, not CSS Grid natively.
- For bento grids, use `flex` with `flexWrap: "wrap"` and `flex` values on
  children (e.g., `flex: "2 1 400px"`).
- `position: relative/absolute` goes through `custom_css`.
- Negative margins for overlapping go through `custom_css`.

---

## 9. Typography Trends

### 9.1 Variable Fonts

```css
/* Variable font with weight axis */
@font-face {
  font-family: 'Inter-Variable';
  src: url('Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
}

.variable-text {
  font-family: 'Inter-Variable', sans-serif;
  font-weight: 350; /* arbitrary weight between 100-900 */
  font-variation-settings: 'wght' 350, 'slnt' -5;
}

/* Optical sizing */
.variable-text {
  font-optical-sizing: auto;
}
```

### 9.2 Fluid Type (Clamp)

```css
/* Fluid typography using clamp() */
.fluid-h1 {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
  line-height: 1.1;
}

.fluid-h2 {
  font-size: clamp(1.5rem, 3vw + 0.5rem, 2.5rem);
}

.fluid-body {
  font-size: clamp(1rem, 1.5vw + 0.5rem, 1.25rem);
}
```

### 9.3 Large Hero Text

```css
.hero-display {
  font-size: clamp(3rem, 8vw + 1rem, 7rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

/* Text with gradient fill */
.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Text stroke */
.stroke-text {
  -webkit-text-stroke: 2px currentColor;
  color: transparent;
}
```

### 9.4 Eyebrow / Kicker Labels

```css
.eyebrow {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #e8743b;
  margin-bottom: 0.5rem;
}
```

### Blueprint Representation

```json
{
  "type": "heading",
  "level": 1,
  "text": "Large Display Heading",
  "style": {
    "fontSize": "clamp(3rem, 8vw + 1rem, 7rem)",
    "fontWeight": "800",
    "color": "{colors.primary}",
    "css": "line-height: 0.95; letter-spacing: -0.03em; text-wrap: balance;",
    "mobile": {
      "fontSize": "clamp(2rem, 8vw + 1rem, 3rem)"
    }
  }
}
```

For gradient text:

```json
{
  "type": "heading",
  "level": 2,
  "text": "Gradient Text Effect",
  "style": {
    "css": "background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
    "fontSize": "2.5rem",
    "fontWeight": "800"
  }
}
```

### Notes for the Compiler

- `clamp()` in `fontSize` goes through `custom_css` — the native `font-size`
  prop type expects a simple size value, not a CSS function.
- `-webkit-background-clip: text` and `-webkit-text-fill-color: transparent`
  go through `custom_css`.
- `text-wrap: balance` goes through `custom_css`.
- `letter-spacing` goes through `custom_css` (not a native prop).
- `line-height` goes through `custom_css`.
- Variable fonts require the font file to be loaded — this is a theme-level
  concern, not per-element.

---

## 10. Color Trends

### 10.1 Duotones

```css
.duotone-image {
  position: relative;
}
.duotone-image::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.8),
    rgba(118, 75, 162, 0.8)
  );
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

### 10.2 Vibrant Gradients

```css
/* Sunset */
.sunset-gradient {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Ocean */
.ocean-gradient {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* Forest */
.forest-gradient {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

/* Midnight */
.midnight-gradient {
  background: linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%);
}
```

### 10.3 Dark Mode

```css
/* CSS custom properties for theme switching */
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --surface: #f6f8fb;
  --border: #e3e8ef;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0f14;
    --text: #e8edf2;
    --surface: #121821;
    --border: #243042;
  }
}

/* Or with a class toggle */
.dark-mode {
  --bg: #0b0f14;
  --text: #e8edf2;
  --surface: #121821;
  --border: #243042;
}
```

### Blueprint Representation

For duotone overlay on an image:

```json
{
  "type": "section",
  "style": {
    "css": "position: relative; overflow: hidden;",
    "borderRadius": "{radius.lg}"
  },
  "children": [
    {
      "type": "image",
      "src": "https://example.com/photo.jpg",
      "alt": "Duotone image",
      "style": {
        "width": "100%",
        "css": "display: block;"
      }
    },
    {
      "type": "section",
      "style": {
        "css": "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(102,126,234,0.8), rgba(118,75,162,0.8)); mix-blend-mode: multiply; pointer-events: none;"
      }
    }
  ]
}
```

### Notes for the Compiler

- `mix-blend-mode` goes through `custom_css`.
- Dark mode requires either `@media (prefers-color-scheme: dark)` or a
  JavaScript class toggle — both are site-level concerns, not per-element.
- The `buildPalette` function in `design.ts` already generates dark mode colors
  when `scheme: "dark"` is passed.
- For dark mode support, the compiler should emit CSS custom properties or
  media query blocks in the site's global CSS.

---

## 11. Widget Combinations for Premium Builds

### 11.1 Hero Section (Premium)

**Widget stack:** `section` > `flex` (row) > `flex` (column) + `image`

```json
{
  "type": "section",
  "style": {
    "css": "position: relative; overflow: hidden;",
    "minHeight": "90vh",
    "padding": { "top": "2rem", "bottom": "2rem" }
  },
  "children": [
    {
      "type": "section",
      "style": {
        "css": "position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
      }
    },
    {
      "type": "flex",
      "direction": "row",
      "style": {
        "position": "relative",
        "zIndex": "1",
        "alignItems": "center",
        "gap": "3rem",
        "maxWidth": "1200px",
        "width": "100%",
        "margin": "0 auto",
        "mobile": { "flexDirection": "column" }
      },
      "children": [
        {
          "type": "flex",
          "direction": "column",
          "style": { "flex": "1 1 50%", "gap": "1.5rem" },
          "children": [
            {
              "type": "text",
              "text": "EYEBROW LABEL",
              "style": {
                "color": "rgba(255,255,255,0.7)",
                "fontSize": "0.75rem",
                "fontWeight": "600",
                "css": "text-transform: uppercase; letter-spacing: 0.15em;"
              }
            },
            {
              "type": "heading",
              "level": 1,
              "text": "Hero Title Goes Here",
              "style": {
                "color": "#ffffff",
                "fontSize": "clamp(2.5rem, 5vw + 1rem, 4rem)",
                "fontWeight": "800",
                "css": "line-height: 1.05; text-wrap: balance;"
              }
            },
            {
              "type": "text",
              "text": "Supporting description that explains the value proposition clearly.",
              "style": {
                "color": "rgba(255,255,255,0.8)",
                "fontSize": "1.125rem",
                "maxWidth": "55ch"
              }
            },
            {
              "type": "flex",
              "direction": "row",
              "style": { "gap": "1rem", "flexWrap": "wrap" },
              "children": [
                {
                  "type": "button",
                  "text": "Primary CTA",
                  "style": {
                    "color": "#ffffff",
                    "background": "{colors.accent}",
                    "fontWeight": "700",
                    "padding": { "top": "1rem", "right": "2.5rem", "bottom": "1rem", "left": "2.5rem" },
                    "borderRadius": "{radius.md}",
                    "css": "transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; border: none; cursor: pointer;",
                    "hover": { "css": "transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.2);" }
                  }
                },
                {
                  "type": "button",
                  "text": "Secondary",
                  "style": {
                    "color": "#ffffff",
                    "css": "background: transparent; border: 2px solid rgba(255,255,255,0.4); transition: border-color 0.3s ease;",
                    "fontWeight": "600",
                    "padding": { "top": "1rem", "right": "2.5rem", "bottom": "1rem", "left": "2.5rem" },
                    "borderRadius": "{radius.md}",
                    "hover": { "css": "border-color: rgba(255,255,255,0.8);" }
                  }
                }
              ]
            }
          ]
        },
        {
          "type": "section",
          "style": {
            "flex": "1 1 50%",
            "css": "background: rgba(255,255,255,0.1); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2);",
            "borderRadius": "{radius.lg}",
            "padding": { "top": "2rem", "right": "2rem", "bottom": "2rem", "left": "2rem" }
          },
          "children": [
            { "type": "image", "src": "https://example.com/hero-image.jpg", "alt": "Hero visual", "style": { "borderRadius": "{radius.md}", "width": "100%" } }
          ]
        }
      ]
    }
  ]
}
```

### 11.2 Feature Section with Bento Grid

**Widget stack:** `section` > `flex` (column) > `heading` + `flex` (row, wrap) > `section` cards

### 11.3 Testimonial Carousel

**Widget stack:** Use `raw` node with `reviews` classic Pro widget, or build
manually with `flex` > `section` cards with quote styling.

### 11.4 Pricing Table Row

**Widget stack:** `section` > `flex` (row) > `raw` nodes with `price-table` widgets

### 11.5 FAQ Accordion

**Widget stack:** `section` > `flex` (column) > `accordion` widget

### 11.6 CTA Band

**Widget stack:** `section` (full-width, accent bg) > `flex` (column, centered) >
`heading` + `text` + `button`

### 11.7 Footer

**Widget stack:** `section` (dark bg) > `flex` (row, wrap) > multiple `flex`
(column) children with `heading` + `icon-list` + `text`

### Premium Build Patterns Summary

| Section | Widgets Used | Key Design Elements |
|---------|-------------|-------------------|
| Hero | section, flex, heading, text, button, image | Glassmorphism card, gradient bg, eyebrow label, dual CTAs |
| Features | section, flex, section (cards), icon, heading, text | Bento grid, card hover lift, consistent radii |
| Stats | section, flex, heading, text | Large numbers, subtle dividers, counter animation |
| Testimonials | section, flex, section (cards), text, image | Quote styling, avatar circles, star ratings |
| Pricing | section, flex, raw (price-table) | Highlighted "popular" plan, feature lists |
| FAQ | section, flex, accordion | Clean accordion styling, smooth open/close |
| CTA | section, flex, heading, text, button | Full-width accent bg, strong contrast |
| Footer | section, flex, heading, icon-list, text, divider | Dark bg, multi-column, social icons |

---

## 12. Complete CSS Properties Reference

### Properties That Go Through custom_css (Not Native)

| CSS Property | Example Value | Notes |
|-------------|---------------|-------|
| `background` (complex) | `linear-gradient(135deg, #667eea, #764ba2)` | Simple gradients could be native, but multi-stop goes custom |
| `backdrop-filter` | `blur(12px) saturate(180%)` | No native Elementor prop |
| `-webkit-backdrop-filter` | `blur(12px) saturate(180%)` | Safari prefix |
| `box-shadow` (multi) | `9px 9px 16px rgba(0,0,0,0.1), -9px -9px 16px rgba(255,255,255,0.8)` | Native supports single shadow only |
| `transform` | `translateY(-3px) rotateY(15deg)` | Native via `_transform_*` settings, but complex goes custom |
| `transition` | `transform 0.3s cubic-bezier(0.34,1.56,0.64,1)` | No native prop |
| `clip-path` | `polygon(0 0, 100% 0, 100% 85%, 0 100%)` | No native prop |
| `mix-blend-mode` | `multiply` | No native prop |
| `perspective` | `1000px` | No native prop |
| `transform-style` | `preserve-3d` | No native prop |
| `backface-visibility` | `hidden` | No native prop |
| `-webkit-background-clip` | `text` | For gradient text |
| `-webkit-text-fill-color` | `transparent` | For gradient text |
| `text-wrap` | `balance` | No native prop |
| `line-height` | `1.1` | No native prop |
| `letter-spacing` | `-0.03em` | No native prop |
| `text-transform` | `uppercase` | No native prop |
| `position` | `relative`, `absolute`, `sticky` | No native prop |
| `z-index` | `10` | No native prop |
| `margin` (negative) | `-2rem` | No native prop |
| `min-height` | `90vh` | No native prop |
| `animation` | `gradient-shift 15s ease infinite` | No native prop |
| `@keyframes` | `@keyframes gradient-shift { ... }` | Must be in global CSS |
| `background-size` | `400% 400%` | No native prop |
| `background-attachment` | `fixed` | For parallax |
| `font-optical-sizing` | `auto` | Variable fonts |
| `font-variation-settings` | `'wght' 350` | Variable fonts |
| `will-change` | `transform` | Performance hint |

### Properties That ARE Native Elementor Props

| CSS Property | Blueprint Key | $$type | Notes |
|-------------|--------------|--------|-------|
| `font-size` | `fontSize` | `size` | Supports rem, px, em, % |
| `gap` | `gap` | `size` | Flexbox gap |
| `width` | `width` | `size` | |
| `max-width` | `maxWidth` | `size` | |
| `display` | `display` | `string` | |
| `flex-direction` | `flexDirection` | `string` | |
| `flex-wrap` | `flexWrap` | `string` | |
| `text-align` | `textAlign` | `string` | |
| `font-weight` | `fontWeight` | `string` | |
| `padding` | `padding` | `dimensions` | Logical properties |
| `color` | `color` | `color` | |
| `border-radius` | `borderRadius` | `border-radius` | Logical corners |
| `align-items` | `alignItems` | `string` | Uses box-alignment keywords |
| `justify-content` | `justifyContent` | `string` | Uses box-alignment keywords |

### Flat Settings (Not Style Props, Go in `settings`)

| Setting Key | Value Type | Purpose |
|------------|-----------|---------|
| `_animation` | string | Entrance animation name |
| `animation_duration` | number | Duration in seconds |
| `_animation_delay` | number | Delay in seconds |
| `_animation_offset` | number | Trigger offset in % |
| `_hover_animation` | string | CSS hover animation |
| `sticky` | string | `"top"` or `"bottom"` |
| `sticky_on` | string[] | Devices: `["desktop", "tablet"]` |
| `sticky_offset` | number | Pixels |
| `sticky_effects_offset` | number | Pixels |
| `motion_fx_motion_fx_scrolling` | string | `"yes"` to enable scroll effects |
| `motion_fx_motion_fx_mouse` | string | `"yes"` to enable mouse effects |
| `motion_fx_translateY_effect` | string | `"yes"` |
| `motion_fx_translateY_direction` | string | `"up"`, `"down"`, `"alternate"` |
| `motion_fx_translateY_speed` | object | `{ unit: "px", size: number }` |
| `motion_fx_translateY_affectedRange` | object | `{ unit: "%", sizes: { start, end } }` |
| `motion_fx_opacity_effect` | string | `"yes"` |
| `motion_fx_opacity_direction` | string | `"in"`, `"out"`, `"alternate"` |
| `motion_fx_opacity_level` | object | `{ unit: "px", size: 0-10 }` |
| `motion_fx_blur_effect` | string | `"yes"` |
| `motion_fx_blur_direction` | string | `"in"`, `"out"`, `"alternate"` |
| `motion_fx_blur_level` | object | `{ unit: "px", size: 0-10 }` |
| `motion_fx_rotateZ_effect` | string | `"yes"` |
| `motion_fx_rotateZ_direction` | string | `"clockwise"`, `"counter-clockwise"`, `"alternate"` |
| `motion_fx_rotateZ_speed` | object | `{ unit: "px", size: number }` |
| `motion_fx_scale_effect` | string | `"yes"` |
| `motion_fx_scale_direction` | string | `"grow"`, `"shrink"`, `"alternate"` |
| `motion_fx_scale_speed` | object | `{ unit: "px", size: number }` |
| `motion_fx_mouseTrack_effect` | string | `"yes"` |
| `motion_fx_mouseTrack_direction` | string | `"direct"`, `"opposite"` |
| `motion_fx_mouseTrack_speed` | object | `{ unit: "px", size: number }` |
| `motion_fx_tilt_effect` | string | `"yes"` |
| `motion_fx_tilt_direction` | string | `"direct"`, `"opposite"`, `"alternate"` |
| `motion_fx_tilt_speed` | object | `{ unit: "px", size: number }` |
| `motion_fx_transformOriginX` | object | `{ unit: "%", size: 0-100 }` |
| `motion_fx_transformOriginY` | object | `{ unit: "%", size: 0-100 }` |
| `motion_fx_devices` | string[] | `["desktop", "tablet", "mobile"]` |
| `_transform_rotateZ_effect` | object | `{ unit: "deg", size: number }` |
| `_transform_rotateX_effect` | object | `{ unit: "deg", size: number }` |
| `_transform_rotateY_effect` | object | `{ unit: "deg", size: number }` |
| `_transform_scale_effect` | object | `{ unit: "px", size: number }` |
| `_transform_skewX_effect` | object | `{ unit: "deg", size: number }` |
| `_transform_skewY_effect` | object | `{ unit: "deg", size: number }` |
| `_transform_translateX_effect` | object | `{ unit: "px", size: number }` |
| `_transform_translateY_effect` | object | `{ unit: "px", size: number }` |
| `_transform_perspective_effect` | object | `{ unit: "px", size: number }` |
| `_transform_transformOriginX` | object | `{ unit: "%", size: 0-100 }` |
| `_transform_transformOriginY` | object | `{ unit: "%", size: 0-100 }` |

---

## Summary of Gaps in the Current Compiler

Based on this research, the Elementor MCP compiler at
`/home/smecham2000/ai-control-tower/projects/elementor_mcp/` has these gaps
for modern design patterns:

1. **No flat motion/transform settings** — `_animation`, `sticky`, `motion_fx_*`,
   `_transform_*` settings are not emitted. These are flat settings on the
   element, not style props.

2. **No `e-html` widget** — needed for embedding custom HTML/JS (particles,
   custom scripts). Not in the widget catalog.

3. **Limited native props** — `line-height`, `letter-spacing`, `text-transform`,
   `opacity`, `min-height`, `height`, `margin`, `background-color`, `border`,
   `border-width`, `box-shadow` (single) could all be native typed props but
   currently go through `custom_css`.

4. **No `@keyframes` injection** — animated gradients and skeleton loading
   require `@keyframes` rules that can't be emitted per-element.

5. **No interactions array support** — the new v4 Interactions system
   (`interactions` array on elements) is not implemented.

6. **No background prop types** — Elementor has native `background`,
   `background-overlay`, `background-gradient-overlay` prop types that could
   handle simple gradients natively instead of custom_css.

7. **No CSS custom properties** — for dark mode and theme token injection at
   the site level.

8. **No `settings` passthrough** — the compiler doesn't have a way to pass
   flat settings (like `_animation`, `sticky`) through the blueprint format
   easily. Currently `settings` is only used internally.
