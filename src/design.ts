/**
 * Brand-driven theme generation: turn a single brand color (plus an optional
 * accent and a chosen "personality") into a complete, accessibility-checked
 * Elementor theme — colors, font pairing, radius scale, shadow and spacing
 * rhythm. The point is that two different brands produce visibly different
 * sites, instead of the one-size-fits-all look most AI builders emit.
 */
import {
  contrastRatio,
  ensureContrast,
  hexToHsl,
  mix,
  readableTextColor,
  wcagLevel,
  withLightness,
} from "./color.js";

export interface Personality {
  name: string;
  description: string;
  fonts: { heading: string; body: string };
  radius: { sm: string; md: string; lg: string; pill: string };
  shadow: { card: string; soft: string };
  sectionPadding: { desktop: string; mobile: string };
  accentBoost: number;
  headingWeight: number;
  letterSpacing: string;
}

export const PERSONALITIES: Record<string, Personality> = {
  corporate: {
    name: "corporate",
    description: "Trustworthy, established, professional. Restrained color, sturdy sans pairing, modest radii. Good for finance, legal, B2B, consulting.",
    fonts: { heading: "Poppins, sans-serif", body: "Inter, sans-serif" },
    radius: { sm: "0.375rem", md: "0.625rem", lg: "1rem", pill: "999px" },
    shadow: { card: "0 10px 30px rgba(15,23,42,0.10)", soft: "0 2px 8px rgba(15,23,42,0.06)" },
    sectionPadding: { desktop: "5rem", mobile: "3rem" },
    accentBoost: 0,
    headingWeight: 700,
    letterSpacing: "-0.01em",
  },
  modern: {
    name: "modern",
    description: "Clean, techy, confident. Geometric sans, tighter headings, soft shadows, medium radii. Good for SaaS, startups, agencies.",
    fonts: { heading: "Space Grotesk, sans-serif", body: "Inter, sans-serif" },
    radius: { sm: "0.5rem", md: "0.875rem", lg: "1.5rem", pill: "999px" },
    shadow: { card: "0 18px 50px rgba(2,6,23,0.14)", soft: "0 4px 14px rgba(2,6,23,0.08)" },
    sectionPadding: { desktop: "5.5rem", mobile: "3rem" },
    accentBoost: 8,
    headingWeight: 600,
    letterSpacing: "-0.02em",
  },
  elegant: {
    name: "elegant",
    description: "Refined, premium, editorial. Serif headings over a clean sans body, generous spacing, subtle shadow. Good for luxury, hospitality, wellness, beauty.",
    fonts: { heading: "Playfair Display, serif", body: "Inter, sans-serif" },
    radius: { sm: "0.25rem", md: "0.5rem", lg: "0.875rem", pill: "999px" },
    shadow: { card: "0 16px 40px rgba(28,25,23,0.10)", soft: "0 3px 10px rgba(28,25,23,0.06)" },
    sectionPadding: { desktop: "6.5rem", mobile: "3.5rem" },
    accentBoost: -4,
    headingWeight: 600,
    letterSpacing: "0em",
  },
  bold: {
    name: "bold",
    description: "Loud, energetic, high-contrast. Heavy display headings, vivid accent, chunky radii. Good for fitness, events, food, youth brands.",
    fonts: { heading: "Montserrat, sans-serif", body: "Inter, sans-serif" },
    radius: { sm: "0.5rem", md: "1rem", lg: "1.75rem", pill: "999px" },
    shadow: { card: "0 22px 60px rgba(2,6,23,0.18)", soft: "0 6px 18px rgba(2,6,23,0.10)" },
    sectionPadding: { desktop: "5rem", mobile: "3rem" },
    accentBoost: 16,
    headingWeight: 800,
    letterSpacing: "-0.02em",
  },
  playful: {
    name: "playful",
    description: "Friendly, approachable, rounded. Rounded sans, big radii, soft pop accent. Good for kids, crafts, local services, community.",
    fonts: { heading: "Fredoka, sans-serif", body: "Nunito, sans-serif" },
    radius: { sm: "0.75rem", md: "1.25rem", lg: "2rem", pill: "999px" },
    shadow: { card: "0 14px 40px rgba(2,6,23,0.12)", soft: "0 4px 14px rgba(2,6,23,0.08)" },
    sectionPadding: { desktop: "4.5rem", mobile: "2.75rem" },
    accentBoost: 12,
    headingWeight: 700,
    letterSpacing: "0em",
  },
  minimal: {
    name: "minimal",
    description: "Quiet, spacious, content-first. Single neutral sans, near-zero radius, almost no shadow, lots of whitespace. Good for portfolios, architecture, photography.",
    fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
    radius: { sm: "0.125rem", md: "0.25rem", lg: "0.5rem", pill: "999px" },
    shadow: { card: "0 6px 24px rgba(0,0,0,0.06)", soft: "0 1px 4px rgba(0,0,0,0.04)" },
    sectionPadding: { desktop: "7rem", mobile: "3.5rem" },
    accentBoost: -6,
    headingWeight: 600,
    letterSpacing: "-0.01em",
  },
};

export const PERSONALITY_NAMES = Object.keys(PERSONALITIES);

/** Derive an accent hue from the brand color when none is supplied. */
function deriveAccent(brand: string, strategy: string, boost: number): string {
  const hsl = hexToHsl(brand);
  let h = hsl.h;
  switch (strategy) {
    case "complementary": h = hsl.h + 180; break;
    case "analogous": h = hsl.h + 32; break;
    case "triadic": h = hsl.h + 120; break;
    case "auto":
    default:
      // A warm, energetic accent reads as a CTA against most brand hues.
      h = hsl.h + 165;
  }
  // Make the accent pop: pull saturation up and land lightness in a vivid band.
  const s = Math.min(100, Math.max(55, hsl.s + 18 + boost));
  const l = Math.min(62, Math.max(46, 56 - boost * 0.3));
  return hslToHexLocal(h, s, l);
}

// Local HSL→hex builder (mirrors color.ts) — used to synthesize an accent hue.
function hslToHexLocal(h: number, s: number, l: number): string {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = ln - c / 2;
  const to = (n: number) =>
    Math.min(255, Math.max(0, Math.round((n + m) * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r1)}${to(g1)}${to(b1)}`;
}

interface PaletteOptions {
  accentBoost?: number;
  scheme?: string;
  accent?: string;
  accentStrategy?: string;
}

interface PaletteResult {
  colors: Record<string, string>;
  checks: Array<{ pair: string; ratio: number; level: string; pass: boolean }>;
  warnings: string[];
}

/**
 * Build a full, contrast-checked palette from a brand color. Neutrals are
 * tinted slightly toward the brand hue so the whole page feels cohesive rather
 * than brand-color-dropped-on-gray.
 */
export function buildPalette(brandHex: string, opts: PaletteOptions = {}): PaletteResult {
  const warnings: string[] = [];
  const boost = opts.accentBoost ?? 0;
  const scheme = opts.scheme ?? "light";
  const brand = brandHex.trim();
  const brandHsl = hexToHsl(brand);

  // Keep a usable primary: very light/dark brand colors get pulled into a
  // mid band so it works as a heading/UI color, while we keep tints/shades.
  const primary = brandHsl.l > 72 ? withLightness(brand, 42) : brandHsl.l < 18 ? withLightness(brand, 26) : brand;
  const primaryDark = withLightness(primary, Math.max(12, hexToHsl(primary).l - 16));
  const primaryLight = withLightness(primary, Math.min(94, hexToHsl(primary).l + 38));
  const accent = (opts.accent && opts.accent.trim()) || deriveAccent(primary, opts.accentStrategy ?? "auto", boost);
  const accentDark = withLightness(accent, Math.max(12, hexToHsl(accent).l - 14));

  let bg: string, surface: string, surfaceAlt: string, text: string, muted: string, border: string;
  if (scheme === "dark") {
    bg = mix("#0b0f14", primary, 0.06);
    surface = mix("#121821", primary, 0.08);
    surfaceAlt = mix("#0e141b", primary, 0.05);
    text = mix("#FFFFFF", primary, 0.04);
    muted = mix("#9aa6b2", primary, 0.05);
    border = mix("#243042", primary, 0.10);
  } else {
    bg = "#FFFFFF";
    surface = mix("#FFFFFF", primary, 0.05); // faint brand-tinted panel
    surfaceAlt = mix("#FFFFFF", primary, 0.10);
    text = mix("#0f1419", primary, 0.06);
    muted = mix("#5b6472", primary, 0.08);
    border = mix("#e3e8ef", primary, 0.10);
  }

  const onPrimary = readableTextColor(primary);
  const onAccent = readableTextColor(accent);

  // Ensure body/heading text remain readable on the two main backgrounds.
  text = ensureContrast(text, bg, 7);
  muted = ensureContrast(muted, scheme === "dark" ? surface : bg, 4.5);

  const colors: Record<string, string> = {
    primary,
    primaryDark,
    primaryLight,
    accent,
    accentDark,
    bg,
    surface,
    surfaceAlt,
    text,
    muted,
    border,
    onPrimary,
    onAccent,
  };

  const checks = [
    check("body text on bg", text, bg, 4.5),
    check("body text on surface", text, surface, 4.5),
    check("muted on bg", muted, bg, 4.5),
    check("text on primary (onPrimary)", onPrimary, primary, 4.5),
    check("text on accent (onAccent)", onAccent, accent, 4.5),
    check("primary on bg (UI/headings)", primary, bg, 3),
  ];

  for (const c of checks) {
    if (!c.pass) warnings.push(`Low contrast: ${c.pair} = ${c.ratio.toFixed(2)}:1 (${c.level}).`);
  }

  return { colors, checks, warnings };
}

function check(pair: string, fg: string, bg: string, target: number) {
  const ratio = contrastRatio(fg, bg);
  return { pair, ratio, level: wcagLevel(ratio), pass: ratio >= target };
}

interface ThemeOptions {
  personality?: string;
  accent?: string;
  accentStrategy?: string;
  scheme?: string;
  accentBoost?: number;
}

interface ThemeResult {
  theme: Record<string, unknown>;
  personality: string;
  checks: Array<{ pair: string; ratio: number; level: string; pass: boolean }>;
  warnings: string[];
}

/** Compose a complete blueprint `theme` from a brand color + personality. */
export function buildTheme(brandHex: string, opts: ThemeOptions = {}): ThemeResult {
  const personalityName = opts.personality && PERSONALITIES[opts.personality] ? opts.personality : "modern";
  const p = PERSONALITIES[personalityName];
  const palette = buildPalette(brandHex, { ...opts, accentBoost: opts.accentBoost ?? p.accentBoost });
  const theme: Record<string, unknown> = {
    colors: palette.colors,
    fonts: p.fonts,
    radius: p.radius,
    shadow: p.shadow,
    type: {
      headingWeight: p.headingWeight,
      letterSpacing: p.letterSpacing,
    },
    space: {
      section: p.sectionPadding.desktop,
      sectionMobile: p.sectionPadding.mobile,
    },
  };
  return { theme, personality: personalityName, checks: palette.checks, warnings: palette.warnings };
}
