# Banners de depoimentos no Portal de Vagas

Em **CMS → Personalização → Portal de Vagas**, use **Banners de depoimentos**.

- Até 12 banners, com ordem, ativação, descrição e destino configuráveis.
- Desktop: JPG, PNG ou WebP, exatamente **3384 × 864 px**, até 5 MB.
- Mobile opcional: **1080 × 1350 px**, até 5 MB. Sem essa versão, a arte horizontal aparece inteira, sem recorte.
- Reprodução automática configurável entre 5 e 30 segundos; padrão de 8 segundos. Pausa durante foco, mouse sobre o slider, gesto de navegação e preferência por movimento reduzido.
- Clique padrão: `#oportunidades`. São aceitos caminhos internos, âncoras e links HTTPS.
- Clique em **Salvar alterações** depois de editar ou enviar arquivos.

Em **CMS → Métricas → Banners**, filtre **Portal de Vagas**. Os banners usam o prefixo de identificação `careers-banner:` e o rótulo “Vagas ·”. Exibições, cliques e CTR seguem o consentimento de analytics existente. Trocar a imagem ou a ordem mantém a identidade; remover e cadastrar outro banner cria uma nova identidade.

As configurações ficam no registro `careers_hero` de `site_settings`, mantendo a foto e os textos antigos. Sem banners ativos, a foto anterior volta a aparecer. As duas artes iniciais estão em `public/careers`; novos uploads usam a pasta `careers` do bucket `site-content`.

O coletor e a restrição do banco passam a aceitar apenas a rota pública `/vagas`; páginas de candidaturas, formulários e rotas administrativas continuam fora da coleta. A migração `20261112205834_careers_banner_analytics.sql` e a função `site-analytics-collect` devem estar implantadas antes do frontend.

Verificações: `npm run test:careers-banners`, `npm run test:analytics`, `node --test tests/cms-customization-structure.test.cjs` e build de produção.
