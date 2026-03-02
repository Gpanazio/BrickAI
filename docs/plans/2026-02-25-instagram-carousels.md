# Instagram Carousels — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar `instagram_carousels.html` com 3 carrosséis × 3 slides (5:4, 1350×1080px) anunciando a primeira aparição da Brick AI, com botões de download por slide e por carrossel.

**Architecture:** Arquivo HTML único, autocontido, sem dependências além de CDN (Google Fonts + html2canvas). Cada slide é uma `div.slide` de 1350×1080px. Botão de download por carrossel usa html2canvas para capturar os 3 slides do grupo e baixar como PNG sequencial. Nenhum framework JS.

**Tech Stack:** HTML, CSS (custom + utilitários inline), JavaScript vanilla, html2canvas 1.4.1, Google Fonts (Inter + JetBrains Mono)

---

### Task 1: Scaffold do HTML + Tokens Visuais

**Files:**
- Create: `instagram_carousels.html`

**Step 1: Criar o arquivo com head, CSS tokens e estrutura base**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Brick AI — Instagram Carousels</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <style>
    :root {
      --black: #050505;
      --red: #DC2626;
      --alarm: #FF1A1A;
      --white: #E5E5E5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #111;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 60px;
      padding: 60px 40px;
    }

    /* SLIDE BASE */
    .slide {
      width: 1350px;
      height: 1080px;
      background: var(--black);
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }

    /* TYPOGRAPHY */
    .f-brick {
      font-family: 'Inter', sans-serif;
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 1;
      color: var(--white);
    }
    .f-mono {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    /* TEXTURES */
    .noise {
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.07;
      mix-blend-mode: overlay;
      pointer-events: none;
      z-index: 1;
    }
    .grid {
      position: absolute; inset: 0;
      background-size: 54px 54px;
      background-image:
        linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
      pointer-events: none;
      z-index: 1;
    }

    /* CONTENT LAYER */
    .content {
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 90px 100px;
    }

    /* RED LINE */
    .redline {
      width: 80px;
      height: 6px;
      background: var(--red);
      box-shadow: 0 0 20px rgba(220,38,38,0.6);
    }

    /* RED DOT */
    .dot {
      width: 20px; height: 20px;
      border-radius: 50%;
      background: var(--red);
      box-shadow: 0 0 20px rgba(220,38,38,0.8);
      display: inline-block;
    }

    /* RED GLOW BG */
    .glow-bg {
      position: absolute;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%);
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }

    /* CAROUSEL GROUP */
    .carousel-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }
    .carousel-label {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 14px;
      color: #555;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .carousel-slides {
      display: flex;
      flex-direction: row;
      gap: 24px;
    }

    /* DOWNLOAD BUTTONS */
    .btn-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .btn {
      background: var(--red);
      color: white;
      border: none;
      padding: 14px 28px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      border-radius: 3px;
      box-shadow: 0 0 20px rgba(220,38,38,0.3);
      transition: all 0.15s;
    }
    .btn:hover { background: #b91c1c; transform: scale(1.02); }
    .btn-outline {
      background: transparent;
      border: 1px solid #DC2626;
      color: var(--red);
    }
    .btn-outline:hover { background: rgba(220,38,38,0.1); }

    /* CRT TEXT EFFECT */
    .crt {
      color: var(--alarm);
      text-shadow: 0 0 10px rgba(255,26,26,0.9), 0 0 25px rgba(255,26,26,0.4);
    }

    /* MONOLITH (hero slide) */
    .monolith {
      width: 100px;
      height: 200px;
      background: linear-gradient(to bottom, #0a0a0a, #000);
      border: 1px solid #1a1a1a;
      border-radius: 2px;
      position: relative;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.9), 0 0 60px rgba(220,38,38,0.08);
      flex-shrink: 0;
    }
    .monolith-glow {
      position: absolute;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(220,38,38,0.35) 0%, rgba(153,0,0,0.1) 50%, transparent 70%);
      filter: blur(40px);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .monolith-core {
      position: absolute;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #DC2626;
      filter: blur(4px);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <!-- CAROUSELS GO HERE -->
  <script>
    async function downloadCarousel(prefix, ids) {
      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#050505', useCORS: true });
        const a = document.createElement('a');
        a.download = `${prefix}_slide_${i + 1}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        await new Promise(r => setTimeout(r, 400));
      }
    }
    async function downloadAll() {
      await downloadCarousel('c1_origem', ['c1s1','c1s2','c1s3']);
      await downloadCarousel('c2_manifesto', ['c2s1','c2s2','c2s3']);
      await downloadCarousel('c3_diferenca', ['c3s1','c3s2','c3s3']);
    }
  </script>
</body>
</html>
```

**Step 2: Abrir no browser e verificar que a página carrega sem erros**

Abrir `instagram_carousels.html` no Chrome. Deve mostrar fundo escuro sem erros no console.

**Step 3: Commit**

```bash
cd "/Users/gabrielpanazio/BRICK TODOS PROJETOS/BrickAI"
git add instagram_carousels.html
git commit -m "feat: scaffold instagram carousels HTML com tokens e base CSS"
```

---

### Task 2: Carrossel 1 — "DO SET AO TUDO" (Origem)

**Files:**
- Modify: `instagram_carousels.html` — adicionar C1 antes do `<script>`

**Step 1: Inserir o grupo do Carrossel 1**

Adicionar dentro de `<body>`, antes do `<script>`:

```html
<!-- ===================== CARROSSEL 1 — ORIGEM ===================== -->
<div class="carousel-group">
  <p class="carousel-label">Carrossel 1 — Do Set ao Tudo</p>
  <div class="carousel-slides">

    <!-- SLIDE 1/3 -->
    <div class="slide" id="c1s1">
      <div class="noise"></div>
      <div class="grid"></div>
      <div class="glow-bg" style="top:-100px;left:-100px;"></div>
      <div class="content">
        <div class="dot"></div>
        <div>
          <p class="f-mono" style="font-size:28px;color:var(--red);margin-bottom:32px;">// A DIVISÃO GENERATIVA</p>
          <h1 class="f-brick" style="font-size:200px;color:var(--white);line-height:0.88;">BRICK<span style="color:var(--red)">_</span><br>AI<span style="color:var(--red)">.</span></h1>
        </div>
        <p class="f-mono" style="font-size:24px;color:#444;">// 2026</p>
      </div>
    </div>

    <!-- SLIDE 2/3 -->
    <div class="slide" id="c1s2">
      <div class="noise"></div>
      <div class="grid"></div>
      <div class="glow-bg" style="bottom:-80px;right:-80px;background:radial-gradient(circle,rgba(220,38,38,0.08) 0%,transparent 70%);"></div>
      <div class="content">
        <p class="f-mono" style="font-size:26px;color:var(--red);">UMA NOVA DIVISÃO DA BRICK.</p>
        <div>
          <h2 class="f-brick crt" style="font-size:110px;line-height:0.92;margin-bottom:40px;">DO SET<br>AO TUDO.</h2>
          <div class="redline" style="margin-bottom:36px;"></div>
          <h2 class="f-brick" style="font-size:60px;line-height:1.05;color:var(--white);">DO ZERO<br>AO TUDO<br>DESDE 2016.</h2>
        </div>
        <p class="f-mono" style="font-size:22px;color:#333;">// BRICK_AI</p>
      </div>
    </div>

    <!-- SLIDE 3/3 — HERO REPLICA -->
    <!-- inserido na Task 5 (componente reutilizável) -->
    <div class="slide" id="c1s3"><!-- hero --></div>

  </div>
  <div class="btn-group">
    <button class="btn" onclick="downloadCarousel('c1_origem',['c1s1','c1s2','c1s3'])">↓ Baixar Carrossel 1</button>
  </div>
</div>
```

**Step 2: Verificar no browser**

Recarregar a página. Devem aparecer 2 slides visíveis lado a lado (o 3º fica vazio até a Task 5). Checar tipografia, cores, proporções.

**Step 3: Commit**

```bash
git add instagram_carousels.html
git commit -m "feat: carrossel 1 origem — slides 1 e 2"
```

---

### Task 3: Carrossel 2 — "NÓS DIRIGIMOS A INTELIGÊNCIA" (Manifesto)

**Files:**
- Modify: `instagram_carousels.html` — adicionar C2 após o grupo C1

**Step 1: Inserir o grupo do Carrossel 2**

```html
<!-- ===================== CARROSSEL 2 — MANIFESTO ===================== -->
<div class="carousel-group">
  <p class="carousel-label">Carrossel 2 — Manifesto</p>
  <div class="carousel-slides">

    <!-- SLIDE 1/3 -->
    <div class="slide" id="c2s1">
      <div class="noise"></div>
      <div class="grid"></div>
      <div class="glow-bg" style="top:50%;left:50%;transform:translate(-50%,-50%);width:800px;height:800px;"></div>
      <div class="content">
        <div class="dot"></div>
        <div>
          <h2 class="f-brick" style="font-size:80px;color:var(--white);line-height:0.95;margin-bottom:24px;">A MÁQUINA<br>É O PINCEL.</h2>
          <div class="redline"></div>
        </div>
        <div>
          <h3 class="f-brick crt" style="font-size:120px;line-height:0.9;">O MODELO<br>É A TINTA.</h3>
        </div>
        <p class="f-mono" style="font-size:22px;color:var(--red);">// BRICK_AI — THE GENERATIVE DIVISION</p>
      </div>
    </div>

    <!-- SLIDE 2/3 -->
    <div class="slide" id="c2s2">
      <div class="noise"></div>
      <div class="grid"></div>
      <div class="glow-bg" style="bottom:0;right:0;"></div>
      <div class="content">
        <p class="f-mono" style="font-size:26px;color:var(--red);">2026.</p>
        <div>
          <p class="f-brick" style="font-size:55px;color:var(--white);line-height:1;margin-bottom:36px;">AINDA SOMOS<br>OS ARTISTAS.</p>
          <div class="redline" style="margin-bottom:36px;width:120px;"></div>
          <h2 class="f-brick" style="font-size:130px;line-height:0.88;color:var(--white);">NÓS<br>DIRIGIMOS<br><span class="crt">A INTELI<wbr>GÊNCIA.</span></h2>
        </div>
        <p class="f-mono" style="font-size:22px;color:#333;">// BRICK_AI</p>
      </div>
    </div>

    <!-- SLIDE 3/3 — HERO REPLICA -->
    <div class="slide" id="c2s3"><!-- hero --></div>

  </div>
  <div class="btn-group">
    <button class="btn" onclick="downloadCarousel('c2_manifesto',['c2s1','c2s2','c2s3'])">↓ Baixar Carrossel 2</button>
  </div>
</div>
```

**Step 2: Verificar no browser**

Checar hierarquia tipográfica — o texto maior deve dominar visualmente, vermelho como acento.

**Step 3: Commit**

```bash
git add instagram_carousels.html
git commit -m "feat: carrossel 2 manifesto — slides 1 e 2"
```

---

### Task 4: Carrossel 3 — "A IA FAZ A IMAGEM. NÓS FAZEMOS O CINEMA." (Diferenciação)

**Files:**
- Modify: `instagram_carousels.html` — adicionar C3 após o grupo C2

**Step 1: Inserir o grupo do Carrossel 3**

```html
<!-- ===================== CARROSSEL 3 — DIFERENCIAÇÃO ===================== -->
<div class="carousel-group">
  <p class="carousel-label">Carrossel 3 — A IA Faz a Imagem</p>
  <div class="carousel-slides">

    <!-- SLIDE 1/3 -->
    <div class="slide" id="c3s1">
      <div class="noise"></div>
      <div class="grid"></div>
      <div class="glow-bg" style="top:-100px;right:-100px;"></div>
      <div class="content">
        <div class="dot"></div>
        <div>
          <h2 class="f-brick crt" style="font-size:140px;line-height:0.88;margin-bottom:36px;">A IA FAZ<br>A IMAGEM.</h2>
          <div class="redline" style="width:60px;"></div>
        </div>
        <p class="f-mono" style="font-size:24px;color:var(--red);">// BRICK_AI — 2026</p>
      </div>
    </div>

    <!-- SLIDE 2/3 -->
    <div class="slide" id="c3s2">
      <div class="noise"></div>
      <div class="grid"></div>
      <div class="glow-bg" style="bottom:-50px;left:50%;transform:translateX(-50%);width:900px;height:500px;border-radius:0;"></div>
      <div class="content">
        <p class="f-mono" style="font-size:26px;color:var(--red);">MAS.</p>
        <div>
          <h2 class="f-brick" style="font-size:155px;line-height:0.88;color:var(--white);">NÓS<br>FAZEMOS<br>O CINEMA.</h2>
        </div>
        <div style="display:flex;align-items:center;gap:20px;">
          <div class="redline" style="width:40px;"></div>
          <p class="f-mono" style="font-size:22px;color:#444;">// BRICK_AI</p>
        </div>
      </div>
    </div>

    <!-- SLIDE 3/3 — HERO REPLICA -->
    <div class="slide" id="c3s3"><!-- hero --></div>

  </div>
  <div class="btn-group">
    <button class="btn" onclick="downloadCarousel('c3_diferenca',['c3s1','c3s2','c3s3'])">↓ Baixar Carrossel 3</button>
  </div>
</div>
```

**Step 2: Verificar no browser**

"A IA FAZ A IMAGEM." em vermelho CRT no slide 1, "NÓS FAZEMOS O CINEMA." em branco bold no slide 2. Tensão visual entre os dois.

**Step 3: Commit**

```bash
git add instagram_carousels.html
git commit -m "feat: carrossel 3 diferenciação — slides 1 e 2"
```

---

### Task 5: Slide Hero (Réplica da Home) — Injetar nos 3 Carrosséis

**Files:**
- Modify: `instagram_carousels.html` — substituir os placeholders `<!-- hero -->` nos ids `c1s3`, `c2s3`, `c3s3`

**Step 1: Criar o HTML do slide hero e substituir os 3 placeholders**

O conteúdo é idêntico nos 3 slides. Substituir cada `<div class="slide" id="cXs3"><!-- hero --></div>` por:

```html
<div class="slide" id="c1s3">  <!-- ou c2s3 / c3s3 -->
  <div class="noise"></div>
  <div class="grid"></div>
  <!-- GLOW CENTRAL GRANDE -->
  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:0;">
    <div style="width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(220,38,38,0.12) 0%,transparent 65%);filter:blur(80px);"></div>
  </div>

  <div class="content" style="align-items:center;justify-content:center;gap:40px;">
    <!-- MONOLITH -->
    <div class="monolith">
      <div class="monolith-glow"></div>
      <div class="monolith-core"></div>
    </div>

    <!-- TEXTO ABAIXO DO MONOLITH -->
    <div style="text-align:center;">
      <p class="f-mono" style="font-size:26px;color:var(--white);letter-spacing:0.18em;margin-bottom:16px;">NASCIDOS NO SET</p>
      <h2 class="f-brick" style="font-size:72px;color:var(--red);text-shadow:0 0 20px rgba(220,38,38,0.4);">A MESMA ALMA</h2>
      <p class="f-mono" style="font-size:20px;color:var(--white);letter-spacing:0.12em;margin-top:12px;opacity:0.5;">UM NOVO CORPO</p>
    </div>

    <!-- LOGO -->
    <p class="f-brick" style="font-size:32px;color:var(--white);position:absolute;bottom:70px;left:100px;">
      BRICK_AI<span style="color:var(--red);">.</span>
    </p>
    <p class="f-mono" style="font-size:18px;color:#333;position:absolute;bottom:70px;right:100px;">// THE GENERATIVE DIVISION</p>
  </div>
</div>
```

**Step 2: Verificar os 3 slides hero**

Recarregar. Cada carrossel deve terminar com o slide idêntico ao hero do site (monolith escuro, glow vermelho central, textos centralizados, logo no rodapé).

**Step 3: Commit**

```bash
git add instagram_carousels.html
git commit -m "feat: slide hero réplica injetado nos 3 carrosséis"
```

---

### Task 6: Botão Global + Polimento Final

**Files:**
- Modify: `instagram_carousels.html` — adicionar botão global no topo do body + ajustes finais de espaçamento/contraste

**Step 1: Adicionar botão "Baixar Todos" no topo**

Logo após `<body>`, antes do primeiro `carousel-group`:

```html
<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding-bottom:20px;">
  <p style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#444;letter-spacing:0.2em;">BRICK_AI — INSTAGRAM CAROUSELS 2026</p>
  <button class="btn" onclick="downloadAll()" style="font-size:16px;padding:18px 48px;">↓ BAIXAR TODOS (9 SLIDES)</button>
</div>
```

**Step 2: Revisar visualmente os 9 slides**

Checar escala das fontes, contraste, glow vermelho, textura de noise. Ajustar `font-size` se algum texto sair da área do slide (especialmente nos títulos de 155px+).

**Step 3: Testar download de um slide**

Clicar "Baixar Carrossel 1" e verificar que 3 PNGs são gerados em sequência com as dimensões corretas (2700×2160px por ser scale:2 de 1350×1080).

**Step 4: Commit final**

```bash
git add instagram_carousels.html
git commit -m "feat: botão global de download + polimento visual final dos 9 slides"
```

---

## Checklist Final
- [ ] 9 slides renderizando corretamente (sem overflow de texto)
- [ ] Noise overlay visível mas sutil
- [ ] Slide hero idêntico nos 3 carrosséis (monolith + glow + "NASCIDOS NO SET")
- [ ] Downloads geram PNG 2700×2160px (5:4 @ 2x)
- [ ] Sem erros no console do browser
