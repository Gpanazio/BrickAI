# SEO + GEO Growth Engine — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform ai.brick.mov into a dual-channel growth engine that ranks on Google (PT-BR + EN) and gets cited by AI assistants (ChatGPT, Perplexity, Claude, Copilot).

**Architecture:** Incremental improvements to the existing Express SSR + React SPA. All SEO/GEO changes happen in server.js (SSR), index.html (template), seo-data.js, and public/ static files. Content strategy adds new routes and DB-driven pages. No framework migration needed.

**Tech Stack:** Express.js SSR, React 18, Vite, PostgreSQL, i18next, TailwindCSS

---

## Phase 1: Foundation

### Task 1: Integrate GA4

**Files:**
- Modify: `index.html:4-6` (add gtag script in `<head>`)

**Step 1: Add GA4 script to HTML template**

Insert after `<meta charset="UTF-8" />` in `index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-53Z01QN33Y"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-53Z01QN33Y');
</script>
```

**Step 2: Build and verify**

Run: `npm run build`
Expected: dist/index.html contains the gtag script

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(seo): integrate GA4 tracking (G-53Z01QN33Y)"
```

---

### Task 2: Webmaster Verification Placeholders

**Files:**
- Modify: `index.html:15-16` (uncomment and update verification meta tags)

**Step 1: Enable verification meta tags**

Replace the commented-out verification tags in `index.html`:

```html
<!-- Webmaster Verification -->
<meta name="google-site-verification" content="__GOOGLE_VERIFICATION__" />
<meta name="msvalidate.01" content="__BING_VERIFICATION__" />
```

**Step 2: Add SSR replacement in server.js**

In the `app.get('*')` handler (~line 735), add replacements for the verification codes using env vars:

```javascript
.replace(/__GOOGLE_VERIFICATION__/g, process.env.GOOGLE_SITE_VERIFICATION || '')
.replace(/__BING_VERIFICATION__/g, process.env.BING_VERIFICATION || '')
```

**Step 3: Build and verify**

Run: `npm run build`
Expected: dist/index.html has the meta tags with placeholders

**Step 4: Commit**

```bash
git add index.html server.js
git commit -m "feat(seo): add Google/Bing webmaster verification meta tags (env-driven)"
```

> **Note to user:** After deploy, set `GOOGLE_SITE_VERIFICATION` and `BING_VERIFICATION` env vars in Railway with the codes from Google Search Console and Bing Webmaster Tools.

---

### Task 3: Apple Touch Icon

**Files:**
- Create: `public/apple-touch-icon.png` (180x180 PNG)
- Modify: `index.html:43` (uncomment apple-touch-icon link)

**Step 1: Generate apple-touch-icon from favicon**

Use the existing `public/favicon.svg` to create a 180x180 PNG. This can be done manually or with a tool like `sharp` or `svgexport`. For now, create a simple script:

```bash
npx svgexport public/favicon.svg public/apple-touch-icon.png 180:180
```

If svgexport is not available, use any SVG-to-PNG converter at 180x180.

**Step 2: Uncomment the link tag in index.html**

Replace line 43:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

**Step 3: Build and verify**

Run: `npm run build`
Expected: dist/apple-touch-icon.png exists, index.html references it

**Step 4: Commit**

```bash
git add public/apple-touch-icon.png index.html
git commit -m "feat(seo): add apple-touch-icon 180x180"
```

---

### Task 4: Custom 404 Page

**Files:**
- Modify: `server.js:516` (add 404 detection before catch-all)

**Step 1: Add 404 handling to the SSR catch-all**

In `server.js`, modify the `app.get('*')` handler. After determining the `view` variable (~line 557), add:

```javascript
// Known routes
const knownViews = ['home', 'works', 'about', 'transmissions', 'chat', 'post'];
const is404 = !knownViews.includes(view) && urlPath !== '';

if (is404) {
    // Set proper 404 status but still render the SPA (client handles the UI)
    const seo404 = {
        title: lang === 'en' ? 'Page Not Found | Brick AI' : 'Página Não Encontrada | Brick AI',
        description: lang === 'en' ? 'The page you are looking for does not exist.' : 'A página que você procura não existe.',
        ogTitle: '404 | Brick AI',
        ogDescription: lang === 'en' ? 'Page not found' : 'Página não encontrada'
    };
    const html404 = htmlTemplate
        .replace(/__LANG__/g, lang === 'pt' ? 'pt-BR' : 'en')
        .replace(/__META_TITLE__/g, seo404.title)
        .replace(/__META_DESCRIPTION__/g, seo404.description)
        .replace(/__OG_TITLE__/g, seo404.ogTitle)
        .replace(/__OG_DESCRIPTION__/g, seo404.ogDescription)
        .replace(/__OG_TYPE__/g, 'website')
        .replace(/__OG_URL__/g, `https://ai.brick.mov/${urlPath}`)
        .replace(/__OG_LOCALE__/g, lang === 'pt' ? 'pt_BR' : 'en_US')
        .replace(/__OG_LOCALE_ALT__/g, lang === 'pt' ? 'en_US' : 'pt_BR')
        .replace(/__CANONICAL_URL__/g, 'https://ai.brick.mov/')
        .replace(/__HREFLANG_PT__/g, 'https://ai.brick.mov/')
        .replace(/__HREFLANG_EN__/g, 'https://ai.brick.mov/?lang=en')
        .replace(/__GOOGLE_VERIFICATION__/g, process.env.GOOGLE_SITE_VERIFICATION || '')
        .replace(/__BING_VERIFICATION__/g, process.env.BING_VERIFICATION || '')
        .replace(/<!--__JSON_LD__-->/g, '');
    return res.status(404).send(html404);
}
```

**Step 2: Verify locally**

Run: `npm run dev:server`
Visit: `http://localhost:3002/nonexistent-page`
Expected: HTTP 404 status code (check in browser dev tools Network tab)

**Step 3: Commit**

```bash
git add server.js
git commit -m "feat(seo): add proper 404 status for unknown routes"
```

---

### Task 5: Font Optimization

**Files:**
- Modify: `index.html:49-51` (optimize Google Fonts loading)

**Step 1: Add preload for primary font and optimize loading**

Replace the current fonts block in `index.html`:

```html
<!-- Fonts: preload primary, swap all -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" as="style" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;900&family=JetBrains+Mono:wght@400;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
```

**Step 2: Build and verify**

Run: `npm run build`
Expected: preload link appears before stylesheet link in dist/index.html

**Step 3: Commit**

```bash
git add index.html
git commit -m "perf(seo): preload primary font, optimize Google Fonts loading order"
```

---

### Task 6: Security Headers

**Files:**
- Modify: `server.js:80` (add middleware before routes)

**Step 1: Add security headers middleware**

After `app.use(cookieParser());` (~line 81), add:

```javascript
// Security headers (SEO quality signal + protection)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});
```

**Step 2: Verify locally**

Run: `npm run dev:server`
Check response headers on any page. Expected: all 3 headers present.

**Step 3: Commit**

```bash
git add server.js
git commit -m "feat(seo): add security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)"
```

---

## Phase 2: SEO Technical & Structured Data

### Task 7: RSS Feed for Transmissions

**Files:**
- Modify: `server.js` (add `/rss.xml` endpoint after sitemap endpoint, ~line 505)

**Step 1: Add RSS endpoint**

After the `/sitemap.xml` handler, add:

```javascript
// RSS Feed for Transmissions
app.get('/rss.xml', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, data, created_at FROM transmissions ORDER BY created_at DESC LIMIT 50"
        );

        const items = result.rows.map(row => {
            const d = row.data;
            const title = (d.title && typeof d.title === 'object') ? (d.title.en || d.title.pt || 'Untitled') : (d.title || 'Untitled');
            const excerpt = (d.excerpt && typeof d.excerpt === 'object') ? (d.excerpt.en || d.excerpt.pt || '') : (d.excerpt || '');
            const date = new Date(row.created_at).toUTCString();
            const link = `https://ai.brick.mov/transmissions/${row.id}`;
            return `    <item>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${excerpt}]]></description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
    </item>`;
        }).join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Brick AI — Transmissions</title>
    <link>https://ai.brick.mov/transmissions</link>
    <description>Insights on AI video production from a team with 10+ years on real film sets.</description>
    <language>en</language>
    <atom:link href="https://ai.brick.mov/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

        res.set('Content-Type', 'application/rss+xml');
        res.send(xml);
    } catch (err) {
        console.error('RSS generation error:', err);
        res.status(500).send('Error generating RSS feed');
    }
});
```

**Step 2: Add RSS discovery link to index.html**

In `<head>`, add after the favicon link:

```html
<link rel="alternate" type="application/rss+xml" title="Brick AI Transmissions" href="https://ai.brick.mov/rss.xml" />
```

**Step 3: Verify locally**

Run: `npm run dev:server`
Visit: `http://localhost:3002/rss.xml`
Expected: valid RSS XML with Transmissions posts

**Step 4: Commit**

```bash
git add server.js index.html
git commit -m "feat(seo): add RSS feed for Transmissions (/rss.xml)"
```

---

### Task 8: Enriched Sitemap with Images

**Files:**
- Modify: `server.js:458-505` (enhance sitemap generation)

**Step 1: Add image namespace and image tags to sitemap**

Update the sitemap XML generation. Replace the `xmlns` declaration and add image data:

```javascript
// Dynamic sitemap
app.get('/sitemap.xml', async (req, res) => {
    try {
        const staticPages = [
            { loc: 'https://ai.brick.mov/', priority: '1.0', changefreq: 'weekly', image: 'https://ai.brick.mov/og-image.jpg', imageTitle: 'Brick AI — AI Video Production' },
            { loc: 'https://ai.brick.mov/works', priority: '0.9', changefreq: 'weekly' },
            { loc: 'https://ai.brick.mov/about', priority: '0.8', changefreq: 'monthly' },
            { loc: 'https://ai.brick.mov/transmissions', priority: '0.8', changefreq: 'weekly' },
            { loc: 'https://ai.brick.mov/chat', priority: '0.7', changefreq: 'monthly' },
        ];

        let postUrls = [];
        try {
            const result = await pool.query('SELECT id, data, created_at FROM transmissions ORDER BY created_at DESC');
            postUrls = result.rows.map(row => {
                const d = row.data;
                const thumb = d.thumbnail || d.image || null;
                return {
                    loc: `https://ai.brick.mov/transmissions/${row.id}`,
                    lastmod: new Date(row.created_at).toISOString().split('T')[0],
                    priority: '0.6',
                    changefreq: 'monthly',
                    image: thumb ? (thumb.startsWith('http') ? thumb : `https://ai.brick.mov${thumb}`) : null,
                    imageTitle: (typeof d.title === 'object' ? d.title.en : d.title) || 'Brick AI Article'
                };
            });
        } catch (e) {
            console.error('Sitemap: Could not fetch transmissions', e.message);
        }

        const today = new Date().toISOString().split('T')[0];
        const allPages = [...staticPages, ...postUrls];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${p.loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${p.loc}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.loc}"/>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${p.image ? `
    <image:image>
      <image:loc>${p.image}</image:loc>
      <image:title>${p.imageTitle}</image:title>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap generation error:', err);
        res.status(500).send('Error generating sitemap');
    }
});
```

**Step 2: Verify locally**

Run: `npm run dev:server`
Visit: `http://localhost:3002/sitemap.xml`
Expected: XML with `<image:image>` tags on pages that have images

**Step 3: Commit**

```bash
git add server.js
git commit -m "feat(seo): enrich sitemap with image tags for Google Image Search"
```

---

### Task 9: VideoObject + CreativeWork Schema for Works

**Files:**
- Modify: `server.js:586-675` (add schemas for works view)
- Create: `works-schema-data.js` (structured data for each project)

**Step 1: Create works schema data file**

```javascript
// works-schema-data.js
export const WORKS_SCHEMA = [
    {
        slug: 'inheritance',
        name: { en: 'Inheritance', pt: 'Inheritance' },
        description: {
            en: 'One of the first AI-generated films selected for the Gramado Film Festival 2025. A narrative exploration of legacy and memory through generative cinematography.',
            pt: 'Um dos primeiros filmes gerados por IA selecionados para o Festival de Cinema de Gramado 2025. Uma exploração narrativa de legado e memória através de cinematografia generativa.'
        },
        thumbnailUrl: 'https://ai.brick.mov/inheritance.webp',
        duration: 'PT3M',
        dateCreated: '2024-12-01',
        award: 'Gramado Film Festival 2025 — Official Selection',
        genre: 'Short Film'
    },
    {
        slug: 'autobol',
        name: { en: 'Autobol', pt: 'Autobol' },
        description: {
            en: 'Reimagination of a forgotten 1970s Brazilian sport using AI-generated imagery and cinematic direction.',
            pt: 'Reimaginação de um esporte brasileiro esquecido dos anos 1970 usando geração de imagem com IA e direção cinematográfica.'
        },
        thumbnailUrl: 'https://ai.brick.mov/og-image.jpg',
        duration: 'PT2M',
        dateCreated: '2024-10-01',
        genre: 'Sport Documentary'
    },
    {
        slug: 'factory',
        name: { en: 'Factory', pt: 'Factory' },
        description: {
            en: 'Industrial decay meets retro-futuristic 1970s aesthetic. A visual poem about the end of an era.',
            pt: 'Decadência industrial encontra estética retrofuturista dos anos 1970. Um poema visual sobre o fim de uma era.'
        },
        thumbnailUrl: 'https://ai.brick.mov/factory_thumb.jpg',
        duration: 'PT2M',
        dateCreated: '2024-09-01',
        genre: 'Visual Art'
    },
    {
        slug: 'dog-day-afternoon',
        name: { en: 'Dog Day Afternoon', pt: 'Dog Day Afternoon' },
        description: {
            en: 'Absurdist comedy featuring dogs in human situations. AI-generated with professional comedic direction.',
            pt: 'Comédia absurdista com cachorros em situações humanas. Gerado com IA e direção profissional de comédia.'
        },
        thumbnailUrl: 'https://ai.brick.mov/og-image.jpg',
        duration: 'PT2M',
        dateCreated: '2024-08-01',
        genre: 'Comedy'
    },
    {
        slug: 'slop-ai',
        name: { en: 'Slop AI', pt: 'Slop AI' },
        description: {
            en: 'Brand campaign exploring the aesthetic of AI-generated content culture.',
            pt: 'Campanha de marca explorando a estética da cultura de conteúdo gerado por IA.'
        },
        thumbnailUrl: 'https://ai.brick.mov/slopai.jpg',
        duration: 'PT1M30S',
        dateCreated: '2024-11-01',
        genre: 'Brand Campaign'
    }
];
```

**Step 2: Import and inject in server.js**

At the top of server.js, add:
```javascript
import { WORKS_SCHEMA } from './works-schema-data.js';
```

In the JSON-LD section (~line 586), after the Organization/WebSite script, add for `works` view:

```javascript
// VideoObject + CreativeWork for Works page
if (view === 'works') {
    const worksJsonLd = WORKS_SCHEMA.map(w => ([
        {
            "@type": "VideoObject",
            "name": isEn ? w.name.en : w.name.pt,
            "description": isEn ? w.description.en : w.description.pt,
            "thumbnailUrl": w.thumbnailUrl,
            "uploadDate": w.dateCreated,
            "duration": w.duration,
            "productionCompany": { "@id": "https://ai.brick.mov/#organization" }
        },
        {
            "@type": "CreativeWork",
            "name": isEn ? w.name.en : w.name.pt,
            "description": isEn ? w.description.en : w.description.pt,
            "dateCreated": w.dateCreated,
            "genre": w.genre,
            "productionCompany": { "@id": "https://ai.brick.mov/#organization" },
            ...(w.award ? { "award": w.award } : {})
        }
    ])).flat();

    jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@graph": worksJsonLd
    })}</script>`);
}
```

**Step 3: Build and verify**

Run: `npm run build && npm run dev:server`
Visit: `http://localhost:3002/works`
Check page source for `VideoObject` and `CreativeWork` JSON-LD.

**Step 4: Commit**

```bash
git add works-schema-data.js server.js
git commit -m "feat(seo): add VideoObject + CreativeWork structured data for Works page"
```

---

### Task 10: Canonical Trailing Slash Consistency

**Files:**
- Modify: `server.js:521` (normalize URL paths)

**Step 1: Ensure no trailing slash on canonical URLs**

The current code already strips trailing slashes at line 521:
```javascript
const urlPath = req.path.replace(/^\/+|\/+$/g, '');
```

Add a redirect for trailing-slash URLs to prevent duplicate content. Before the view detection logic (~line 539), add:

```javascript
// Redirect trailing slashes to non-trailing (SEO canonical consistency)
if (req.path !== '/' && req.path.endsWith('/')) {
    const cleanPath = req.path.replace(/\/+$/, '');
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, cleanPath + query);
}
```

**Step 2: Verify locally**

Run: `npm run dev:server`
Visit: `http://localhost:3002/works/`
Expected: 301 redirect to `/works`

**Step 3: Commit**

```bash
git add server.js
git commit -m "fix(seo): 301 redirect trailing slashes for canonical consistency"
```

---

## Phase 3: GEO

### Task 11: Expanded llms-full.txt

**Files:**
- Create: `public/llms-full.txt`
- Modify: `public/llms.txt` (add link to full version)

**Step 1: Create llms-full.txt**

Create `public/llms-full.txt` with expanded content. This should include everything in llms.txt plus:
- Detailed case studies with process descriptions
- Technical methodology (ComfyUI, Stable Diffusion, workflow)
- Comparison with traditional production
- Detailed FAQ with 15+ questions
- Client testimonials/quotes (when available)
- Competitive differentiators

> **Note:** The full content of this file should be authored by the team or generated from existing site content. The file structure should follow the same markdown format as llms.txt but with 3-5x more detail.

**Step 2: Add link in llms.txt**

Add at the top of `public/llms.txt`, after the Summary section:

```markdown
## Full Version
For detailed case studies, methodology, and technical information:
https://ai.brick.mov/llms-full.txt
```

**Step 3: Commit**

```bash
git add public/llms-full.txt public/llms.txt
git commit -m "feat(geo): add llms-full.txt with expanded content for AI crawlers"
```

---

### Task 12: Expanded FAQ (15+ Questions)

**Files:**
- Modify: `server.js:688-713` (expand FAQ entities)

**Step 1: Expand FAQ arrays with 8+ new questions**

Add to the existing `faqEntitiesPt` and `faqEntitiesEn` arrays (after the existing 7 questions):

New questions to add (both languages):
1. "How long does an AI video project take?" / "Quanto tempo leva um projeto de video com IA?"
2. "What is the budget range for AI video production?" / "Qual a faixa de precos para producao de video com IA?"
3. "What tools does Brick AI use?" / "Quais ferramentas a Brick AI usa?"
4. "Can AI replace a film crew?" / "IA pode substituir uma equipe de filmagem?"
5. "How do you ensure visual consistency in AI video?" / "Como voces garantem consistencia visual no video com IA?"
6. "What's the difference between Brick AI and AI video tools like Runway?" / "Qual a diferenca entre a Brick AI e ferramentas como Runway?"
7. "Do you work with international clients?" / "Voces trabalham com clientes internacionais?"
8. "What is Generative Engine Optimization (GEO)?" / "O que e Generative Engine Optimization (GEO)?"

> **Note:** Full Q&A text should be based on existing llms.txt pricing, methodology, and positioning content. Keep answers factual, 2-4 sentences each.

**Step 2: Verify structured data**

Run: `npm run build && npm run dev:server`
Visit: `http://localhost:3002/`
Validate JSON-LD at https://search.google.com/test/rich-results

**Step 3: Commit**

```bash
git add server.js
git commit -m "feat(geo): expand FAQ schema to 15 questions for better AI extraction"
```

---

### Task 13: Speakable Schema

**Files:**
- Modify: `server.js:590` (add speakable to Organization schema)

**Step 1: Add speakable property to WebSite schema**

In the WebSite JSON-LD object (~line 667), add:

```javascript
{
    "@type": "WebSite",
    "@id": "https://ai.brick.mov/#website",
    "name": "Brick AI",
    "url": "https://ai.brick.mov",
    "inLanguage": [isEn ? "en" : "pt-BR", isEn ? "pt-BR" : "en"],
    "publisher": { "@id": "https://ai.brick.mov/#organization" },
    "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".hero-subtitle", ".philosophy-text"]
    }
}
```

For articles (post view), add speakable to the Article schema (~line 720):

```javascript
"speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".post-excerpt", ".post-body p:first-of-type"]
}
```

**Step 2: Commit**

```bash
git add server.js
git commit -m "feat(geo): add speakable schema for AI voice/citation targeting"
```

---

### Task 14: Claim-Source Pattern in llms.txt

**Files:**
- Modify: `public/llms.txt` (add source links to claims)

**Step 1: Update claims with source links**

In `public/llms.txt`, update the Proof & Recognition section:

```markdown
## Proof & Recognition
- Inheritance: Official Selection — Gramado Film Festival 2025
  Source: https://www.festivaldegramado.net/ (festival official site)
- Vendemos Qualquer Coisa: Finalist — Genero Challenge
  Source: https://genero.tv/ (Genero official site)
- Client history: Stone, Visa, BBC, Record TV, AliExpress, Facebook, O Boticário, L'Oréal
  Source: https://ai.brick.mov/works (portfolio with project details)
```

**Step 2: Commit**

```bash
git add public/llms.txt
git commit -m "feat(geo): add claim-source pattern to llms.txt for AI verification"
```

---

## Phase 4: Content Strategy

### Task 15: Individual Case Study Routes

**Files:**
- Modify: `server.js:542-557` (add works/:slug route detection)
- Modify: `seo-data.js` (add per-project SEO data)
- Modify: `server.js` JSON-LD section (inject project-specific schema)

**Step 1: Add route detection for `/works/:slug`**

In the view detection block (~line 542), add after `if (urlPath === 'works')`:

```javascript
else if (urlPath.startsWith('works/')) {
    view = 'work-detail';
    const slug = urlPath.split('/')[1];
    // Match against known project slugs from works-schema-data.js
    const projectData = WORKS_SCHEMA.find(w => w.slug === slug);
    if (projectData) {
        postData = projectData; // reuse postData variable for project data
    } else {
        view = 'works'; // fallback to works page if slug not found
    }
}
```

**Step 2: Add SEO data for work-detail view**

In `seo-data.js`, this will be dynamic based on the project slug. In server.js, handle it:

```javascript
if (view === 'work-detail' && postData) {
    title = `${isEn ? postData.name.en : postData.name.pt} | Brick AI`;
    description = isEn ? postData.description.en : postData.description.pt;
    ogTitle = isEn ? postData.name.en : postData.name.pt;
    ogDescription = description;
}
```

**Step 3: Inject VideoObject + CreativeWork for individual project**

In the JSON-LD section, add for `work-detail` view:

```javascript
if (view === 'work-detail' && postData) {
    jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": isEn ? postData.name.en : postData.name.pt,
        "description": isEn ? postData.description.en : postData.description.pt,
        "thumbnailUrl": postData.thumbnailUrl,
        "uploadDate": postData.dateCreated,
        "duration": postData.duration,
        "productionCompany": { "@id": "https://ai.brick.mov/#organization" },
        ...(postData.award ? { "award": postData.award } : {})
    })}</script>`);
}
```

**Step 4: Update sitemap to include case study URLs**

Add to the `staticPages` array in the sitemap handler:

```javascript
// Add case study pages
...WORKS_SCHEMA.map(w => ({
    loc: `https://ai.brick.mov/works/${w.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    image: w.thumbnailUrl,
    imageTitle: w.name.en
}))
```

**Step 5: Add `work-detail` to known views in 404 handler**

Update the `knownViews` array:
```javascript
const knownViews = ['home', 'works', 'work-detail', 'about', 'transmissions', 'chat', 'post'];
```

**Step 6: Build and verify**

Run: `npm run build && npm run dev:server`
Visit: `http://localhost:3002/works/inheritance`
Expected: Custom meta tags for Inheritance project, VideoObject JSON-LD

**Step 7: Commit**

```bash
git add server.js seo-data.js works-schema-data.js
git commit -m "feat(seo): add individual case study routes /works/:slug with structured data"
```

> **Note:** The React frontend (index.tsx) will also need to handle the `/works/:slug` route to render the case study UI. This is a separate frontend task that should be planned after the SSR/SEO foundation is in place.

---

### Task 16: robots.txt — Add RSS and llms-full.txt References

**Files:**
- Modify: `public/robots.txt`

**Step 1: Update robots.txt**

Add references to new files:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /pages/

# AI Crawlers — explicitly allowed for GEO
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

Sitemap: https://ai.brick.mov/sitemap.xml

# For AI crawlers and LLMs
# See also: https://ai.brick.mov/llms.txt
# Full version: https://ai.brick.mov/llms-full.txt
# RSS Feed: https://ai.brick.mov/rss.xml
```

**Step 2: Commit**

```bash
git add public/robots.txt
git commit -m "feat(geo): update robots.txt with llms-full.txt and RSS references"
```

---

## Phase 5: Monitoring & Performance

### Task 17: Core Web Vitals to GA4

**Files:**
- Modify: `package.json` (add web-vitals dependency)
- Modify: `index.tsx` (import and report CWV)

**Step 1: Install web-vitals**

```bash
npm install web-vitals
```

**Step 2: Add CWV reporting in index.tsx**

At the end of `index.tsx` (or in a new utility), add:

```typescript
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals';

function sendToGA4(metric: { name: string; value: number; id: string }) {
    if (typeof gtag === 'function') {
        gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_label: metric.id,
            non_interaction: true,
        });
    }
}

onCLS(sendToGA4);
onFID(sendToGA4);
onLCP(sendToGA4);
onINP(sendToGA4);
onTTFB(sendToGA4);
```

**Step 3: Build and verify**

Run: `npm run build`
Expected: No build errors. CWV events will appear in GA4 > Realtime > Events.

**Step 4: Commit**

```bash
git add package.json package-lock.json index.tsx
git commit -m "feat(perf): report Core Web Vitals (LCP, CLS, FID, INP, TTFB) to GA4"
```

---

### Task 18: Image Lazy Loading

**Files:**
- Modify: `index.tsx` (add lazy loading to images below the fold)

**Step 1: Add `loading="lazy"` to all `<img>` tags below the fold**

Search for `<img` in index.tsx and add `loading="lazy"` to any image that is NOT in the hero/above-the-fold section. The hero image should NOT be lazy loaded.

> **Note:** This requires reading index.tsx to find all img tags and determining which are above/below fold. Exact line numbers depend on the component structure.

**Step 2: Build and verify**

Run: `npm run build`
Check with Lighthouse: images below fold should not trigger "Defer offscreen images" warning.

**Step 3: Commit**

```bash
git add index.tsx
git commit -m "perf(seo): add lazy loading to below-fold images"
```

---

### Task 19: Content Calendar Template

**Files:**
- Create: `docs/content-calendar-template.md`

**Step 1: Create content calendar template**

```markdown
# Brick AI — Content Calendar

## Monthly Cadence: 2 posts minimum

### Week 1: Educational Post (Transmissions)
- **Target:** Informational keywords
- **Examples:**
  - "Como funciona producao de video com IA" / "How AI video production works"
  - "IA vs producao tradicional: quando usar cada uma"
  - "O problema da consistencia em video generativo"
- **Format:** 800-1500 words, H2/H3 structure, bilingual PT-BR + EN
- **Schema:** Article (auto from SSR)

### Week 3: Case Study / Behind the Scenes
- **Target:** Brand keywords + long-tail
- **Examples:**
  - "Making of: Inheritance — Gramado 2025"
  - "Como criamos o Autobol com IA"
  - "Factory: o processo criativo por tras do filme"
- **Format:** 600-1000 words, process photos/stills, bilingual
- **Schema:** Article + VideoObject (when video available)

### Keyword Clusters to Cover (rotate monthly)

| Cluster | PT-BR Keywords | EN Keywords |
|---------|---------------|-------------|
| Service | produtora de video com IA, producao audiovisual IA | AI video production company, AI film production |
| Product | filme feito com IA, comercial com IA | AI-generated film, AI commercial |
| Education | como fazer video com IA, quanto custa video IA | how to make AI video, AI video cost |
| Comparison | IA vs producao tradicional, Runway vs produtora | AI vs traditional production |

### Distribution Checklist
- [ ] Published on ai.brick.mov/transmissions (PT-BR + EN)
- [ ] Shared on Instagram @brick.mov
- [ ] Shared on LinkedIn
- [ ] RSS feed auto-updated
- [ ] llms.txt/llms-full.txt updated if new project
```

**Step 2: Commit**

```bash
git add docs/content-calendar-template.md
git commit -m "docs: add content calendar template for SEO/GEO content strategy"
```

---

### Task 20: Link Building Checklist

**Files:**
- Create: `docs/link-building-strategy.md`

**Step 1: Create link building strategy doc**

```markdown
# Brick AI — Link Building Strategy

## Tier 1: Festival & Press (High Authority)
- [ ] Submit "Inheritance at Gramado" story to No Film School
- [ ] Submit to Motionographer (AI film showcase)
- [ ] Submit to Short of the Week
- [ ] Pitch to Meio & Mensagem (BR advertising press)
- [ ] Pitch to B9 (BR creative industry)

## Tier 2: AI & Tech Directories
- [ ] List on "There's an AI for that" (theresanaiforthat.com)
- [ ] Launch on ProductHunt
- [ ] List on FutureTools (futuretools.io)
- [ ] List on alternativeTo
- [ ] List on AI tools directory (aitoolsdirectory.com)

## Tier 3: Industry Profiles
- [ ] Ensure Google Business Profile is claimed and complete
- [ ] Update LinkedIn company page with ai.brick.mov link
- [ ] Update Instagram bio with ai.brick.mov link
- [ ] Submit to Clutch.co (production companies directory)
- [ ] Submit to Brazilian Association of Film Producers

## Tier 4: Content-Driven Links
- [ ] Guest post on AI/video production blogs
- [ ] Create shareable infographic: "AI Video Production Pipeline"
- [ ] Participate in Reddit r/aivideo, r/StableDiffusion discussions
- [ ] Answer Quora questions about AI video production

## Tracking
Track backlinks monthly via Google Search Console > Links report.
```

**Step 2: Commit**

```bash
git add docs/link-building-strategy.md
git commit -m "docs: add link building strategy for SEO growth"
```

---

## Summary of All Tasks

| # | Task | Phase | Files |
|---|------|-------|-------|
| 1 | Integrate GA4 | Foundation | index.html |
| 2 | Webmaster Verification | Foundation | index.html, server.js |
| 3 | Apple Touch Icon | Foundation | public/, index.html |
| 4 | Custom 404 | Foundation | server.js |
| 5 | Font Optimization | Foundation | index.html |
| 6 | Security Headers | Foundation | server.js |
| 7 | RSS Feed | SEO Technical | server.js, index.html |
| 8 | Enriched Sitemap | SEO Technical | server.js |
| 9 | VideoObject + CreativeWork | SEO Technical | server.js, works-schema-data.js |
| 10 | Trailing Slash Redirect | SEO Technical | server.js |
| 11 | llms-full.txt | GEO | public/ |
| 12 | Expanded FAQ | GEO | server.js |
| 13 | Speakable Schema | GEO | server.js |
| 14 | Claim-Source Pattern | GEO | public/llms.txt |
| 15 | Case Study Routes | Content | server.js, seo-data.js |
| 16 | robots.txt Update | Content | public/robots.txt |
| 17 | Core Web Vitals | Monitoring | package.json, index.tsx |
| 18 | Image Lazy Loading | Monitoring | index.tsx |
| 19 | Content Calendar | Strategy | docs/ |
| 20 | Link Building Checklist | Strategy | docs/ |
