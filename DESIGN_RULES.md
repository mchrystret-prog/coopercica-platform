# Regras do sistema visual

A fonte canônica de valores é `styles/tokens.css`. A documentação de uso está em [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), e a referência executável está em `/design-system`.

- Use `Container`, `Section`, `SectionHeader`, `Button`, `Card`, `Badge` e `Icon` antes de criar outro padrão.
- Marca: somente os sete valores exatos do Brandbook. Superfícies, neutralidades e feedback são decisões digitais separadas.
- Primary: branco sobre `#1C4722`; hover `#205F30`. Secondary: contorno e fundo transparente. Ghost: ações discretas. `tone="inverse"` adapta o mesmo componente a fundos escuros.
- Gotham é oficial; Montserrat é fallback temporário, carregado com `next/font`. Não obter Gotham de fontes não licenciadas.
- Escala tipográfica, uppercase, gutters, espaçamento, raios e estados são decisões digitais, não medidas prescritas pelo manual.
- Não transformar, rotacionar, deformar, aplicar transparência ou efeitos à assinatura/símbolo. Indicadores animados devem ser gráficos independentes.
- Execute `node scripts/check-design-system.mjs` além de build, TypeScript, lint e revisão visual. O scanner não substitui testes em navegador.
