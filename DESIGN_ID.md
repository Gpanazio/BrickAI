# BRICK AI — DESIGN ID
### Identidade Visual do Site brickai.com.br

> *"A câmera não mente. E ela nunca vai ter alma."*

---

## 01. A PREMISSA

A Brick não é uma startup de IA. É uma **produtora cinematográfica com 10 anos de set** que passou a usar inteligência artificial como ferramenta de produção. Isso muda tudo.

O site não pode parecer uma landing page de SaaS. Não pode ter gradientes neon do Vale do Silício, ícones de robo, ou CTAs de "Comece Grátis". Precisa sentir como uma **obra audiovisual**: pesada, intencional, e com a gravidade de quem já filmou de verdade.

---

## 02. A REFERÊNCIA: STANLEY KUBRICK

O visual do site é construído sob influência direta da estética de Kubrick — especificamente:

- **2001: Uma Odisseia no Espaço** — O vácuo cósmico, a lentidão calculada, o Monolito negro emergindo de uma luz difusa no horizonte. O silêncio como linguagem.
- **Full Metal Jacket / A Laranja Mecânica** — A frieza no olhar da câmera, simetria absoluta, tensão sem ornamentação.
- **Barry Lyndon** — Os fundos escuros profundos, a luz de vela como única fonte de luminosidade, a contenção dramática.

### O Que Isso Significa na Prática

| Elemento | Interpretação Kubrick |
|---|---|
| Paleta de cores | Preto profundo (`#000000`) como base infinita; Vermelho (`#DC2626`) como única cor viva — sangue, câmera, perigo, urgência |
| Espaço negativo | Muito ar ao redor dos elementos. O vazio significa que o que está lá importa. |
| Movimento | Lento e deliberado. Nada pisca, nada explode. Tudo flutua, respira, ascende. |
| Tipografia | Peso cinematográfico. Fontes pesadas de bloco (font-brick) para declarações. Monospace (font-mono) para metadados técnicos, system labels, coordenadas. |
| Luz | Difusa, nunca pontual. Como o nascer do sol sobre o horizonte — a vantagem vem de baixo, se expande em volume. |

---

## 03. SISTEMA DE CORES

```
VOID          #000000   O infinito. Fundo de tudo.
DEEP SPACE    #050505   Quase preto. Seções adjacentes.
BRICK RED     #DC2626   A única cor viva. Sangue de câmera.
STARDUST      #9CA3AF   Textos secundários. Metadados.
WHITE CORE    #FFFFFF   Para luz, brilho, o instante do flash.
```

**Regra:** Nunca use azul. Nunca use verde. Nunca use laranja puro.
O espectro é: **preto → vermelho → branco**. Isso é tudo.

---

## 04. TIPOGRAFIA

| Família | Uso | Personalidade |
|---|---|---|
| `font-brick` | Títulos de declaração, CTAs, nomes de seção | Pesado, cinematográfico, autoral |
| `font-mono` | Labels de estágio, metadados, IDs técnicos | Sistema, distância, precisão |
| `font-ai` | Elementos de interface, botões, scramble text | Tech, HUD, matrix |

**Hierarquia de título:**
- Labels de estágio: `text-[10px] tracking-[1em] uppercase` — quase invisível, como marcação de câmera
- Títulos de bloco: `text-[80px]+` — uma só palavra que pesa toneladas
- Subtítulos: mono pequeno, espaçado, discreto

---

## 05. A ESTRUTURA NARRATIVA: OS 3 ESTÁGIOS

O site conta uma história em três atos — como um filme em três movimentos.

### ESTÁGIO I — EVOLUÇÃO (*Nascidos no Set*)
**O que é:** Uma produtora que nasceu no set de filmagem e que agora tem acesso a ferramentas sem limite.

**Visual:** O Monolito de 2001. Um bloco negro absolutamente vertical emergindo lentamente de uma aurora difusa vermelha. As estrelas giram ao fundo. A luz nasce de baixo, como um pôr do sol invertido — não é o fim do dia, é o início de algo novo. Os clientes aparecem como constelações distantes, silenciosas.

**Sentimento:** *Awe*. Reverência. Você está olhando pra algo maior que você.

---

### ESTÁGIO II — O MÉTODO (*A Crença*)
**O que é:** A filosofia de trabalho da Brick. Três verdades absolutas sobre o que eles fazem.

**Visual:** Campo de estrelas puro. Zero decoração. As três declarações são esculpidas no espaço vazio:
- **PROMPT** — A matéria-prima
- **RUÍDO** — O que eles eliminam
- **NÓS DIRIGIMOS A INTELIGÊNCIA** — A afirmação final

**Sentimento:** *Clareza absoluta*. Como ler o manifesto de uma missão espacial.

---

### ESTÁGIO III — O GRAN FINALE (*Call to Action*)
**O que é:** O convite. A Brick está pronta pra trabalhar.

**Visual:** Uma nebulosa de luz vermelha se expande pelo fundo escuro. O título cresce até `110px` — maior que qualquer coisa na página. Ele pulsa de branco-cinza para vermelho absoluto no hover. O botão "FALE CONOSCO" é um bloco de vidro que recebe um scanner de luz ao ser tocado.

**Sentimento:** *Inevitabilidade*. Você chegou aqui e só tem um próximo passo.

---

## 06. FILOSOFIA DE MOVIMENTO

```
Slow = Confidence
Fast = Anxious
```

**Regras de animação:**
- Transições de entrada: mínimo 1.5s, `easeOut` ou curva custom `[0.25, 1, 0.5, 1]`
- Nada com `bounce`. Nunca.
- Loops de fundo: 12s a 120s — quase imperceptíveis, como respirar
- Parallax: sutil, nunca exagerado. O espaço se move ligeiro, o texto fica firme.
- Hover: lento e deliberado (500ms+), exceto scanlines e glitch que são instantâneos
- Scramble de texto: glitch rápido, resolução lenta — a informação se revela com esforço

---

## 07. OS BACKGROUNDS VIVOS

O site tem uma camada de fundo viva em cada seção:

| Componente | Onde | O que faz |
|---|---|---|
| `ParticleBackground` | Todos os Estágios I, II, III + Works | Campo de estrelas Three.js que responde ao mouse |
| `StarchildBackground` | Estágio I | O pulsar vermelho de criação — a aurora orbital |
| `TunnelBackground` | Seção Philosophy (home) | Octógonos perspectivos em vermelho — o portal |
| `StarGateBackground` | Seção de Transmissões | Estrelas estroboscópicas coloridas em perspectiva |
| `MassiveTunnelBackground` | Seção de Trabalhos (detail) | Versão mais densa do octógono |

---

## 08. O QUE NÃO É A BRICK

- Não é tecnologia fria e asséptica (não é azul, não é branco total)
- Não é startup verde-limão com "Growth Hacking"
- Não é agência de marketing com mockups de telefone
- Não é futurismo estéril sem alma

**É:** Uma produtora que tem alma há 10 anos, e agora tem também infinito poder técnico. O perigo e a beleza disso ao mesmo tempo.

---

## 09. TOM DE VOZ NO TEXTO

- Declarativo. Sem pergunta, sem vacilação.
- Curto. Uma linha que pesa mais que um parágrafo.
- Altivo sem ser arrogante.
- Técnico nos metadados, poético nas declarações.

**Exemplos aceitos:**
> "Não é um experimento. É uma produtora com 10 anos de set que agora não tem mais limites."

> "NÓS DIRIGIMOS A INTELIGÊNCIA."

> "TEM UMA IDEIA IMPOSSÍVEL? NÓS TEMOS A VISÃO."

**Exemplos rejeitados:**
> "Somos uma empresa inovadora de soluções criativas em IA!"

> "Conheça nossas soluções personalizadas!"

---

*Documento mantido vivo. Atualizar quando o conceito evoluir.*
