# Refatoração — Design System

## Entregue nesta versão
- Tokens institucionais centralizados em `styles/tokens.css`.
- Tipografia, layout e utilitários globais separados.
- Componentes reutilizáveis `Button`, `Container`, `Section` e `SectionHeader`.
- Refatoração visual e estrutural de Lojas, Drogaria, Delivery e Revista.
- CTA do cabeçalho ajustado para o verde de apoio institucional.
- Configuração ESLint 9 adicionada.
- Fonte remota removida do build para evitar dependência de rede; Montserrat continua como primeira opção local, com Arial como fallback.
- `DESIGN_RULES.md` com as regras para evolução do projeto.

## Validação
- `npm run build`: aprovado.
- `npm run lint`: aprovado sem erros; permanecem cinco avisos de otimização de imagens nos componentes animados existentes.
