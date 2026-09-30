# Design System Coopercica Digital

## Fonte canônica

| Responsabilidade | Arquivo |
|---|---|
| Valores e nomes semânticos | `styles/tokens.css` |
| Escala e classes tipográficas | `styles/typography.css` |
| Container, seções e hero interno | `styles/layout.css` |
| CTA, links e ícones compartilhados | `styles/components.css` |
| Reset e imports, sem redefinir tokens | `app/globals.css` |
| Estilos existentes do CMS isolados | `styles/admin.css` |
| Composição específica | CSS Modules próximos aos componentes |

Não adicionar outro arquivo de tokens. Os aliases `--green-*`, `--heading`, `--text`, `--line`, `--white` e `--ux-*` são compatibilidade para o CMS existente e referenciam os valores canônicos; não constituem outra paleta. Sua remoção depende de uma fase específica do CMS.

## Paleta

| Token de marca | Valor oficial |
|---|---|
| `--brand-green-900` | `#1C4722` |
| `--brand-green-700` | `#205F30` |
| `--brand-green-500` | `#6AB945` |
| `--brand-lime-500` | `#A8CF38` |
| `--brand-red-500` | `#EF4037` |
| `--brand-coral-500` | `#EF5F4B` |
| `--brand-orange-500` | `#F68B1F` |

`--neutral-*`, `--surface-*`, `--text-*`, `--border-*`, `--feedback-*` e `--action-*` expressam funções digitais, não novas cores oficiais. O vermelho continua nos acentos e anos em tamanho grande. Eyebrows pequenos sobre fundo claro usam verde institucional para contraste. Badges coral/laranja usam neutralidade escura, pois verde institucional nessas superfícies não atinge 4,5:1 para texto pequeno.

## Tipografia

Gotham é a fonte do Brandbook. Não há arquivos oficiais licenciados no repositório. Montserrat permanece como fallback temporário, usando `next/font/google`, com a variável aplicada ao `<html>` retornado pelo layout e consumida por `--font-sans`. Arial é fallback de contingência.

As medidas abaixo são decisões do sistema digital derivadas da identidade, não prescrições do Brandbook.

| Uso | Token | Escala |
|---|---|---|
| Display, somente destaque necessário | `--font-size-display` | `clamp(3rem, 6vw, 5.5rem)` |
| H1 | `--font-size-h1` | `clamp(2.5rem, 5vw, 4.5rem)` |
| H2 de seção | `--font-size-h2` | `clamp(2rem, 4vw, 4rem)` |
| H3 | `--font-size-h3` | `clamp(1.35rem, 2.2vw, 2rem)` |
| Body Large | `--font-size-body-lg` | `clamp(1rem, 1.2vw, 1.125rem)` |
| Body | `--font-size-body` | `1rem` |
| Small | `--font-size-sm` | `.875rem` |
| Eyebrow | `--font-size-eyebrow` | `.75rem` |

AppShowcase conserva escala compacta nos breakpoints da composição fixada na viewport, para não recortar texto durante o scroll; os tamanhos devem ser tokens de composição e documentados junto ao componente. Anos da História, preço e números de produto são composição editorial/numérica, não H1/H2 alternativos.

## Componentes

- `Button`: links (`href`) ou ações (`button` nativo); variantes `primary`, `secondary`, `ghost`; `tone="inverse"` para fundo escuro. Primary usa `#1C4722`/branco (10,64:1), hover `#205F30`/branco (7,66:1). Altura mínima 48 px, padding 12/24 px, gap 12 px, radius pill, foco com contorno, active e disabled. Ícone default de direção: interno →, externo ↗. `icon={false}` omite; ícone customizado evita duplicação. O alias CSS `.button` atende ao CMS com os mesmos valores e estados.
- `SectionHeader`: eyebrow opcional → H2 → descrição; `stacked` muda composição, sem outro sistema de headings; `light` muda apenas o tom. Quebras controladas por array de strings.
- `Container`: máximo 1280 px; gutter `clamp(20px, 100vw / 24, 80px)`. Referência ao lado longo /24 do manual aplicada horizontalmente, sem dividir altura de página. `.shell` é alias do mesmo seletor para rotas existentes.
- `Section`: padding `--section-space` e tons `white`, `soft`, `muted`, `green`.
- `Card`: radius médio, borda, padding canônico; padrão sem sombra, `soft`, `outline`, `elevated` quando há necessidade de elevação. Produtos da folheteria usam o componente com composição compacta própria.
- `Badge`: tons semânticos com contraste; usado na folheteria e na referência.
- `Icon`: SVG de traço 1,8; preservados ícones outline existentes das lojas. Ícones de terceiros App Store/Google Play permanecem como assinaturas oficiais de terceiros.

## Layout e ritmo

Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 e 128 px. Seção: `clamp(64px,7vw,112px)`; heading/conteúdo: `clamp(32px,4vw,64px)`; título/descrição: 24 px; grid: 24 px; cards: 32 px, 24 px em mobile. Raios: controle 12, pequeno 16, médio 24, grande 36 e pill. Sombras por função: soft, card, overlay. Não colocar tudo em cards.

História conserva o carrossel de largura total, mas texto/imagem usam a mesma margem compositiva do container. AppShowcase conserva o mockup e o scroll fixado, com container canônico. Dimensões físicas do mockup e relações de imagem são exceções de composição, não valores globais.

## Marca e CMS

O marcador da História usa uma forma circular independente. O símbolo isolado foi retirado da jornada porque coexistia com a assinatura completa e recebia rotação/drop-shadow.

O RootLayout não injeta mais `primaryColor`, `secondaryColor`, `accentColor` ou `pageColor` do CMS como redefinições CSS. Os quatro campos ficam desabilitados no frontend; valores existentes e contrato de salvamento são preservados. Isso não valida o backend nem impede gravação via API. Logos e imagens enviados pelo CMS podem conter arquivos incompatíveis, efeitos ou uma assinatura alterada; essa governança permanece pendente. Não houve alteração de banco, RLS, autenticação, Storage ou dados de produção.

## Referência e validação

`/design-system` usa os componentes reais e mostra marca separada das cores funcionais, escala, headings, CTAs, estados, cards, badges, ícones, container e spacing. Estados hover/active são verificados pela interação; Tab evidencia o foco. Não há exemplos com estilos simulados de botão.

`node scripts/check-design-system.mjs` detecta variáveis ausentes e hexadecimais literais no CSS público. Variável de fonte é fornecida por `next/font`; exemplos de spacing são gerados a partir de tokens existentes. Leitura visual e navegação em desktop/mobile continuam obrigatórias.
