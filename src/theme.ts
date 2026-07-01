/**
 * Per-site design tokens. A blueprint declares a `theme`, and any string value
 * in the tree (style values, text, urls) may reference tokens as {dotted.path}.
 *
 * Example:
 *   theme: { colors: { primary: "#1A2D5A" }, radius: { md: "1rem" } }
 *   style: { color: "{colors.primary}", borderRadius: "{radius.md}" }
 */

/**
 * Fallback tokens so templates (and any blueprint) always resolve. A user /
 * site / page theme layers on top of these — define only what you want to
 * override. The token names here are the ones the templates and playbook use.
 */
export const DEFAULT_THEME: Record<string, unknown> = {
  colors: {
    primary: "#1A2D5A",
    accent: "#E8743B",
    bg: "#FFFFFF",
    surface: "#F6F8FB",
    text: "#1A1A1A",
    muted: "#5B6472",
    border: "#E3E8EF",
    onPrimary: "#FFFFFF",
    onAccent: "#FFFFFF",
  },
  fonts: { heading: "Poppins, sans-serif", body: "Inter, sans-serif" },
  radius: { sm: "0.5rem", md: "1rem", lg: "1.75rem", pill: "999px" },
  shadow: { card: "0 10px 40px rgba(26,45,90,0.10)" },
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/** Deep-merge `override` onto `base` (override wins; objects merge recursively). */
export function deepMerge(base: Record<string, unknown>, override?: Record<string, unknown> | null): Record<string, unknown> {
  if (!override) return JSON.parse(JSON.stringify(base));
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** A blueprint/site/page theme merged over the defaults. */
export function resolveTheme(userTheme?: Record<string, unknown> | null): Record<string, unknown> {
  return deepMerge(DEFAULT_THEME, userTheme);
}

function lookup(theme: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = theme;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  // Flat fallback: if not found by full path, try matching the last segment
  // against any group's key (lets authors write {primary} for {colors.primary}).
  if (cur === theme && parts.length === 1) return undefined;
  return typeof cur === "string" || typeof cur === "number" ? String(cur) : undefined;
}

function flatLookup(theme: Record<string, unknown>, key: string): string | undefined {
  for (const group of Object.values(theme)) {
    if (group && typeof group === "object" && key in (group as Record<string, unknown>)) {
      const v = (group as Record<string, unknown>)[key];
      if (typeof v === "string" || typeof v === "number") return String(v);
    }
  }
  return undefined;
}

/** Replace all {token.path} references in a string with theme values. */
export function resolveTokensInString(value: string, theme: Record<string, unknown>): string {
  return value.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (match, path) => {
    const direct = lookup(theme, path);
    if (direct !== undefined) return direct;
    if (!path.includes(".")) {
      const flat = flatLookup(theme, path);
      if (flat !== undefined) return flat;
    }
    return match; // leave unknown tokens untouched
  });
}

/** Recursively resolve tokens in any JSON-ish value. */
export function resolveTokens<T>(value: T, theme: Record<string, unknown>): T {
  if (typeof value === "string") {
    return resolveTokensInString(value, theme) as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => resolveTokens(v, theme)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>))
      out[k] = resolveTokens(v, theme);
    return out as T;
  }
  return value;
}
