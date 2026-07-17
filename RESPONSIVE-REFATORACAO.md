# Refatoração responsiva — notebooks 1366 × 768

Ajustes aplicados sem alterar os breakpoints mobile existentes:

- densidade vertical global para notebooks em orientação paisagem;
- header compacto apenas em telas baixas;
- History adaptada à altura útil do navegador;
- AppShowcase com telefone enquadrado na viewport;
- textos do AppShowcase alinhados de forma estável durante o GSAP;
- ritmo de scroll do AppShowcase refinado;
- seções Delivery, Lojas, Revista, Drogaria e Footer compactadas apenas no breakpoint de notebook;
- responsividade atual para desktop alto, tablet e mobile preservada.

Breakpoint principal adicionado:

```css
@media (min-width: 961px) and (max-width: 1450px) and (max-height: 820px)
```

## Validação

- TypeScript: validado com `tsc --noEmit`.
- O build local no ambiente de edição foi interrompido apenas porque o Next.js tentou baixar a fonte Montserrat do Google Fonts e o ambiente não possui acesso externo. Não houve erro de TypeScript.
