# Revista na Home — vitrine editorial

A Home destaca uma edição com capa à esquerda, título editorial, resumo e até oito destaques à direita. A capa recebe um movimento leve no hover/foco. Todas as edições publicadas ficam no trilho abaixo: escolher uma miniatura atualiza a capa e seu conteúdo; clicar na capa ou em “Folhear esta edição” abre o leitor existente. O trilho suporta arraste com mouse, toque e controles de teclado/setas quando houver overflow.

A capa principal agora aparece sobre até quatro capas próximas, deslocadas e rotacionadas como revistas espalhadas. Arrastar horizontalmente mais de 45 px com mouse ou dedo troca a edição de forma circular; arrastes curtos retornam ao lugar e nunca abrem o PDF. O gesto vertical mantém o scroll da página. Clicar numa capa atrás a traz para a frente; clicar na principal abre o leitor. Botões de 44 px oferecem a mesma troca sem gesto. O acervo inferior continua disponível. Com uma única edição, os controles da pilha ficam ocultos. O conjunto conserva a mesma composição no mobile e respeita movimento reduzido.

## Cadastro no CMS

- **Revistas**: cadastro da publicação, capa, data e PDF.
- **Revistas → Editar resumo e destaques**: atalho que abre diretamente a aba editorial de Personalização.
- **Personalização → Revista**: edição principal (mais recente automaticamente ou escolha manual), edição para editar, título editorial, resumo e destaques com categoria/assunto.
- **Personalização → Seções da Home → Revista**: exibição da seção, chamada superior, descrição geral de fallback e texto do botão do acervo.

O resumo deve descrever a edição real. Se não houver texto específico, a seção usa a descrição geral; nenhum assunto é inventado automaticamente. Destaques sem conteúdo ficam ocultos. Uma edição principal retirada do ar dá lugar à mais recente publicada.

O resumo e a lista de assuntos formam o bloco **Nessa edição**, identificado por um subtítulo próprio ao lado da capa. Trocar a miniatura atualiza esse bloco junto com a edição escolhida.

O conteúdo é armazenado por ID da revista em `site_sections.content.editionDetails` (JSON serializado) e `featuredId`, usando o fluxo de personalização já existente. Não requer novas colunas, tabelas, migrations, permissões ou buckets. Não foram alterados dados em produção.

## Leitura automática do PDF

No cadastro **Revistas → Nova edição**, selecionar o PDF inicia a leitura local automaticamente, antes do upload. O resultado preenche campos editáveis de resumo e até oito destaques no próprio formulário. O progresso, o total de páginas lidas e as páginas de origem aparecem para revisão. O botão de publicação fica indisponível durante a leitura; cancelar libera o preenchimento manual. Trocar o arquivo cancela a leitura anterior e limpa o rascunho para evitar associar o resumo ao PDF errado. É possível reler o arquivo, substituindo a sugestão.

Ao publicar, o CMS cadastra a revista e salva o rascunho editorial revisado pelo ID recém-criado. O salvamento reutiliza o RPC existente com configurações vazias e apenas a seção Revista, preservando os campos dessa seção e as outras edições. Se esse segundo passo falhar, o ID já criado permanece no formulário: **Salvar Nessa edição** tenta apenas o resumo, sem reenviar os arquivos nem duplicar a revista. Nenhum schema, RLS ou bucket foi alterado.

Para revistas já cadastradas, a leitura continua acessível em **Personalização → Revista** e pelo atalho **Editar resumo e destaques** do menu Revistas. Publicar uma revista sem resumo continua permitido; nesse caso a Home usa a chamada geral.

Em **Personalização → Revista**, selecione a edição e clique em **Ler PDF e sugerir conteúdo**. O CMS lê o PDF cadastrado, reconstrói as linhas e procura nomes de quadros e os títulos próximos. A sugestão mostra o resumo, até oito destaques e a página de origem de cada título. Confira essas páginas e clique em **Aplicar sugestão ao resumo e destaques**. Isso substitui esses dois campos da edição selecionada, preservando o título editorial. Ajuste os textos e use **Salvar alterações** para publicar. Descartar ou cancelar não altera os campos existentes.

A leitura acontece no navegador com PDF.js carregado sob demanda, sem serviço externo de IA, chave de API ou alteração no banco. O botão só fica disponível para PDFs válidos cadastrados em Revistas. Não há geração automática na Home nem em cada visita ao leitor.

O reconhecimento inicial procura os quadros Dicas da nutri, Deu água na boca, Do momento, Fique bem, É dia, Receitas, Saúde e bem-estar, Bem-estar, Sustentabilidade, Cooperar e Nossa gente. Usa linhas do índice ou títulos destacados próximos, separa colunas e elimina repetições. É uma heurística, não uma interpretação completa da revista: mudanças de diagramação, quadros com outros nomes e textos fragmentados podem exigir preenchimento manual. Todo resultado precisa de revisão.

Limites: 15 MB, primeiras 60 páginas e dois minutos por tentativa. A sugestão informa quantas páginas foram lidas; PDFs protegidos por senha recebem mensagem específica. PDFs escaneados, imagem ou com letras convertidas em desenho precisam de OCR, que não está incluído nesta versão. A ausência de texto ou de quadros reconhecidos retorna orientação para preenchimento manual, sem inventar assuntos.

Testes do reconhecimento: quatro cenários aprovados, incluindo PDF gerado e lido pelo motor real PDF.js, título em duas linhas, colunas independentes, índice com páginas, deduplicação, limites e falhas sem texto/quadros. Não foi possível obter uma revista publicada para validar a heurística com a diagramação real. A interação autenticada do CMS ainda deve ser validada no preview; nenhum resumo foi gravado em produção nesta sessão.

O teste de persistência simulado verifica que o novo resumo preserva outra edição e a chamada da seção, envia somente Revista ao RPC e informa falha quando o RPC retorna falso. TypeScript, ESLint e build de produção foram verificados. O efeito de pilha e o novo formulário ainda precisam de conferência visual e do fluxo autenticado no preview; não foi possível acessar o servidor local com o navegador remoto.

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
