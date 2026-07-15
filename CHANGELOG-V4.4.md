# V4.4 — Responsive Motion Fix

- Corrigido o sticky do mockup do aplicativo.
- Removidas regras duplicadas do breakpoint de notebooks.
- ScrollTrigger recalculado após mudanças de layout e carregamento.
- Removido o cabeçalho redundante da seção do aplicativo.
- Timeline recalibrada para 1366×768 e 1440×900.
- Título da História deixou de ser cortado.
- Botão de próxima seção ganhou área clicável e z-index corretos.
- Corrigida a tipagem do componente Stores no projeto enviado.
- Next.js atualizado para 16.2.10.

Validação:
- `npx tsc --noEmit`: aprovado.
- `npm run build`: chegou à compilação, mas o ambiente local sem acesso ao Google Fonts não conseguiu baixar Montserrat. No Vercel, com acesso externo, o build deve prosseguir normalmente.
