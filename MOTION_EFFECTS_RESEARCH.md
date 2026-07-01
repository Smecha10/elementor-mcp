# Elementor Motion Effects & Interactions — Deep Research

## Overview

This document covers the complete motion effects and interaction system in Elementor (both Free and Pro), how settings are stored in the JSON data structure, and how to expose these as MCP tool parameters in the Elementor MCP compiler.

---

## 1. Entrance Animations

### 1.1 Available Animations (from Elementor Core)

Elementor's `Control_Animation` class (`includes/controls/animation.php`) defines these entrance animation categories:

**Fading:**
- `fadeIn`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `fadeInUp`

**Zooming:**
- `zoomIn`, `zoomInDown`, `zoomInLeft`, `zoomInRight`, `zoomInUp`

**Bouncing:**
- `bounceIn`, `bounceInDown`, `bounceInLeft`, `bounceInRight`, `bounceInUp`

**Sliding:**
- `slideInDown`, `slideInLeft`, `slideInRight`, `slideInUp`

**Rotating:**
- `rotateIn`, `rotateInDownLeft`, `rotateInDownRight`, `rotateInUpLeft`, `rotateInUpRight`

**Attention Seekers:**
- `bounce`, `flash`, `pulse`, `rubberBand`, `shake`, `headShake`, `swing`, `tada`, `wobble`, `jello`

**Light Speed:**
- `lightSpeedIn`

**Specials:**
- `rollIn`

### 1.2 Exit Animations (from Control_Exit_Animation)

Exit animations mirror entrance animations but with "Out" semantics:
- `fadeIn` → Fade Out, `fadeInDown` → Fade Out Up, etc.
- `zoomIn` → Zoom Out, etc.
- `slideInDown` → Slide Out Up, etc.
- `rotateIn` → Rotate Out, etc.
- `lightSpeedIn` → Light Speed Out
- `rollIn` → Roll Out

### 1.3 Hover Animations (from Control_Hover_Animation)

CSS-based hover animations (using `e-animation-*` CSS classes):
- `grow`, `shrink`, `pulse`, `pulse-grow`, `pulse-shrink`, `push`, `pop`
- `bounce-in`, `bounce-out`, `rotate`, `grow-rotate`, `float`, `sink`
- `bob`, `hang`, `skew`, `skew-forward`, `skew-backward`
- `wobble-vertical`, `wobble-horizontal`, `wobble-to-bottom-right`, `wobble-to-top-right`
- `wobble-top`, `wobble-bottom`, `wobble-skew`
- `buzz`, `buzz-out`

### 1.4 How Entrance Animations Are Stored in JSON

Entrance animations are stored as **flat settings** on the element's `settings` object (NOT in the `styles` system):

```json
{
  "_animation": "fadeInUp",
  "animation_duration": 1.0,
  "_animation_delay": 0,
  "_animation_offset": 0
}
```

Key settings:
- `_animation` (string) — The entrance animation name (e.g., `"fadeInUp"`, `"zoomIn"`, `"none"`)
- `animation_duration` (number) — Duration in seconds (e.g., `1.0`, `0.5`, `2.0`)
- `_animation_delay` (number) — Delay in seconds (e.g., `0`, `0.5`, `1.0`)
- `_animation_offset` (number) — Offset in % for when the animation triggers (e.g., `0`, `25`, `50`)

For exit animations:
- `_animation` (string) — The exit animation name
- `animation_duration` (number) — Duration in seconds

For hover animations:
- `_hover_animation` (string) — The hover animation name (e.g., `"grow"`, `"shrink"`)

### 1.5 CSS Implementation

Entrance animations are CSS-based. Elementor registers CSS classes like `e-animation-fadeInUp` that contain the `@keyframes` and `animation-*` properties. The JavaScript only handles the scroll-triggering (adding the class when the element scrolls into view).

---

## 2. Scroll Effects (Elementor Pro Motion Effects)

### 2.1 Overview

Scroll effects are part of Elementor Pro's Motion Effects module. They are stored as **flat settings** on the element's `settings` object with the `motion_fx_*` prefix.

### 2.2 Enabling Scrolling Effects

```json
{
  "motion_fx_motion_fx_scrolling": "yes"
}
```

This is the master switch. Without it, no scrolling effects apply.

### 2.3 Individual Scroll Effects

Each effect has a consistent pattern:
- `motion_fx_{effect}_effect` — `"yes"` to enable
- `motion_fx_{effect}_direction` — Direction of movement
- `motion_fx_{effect}_speed` — Speed `{ unit: "px", size: number }`
- `motion_fx_{effect}_affectedRange` — Viewport range `{ unit: "%", sizes: { start: 0, end: 100 } }`
- `motion_fx_{effect}_levels` — Some effects use levels instead of speed

#### Vertical Scroll (translateY)
```json
{
  "motion_fx_translateY_effect": "yes",
  "motion_fx_translateY_direction": "alternate",
  "motion_fx_translateY_speed": { "unit": "px", "size": 4 },
  "motion_fx_translateY_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } }
}
```
Direction values: `"alternate"` (up+down), `"up"`, `"down"`

#### Horizontal Scroll (translateX)
```json
{
  "motion_fx_translateX_effect": "yes",
  "motion_fx_translateX_direction": "alternate",
  "motion_fx_translateX_speed": { "unit": "px", "size": 4 },
  "motion_fx_translateX_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } }
}
```
Direction values: `"alternate"` (left+right), `"left"`, `"right"`

#### Transparency (opacity)
```json
{
  "motion_fx_opacity_effect": "yes",
  "motion_fx_opacity_direction": "in",
  "motion_fx_opacity_level": { "unit": "px", "size": 10 },
  "motion_fx_opacity_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } }
}
```
Direction values: `"in"` (fade in), `"out"` (fade out), `"alternate"` (in+out)
Level: 0-10 scale

#### Blur
```json
{
  "motion_fx_blur_effect": "yes",
  "motion_fx_blur_direction": "in",
  "motion_fx_blur_level": { "unit": "px", "size": 7 },
  "motion_fx_blur_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } }
}
```
Direction values: `"in"` (blur in), `"out"` (blur out), `"alternate"` (in+out)
Level: 0-10 scale

#### Rotate (rotateZ)
```json
{
  "motion_fx_rotateZ_effect": "yes",
  "motion_fx_rotateZ_direction": "alternate",
  "motion_fx_rotateZ_speed": { "unit": "px", "size": 3 },
  "motion_fx_rotateZ_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } }
}
```
Direction values: `"alternate"`, `"clockwise"`, `"counter-clockwise"`

#### Scale
```json
{
  "motion_fx_scale_effect": "yes",
  "motion_fx_scale_direction": "alternate",
  "motion_fx_scale_speed": { "unit": "px", "size": 4 },
  "motion_fx_scale_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } }
}
```
Direction values: `"alternate"` (grow+shrink), `"grow"`, `"shrink"`

### 2.4 Anchor Point (for Rotate and Scale)

```json
{
  "motion_fx_motion_fx_scrolling": "yes",
  "motion_fx_transformOriginX": { "unit": "%", "size": 50 },
  "motion_fx_transformOriginY": { "unit": "%", "size": 50 }
}
```
Values: `{ "unit": "%", "size": 0-100 }` — 0=left/top, 50=center, 100=right/bottom

### 2.5 Apply Effects On (Responsive)

```json
{
  "motion_fx_motion_fx_scrolling": "yes",
  "motion_fx_devices": ["desktop", "tablet", "mobile"]
}
```

### 2.6 Complete Scrolling Effects Settings Object

```json
{
  "motion_fx_motion_fx_scrolling": "yes",
  "motion_fx_translateY_effect": "yes",
  "motion_fx_translateY_direction": "alternate",
  "motion_fx_translateY_speed": { "unit": "px", "size": 4 },
  "motion_fx_translateY_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } },
  "motion_fx_translateX_effect": "yes",
  "motion_fx_translateX_direction": "alternate",
  "motion_fx_translateX_speed": { "unit": "px", "size": 2 },
  "motion_fx_translateX_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } },
  "motion_fx_opacity_effect": "yes",
  "motion_fx_opacity_direction": "in",
  "motion_fx_opacity_level": { "unit": "px", "size": 10 },
  "motion_fx_opacity_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } },
  "motion_fx_blur_effect": "yes",
  "motion_fx_blur_direction": "in",
  "motion_fx_blur_level": { "unit": "px", "size": 7 },
  "motion_fx_blur_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } },
  "motion_fx_rotateZ_effect": "yes",
  "motion_fx_rotateZ_direction": "alternate",
  "motion_fx_rotateZ_speed": { "unit": "px", "size": 3 },
  "motion_fx_rotateZ_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } },
  "motion_fx_scale_effect": "yes",
  "motion_fx_scale_direction": "alternate",
  "motion_fx_scale_speed": { "unit": "px", "size": 4 },
  "motion_fx_scale_affectedRange": { "unit": "%", "sizes": { "start": 0, "end": 100 } },
  "motion_fx_transformOriginX": { "unit": "%", "size": 50 },
  "motion_fx_transformOriginY": { "unit": "%", "size": 50 },
  "motion_fx_devices": ["desktop", "tablet"]
}
```

---

## 3. Mouse Effects (Elementor Pro)

### 3.1 Enabling Mouse Effects

```json
{
  "motion_fx_motion_fx_mouse": "yes"
}
```

### 3.2 Mouse Track Effect

The element moves relative to the mouse cursor position:

```json
{
  "motion_fx_motion_fx_mouse": "yes",
  "motion_fx_mouseTrack_effect": "yes",
  "motion_fx_mouseTrack_direction": "opposite",
  "motion_fx_mouseTrack_speed": { "unit": "px", "size": 2 }
}
```
Direction values: `"opposite"` (moves opposite to cursor), `"direct"` (moves with cursor)
Speed: 1-10 scale

### 3.3 Tilt Effect

The element tilts based on mouse position (3D perspective effect):

```json
{
  "motion_fx_motion_fx_mouse": "yes",
  "motion_fx_tilt_effect": "yes",
  "motion_fx_tilt_direction": "alternate",
  "motion_fx_tilt_speed": { "unit": "px", "size": 4 }
}
```
Direction values: `"alternate"`, `"direct"`, `"opposite"`
Speed: 1-10 scale

### 3.4 Complete Mouse Effects Settings Object

```json
{
  "motion_fx_motion_fx_mouse": "yes",
  "motion_fx_mouseTrack_effect": "yes",
  "motion_fx_mouseTrack_direction": "opposite",
  "motion_fx_mouseTrack_speed": { "unit": "px", "size": 2 },
  "motion_fx_tilt_effect": "yes",
  "motion_fx_tilt_direction": "alternate",
  "motion_fx_tilt_speed": { "unit": "px", "size": 4 }
}
```

---

## 4. Sticky Positioning (Elementor Pro)

Sticky positioning is part of the Motion Effects section but uses different settings:

```json
{
  "sticky": "top",
  "sticky_on": ["desktop", "tablet"],
  "sticky_offset": 0,
  "sticky_parent": "body",
  "sticky_effects_offset": 0
}
```

- `sticky` (string) — `"top"`, `"bottom"`, or empty for none
- `sticky_on` (string[]) — Devices: `["desktop"]`, `["desktop", "tablet"]`, `["desktop", "tablet", "mobile"]`
- `sticky_offset` (number) — Offset in pixels from top/bottom
- `sticky_parent` (string) — CSS selector for the sticky parent column
- `sticky_effects_offset` (number) — Offset for triggering effects while sticky

---

## 5. Transform Controls

Elementor's transform controls (rotate, scale, skew, translate) are stored in the element's settings:

```json
{
  "_transform_rotate_popover": "rotate",
  "_transform_rotateZ_effect": { "unit": "deg", "size": 45 },
  "_transform_rotate_3d": "yes",
  "_transform_rotateX_effect": { "unit": "deg", "size": 10 },
  "_transform_rotateY_effect": { "unit": "deg", "size": 10 },
  "_transform_scale_popover": "scale",
  "_transform_scale_effect": { "unit": "px", "size": 1.2 },
  "_transform_scaleX_effect": { "unit": "px", "size": 1.0 },
  "_transform_scaleY_effect": { "unit": "px", "size": 1.0 },
  "_transform_skew_popover": "skew",
  "_transform_skewX_effect": { "unit": "deg", "size": 0 },
  "_transform_skewY_effect": { "unit": "deg", "size": 0 },
  "_transform_translate_popover": "translate",
  "_transform_translateX_effect": { "unit": "px", "size": 0 },
  "_transform_translateY_effect": { "unit": "px", "size": 0 },
  "_transform_translateZ_effect": { "unit": "px", "size": 0 },
  "_transform_perspective_effect": { "unit": "px", "size": 0 }
}
```

Transform origin:
```json
{
  "_transform_transformOriginX": { "unit": "%", "size": 50 },
  "_transform_transformOriginY": { "unit": "%", "size": 50 }
}
```

---

## 6. Animation Timing

### 6.1 Entrance Animation Timing

```json
{
  "_animation": "fadeInUp",
  "animation_duration": 1.0,
  "_animation_delay": 0.5,
  "_animation_offset": 0
}
```

- `animation_duration` — Seconds (0.1 to 5.0, default 1.0)
- `_animation_delay` — Seconds (0 to 5.0, default 0)
- `_animation_offset` — Percentage (0 to 100, default 0) — how far into the viewport before triggering

### 6.2 CSS Easing Curves

Elementor uses standard CSS easing functions for animations:
- `ease` (default)
- `ease-in`
- `ease-out`
- `ease-in-out`
- `linear`
- Custom cubic-bezier: `cubic-bezier(0.25, 0.1, 0.25, 1.0)`

For the new Interactions system (v4 atomic), easing options from `Presets.php`:
- Base: `easeIn`
- Additional (Pro): `easeOut`, `easeInOut`, `backIn`, `backInOut`, `backOut`, `linear`

---

## 7. CSS-Based vs JS-Based Animation Approaches

### 7.1 CSS-Based Animations

**Entrance animations** — Pure CSS. Elementor generates CSS classes with `@keyframes` and `animation-*` properties. JavaScript only adds/removes the class based on scroll position.

**Hover animations** — Pure CSS. Uses `e-animation-*` classes with `:hover` pseudo-class.

**Transform controls** — CSS `transform` property applied via inline styles or CSS classes.

### 7.2 JS-Based Animations

**Scroll effects (Motion Effects Pro)** — JavaScript-based. Elementor uses the `motion.js` library (v11.13.5) to calculate and apply CSS transforms, opacity, and blur in real-time based on scroll position. The JS reads the `motion_fx_*` settings and applies them via `requestAnimationFrame`.

**Mouse effects** — JavaScript-based. Same `motion.js` library tracks mouse position and applies transforms.

**Interactions system (v4 atomic)** — JavaScript-based. Uses the `motion.js` library with the new Interactions module. The `interactions` array on each element node defines trigger-action pairs that are processed by the frontend JS.

### 7.3 The New Interactions System (v4 Atomic)

The Interactions module (`modules/interactions/`) is a newer, more powerful system that replaces the legacy Motion Effects. It uses the `interactions` array on each element node:

```json
{
  "interactions": [
    {
      "interaction_id": "abc123",
      "trigger": "scrollIn",
      "animation": {
        "effect": "fade",
        "type": "in",
        "direction": "",
        "timing_config": {
          "duration": { "unit": "ms", "size": 600 },
          "delay": { "unit": "ms", "size": 0 }
        },
        "config": {
          "easing": "easeIn",
          "relativeTo": "viewport",
          "repeat": "",
          "start": { "unit": "%", "size": 85 },
          "end": { "unit": "%", "size": 15 }
        }
      },
      "breakpoints": {
        "excluded": []
      }
    }
  ]
}
```

**Trigger types** (from `Presets.php`):
- Base (free): `load`, `scrollIn`
- Additional (Pro): `scrollOut`, `scrollOn`, `hover`, `click`

**Effect types** (from `Presets.php`):
- Base (free): `fade`, `slide`, `scale`
- Additional (Pro): `custom`

**Type values**: `in`, `out`

**Direction values**: `left`, `right`, `top`, `bottom`, `top-left`, `top-right`, `bottom-left`, `bottom-right`, `""` (empty = no direction)

**Easing options**:
- Base: `easeIn`
- Pro: `easeOut`, `easeInOut`, `backIn`, `backInOut`, `backOut`, `linear`

**Repeat options**: `loop`, `times`, `""` (no repeat)

**Config defaults** (from `Presets.php`):
- `defaultDuration`: 600ms
- `defaultDelay`: 0ms
- `slideDistance`: 100px
- `scaleStart`: 0
- `defaultEasing`: `easeIn`
- `relativeTo`: `viewport`
- `start`: 85%
- `end`: 15%

---

## 8. How Elementor Stores Motion Settings in JSON

### 8.1 Legacy Motion Effects (Pro) — Flat Settings on Element

All legacy motion effects are stored as **flat key-value pairs** directly in the element's `settings` object. They are NOT wrapped in `$$type` typed values — they use plain values (strings, numbers, objects).

```json
{
  "id": "abc12345",
  "settings": {
    "_animation": "fadeInUp",
    "animation_duration": 1.0,
    "_animation_delay": 0,
    "_hover_animation": "grow",
    "motion_fx_motion_fx_scrolling": "yes",
    "motion_fx_translateY_effect": "yes",
    "motion_fx_translateY_direction": "alternate",
    "motion_fx_translateY_speed": { "unit": "px", "size": 4 },
    "motion_fx_motion_fx_mouse": "yes",
    "motion_fx_mouseTrack_effect": "yes",
    "motion_fx_mouseTrack_direction": "opposite",
    "sticky": "top",
    "sticky_on": ["desktop", "tablet"],
    "sticky_offset": 0
  },
  "elements": [],
  "isInner": false,
  "elType": "widget",
  "widgetType": "e-heading",
  "styles": {},
  "interactions": [],
  "editor_settings": { "title": "Heading" },
  "version": "0.0"
}
```

### 8.2 New Interactions System (v4 Atomic) — Structured Array

The new interactions system stores data in the `interactions` array at the element level. Each interaction is a structured object with `interaction_id`, `trigger`, `animation`, and `breakpoints`.

```json
{
  "id": "abc12345",
  "settings": { ... },
  "elements": [],
  "isInner": false,
  "elType": "widget",
  "widgetType": "e-heading",
  "styles": {},
  "interactions": [
    {
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
      "breakpoints": {
        "excluded": []
      }
    }
  ],
  "editor_settings": { "title": "Heading" },
  "version": "0.0"
}
```

### 8.3 Key Difference: Legacy vs New System

| Aspect | Legacy Motion Effects (Pro) | New Interactions (v4 Atomic) |
|--------|---------------------------|------------------------------|
| Storage location | `settings` (flat keys) | `interactions` array |
| Value wrapping | Plain values | `$$type` typed values |
| Trigger types | Implicit (scroll/mouse) | Explicit (`scrollIn`, `hover`, `click`, etc.) |
| Animation types | translate, opacity, blur, rotate, scale | `fade`, `slide`, `scale`, `custom` |
| Timing | Speed/level values | Duration/delay with easing |
| Responsive | `motion_fx_devices` array | `breakpoints.excluded` array |
| CSS vs JS | JS-based (motion.js) | JS-based (motion.js) |
| Pro requirement | Pro only | Free: basic triggers/effects; Pro: advanced |

---

## 9. Elementor's Interaction System

### 9.1 Interaction Schema (from `interactions-schema.php`)

The interactions schema defines the structure of each interaction item:

```php
[
  'interaction_id' => string,    // Unique ID for the interaction
  'trigger'        => string,    // One of: load, scrollIn, scrollOut, scrollOn, hover, click
  'animation'      => object,    // Animation_Preset_Prop_Type
  'breakpoints'    => object,    // Interaction_Breakpoints_Prop_Type
]
```

### 9.2 Animation Preset Structure

```php
[
  'effect'        => string,  // fade, slide, scale, custom
  'type'          => string,  // in, out
  'direction'     => string,  // left, right, top, bottom, top-left, etc.
  'timing_config' => object,  // { duration: time-size, delay: time-size }
  'config'        => object,  // { easing, relativeTo, repeat, times, start, end }
  'custom_effect' => object,  // Pro only: { keyframes: [...] }
]
```

### 9.3 Custom Effect (Pro)

The custom effect allows defining keyframe-based animations:

```json
{
  "custom_effect": {
    "keyframes": [
      {
        "stop": 0,
        "settings": {
          "transform": {
            "translateX": { "unit": "px", "size": 0 },
            "translateY": { "unit": "px", "size": 0 },
            "rotate": { "unit": "deg", "size": 0 },
            "scale": { "unit": "px", "size": 1 }
          },
          "opacity": 1,
          "blur": { "unit": "px", "size": 0 }
        }
      },
      {
        "stop": 100,
        "settings": {
          "transform": {
            "translateX": { "unit": "px", "size": 100 },
            "translateY": { "unit": "px", "size": 50 },
            "rotate": { "unit": "deg", "size": 360 },
            "scale": { "unit": "px", "size": 1.5 }
          },
          "opacity": 0.5,
          "blur": { "unit": "px", "size": 5 }
        }
      }
    ]
  }
}
```

### 9.4 Hover Effects (Legacy)

Hover effects in the legacy system are stored as:
- `_hover_animation` (string) — CSS hover animation class name
- Hover styles in the `styles` system with `state: "hover"` in the variant meta

### 9.5 Click Interactions

Click interactions are only available in the new Interactions system (Pro):
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
    "config": {
      "easing": "easeOut",
      "repeat": ""
    }
  }
}
```

### 9.6 Conditional Display Logic

Elementor's conditional display (show/hide based on conditions) is stored in `settings`:

```json
{
  "settings": {
    "_element_id": "my-element",
    "_css_classes": "custom-class",
    "_hidden": "",
    "_conditions": [
      { "type": "include", "name": "user_roles", "sub": "administrator" },
      { "type": "exclude", "name": "post_type", "sub": "post" }
    ]
  }
}
```

### 9.7 Dynamic Content Binding

Dynamic content tags are stored in `__dynamic__` within settings:

```json
{
  "settings": {
    "title": { "$$type": "html-v3", "value": { "content": { "$$type": "string", "value": "Default Title" }, "children": [] } },
    "__dynamic__": {
      "title": "{{ elementor-dynamic-tag name=\"post-title\" }}"
    }
  }
}
```

---

## 10. Modern CSS Animation Patterns

### 10.1 CSS Scroll-Driven Animations (Standard)

Modern browsers support the CSS Scroll-Driven Animations API:
- `scroll-timeline` / `view-timeline`
- `animation-timeline: scroll()` / `animation-timeline: view()`
- `animation-range: entry 0% entry 100%`

Elementor does NOT currently use these native APIs. It uses JavaScript (motion.js) for scroll-based effects. However, the new Interactions system could potentially leverage these in the future.

### 10.2 View Timeline API

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

.element {
  animation: fade-in linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

### 10.3 Elementor's Approach

Elementor uses the `motion.js` library (v11.13.5) for all scroll-based and mouse-based effects. This library:
- Calculates progress based on scroll position relative to viewport
- Applies CSS transforms, opacity, and blur via inline styles
- Handles direction, speed, and affected range
- Provides easing functions
- Supports responsive breakpoints

---

## 11. How to Expose as MCP Tool Parameters

### 11.1 Blueprint Node Extension

Add a `motion` field to the `BlueprintNode` interface:

```typescript
export interface BlueprintNode {
  // ... existing fields ...
  
  // Motion effects
  motion?: {
    // Entrance animation
    entranceAnimation?: string;       // e.g., "fadeInUp", "zoomIn", "none"
    entranceDuration?: number;        // seconds, 0.1-5.0
    entranceDelay?: number;           // seconds, 0-5.0
    entranceOffset?: number;          // percentage, 0-100
    
    // Hover animation
    hoverAnimation?: string;          // e.g., "grow", "shrink", "pulse"
    
    // Scroll effects (Pro)
    scrollEffects?: {
      enabled: boolean;
      verticalScroll?: ScrollEffectConfig;
      horizontalScroll?: ScrollEffectConfig;
      transparency?: ScrollOpacityConfig;
      blur?: ScrollBlurConfig;
      rotate?: ScrollRotateConfig;
      scale?: ScrollScaleConfig;
      transformOrigin?: { x: number; y: number };  // 0-100%
      devices?: string[];             // ["desktop", "tablet", "mobile"]
    };
    
    // Mouse effects (Pro)
    mouseEffects?: {
      enabled: boolean;
      mouseTrack?: MouseTrackConfig;
      tilt?: TiltConfig;
    };
    
    // Sticky (Pro)
    sticky?: StickyConfig;
    
    // Transform controls
    transform?: TransformConfig;
    
    // Interactions (v4 atomic)
    interactions?: InteractionItem[];
  };
}
```

### 11.2 Sub-Config Types

```typescript
interface ScrollEffectConfig {
  enabled: boolean;
  direction: "up" | "down" | "alternate";
  speed: number;  // 1-10
  affectedRange?: { start: number; end: number };  // 0-100%
}

interface ScrollOpacityConfig {
  enabled: boolean;
  direction: "in" | "out" | "alternate";
  level: number;  // 0-10
  affectedRange?: { start: number; end: number };
}

interface ScrollBlurConfig {
  enabled: boolean;
  direction: "in" | "out" | "alternate";
  level: number;  // 0-10
  affectedRange?: { start: number; end: number };
}

interface ScrollRotateConfig {
  enabled: boolean;
  direction: "clockwise" | "counter-clockwise" | "alternate";
  speed: number;  // 1-10
  affectedRange?: { start: number; end: number };
}

interface ScrollScaleConfig {
  enabled: boolean;
  direction: "grow" | "shrink" | "alternate";
  speed: number;  // 1-10
  affectedRange?: { start: number; end: number };
}

interface MouseTrackConfig {
  enabled: boolean;
  direction: "direct" | "opposite";
  speed: number;  // 1-10
}

interface TiltConfig {
  enabled: boolean;
  direction: "direct" | "opposite" | "alternate";
  speed: number;  // 1-10
}

interface StickyConfig {
  position: "top" | "bottom";
  on: string[];  // ["desktop", "tablet", "mobile"]
  offset?: number;
  effectsOffset?: number;
}

interface TransformConfig {
  rotate?: {
    z?: number;   // degrees
    x?: number;   // degrees (3D)
    y?: number;   // degrees (3D)
  };
  scale?: {
    x?: number;   // multiplier
    y?: number;   // multiplier
  };
  skew?: {
    x?: number;   // degrees
    y?: number;   // degrees
  };
  translate?: {
    x?: number;   // px
    y?: number;   // px
    z?: number;   // px (3D)
  };
  perspective?: number;  // px
  transformOrigin?: { x: number; y: number };  // 0-100%
}

interface InteractionItem {
  trigger: "load" | "scrollIn" | "scrollOut" | "scrollOn" | "hover" | "click";
  effect: "fade" | "slide" | "scale" | "custom";
  type: "in" | "out";
  direction?: string;
  duration?: number;  // ms
  delay?: number;     // ms
  easing?: string;
  repeat?: "loop" | "times" | "";
  times?: number;
  start?: number;     // % (for scroll triggers)
  end?: number;       // % (for scroll triggers)
  relativeTo?: "viewport" | "self";
  keyframes?: KeyframeStop[];  // for custom effect
}

interface KeyframeStop {
  stop: number;  // 0-100
  translateX?: number;
  translateY?: number;
  rotate?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
}
```

### 11.3 Compiler Logic

The compiler should:

1. **Legacy Motion Effects**: Spread `motion_fx_*` settings directly into the element's `settings` object as flat key-value pairs (no $$type wrapping).

2. **Entrance/Hover Animations**: Set `_animation`, `animation_duration`, `_animation_delay`, `_hover_animation` directly in `settings`.

3. **Sticky**: Set `sticky`, `sticky_on`, `sticky_offset`, `sticky_effects_offset` directly in `settings`.

4. **Transform Controls**: Set `_transform_*` settings directly in `settings`.

5. **New Interactions System**: Build the `interactions` array with proper `$$type` wrapping for `time-size` and `size` values.

### 11.4 MCP Tool Schema

Add a new `apply_motion_effects` tool or extend the `build_page`/`build_site` tools to accept motion parameters:

```typescript
server.registerTool("apply_motion_effects", {
  inputSchema: {
    selector: z.string().describe("CSS selector or element index to apply effects to"),
    motion: z.object({
      entranceAnimation: z.enum(["fadeIn", "fadeInUp", "fadeInDown", "zoomIn", "slideInUp", "bounceIn", "none", ...]).optional(),
      entranceDuration: z.number().min(0.1).max(5.0).optional(),
      entranceDelay: z.number().min(0).max(5.0).optional(),
      hoverAnimation: z.enum(["grow", "shrink", "pulse", "buzz", "none", ...]).optional(),
      scrollEffects: z.object({
        enabled: z.boolean(),
        verticalScroll: z.object({ direction: z.enum(["up","down","alternate"]), speed: z.number() }).optional(),
        // ... etc
      }).optional(),
      mouseEffects: z.object({
        enabled: z.boolean(),
        mouseTrack: z.object({ direction: z.enum(["direct","opposite"]), speed: z.number() }).optional(),
        tilt: z.object({ direction: z.enum(["direct","opposite","alternate"]), speed: z.number() }).optional(),
      }).optional(),
      sticky: z.object({
        position: z.enum(["top", "bottom"]),
        on: z.array(z.enum(["desktop", "tablet", "mobile"])),
        offset: z.number().optional(),
      }).optional(),
    }).describe("Motion effects configuration"),
  },
}, async ({ selector, motion }) => {
  // Apply motion settings to the blueprint node matching the selector
  // Recompile and return updated JSON
});
```

---

## 12. Implementation Plan for MCP Compiler

### Phase 1: Entrance & Hover Animations (Free)
1. Add `_animation`, `animation_duration`, `_animation_delay`, `_animation_offset` to settings
2. Add `_hover_animation` to settings
3. These are simple flat string/number values — no $$type wrapping needed

### Phase 2: Transform Controls (Free)
1. Add `_transform_*` settings for rotate, scale, skew, translate
2. These are flat values with `{ unit, size }` objects for some

### Phase 3: Sticky Positioning (Pro)
1. Add `sticky`, `sticky_on`, `sticky_offset`, `sticky_effects_offset` to settings
2. These are flat values

### Phase 4: Scroll & Mouse Effects (Pro)
1. Add `motion_fx_*` settings for all scroll and mouse effects
2. These are flat values with `{ unit, size }` objects for speed/level

### Phase 5: New Interactions System (v4 Atomic)
1. Build the `interactions` array with proper `$$type` wrapping
2. Support `time-size` and `size` typed values
3. Support all trigger types, effects, and config options

---

## Summary of Key Findings

1. **Motion effects are stored as flat settings** on the element's `settings` object, NOT in the `styles` system. This is critical — the current compiler only handles styles, not motion settings.

2. **Two systems coexist**: The legacy Motion Effects (Pro, flat `motion_fx_*` keys) and the new Interactions system (v4 Atomic, structured `interactions` array with `$$type` values).

3. **Entrance animations are CSS-based** while scroll/mouse effects are JS-based (motion.js library).

4. **The `interactions` array** on each element node is currently always `[]` in the compiler. This is the primary gap.

5. **No $$type wrapping needed** for legacy motion effects — they use plain values. But the new Interactions system requires `$$type` wrapping for `time-size` and `size` values.

6. **The compiler needs new primitive types**: `time-size` (for duration/delay with ms/s units) and potentially a `keyframes` type.

7. **The `BlueprintNode` interface** needs a `motion` field to accept motion effect parameters in the friendly blueprint format.
