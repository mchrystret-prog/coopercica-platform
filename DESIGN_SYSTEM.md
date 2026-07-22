# Design System — Coopercica Digital

Este sistema foi extraído do projeto existente. O objetivo é organizar e documentar a linguagem visual atual, não redesenhar drasticamente o site.

## 1. Princípios

1. **Institucional e próximo**: a interface deve transmitir confiança sem parecer fria.
2. **Clareza antes de ornamentação**: campanhas, lojas e serviços devem ser encontrados rapidamente.
3. **Consistência**: cores, pesos, raios, sombras e espaçamentos devem vir dos tokens.
4. **Montserrat como voz digital**: títulos em 700, subtítulos em 600 e textos em 400.
5. **Acessibilidade**: foco visível, contraste e alvos interativos confortáveis.

## 2. Cores

### Primárias
- `--color-brand-green-900`: `#1C4722` — identidade, títulos e fundos institucionais.
- `--color-brand-green-500`: `#6AB945` — CTAs e elementos ativos.
- `--color-brand-red-500`: `#EF4037` — destaques e campanhas.

### Apoio
- `--color-brand-green-700`: `#205F30`
- `--color-brand-lime-500`: `#A8CF38`
- `--color-brand-orange-500`: `#F68B1F`

### Neutros
- Fundo: `--color-background`
- Superfície: `--color-surface`
- Texto: `--color-text`
- Texto secundário: `--color-text-muted`
- Borda: `--color-border`

## 3. Tipografia

A família padrão é Montserrat, carregada via `next/font/google`.

| Uso | Peso | Token/classe |
|---|---:|---|
| Display/Hero | 700 | `.ds-display` |
| Título de seção | 700 | `.ds-title` |
| Subtítulo | 600 | `.ds-subtitle` |
| Corpo | 400 | `.ds-body` |
| Legenda | 500 | `.ds-caption` |
| Eyebrow | 700 | `.ds-eyebrow` |

Evitar pesos intermediários inexistentes como 650, 750, 760 ou 850.

## 4. Espaçamento

A escala base está em `styles/tokens.css`:

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px
- `--space-16`: 64px
- `--space-24`: 96px
- `--space-32`: 128px

## 5. Raios e sombras

- Pequeno: `--radius-sm`
- Médio: `--radius-md`
- Grande: `--radius-lg`
- Pílula: `--radius-pill`
- Sombra leve: `--shadow-sm`
- Card: `--shadow-card`
- Destaque: `--shadow-lg`

## 6. Componentes

### Button
Arquivo: `components/ui/Button`

Variantes:
- `primary`: CTA principal verde.
- `secondary`: contorno institucional.
- `light`: uso sobre fundos escuros.

### Badge
Arquivo: `components/ui/Badge`

Variantes:
- `green`
- `red`
- `orange`
- `outline`

### Card
Arquivo: `components/ui/Card`

Variantes:
- `default`
- `soft`
- `elevated`
- `outline`

### SectionHeader
Arquivo: `components/ui/SectionHeader`

Usar para compor eyebrow, título e descrição de seções.

## 7. Página de referência

A rota `/design-system` apresenta cores, tipografia, botões, badges, cards e espaçamentos em uso real.

## 8. Regra de evolução

Antes de criar um novo valor visual, verificar se já existe um token ou variante que resolve o caso. Novos padrões recorrentes devem ser adicionados ao sistema, e não inseridos isoladamente em uma seção.
