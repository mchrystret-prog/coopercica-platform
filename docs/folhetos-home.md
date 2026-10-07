# Folhetos na Home — capa em destaque

A seção Folheteria Digital mantém o título, descrição e CTA do acervo configurados no CMS. Exibe um folheto vigente em destaque e, quando houver mais de um, um carrossel de miniaturas ao lado da capa. Selecionar uma miniatura atualiza capa, nome, validade e link das ofertas, preservando o título da seção. A capa e “Ver ofertas deste folheto” abrem `/folheteria/[slug]`.

O destaque inicial usa o primeiro item da lista vigente existente. Se o folheto selecionado sair da lista, o destaque volta ao primeiro disponível. Sem folhetos vigentes, a seção não aparece; com apenas um, o carrossel e seus controles ficam ocultos. As miniaturas incluem o destaque atual, sinalizado com borda verde e `aria-pressed`, permitindo voltar a ele.

A composição utiliza Montserrat e tokens do site, capas inteiras na proporção 3:4, sombreamento e movimento suave equivalentes à Revista. Não há mudança nos arquivos de capa, regras de vigência, CMS, API ou banco.

Até 1100 px, o texto fica acima da vitrine, com capa e miniaturas lado a lado. Até 600 px, a vitrine empilha capa e carrossel horizontal. Controles de 44 px, foco visível, setas do teclado no trilho, arraste com mouse e toque nativo continuam disponíveis. Arrastar não seleciona uma miniatura por acidente. A seleção é anunciada por uma região de status. Movimento reduzido desativa a animação e o scroll suave. Falhas de imagem exibem um fallback textual.

Verificação: TypeScript, ESLint do componente e build de produção. A renderização visual e as interações em dispositivos reais ainda precisam ser conferidas no preview; o navegador remoto não acessa o servidor local desta sessão. Não houve publicação em produção.
