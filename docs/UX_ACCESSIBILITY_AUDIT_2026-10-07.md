# Auditoria de UX e acessibilidade — Coopercica

Data: 07/10/2026. Base: branch `feat/home-offers-coopermais`, incluindo a seção Parceiros desta entrega.

## Resultado e limites

A experiência já tem uma base coerente: cores centralizadas, controles semânticos, filtros com labels, mensagens de resultados, foco visível e componentes de ofertas compartilhados. A maior oportunidade agora é dar mais controle sobre movimento, aumentar a previsibilidade da navegação e tornar erros fáceis de corrigir. Mais animação, por si só, não melhora a experiência.

Esta revisão fez uma varredura das rotas, componentes e módulos de suporte, com aprofundamento no layout global, Home, folheteria/ofertas, lojas, revistas/leitor PDF, vídeos, carreira/candidatura, consentimento e personalização do CMS. Considerou os estados produzidos por APIs e as configurações de conteúdo. É uma auditoria estática e heurística; não representa leitura individual de todo arquivo, teste de segurança do backend, certificação WCAG, medição de Core Web Vitals nem validação visual de todos os dispositivos. Navegação real por teclado, leitores de tela, zoom, Safari/iOS e gravação das alterações no CMS ainda precisam de execução em ambiente acessível.

**Prioridades:** P1 = tratar antes da divulgação pública; P2 = próxima rodada de qualidade; P3 = evolução. “Confirmado” significa evidência no código ou cálculo das cores; “validar” significa hipótese que exige teste real. As recomendações abaixo não foram aplicadas de forma generalizada nesta entrega.

## P1 — leitura, controle e conversão

| Achado | Evidência e impacto | Correção proposta | Critério de aceitação |
| --- | --- | --- | --- |
| Contraste dos CTAs primários — confirmado | `styles/tokens.css` e `styles/components.css`: branco sobre `#6AB945` resulta em **2,43:1**, abaixo de 4,5:1 para texto comum e de 3:1 para texto grande. O problema se propaga pelo componente Button. | Preservar o fundo verde da marca; usar texto `#101010` no estado normal (**7,83:1**) e branco no hover verde escuro. `#1C4722` sobre o verde claro produz **4,38:1**, portanto não resolve texto comum. | Conferir normal/hover/ativo, CTA do cabeçalho, home e carreira. Contraste mínimo 4,5:1 para texto comum; foco distinguível nos fundos claros e escuros. |
| Pausa do banner não persistente — confirmado | `components/sections/Hero.tsx`: a mesma variável controla pausa manual e hover. `onMouseLeave` define `paused=false`, podendo desfazer a escolha do botão Pausar. O intervalo também ignora redução de movimento e foco no banner. | Separar pausa manual de suspensão por hover/foco/visibilidade. A escolha manual deve persistir até Reproduzir. Não iniciar automaticamente com redução de movimento. | Pausar, sair com o mouse e esperar dois ciclos: não muda. Focar campanha pelo teclado: não troca o conteúdo sob o foco. Preferência de movimento reduzido: permanece estático. |
| Destinos dos aplicativos incompletos — confirmado | `components/sections/AppShowcase.tsx`: App Store aponta para `https://apps.apple.com/br/app/`; Google Play para a loja genérica. O visitante não chega diretamente ao aplicativo. | Cadastrar os URLs reais da Coopercica, preferencialmente no CMS, com fallback claro quando uma plataforma não estiver disponível. | Cada badge abre a ficha correta no sistema correspondente, em desktop, Android e iOS. Não inventar IDs dos aplicativos. |
| Erros de candidatura pouco localizados — confirmado | `components/careers/ApplicationForm.tsx`: erro de currículo aparece no final do formulário com `role="alert"`, sem vínculo ao campo, `aria-invalid` ou foco guiado. Após sucesso, o formulário e o botão focado são removidos. | Associar erro ao campo responsável, incluir resumo com link para o campo e levar o foco ao resultado após envio. Preservar os dados em falha. | PDF inválido orienta o usuário até Currículo; leitor de tela anuncia o motivo. Sucesso coloca o foco na confirmação; falha permite corrigir sem recomeçar. |
| AppShowcase sem alternativa de movimento reduzido — confirmado | `components/sections/AppShowcase.tsx`: os dois breakpoints criam timelines GSAP com pin/scrub sem condição `prefers-reduced-motion`. A regra CSS global não desliga ScrollTrigger. | Para movimento reduzido, mostrar o conteúdo em fluxo normal, sem pin, blur ou scrub. Manter a apresentação animada para os demais. | Todos os benefícios e links continuam acessíveis com movimento reduzido e com teclado. Validar também notebook de pouca altura e celular em paisagem. |

## P2 — navegação e previsibilidade

| Achado | Evidência e impacto | Correção proposta | Critério de aceitação |
| --- | --- | --- | --- |
| Atalho para o conteúdo ausente — confirmado | `app/page.tsx` e `components/layout/InternalPage.tsx` têm `<main>` sem destino de skip link; `Header.tsx` não oferece “Pular para o conteúdo”. A Home não possui título H1 textual. | Adicionar skip link visível ao foco e destino principal consistente. Definir H1 que descreva a página, sem recriar a seção introdutória removida por decisão editorial. | Primeiro Tab oferece o atalho; Enter move o foco para o conteúdo abaixo do cabeçalho. Estrutura de títulos é compreensível ao navegar por headings. |
| Menu móvel em telas baixas — risco a validar | `Header.module.css`: dropdown com vários links, padding e CTA, sem limite de altura ou rolagem interna. `Header.tsx` não trata Escape. | Limitar altura à área útil e permitir rolagem interna; Escape fecha e devolve foco ao botão Menu. É navegação não modal: não prender o foco indevidamente. | Todos os links cabem ou podem ser alcançados em paisagem/zoom; fechar não deixa foco em conteúdo escondido. |
| História continua avançando fora da tela — confirmado | `useHorizontalHistory.ts`: `startRequested` vira true quando a seção aparece e não retorna a false ao sair. Há controle manual, foco, redução de movimento e visibilidade da aba, mas não suspensão ao sair da seção. | Usar visibilidade atual da seção para suspender a reprodução; manter a posição e a pausa manual ao retornar. | Sair da seção e retornar preserva o capítulo. Reproduzir só avança enquanto a seção está visível e a preferência permite. |
| Reprodução de vídeo pode sobrepor escolha manual — confirmado no fluxo de eventos; validar interação | `FeaturedYouTube.tsx`: `sync()` chama `playVideo()` ao ficar visível ou ao voltar à aba, sem guardar pausa feita no player. | Distinguir primeiro autoplay, suspensão por visibilidade e pausa do visitante, usando eventos do player. Evitar reiniciar vídeo pausado manualmente. | Pausar no player, sair/voltar à seção e alternar abas mantém a pausa. Autoplay inicial continua sem som. |
| Preferências de privacidade sem retorno de foco — confirmado | `SiteAnalytics.tsx`: abrir preferências remove o botão e exibe o diálogo; fechar faz a troca inversa, sem gerenciamento de foco. | Ao abrir explicitamente, focar o título/primeiro controle; ao fechar, retornar ao botão. O aviso inicial não modal não deve roubar foco nem bloquear a página. | Fluxo Abrir → escolher/fechar funciona por teclado e com leitor de tela, sem perder a posição. |
| Controles de carrossel inconsistentes — confirmado | Produtos têm extremos desabilitados; revistas circulam entre edições; setas de `HomeVideos.tsx` permanecem habilitadas sem deslocamento possível. | Manter loop apenas onde faz sentido; padronizar setas, tamanho de alvo e sinais de disponibilidade. No trilho de vídeos, desabilitar setas nos extremos. | Sem seta ativa que aparentemente não responde; foco continua visível após mudança. Arrastar nunca é a única forma de navegar. |
| Contraste sobre fundos de boxes depende da arte — confirmado como limitação | `ProductCarousel.tsx` escolhe branco ou verde a partir de **um pixel** do fundo. Isso não garante contraste atrás de todos os textos de um fundo com textura/gradiente. | Permitir cor de texto por box no CMS e validar as artes; quando necessário usar faixa/sombra discreta atrás da informação. | Nome, preço, selo e foco permanecem legíveis em toda a faixa de cards e em ambos os recortes. Não voltar automaticamente ao preenchimento branco rejeitado. |
| Feedback do CMS pouco uniforme — confirmado | `SiteCustomization.tsx` e `CampaignAdmin.tsx` usam mensagens `.form-status` sem região live, enquanto outros módulos já usam `role="status"`/`alert`. | Padronizar feedback de carregar, enviar, salvar, sucesso e erro, com anúncio apropriado e foco no campo em validação. | Salvar personalização comunica o resultado sem exigir procura visual. Erros levam ao contexto correspondente; rascunho e publicação ficam explícitos. |

## P3 — refinamento e testes necessários

- **Leitor de PDF:** `reader.css` tem controles de 34–36 px em alguns contextos móveis. Preferir áreas de toque de 44 px quando houver espaço, sem reduzir a página legível. Isso não é automaticamente uma falha WCAG: o mínimo AA de alvo tem regras de tamanho/espaçamento. Validar o modo expandido de `ReaderFrame.tsx` com iOS/Android reais, orientação, saída, foco e restauração da rolagem; a inspeção estática não confirma fullscreen nativo em cada navegador.
- **Currículo em celular:** a candidatura exige MIME exatamente `application/pdf`. Testar seleção por Files/Drive no dispositivo; alguns arquivos podem chegar com MIME ausente. Qualquer aceitação mais flexível deve manter validação efetiva do PDF no servidor. A ocorrência no aparelho ainda não foi reproduzida.
- **Vídeo em conexão limitada:** testar bloqueio da API do YouTube, autoplay recusado e carregamento que não termina. Há fallback para erro, mas o carregamento da API pode ficar pendente sem timeout. Acrescentar recuperação acessível quando necessário.
- **Conteúdo e tipografia:** validar a fonte aprovada e os arquivos/licenças contra o Brandbook. O token atual usa Montserrat. Padronizar limites editoriais e evitar títulos longos que empurrem CTAs para fora de cards. Não reduzir excessivamente a fonte para “caber”.
- **Performance:** medir LCP, INP e CLS com campanhas e PDFs reais. Há carregamento sob demanda de ofertas e vídeo, mas as animações GSAP, imagens e leitor merecem medição em Android intermediário. Não atribuir nota de desempenho sem medição.
- **Arquitetura editorial:** manter as seções comerciais curtas e claras. Conteúdo institucional completo fica em páginas próprias. Evitar acumular autoplay e muitos padrões de swipe na mesma Home; a seção Parceiros desta entrega é manual.
- **Estados de rede:** testar API vazia, lenta, indisponível e sessão CMS expirada. Os blocos de ofertas já têm estados de carregamento, vazio e erro; revisar consistência das mensagens nas outras listagens e preservação do trabalho durante falhas.

## O que preservar

- Labels reais e autocomplete na candidatura; campos de formulário excluídos do analytics.
- Filtros de lojas com estado comunicado, reset e resultados anunciados; telefone/mapas com destinos úteis.
- Filtros de carreira e contagem de vagas, evitando navegação obrigatória para descobrir disponibilidade.
- Carrossel de revistas com alternativa por setas, indicação de edição e abertura da capa ativa.
- História com pausa manual e preferência de movimento reduzido; completar a suspensão fora da tela.
- Vídeo principal sem som, pausa fora da tela e fallback para link externo; melhorar a persistência da pausa manual.
- Tokens e componentes compartilhados, que permitem corrigir padrões sem alterar toda a identidade.

## Implementado nesta entrega: Parceiros

- Seção logo após os vídeos e antes da História, com cards inspirados na referência.
- Cards em duas colunas no desktop; trilho horizontal no celular com parte do próximo card visível.
- Arraste com mouse, rolagem nativa por toque, links reais, setas de 44 px e navegação por teclado. Arrastar não aciona o link do card; redução de movimento desliga a transição das setas.
- Sem autoplay. As setas ficam desabilitadas quando não há conteúdo na direção.
- Fundo verde institucional ou vermelho da marca. No vermelho, título grande branco e texto comum escuro para manter contraste: branco/vermelho **3,85:1**; escuro/vermelho **4,95:1**. No verde, branco **10,64:1**.
- CMS → Personalização → Parceiros: título da seção, exibição, título/descrição/link dos cards, tema, ilustração, rascunho/publicação, ordem e remoção; até 20 parceiros. Links publicados exigem HTTPS, sem credenciais na URL.
- Usa a chave `home_partners` no fluxo existente de configurações; não altera permissões, tabelas nem autenticação. A gravação real no CMS deve ser validada com sessão autorizada.
- iFood inicia com destino genérico `https://www.ifood.com.br/`; substituir pelo link da loja/parceria. Faculdades é um rascunho não exibido, sem instituição ou benefício inventado. Cadastrar parceiros adicionais faz o trilho navegar entre eles.
- Cliques têm identificação para o analytics já existente, respeitando a escolha de consentimento.

## Matriz de validação para a próxima rodada

1. **Telas:** 320, 360, 390, 430, 768, 1024, 1366 e 1920 px; incluir notebook 1366 × 768 e celular em paisagem. Texto longo, uma/muitas ofertas e uma/muitas edições.
2. **Teclado:** Tab/Shift+Tab, Enter, Espaço, Escape e setas nos carrosséis; nenhuma ação exige arraste; foco não desaparece sob header/aviso/elementos fixos.
3. **Leitura assistiva:** NVDA + Firefox/Chrome e VoiceOver + Safari/iOS; headings, links, filtros, selos, candidatura e preferências.
4. **Ampliação:** zoom 200% e 400%, reflow e texto aumentado; manter conteúdo e ações úteis sem rolagem horizontal da página. Trilhos horizontais devem permanecer limitados às suas seções.
5. **Movimento:** configuração do sistema reduzida; pausa manual, hover, foco, troca de aba e saída/retorno à seção.
6. **Fluxos:** encontrar loja/horário/mapa, abrir oferta correta, folhear/expandir/sair de revista, escolher vídeo, abrir parceiro e completar candidatura com erros recuperáveis.
7. **CMS:** salvar Parceiros, recarregar editor e Home, confirmar persistência, ocultar rascunho, reordenar, remover e rejeitar URL inválida; nenhuma publicação de dados reais de teste nesta validação.

## Referências normativas

- W3C, WCAG 2.2, [Contraste mínimo — 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).
- W3C, [Pausar, parar, ocultar — 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide).
- W3C, [Movimentos de arrastar — 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements).
- W3C, [Tamanho do alvo mínimo — 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

Critérios de movimento, contraste e interação orientam esta revisão; sua aplicação completa depende do contexto e dos testes acima.

## Complemento após revisão dos prints — 07/10/2026

A auditoria estática inicial deixou passar um problema de composição da seção Revista: cabeçalho em uma faixa inteira, carrossel centralizado abaixo e espaço lateral sem função. O print enviado pelo usuário confirma esse achado visual. Também evidencia títulos de Vídeos e Parceiros sem a caixa alta do restante da Home, além da linha zebrada decorativa em Parceiros.

Correções: Revista em duas colunas no desktop, texto alinhado verticalmente ao conjunto e carrossel à direita; abaixo de 900 px, uma coluna. Vídeos e Parceiros com título em caixa alta; removida a linha zebrada de Parceiros. Gestos e abertura das revistas foram preservados.

A evidência veio dos prints reais, não de renderização visual pós-ajuste. A próxima validação deve conferir a nova composição em desktop, notebook e celular, incluindo títulos longos. Isso reforça a necessidade de complementar revisão de código com inspeção visual das páginas completas.
