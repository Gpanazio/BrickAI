# Design: Full Stack SEO + GEO — Brick AI
**Data:** 2026-02-24
**Status:** Aprovado
**Escopo:** `index.html` (head) + `public/robots.txt` + `public/sitemap.xml`

---

## Contexto

O site `ai.brick.mov` é uma SPA React/Vite bilíngue (pt-BR / en) da Brick AI — produtora generativa brasileira posicionada como produção híbrida de elite.

**Estado atual do SEO:**
- Tem: title, meta description, OG básico, Twitter Card, canonical, hreflang pt-BR/en
- Falta: `og:url`, `og:locale`, `og:site_name`, hreflang `x-default`, JSON-LD, robots.txt, sitemap.xml

**Estado atual do GEO:**
- Copy poético ("Nascidos no set. A mesma alma.") dificulta citações por LLMs
- Sem structured data para definição de entidade
- Sem FAQPage — principal vetor de citação em ChatGPT/Perplexity/Gemini
- Sem robots.txt explicitando permissão para AI crawlers

---

## Decisões de Design

### 1. robots.txt (`public/robots.txt`)

Permitir todos os AI crawlers relevantes explicitamente para maximizar indexação GEO:

```
User-agent: *
Allow: /

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
```

---

### 2. sitemap.xml (`public/sitemap.xml`)

URL única com suporte a hreflang multilíngue:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://ai.brick.mov/</loc>
    <lastmod>2026-02-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://ai.brick.mov/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://ai.brick.mov/?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://ai.brick.mov/"/>
  </url>
</urlset>
```

---

### 3. Melhorias no `<head>` do `index.html`

#### 3a. Tags a adicionar

| Tag | Valor |
|-----|-------|
| `og:url` | `https://ai.brick.mov/` |
| `og:locale` | `pt_BR` |
| `og:locale:alternate` | `en_US` |
| `og:site_name` | `Brick AI` |
| hreflang `x-default` | `https://ai.brick.mov/` |

#### 3b. Meta description — atualizar

**Atual** (poética, fraca para SEO/GEO):
```
Nascidos no set. A mesma alma. Um novo corpo. Produção premium com IA para filmes, campanhas e conteúdo visual.
```

**Proposta** (clara, cita clientes Tier 1, usa keywords do ICP):
```
Brick AI é uma produtora generativa brasileira. Produzimos campanhas, VFX e conteúdo de alto padrão combinando direção humana com inteligência artificial. Clientes: Stone, Visa, BBC.
```

#### 3c. OG description — atualizar

**Proposta** (preview social conciso):
```
Produção híbrida de elite: direção humana + IA. Campanhas, VFX e conteúdo visual premium para marcas Tier 1.
```

#### 3d. Twitter description — atualizar (igual ao OG description)

---

### 4. JSON-LD Structured Data

Bloco único `<script type="application/ld+json">` no `<head>` com três schemas:

#### 4a. Organization

Define a entidade Brick AI para Knowledge Panel do Google e citação direta por LLMs.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Brick AI",
  "alternateName": "Brick AI — A Divisão Generativa",
  "url": "https://ai.brick.mov",
  "logo": "https://ai.brick.mov/og-image.jpg",
  "foundingDate": "2016",
  "description": "Produtora generativa brasileira especializada em produção híbrida de vídeo com IA. Combinamos direção cinematográfica humana com modelos generativos para entregar campanhas, VFX e conteúdo visual premium.",
  "knowsAbout": [
    "Generative AI Video Production",
    "VFX Automation",
    "AI Cinematography",
    "Stable Diffusion",
    "ComfyUI",
    "Produção Híbrida",
    "Set Infinito"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Serviços de Produção Generativa",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Campanhas Publicitárias com IA" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "VFX Generativo" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Conteúdo Visual Premium" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Curtas e Filmes Generativos" } }
    ]
  },
  "sameAs": []
}
```

> **Nota:** Adicionar URLs de redes sociais (Instagram, LinkedIn, Vimeo) no array `sameAs` quando disponíveis.

#### 4b. WebSite

Habilita Sitelinks Searchbox no Google.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Brick AI",
  "url": "https://ai.brick.mov"
}
```

#### 4c. FAQPage

**Principal vetor GEO.** LLMs (ChatGPT, Perplexity, Gemini) citam FAQs estruturadas diretamente em respostas. Perguntas baseadas nas objeções e dores do ICP:

| # | Pergunta | Fundamento no ICP |
|---|----------|-------------------|
| 1 | O que é a Brick AI? | Pergunta de descoberta |
| 2 | Qual é o diferencial da Brick AI em relação a produtoras tradicionais? | Dor: "Agências grandes não me atendem / Pequenas entregam amador" |
| 3 | Como a Brick AI garante que o resultado não vai parecer genérico ou estranho? | Objeção: "Qualidade da IA é estranha" |
| 4 | A Brick AI já trabalhou com grandes marcas? | Prova social (Stone, Visa, BBC) |
| 5 | O que é Produção Híbrida? | Termo proprietário — associar à Brick AI |
| 6 | Quanto tempo leva uma produção com IA na Brick AI? | Dor da Juliana (time-to-market) |
| 7 | Usar IA na produção de vídeo é seguro juridicamente? | Objeção: "Problema de Direito Autoral?" |

---

## Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `public/robots.txt` | Criar |
| `public/sitemap.xml` | Criar |
| `index.html` | Atualizar `<head>` |

## O que NÃO muda

- Design visual do site
- Código React / TSX / componentes
- Copy visível para o usuário
- Lógica de i18n

---

## Métricas de Sucesso

- [ ] Site aparece em respostas do Perplexity/ChatGPT para "produtora generativa Brasil"
- [ ] Google Search Console mostra rich results para FAQs
- [ ] Structured Data Validator (schema.org) sem erros
- [ ] GPTBot e PerplexityBot confirmados em access logs
