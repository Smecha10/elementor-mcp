/**
 * Shared blueprint types for motion effects, transforms, sticky positioning,
 * and the v4 Interactions system.  These are used by both the compiler and
 * the MCP tool schemas so blueprint authors get full IntelliSense.
 */

// ---------------------------------------------------------------------------
// Motion Effects (legacy flat settings — no $$type wrapping)
// ---------------------------------------------------------------------------

export interface EntranceAnimation {
  /** Animation name: fadeIn, fadeInUp, zoomIn, bounceIn, slideInDown, rotateIn, lightSpeedIn, rollIn, etc. */
  animation: string;
  /** Duration in seconds (0.1–5.0, default 1.0) */
  duration?: number;
  /** Delay in seconds (0–5.0, default 0) */
  delay?: number;
  /** Viewport offset percentage for trigger (0–100, default 0) */
  offset?: number;
}

export interface HoverAnimation {
  /** Hover animation name: grow, shrink, pulse, float, sink, rotate, buzz, wobble-vertical, etc. */
  animation: string;
}

export interface ScrollEffect {
  /** Enable this effect */
  enabled: boolean;
  /** Direction — varies by effect (e.g. "up"|"down"|"alternate" for translateY) */
  direction?: string;
  /** Speed 1–10 (for translate/rotate/scale effects) */
  speed?: number;
  /** Level 0–10 (for opacity/blur effects) */
  level?: number;
  /** Viewport range where the effect applies */
  range?: { start: number; end: number };
}

export interface MouseEffect {
  /** Enable this effect */
  enabled: boolean;
  /** Direction: "opposite" | "direct" | "alternate" */
  direction?: string;
  /** Speed 1–10 */
  speed?: number;
}

export interface MotionEffects {
  /** Entrance animation */
  entrance?: EntranceAnimation;
  /** Hover animation */
  hover?: HoverAnimation;
  /** Scroll effects master switch + individual effects */
  scroll?: {
    enabled: boolean;
    /** Devices to apply on */
    devices?: string[];
    /** Vertical translate */
    translateY?: ScrollEffect;
    /** Horizontal translate */
    translateX?: ScrollEffect;
    /** Opacity fade */
    opacity?: ScrollEffect;
    /** Blur */
    blur?: ScrollEffect;
    /** Rotation */
    rotateZ?: ScrollEffect;
    /** Scale */
    scale?: ScrollEffect;
    /** Transform origin X (0–100, default 50) */
    originX?: number;
    /** Transform origin Y (0–100, default 50) */
    originY?: number;
  };
  /** Mouse effects master switch + individual effects */
  mouse?: {
    enabled: boolean;
    /** Mouse track — element moves relative to cursor */
    mouseTrack?: MouseEffect;
    /** Tilt — element tilts based on mouse position */
    tilt?: MouseEffect;
  };
}

// ---------------------------------------------------------------------------
// Transform Controls (flat settings with {unit, size} objects)
// ---------------------------------------------------------------------------

export interface TransformControls {
  /** Rotate Z (degrees) */
  rotateZ?: number;
  /** 3D rotation enabled */
  rotate3d?: boolean;
  /** Rotate X (degrees) */
  rotateX?: number;
  /** Rotate Y (degrees) */
  rotateY?: number;
  /** Scale (1 = 100%) */
  scale?: number;
  /** Scale X */
  scaleX?: number;
  /** Scale Y */
  scaleY?: number;
  /** Skew X (degrees) */
  skewX?: number;
  /** Skew Y (degrees) */
  skewY?: number;
  /** Translate X (px) */
  translateX?: number;
  /** Translate Y (px) */
  translateY?: number;
  /** Translate Z (px) */
  translateZ?: number;
  /** Perspective (px) */
  perspective?: number;
  /** Transform origin X (0–100, default 50) */
  originX?: number;
  /** Transform origin Y (0–100, default 50) */
  originY?: number;
}

// ---------------------------------------------------------------------------
// Sticky Positioning (flat settings)
// ---------------------------------------------------------------------------

export interface StickyConfig {
  /** Position: "top" | "bottom" */
  position: string;
  /** Devices: ["desktop"], ["desktop","tablet"], etc. */
  devices?: string[];
  /** Offset in pixels from the top/bottom edge */
  offset?: number;
  /** CSS selector for the sticky parent */
  parent?: string;
  /** Offset for triggering effects while sticky */
  effectsOffset?: number;
}

// ---------------------------------------------------------------------------
// v4 Interactions System (structured interactions array with $$type)
// ---------------------------------------------------------------------------

export interface InteractionTimingConfig {
  /** Duration in ms (default 600) */
  duration?: number;
  /** Delay in ms (default 0) */
  delay?: number;
}

export interface InteractionConfig {
  /** Easing: easeIn, easeOut, easeInOut, backIn, backInOut, backOut, linear */
  easing?: string;
  /** Relative to: "viewport" (default) */
  relativeTo?: string;
  /** Repeat: "loop", "times", or "" for none */
  repeat?: string;
  /** Start position % (default 85) — scroll trigger start */
  start?: number;
  /** End position % (default 15) — scroll trigger end */
  end?: number;
}

export interface Interaction {
  /** Unique interaction id (auto-generated if not provided) */
  id?: string;
  /** Trigger: "load", "scrollIn", "scrollOut", "scrollOn", "hover", "click" */
  trigger: string;
  /** Animation definition */
  animation: {
    /** Effect: "fade", "slide", "scale", "custom" */
    effect: string;
    /** Type: "in" or "out" */
    type: string;
    /** Direction: "left", "right", "top", "bottom", "top-left", etc. ("" for none) */
    direction?: string;
    /** Timing config */
    timing?: InteractionTimingConfig;
    /** Additional config */
    config?: InteractionConfig;
  };
  /** Breakpoints to exclude */
  excludedBreakpoints?: string[];
}

// ---------------------------------------------------------------------------
// HTML widget
// ---------------------------------------------------------------------------

export interface HtmlWidgetConfig {
  /** Raw HTML content */
  html: string;
}

// ---------------------------------------------------------------------------
// Keyframes (CSS @keyframes animations)
// ---------------------------------------------------------------------------

/** A single keyframe step — the selector (e.g. "0%", "100%", "from", "to") maps to CSS declarations. */
export type KeyframeStep = Record<string, Record<string, string>>;

/** A named @keyframes animation definition. */
export interface KeyframeSpec {
  /** Animation name, e.g. "shimmer". */
  name: string;
  /** Keyframe steps keyed by selector ("0%", "50%", "100%", "from", "to"). */
  steps: KeyframeStep;
}