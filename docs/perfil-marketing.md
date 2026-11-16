# Perfil Marketing no CMS

Administradores podem aprovar uma solicitação como **Marketing** ou selecionar esse perfil em **Usuários → Perfil**. Nenhum usuário existente é convertido automaticamente. Após a alteração, o usuário deve sair e entrar novamente para atualizar o menu.

Marketing acessa Visão geral, Personalização (exceto Portal de Vagas), Campanhas, Folheteria, Revistas, Lojas, Biblioteca de mídia, Analytics e Políticas e documentos. Não acessa Portal de Vagas, candidaturas, currículos, Usuários ou Configurações de API. O perfil Editor existente é mantido por compatibilidade.

As permissões dependem da associação aprovada em `cms_members`, nunca de metadados editáveis do usuário. `cms_can_edit` habilita as operações de conteúdo existentes. As regras de recrutamento e administração continuam exclusivas dos perfis anteriores.

A consulta de personalização usa as permissões do solicitante. Políticas restritivas filtram as configurações e arquivos protegidos. A RPC de gravação verifica todas as chaves e seções antes de gravar, inclusive em chamadas diretas à API. Configurações novas exigem inclusão explícita na lista permitida para Marketing. Os dados que já são públicos no site, como vagas abertas, continuam públicos; a restrição se refere à gestão e aos dados privados.

## Verificação

- `node --test tests/marketing-access.test.cjs tests/cms-customization-structure.test.cjs`
- `npm run test:recruitment`
- Executar `tests/marketing-security.sql` e `tests/recruitment-security.sql` dentro de `BEGIN` / `ROLLBACK`, nunca isoladamente. Os testes usam dados temporários e alterações de perfil que devem ser revertidas integralmente.

Migração aplicada: `20261116160547_cms_marketing_role.sql`.
