/**
 * SEO generation. Elementor's page-template export (`content`/`page_settings`)
 * is not where meta titles, descriptions or structured data live — those belong
 * to the WordPress post and an SEO plugin (Yoast / Rank Math) or the document
 * <head>. So we keep the imported page JSON clean and emit SEO as a separate
 * sidecar object: meta tags, Open Graph, Twitter card and JSON-LD schema that
 * the agent (or the future WP plugin) applies at the WordPress level.
 */

interface SeoInput {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  siteName?: string;
  pageType?: string;
  noindex?: boolean;
  business?: {
    name?: string;
    type?: string;
    description?: string;
    url?: string;
    logo?: string;
    image?: string;
    telephone?: string;
    email?: string;
    priceRange?: string;
    address?: {
      street?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
    geo?: { lat: number; lng: number };
    sameAs?: string[];
    openingHours?: unknown[];
  };
}

interface SeoResult {
  meta: {
    title: string;
    description: string;
    slug: string;
    canonical?: string;
    robots: string;
    keywords?: string;
  };
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  jsonLd: Record<string, unknown>[];
  headHtml: string;
  warnings: string[];
}

function clamp(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, "").trim() + "…";
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "page";
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Build the SEO sidecar for one page. */
export function buildSeo(input: SeoInput): SeoResult {
  const warnings: string[] = [];
  const siteName = input.siteName?.trim();
  const baseTitle = (input.metaTitle || input.title).trim();
  const title = siteName && !baseTitle.toLowerCase().includes(siteName.toLowerCase())
    ? clamp(`${baseTitle} | ${siteName}`, 60)
    : clamp(baseTitle, 60);
  if ((input.metaTitle || input.title).length > 60)
    warnings.push("Title was longer than 60 chars and got trimmed for SERP display.");

  let description = (input.metaDescription || "").trim();
  if (!description) {
    description = input.business?.description?.trim() || `${input.title}.`;
    warnings.push("No metaDescription provided — generated a placeholder; write a 150–160 char description.");
  }
  description = clamp(description, 160);
  if (description.length < 70)
    warnings.push("Meta description is short (<70 chars); 150–160 converts better.");

  const slug = slugify(input.slug || input.title);
  const robots = input.noindex ? "noindex, nofollow" : "index, follow";

  const openGraph: Record<string, string> = {
    "og:type": "website",
    "og:title": title,
    "og:description": description,
  };
  if (siteName) openGraph["og:site_name"] = siteName;
  if (input.canonical) openGraph["og:url"] = input.canonical;
  if (input.ogImage) openGraph["og:image"] = input.ogImage;
  else warnings.push("No ogImage — social shares will have no preview image (recommend 1200×630).");

  const twitter: Record<string, string> = {
    "twitter:card": input.ogImage ? "summary_large_image" : "summary",
    "twitter:title": title,
    "twitter:description": description,
  };
  if (input.ogImage) twitter["twitter:image"] = input.ogImage;

  const jsonLd = buildJsonLd(input);
  const headHtml = renderHead({ title, description, robots, keywords: input.keywords, canonical: input.canonical, openGraph, twitter, jsonLd });

  return {
    meta: {
      title,
      description,
      slug,
      canonical: input.canonical,
      robots,
      keywords: input.keywords?.length ? input.keywords.join(", ") : undefined,
    },
    openGraph,
    twitter,
    jsonLd,
    headHtml,
    warnings,
  };
}

function buildJsonLd(input: SeoInput): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const b = input.business;
  if (b) {
    const node: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": b.type || "Organization",
      name: b.name,
    };
    if (b.description) node.description = b.description;
    if (b.url) node.url = b.url;
    if (b.logo) node.logo = b.logo;
    if (b.image) node.image = b.image;
    if (b.telephone) node.telephone = b.telephone;
    if (b.email) node.email = b.email;
    if (b.priceRange) node.priceRange = b.priceRange;
    if (b.address) {
      node.address = {
        "@type": "PostalAddress",
        streetAddress: b.address.street,
        addressLocality: b.address.city,
        addressRegion: b.address.region,
        postalCode: b.address.postalCode,
        addressCountry: b.address.country,
      };
    }
    if (b.geo) node.geo = { "@type": "GeoCoordinates", latitude: b.geo.lat, longitude: b.geo.lng };
    if (b.sameAs?.length) node.sameAs = b.sameAs;
    if (b.openingHours?.length) node.openingHoursSpecification = b.openingHours;
    out.push(node);
  }
  // Per-page WebPage node when a specific page type is requested.
  if (input.pageType && input.pageType !== "WebPage") {
    out.push({
      "@context": "https://schema.org",
      "@type": input.pageType,
      name: input.metaTitle || input.title,
      ...(input.canonical ? { url: input.canonical } : {}),
    });
  }
  return out;
}

function renderHead(d: {
  title: string;
  description: string;
  robots: string;
  keywords?: string[];
  canonical?: string;
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  jsonLd: Record<string, unknown>[];
}): string {
  const lines: string[] = [];
  lines.push(`<title>${esc(d.title)}</title>`);
  lines.push(`<meta name="description" content="${esc(d.description)}" />`);
  lines.push(`<meta name="robots" content="${esc(d.robots)}" />`);
  if (d.keywords?.length) lines.push(`<meta name="keywords" content="${esc(d.keywords.join(", "))}" />`);
  if (d.canonical) lines.push(`<link rel="canonical" href="${esc(d.canonical)}" />`);
  for (const [k, v] of Object.entries(d.openGraph))
    lines.push(`<meta property="${esc(k)}" content="${esc(v)}" />`);
  for (const [k, v] of Object.entries(d.twitter))
    lines.push(`<meta name="${esc(k)}" content="${esc(v)}" />`);
  for (const node of d.jsonLd) {
    lines.push(`<script type="application/ld+json">${JSON.stringify(node)}</script>`);
  }
  return lines.join("\n");
}
