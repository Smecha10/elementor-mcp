/**
 * Client intake: the structured discovery the agent runs *before* designing.
 *
 * `INTAKE` is the questionnaire (company facts + design direction). The agent
 * asks these, fills a `Brief`, and the brief then drives theme generation
 * (color/personality), copy, page selection and SEO. Capturing this explicitly
 * is what stops every generated site from looking and reading the same.
 */
import { PERSONALITY_NAMES, PERSONALITIES } from "./design.js";

export interface IntakeQuestion {
  id: string;
  question: string;
  why: string;
  required: boolean;
  example?: string;
  options?: string[];
}

export interface IntakeSection {
  section: string;
  questions: IntakeQuestion[];
}

export const INTAKE: IntakeSection[] = [
  {
    section: "Company",
    questions: [
      { id: "name", question: "Company / brand name?", why: "Used everywhere: nav, hero, footer, SEO title, schema.", required: true, example: "Northpeak HR" },
      { id: "tagline", question: "One-line tagline or value proposition?", why: "Becomes the hero subheading and meta description seed.", required: true, example: "Compliant, human HR for growing Utah teams." },
      { id: "whatYouDo", question: "In 2–3 sentences, what does the business do and for whom?", why: "Drives all body copy and the services/about sections.", required: true },
      { id: "industry", question: "Industry / category?", why: "Informs schema.org type, tone, imagery and section choices.", required: true, example: "HR consulting" },
      { id: "location", question: "Primary location(s) / service area?", why: "Local SEO, contact section, LocalBusiness schema.", required: false, example: "Salt Lake City, UT" },
      { id: "founded", question: "Year founded / years in business?", why: "Trust signal; an optional stat in social-proof.", required: false },
    ],
  },
  {
    section: "Audience & goals",
    questions: [
      { id: "audience", question: "Who is the ideal customer? (role, size, pains)", why: "Sets reading level, tone, and which benefits lead.", required: true, example: "Owners of 20–200 person companies without an HR dept." },
      { id: "primaryGoal", question: "The #1 action a visitor should take?", why: "Defines the primary CTA repeated through the page.", required: true, options: ["Book a call", "Request a quote", "Buy / subscribe", "Sign up", "Contact", "Call now", "Download"] },
      { id: "secondaryGoal", question: "A secondary action? (optional)", why: "Secondary/ghost CTA.", required: false },
      { id: "tone", question: "Brand voice in 3 adjectives?", why: "Tunes copy + maps to a design personality.", required: true, example: "approachable, expert, no-nonsense" },
    ],
  },
  {
    section: "Brand & design direction",
    questions: [
      { id: "brandColor", question: "Primary brand color (hex)? If unknown, describe it.", why: "Seeds the whole palette via generate_theme.", required: true, example: "#1A2D5A" },
      { id: "accentColor", question: "Accent color (hex), if you have one?", why: "Used for CTAs; otherwise derived from the brand color.", required: false },
      { id: "hasLogo", question: "Do you have a logo / brand fonts? (paste URLs)", why: "Logo goes in the nav/footer; brand fonts override the personality pairing.", required: false },
      {
        id: "personality",
        question: `Which design personality best fits? (${PERSONALITY_NAMES.join(", ")})`,
        why: "Picks font pairing, radii, shadows and spacing rhythm so the site has a distinct character.",
        required: true,
        options: PERSONALITY_NAMES,
      },
      { id: "likedSites", question: "1–3 sites whose look you like?", why: "Concrete reference for layout/feel.", required: false },
      { id: "avoid", question: "Anything to avoid? (competitor look-alikes, colors, clichés)", why: "Explicit anti-patterns keep the result from looking generic.", required: false },
      { id: "imagery", question: "Image direction — real photos (URLs), illustration, or stock?", why: "Determines hero/section media. Real assets beat stock for uniqueness.", required: false },
    ],
  },
  {
    section: "Content & structure",
    questions: [
      { id: "pages", question: "Which pages do you need?", why: "Drives build_site page list.", required: true, example: "Home, Services, About, Contact", options: ["Home", "Services", "About", "Pricing", "Portfolio/Work", "Blog", "Contact", "FAQ"] },
      { id: "services", question: "List your top services/products (3–6) with a one-line benefit each.", why: "Feature grid + services page.", required: true },
      { id: "proof", question: "Any testimonials, client logos, stats, awards, certifications?", why: "Social-proof section; major trust + conversion lever.", required: false },
      { id: "contact", question: "Contact details — email, phone, address, hours, booking link?", why: "Contact section, footer, schema, the primary CTA target.", required: true },
      { id: "social", question: "Social profile URLs?", why: "Footer links + sameAs in schema.", required: false },
    ],
  },
  {
    section: "SEO",
    questions: [
      { id: "keywords", question: "Top 3–5 search phrases you want to rank for?", why: "Shapes headings, copy, meta title/description and slugs.", required: true, example: "outsourced HR Utah, HR compliance consulting" },
      { id: "competitors", question: "2–3 competitor sites (for differentiation, not copying)?", why: "Avoid their look; find content gaps to beat.", required: false },
    ],
  },
];

/** A skeleton Brief the agent fills in — handed back with the questionnaire. */
export const BRIEF_TEMPLATE = {
  company: { name: "", tagline: "", whatYouDo: "", industry: "", location: "", founded: "" },
  audience: { audience: "", primaryGoal: "", secondaryGoal: "", tone: "" },
  brand: { brandColor: "", accentColor: "", personality: "modern", logo: "", likedSites: "", avoid: "", imagery: "" },
  content: { pages: ["Home"], services: [{ name: "", benefit: "" }], proof: "", contact: { email: "" }, social: [] },
  seo: { keywords: [], competitors: [] },
};

/** Heuristic: map a brand voice / industry to a recommended personality. */
export function suggestPersonality(tone: string, industry: string): { personality: string; reason: string } {
  const t = `${tone} ${industry}`.toLowerCase();
  const map = [
    { test: /lux|premium|elegan|refin|spa|wellness|beaut|hospital|jewel|fine/, personality: "elegant", reason: "premium / refined cues" },
    { test: /fun|kid|craft|community|friendly|local|playful|family/, personality: "playful", reason: "friendly / approachable cues" },
    { test: /bold|energ|fitness|gym|event|sport|food|nightlife|youth/, personality: "bold", reason: "high-energy cues" },
    { test: /minimal|portfolio|architect|photo|gallery|studio|clean/, personality: "minimal", reason: "content-first / minimal cues" },
    { test: /finance|legal|consult|insur|account|b2b|corporate|medical|enterprise/, personality: "corporate", reason: "trust / professional cues" },
    { test: /saas|tech|software|startup|app|ai|platform|agency|digital/, personality: "modern", reason: "tech / modern cues" },
  ];
  for (const m of map)
    if (m.test.test(t)) return { personality: m.personality, reason: m.reason };
  return { personality: "modern", reason: "sensible default" };
}

/** Render the questionnaire as readable markdown for the agent to ask through. */
export function renderIntakeMarkdown(): string {
  const lines: string[] = [
    "# Client Intake — answer these before I design",
    "",
    "I'll turn these answers into a brand-derived theme, page structure, copy and SEO.",
    "Required questions are marked **\\***. Personalities available: " + PERSONALITY_NAMES.join(", ") + ".",
    "",
  ];
  for (const sec of INTAKE) {
    lines.push(`## ${sec.section}`);
    for (const q of sec.questions) {
      lines.push(`- ${q.required ? "**\\*** " : ""}**${q.id}** — ${q.question}`);
      lines.push(`    - _why:_ ${q.why}`);
      if (q.options) lines.push(`    - _options:_ ${q.options.join(", ")}`);
      if (q.example) lines.push(`    - _e.g._ ${q.example}`);
    }
    lines.push("");
  }
  lines.push("## Personalities");
  for (const name of PERSONALITY_NAMES) {
    lines.push(`- **${name}** — ${PERSONALITIES[name].description}`);
  }
  return lines.join("\n");
}
