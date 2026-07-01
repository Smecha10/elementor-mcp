/**
 * Visual design style presets — the "look and feel" layer.
 *
 * While `design.ts` handles brand color palettes and personality fonts/radii,
 * this module controls the *visual treatment* of elements: gradients,
 * glassmorphism, neumorphism, hover effects, default animations, decorative
 * elements. Each style preset produces CSS snippets and style overrides that
 * templates apply to sections, cards, and buttons.
 *
 * This is what makes two sites with the same brand color look completely
 * different — the design style controls the entire visual language.
 */

export type DesignStyleId =
  | "flat"
  | "glass"
  | "neumorphic"
  | "gradient"
  | "aurora"
  | "editorial";

export interface DesignStyle {
  id: DesignStyleId;
  name: string;
  description: string;
  /** CSS for a standard content card in this style */
  cardStyle: (theme: Record<string, unknown>) => Record<string, unknown>;
  /** CSS for a section background in this style */
  sectionStyle: (theme: Record<string, unknown>, variant?: string) => Record<string, unknown>;
  /** CSS for a primary button in this style */
  buttonStyle: (theme: Record<string, unknown>) => Record<string, unknown>;
  /** CSS for a ghost/secondary button in this style */
  ghostButtonStyle: (theme: Record<string, unknown>) => Record<string, unknown>;
  /** Default entrance animation for elements */
  defaultEntrance?: string;
  /** Default hover animation for interactive elements */
  defaultHover?: string;
  /** Whether this style uses dark section backgrounds by default */
  darkSections?: boolean;
}

// Helper to safely get a theme color
function tc(theme: Record<string, unknown>, key: string): string {
  const colors = theme.colors as Record<string, string> | undefined;
  return colors?.[key] ?? "";
}

// Helper to get a shadow token
function ts(theme: Record<string, unknown>, key: string): string {
  const shadow = theme.shadow as Record<string, string> | undefined;
  return shadow?.[key] ?? "";
}

// Helper to get a radius token
function tr(theme: Record<string, unknown>, key: string): string {
  const radius = theme.radius as Record<string, string> | undefined;
  return radius?.[key] ?? "1rem";
}

export const DESIGN_STYLES: Record<DesignStyleId, DesignStyle> = {
  // ────────────────────────────────────────────────────────────────────────
  // FLAT — Clean, minimal, solid colors. Apple-esque.
  // ────────────────────────────────────────────────────────────────────────
  flat: {
    id: "flat",
    name: "Flat",
    description: "Clean, minimal design with solid colors, crisp borders, and subtle shadows. Apple/Linear aesthetic.",
    cardStyle: (theme) => ({
      background: tc(theme, "surface"),
      borderRadius: tr(theme, "lg"),
      boxShadow: ts(theme, "soft"),
      css: "transition: transform 0.2s ease, box-shadow 0.2s ease;",
      hover: { css: "transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.08);" },
    }),
    sectionStyle: (theme, variant) => {
      if (variant === "alt") return { background: tc(theme, "surface") };
      if (variant === "dark") return { background: tc(theme, "primary") };
      return { background: tc(theme, "bg") };
    },
    buttonStyle: (theme) => ({
      color: tc(theme, "onAccent"),
      background: tc(theme, "accent"),
      fontWeight: "700",
      borderRadius: tr(theme, "pill"),
      padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
      css: "transition: all 0.2s ease; letter-spacing: -0.01em;",
      hover: { css: "transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); filter: brightness(1.08);" },
    }),
    ghostButtonStyle: (theme) => ({
      color: tc(theme, "primary"),
      background: "transparent",
      fontWeight: "700",
      borderRadius: tr(theme, "pill"),
      padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
      css: `transition: all 0.2s ease; border: 2px solid ${tc(theme, "border")};`,
      hover: { css: `border-color: ${tc(theme, "accent")}; color: ${tc(theme, "accent")};` },
    }),
    defaultEntrance: "fadeInUp",
    defaultHover: "grow",
  },

  // ────────────────────────────────────────────────────────────────────────
  // GLASS — Frosted glass cards over colorful/gradient backgrounds.
  // ────────────────────────────────────────────────────────────────────────
  glass: {
    id: "glass",
    name: "Glass",
    description: "Glassmorphism: frosted glass cards with backdrop-blur over gradient backgrounds. Modern, premium, Web3/tech aesthetic.",
    cardStyle: (_theme) => ({
      css: "background: rgba(255,255,255,0.08); backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(255,255,255,0.12); border-radius: 1rem; transition: all 0.3s ease;",
      hover: { css: "background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.2); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.25);" },
    }),
    sectionStyle: (theme, variant) => {
      const primary = tc(theme, "primary");
      const accent = tc(theme, "accent");
      if (variant === "alt") {
        return { css: `background: linear-gradient(135deg, ${primary}dd 0%, ${accent}aa 100%);` };
      }
      if (variant === "dark") {
        return { css: `background: linear-gradient(160deg, ${primary} 0%, ${primary}cc 50%, ${accent}88 100%);` };
      }
      return { css: `background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);` };
    },
    buttonStyle: () => ({
      color: "#ffffff",
      background: "rgba(255,255,255,0.15)",
      fontWeight: "700",
      borderRadius: "999px",
      padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
      css: "backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.25); transition: all 0.3s ease;",
      hover: { css: "background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.4); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3);" },
    }),
    ghostButtonStyle: () => ({
      color: "#ffffff",
      background: "transparent",
      fontWeight: "700",
      borderRadius: "999px",
      padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
      css: "border: 1px solid rgba(255,255,255,0.3); transition: all 0.3s ease;",
      hover: { css: "background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5);" },
    }),
    defaultEntrance: "fadeInUp",
    defaultHover: "grow",
    darkSections: true,
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEUMORPHIC — Soft shadows, extruded surfaces, monochrome palette.
  // ────────────────────────────────────────────────────────────────────────
  neumorphic: {
    id: "neumorphic",
    name: "Neumorphic",
    description: "Soft UI neomorphism: extruded surfaces with dual shadows. Tactile, modern, great for dashboards and SaaS.",
    cardStyle: (theme) => {
      const bg = tc(theme, "bg");
      return {
        background: bg,
        borderRadius: "1.25rem",
        css: `box-shadow: 8px 8px 20px rgba(0,0,0,0.08), -8px -8px 20px rgba(255,255,255,0.9); transition: all 0.3s ease;`,
        hover: { css: `box-shadow: 12px 12px 28px rgba(0,0,0,0.12), -12px -12px 28px rgba(255,255,255,0.95); transform: translateY(-2px);` },
      };
    },
    sectionStyle: (theme, variant) => {
      const bg = tc(theme, "bg");
      if (variant === "alt") return { background: tc(theme, "surface"), css: "box-shadow: inset 4px 4px 12px rgba(0,0,0,0.04), inset -4px -4px 12px rgba(255,255,255,0.8);" };
      return { background: bg };
    },
    buttonStyle: (theme) => {
      const bg = tc(theme, "bg");
      return {
        color: tc(theme, "primary"),
        background: bg,
        fontWeight: "700",
        borderRadius: "1rem",
        padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
        css: `box-shadow: 6px 6px 16px rgba(0,0,0,0.1), -6px -6px 16px rgba(255,255,255,0.9); transition: all 0.2s ease;`,
        hover: { css: `box-shadow: 3px 3px 8px rgba(0,0,0,0.1), -3px -3px 8px rgba(255,255,255,0.9); transform: scale(0.98);` },
      };
    },
    ghostButtonStyle: (theme) => {
      const bg = tc(theme, "bg");
      return {
        color: tc(theme, "muted"),
        background: bg,
        fontWeight: "700",
        borderRadius: "1rem",
        padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
        css: `box-shadow: inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.7); transition: all 0.2s ease;`,
        hover: { css: `color: ${tc(theme, "accent")};` },
      };
    },
    defaultEntrance: "fadeIn",
    defaultHover: "shrink",
  },

  // ────────────────────────────────────────────────────────────────────────
  // GRADIENT — Vibrant gradients on cards, buttons, backgrounds.
  // ────────────────────────────────────────────────────────────────────────
  gradient: {
    id: "gradient",
    name: "Gradient",
    description: "Bold gradient backgrounds, gradient text, colorful cards. Energetic, startup/creative agency aesthetic.",
    cardStyle: (theme) => {
      const primary = tc(theme, "primary");
      const accent = tc(theme, "accent");
      return {
        borderRadius: tr(theme, "lg"),
        css: `background: linear-gradient(145deg, ${primary}08, ${accent}12); border: 1px solid ${tc(theme, "border")}; transition: all 0.3s ease;`,
        hover: { css: `background: linear-gradient(145deg, ${primary}14, ${accent}20); transform: translateY(-4px); box-shadow: 0 16px 48px ${primary}22;` },
      };
    },
    sectionStyle: (theme, variant) => {
      const primary = tc(theme, "primary");
      const accent = tc(theme, "accent");
      const surface = tc(theme, "surface");
      if (variant === "alt") return { css: `background: linear-gradient(180deg, ${surface} 0%, ${primary}06 100%);` };
      if (variant === "dark") return { css: `background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);` };
      return { background: tc(theme, "bg") };
    },
    buttonStyle: (theme) => {
      const primary = tc(theme, "primary");
      const accent = tc(theme, "accent");
      return {
        color: "#ffffff",
        fontWeight: "700",
        borderRadius: tr(theme, "pill"),
        padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
        css: `background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%); transition: all 0.3s ease; background-size: 200% auto;`,
        hover: { css: `background-position: right center; box-shadow: 0 12px 36px ${primary}44; transform: translateY(-2px);` },
      };
    },
    ghostButtonStyle: (theme) => ({
      color: tc(theme, "primary"),
      background: "transparent",
      fontWeight: "700",
      borderRadius: tr(theme, "pill"),
      padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
      css: `border: 2px solid ${tc(theme, "border")}; transition: all 0.3s ease;`,
      hover: { css: `border-color: ${tc(theme, "accent")}; color: ${tc(theme, "accent")}; background: ${tc(theme, "accent")}0a;` },
    }),
    defaultEntrance: "zoomIn",
    defaultHover: "grow",
  },

  // ────────────────────────────────────────────────────────────────────────
  // AURORA — Animated gradient mesh backgrounds, floating cards, glow effects.
  // ────────────────────────────────────────────────────────────────────────
  aurora: {
    id: "aurora",
    name: "Aurora",
    description: "Animated aurora gradient backgrounds, glowing cards, neon accents. Futuristic, AI/crypto/gaming aesthetic.",
    cardStyle: (theme) => {
      const accent = tc(theme, "accent");
      return {
        background: tc(theme, "surface"),
        borderRadius: tr(theme, "lg"),
        css: `border: 1px solid ${tc(theme, "border")}; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden;`,
        hover: { css: `transform: translateY(-6px); box-shadow: 0 24px 64px ${accent}33, 0 0 0 1px ${accent}44; border-color: ${accent}66;` },
      };
    },
    sectionStyle: (theme, variant) => {
      const primary = tc(theme, "primary");
      const accent = tc(theme, "accent");
      const bg = tc(theme, "bg");
      if (variant === "alt") {
        return {
          css: `background: ${bg}; position: relative; --aurora-1: ${primary}22; --aurora-2: ${accent}22;`,
        };
      }
      if (variant === "dark") {
        return { css: `background: linear-gradient(135deg, ${primary} 0%, ${accent} 50%, ${primary} 100%);` };
      }
      return {
        css: `background: ${bg}; position: relative; --aurora-1: ${primary}18; --aurora-2: ${accent}18;`,
      };
    },
    buttonStyle: (theme) => {
      const accent = tc(theme, "accent");
      return {
        color: "#ffffff",
        background: accent,
        fontWeight: "700",
        borderRadius: tr(theme, "pill"),
        padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
        css: `transition: all 0.3s ease; box-shadow: 0 0 20px ${accent}44, 0 4px 16px rgba(0,0,0,0.12);`,
        hover: { css: `box-shadow: 0 0 40px ${accent}66, 0 8px 24px rgba(0,0,0,0.2); transform: translateY(-2px) scale(1.02);` },
      };
    },
    ghostButtonStyle: (theme) => {
      const accent = tc(theme, "accent");
      return {
        color: accent,
        background: "transparent",
        fontWeight: "700",
        borderRadius: tr(theme, "pill"),
        padding: { top: "0.875rem", right: "2rem", bottom: "0.875rem", left: "2rem" },
        css: `border: 1px solid ${accent}44; transition: all 0.3s ease;`,
        hover: { css: `border-color: ${accent}; box-shadow: 0 0 24px ${accent}44; background: ${accent}0a;` },
      };
    },
    defaultEntrance: "fadeInUp",
    defaultHover: "grow",
  },

  // ────────────────────────────────────────────────────────────────────────
  // EDITORIAL — Magazine-style layouts, serif headings, generous whitespace.
  // ────────────────────────────────────────────────────────────────────────
  editorial: {
    id: "editorial",
    name: "Editorial",
    description: "Magazine/editorial aesthetic: generous whitespace, serif headings, fine borders, refined shadows. Premium publishing feel.",
    cardStyle: (theme) => ({
      background: tc(theme, "bg"),
      borderRadius: "0",
      css: `border: 1px solid ${tc(theme, "border")}; transition: all 0.3s ease;`,
      hover: { css: `border-color: ${tc(theme, "primary")}; box-shadow: 0 1px 0 ${tc(theme, "primary")}; transform: translateY(-1px);` },
    }),
    sectionStyle: (theme, variant) => {
      if (variant === "alt") return { background: tc(theme, "surface") };
      if (variant === "dark") return { background: tc(theme, "primary") };
      return { background: tc(theme, "bg") };
    },
    buttonStyle: (theme) => ({
      color: tc(theme, "onAccent"),
      background: tc(theme, "accent"),
      fontWeight: "600",
      borderRadius: "0",
      padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" },
      css: `transition: all 0.2s ease; letter-spacing: 0.02em; text-transform: uppercase; font-size: 0.875rem;`,
      hover: { css: `background: ${tc(theme, "primary")}; letter-spacing: 0.04em;` },
    }),
    ghostButtonStyle: (theme) => ({
      color: tc(theme, "primary"),
      background: "transparent",
      fontWeight: "600",
      borderRadius: "0",
      padding: { top: "1rem", right: "2.5rem", bottom: "1rem", left: "2.5rem" },
      css: `border: 1px solid ${tc(theme, "border")}; transition: all 0.2s ease; letter-spacing: 0.02em; text-transform: uppercase; font-size: 0.875rem;`,
      hover: { css: `border-color: ${tc(theme, "primary")}; color: ${tc(theme, "primary")};` },
    }),
    defaultEntrance: "fadeIn",
    defaultHover: "grow",
  },
};

export const DESIGN_STYLE_NAMES = Object.keys(DESIGN_STYLES) as DesignStyleId[];

/** Get a design style by ID, falling back to flat */
export function getDesignStyle(id?: string): DesignStyle {
  if (id && id in DESIGN_STYLES) return DESIGN_STYLES[id as DesignStyleId];
  return DESIGN_STYLES.flat;
}

/**
 * Resolve a card style for a given design style + theme.
 * Returns a style object ready to spread onto a BlueprintNode.
 */
export function resolveCardStyle(styleId: string | undefined, theme: Record<string, unknown>): Record<string, unknown> {
  const style = getDesignStyle(styleId);
  return style.cardStyle(theme);
}

/**
 * Resolve a section background style for a given design style + theme.
 * variant: "default" | "alt" | "dark"
 */
export function resolveSectionStyle(styleId: string | undefined, theme: Record<string, unknown>, variant?: string): Record<string, unknown> {
  const style = getDesignStyle(styleId);
  return style.sectionStyle(theme, variant);
}

/**
 * Resolve a primary button style for a given design style + theme.
 */
export function resolveButtonStyle(styleId: string | undefined, theme: Record<string, unknown>): Record<string, unknown> {
  const style = getDesignStyle(styleId);
  return style.buttonStyle(theme);
}

/**
 * Resolve a ghost button style for a given design style + theme.
 */
export function resolveGhostButtonStyle(styleId: string | undefined, theme: Record<string, unknown>): Record<string, unknown> {
  const style = getDesignStyle(styleId);
  return style.ghostButtonStyle(theme);
}

/**
 * Get the default entrance animation for a design style.
 */
export function getDefaultEntrance(styleId: string | undefined): string | undefined {
  return getDesignStyle(styleId).defaultEntrance;
}

/**
 * Get the default hover animation for a design style.
 */
export function getDefaultHover(styleId: string | undefined): string | undefined {
  return getDesignStyle(styleId).defaultHover;
}