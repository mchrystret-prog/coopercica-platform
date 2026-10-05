# Imagens de Nossa História

Abra **CMS → Personalização → Nossa História**. Cada capítulo mostra ano, título e foto atual. Envie JPG, PNG ou WebP (até 15 MB; recomendado 1600 × 1000 px) e clique em **Salvar alterações**. A nova foto aparece na Home e em Quem Somos. **Restaurar imagem original** retorna à imagem do projeto após salvar.

As imagens são enviadas ao bucket existente `site-content`, pasta `history`. O mapa de capítulos fica em `site_settings.history_images` e usa os mesmos RPCs e permissões de Personalização. Não exige migration, novo bucket ou mudanças de autenticação. Fotos padrão continuam disponíveis quando não há substituição. Textos, ordem, cores e navegação da história são preservados.
