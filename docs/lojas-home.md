# Nossas Lojas na Home

A Home apresenta uma faixa com chamada institucional e a foto da fachada ao pôr do sol. Logo abaixo, as nove lojas ativas ficam em uma única linha horizontal, em vez de três linhas de cards. No desktop aparecem três cards; no tablet e no mobile parte do próximo card indica que há mais unidades.

O carrossel oferece arraste com mouse, rolagem nativa com o dedo, botões de 44 px e setas do teclado quando o trilho está focado. Arrastar não abre links por acidente. Os filtros de cidade, abertas agora e drogaria continuam combináveis; mudar o conjunto de resultados retorna o trilho ao início. Os cards exibem Como chegar e o telefone clicável para ligar. O título da loja continua levando aos detalhes da unidade. A página /lojas conserva o diretório completo, com horários e telefones.

## Foto no CMS

Em Personalização, abra a seção Nossas Lojas. O campo Imagem da seção substitui a foto padrão; Descrição da foto de Nossas Lojas define o texto alternativo. Use Salvar alterações após editar. Sugestão: 1600 × 1000 px, JPG, PNG ou WebP, até 15 MB, com a fachada na região central. No mobile a foto aparece acima da chamada. A imagem padrão está em public/images/stores/coopercica-sunset.webp, comprimida a partir do arquivo fornecido.

## Dados e validação

O serviço Drogaria foi removido da Loja 1 no fallback e no cadastro site_stores. A leitura posterior confirmou has_pharmacy=false. As outras lojas mantêm seus próprios serviços; o filtro não tem exceção codificada por número de loja. Nenhum schema, permissão ou política foi alterado.

TypeScript, ESLint dos arquivos alterados, oito testes de diretório/horários e build de produção passaram. O ESLint informa três avisos já existentes de imagens no editor do CMS. A conferência visual no navegador e a troca de imagem com sessão autenticada ainda precisam ser realizadas no preview: o navegador remoto não alcança o servidor local desta sessão.
