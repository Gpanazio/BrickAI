# SEO + GEO Growth Engine — Design Document

**Date:** 2026-03-23
**Status:** Approved
**Approach:** C — Full Growth Engine (SEO + GEO + Content Strategy)
**Target:** Rank on Google (PT-BR + EN) AND appear in AI-generated answers (ChatGPT, Perplexity, Claude, Copilot)

---

## Current State

The site (ai.brick.mov) already has a strong SEO foundation:
- SSR with Express (server-rendered meta tags)
- Structured Data: Organization, WebSite, FAQ, Article, BreadcrumbList
- Hreflang pt-BR/en with x-default
- Dynamic sitemap at /sitemap.xml
- robots.txt with AI crawlers explicitly allowed
- llms.txt with brand positioning
- Multilingual i18n (i18next)

**Critical Gaps:**
- GA4 exists (G-53Z01QN33Y) but is NOT integrated
- No Google Search Console / Bing Webmaster verification
- No Core Web Vitals monitoring
- No VideoObject schema (for a video production company!)
- No individual case study pages (all projects on one /works page)
- No RSS feed
- No 404 page
- 4 font families loading render-blocking
- Same og-image.jpg for all pages
- No llms-full.txt

---

## Phase 1: Foundation (Quick Wins)

### 1.1 GA4 Integration
- Add gtag.js script with ID `G-53Z01QN33Y` to `index.html` template
- Inject via SSR to ensure it loads on all routes

### 1.2 Webmaster Verification
- Google Search Console: add `<meta name="google-site-verification">` to `<head>`
- Bing Webmaster Tools: add `<meta name="msvalidate.01">` to `<head>`
- Verification codes to be obtained by user from respective dashboards

### 1.3 Apple Touch Icon
- Generate 180x180 PNG from existing favicon.svg
- Add `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`

### 1.4 Custom 404 Page
- Server-side catch-all route returning proper 404 status code
- SEO-friendly page with navigation back to main sections
- Avoid soft-404s that waste crawl budget

### 1.5 Font Optimization
- Add `&display=swap` to Google Fonts URL (already has it, verify)
- Preload primary font (Space Grotesk) with `<link rel="preload">`
- Evaluate reducing from 4 font families to 2-3

### 1.6 Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Quality signal for search engines

---

## Phase 2: SEO Technical & Structured Data

### 2.1 VideoObject Schema
- Add `VideoObject` JSON-LD to each project in Works
- Fields: name, description, thumbnailUrl, uploadDate, duration, contentUrl
- Enables video rich results in Google Search

### 2.2 CreativeWork Schema
- Each project as `CreativeWork` with:
  - director, productionCompany, award
  - genre, dateCreated, description
- Signals authority and awards (Gramado, Genero) to Google and LLMs

### 2.3 Per-Page OG Images
- Distinct og:image for Works (portfolio collage), About (team/brand), Transmissions (blog visual)
- Individual OG images for each blog post (if thumbnail exists)

### 2.4 RSS Feed
- New endpoint `/rss.xml` serving Transmissions posts
- Standard RSS 2.0 with title, description, link, pubDate, guid
- AI bots and aggregators consume RSS for content discovery

### 2.5 Canonical Audit
- Ensure consistent trailing slash policy across all routes
- Verify canonical URLs match actual served URLs

### 2.6 Article Tags
- Add `article:tag` OG meta tags to Transmission posts
- Improves categorization by search engines and LLMs

### 2.7 Prerender Hints
- `<link rel="preload">` for hero image and primary font
- Improves LCP (Largest Contentful Paint)

### 2.8 Enriched Sitemap
- Add `<image:image>` tags for project thumbnails
- Add `<video:video>` tags for video projects
- Improves Google Image/Video Search indexing

---

## Phase 3: GEO (Generative Engine Optimization)

### 3.1 llms-full.txt
- Expanded version with:
  - Detailed case studies (process, tools, results)
  - Technical methodology (ComfyUI, Stable Diffusion, workflow details)
  - Competitive differentiators
  - Client testimonials/quotes
- Link from llms.txt: `Full version: https://ai.brick.mov/llms-full.txt`

### 3.2 llms.txt Update
- Add link to llms-full.txt
- Update pricing if changed
- Add methodology section
- Add "When to hire us vs. competitors" section

### 3.3 Speakable Schema
- Add `speakable` property to home page and blog posts
- Identifies which sections are best for voice/AI citation
- Increases chance of appearing in Google AI Overviews

### 3.4 Expanded FAQ
- Grow from 7 to 15+ questions covering:
  - "How does AI video compare to traditional production?"
  - "How long does an AI video project take?"
  - "What's the budget range for AI video?"
  - "What tools does Brick AI use?"
  - "Can AI replace a film crew?"
  - "What brands have worked with Brick AI?"
  - "How do you ensure visual consistency in AI video?"
  - "What's the difference between Brick AI and other AI video tools?"
- These are the exact questions people ask LLMs

### 3.5 Entity Consistency
- Standardize "Brick AI" naming across all schemas, social profiles, content
- Consistent sameAs URLs in Organization schema
- LLMs build entity graphs — consistency strengthens the entity

### 3.6 About Page as Authority Hub
- Expand with:
  - Company timeline (2016 → traditional → 2024 → AI division)
  - Tools and tech stack (ComfyUI, Stable Diffusion, etc.)
  - Technical methodology
  - Team expertise signals
- LLMs extract expertise signals — specificity = trustworthiness

### 3.7 Claim-Source Pattern
- Every claim in llms.txt and site content links to proof
- "Gramado 2025" → link to official festival selection
- "Worked with Stone, Visa, BBC" → link to case studies
- LLMs prioritize sourced claims over unsourced ones

### 3.8 AI-Friendly Content Format
- All Transmissions posts with clear H2/H3 hierarchy
- Bullet lists, definitions, key takeaways
- Format that LLMs parse and extract easily

---

## Phase 4: Content Strategy & Programmatic Pages

### 4.1 Individual Case Study Pages
- New route: `/works/:slug` (e.g., `/works/inheritance`, `/works/autobol`)
- Each page includes:
  - Long description, creative process, tools used
  - Embedded video (if available)
  - VideoObject + CreativeWork schema
  - Internal links to related posts
- Today everything is compressed into `/works` — this unlocks long-tail keywords

### 4.2 Keyword Clusters
Three content pillars:
1. **"Produtora de video com IA" / "AI video production"** — service pages
2. **"Filme feito com IA" / "AI-generated film"** — case studies + awards
3. **"Video comercial com IA" / "AI commercial production"** — commercial work

Each pillar generates a group of interlinked pages building topical authority.

### 4.3 SEO-Driven Blog Posts
New Transmissions content targeting researched keywords:
- "Como fazer video com IA" / "How to make AI video"
- "Quanto custa produzir com IA" / "AI video production cost"
- "IA vs producao tradicional" / "AI vs traditional video production"
- "Melhores ferramentas de video com IA" / "Best AI video tools"

Captures informational traffic — these searchers are potential clients.

### 4.4 HowTo Schema
- On tutorial/educational posts, add HowTo JSON-LD
- Triggers "how to" rich results in Google — high visibility

### 4.5 Internal Linking Strategy
- Each post references relevant projects
- Each case study links related blog posts
- Distributes authority, improves crawlability, increases time on site

### 4.6 Content Calendar
- Template: minimum 2 posts/month
- Alternating between educational and case study content
- Consistent publishing signals active site to Google and LLMs

### 4.7 Multilingual Content Parity
- All new content published in PT-BR and EN simultaneously
- Doubles keyword reach, strengthens hreflang signals

---

## Phase 5: Monitoring, Performance & Link Building

### 5.1 Core Web Vitals Dashboard
- Integrate `web-vitals` npm package in client
- Send LCP, FID, CLS, INP, TTFB to GA4 as custom events
- Without measurement, no improvement possible

### 5.2 Lighthouse CI
- Automated performance check on deploy
- Minimum score target: 90
- Prevents performance regressions

### 5.3 Font Subsetting
- Load only latin glyphs for all font families
- Evaluate reducing from 4 to 2 families (Space Grotesk + JetBrains Mono)
- Direct impact on LCP

### 5.4 Image Optimization Pipeline
- Serve images in WebP/AVIF with `<picture>` fallback
- Lazy loading for images below the fold
- Images are the heaviest asset — optimization improves everything

### 5.5 Cache Strategy
- `Cache-Control: stale-while-revalidate` for HTML
- Long max-age for hashed assets (already partially implemented)
- Improves TTFB on return visits

### 5.6 Link Building — Festivals & Press
- Submit case studies to relevant publications:
  - Cinema: No Film School, Motionographer, Short of the Week
  - Tech/Creative: B9, Meio & Mensagem, The Verge (AI section)
  - Brazilian press: Folha, Estadao (tech sections)
- Backlinks from relevant sites = #1 Google ranking factor

### 5.7 Link Building — AI Directories
- List Brick AI on:
  - "There's an AI for that"
  - ProductHunt
  - alternativeTo
  - FutureTools
- Thematic backlinks + discovery by new audience

### 5.8 Social Proof Schema
- Add `Review` and `AggregateRating` schema when client testimonials are available
- Reviews in structured data generate star ratings in Google results

### 5.9 Monitoring Alerts
- GSC alerts for indexation drops
- GA4 alerts for traffic drops >30%
- Detect problems before they become crises

---

## Implementation Priority

| Priority | Phase | Estimated Effort |
|----------|-------|-----------------|
| P0 | Phase 1: Foundation | 1-2 days |
| P1 | Phase 2: SEO Technical | 3-4 days |
| P1 | Phase 3: GEO | 3-4 days |
| P2 | Phase 4: Content Strategy | Ongoing (2+ weeks setup) |
| P2 | Phase 5: Monitoring & Link Building | 2-3 days setup + ongoing |

**Total technical implementation:** ~2-3 weeks
**Content creation:** Ongoing monthly effort

---

## Success Metrics

- **SEO:** GSC impressions +50% in 3 months, organic clicks +30%
- **GEO:** Brick AI cited in ChatGPT/Perplexity for "AI video production" queries
- **Performance:** Lighthouse score >90 on all pages
- **Leads:** Contact form submissions +25% from organic
- **Content:** 2 posts/month minimum, all bilingual
