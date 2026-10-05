# Folheteria: boxes e selos

No CMS, abra **Folheteria → Fundos e selos**. Cadastre cada arte como fundo de box ou selo de produto. Use PNG, JPG ou WebP de até 10 MB. Para selos, prefira uma imagem transparente e transcreva a advertência no texto alternativo.

## Planilha

Mantenha a aba `Tabloide Digital` e as colunas atuais do ERP. Acrescente `BOX` e `Selos`:

| Descritivo Marketing | BOX | Selos |
| --- | --- | --- |
| Pão francês | Box padaria | |
| Bolo | Padaria | |
| Cerveja | Bebidas | +18 |
| Leite | | aleitamento |
| Produto com dois selos | | +18; novidade |

Cadastre fundos com os códigos `padaria` e `bebidas` para o exemplo. `Padaria` e `Box padaria` representam o mesmo box. Maiúsculas, acentos e espaços extras são normalizados. Selos adicionais podem usar qualquer código cadastrado. Não há inferência pelo nome do produto: o site respeita as indicações da planilha.

O código `aleitamento` também reconhece `leite`, `amamentação` e `Ministério da Saúde`. As colunas `Selo 18 Top Ofertas / Cooperado`, `Selo +18` e `Advertência leite` aceitam `Sim`, `X`, `1` ou `true`. A coluna antiga de +18 permanece compatível.

## Importação

1. Cadastre os fundos e selos.
2. Crie um folheto e selecione a planilha. O CMS identifica os boxes, os selos e os EANs.
3. Confira o fundo de cada box. Você pode escolher outra arte cadastrada somente para esse folheto.
4. Importe. Um box ou selo sem arquivo cadastrado bloqueia a importação e informa a linha da planilha.

Cada box aparece apenas quando tem produtos. Os boxes seguem a ordem da primeira aparição na planilha e os produtos mantêm sua ordem dentro de cada box. Itens sem `BOX` ficam na grade comum.

As URLs das artes são guardadas junto de cada produto. Substituir um arquivo na biblioteca não muda folhetos importados por este fluxo. Os arquivos anteriores permanecem disponíveis. Folhetos anteriores sem essa informação usam a biblioteca atual quando houver uma indicação de box ou selo, preservando os avisos de texto como alternativa.

## Implementação e validação

A biblioteca usa uma chave por arquivo em `site_settings`, gravada pelo RPC existente `cms_save_site_customization`. Uploads usam o bucket existente `leaflet-assets`. A apresentação de cada produto fica em `erp_payload._leaflet_presentation` e é persistida pelo RPC existente `import_digital_leaflet`. Não há migrations, mudanças de RLS, autenticação ou buckets.

Execute `npm run test:leaflets` para verificar agrupamento, selos, campos legados, seleção por folheto, preservação das artes e validações de entrada. Execute também `npx tsc --noEmit` e `npm run build`.

Validação desta implementação: testes de lógica, TypeScript, build de produção e renderização da página com uma planilha XLSX de teste. A consulta pública da biblioteca foi verificada no projeto conectado. O teste visual e os uploads autenticados pelo navegador ainda precisam ser realizados: o ambiente de execução bloqueou a inicialização do Chrome.
