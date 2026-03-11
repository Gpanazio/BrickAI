# Design: About Page Redesign — Brick AI
**Data:** 2026-03-11
**Status:** Aprovado
**Escopo:** `index.tsx` (AboutPage component) + `src/locales/pt/translation.json` + `src/locales/en/translation.json`

---

## Contexto

A página About atual tem 3 seções (Hero + OLHAR AUTORAL grid + ANTI-SLOP PROTOCOL rows) que são redundantes entre si e focam demais no "como pensamos" sem deixar claro "o que fazemos". A reestruturação funde tudo em 2 seções com clareza de propósito.

**Problemas resolvidos:**
- Visitante não sabe o que a Brick entrega concretamente
- Dois blocos (OLHAR AUTORAL e ANTI-SLOP) dizem a mesma coisa com palavras diferentes
- Monolito menor que na home — perde gravidade Kubrick
- Descrição é um parágrafo denso vs. DESIGN_ID que pede "uma linha que pesa mais que um parágrafo"
- Sem ParticleBackground — About parece visualmente flat vs. home
- "EXECUÇÃO NEURAL" removido intencionalmente para clareza

---

## Estrutura: 2 Seções + Footer

### SEÇÃO 1: HERO — "O QUE FAZEMOS"

**Layout:**
- `min-h-[70vh]`, full-width
- ParticleBackground sutil (consistência com home)
- Breathing glow vermelho atrás do monolito

**Elementos (de cima pra baixo):**

1. **Header lore** (mantém):
   - `DNA_ORIGIN` com split vermelho
   - `>> ACCESS_GRANTED // EST_2016`

2. **Monolito** (ampliado):
   - De `w-[100px] h-[200px]` → `w-[130px] h-[260px]` (como home)
   - Mantém todas as layers de glow/texture existentes

3. **Título:**
   ```
   VISÃO DE
   CINEMA
   ```
   - `font-brick text-5xl md:text-6xl lg:text-7xl`
   - "CINEMA" em `text-[#DC2626]`

4. **3 linhas declarativas** (substitui parágrafo denso):
   ```
   [01]  Somos uma produtora com 10 anos de set. A IA é a nossa ferramenta, não a nossa identidade.
   [02]  Criamos do roteiro ao filme finalizado — conceito, direção, estética e entrega.
   [03]  Visuais impecáveis para qualquer tipo de produção. Sem limite de formato, sem limite de escala.
   ```
   - Font-mono, `text-sm`, index `[0X]` em vermelho
   - Borda lateral `border-l border-white/10` com hover → `border-[#DC2626]`
   - Cada linha com `motion.div` stagger delay (0.2s entre elas)

**EN:**
```
[01]  A production company with 10 years on set. AI is our tool, not our identity.
[02]  We create from script to final film — concept, direction, aesthetics and delivery.
[03]  Flawless visuals for any type of production. No format limits, no scale limits.
```

---

### SEÇÃO 2: O MÉTODO — fusão OLHAR AUTORAL + ANTI-SLOP

**Layout:** Idêntico ao `Philosophy` da home:
- Centralizado, `max-w-4xl mx-auto`
- ParticleBackground contínuo (ou fundo `bg-[#050505]` com noise overlay)
- Label "O MÉTODO" com dot vermelho no topo

**3 declarações escalonadas:**

| # | Título (PT) | Texto (PT) | Tamanho |
|---|---|---|---|
| 1 | CONTROLE | Não existe prompt mágico. Consistência vem de quem dirige o processo, não da sorte de uma linha de texto. | `text-2xl md:text-3xl` |
| 2 | VISÃO | A IA gera mil opções. Nós sabemos qual é a certa. Bom gosto é o ativo que nenhum modelo tem. | `text-3xl md:text-4xl` |
| 3 | NÓS DIRIGIMOS A INTELIGÊNCIA | A tecnologia obedece à arte. O que entregamos não é conteúdo gerado — é uma visão autoral, finalizada. | `text-4xl md:text-6xl` |

| # | Título (EN) | Texto (EN) | Tamanho |
|---|---|---|---|
| 1 | CONTROL | There is no magic prompt. Consistency comes from those who direct the process, not from the luck of a line of text. | `text-2xl md:text-3xl` |
| 2 | VISION | AI generates a thousand options. We know which one is right. Taste is the asset no model has. | `text-3xl md:text-4xl` |
| 3 | WE DIRECT THE INTELLIGENCE | Technology obeys art. What we deliver is not generated content — it is an authorial vision, finalized. | `text-4xl md:text-6xl` |

**Componente:** Reutilizar `PhilosophyItem` existente da home (já tem motion stagger, hover vermelho, tipografia escalonada).

**Padrão visual:**
- `gap-24` entre declarações
- `motion.div` com `whileInView`, stagger `delay: index * 0.4`
- Hover no título → `text-[#DC2626]`

---

### FOOTER
Sem mudança. O CTA existente ("TEM UMA IDEIA IMPOSSÍVEL?") faz o trabalho.

---

## O que é removido

| Elemento | Motivo |
|---|---|
| Seção OLHAR AUTORAL (3-col grid com CONCEPÇÃO ARTÍSTICA / DIREÇÃO VISUAL / ENTREGA) | Redundante com O Método; conteúdo fundido nas 3 declarações |
| Seção ANTI-SLOP PROTOCOL (3 rows horizontais com CONTROLE > ACASO / QUALIDADE > VOLUME / ARTE = VIRTUOSISMO) | Redundante; essência destilada nas declarações |
| Parágrafo denso da description do hero | Substituído por 3 linhas declarativas concretas |
| `about.title_secondary` ("EXECUÇÃO NEURAL" / "NEURAL EXECUTION") | Removido intencionalmente — lore demais, pouca clareza |

---

## i18n: Chaves afetadas

**Chaves que mudam:**
- `about.description` → substituída por `about.lines.01`, `about.lines.02`, `about.lines.03`
- `about.core_modules` → removida
- `about.modules.*` → removidas (cinematography, training, architecture)
- `about.manifesto.*` → removidas (title, subtitle, cards.*)
- `about.title_secondary` → removida

**Chaves que mantêm:**
- `about.origin` ("DNA_ORIGIN")
- `about.est` ("EST_2016")
- `about.title_primary` ("VISÃO DE")
- `about.title_highlight` ("CINEMA")

**Chaves novas:**
- `about.lines.01`, `about.lines.02`, `about.lines.03`
- `about.method.label` ("O MÉTODO" / "THE METHOD")
- `about.method.control.title`, `about.method.control.text`
- `about.method.vision.title`, `about.method.vision.text`
- `about.method.direct.title`, `about.method.direct.text`

---

## Referências visuais

- **Hero:** Mesmo padrão do hero atual, mas monolito maior e description em linhas
- **O Método:** Clone visual do `Philosophy` component da home (`index.tsx:1332-1382`)
- **Tipografia:** Segue DESIGN_ID.md — font-brick para declarações, font-mono para metadados
- **Animações:** Segue DESIGN_ID.md — mínimo 1.5s, easeOut, sem bounce
