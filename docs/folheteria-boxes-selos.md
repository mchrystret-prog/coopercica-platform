# Folheteria: boxes e selos

No CMS, abra **Folheteria → Fundos e selos**. Cadastre cada arte como fundo de box ou selo de produto. Use PNG, JPG ou WebP de até 10 MB. Para selos, prefira uma imagem transparente e transcreva a advertência no texto alternativo.

## Planilha

Mantenha a aba `Tabloide Digital` e as colunas atuais do ERP. Preencha a coluna `BOX` já existente na exportação; adicione-a somente se estiver ausente. Para códigos adicionais de advertência, acrescente `Selos`:

| Descritivo Marketing   | BOX         | Selos         |
| ---------------------- | ----------- | ------------- |
| Pão francês            | Box padaria |               |
| Bolo                   | Padaria     |               |
| Cerveja                | Bebidas     | +18           |
| Leite                  |             | aleitamento   |
| Produto com dois selos |             | +18; novidade |

Cadastre fundos com os códigos `padaria` e `bebidas` para o exemplo. `Padaria` e `Box padaria` representam o mesmo box. Maiúsculas, acentos e espaços extras são normalizados. Selos adicionais podem usar qualquer código cadastrado. Não há inferência pelo nome do produto: o site respeita as indicações da planilha.

Se o arquivo contiver `BOX` e `Box`, o CMS consolida as indicações por produto: usa o valor preenchido ou aceita valores equivalentes, como `Box padaria` e `Padaria`. Se os valores indicarem boxes diferentes, bloqueia a leitura e informa a linha. As outras colunas repetidas continuam bloqueadas, e o erro informa seus nomes.

O código `aleitamento` também reconhece `leite`, `amamentação` e `Ministério da Saúde`. As colunas `Selo 18 Top Ofertas / Cooperado`, `Selo +18` e `Advertência leite` aceitam `Sim`, `X`, `1` ou `true`; para +18, o valor `18` também é reconhecido. A coluna antiga de +18 permanece compatível.

## Importação

1. Cadastre os fundos e selos.
2. Crie um folheto e selecione a planilha. O CMS identifica os boxes, os selos e os EANs.
3. Confira o fundo de cada box. Você pode escolher outra arte cadastrada somente para esse folheto.
4. Importe. Um box ou selo sem arquivo cadastrado bloqueia a importação e informa a linha da planilha.

Cada box aparece apenas quando tem produtos. Os boxes seguem a ordem da primeira aparição na planilha e os produtos mantêm sua ordem dentro de cada box. Itens sem `BOX` ficam na grade comum.

As URLs das artes são guardadas junto de cada produto. Substituir um arquivo na biblioteca não muda folhetos importados por este fluxo. Os arquivos anteriores permanecem disponíveis. Folhetos anteriores sem essa informação usam a biblioteca atual quando houver uma indicação de box ou selo, preservando os avisos de texto como alternativa.

## Carrossel e dimensões do fundo

O fundo de cada box ocupa toda a largura da tela, de ponta a ponta. Título, selo da seção e produtos ficam em um container interno alinhado ao conteúdo do site. Produtos com `BOX` aparecem em uma única faixa horizontal. Quando há fundo cadastrado, seu primeiro quarto ocupa uma coluna fixa à esquerda, com a mesma largura de um card. Essa coluna fica fora da lista de produtos e não se move ao usar as setas. No desktop há um espaço para o selo e até três produtos visíveis; nos tablets há um espaço para o selo e dois ou um produto. Até 600 px, o selo aparece acima da faixa, e o carrossel mantém um produto e parte do próximo visíveis.

Use as setas, o clique e arraste pelo mouse, a barra de rolagem, o deslize no celular ou as teclas esquerda/direita (Home/End para início/fim) com a lista focada. Não há reprodução automática. As setas ficam desabilitadas ao alcançar os limites da lista. A coluna da arte não entra na contagem nem no cálculo do avanço. Boxes sem fundo continuam usando toda a largura disponível para os produtos.

Para fundos como os exemplos de Açougue e Padaria, use **1920 × 505 px**. Coloque o selo inteiro nos primeiros **480 px** (25% da largura), com margem, e mantenha a cor uniforme no restante da imagem. O site exibe esse primeiro quarto na coluna da arte, preservando a proporção do selo. Os 75% da direita do arquivo preenchem o fundo de ponta a ponta, acompanhando a altura do conteúdo. Essa região deve ter cor uniforme; o selo à esquerda mantém suas proporções na coluna fixa e não é repetido no fundo, inclusive em telas maiores que 1920 px. O arquivo original é usado inteiro, sem alteração da imagem ou upload de recortes.

| Área            | Desktop (acima de 600 px)           | Celular (até 600 px)                                             |
| --------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Card de produto | Altura mínima de 560 px             | Altura mínima de 440 px                                          |
| Selo do box     | Uma coluna com a largura de um card | Acima dos produtos, com área de 200 a 280 px de altura           |
| Seção inteira   | Altura mínima de 720 px             | Altura mínima de 600 px, crescendo para acomodar arte e produtos |

A altura de 505 px é a altura do arquivo enviado, não a altura final da seção. Descrições longas, múltiplos selos, imagens de advertência altas e ampliação de texto podem aumentar a altura para preservar todo o conteúdo. Todos os cards do mesmo carrossel acompanham a altura do maior card.

Na página publicada medida antes da mudança, os cards comuns tinham aproximadamente 501 a 505 px no desktop (1363 px de largura da janela). A grade comum continua com altura definida pelo conteúdo.

O selo de produto `+18` aparece na área da foto, à direita e junto ao topo do produto. Ele não é repetido entre os selos abaixo do preço. A advertência de leite e os demais selos continuam nessa área inferior, com o texto alternativo e os avisos de texto preservados.

## Implementação e validação

A biblioteca usa uma chave por arquivo em `site_settings`, gravada pelo RPC existente `cms_save_site_customization`. Uploads usam o bucket existente `leaflet-assets`. A apresentação de cada produto fica em `erp_payload._leaflet_presentation` e é persistida pelo RPC existente `import_digital_leaflet`. Não há migrations, mudanças de RLS, autenticação ou buckets.

Execute `npm run test:leaflets` para verificar agrupamento, selos, campos legados, seleção por folheto, preservação das artes e validações de entrada. Execute também `npx tsc --noEmit` e `npm run build`.

Validação do carrossel: testes de importação e agrupamento, TypeScript, build de produção, renderização da página com nove produtos (dois boxes e uma grade comum) e verificação dos controles com uma superfície de rolagem simulada. Foram conferidos ordem, preços, fundos, selos, limites das setas, teclado, movimento reduzido e limpeza dos listeners. A altura anterior dos cards foi medida no navegador na página publicada. Para a coluna fixa, foram conferidos também os dois fundos de 1920 × 505 px, a renderização de duas artes fora das listas, a equivalência entre largura da coluna e do card e a região direita usada para preencher o fundo. A abertura da fixture local no navegador foi bloqueada pela política de URLs do navegador remoto. A validação visual do carrossel com um folheto contendo boxes permanece pendente no preview antes do merge.

Validação dos ajustes de largura, arraste e +18: 11 testes de importação, TypeScript, ESLint dos TSX alterados (sem erros; avisos preexistentes de imagens) e build de produção aprovados. A renderização confirmou seções diretamente em `main`, conteúdo em containers internos, +18 junto à foto e os demais selos abaixo do preço. Os handlers de arraste foram exercitados com uma superfície de rolagem simulada, incluindo limiar, captura, deslocamento, alinhamento ao soltar, cancelamento, clique após arraste, toque nativo e bloqueio do arraste de imagens. A conferência visual no navegador permanece pendente.
