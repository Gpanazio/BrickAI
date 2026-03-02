# Instagram Carousels — Design Doc
**Data:** 2026-02-25
**Arquivo de saída:** `instagram_carousels.html`

## Contexto
Primeira aparição da Brick AI (divisão generativa da Brick) no Instagram. Dentro do padrão visual da Brick.

## Spec Técnica
- **Formato:** 1350×1080px (5:4 landscape)
- **Total:** 3 carrosséis × 3 slides = 9 slides num único HTML
- **Download:** botão por carrossel + botão global
- **Renderização:** html2canvas scale 2

## Identidade Visual
- BG: #050505 | Red: #DC2626 / #FF1A1A | White: #E5E5E5
- Font display: Inter 900, letter-spacing -0.04em, line-height 1
- Font mono: JetBrains Mono 700
- Texturas: noise overlay SVG, tech grid 40×40px
- Red glow via box-shadow/filter blur

## Carrosséis

### C1 — "DO SET AO TUDO" (Origem)
- Slide 1: "BRICK_AI." grande + "UMA NOVA DIVISÃO DA BRICK."
- Slide 2: "DO ZERO AO TUDO / DESDE 2016." + detalhe do legado
- Slide 3: Hero replica

### C2 — "NÓS DIRIGIMOS A INTELIGÊNCIA" (Manifesto)
- Slide 1: "A MÁQUINA É O PINCEL." em vermelho
- Slide 2: "NÓS DIRIGIMOS / A INTELIGÊNCIA." bold máximo
- Slide 3: Hero replica

### C3 — "A IA FAZ A IMAGEM. NÓS FAZEMOS O CINEMA." (Diferenciação)
- Slide 1: "A IA FAZ A IMAGEM." em vermelho CRT
- Slide 2: "NÓS FAZEMOS / O CINEMA." em branco bold
- Slide 3: Hero replica

## Slide Hero (slide 3 de todos)
- Monolith CSS: 80×160px preto, border #1a1a1a, red glow inner
- Aura: radial-gradient DC2626 blur 80px
- Texto: "NASCIDOS NO SET" mono white + "A MESMA ALMA" Inter 900 red
- Logo: "BRICK_AI." ponto vermelho
