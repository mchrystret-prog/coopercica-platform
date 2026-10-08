# Ofertas e gestos da Home

Delivery e Drogaria apresentam texto/imagem, carrossel de ofertas e CTA nessa ordem, em todos os tamanhos de tela. O CTA continua disponível se a integração estiver desativada, vazia ou indisponível. Links e rótulos continuam vindo da personalização existente.

HomeOffers e a folheteria reutilizam ProductOfferCard. O preço principal agora ocupa a área superior e o regular fica em uma faixa separada abaixo, tanto em ofertas comuns como Coopermais. O selo Coopermais e o fundo verde-lima continuam exclusivos dos produtos elegíveis. O card usa sua própria largura para dimensionar o preço; cards muito estreitos colocam selo e valor em linhas distintas. Descrição, complemento, unidade e preço regular podem quebrar linha sem colidir. Badges simultâneos têm um grupo com espaçamento, em vez de sobreposição.

Na pilha de revistas, o início do gesto aceita toque sem depender do código de botão do mouse. A saída do ponteiro antes do arraste só encerra gestos de mouse. Eventos de perda de captura originados numa capa filha não cancelam a captura do contêiner. Capas, links e imagens permitem scroll vertical e zoom, reservando o gesto horizontal para trocar a edição. Cliques continuam abrindo a principal ou destacando outra capa; após arrastar, o clique é suprimido.

Os trilhos de vídeos e playlists agora aceitam clique e arraste com mouse quando há overflow, desativando o snap durante o gesto. Captura do ponteiro mantém o arraste fora do trilho; soltar/cancelar encerra a interação. Arrastar não seleciona um vídeo nem abre a playlist. Toque conserva a rolagem nativa; setas e teclado continuam disponíveis, com foco visível e movimento reduzido respeitado.

## Verificação

TypeScript e ESLint dos componentes modificados passaram, com um aviso preexistente de img no card de produto. Os oito testes de ofertas passaram, incluindo a distinção entre preço comum e Coopermais, dados da API e previews dos dois canais. Build de produção verificado antes do commit. Nenhuma configuração de integração ou dado de produção foi alterado.

O fluxo é Home → oferta normalizada da API ou preview → card compartilhado; cliques levam ao destino do produto quando fornecido. As alterações são de apresentação e eventos locais, sem modificar esse contrato. A conferência visual e os gestos em Safari/Chrome permanecem pendentes: o navegador remoto não alcança o servidor local desta sessão. Os checks de código não comprovam o funcionamento dos gestos num dispositivo real.
