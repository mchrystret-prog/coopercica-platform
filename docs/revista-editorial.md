# Revista na Home — vitrine editorial

A Home destaca uma edição com capa à esquerda, título editorial, resumo e até oito destaques à direita. A capa recebe um movimento leve no hover/foco. Todas as edições publicadas ficam no trilho abaixo: escolher uma miniatura atualiza a capa e seu conteúdo; clicar na capa ou em “Folhear esta edição” abre o leitor existente. O trilho suporta arraste com mouse, toque e controles de teclado/setas quando houver overflow.

## Cadastro no CMS

- **Revistas**: cadastro da publicação, capa, data e PDF.
- **Revistas → Editar resumo e destaques**: atalho que abre diretamente a aba editorial de Personalização.
- **Personalização → Revista**: edição principal (mais recente automaticamente ou escolha manual), edição para editar, título editorial, resumo e destaques com categoria/assunto.
- **Personalização → Seções da Home → Revista**: exibição da seção, chamada superior, descrição geral de fallback e texto do botão do acervo.

O resumo deve descrever a edição real. Se não houver texto específico, a seção usa a descrição geral; nenhum assunto é inventado automaticamente. Destaques sem conteúdo ficam ocultos. Uma edição principal retirada do ar dá lugar à mais recente publicada.

O resumo e a lista de assuntos formam o bloco **Nessa edição**, identificado por um subtítulo próprio ao lado da capa. Trocar a miniatura atualiza esse bloco junto com a edição escolhida.

O conteúdo é armazenado por ID da revista em `site_sections.content.editionDetails` (JSON serializado) e `featuredId`, usando o fluxo de personalização já existente. Não requer novas colunas, tabelas, migrations, permissões ou buckets. Não foram alterados dados em produção.

## Aparência e acessibilidade

Montserrat, cores e tokens compartilhados do site, títulos principais em caixa alta, ícones em linha e sem ornamento zebrado. A animação fica restrita ao hover de mouse/foco e é desativada com movimento reduzido. O acervo usa `aria-pressed`, foco visível e anúncio da edição escolhida. Arraste não abre nem seleciona uma edição por acidente; clique de teclado continua permitido. Capa que falha usa fallback textual.

Até 800 px, a composição vira uma coluna: capa, texto, ações e acervo. Até 480 px, categorias e ações podem empilhar. As capas são contidas, sem cortar textos da arte.

## Verificação desta entrega

- TypeScript: aprovado.
- ESLint dos arquivos modificados: sem erros; avisos de imagens HTML preexistentes em SiteCustomization.
- Build de produção: aprovado.
- Parser editorial: leitura por ID, configuração inválida e limite de destaques verificados.
- Renderização e interação de navegador: pendentes. O navegador remoto não acessou o servidor local (`ERR_CONNECTION_REFUSED`). Não houve screenshot do novo layout nem aprovação visual mobile.
- Salvamento autenticado no CMS: não executado nesta sessão; deve ser conferido no preview com usuário autorizado.

Os avisos preexistentes de tentativa de geração estática de páginas com conteúdo dinâmico continuam no build, que terminou com sucesso.
