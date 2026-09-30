# Fase B — Design System Coopercica

Implementação local em `phase-b-design-system`, baseada na auditoria de 30/09/2026 e nos achados 3, 4, 5, 15, 16 e 17. Sem push ou deploy. Nenhuma alteração em banco, RLS, autenticação, permissões, migrations, Storage ou dados de produção. Copy institucional e arquitetura de conteúdo preservadas.

## Inventário e fonte única

Antes: tokens e CSS de tipografia/layout duplicados na raiz e em `styles/`, CSS público e administrativo misturados em `app/globals.css`, Button e SectionHeading concorrentes, módulos Brand históricos sem consumidores e variáveis não declaradas em cards/badges.

Agora: `styles/tokens.css` fornece os valores; `styles/typography.css`, `styles/layout.css` e `styles/components.css` fornecem a implementação compartilhada; `app/globals.css` importa o sistema e contém reset. CSS Modules continuam responsáveis pela composição específica. `styles/admin.css` isola estilos existentes do CMS. Aliases antigos referenciam tokens canônicos para compatibilidade, sem outra paleta. Imports/referências foram conferidos antes das remoções.

## Tokens consolidados

As sete cores oficiais são exatamente #1C4722, #EF4037, #205F30, #6AB945, #A8CF38, #EF5F4B e #F68B1F. Neutralidades, superfícies, texto, bordas, feedback e estados possuem grupos semânticos separados. Verdes concorrentes e hexadecimais dos estilos públicos foram substituídos por tokens.

Família, escala tipográfica, pesos, entrelinha e tracking; spacing de 4 a 128 px; gutter responsivo; container de 1280 px; padding de seção e card; raios por função; sombras soft/card/overlay; duração de interação e estados de controle estão centralizados. Tabela completa em `DESIGN_SYSTEM.md`.

## Componentes e CTAs

Button é a implementação canônica para link e ação, com primary, secondary e ghost, inclusive tom inverso. Primary: branco sobre #1C4722 (10,64:1), hover #205F30 (7,66:1). Secondary usa contorno e texto institucional. Altura mínima 48 px, gap, padding, radius, hover, active, focus-visible, disabled e ícones padronizados. Links desabilitados ficam sem href e fora da tabulação. Não se usa branco sobre #6AB945 nos textos dos CTAs.

Cabeçalho, Revista, Folheteria, História e retorno de cidades usam o Button real. SectionHeader unifica eyebrow → H2 → texto, preservando composições stack/grid. Card e Badge possuem tokens válidos e são utilizados na folheteria. Icon fornece SVGs de traço; ícones outline funcionais de lojas foram preservados. Hero ganhou CSS Module em lugar da apresentação inline. ProductOfferCard usa os componentes reais e preço institucional com contraste.

Removidos após conferência de referências: SectionHeading e seu CSS, Button.module.css substituído pela implementação canônica, tokens/typography/layout duplicados da raiz, HeroBrand/HomeBrand/StoresBrand/MagazineBrand históricos e Coopermais não utilizado. Nenhum componente renderizado em produção foi retirado sem substituição.

## Tipografia, containers e ritmo

A variável Montserrat de next/font agora está aplicada ao html efetivamente retornado e é consumida pela família canônica. Gotham licenciada não está disponível; nenhum arquivo externo foi obtido. Display, H1, H2, H3, Body Large, Body, Small e Eyebrow são demonstrados em /design-system.

Container e alias shell compartilham o mesmo seletor. Gutters: clamp(20px,100vw/24,80px), limite de 1280 px e espaçamento de seção responsivo. A divisão por 24 é referência horizontal de composição, sem cálculo pela altura total da página. História mantém o carrossel amplo; AppShowcase mantém sua composição fixada e escala compacta móvel documentada. Removido offset redundante na página de folheteria. O menu compacto passa a ser usado até 1100 px para evitar quebra concorrente dos links.

## Brandbook e decisões digitais

Corrigidos: paleta concorrente, efeitos/rotação do símbolo na História, contraste dos CTAs, aplicação efetiva da fonte fallback e possibilidade de redefinir cores globais pelo CMS. O marcador animado da História é uma forma independente; não se redesenhou a marca.

São decisões digitais, NÃO prescrições do Brandbook: tamanhos da escala, container 1280, gutters mínimos/máximos, spacing, raios, sombras, altura de controle 48, breakpoints, cores funcionais e estados. /design-system demonstra componentes de produção, incluindo links, cards, ícones, container, spacing e estados.

## CMS e pendências

Os quatro campos de cores foram desabilitados apenas na interface, preservando valores existentes e contrato de salvamento. RootLayout não injeta mais essas cores. Backend ainda aceita os campos; sua validação exige etapa posterior. Logos e imagens enviados pelo CMS ainda podem contrariar a identidade. Não foram testados fluxos administrativos autenticados nem alteradas suas funções.

Gotham oficial permanece pendente. Imagens remotas da folheteria não tiveram validação completa: acesso bloqueado no ambiente de revisão. URLs/arquivos de Storage não foram modificados. Links/destinos e comportamentos funcionais preexistentes fora da consistência visual permanecem fora desta fase.

## Validação

- npm run build: aprovado, código de saída 0. Logs de Dynamic server usage de políticas são tratados pelo código existente; rota permanece dinâmica.
- npx tsc --noEmit: aprovado, código de saída 0.
- npm run lint: reprovado, 11 erros e 16 avisos preexistentes; baseline da auditoria tinha 11 erros e 17 avisos. Erros em AdminShell, CmsUsers, ContentList, LeafletMissingImages, PolicyAdmin, Magazine e lib/content (set-state-in-effect, purity e any). Não foram alterados comportamentos de CMS para corrigir esses erros.
- node scripts/check-design-system.mjs: aprovado, 85 arquivos, nenhuma variável CSS ausente ou hexadecimal literal no CSS público. CSS administrativo fica fora da restrição de cores desta fase.
- git diff --check: aprovado. Sem alteração de dependências.
- Primeira revisão: nove rotas em 1440/375 px. Segunda revisão: mesmas nove em 1280/430 px, além de Home em 320/768/1024/1920 px, modal de lojas, troca de revista, História, estados do botão e navegação. Nenhum overflow horizontal encontrado; fonte aplicada e CTAs de 48 px confirmados.
- Rotas: /, /quem-somos, /lojas, /delivery, /drogaria, /revista, /folheteria, /politicas, /design-system.
- Após bloqueio de rede, segunda revisão utilizou snapshot somente leitura de conteúdo público via conector Supabase e fixture temporária fora do repositório. Ela não integra a aplicação, não modifica dados e não simula a disponibilidade das imagens remotas. Essa limitação impede afirmar validação integral dos assets de produção.

Validação interativa final: modal com CTA de 48 px, Escape fecha o modal, revista troca de edição, História avança após pausa, foco visível, hover/active com cores canônicas e link interno chega a /delivery. Revisão dos arquivos TSX modificados encontrou apenas o erro preexistente de effect em Magazine e sete avisos existentes de img.

## Arquivos alterados

Lista gerada do diff da implementação (M alterado, D removido):

```text
M	DESIGN_RULES.md
M	DESIGN_SYSTEM.md
M	app/design-system/page.module.css
M	app/design-system/page.tsx
M	app/folheteria/[slug]/page.module.css
M	app/folheteria/page.tsx
M	app/globals.css
M	app/layout.tsx
M	app/politicas/page.module.css
M	components/admin/SiteCustomization.tsx
M	components/layout/Footer.module.css
M	components/layout/Header.module.css
M	components/layout/Header.tsx
M	components/leaflets/ProductOfferCard.module.css
M	components/leaflets/ProductOfferCard.tsx
M	components/sections/AppShowcase.module.css
D	components/sections/Coopermais.tsx
M	components/sections/Delivery.module.css
M	components/sections/Hero.tsx
D	components/sections/HeroBrand.module.css
M	components/sections/History.module.css
M	components/sections/History.tsx
D	components/sections/HomeBrand.module.css
M	components/sections/Leaflets.module.css
M	components/sections/Leaflets.tsx
M	components/sections/Magazine.module.css
M	components/sections/Magazine.tsx
D	components/sections/MagazineBrand.module.css
M	components/sections/Pharmacy.module.css
M	components/sections/Stores.module.css
M	components/sections/Stores.tsx
D	components/sections/StoresBrand.module.css
M	components/ui/Badge/Badge.module.css
D	components/ui/Button/Button.module.css
M	components/ui/Button/Button.tsx
M	components/ui/Card/Card.module.css
M	components/ui/SectionHeader/SectionHeader.module.css
M	components/ui/SectionHeader/SectionHeader.tsx
D	components/ui/SectionHeading.module.css
D	components/ui/SectionHeading.tsx
D	layout.css
M	styles/components.css
M	styles/layout.css
M	styles/tokens.css
M	styles/typography.css
D	tokens.css
D	typography.css
```

Novos arquivos:

```text
components/sections/Hero.module.css
components/ui/Icon.tsx
scripts/check-design-system.mjs
styles/admin.css
docs/FASE_B.md
```
