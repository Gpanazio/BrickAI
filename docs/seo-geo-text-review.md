# Reanálise Crítica de SEO, GEO e Qualidade de Texto — Brick AI

Data: 2026-02-25 (revisão)

## Contexto desta revisão
Esta versão foi refeita para ficar **mais objetiva e rastreável**, com foco em evidências observáveis no código e com ajuste explícito sobre o ponto levantado: a diferença PT/EN parece ser principalmente **lacuna de refinamento da tradução**, não ausência total de tradução.

## Diagnóstico executivo (curto)
A base técnica de SEO/GEO é boa (metadados, canonical/hreflang, sitemap dinâmico, `robots.txt`, `llms.txt`, JSON-LD). O principal ganho incremental agora vem de:
1. reduzir inconsistências semânticas entre SSR e cliente;
2. melhorar paridade de idioma nos blocos estruturados;
3. reforçar conteúdo de conversão (prova + oferta, não só manifesto);
4. tratar EN com transcriação comercial.

---

## 1) Evidências objetivas encontradas

### SEO técnico — pontos fortes
- `index.html` já traz placeholders e estrutura para title/description/OG/canonical/hreflang.
- `index.html` contém JSON-LD base de `Organization`, `WebSite` e `FAQPage`.
- `server.js` injeta meta tags por rota e gera `sitemap.xml` dinâmico com páginas estáticas e posts de `transmissions`.
- `public/robots.txt` permite rastreamento amplo, inclui agentes de IA e aponta para sitemap.
- `public/llms.txt` existe e está bem estruturado para leitura por motores de resposta.

### Lacunas técnicas de consistência
1. **Schema `Article` diverge entre SSR e cliente**
   - SSR (`server.js`) monta `Article` com `headline`, `description`, `author`, `publisher`, `url`.
   - Cliente (`index.tsx`) também injeta `Article`, porém com `datePublished` fixo (`2026-01-27`).
   - Risco: sinais semânticos diferentes para o mesmo conteúdo, dependendo do modo de crawl/render.

2. **Paridade de idioma incompleta no structured content**
   - Meta + hreflang estão bem tratados no SSR/CSR.
   - Porém o bloco FAQ base em `index.html` está em português e é estático.
   - Para tráfego EN, isso reduz precisão semântica e pode degradar citação em motores de resposta.

3. **Pouca cobertura de intenção transacional por página dedicada**
   - Estrutura atual cobre brand/institucional/portfólio/blog/contato.
   - Não há evidência clara de páginas voltadas a intenção de compra por serviço/vertical.

---

## 2) GEO (Generative Engine Optimization)

### O que está bem encaminhado
- `llms.txt` com posicionamento, serviços, projetos e frases preferidas para citação.
- FAQ em schema facilita resposta direta para perguntas institucionais.
- Mensagens de autoridade (10+ anos, cases, festival) aparecem em múltiplos pontos.

### O que limita performance de citação
1. **Autoridade mais declarada que comprovada**
   - Faltam objetos por case com dados verificáveis (datas, crédito, escopo, URL de validação, resultado).
2. **FAQ comercial insuficiente**
   - Perguntas de decisão de compra (faixa de prazo, formato de entrega, licenciamento, governança) ainda têm baixa cobertura estruturada.
3. **Assimetria PT/EN em assets semânticos**
   - Parte relevante da camada semântica permanece orientada ao PT.

---

## 3) Textos do site — análise crítica

### Forças
- Voz de marca forte e memorável.
- Posicionamento claro: produtora premium com IA (não “fábrica de prompt”).
- Coerência estética e narrativa entre home, works e transmissions.

### Fragilidades
1. **Manifesto às vezes domina a oferta**
   - Falta destaque recorrente para “o que é entregue”, “em quanto tempo”, “em quais formatos”, “com quais limites”.

2. **Linguagem técnica precisa de ponte comercial**
   - Em EN há termos como `ControlNet`, `IP-Adapters` e `latent space` (no manifesto), bons para autoridade técnica.
   - Mas o decisor de marketing/compras precisa, ao lado disso, de tradução para impacto de negócio.

3. **Prova social sem quantificação operacional**
   - Nomes de marcas e festivais ajudam, mas faltam micro-cases com números/processo/output.

4. **Ponto levantado pelo time: lacuna de tradução/refino EN**
   - A tradução existe; o problema parece ser refinamento comercial e adaptação de tom para conversão internacional.
   - Recomendação: transcriação EN focada em proposta de valor e clareza de oferta.

---

## 4) Prioridades práticas

### 0–2 semanas
1. Unificar `Article` schema SSR/CSR (remover data fixa e usar fonte real por post).
2. Criar versão EN do FAQ estruturado (ou serialização dinâmica por idioma).
3. Publicar 2–3 páginas de intenção de compra (ex.: campanhas IA, VFX generativo, branded content).

### 2–6 semanas
4. Estruturar cases com `CreativeWork`/`VideoObject` + campos verificáveis.
5. Inserir blocos comerciais padrão nas páginas-chave: processo, prazos típicos, entregáveis, compliance/licenças.
6. Expandir FAQ para perguntas transacionais reais.

### Contínuo
7. Iterar `llms.txt` e FAQ com base nas perguntas reais recebidas via chat/comercial.
8. Rodar transcriação EN orientada a conversão (não só tradução literal).

---

## 5) Notas de score (orientativas)
- SEO técnico: **8.5/10**
- GEO: **7.8/10**
- Texto/Copy (marca + conversão): **7.6/10**

Resumo final: o projeto tem fundação forte. O próximo salto vem de **consistência semântica + prova verificável + copy transacional bilíngue**.
