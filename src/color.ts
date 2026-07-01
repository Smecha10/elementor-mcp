/**
 * Dependency-free color math used to build accessible, brand-derived palettes.
 *
 * All functions operate on `#rrggbb` hex strings (or shorthand `#rgb`). The
 * contrast helpers implement the WCAG 2.1 relative-luminance / contrast-ratio
 * formulas so generated palettes can be verified against AA/AAA thresholds.
 */

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

/** Parse `#rgb` / `#rrggbb` (with or without leading #) into RGB. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: "${hex}". Expected #rgb or #rrggbb.`);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const to = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: { h: number; s: number; l: number }): { r: number; g: number; b: number } {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = ln - c / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

export const hexToHsl = (hex: string) => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: { h: number; s: number; l: number }) => rgbToHex(hslToRgb(hsl));

/** Return a new hex with HSL channels adjusted by the given deltas. */
export function adjust(hex: string, d: { h?: number; s?: number; l?: number }): string {
  const hsl = hexToHsl(hex);
  return hslToHex({
    h: ((hsl.h + (d.h ?? 0)) % 360 + 360) % 360,
    s: clamp(hsl.s + (d.s ?? 0), 0, 100),
    l: clamp(hsl.l + (d.l ?? 0), 0, 100),
  });
}

export const lighten = (hex: string, amount: number) => adjust(hex, { l: amount });
export const darken = (hex: string, amount: number) => adjust(hex, { l: -amount });
export const saturate = (hex: string, amount: number) => adjust(hex, { s: amount });

/** Set absolute lightness (0..100), keeping hue/saturation. */
export function withLightness(hex: string, l: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, l: clamp(l, 0, 100) });
}

/** Mix two colors by `weight` (0 = a, 1 = b). */
export function mix(a: string, b: string, weight: number): string {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  const w = clamp(weight, 0, 1);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * w,
    g: ca.g + (cb.g - ca.g) * w,
    b: ca.b + (cb.b - ca.b) * w,
  });
}

/** WCAG relative luminance of a color (0..1). */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two colors (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Classify a contrast ratio against WCAG thresholds for normal text. */
export function wcagLevel(ratio: number): string {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-large";
  return "fail";
}

/** Pick black or white (whichever has more contrast) for text on `bg`. */
export function readableTextColor(bg: string, dark = "#101418", light = "#FFFFFF"): string {
  return contrastRatio(bg, dark) >= contrastRatio(bg, light) ? dark : light;
}

/**
 * Nudge `fg` lighter/darker until it meets `target` contrast against `bg`,
 * moving away from the background's luminance. Returns the original if it
 * already passes or if no adjustment within range can satisfy the target.
 */
export function ensureContrast(fg: string, bg: string, target = 4.5): string {
  if (contrastRatio(fg, bg) >= target) return fg;
  const bgLum = luminance(bg);
  const goDarker = bgLum > 0.4; // light bg → darken text, dark bg → lighten
  let candidate = fg;
  for (let i = 0; i < 100; i++) {
    candidate = adjust(candidate, { l: goDarker ? -1 : 1 });
    if (contrastRatio(candidate, bg) >= target) return candidate;
    const l = hexToHsl(candidate).l;
    if ((goDarker && l <= 0) || (!goDarker && l >= 100)) break;
  }
  // Fall back to the higher-contrast extreme.
  return readableTextColor(bg);
}
