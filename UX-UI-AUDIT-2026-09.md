# Relatório UX/UI — Coopercica Platform
Data: 22/09/2026

## Objetivo
Revisão heurística e refatoração de convenções para reduzir esforço cognitivo, tornar estados mais previsíveis e preservar a linguagem visual Coopercica.

## Princípios adotados
- Visibilidade do estado do sistema.
- Correspondência entre linguagem da interface e tarefa do usuário.
- Consistência e padrões.
- Prevenção e recuperação de erros.
- Reconhecimento em vez de memorização.
- Controle do usuário.
- Acessibilidade por teclado e redução de movimento.

## Alterações implementadas

### 1. Convenções globais de interação
- Estados de foco mais claros em campos.
- Estados disabled padronizados.
- Altura mínima e raio coerentes para controles.
- Upload de arquivo com aparência consistente.
- Helpers de formulário e mensagens de status reutilizáveis.
- Suporte global a prefers-reduced-motion.
- Área de ações de formulários padronizada.

### 2. Painel administrativo
- Menu lateral agora informa visualmente a seção atual com aria-current.
- Item ativo recebe contraste e marcador lateral.
- Login permanece centralizado no painel, evitando autenticação repetida em cada módulo.

### 3. Folheteria Digital — criação
- Linguagem orientada à tarefa: “Criar folheto” em vez de “Importar folheto”.
- Slug explicitamente opcional e com explicação.
- Status traduzido para intenção: “Salvar como rascunho” e “Publicar na vigência”.
- Thumbnail e Header recebem descrição de onde serão usados.
- Planilha é identificada como “Planilha de produtos — ERP”.
- Instrução explícita sobre a aba “Tabloide Digital”.
- Feedback de processamento mais claro.
- Sucesso e erro agora possuem estados visuais diferentes e semântica de acessibilidade.
- Botão indica atividade com aria-busy.

### 4. Navegação pública
- Links âncora do menu agora funcionam também quando o usuário está em uma página interna.
- “Quem Somos”, “Nossas Lojas”, “Delivery”, “Drogaria” e “Revista” retornam à seção correspondente da Home quando necessário.
- “Ofertas” recebe estado ativo nas rotas /folheteria.
- Logo retorna à Home quando o usuário está fora dela.
- aria-current passa a comunicar localização também a tecnologias assistivas.

## Padrões definidos
1. Verde institucional escuro = navegação, títulos e ações estruturais.
2. Verde claro = ação primária e confirmação.
3. Vermelho = ênfase de marca ou erro, não ação primária recorrente.
4. Campos sempre apresentam label persistente; placeholder é exemplo, não substituto de label.
5. Ações destrutivas e publicação devem ser explicitamente nomeadas.
6. Feedback deve aparecer próximo da ação que o originou.
7. O mesmo comportamento deve produzir o mesmo padrão visual em todo o projeto.
8. Em páginas internas, navegação da Home deve preservar destino e contexto.
9. Movimento é complemento, nunca requisito para compreender a interface.
10. Estados vazio, carregando, sucesso, erro e desabilitado devem ser visualmente distinguíveis.

## Próxima camada recomendada
A revisão atual priorizou convenções de alto impacto e baixo risco. A próxima evolução deve consolidar componentes FormField, FileUpload, StatusMessage e AdminNav em componentes reutilizáveis e fazer auditoria visual por breakpoint das páginas públicas.
