# PDFs, vídeos e filtros de lojas

Esta atualização se integra ao CMS e ao Supabase já usados pelo site. O login continua sendo o e-mail e a senha existentes; não há senha administrativa adicional.

- Em Folheteria > Novo folheto, escolha **Enviar folheto PDF** para criar um folheto sem planilha. Informe o nome, as datas, o status e o arquivo.
- Para folhetos ou revistas existentes, entre em Editar e use **PDF para folhear > Salvar PDF**. Essa operação salva o arquivo separadamente dos demais campos.
- O cadastro de revistas continua recebendo capa e PDF. As edições passam a abrir no leitor com paginação, miniaturas, zoom, tela cheia e download.
- Os PDFs têm o mesmo limite do bucket `site-content`: 15 MB. A interface verifica o formato, a ausência de senha e o limite de 300 páginas.
- O envio vai diretamente do navegador ao Supabase, usando a sessão já existente e as políticas atuais de acesso do CMS. Nenhum segredo administrativo é exposto. As funções de vínculo verificam a identidade e a permissão `cms_can_edit()`; usuários de RH ou não aprovados não podem publicar PDFs.
- O bucket continua público, como já era para as revistas. Rascunhos não aparecem nas páginas, mas não tornam privados os arquivos publicados nesse bucket.
- Folhetos publicados exibem o botão **Folhear PDF** na página do folheto; revistas abrem em `/revista/{id}/folhear`. `/folhetos` redireciona ao catálogo já existente em `/folheteria`.
- O menu inclui **Vídeos**, com 12 vídeos da referência e 9 playlists. O CTA destacado passa a **Seja Coopermais**.
- Os filtros de lojas usam os serviços e horários do cadastro atual do CMS. O relógio usa São Paulo e atualiza a cada 30 segundos. Formatos reconhecidos: `Todos os dias • 07h às 22h` e `Seg a Sáb: 07h às 22h | Dom: 07h às 20h`, também com minutos. Horários não reconhecidos não são classificados como abertos; feriados precisam de atualização no cadastro.

## Implantação

Aplique a migração `publication_pdf_reader` antes de disponibilizar o CMS atualizado. Ela adiciona uma coluna e duas funções restritas, preservando os dados existentes. Não exige novas variáveis de ambiente nem chave `service_role` na Vercel.

`npm run prebuild` prepara os arquivos locais de PDF.js e PageFlip em `public/vendor`. Não é necessário hospedar esses recursos em outra CDN.

Verifique `npm run build`, `npm run test:publications` e as suítes existentes de folhetos, analytics e recrutamento antes de publicar. O Next.js foi atualizado para 16.3.8.
