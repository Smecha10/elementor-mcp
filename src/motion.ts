/**
 * Motion effects compilation for Elementor v4.
 *
 * Two systems coexist in Elementor:
 * 1. Legacy Motion Effects (Pro) — flat `motion_fx_*` keys on settings (no $$type)
 * 2. New Interactions System (v4 Atomic) — structured `interactions` array with $$type
 *
 * This module compiles a friendly `motion` blueprint object into both paths.
 */
import { str, bool, timeSize, size, TypedValue } from "./elementor/primitives.js";

// ---------------------------------------------------------------------------
// Friendly blueprint types
// ---------------------------------------------------------------------------

export interface MotionSpec {
  // Entrance animation (Free, flat settings)
  entrance?: string;         // "fadeInUp", "slideInLeft", etc.
  entranceDuration?: number; // seconds (default 1.0)
  entranceDelay?: number;    // seconds (default 0)
  entranceOffset?: number;   // 0-100 (default 0)

  // Hover animation (Free, flat settings)
  hover?: string;            // "grow", "shrink", "pulse", etc.

  // Transform controls (Free, flat settings with {unit, size} objects)
  transform?: {
    rotate?: number;          // degrees
    scale?: number;           // multiplier (1.0 = no change)
    skewX?: number;           // degrees
    skewY?: number;           // degrees
    translateX?: number;      // px
    translateY?: number;      // px
    perspective?: number;     // px
  };

  // Sticky positioning (Pro, flat settings)
  sticky?: {
    position: "top" | "bottom";
    devices?: string[];      // ["desktop","tablet","mobile"]
    offset?: number;          // px
    effectsOffset?: number;   // px
    parent?: string;          // CSS selector (default "body")
  };

  // Scroll effects (Pro, flat motion_fx_* settings)
  scroll?: {
    translateY?: { direction?: "up" | "down"; speed?: number };       // speed 1-10
    translateX?: { direction?: "left" | "right"; speed?: number };
    opacity?: { direction?: "in" | "out" | "in-out"; speed?: number };
    blur?: { direction?: "in" | "out" | "in-out"; speed?: number };
    rotateZ?: { direction?: "left" | "right"; speed?: number };
    scale?: { direction?: "up" | "down"; speed?: number };
  };

  // Mouse effects (Pro, flat motion_fx_* settings)
  mouse?: {
    track?: { direction?: "opposite" | "direct"; speed?: number };
    tilt?: { direction?: "alternate" | "direct" | "opposite"; speed?: number };
  };

  // New Interactions system (v4 Atomic, structured array with $$type)
  interactions?: InteractionSpec[];
}

export interface InteractionSpec {
  trigger: "load" | "scrollIn" | "scrollOut" | "scrollOn" | "hover" | "click";
  effect?: "fade" | "slide" | "scale" | "custom";
  type?: "in" | "out";
  direction?: string;         // "top", "bottom", "left", "right", ""
  duration?: number;          // ms (default 600)
  delay?: number;             // ms (default 0)
  easing?: string;           // "easeIn", "easeOut", "easeInOut", "linear", etc.
  repeat?: string;           // "loop", "times", ""
  start?: number | string;    // % position to start (default 85)
  end?: number | string;      // % position to end (default 15)
  excludedBreakpoints?: string[];
}

// ---------------------------------------------------------------------------
// Animation name constants
// ---------------------------------------------------------------------------

export const ENTRANCE_ANIMATIONS = [
  "fadeIn", "fadeInUp", "fadeInDown", "fadeInLeft", "fadeInRight",
  "zoomIn", "zoomInDown", "zoomInLeft", "zoomInRight", "zoomInUp",
  "bounceIn", "bounceInDown", "bounceInLeft", "bounceInRight", "bounceInUp",
  "slideInDown", "slideInLeft", "slideInRight", "slideInUp",
  "rotateIn", "rotateInDownLeft", "rotateInDownRight", "rotateInUpLeft", "rotateInUpRight",
  "bounce", "flash", "pulse", "rubberBand", "shake", "swing", "tada", "wobble", "jello",
  "lightSpeedIn", "rollIn",
] as const;

export const HOVER_ANIMATIONS = [
  "grow", "shrink", "pulse", "pulse-grow", "pulse-shrink", "push", "pop",
  "bounce-in", "bounce-out", "rotate", "grow-rotate", "float", "sink",
  "bob", "hang", "skew", "skew-forward", "skew-backward",
  "wobble-vertical", "wobble-horizontal", "wobble-to-bottom-right",
  "wobble-to-top-right", "wobble-top", "wobble-bottom", "wobble-skew",
  "buzz", "buzz-out",
] as const;

// ---------------------------------------------------------------------------
// Compilation: motion spec → flat settings (legacy path)
// ---------------------------------------------------------------------------

/**
 * Compile the flat-settings portion of a motion spec (entrance, hover, transform,
 * sticky, scroll, mouse) into a settings object to merge into the element's settings.
 * These are plain values — no $$type wrapping.
 */
export function compileMotionSettings(motion: MotionSpec): Record<string, unknown> {
  const settings: Record<string, unknown> = {};

  // Entrance animation
  if (motion.entrance) {
    settings._animation = motion.entrance;
    if (motion.entranceDuration !== undefined) settings.animation_duration = motion.entranceDuration;
    if (motion.entranceDelay !== undefined) settings._animation_delay = motion.entranceDelay;
    if (motion.entranceOffset !== undefined) settings._animation_offset = motion.entranceOffset;
  }

  // Hover animation
  if (motion.hover) {
    settings._hover_animation = motion.hover;
  }

  // Transform controls
  if (motion.transform) {
    const t = motion.transform;
    if (t.rotate !== undefined) settings._transform_rotateZ_effect = { unit: "deg", size: t.rotate };
    if (t.scale !== undefined) settings._transform_scale_effect = { unit: "px", size: t.scale };
    if (t.skewX !== undefined) settings._transform_skewX_effect = { unit: "deg", size: t.skewX };
    if (t.skewY !== undefined) settings._transform_skewY_effect = { unit: "deg", size: t.skewY };
    if (t.translateX !== undefined) settings._transform_translateX_effect = { unit: "px", size: t.translateX };
    if (t.translateY !== undefined) settings._transform_translateY_effect = { unit: "px", size: t.translateY };
    if (t.perspective !== undefined) settings._transform_perspective_effect = { unit: "px", size: t.perspective };
  }

  // Sticky positioning
  if (motion.sticky) {
    const s = motion.sticky;
    settings.sticky = s.position;
    if (s.devices) settings.sticky_on = s.devices;
    if (s.offset !== undefined) settings.sticky_offset = s.offset;
    if (s.effectsOffset !== undefined) settings.sticky_effects_offset = s.effectsOffset;
    if (s.parent) settings.sticky_parent = s.parent;
  }

  // Scroll effects (motion_fx_*)
  const scrollEffects: string[] = [];
  if (motion.scroll) {
    const sc = motion.scroll;
    settings.motion_fx_motion_fx_scrolling = "yes";

    if (sc.translateY) {
      settings.motion_fx_translateY_effect = "yes";
      settings.motion_fx_translateY_direction = sc.translateY.direction ?? "up";
      settings.motion_fx_translateY_speed = { unit: "px", size: sc.translateY.speed ?? 4 };
      settings.motion_fx_translateY_affectedRange = { unit: "%", sizes: { start: 0, end: 100 } };
      scrollEffects.push("translateY");
    }
    if (sc.translateX) {
      settings.motion_fx_translateX_effect = "yes";
      settings.motion_fx_translateX_direction = sc.translateX.direction ?? "right";
      settings.motion_fx_translateX_speed = { unit: "px", size: sc.translateX.speed ?? 4 };
      settings.motion_fx_translateX_affectedRange = { unit: "%", sizes: { start: 0, end: 100 } };
      scrollEffects.push("translateX");
    }
    if (sc.opacity) {
      settings.motion_fx_opacity_effect = "yes";
      settings.motion_fx_opacity_direction = sc.opacity.direction ?? "out";
      settings.motion_fx_opacity_speed = { unit: "px", size: sc.opacity.speed ?? 4 };
      settings.motion_fx_opacity_affectedRange = { unit: "%", sizes: { start: 0, end: 100 } };
      scrollEffects.push("opacity");
    }
    if (sc.blur) {
      settings.motion_fx_blur_effect = "yes";
      settings.motion_fx_blur_direction = sc.blur.direction ?? "out";
      settings.motion_fx_blur_speed = { unit: "px", size: sc.blur.speed ?? 4 };
      settings.motion_fx_blur_affectedRange = { unit: "%", sizes: { start: 0, end: 100 } };
      scrollEffects.push("blur");
    }
    if (sc.rotateZ) {
      settings.motion_fx_rotateZ_effect = "yes";
      settings.motion_fx_rotateZ_direction = sc.rotateZ.direction ?? "right";
      settings.motion_fx_rotateZ_speed = { unit: "px", size: sc.rotateZ.speed ?? 4 };
      settings.motion_fx_rotateZ_affectedRange = { unit: "%", sizes: { start: 0, end: 100 } };
      scrollEffects.push("rotateZ");
    }
    if (sc.scale) {
      settings.motion_fx_scale_effect = "yes";
      settings.motion_fx_scale_direction = sc.scale.direction ?? "up";
      settings.motion_fx_scale_speed = { unit: "px", size: sc.scale.speed ?? 4 };
      settings.motion_fx_scale_affectedRange = { unit: "%", sizes: { start: 0, end: 100 } };
      scrollEffects.push("scale");
    }
  }

  // Mouse effects (motion_fx_*)
  if (motion.mouse) {
    const m = motion.mouse;
    settings.motion_fx_motion_fx_mouse = "yes";

    if (m.track) {
      settings.motion_fx_mouseTrack_effect = "yes";
      settings.motion_fx_mouseTrack_direction = m.track.direction ?? "opposite";
      settings.motion_fx_mouseTrack_speed = m.track.speed ?? 2;
    }
    if (m.tilt) {
      settings.motion_fx_tilt_effect = "yes";
      settings.motion_fx_tilt_direction = m.tilt.direction ?? "direct";
      settings.motion_fx_tilt_speed = m.tilt.speed ?? 4;
    }
  }

  return settings;
}

// ---------------------------------------------------------------------------
// Compilation: interactions spec → v4 interactions array
// ---------------------------------------------------------------------------

let _interactionCounter = 0;

function nextInteractionId(): string {
  _interactionCounter++;
  return `int_${String(_interactionCounter).padStart(3, "0")}`;
}

/**
 * Compile the interactions portion of a motion spec into the v4 Atomic
 * `interactions` array format with $$type-wrapped values.
 */
export function compileInteractions(specs: InteractionSpec[]): unknown[] {
  return specs.map((spec) => {
    const interaction: Record<string, unknown> = {
      interaction_id: nextInteractionId(),
      trigger: spec.trigger,
      animation: {
        effect: spec.effect ?? "fade",
        type: spec.type ?? "in",
        direction: spec.direction ?? "",
        timing_config: {
          duration: timeSize(spec.duration ?? 600),
          delay: timeSize(spec.delay ?? 0),
        },
        config: {
          easing: spec.easing ?? "easeIn",
          relativeTo: "viewport",
          repeat: spec.repeat ?? "",
          start: size(typeof spec.start === "number" ? `${spec.start}%` : spec.start ?? "85%"),
          end: size(typeof spec.end === "number" ? `${spec.end}%` : spec.end ?? "15%"),
        },
      },
      breakpoints: { excluded: spec.excludedBreakpoints ?? [] },
    };
    return interaction;
  });
}

/**
 * Full motion compilation: takes a MotionSpec, returns both flat settings
 * (to merge into element settings) and an interactions array (to assign to
 * the element's `interactions` field).
 */
export function compileMotion(motion: MotionSpec): {
  settings: Record<string, unknown>;
  interactions: unknown[];
} {
  return {
    settings: compileMotionSettings(motion),
    interactions: motion.interactions ? compileInteractions(motion.interactions) : [],
  };
}