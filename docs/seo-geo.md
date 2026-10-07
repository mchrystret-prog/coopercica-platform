# SEO e descoberta em buscas com IA

## O que está implementado

- Títulos, descrições, URLs canônicas, Open Graph e Twitter por página, com imagem social de 1200 × 630.
- `/sitemap.xml` inclui páginas públicas, lojas ativas, folhetos vigentes, vídeos e vagas abertas dentro do prazo. Datas de atualização só são emitidas quando vêm do conteúdo.
- `/robots.txt` permite rastreamento público, inclusive OAI-SearchBot, e exclui CMS, API e design system. Previews e desenvolvimento ficam fora da indexação. Autenticação continua obrigatória no CMS; robots não é controle de acesso.
- JSON-LD de Organization, WebSite, GroceryStore, BreadcrumbList e JobPosting com dados existentes e serialização segura de texto do CMS.
- Cada loja ganha `/lojas/[slug]`, com endereço, horários, telefone e serviços em texto, ligada pelo diretório de lojas. Links do rodapé levam às páginas públicas.
- A home e Quem Somos expõem fatos institucionais em texto, incluindo fundação, cidades e missão, visão e valores. Isso ajuda mecanismos de busca a compreender e citar a organização.
- Vagas vencidas saem da listagem e retornam 404 no detalhe. Vagas sem localização validada ou remotas sem país de elegibilidade continuam publicadas quando vigentes, mas não recebem JobPosting. CLT não é inferido como jornada integral; salário e avaliações não são inventados.
- Preços de demonstração não recebem marcação Product/Offer. O container de preview usa `data-nosnippet`, reconhecido pelo Google. Não há garantia de que outros mecanismos respeitem essa opção.
- Leitores de PDF não são indexados separadamente; catálogos continuam indexáveis. Conteúdo editorial dos PDFs precisa de versões HTML para ampliar sua descoberta.

## Configuração na Vercel

Defina `SITE_URL` com a origem HTTPS do domínio público definitivo, sem caminho, query ou credenciais, por exemplo `https://www.seudominio.com.br`. Enquanto não houver domínio próprio, o fallback é `https://coopercica-platform.vercel.app`. Ao migrar o domínio, ajuste a variável e faça novo deploy. Não use a URL temporária de preview.

Opcionalmente, configure `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` com os tokens de verificação de propriedade fornecidos pelas respectivas ferramentas. Esses tokens são metadados públicos, não chaves de API. Propriedades verificadas por DNS não precisam desses tokens.

Após o deploy:
1. Abra `/robots.txt` e `/sitemap.xml` no domínio definitivo e confirme que as URLs usam esse domínio.
2. Cadastre o sitemap no Google Search Console e Bing Webmaster Tools usando as contas da empresa.
3. Use a inspeção de URL e Rich Results Test nas páginas de uma loja e de uma vaga vigente. Verifique o HTML renderizado, canônica e JSON-LD.
4. Monitore páginas indexadas, consultas, erros de rastreamento, Core Web Vitals e referências vindas de assistentes. Publique conteúdo útil e atualizado; nenhuma implementação garante posicionamento ou citação por IA.

OAI-SearchBot é o rastreador de busca da OpenAI. GPTBot tem finalidade distinta, relacionada a treinamento; esta alteração não adiciona uma política específica de treinamento. Ajuste essa política separadamente se a empresa quiser definir esse controle.

## Validação e manutenção

Execute `npm run test:seo`, `npm run test:recruitment`, `npx tsc --noEmit` e `npm run build`. Novas páginas públicas precisam de metadados próprios, links internos e inclusão no sitemap quando indexáveis. Marcação estruturada deve corresponder ao conteúdo visível e não representar dados fictícios.

Referências: [Google: recursos de IA](https://developers.google.com/search/docs/appearance/ai-features), [JobPosting](https://developers.google.com/search/docs/appearance/structured-data/job-posting), [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), [OpenAI: bots](https://developers.openai.com/api/docs/bots).
