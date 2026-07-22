# Coopercica — RC1 de navegação one-page

## Correções

- Removido o botão flutuante com seta ao final da timeline.
- Substituída a navegação nativa de âncoras por um coordenador único de scroll.
- O destino é medido somente depois do `ScrollTrigger.refresh()`, já com os `pin-spacers` aplicados.
- Adicionada correção final de posição para impedir saltos causados por fontes, imagens ou sections pinadas.
- Removido o `snap` do App Showcase, que podia disputar o controle do scroll com os links do header.
- Removidos ciclos duplicados de `ScrollTrigger.refresh()` em App Showcase e História.
- Mantido o destaque automático da section ativa no header.
- Adicionado foco acessível nas sections após a navegação, sem deslocamento adicional.
- `prefers-reduced-motion` é respeitado.

## Validação

- `npx tsc --noEmit`: aprovado.
- O build chegou à compilação de produção, mas foi interrompido exclusivamente porque o ambiente não conseguiu baixar a fonte Montserrat pelo Google Fonts.
