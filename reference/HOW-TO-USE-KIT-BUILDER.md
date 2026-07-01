# 🧩 How to Use This Repo – Kit Builder Guide

**Who this is for:** You’ve been building WordPress sites for a few years, you live in **Elementor Pro**, and you’re comfortable creating **template kits** (pages, headers, footers, popups, etc.).

> Want a gentler introduction to this repo?  
> Start with the basics guide: **[HOW-TO-USE-BASICS.md](./HOW-TO-USE-BASICS.md)**.

This repo is your **Elementor JSON library** and your **AI training set**. The way you structure and name your files tells the AI (and future you) how to build new layouts.

---

## 1. 🗂️ Recap: Key Folders for Power Users

You probably don’t need a full tour, just the important parts:

- `clients/` – One folder **per client/site**, with brand assets, JSON templates, and client rules.
- `examples/` – General examples and kit-style templates not tied to any specific client.
- `docs/` – Global rules, widget modes, and JSON structure docs for AI + humans.

You’ll mostly work in **`clients/`** (for real projects) and **`examples/`** (for reusable kits).

---

## 2. 🧷 Client Projects: Training JSON per Client

When you’re building a kit for a **specific client**, treat `clients/<client-slug>/` as home base.

### 2.1 🏷️ Choose a clean client slug

Use something predictable and URL-safe:

- `clients/acme-co/`
- `clients/green-garden/`
- `clients/bright-studio/`

Prefer lowercase + dashes.

### 2.2 🧱 Use the recommended structure

Inside each client folder:

- `clients/<client-slug>/branding/`  
  Logos, brand colors, typography samples, maybe a simple `notes.md` about tone and brand voice.
- `clients/<client-slug>/templates/`  
  All exported Elementor JSON files for that client.
- `clients/<client-slug>/docs/`  
  Client-specific rules: which widgets you prefer, layout patterns, SEO constraints, performance rules, etc.

### 2.3 🧩 Name JSON like a kit, not a dump

Don’t leave template names as `my-template-123.json`.

Instead, name them by **role and variation**:

- `home-v1-hero-focused.json`
- `home-v2-gallery-focused.json`
- `header-main-sticky.json`
- `footer-simple-centered.json`
- `pricing-section-3-column.json`

Optional but helpful: **prefix by type** so patterns are obvious:

- `page-home-v1.json`, `page-services-v1.json`
- `section-hero-dark.json`, `section-faq-accordion.json`
- `theme-header-main.json`, `theme-footer-alt.json`
- `popup-exit-intent-offer.json`

This gives the AI **strong signals** when you say things like:

> "Use the `pricing-section-3-column` pattern from this client when you build the new kit."

---

## 3. 📚 Non-Client Kits: Building a General Example Library

When you’re creating reusable kits that aren’t tied to a single client, use `examples/` as your **public library**.

### 3.1 📁 Create a folder per kit or style family

Examples:

- `examples/saas-starter-kit/`
- `examples/photography-portfolio/`
- `examples/restaurant-one-page/`

### 3.2 🧱 Organize by type inside each kit folder

A simple, clear breakdown might look like:

- `pages/` – full page templates (home, about, services, etc.).
- `sections/` – reusable sections (hero, pricing, FAQ, contact, testimonials, etc.).
- `theme-parts/` – headers, footers, single, archive layouts.
- `popups/` – announcement bars, newsletter popups, exit-intent offers.

### 3.3 🏷️ Use descriptive filenames

Examples:

- `pages/home-saas-v1.json`
- `pages/home-saas-v2.json`
- `sections/pricing-3-tier.json`
- `sections/testimonials-carousel-alt.json`
- `theme-parts/header-transparent-nav.json`
- `popups/newsletter-slide-in.json`

### 3.4 📝 Document the kit briefly

Drop a short `NOTES.md` into each kit folder with:

- What the kit is for (SaaS, restaurant, portfolio, etc.).
- Which key widgets are used (especially **Pro widgets** like Posts, Theme Builder widgets, etc.).
- Any layout tricks (sticky headers, scroll effects, dynamic tags, etc.).

This turns `examples/` into a **teachable reference** for the AI and any humans you collaborate with.

---

## 4. 🤖 Using the Repo With an AI Assistant

Because your JSON is now organized and named clearly, you can give the AI precise instructions, like:

- "For this new **fitness kit**, follow the structure of `examples/saas-starter-kit/pages/home-saas-v1.json` but swap in a pricing block like `sections/pricing-3-tier.json`."
- "For **Client Green Garden**, make a new homepage based on `clients/green-garden/templates/page-home-v1.json`, but change the hero to be more form-focused."

Behind the scenes, the AI will consult:

- `docs/core-rules.md` for global do/don’t rules.
- `docs/elementor-modes-free-vs-pro.md` to keep widget choices legal.
- `docs/elementor-json-templates.md` to keep the JSON structure valid.
- Your `clients/...` or `examples/...` JSON to **mirror patterns** you already designed.

---

## 5. ⚡ Power Tips for Getting the Most Out of This Repo

1. **Think in reusable patterns, not one-off pages.**  
   Export sections (heroes, pricing, testimonials) as well as full pages so the AI can mix and match.

2. **Write down your constraints.**  
   Put rules like "No carousels", "Use flexbox containers only", or "Use clamp() for typography" into:
   - `clients/<client-slug>/docs/` for client-specific rules.
   - Or propose changes to `docs/core-rules.md` for global rules.

3. **Be consistent with prefixes.**  
   Stick to a small set like `page-`, `section-`, `theme-`, `popup-`, `component-` so patterns are easy to parse.

4. **Always back your AI requests with examples.**  
   Instead of "make a homepage", say:
   - "Make a homepage using `page-home-saas-v1.json` as the base and swap the hero for a layout like `section-hero-dark.json`."

5. **Let Elementor generate the JSON.**  
   Avoid heavy manual editing inside JSON unless you know the structure very well. Clean exports are the safest training data.

If you follow these patterns, this repo turns into a **serious kit-building system**: a library of JSON you trust, plus documentation that lets an AI (and teammates) extend your work without breaking your standards.
