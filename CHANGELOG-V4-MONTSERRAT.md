# V4 — Refatoração tipográfica Montserrat

## Preservado
- Hero com slides/carrossel de campanhas no topo da Home.
- Autoplay, pausa, indicadores e links dos slides.
- Estrutura de navegação, seções, páginas internas e painel administrativo.

## Refatorado
- Integração global da família Montserrat via Google Fonts no `app/layout.tsx`.
- Pesos 300, 400, 500, 600, 700 e 800 disponíveis no projeto.
- Escala tipográfica fluida para H1, H2, H3, corpo, legendas e eyebrows.
- Pesos não padronizados (650, 750, 760 e 850) substituídos por pesos reais da família.
- Tracking dos títulos recalibrado para o desenho da Montserrat.
- `globals.css` corrigido: o bloco tipográfico que estava inserido dentro de `body` foi removido.
- Fallbacks exclusivamente sans-serif.
- Renderização e antialiasing tipográfico configurados globalmente.
