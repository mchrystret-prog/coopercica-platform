# Sessão do CMS e uploads de publicações

O login guarda access token e refresh token no sessionStorage da aba. O helper `getCmsAccessToken` renova a sessão quando faltam menos de 90 segundos para o JWT expirar, atualizando ambos os tokens. A renovação usa o endpoint de Auth existente e a chave publicável; não há mudança nas configurações de Auth, permissões, banco ou Storage.

O AdminShell verifica a renovação a cada 30 segundos enquanto a página está visível e ao voltar à aba/janela. Uploads de capa e PDF de revistas e o cadastro posterior também consultam a sessão antes de enviar. O fluxo de folhetos PDF compartilha o mesmo helper e consulta novamente a sessão antes de cadastrar o folheto.

Pedidos simultâneos compartilham a renovação em andamento. Sair ou entrar com outra sessão impede que uma resposta atrasada restaure os tokens anteriores. Falhas temporárias preservam o refresh token para nova tentativa; renovação recusada requer novo login. Logins antigos sem refresh token precisam sair e entrar novamente quando o JWT estiver próximo de expirar.

As mensagens de upload diferenciam JWT expirado (inclusive resposta Storage HTTP 400), falta de permissão, arquivo acima de 15 MB, MIME rejeitado e erro genérico. A capa é validada como JPG/PNG/WebP de até 15 MB; o PDF mantém as validações existentes.

Diagnóstico de 08/10/2026: os logs de Storage do envio da capa mostraram `ERR_JWT_EXPIRED` e falha na claim `exp`. O bucket site-content estava configurado para 15 MB e permitia os tipos de imagem e PDF utilizados. Essas configurações foram apenas consultadas.

Verificação: cinco testes com requisições simuladas cobrem rotação, concorrência, saída durante renovação, sessão antiga, erro temporário e classificação de falhas de Storage; TypeScript, ESLint e build de produção. O upload completo com uma sessão autenticada real ainda precisa de validação no preview. Nenhuma revista foi criada e nenhuma sessão de usuário foi renovada ou alterada no Supabase durante os testes.
