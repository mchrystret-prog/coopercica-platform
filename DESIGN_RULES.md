# Coopercica — Design System

## Princípios
1. Brandbook antes de preferência pessoal.
2. Títulos institucionais em caixa alta, peso forte e verde `#1C4722`.
3. Eyebrows em caixa alta e vermelho `#EF4037`.
4. Textos corridos em sentence case, peso regular e cinza.
5. Verde de apoio `#6AB945` indica ação; verde `#205F30` é o hover padrão.

## Componentes base
- `Container`: largura máxima e gutters oficiais.
- `Section`: espaçamento vertical e tons de fundo.
- `SectionHeader`: eyebrow, título com quebras controladas e descrição.
- `Button`: `primary`, `secondary` e `light`.

## Espaçamento
Seções usam `--section-space`; componentes internos devem priorizar a escala definida em `styles/tokens.css`.

## Uso de títulos
Forneça um array ao `SectionHeader` para controlar as quebras:

```tsx
<SectionHeader eyebrow="Coopercica Drogaria" title={["Muito além", "dos medicamentos."]} />
```

## Acessibilidade
- Foco visível obrigatório.
- Imagens precisam de texto alternativo útil.
- Links externos devem usar `noopener noreferrer`.
- Animações devem respeitar `prefers-reduced-motion`.
