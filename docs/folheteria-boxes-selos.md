# Folheteria: boxes e selos

No CMS, abra **Folheteria → Fundos e selos**. Cadastre cada arte como fundo de box ou selo de produto. Use PNG, JPG ou WebP de até 10 MB. Para selos, prefira uma imagem transparente e transcreva a advertência no texto alternativo.

## Planilha

Mantenha a aba `Tabloide Digital` e as colunas atuais do ERP. Acrescente `BOX` e `Selos`:

| Descritivo Marketing   | BOX         | Selos         |
| ---------------------- | ----------- | ------------- |
| Pão francês            | Box padaria |               |
| Bolo                   | Padaria     |               |
| Cerveja                | Bebidas     | +18           |
| Leite                  |             | aleitamento   |
| Produto com dois selos |             | +18; novidade |

Cadastre fundos com os códigos `padaria` e `bebidas` para o exemplo. `Padaria` e `Box padaria` representam o mesmo box. Maiúsculas, acentos e espaços extras são normalizados. Selos adicionais podem usar qualquer código cadastrado. Não há inferência pelo nome do produto: o site respeita as indicações da planilha.

O código `aleitamento` também reconhece `leite`, `amamentação` e `Ministério da Saúde`. As colunas `Selo 18 Top Ofertas / Cooperado`, `Selo +18` e `Advertência leite` aceitam `Sim`, `X`, `1` ou `true`. A coluna antiga de +18 permanece compatível.

## Importação

1. Cadastre os fundos e selos.
2. Crie um folheto e selecione a planilha. O CMS identifica os boxes, os selos e os EANs.
3. Confira o fundo de cada box. Você pode escolher outra arte cadastrada somente para esse folheto.
4. Importe. Um box ou selo sem arquivo cadastrado bloqueia a importação e informa a linha da planilha.

Cada box aparece apenas quando tem produtos. Os boxes seguem a ordem da primeira aparição na planilha e os produtos mantêm sua ordem dentro de cada box. Itens sem `BOX` ficam na grade comum.

As URLs das artes são guardadas junto de cada produto. Substituir um arquivo na biblioteca não muda folhetos importados por este fluxo. Os arquivos anteriores permanecem disponíveis. Folhetos anteriores sem essa informação usam a biblioteca atual quando houver uma indicação de box ou selo, preservando os avisos de texto como alternativa.

## Carrossel e dimensões do fundo

Produtos com `BOX` aparecem em uma única faixa horizontal dentro da seção. O fundo permanece parado enquanto os produtos deslizam. Use as setas, a barra de rolagem, o deslize no celular ou as teclas esquerda/direita (Home/End para início/fim) com a lista focada. Não há reprodução automática. Até quatro produtos ficam visíveis no desktop, três ou dois no tablet e um com parte do próximo no celular. Com poucos produtos, as setas ficam desabilitadas quando não há mais conteúdo naquela direção.

Referência para criar a arte:

| Área                    | Desktop (acima de 600 px)        | Celular (até 600 px)             |
| ----------------------- | -------------------------------- | -------------------------------- |
| Card dentro do box      | Altura mínima de 560 px          | Altura mínima de 440 px          |
| Seção inteira do box    | Altura mínima de 720 px          | Altura mínima de 600 px          |
| Espaço interno da seção | 32 px; 24 px em telas até 760 px | 16 px vertical, 10 px horizontal |

Recomendação: fundo **1280 × 720 px**, sem título nem produtos embutidos. O site insere o título e os cards. A imagem preenche a seção (`cover`) com recorte central conforme a largura da tela; evite textos na arte e mantenha elementos importantes longe das bordas. No celular o recorte horizontal é maior. As dimensões são mínimas, não alturas fixas: descrições longas, múltiplos selos, imagens de selo altas e ampliação de texto podem aumentar a altura para preservar todo o conteúdo. Todos os cards do mesmo carrossel acompanham a altura do maior card.

Na página publicada medida antes da mudança, os cards comuns tinham aproximadamente 501 a 505 px no desktop (1363 px de largura da janela). A grade comum continua com altura definida pelo conteúdo.

## Implementação e validação

A biblioteca usa uma chave por arquivo em `site_settings`, gravada pelo RPC existente `cms_save_site_customization`. Uploads usam o bucket existente `leaflet-assets`. A apresentação de cada produto fica em `erp_payload._leaflet_presentation` e é persistida pelo RPC existente `import_digital_leaflet`. Não há migrations, mudanças de RLS, autenticação ou buckets.

Execute `npm run test:leaflets` para verificar agrupamento, selos, campos legados, seleção por folheto, preservação das artes e validações de entrada. Execute também `npx tsc --noEmit` e `npm run build`.

Validação do carrossel: testes de importação e agrupamento, TypeScript, build de produção, renderização da página com nove produtos (dois boxes e uma grade comum) e verificação dos controles com uma superfície de rolagem simulada. Foram conferidos ordem, preços, fundos, selos, limites das setas, teclado, movimento reduzido e limpeza dos listeners. A altura anterior dos cards foi medida no navegador na página publicada. A validação visual do carrossel com um folheto contendo boxes ainda precisa ser realizada no preview antes do merge.
