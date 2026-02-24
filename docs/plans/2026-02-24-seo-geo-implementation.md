# SEO + GEO Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar robots.txt, sitemap.xml e structured data (JSON-LD) ao site `ai.brick.mov` para maximizar ranqueamento no Google e citações em LLMs (ChatGPT, Perplexity, Gemini).

**Architecture:** Três arquivos estáticos — `public/robots.txt`, `public/sitemap.xml`, e atualização do `index.html` (head) com meta tags enriquecidas + bloco JSON-LD. Nenhuma alteração no código React ou no design visual.

**Tech Stack:** HTML5 meta tags, Schema.org JSON-LD, XML sitemap protocol, Vite (build — arquivos em `/public` são copiados para `/dist` sem processamento)

---

## Contexto Rápido

- **Repositório:** `/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI`
- **Worktree ativo:** `.claude/worktrees/determined-cohen`
- **URL do site:** `https://ai.brick.mov`
- **Framework:** React + Vite — arquivos em `public/` são servidos na raiz sem transformação
- **Design doc:** `docs/plans/2026-02-24-seo-geo-design.md`

---

### Task 1: Criar `public/robots.txt`

**Files:**
- Create: `public/robots.txt`

**Step 1: Criar o arquivo**

```
User-agent: *
Allow: /

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
```

**Step 2: Verificar que o Vite copia corretamente**

```bash
cd "/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI/.claude/worktrees/determined-cohen"
npm run build 2>&1 | tail -5
ls dist/robots.txt
```
Esperado: `dist/robots.txt` existe.

**Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat(seo): add robots.txt with AI crawler permissions"
```

---

### Task 2: Criar `public/sitemap.xml`

**Files:**
- Create: `public/sitemap.xml`

**Step 1: Criar o arquivo**

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

**Step 2: Verificar que o Vite copia corretamente**

```bash
ls "/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI/.claude/worktrees/determined-cohen/dist/sitemap.xml"
```
Esperado: arquivo existe após `npm run build`.

**Step 3: Commit**

```bash
git add public/sitemap.xml
git commit -m "feat(seo): add sitemap.xml with hreflang pt-BR/en/x-default"
```

---

### Task 3: Atualizar meta tags no `index.html`

**Files:**
- Modify: `index.html`

**Contexto:** O `index.html` atual tem as linhas 6-18. Vamos substituir o bloco de meta tags existente por uma versão enriquecida.

**Step 1: Localizar o bloco atual**

```bash
head -20 "/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI/.claude/worktrees/determined-cohen/index.html"
```

**Step 2: Substituir o bloco de meta tags (linhas 6-18)**

Substituir de:
```html
    <title>Brick AI | Produtora de Vídeo com IA</title>
    <meta name="description" content="Nascidos no set. A mesma alma. Um novo corpo. Produção premium com IA para filmes, campanhas e conteúdo visual." />
    <meta property="og:title" content="Brick AI | Produtora de Vídeo com IA" />
    <meta property="og:description" content="Nascidos no set. A mesma alma. Um novo corpo." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://ai.brick.mov/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Brick AI | Produtora de Vídeo com IA" />
    <meta name="twitter:description" content="Nascidos no set. A mesma alma. Um novo corpo." />
    <meta name="twitter:image" content="https://ai.brick.mov/og-image.jpg" />
    <link rel="canonical" href="https://ai.brick.mov/" />
    <link rel="alternate" href="https://ai.brick.mov/" hreflang="pt-BR" />
    <link rel="alternate" href="https://ai.brick.mov/?lang=en" hreflang="en" />
```

Para:
```html
    <title>Brick AI | Produtora Generativa de Vídeo com IA</title>
    <meta name="description" content="Brick AI é uma produtora generativa brasileira. Produzimos campanhas, VFX e conteúdo de alto padrão combinando direção humana com inteligência artificial. Clientes: Stone, Visa, BBC." />
    <meta name="robots" content="index, follow" />
    <!-- Open Graph -->
    <meta property="og:title" content="Brick AI | Produtora Generativa de Vídeo com IA" />
    <meta property="og:description" content="Produção híbrida de elite: direção humana + IA. Campanhas, VFX e conteúdo visual premium para marcas Tier 1." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://ai.brick.mov/" />
    <meta property="og:image" content="https://ai.brick.mov/og-image.jpg" />
    <meta property="og:site_name" content="Brick AI" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:locale:alternate" content="en_US" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Brick AI | Produtora Generativa de Vídeo com IA" />
    <meta name="twitter:description" content="Produção híbrida de elite: direção humana + IA. Campanhas, VFX e conteúdo visual premium para marcas Tier 1." />
    <meta name="twitter:image" content="https://ai.brick.mov/og-image.jpg" />
    <!-- Canonical & Hreflang -->
    <link rel="canonical" href="https://ai.brick.mov/" />
    <link rel="alternate" href="https://ai.brick.mov/" hreflang="pt-BR" />
    <link rel="alternate" href="https://ai.brick.mov/?lang=en" hreflang="en" />
    <link rel="alternate" href="https://ai.brick.mov/" hreflang="x-default" />
```

**Step 3: Verificar que o HTML está correto**

```bash
head -35 "/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI/.claude/worktrees/determined-cohen/index.html"
```
Esperado: todas as tags novas presentes, sem duplicatas.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(seo): enrich meta tags with og:url, og:locale, og:site_name, x-default hreflang"
```

---

### Task 4: Adicionar JSON-LD — Organization + WebSite

**Files:**
- Modify: `index.html`

**Contexto:** Adicionar antes do `</head>` — após o bloco de fontes do Google, linha ~22.

**Step 1: Adicionar o bloco JSON-LD de Organization + WebSite**

Inserir imediatamente antes de `</head>`:

```html
    <!-- Structured Data: Organization + WebSite -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://ai.brick.mov/#organization",
          "name": "Brick AI",
          "alternateName": "Brick AI — A Divisão Generativa",
          "url": "https://ai.brick.mov",
          "logo": {
            "@type": "ImageObject",
            "url": "https://ai.brick.mov/og-image.jpg"
          },
          "foundingDate": "2016",
          "description": "Produtora generativa brasileira especializada em produção híbrida de vídeo com IA. Combinamos direção cinematográfica humana com modelos generativos para entregar campanhas, VFX e conteúdo visual premium. Clientes incluem Stone, Visa, BBC, Record TV, AliExpress, Facebook, O Boticário e L'Oréal.",
          "knowsAbout": [
            "Generative AI Video Production",
            "VFX Automation",
            "AI Cinematography",
            "Stable Diffusion",
            "ComfyUI",
            "Produção Híbrida",
            "Set Infinito",
            "Neural VFX"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Serviços de Produção Generativa",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Campanhas Publicitárias com IA",
                  "description": "Produção de campanhas de alto padrão para grandes marcas usando modelos generativos sob direção artística humana."
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "VFX Generativo",
                  "description": "Efeitos visuais criados com IA, com acabamento de pós-produção profissional."
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Conteúdo Visual Premium",
                  "description": "Conteúdo audiovisual para marcas Tier 1, com agilidade do processo digital e qualidade cinematográfica."
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Curtas e Filmes Generativos",
                  "description": "Produções narrativas com IA, como Inheritance — seleção oficial do Festival de Cinema de Gramado 2025."
                }
              }
            ]
          },
          "sameAs": []
        },
        {
          "@type": "WebSite",
          "@id": "https://ai.brick.mov/#website",
          "name": "Brick AI",
          "url": "https://ai.brick.mov",
          "publisher": {
            "@id": "https://ai.brick.mov/#organization"
          }
        }
      ]
    }
    </script>
```

**Step 2: Verificar que o JSON é válido**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/);
if (match) { JSON.parse(match[1]); console.log('JSON-LD válido'); } else { console.log('ERRO: bloco não encontrado'); }
"
```
Esperado: `JSON-LD válido`

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(geo): add JSON-LD Organization + WebSite structured data"
```

---

### Task 5: Adicionar JSON-LD — FAQPage

**Files:**
- Modify: `index.html`

**Contexto:** Este é o schema mais impactante para GEO. LLMs citam FAQs estruturadas diretamente em suas respostas. As perguntas e respostas são baseadas nas objeções e dores do ICP (ver design doc).

**Step 1: Adicionar segundo bloco JSON-LD antes de `</head>`**

Inserir logo após o bloco de Organization+WebSite (antes de `</head>`):

```html
    <!-- Structured Data: FAQPage (GEO — AI citation) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "O que é a Brick AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Brick AI é uma produtora generativa brasileira fundada em 2016. Combinamos direção artística e cinematográfica humana com modelos de inteligência artificial para criar campanhas publicitárias, VFX e conteúdo visual premium. Somos uma divisão especializada da Brick, produtora com histórico em clientes como Stone, Visa, BBC e L'Oréal."
          }
        },
        {
          "@type": "Question",
          "name": "Qual é o diferencial da Brick AI em relação a produtoras tradicionais?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A Brick AI opera no que chamamos de 'Set Infinito': qualquer cenário, contexto ou estética, produzido com qualidade cinematográfica e em uma fração do tempo e custo da produção convencional. Enquanto produtoras tradicionais estão limitadas por logística física — locações, equipamento, viagens —, nós removemos essas barreiras sem abrir mão do padrão de direção humana."
          }
        },
        {
          "@type": "Question",
          "name": "Como a Brick AI garante que o resultado não vai parecer genérico ou estranho?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A maioria do conteúdo gerado por IA falha porque é criado sem direção artística — é automação sem autoria. Na Brick AI, toda produção passa por curadoria humana rigorosa: direção de arte, color grading, sound design e montagem são feitos por profissionais com mais de 10 anos de experiência em set. A IA cria a base estrutural; nós aplicamos o acabamento de elite."
          }
        },
        {
          "@type": "Question",
          "name": "A Brick AI já trabalhou com grandes marcas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim. O portfólio da Brick inclui projetos para Stone, Visa, BBC, Record TV, AliExpress, Keeta, Facebook, O Boticário e L'Oréal. O curta 'Inheritance', produzido pela Brick AI, foi seleção oficial do Festival de Cinema de Gramado 2025, sendo um dos primeiros filmes gerativos a competir no festival."
          }
        },
        {
          "@type": "Question",
          "name": "O que é Produção Híbrida?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Produção Híbrida é a metodologia da Brick AI que combina filmagem tradicional, pós-produção clássica e modelos generativos de IA em um único fluxo de trabalho. O resultado é conteúdo com a qualidade e intenção artística de uma grande produção, mas com a agilidade e viabilidade de orçamento da geração digital."
          }
        },
        {
          "@type": "Question",
          "name": "Quanto tempo leva uma produção com IA na Brick AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O processo generativo reduz significativamente os prazos em relação à produção tradicional. Projetos que levariam 45 dias em uma produção convencional podem ser entregues em 10 a 15 dias úteis. O briefing, a aprovação de referências visuais e o alinhamento criativo são as etapas mais determinantes do prazo total."
          }
        },
        {
          "@type": "Question",
          "name": "Usar IA na produção de vídeo é seguro juridicamente?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A Brick AI opera como produtora, não como fornecedora de software. Toda entrega é uma obra audiovisual licenciada pela Brick, com os mesmos contratos e segurança jurídica de qualquer produção tradicional. Os projetos para Visa e Stone, por exemplo, seguem os mesmos padrões de compliance exigidos por essas empresas em suas produções convencionais."
          }
        }
      ]
    }
    </script>
```

**Step 2: Verificar que ambos os blocos JSON-LD são válidos**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const matches = [...html.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)];
console.log('Blocos encontrados:', matches.length);
matches.forEach((m, i) => { try { JSON.parse(m[1]); console.log('Bloco', i+1, ': JSON válido'); } catch(e) { console.log('Bloco', i+1, ': ERRO -', e.message); } });
"
```
Esperado:
```
Blocos encontrados: 2
Bloco 1 : JSON válido
Bloco 2 : JSON válido
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(geo): add FAQPage JSON-LD for AI engine citation (7 Q&As)"
```

---

### Task 6: Build final e validação

**Files:** Nenhum novo — apenas verificação.

**Step 1: Rodar o build completo**

```bash
cd "/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI/.claude/worktrees/determined-cohen"
npm run build 2>&1
```
Esperado: build sem erros, `dist/` gerado.

**Step 2: Verificar arquivos SEO no dist**

```bash
ls dist/robots.txt dist/sitemap.xml && echo "OK"
```
Esperado: `OK`

**Step 3: Verificar meta tags no dist/index.html**

```bash
grep -c "application/ld+json" dist/index.html
grep "og:url" dist/index.html
grep "og:locale" dist/index.html
grep "x-default" dist/index.html
```
Esperado:
- `2` (dois blocos JSON-LD)
- Linha com `og:url`
- Linha com `og:locale`
- Linha com `x-default`

**Step 4: Validar JSON-LD no dist**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const matches = [...html.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)];
console.log('Blocos no dist:', matches.length);
matches.forEach((m, i) => { try { const d = JSON.parse(m[1]); console.log('Bloco', i+1, ': válido, @type =', d['@type'] || d['@graph']?.[0]['@type']); } catch(e) { console.log('Bloco', i+1, ': ERRO -', e.message); } });
"
```
Esperado:
```
Blocos no dist: 2
Bloco 1 : válido, @type = Organization  (ou via @graph)
Bloco 2 : válido, @type = FAQPage
```

**Step 5: Commit final**

```bash
git add -A
git commit -m "chore(seo): verify build artifacts — robots, sitemap, JSON-LD all present in dist"
```

---

## Checklist de Validação Externa (pós-deploy)

Após fazer deploy em `https://ai.brick.mov`:

- [ ] **Google Rich Results Test:** https://search.google.com/test/rich-results → testar com a URL — deve mostrar FAQPage e Organization sem erros
- [ ] **Schema Markup Validator:** https://validator.schema.org/ → colar o JSON-LD e verificar
- [ ] **Perplexity:** perguntar "O que é a Brick AI?" e ver se cita o site
- [ ] **ChatGPT:** perguntar "Quais produtoras brasileiras usam IA?" — monitorar ao longo das semanas
- [ ] **Google Search Console:** confirmar que sitemap foi aceito (Settings > Sitemaps)
- [ ] **robots.txt live:** acessar `https://ai.brick.mov/robots.txt` no browser

---

## Notas Importantes

1. **`sameAs` no Organization:** Deixado vazio `[]` — adicionar URLs do Instagram, LinkedIn e Vimeo da Brick quando disponíveis. Quanto mais perfis verificados, mais forte o Knowledge Panel.

2. **og:image:** O arquivo `og-image.jpg` precisa existir em produção. Dimensões ideais: **1200×630px**. Se não existir, as redes sociais vão mostrar preview sem imagem.

3. **`?lang=en` no hreflang:** A URL `https://ai.brick.mov/?lang=en` precisa realmente servir a versão em inglês. Confirmar que o React Router / i18n responde corretamente a esse parâmetro.

4. **Twitter/X handle:** Se a Brick AI tiver conta no X (@brickai ou similar), adicionar `<meta name="twitter:site" content="@handle">` na Task 3.
