# Portal de Vagas e perfil RH

## Operação

- Site: `/vagas`, com busca, filtros por setor e cidade, detalhes e candidatura sem criar conta. `/trabalhe-conosco` redireciona para o portal.
- Administrador: em **CMS → Usuários**, aprove o usuário com perfil **Recursos Humanos**. O usuário deve sair e entrar novamente.
- RH: em **Portal de Vagas → Nova vaga**, preencha setor, localização, contrato, descrição e requisitos; salve como rascunho ou aberta. O prazo usa a data de São Paulo, incluindo o último dia.
- Candidaturas: filtre por vaga/situação, consulte o currículo, altere a etapa e registre observações internas. Encerrar uma vaga impede novos envios e preserva o histórico.
- Documentos: RH pode cadastrar/editar políticas e enviar novos PDFs pela seção **Políticas e documentos**. O limite desse módulo é 15 MB.

## Permissões e dados

RH acessa somente vagas, candidaturas e documentos/políticas no CMS. O banco também verifica as permissões; ocultar o menu não é a única proteção. Administradores têm acesso a esses módulos; editores comuns não recebem acesso às candidaturas.

Currículos ficam no bucket privado `job-resumes`, limitados a PDF de 5 MB, com nome aleatório. Apenas RH aprovado e administradores podem consultá-los; o download usa link assinado com validade de 60 segundos. Os dados incluem nome, e-mail, telefone, cidade, apresentação opcional e consentimento com data/versão. Não há conta de candidato, notificação automática por e-mail nem coleta de CPF.

O formulário pede autorização para a candidatura e aponta para as políticas do site. Antes de abrir vagas, publique a política de recrutamento da Coopercica, com canal de atendimento e critérios de retenção. Esta versão não define um prazo automático de exclusão, nem oferece exclusão de candidaturas pela interface. Atendimento a pedidos e descarte devem seguir o processo aprovado pelo RH. Falhas ambíguas de rede podem deixar um arquivo privado sem referência; a limpeza deve confirmar que ele não pertence a uma candidatura antes da exclusão.

## Backend e publicação

As migrations `20261006003705_portal_vagas_rh.sql` e `20261006011000_recruitment_member_grants.sql` e a Edge Function `careers-apply` foram aplicadas ao projeto vinculado. Para outra instalação, aplique-as em ordem e publique a função com JWT desativado: candidatos são anônimos e o endpoint realiza validação própria.

A função aceita os domínios Coopercica, o endereço Vercel de produção e localhost:3000. Outros endereços de homologação precisam ser adicionados ao segredo `CAREERS_ALLOWED_ORIGINS` (lista separada por vírgulas). Chaves de serviço ficam exclusivamente no runtime da função.

Aplique o merge do PR em `main` para o deploy automático do frontend. Nenhuma vaga real ou usuário RH foi criado automaticamente.

## Validação

- `npm run test:recruitment`: regras de acesso, busca, formulário e PDF.
- `npx deno test --allow-env supabase/functions/careers-apply/handler.test.ts`: fluxo HTTP com serviços simulados, incluindo sucesso, duplicidade, limite, vaga encerrada e falhas/commit ambíguo.
- `tests/recruitment-security.sql`: execute dentro de BEGIN/ROLLBACK no projeto de homologação. Usa registros temporários e simula RH/admin/editor/anônimo; não persiste alterações de perfil ou arquivos.
- Build Next.js, TypeScript, ESLint dos componentes alterados e testes existentes de analytics/folheteria passaram.

Revisão visual em navegador e um envio completo na homologação ainda devem ser realizados antes do merge. Os testes simulados não substituem essa revisão.
