# Coopercica Platform

Site institucional e CMS da Coopercica, desenvolvido com Next.js, React e TypeScript. O projeto reúne páginas públicas, conteúdo gerenciável, folheteria digital, revistas, portal de vagas, vídeos e ferramentas administrativas.

> **Documento para desenvolvimento, operação e transferência à TI.** Esta documentação descreve o estado do código na branch `main`. A infraestrutura definitiva de produção deve ser confirmada com a TI antes da publicação.

## Índice

- [Visão geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração local](#configuração-local)
- [Variáveis e integrações](#variáveis-e-integrações)
- [Supabase e serviços de backend](#supabase-e-serviços-de-backend)
- [Funcionalidades](#funcionalidades)
- [Comandos disponíveis](#comandos-disponíveis)
- [Build e publicação](#build-e-publicação)
- [Checklist para a TI](#checklist-para-a-ti)
- [Segurança e operação](#segurança-e-operação)
- [Documentação complementar](#documentação-complementar)

## Visão geral

O projeto utiliza o **App Router do Next.js**. As páginas e componentes são renderizados pelo Next.js e podem consultar dados publicados no Supabase. Há conteúdo local de fallback para algumas áreas quando as consultas públicas não retornam registros.

O painel administrativo é acessado pelas rotas sob `/admin` e utiliza autenticação e permissões integradas ao backend. O site não utiliza o banco MySQL informado para a hospedagem: o código consultado está integrado ao Supabase. Não migre nem configure um banco MySQL para esta aplicação sem um projeto de migração específico.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| Next.js 16.3.8 | Framework web e servidor da aplicação |
| React 19.2.0 / React DOM 19.2.0 | Interface |
| TypeScript 5 | Tipagem e desenvolvimento |
| ESLint 9 | Análise estática |
| Supabase | API de dados, autenticação, Storage e Edge Functions |
| pdf-lib 1.17.1 | Validação e leitura de metadados de PDFs |
| pdfjs-dist 6.4.299 | Renderização de documentos PDF |
| page-flip 2.0.7 | Efeito de folhear publicações |
| GSAP 3.13 | Animações |
| xlsx 0.18.5 | Leitura de planilhas de folhetos |

As versões acima refletem as dependências declaradas em `package.json`. Consulte `package-lock.json` para a árvore exata resolvida.

## Estrutura do projeto

| Diretório/arquivo | Responsabilidade |
| --- | --- |
| `app/` | Rotas, layouts, páginas e endpoints do Next.js |
| `app/admin/` | Área administrativa/CMS |
| `app/api/` | Rotas de API executadas pelo servidor Next.js |
| `components/` | Componentes de interface, layout, páginas e CMS |
| `components/admin/` | Módulos administrativos |
| `components/sections/` | Seções da página inicial |
| `components/publications/` | Leitores e componentes de publicações |
| `data/` | Conteúdo local e dados de fallback |
| `docs/` | Documentação funcional dos módulos |
| `lib/` | Acesso a dados, regras de negócio, SEO e utilitários |
| `public/` | Imagens, ícones, fontes e arquivos estáticos |
| `scripts/` | Rotinas auxiliares de build |
| `styles/` | Tokens e estilos compartilhados |
| `supabase/functions/` | Edge Functions e código compartilhado do backend |
| `supabase/migrations/` | Migrações SQL versionadas |
| `tests/` | Testes automatizados e verificações de segurança |
| `types/` | Tipos TypeScript compartilhados |
| `next.config.ts` | Configuração do Next.js |
| `package.json` | Dependências e scripts |

As rotas são definidas pela estrutura de `app/`. Entre as principais áreas públicas estão Home, Quem Somos, Lojas, Folheteria, Revista, Trabalhe Conosco, Vagas e Vídeos. Também existem rotas de Delivery e Drogaria no código atual. O CMS possui módulos de folheteria, lojas, mídias, campanhas, revistas, analytics, vagas, políticas, usuários, personalização e configurações.

## Pré-requisitos

- Node.js **20.9 ou superior** (requisito mínimo documentado pelo Next.js; recomenda-se uma versão LTS compatível e homologada pela TI).
- npm, incluído com Node.js.
- Acesso ao repositório GitHub.
- Acesso ao projeto Supabase correspondente para operações administrativas, migrations e Edge Functions.

Confirme a versão de Node.js compatível com o ambiente de hospedagem antes de planejar o deploy.

## Configuração local

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/mchrystret-prog/coopercica-platform.git
   cd coopercica-platform
   ```

2. Instale as dependências usando o lockfile:

   ```bash
   npm ci
   ```

3. Configure as variáveis de ambiente necessárias para o ambiente local (consulte [Variáveis e integrações](#variáveis-e-integrações)). Não compartilhe arquivos `.env` nem credenciais.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000).

O script `predev` executa automaticamente `prepare:pdf`, que copia os arquivos necessários do PDF.js e Page Flip para `public/vendor/`.

## Variáveis e integrações

O projeto possui configurações por variável de ambiente e algumas integrações Supabase definidas no código. **Não existe no estado consultado um arquivo `.env.example` versionado.** Não crie valores fictícios para preencher configurações.

Variáveis identificadas no código:

| Variável | Finalidade |
| --- | --- |
| `SITE_URL` | Origem HTTPS canônica do site, sem caminho ou barra adicional. Ex.: `https://www.exemplo.com.br`. |
| `SITE_INDEXING_ENABLED` | Habilita indexação pública somente quando igual a `true` e fora de preview/desenvolvimento. |
| `GOOGLE_SITE_VERIFICATION` | Token de verificação do Google Search Console, opcional. |
| `BING_SITE_VERIFICATION` | Token de verificação do Bing Webmaster Tools, opcional. |
| `SITE_ANALYTICS_ALLOWED_ORIGINS` | Origens permitidas pela Edge Function de analytics, separadas por vírgula. |
| `CAREERS_ALLOWED_ORIGINS` | Origens permitidas pela Edge Function de candidaturas, separadas por vírgula. |
| `OFFERS_API_ALLOWED_HOSTS` | Hosts adicionais permitidos para integrações de ofertas, separados por vírgula. |
| `OFFERS_DELIVERY_TOKEN` | Token Bearer opcional da API de ofertas do Delivery, mantido somente no servidor. |
| `OFFERS_PHARMACY_TOKEN` | Token Bearer opcional da API de ofertas da Drogaria, mantido somente no servidor. |

A URL do projeto Supabase e a chave publicável são definidas em `lib/leaflets.ts` no código atual. A chave publicável é destinada ao uso no cliente e **não equivale a uma chave secreta de serviço**. Nunca inclua `service_role`, senhas, tokens privados ou credenciais administrativas no frontend, em variáveis `NEXT_PUBLIC_*`, no Git ou em documentação pública.

A indexação está desligada por padrão. Mantenha `SITE_INDEXING_ENABLED` ausente ou diferente de `true` em homologação. Só habilite no domínio definitivo após aprovação de conteúdo e lançamento.

## Supabase e serviços de backend

O projeto está conectado ao Supabase hospedado. O código consultado usa:

- **PostgREST** para leitura e gravação de dados do CMS e conteúdo público.
- **Supabase Auth** para autenticação e controle de acesso ao CMS.
- **Supabase Storage** para arquivos, imagens, PDFs e currículos.
- **Edge Functions** para coleta de analytics e recebimento de candidaturas.
- **PostgreSQL / migrations** para tabelas, funções, políticas e permissões do backend.

O código consultado referencia tabelas como `digital_leaflets`, `digital_leaflet_products`, `site_campaigns`, `site_stores`, `site_magazines` e configurações do site. Os buckets documentados incluem `site-content`, `leaflet-assets` e `job-resumes` (este último privado). As permissões e políticas de segurança do banco são parte essencial do funcionamento.

### Migrations e Edge Functions

As migrations versionadas ficam em `supabase/migrations/`. Entre os módulos com migrations estão analytics, portal de vagas, leitor de PDF e limpeza de arquivos da folheteria.

As Edge Functions configuradas em `supabase/config.toml` são:

- `site-analytics-collect`
- `careers-apply`

Ambas estão configuradas com `verify_jwt = false`; isso é intencional para receber chamadas públicas. A validação de origem, payload, consentimento e permissões deve permanecer na própria função e no banco. Não altere essa configuração sem revisar o fluxo de segurança.

**Importante para uma nova instalação:** não execute migrations ou scripts SQL diretamente em produção sem revisar o histórico do projeto Supabase e confirmar quais já foram aplicadas. As documentações dos módulos indicam que parte das migrations e funções já foi aplicada ao projeto atualmente vinculado. Uma instalação diferente exige inventário, aplicação ordenada das migrations pendentes e publicação das funções com seus segredos configurados.

## Funcionalidades

- **Site institucional:** Home, história, informações institucionais, lojas e páginas de conteúdo.
- **Lojas:** diretório e páginas individuais por slug, com dados cadastrais e horários.
- **Folheteria digital:** cadastro e publicação de folhetos, importação de planilhas, produtos, boxes, selos e leitor de PDF.
- **Revistas:** catálogo e leitor de publicações.
- **Portal de vagas:** listagem, detalhes e formulário de candidatura.
- **CMS de RH:** administração de vagas, candidaturas e políticas/documentos, com permissões específicas.
- **Mídias e vídeos:** páginas e gerenciamento de conteúdo audiovisual.
- **Campanhas e ofertas:** banners e conteúdo de campanhas; integrações de ofertas externas são configuráveis e dependem de endpoint/credenciais fornecidos pelo fornecedor.
- **Analytics próprio:** coleta condicionada ao consentimento do visitante, relatórios, sessões, cliques, rolagem e mapa de calor agregado.
- **SEO:** metadados, sitemap, robots.txt e dados estruturados, com indexação controlada por variável de ambiente.

Consulte os documentos específicos em `docs/` para regras operacionais e limitações de cada módulo.

## Comandos disponíveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia ambiente de desenvolvimento (executa preparação dos assets PDF antes). |
| `npm run build` | Gera build de produção (executa preparação dos assets PDF antes). |
| `npm run start` | Inicia o servidor Next.js de produção após build. |
| `npm run lint` | Executa ESLint. |
| `npm run test:leaflets` | Testes do importador e apresentação da folheteria. |
| `npm run test:analytics` | Testes de analytics. |
| `npm run test:recruitment` | Testes do portal de vagas e recrutamento. |
| `npm run test:publications` | Testes de publicações. |
| `npm run test:offers` | Testes das ofertas da Home. |
| `npm run test:seo` | Testes de SEO. |
| `npm run prepare:pdf` | Copia assets necessários de PDF.js e Page Flip para `public/vendor/`. |

Verificação geral recomendada antes de publicar:

```bash
npx tsc --noEmit
npm run lint
npm run test:leaflets
npm run test:analytics
npm run test:recruitment
npm run test:publications
npm run test:offers
npm run test:seo
npm run build
```

Os testes SQL em `tests/*security.sql` são verificações de backend e devem ser executados somente em ambiente de homologação, seguindo as instruções do próprio arquivo. Alguns testes de Edge Functions exigem Deno e permissões específicas; consulte os documentos de cada módulo.

## Build e publicação

### Execução de produção

Após configurar o ambiente:

```bash
npm ci
npm run build
npm run start
```

O comando `npm run start` inicia o servidor Next.js. O processo deve permanecer ativo sob um gerenciador de processos ou serviço equivalente, com proxy reverso HTTPS na frente, logs, reinicialização controlada e monitoramento.

**O projeto não está configurado como exportação estática.** O `next.config.ts` não define `output: "export"`; a aplicação contém rotas de API, recursos dinâmicos e integrações de servidor. Portanto, não basta copiar o conteúdo de `out/` (que nem é gerado pela configuração atual) para `public_html` via FTP. A hospedagem precisa executar Node.js e encaminhar as requisições ao processo Next.js.

### Hospedagem em cPanel

A disponibilidade de cPanel e FTP não confirma, por si só, suporte a Node.js. Antes de publicar, a TI deve confirmar:

1. Se o plano possui **Setup Node.js App** ou recurso equivalente.
2. Versão de Node.js suportada (mínimo 20.9; validar compatibilidade da versão efetiva).
3. Se há SSH/Terminal para instalar dependências e executar build.
4. Como o cPanel mantém o processo da aplicação ativo e configura o proxy/integração com o domínio.
5. Como configurar variáveis de ambiente, HTTPS, logs, reinicialização e deploy.
6. Se a hospedagem permite conexões HTTPS de saída para o Supabase.

Se o plano não oferecer execução Node.js adequada, será necessário outro servidor/serviço compatível. FTP serve para transferência de arquivos; não executa a aplicação. Não envie o projeto para a raiz pública do site antes da definição do método de publicação e do diretório de aplicação.

### Atualizações

Fluxo recomendado: revisão em branch/PR, validação em homologação, aprovação da TI e publicação do build aprovado. Mantenha o commit de produção identificado e um procedimento de rollback. Não substitua arquivos diretamente em produção sem backup e janela de manutenção acordada.

## Checklist para a TI

- [ ] Confirmar servidor Node.js compatível com a versão exigida pelo projeto.
- [ ] Confirmar método de deploy (Git/CI, SSH ou procedimento suportado pelo cPanel).
- [ ] Definir diretório da aplicação, diretório público e usuário/permissões do processo.
- [ ] Definir domínio, DNS, HTTPS/SSL e proxy reverso.
- [ ] Configurar variáveis de ambiente do frontend/servidor sem expor segredos.
- [ ] Liberar saída HTTPS para o projeto Supabase e endpoints externos autorizados.
- [ ] Confirmar rotina de logs, monitoramento, reinicialização e backups do servidor.
- [ ] Validar autenticação do CMS, upload/download de arquivos, leitores PDF, vagas e analytics em homologação.
- [ ] Confirmar estratégia de backup e recuperação para os dados/arquivos no Supabase com o responsável pelo projeto.
- [ ] Habilitar indexação somente após aprovação formal do lançamento e revisão de conteúdo.

## Segurança e operação

- Não versionar arquivos `.env`, senhas, tokens privados ou chaves de serviço.
- A chave publicável do Supabase pode estar no cliente; a segurança dos dados depende das policies/RLS e das validações do backend.
- Não desabilitar RLS nem ampliar permissões para contornar erros do CMS.
- Currículos ficam em bucket privado; o acesso é restrito a RH autorizado e administradores, por URL assinada temporária conforme a implementação documentada.
- Analytics depende de consentimento. A escolha de recusar deve continuar interrompendo a coleta.
- A indexação deve permanecer desativada em preview/homologação.
- Não executar limpeza manual de arquivos do Storage sem verificar referências no banco.
- Não alterar migrations, policies, buckets, autenticação ou funções em produção sem plano, backup e revisão.
- Dados pessoais de candidaturas devem ser tratados conforme a política de recrutamento aprovada pela Coopercica.

## Documentação complementar

- [Analytics do site](docs/analytics-site.md)
- [Portal de vagas](docs/portal-vagas.md)
- [SEO e descoberta em buscas com IA](docs/seo-geo.md)
- [Folheteria: boxes e selos](docs/folheteria-boxes-selos.md)
- [Ofertas na Home](docs/ofertas-api-home.md)
- [Imagens de Nossa História](docs/cms-imagens-historia.md)
- [PDF, vídeos e lojas](docs/pdf-videos-lojas.md)
- [Fase B](docs/FASE_B.md)
- [Sistema de design](DESIGN_SYSTEM.md) e [regras de design](DESIGN_RULES.md)

---

**Responsabilidade de publicação:** a TI deve validar os requisitos de infraestrutura, variáveis, acesso ao Supabase e rotina de operação antes de colocar esta aplicação em produção na hospedagem interna.
