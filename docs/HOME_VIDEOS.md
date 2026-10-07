# Vídeos na página inicial

A seção aparece após as revistas. Personalização → Vídeos controla a visibilidade, o título, o destaque, a ordem dos vídeos e as playlists. Use links HTTPS do YouTube ou IDs. Nas playlists, um vídeo pode fornecer a imagem de capa.

O modo manual começa com o catálogo existente do projeto. As listas ficam em `site_settings.home_videos` pelo RPC de personalização existente. Não exige alterações de banco, Storage ou permissões.

Para o modo API, ative YouTube Data API v3 no Google Cloud e cadastre `YOUTUBE_API_KEY` nas variáveis do servidor do projeto na Vercel, sem prefixo NEXT_PUBLIC. Restrinja a chave à YouTube Data API. Faça um novo deployment após configurar a variável. No CMS, escolha YouTube Data API, informe o @ do canal ou seu ID UC e, opcionalmente, uma playlist de origem. As respostas são atualizadas a cada hora. Apenas vídeos públicos com incorporação permitida entram na lista automática. Em falhas ou sem chave, as listas manuais são usadas.

O player usa a API IFrame do YouTube, inicia sem som quando pelo menos metade do destaque aparece e pausa fora da tela ou quando a aba fica oculta. A preferência de movimento reduzido mantém o início manual. O navegador pode bloquear autoplay; os controles do YouTube continuam disponíveis. Playlists abrem no YouTube. A chave nunca é enviada ao navegador nem armazenada no CMS.

Validação: `node --test tests/home-videos.test.cjs` e `npm run build`. A reprodução com o YouTube ao vivo e a gravação no CMS exigem validação após o deploy.
