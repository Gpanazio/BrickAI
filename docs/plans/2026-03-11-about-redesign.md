# About Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reestruturar a About Page de 3 seções redundantes para 2 seções com clareza (Hero + O Método), fundindo OLHAR AUTORAL e ANTI-SLOP em declarações escalonadas no padrão da Philosophy da home.

**Architecture:** Atualizar i18n (PT + EN) com novas chaves, remover chaves obsoletas, reescrever o `AboutPage` component em `index.tsx` reutilizando `PhilosophyItem` da home, adicionar `ParticleBackground` ao hero.

**Tech Stack:** React, Tailwind CSS, Framer Motion, react-i18next

---

### Task 1: Atualizar i18n PT — novas chaves e remover obsoletas

**Files:**
- Modify: `src/locales/pt/translation.json`

**Step 1: Substituir bloco `about` no PT**

Substituir todo o bloco `"about"` por:

```json
"about": {
    "origin": "DNA_ORIGIN",
    "est": "EST_2016",
    "title_primary": "VISÃO DE",
    "title_highlight": "CINEMA",
    "lines": {
        "01": "Somos uma produtora com 10 anos de set. A IA é a nossa ferramenta, não a nossa identidade.",
        "02": "Criamos do roteiro ao filme finalizado — conceito, direção, estética e entrega.",
        "03": "Visuais impecáveis para qualquer tipo de produção. Sem limite de formato, sem limite de escala."
    },
    "method": {
        "label": "O MÉTODO",
        "control": {
            "title": "CONTROLE",
            "text": "Não existe prompt mágico. Consistência vem de quem dirige o processo, não da sorte de uma linha de texto."
        },
        "vision": {
            "title": "VISÃO",
            "text": "A IA gera mil opções. Nós sabemos qual é a certa. Bom gosto é o ativo que nenhum modelo tem."
        },
        "direct": {
            "title": "NÓS DIRIGIMOS A INTELIGÊNCIA",
            "text": "A tecnologia obedece à arte. O que entregamos não é conteúdo gerado — é uma visão autoral, finalizada."
        }
    }
}
```

Chaves removidas: `description`, `title_secondary`, `core_modules`, `modules.*`, `manifesto.*`.

**Step 2: Verificar JSON válido**

Run: `cat src/locales/pt/translation.json | python3 -m json.tool > /dev/null`
Expected: sem erro

---

### Task 2: Atualizar i18n EN — mesma estrutura

**Files:**
- Modify: `src/locales/en/translation.json`

**Step 1: Substituir bloco `about` no EN**

```json
"about": {
    "origin": "DNA_ORIGIN",
    "est": "EST_2016",
    "title_primary": "CINEMATIC",
    "title_highlight": "VISION",
    "lines": {
        "01": "A production company with 10 years on set. AI is our tool, not our identity.",
        "02": "We create from script to final film — concept, direction, aesthetics and delivery.",
        "03": "Flawless visuals for any type of production. No format limits, no scale limits."
    },
    "method": {
        "label": "THE METHOD",
        "control": {
            "title": "CONTROL",
            "text": "There is no magic prompt. Consistency comes from those who direct the process, not from the luck of a line of text."
        },
        "vision": {
            "title": "VISION",
            "text": "AI generates a thousand options. We know which one is right. Taste is the asset no model has."
        },
        "direct": {
            "title": "WE DIRECT THE INTELLIGENCE",
            "text": "Technology obeys art. What we deliver is not generated content — it is an authorial vision, finalized."
        }
    }
}
```

**Step 2: Verificar JSON válido**

Run: `cat src/locales/en/translation.json | python3 -m json.tool > /dev/null`
Expected: sem erro

**Step 3: Commit i18n**

```bash
git add src/locales/pt/translation.json src/locales/en/translation.json
git commit -m "refactor(i18n): restructure about page keys — merge modules+manifesto into method"
```

---

### Task 3: Reescrever AboutPage Hero section

**Files:**
- Modify: `index.tsx:3088-3150` (AboutPage component, hero section)

**Step 1: Reescrever o hero**

Substituir todo o conteúdo do `<main>` dentro de `AboutPage` (linhas 3097-3220).

A nova seção HERO deve ser:

```tsx
<main className="min-h-screen pt-32 md:pt-40 flex flex-col bg-[#050505] relative overflow-hidden">
    <div className="scanline-effect opacity-10 pointer-events-none"></div>

    {/* ── HERO: O QUE FAZEMOS ── */}
    <section className="min-h-[70vh] pb-24 md:pb-32 border-b border-white/5 reveal relative overflow-hidden">
        {/* ParticleBackground for consistency with home */}
        <ParticleBackground />
        {/* Breathing glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#DC2626]/5 rounded-full blur-[120px] pointer-events-none animate-breathe"></div>

        <div className="w-full px-6 md:px-12 lg:px-24 relative z-10">
            {/* PAGE HEADER — lore mantém */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl md:text-5xl font-brick text-white mb-4">
                        {t('about.origin').split('_')[0]}_<span className="text-[#DC2626]">{t('about.origin').split('_').slice(1).join('_')}</span>
                    </h1>
                    <p className="font-mono text-[10px] md:text-xs tracking-widest uppercase animate-system-input">
                        <span className="text-[#DC2626]">&gt;&gt; </span>
                        <span className="text-[#9CA3AF]">ACCESS_GRANTED // <span className="text-white">{t('about.est')}</span></span>
                    </p>
                </div>
            </div>

            {/* CENTERED: MONOLITH + TITLE + 3 LINES */}
            <div className="flex flex-col items-center text-center gap-10 py-8">
                {/* MONOLITH — bigger, matches home */}
                <div className="relative">
                    <div className="monolith-structure w-[130px] h-[260px] rounded-[2px] flex items-center justify-center overflow-visible shadow-2xl relative">
                        <div className="absolute inset-0 mix-blend-overlay monolith-texture bg-neutral-900 pointer-events-none rounded-[2px] overflow-hidden"></div>
                        <div className="centered-layer aura-atmos pointer-events-none opacity-60" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(153,27,27,0.1) 0%, transparent 60%)', filter: 'blur(30px)' }}></div>
                        <div className="centered-layer light-atmos animate-breathe pointer-events-none opacity-70 mix-blend-screen" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle at center, rgba(220,38,38,0.6) 0%, rgba(153,0,0,0.1) 30%, transparent 50%)', filter: 'blur(20px)' }}></div>
                        <div className="centered-layer core-atmos animate-breathe pointer-events-none" style={{ width: '40px', height: '40px', filter: 'blur(10px)', background: 'radial-gradient(circle, rgba(220,38,38,1) 0%, rgba(220,38,38,0.4) 40%, transparent 80%)' }}></div>
                        <div className="absolute inset-0 border border-white/5 opacity-50 pointer-events-none z-10 rounded-[2px]"></div>
                    </div>
                </div>

                {/* TITLE */}
                <div className="flex flex-col items-center gap-3">
                    <p className="font-brick text-5xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight uppercase">
                        {t('about.title_primary')}<br />
                        <span className="text-[#DC2626]">{t('about.title_highlight')}</span>
                    </p>
                </div>

                {/* 3 DECLARATIVE LINES */}
                <div className="max-w-2xl font-mono text-sm text-[#9CA3AF] leading-relaxed flex flex-col gap-6">
                    {['01', '02', '03'].map((num, i) => (
                        <motion.div
                            key={num}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                            className="flex gap-4 group text-left"
                        >
                            <span className="text-[#DC2626] font-bold shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">[{num}]</span>
                            <p className="border-l border-white/10 pl-4 group-hover:border-[#DC2626] transition-colors">
                                {t(`about.lines.${num}`)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </section>
```

**Nota:** O monolito removeu o wrapper responsivo `w-[100px] h-[200px] md:w-[130px] md:h-[260px]` e ficou fixo em `w-[130px] h-[260px]` (tamanho home). Se quiser manter responsivo, usar `w-[100px] h-[200px] md:w-[130px] md:h-[260px]` como antes.

---

### Task 4: Reescrever AboutPage — seção O Método

**Files:**
- Modify: `index.tsx` (continuação do AboutPage, substitui seções OLHAR AUTORAL + ANTI-SLOP)

**Step 1: Adicionar seção O Método usando PhilosophyItem**

Logo após o `</section>` do hero, adicionar:

```tsx
    {/* ── O MÉTODO: DECLARAÇÕES ESCALONADAS ── */}
    <section className="relative w-full pt-20 pb-24 md:pb-32 bg-[#050505] z-20 overflow-hidden">
        <div className="absolute inset-0 z-[2] opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle,transparent_40%,rgba(5,5,5,0.9)_100%)] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <div className="mb-20 reveal w-full flex flex-col items-center">
                <div className="w-full flex justify-center mb-6">
                    <div className="relative w-5 h-5">
                        <div className="absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full animate-breathe blur-[2px]" style={{ background: 'radial-gradient(circle at center, rgba(220,38,38,0.55) 0%, rgba(220,38,38,0.18) 45%, rgba(220,38,38,0) 75%)' }}></div>
                        <div className="absolute left-1/2 top-1/2 w-[2px] h-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DC2626]/60"></div>
                    </div>
                </div>
                <span className="text-4xl md:text-6xl font-brick text-white bg-[#050505] px-4 text-center">{t('about.method.label')}</span>
            </div>
            <div className="flex flex-col gap-24 w-full">
                <PhilosophyItem title={t('about.method.control.title')} text={t('about.method.control.text')} titleSize="text-2xl md:text-3xl" index={0} />
                <PhilosophyItem title={t('about.method.vision.title')} text={t('about.method.vision.text')} titleSize="text-3xl md:text-4xl" index={1} />
                <PhilosophyItem title={t('about.method.direct.title')} text={t('about.method.direct.text')} titleSize="text-4xl md:text-6xl" index={2} />
            </div>
        </div>
    </section>

</main>
```

**Step 2: Remover seções antigas**

Deletar completamente:
- Seção `CAPACIDADES: INDUSTRIAL GRID` (linhas ~3152-3188)
- Seção `MANIFESTO: BRUTALIST BLOCKS` (linhas ~3190-3218)

Estas são substituídas pela seção O Método acima.

**Step 3: Verificar build**

Run: `npm run build` (ou `npx vite build`)
Expected: Build sem erros, sem warnings de chaves i18n faltando

**Step 4: Commit componente**

```bash
git add index.tsx
git commit -m "refactor(about): redesign — hero with 3 lines, merge modules+manifesto into escalating method"
```

---

### Task 5: Verificação visual

**Step 1: Iniciar dev server**

Run: `npm run dev`

**Step 2: Verificar About page**

Navegar para a About page e verificar:
- [ ] Header lore `DNA_ORIGIN` / `ACCESS_GRANTED // EST_2016` aparece
- [ ] Monolito tem tamanho maior (130x260)
- [ ] ParticleBackground visível atrás do hero
- [ ] Título "VISÃO DE / CINEMA" com vermelho
- [ ] 3 linhas declarativas com `[01]` `[02]` `[03]` em vermelho, borda lateral
- [ ] Stagger animation nas 3 linhas
- [ ] Label "O MÉTODO" com dot vermelho pulsante
- [ ] 3 declarações escalonadas: CONTROLE (pequeno) → VISÃO (médio) → NÓS DIRIGIMOS (massivo)
- [ ] Hover nos títulos do método → vermelho
- [ ] Motion stagger nas declarações
- [ ] Footer CTA aparece normalmente
- [ ] Sem seções OLHAR AUTORAL ou ANTI-SLOP
- [ ] Trocar idioma (PT/EN) funciona em todas as novas chaves

**Step 3: Verificar responsivo**

Testar em viewport mobile (375px) e tablet (768px):
- [ ] Monolito e título não quebram
- [ ] 3 linhas legíveis em mobile
- [ ] Declarações do método empilham corretamente

**Step 4: Commit final (se ajustes)**

```bash
git add -A
git commit -m "fix(about): visual adjustments post-review"
```
