# Coopercica Platform

Site institucional e plataforma de conteúdo da Coopercica. O projeto reúne a experiência pública do site e o CMS utilizado pelas equipes para administrar campanhas, lojas, folhetos, revistas, vídeos, personalização, vagas e relatórios.

## Visão geral

- **Site público:** páginas institucionais, história, lojas, folheteria digital, revista, vídeos, Delivery, Drogaria e oportunidades.
- **CMS:** administração de conteúdo, campanhas, folhetos, lojas, revistas, mídias, personalização, analytics e gestão de vagas.
- **Folheteria digital:** consulta de folhetos publicados e vigentes, produtos, preços, boxes e selos.
- **Portal de vagas:** divulgação de oportunidades e candidaturas, com área de gestão para Recursos Humanos.
- **Analytics:** métricas agregadas de navegação, cliques, banners e rolagem, condicionadas à escolha de privacidade do visitante.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Aplicação | Next.js 16 (App Router) |
| Interface | React 19, TypeScript e CSS Modules |
| Tipografia | Montserrat via next/font |
| Animações | GSAP |
| Backend e dados | Supabase (PostgreSQL, REST e Edge Functions) |
| Documentos | PDF.js e pdf-lib |
| Planilhas | SheetJS (xlsx) |
| Testes | Node.js Test Runner e TypeScript |
| Deploy | Vercel |

As versões exatas das dependências estão registradas em package.json e package-lock.json.

## Requisitos

- Node.js 22 ou superior (recomendado para executar todos os scripts de teste, incluindo o suporte nativo a TypeScript usado pelo Node Test Runner).
- npm.
- Acesso ao projeto Supabase utilizado pelo ambiente.
- Acesso à Vercel para acompanhar os deploys vinculados ao repositório.

## Desenvolvimento local

Clone o repositório, instale as dependências e inicie o servidor:

```bash
git clone https://github.com/mchrystret-prog/coopercica-platform.git
cd coopercica-platform
npm install
npm run dev
```

O servidor fica disponível em http://localhost:3000. Os comandos dev e build executam automaticamente prepare:pdf antes de iniciar, preparando os recursos locais utilizados pelo leitor de documentos.

Para validar uma versão de produção local:

```bash
npm run build
npm start
```

## Scripts

| Comando | Finalidade |
| --- | --- |
| npm run dev | Inicia o servidor Next.js em desenvolvimento |
| npm run build | Prepara os recursos de PDF e gera o build de produção |
| npm start | Inicia a aplicação compilada |
| npm run lint | Executa o ESLint |
| npm run prepare:pdf | Prepara os recursos utilizados pelo leitor de PDF |
| npm run test:publications | Executa os testes de publicações |
| npm run test:leaflets | Testa importação, normalização e apresentação de folhetos |
| npm run test:offers | Testa normalização e apresentação de ofertas |
| npm run test:mobile-navigation | Testa navegação mobile, acessibilidade e destinos |
| npm run test:analytics | Testa analytics do navegador e relatórios |
| npm run test:recruitment | Testa regras do portal de vagas e RH |
| npm run test:pdf-reader | Prepara os recursos e testa o leitor de PDF |
| npm run test:seo | Testa SEO e identidade do site |
| npm run test:cms-session | Testa sessão e operações editoriais do CMS |
| npm run test:contact | Testa informações de contato do rodapé |
| npm run test:uploads | Testa regras e validações de upload |

Os testes específicos podem compilar módulos TypeScript em diretórios temporários na raiz do projeto antes de executar o Node Test Runner. Esses diretórios são artefatos locais e não devem ser versionados.

## Estrutura do projeto

```text
app/                  Rotas públicas, páginas do CMS e endpoints da aplicação
components/           Componentes de layout, seções, CMS, folhetos e interface
data/                 Conteúdo institucional estático e dados de apresentação
docs/                 Documentação funcional e técnica dos módulos
lib/                  Acesso a dados, regras de domínio e serviços compartilhados
public/               Imagens e demais arquivos estáticos
scripts/              Rotinas de preparação e manutenção
styles/               Estilos compartilhados
supabase/
  functions/          Edge Functions e código compartilhado do backend
  migrations/         Histórico versionado de alterações do banco
tests/                Testes automatizados e verificações de segurança
types/                Tipos compartilhados da aplicação
```

## Integração com Supabase

O frontend utiliza a URL do projeto e uma chave publicável para consultas públicas. Essas informações não substituem autorização: operações administrativas e dados restritos dependem das permissões verificadas pelo CMS e pelo banco.

O diretório supabase/migrations mantém o histórico de alterações de schema. As Edge Functions ficam em supabase/functions; entre elas:

- site-analytics-collect: recebimento e validação de eventos de analytics.
- careers-apply: recebimento de candidaturas do portal de vagas.

A configuração das funções está em supabase/config.toml. Segredos de serviço e credenciais privadas devem permanecer no ambiente seguro do Supabase/Vercel, nunca no código do navegador, no Git ou em variáveis NEXT_PUBLIC_.

Para desenvolver com outro projeto Supabase, revise os endpoints e as chaves públicas em lib/leaflets.ts e as configurações específicas das Edge Functions antes de publicar. Não aplique migrations nem altere políticas de acesso em produção sem revisar o impacto e o procedimento de implantação.

## Navegação e folhetos vigentes

A disponibilidade de Ofertas é determinada pelos folhetos publicados e dentro do período de exibição. A consulta considera o fuso America/Sao_Paulo, a data inicial de exibição e a validade final. Quando não há folhetos vigentes, a opção Ofertas é omitida tanto do menu principal quanto da navegação rápida mobile. A disponibilidade é compartilhada pelo layout da aplicação para manter os dois menus sincronizados.

## Documentação funcional

A documentação detalhada dos módulos está em docs/. Pontos de entrada:

- [Analytics do site](./docs/analytics-site.md)
- [Portal de vagas e perfil RH](./docs/portal-vagas.md)
- [Folheteria: boxes e selos](./docs/folheteria-boxes-selos.md)
- [Ofertas da Home via API](./docs/ofertas-api-home.md)
- [Interações das ofertas na Home](./docs/home-offers-interactions.md)
- [SEO e GEO](./docs/seo-geo.md)
- [Revista editorial](./docs/revista-editorial.md)
- [Lojas na Home](./docs/lojas-home.md)

## Deploy

O repositório está integrado ao fluxo de deploy da Vercel. Commits na branch configurada para produção iniciam o build conforme as configurações do projeto.

Antes de promover alterações:

1. Revise o diff e confirme que somente os arquivos previstos foram modificados.
2. Execute os testes relacionados às áreas alteradas.
3. Execute npm run lint e npm run build.
4. Verifique o preview em desktop e mobile, incluindo navegação por teclado e conteúdo carregado do Supabase.
5. Confirme o resultado do deploy e a versão publicada na Vercel.

## Boas práticas de manutenção

- Preserve o escopo da alteração solicitada e evite refatorações não relacionadas.
- Reutilize as funções de domínio em lib/ em vez de duplicar regras nos componentes.
- Mantenha os tipos TypeScript alinhados aos dados efetivamente recebidos.
- Trate conteúdo vindo do CMS, APIs e planilhas como entrada externa e valide-o antes de apresentar ou persistir.
- Não exponha credenciais privadas, dados pessoais ou informações internas em logs, commits e documentação pública.
- Atualize os documentos em docs/ quando uma mudança alterar o comportamento operacional de um módulo.
