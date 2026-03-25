<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Brick AI Platform

> Born on set. The same soul. A new body.

Brick AI is the generative AI division of [Brick](https://brick.mov), a Brazilian video production house with 10+ years of filmmaking experience. This repository contains the full-stack platform powering [ai.brick.mov](https://ai.brick.mov).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | TailwindCSS 3.4 + custom animations |
| Animations | Framer Motion 12 |
| 3D | Three.js |
| i18n | i18next (PT-BR + EN) |
| Backend | Express.js 4 (SSR + API) |
| Database | PostgreSQL (Railway) |
| Auth | JWT + bcrypt |
| Deployment | Railway |

## Architecture

```
React SPA (Vite)  →  Express SSR (meta tags, JSON-LD, OG)  →  PostgreSQL
     ↓                         ↓
  Client-side routing     Server-rendered SEO
  Framer Motion           Structured Data
  Three.js 3D             Sitemap / RSS / llms.txt
```

The site is a **hybrid SPA with SSR for SEO**. Express reads a pre-built HTML template and injects meta tags, Open Graph data, and JSON-LD structured data before serving. The React app hydrates on the client.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, works showcase, philosophy, contact CTA |
| `/works` | Portfolio — AI films, campaigns, visual art |
| `/about` | Company history, manifesto, team |
| `/transmissions` | Blog — articles on AI video production |
| `/transmissions/:id` | Individual blog post |
| `/chat` | Mason — AI-powered chat assistant |

## Running Locally

```bash
# Install dependencies
npm install

# Frontend (Vite dev server)
npm run dev

# Backend (Express, requires DATABASE_URL)
npm run dev:server

# Production build
npm run build && npm start
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes (prod) | JWT signing secret (throws if missing in production) |
| `BASE_URL` | No | Site base URL (defaults to `https://ai.brick.mov`) |
| `OPENROUTER_API_KEY` | No | OpenRouter API key for Mason chat |
| `GOOGLE_SITE_VERIFICATION` | No | Google Search Console verification code |
| `BING_VERIFICATION` | No | Bing Webmaster Tools verification code |

## SEO + GEO Growth Engine

Full design doc: [`docs/plans/2026-03-23-seo-geo-growth-engine-design.md`](docs/plans/2026-03-23-seo-geo-growth-engine-design.md)
Implementation plan: [`docs/plans/2026-03-23-seo-geo-growth-engine-plan.md`](docs/plans/2026-03-23-seo-geo-growth-engine-plan.md)

### Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **1. Foundation** | Done | GA4, GSC/Bing verification, apple-touch-icon, 404 handling, trailing slash 301, font optimization, security headers (HSTS, X-Frame, Referrer-Policy) |
| **2. SEO Technical** | Done | RSS feed (`/rss.xml`), enriched sitemap with images, VideoObject + CreativeWork JSON-LD, dynamic OG images via SSR |
| **3. GEO** | Done | `llms-full.txt`, expanded FAQ (15 Q&A PT+EN), speakable schema, claim-source pattern, entity consistency |
| **4. Content Strategy** | Planned | Individual case study pages (`/works/:slug`), keyword clusters, SEO-driven blog posts, content calendar |
| **5. Monitoring** | Planned | Core Web Vitals to GA4, Lighthouse CI, image optimization pipeline, link building strategy |

### SEO Features

- **SSR meta injection** — title, description, OG, Twitter Card, canonical, hreflang per route and language
- **Structured Data (JSON-LD):**
  - `Organization` with services catalog and sameAs
  - `WebSite` with speakable specification
  - `BreadcrumbList` with dynamic hierarchy
  - `FAQPage` with 15 bilingual Q&A pairs (pricing, tools, comparisons)
  - `VideoObject` + `CreativeWork` for each portfolio project
  - `Article` with speakable for blog posts
- **Dynamic sitemap** (`/sitemap.xml`) — hreflang + image tags
- **RSS feed** (`/rss.xml`) — Transmissions with graceful DB fallback
- **HTTP 404** — proper status for unknown routes AND missing posts
- **301 redirects** — trailing slash canonical consistency
- **`BASE_URL`** — configurable domain for staging/local environments

### GEO Features (Generative Engine Optimization)

- **`/llms.txt`** — concise brand reference for AI crawlers with claim-source pattern
- **`/llms-full.txt`** — expanded reference with methodology, case studies, pricing, competitive comparison
- **`robots.txt`** — explicit AI crawler allowlist (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
- **Preferred citations** — guides how LLMs should reference Brick AI
- **FAQ schema** — 15 questions designed for AI extraction
- **Speakable schema** — xpath-based, marks content suitable for voice/AI citation

## Internationalization

- **Languages:** Portuguese (PT-BR) and English (EN)
- **Detection:** `?lang=` query param > `Accept-Language` header > default (PT)
- **Translation files:** `src/locales/en/translation.json` and `src/locales/pt/translation.json`
- **Managed by:** i18next + react-i18next

## Project Structure

```
BrickAI/
├── index.html              # HTML template with SSR placeholders
├── index.tsx               # React SPA (components, routing, animations)
├── server.js               # Express SSR + API server
├── seo-data.js             # Per-page SEO metadata (PT + EN)
├── works-schema-data.js    # Structured data for portfolio projects
├── shared/
│   └── breadcrumbs.js      # Shared breadcrumb logic (SSR + client)
├── src/
│   ├── index.css           # TailwindCSS + custom animations
│   ├── i18n.ts             # i18next configuration
│   ├── components/         # Shared components
│   └── locales/            # Translation files (en, pt)
├── public/
│   ├── robots.txt          # Crawl directives + AI crawler allowlist
│   ├── llms.txt            # AI crawler reference (concise)
│   ├── llms-full.txt       # AI crawler reference (detailed)
│   ├── favicon.svg         # Site favicon
│   ├── apple-touch-icon.png# iOS home screen icon (180x180)
│   └── og-image.jpg        # Default Open Graph image (1200x630)
├── docs/
│   └── plans/              # Design docs and implementation plans
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Audit Report — 2026-03-25 (Pre-Launch)

Issues identified but **not yet fixed**. Sorted by priority.

### Medium — Performance

| # | Location | Description | Fix command |
|---|----------|-------------|-------------|
| M1 | `index.tsx` (20+ spots) | Excessive GPU blur effects (`blur-[150px]`, `backdrop-blur-xl`) — heavy on mobile | `/simplifica` |
| M2 | `index.tsx:1170+,1600+,1710+` | 3 simultaneous canvas animations (Three.js + star field + waveform) | `/optimize` |
| M3 | `index.tsx:1602-1607` | `canvas.offsetWidth/Height` read in animation loop — triggers layout reflow per frame | `/optimize` |
| M4 | `index.tsx:1499-1502` | `flex-grow` animated via CSS transition instead of transform | `/optimize` |
| M5 | `index.tsx:931` | Logo `<img>` missing `loading="lazy"` | `/optimize` |
| M6 | `index.html:61` | 6 Google Fonts in single request — large blocking payload | `/optimize` |

### Medium — Theming

| # | Location | Description | Fix command |
|---|----------|-------------|-------------|
| M7 | `tailwind.config.js` | No dark mode config; no semantic colors (success, warning, error) | `/normalize` |
| M8 | `index.tsx` (30+ spots) | Hard-coded `rgba()`/hex in inline styles instead of CSS variables | `/normalize` |

### Medium — Responsive

| # | Location | Description | Fix command |
|---|----------|-------------|-------------|
| M9 | `index.tsx:1126` | `w-[600px] h-[600px]` hard-coded — overflows mobile | `/responsivo` |
| M10 | `index.tsx:1158` | `w-[800px] h-[800px]` hard-coded — overflows mobile | `/responsivo` |

### Medium — Security

| # | Location | Description | Fix command |
|---|----------|-------------|-------------|
| M11 | `server.js:60` | `rejectUnauthorized: false` for Railway proxy DB SSL | `/harden` |
| M12 | `server.js:125-130` | In-memory rate limiter `Map` grows unbounded under sustained attack | `/harden` |

### Low — Anti-patterns / i18n

| # | Location | Description |
|---|----------|-------------|
| L1 | `index.tsx:260-265` | CRT glitch uses cyan `rgba(0,255,255,0.5)` — AI color tell |
| L2 | `index.tsx:82` | Inter as body font — overused/generic |
| L3 | `src/locales` | PT translation of Inheritance `longDesc` oversimplifies vs EN |
| L4 | `src/locales` | System keys (`REACH_HUMANS`, `MANUAL_OVERRIDE`) left untranslated in PT |
| L5 | `robots.txt` | Missing `Crawl-delay` directive |
| L6 | `server.js:122` | Nonce generated on static asset requests (unnecessary CPU/entropy) |

### Positive Findings (Keep)

- Strong brand identity: dark brutalist/editorial aesthetic, brick-red on black
- Comprehensive `prefers-reduced-motion` support
- `focus-visible` keyboard indicators
- Skip-to-content link (CSS-only, CSP-safe)
- SSR SEO: JSON-LD, hreflang, breadcrumbs, dynamic OG images
- AI crawler strategy: `robots.txt` + `llms.txt` + `llms-full.txt`
- Vite manual chunk splitting for vendor bundles
