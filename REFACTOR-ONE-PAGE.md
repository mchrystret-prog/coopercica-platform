# Refatoração one-page

## O que mudou

- O menu principal agora navega por âncoras na própria homepage.
- Os links mantêm a estrutura institucional existente:
  - Quem Somos → `#historia`
  - Nossas Lojas → `#lojas`
  - Delivery → `#delivery`
  - Drogaria → `#drogaria`
  - Revista → `#revista`
- O item ativo do menu é atualizado conforme a seção visível.
- O menu mobile fecha automaticamente após a navegação.
- A logo retorna ao início da página.
- O rodapé também utiliza navegação one-page.
- Os banners internos da Home foram direcionados para as seções correspondentes.
- O espaçador vermelho temporário foi removido.
- A seção Delivery foi corrigida, ganhou o benefício “Entrega e retirada nas lojas” e deixou de ter altura excessiva.
- Foram adicionados tokens de marca que faltavam no CSS global, foco acessível e compensação do header para as âncoras.

## Validação

- TypeScript: `tsc --noEmit` executado sem erros.
- O build local não pôde ser concluído neste ambiente porque o `next/font` tentou acessar o Google Fonts sem conexão externa.
- O lint do projeto já estava sem `eslint.config.*`, exigido pelo ESLint 9.
