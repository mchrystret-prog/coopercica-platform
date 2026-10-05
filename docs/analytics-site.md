# Analytics do site institucional

Abra **CMS → Analytics**. O módulo tem cinco áreas: Visão geral, Sessões e comportamento, Banners, Cliques e rolagem e Mapa de calor. Filtre por datas, página e dispositivo. Os atalhos mostram os últimos 7, 30 ou 90 dias, no fuso America/Sao_Paulo. Atualizar consulta os eventos recebidos; Exportar CSV baixa os relatórios agregados do filtro atual.

## O que é medido

| Métrica | Definição |
| --- | --- |
| Visualizações | Uma abertura/navegação de página pública após permitir analytics |
| Sessões | Identificador aleatório por aba, renovado após 30 minutos sem eventos; não são pessoas únicas |
| Cliques | Cliques em banners, links, arquivos, botões e áreas públicas; arrastes cancelados e cliques sintéticos são ignorados |
| Banners | Uma exibição por banner e visualização de página, quando o banner ativo tem pelo menos 50% de visibilidade por 1 segundo ou recebe um clique direto |
| CTR de banners | Visualizações com clique no banner divididas pelas exibições medidas; cliques repetidos entram no total de cliques, mas não multiplicam o numerador do CTR |
| PDFs abertos | Clique para abrir o documento; não confirma download concluído ou leitura |
| Tempo visível médio | Segundos em que a aba ficou visível, divididos pelas visualizações observadas; não comprova atenção do visitante |
| Origem do tráfego | UTM source, medium e campaign; na ausência, domínio de referência ou acesso direto. A atribuição é mantida durante a sessão |
| Rolagem | Visualizações que alcançaram 25%, 50%, 75%, 90% e 100% do documento; a primeira tela visível já é considerada |
| Mapa de calor | Coordenadas normalizadas de cliques agrupadas por página e dispositivo; limite de 200 cliques posicionados por visualização |

O mapa se sobrepõe à página **atual** em uma prévia com a largura média dos acessos selecionados. Use o controle de trecho para percorrer a página e a opção de mostrar calor para comparar. A sobreposição é aproximada: alterações de campanhas, produtos, alturas e componentes dinâmicos mudam a posição do conteúdo. Teclado, menus fixos e modais não geram coordenadas. A prévia não gera analytics.

## Coleta e privacidade

A escolha aparece no site público: **Somente necessários** ou **Permitir analytics**. Preferências de privacidade permite mudar a escolha. A escolha dura 180 dias; GPC e Do Not Track são respeitados. Recusar interrompe a coleta, descarta eventos ainda pendentes e remove a sessão local. Não há gravação visual da tela; a jornada reproduz somente eventos, captura de conteúdo digitado ou rastreamento do CMS.

Não são enviados IP bruto, user agent, textos de formulário, conteúdo DOM arbitrário, query strings, e-mails ou telefones de destinos. URLs externas viram somente o domínio; PDFs usam um destino genérico. Títulos cadastrados e parâmetros UTM passam por sanitização. O coletor usa um resumo HMAC diário de IP/origem apenas para limitar recebimento; ele fica isolado do relatório e expira na limpeza horária. Logs da infraestrutura seguem a configuração da plataforma.

O identificador da sessão fica em sessionStorage. Não há cookie de identificação de visitante nem integração obrigatória com GA4, Clarity ou outros provedores. As contagens não incluem quem recusa a coleta e podem ser reduzidas por bloqueadores, falhas de rede e limites. Não existe histórico anterior à publicação deste módulo.

## Arquitetura e publicação

- `SiteAnalytics` controla a escolha e acompanha navegação pública.
- `analytics-browser` reúne eventos em lotes e envia a cada 10 segundos ou ao sair/ocultar a página, via fetch keepalive ou beacon. A fila tem limite e recuo após falhas.
- `site-analytics-collect`, uma Edge Function pública, valida origem, consentimento declarado, tipos, dimensões, destinos, campos e corpo de até 32 KiB. Aceita no máximo 40 eventos por lote.
- O backend grava via RPC com credencial secreta disponível apenas na Edge Function. A RPC de ingestão só pode ser executada pelo service_role; visitantes não recebem INSERT ou SELECT da tabela.
- `site_analytics_events` tem RLS e leitura somente para membros aprovados do CMS, usando a autorização existente. Relatórios e mapa são calculados no banco, sem truncar a leitura por paginação REST. As tabelas do painel mostram os principais 100 itens e as principais 50 origens.
- O limitador fica em schema privado, com limites de 180 eventos/sessão/minuto e 1.200 eventos por resumo de origem/IP/minuto. O contador é atômico.
- `site-analytics-retention`, job horário, elimina eventos com mais de 90 dias e contadores com mais de uma hora. Não altera cron jobs existentes.

As três migrations de analytics e a Edge Function **já foram aplicadas no projeto do site**. Não é necessário executar SQL manualmente neste ambiente. Não houve alterações nas policies, tabelas, autenticação ou buckets dos módulos existentes. A política adicional pertence somente à nova tabela privada do limitador.

Para ativar o menu e a coleta no site, publique o código deste PR pelo fluxo usual de merge em `main` / deploy Vercel. Os novos sinais de comportamento começam após publicar esta atualização; métricas já coletadas continuam disponíveis.

Origens padrão: `https://coopercica-platform.vercel.app`, `https://coopercica.com.br`, `https://www.coopercica.com.br` e `http://localhost:3000`. Se o domínio mudar, acrescente-o à variável `SITE_ANALYTICS_ALLOWED_ORIGINS` da Edge Function (lista separada por vírgula). Previews Vercel não entram automaticamente; cadastre uma origem de preview somente quando quiser testar a coleta nela.

Para outro ambiente, aplique as migrations na ordem e publique a função com `verify_jwt=false` conforme `supabase/config.toml`. A função é pública de propósito; validação, limites e ingestão privilegiada ficam no backend. Não coloque credenciais secretas no site ou em variáveis NEXT_PUBLIC.

## Validação

- 21 testes automatizados do módulo: contrato de eventos, recusa/GPC, exclusão de CMS/preview, sanitização, corpo limitado, coordenadas, cliques de teclado/menu fixo, banners visíveis/inativos, clique rápido, revogação, atribuição entre rotas, CSV e períodos.
- 11 testes de folheteria preservados.
- TypeScript, ESLint dos arquivos novos, Deno check da função e build de produção aprovados.
- `analytics-security.sql` validado em transação com rollback: autorização de membro aprovado, recusa de usuário não aprovado e visitante, gravação exclusiva do backend, deduplicação, limites, agregação, filtros, fuso de São Paulo, CTR e agrupamento do mapa.
- Teste HTTP no coletor publicado: preflight, origem não permitida, recusa, rota privada, campo extra e corpo excessivo; sete eventos aceitos, reenvio sem duplicação e leitura anônima bloqueada. O relatório e o mapa consultaram esses eventos. Todas as linhas de teste foram removidas.
- Nenhum novo alerta de segurança dos advisors relacionado ao módulo após a política explícita do limitador. Achados preexistentes do projeto não foram alterados.
- Conferência visual e uso real do painel no navegador pendentes antes do merge. Testes de superfície simulada não equivalem a testes de navegador.

## Sessões e comportamento

Filtre por origem, campanha e sinais. A lista tem 25 sessões por página, com horário, dispositivo, entrada/saída, visualizações, cliques, tempo visível, profundidade e CTA/arquivo. Os totais respeitam os filtros; a jornada traz todas as páginas daquela sessão **dentro do período escolhido**, até 1.000 eventos. O botão Ver mapa desta página abre o mapa no mesmo período/página/dispositivo; filtros locais de origem, campanha e sinal não se aplicam ao mapa agregado.

A jornada possui reproduzir/pausar, anterior/próximo e controle de posição. Cada avanço exibe um evento a cada 1,2 segundo, sem representar a duração real entre ações. Não é vídeo nem reconstrução do DOM. Os novos eventos guardam horário do navegador e sequência por página para ordenar lotes; registros antigos usam recebimento e podem ter ordem aproximada. Datas futuras em mais de cinco minutos ou fora de 24 horas do recebimento usam o horário do servidor.

Cliques repetidos são grupos de três cliques em até dois segundos, num raio de 40 px. O grupo é um sinal adicional e não duplica o total de cliques. Cliques em áreas sem ação estão fora de controles HTML reconhecidos; isso não comprova que o site falhou. Não são identificados como dead clicks, porque não há observação das alterações do DOM após cada ação. CTA/arquivo é clique em Delivery, Drogaria ou documento, sem confirmar venda.

O mapa alterna entre todos os cliques, cliques repetidos, áreas sem ação e alcance da rolagem. O alcance é representado por faixas dos marcos 25/50/75/90/100%, com percentuais abaixo; não mede leitura nem atenção. A sobreposição continua aproximada sobre a versão atual do site.

A migration `site_analytics_behavior` e a versão 2 do coletor já estão aplicadas no ambiente. Coletores antigos continuam aceitos. `analytics-behavior-security.sql` validou em transação com rollback agrupamento, cronologia, filtros, paginação, mapas sem duplicar sinais, autorização e edição de imagens da história sem alterar identidade.
