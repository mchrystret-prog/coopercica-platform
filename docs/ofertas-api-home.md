# Ofertas na Home

CMS → Personalização → Ofertas via API configura Delivery e Drogaria separadamente. As integrações iniciam desativadas. Não há endpoint real presumido nem preços de demonstração publicados.

1. Obtenha do fornecedor um endpoint GET HTTPS que devolva JSON e ofertas vigentes.
2. Configure endpoint, caminho da lista, campos e quantidade (1–40).
3. Se o host do fornecedor não estiver nos hosts abaixo, cadastre seu nome exato em `OFFERS_API_ALLOWED_HOSTS` no servidor, separado por vírgulas. Não use URL nem curingas. Use somente hosts públicos e confiáveis.
4. Se a API usa Bearer, selecione autenticação e configure `OFFERS_DELIVERY_TOKEN` ou `OFFERS_PHARMACY_TOKEN` no servidor. Nunca inclua segredo na URL, no CMS ou em variável `NEXT_PUBLIC_`. Após alterar variáveis de ambiente, publique um novo deploy.
5. Ative, salve e clique em **Testar configuração salva**. O teste lê o cadastro salvo, não os campos ainda em edição. A resposta pública pode permanecer em cache por até 60 segundos.

Hosts iniciais: `www.coopercicadelivery.com.br`, `coopercicadelivery.com.br`, `www.coopercicadrogaria.com.br`, `coopercicadrogaria.com.br`, `sicomprasafe.yourintegration.top`. Redirecionamentos da API são recusados: configure o endpoint final.

## Contrato padrão

Resposta: array JSON. Se for `{ "products": [...] }`, use `products` como caminho; `data.items` também é aceito. O CMS permite adaptar nomes/caminhos de cada campo.

```json
[
  {
    "description": "Nome do produto",
    "ean": "7896519297894",
    "regular_price": 16.69,
    "offer_all_price": 15.99,
    "coopermais_price": 14.99,
    "unit": "un",
    "complement": "180 g",
    "image_url": "https://cdn.seu-fornecedor.com.br/produto.jpg",
    "delivery_url": "https://www.coopercicadelivery.com.br/produto/294740/acai-sport-demarchi-tradicional-zero-180gr",
    "available": true,
    "ends_at": "2026-10-31",
    "age_18": false,
    "breastfeeding_warning": false
  }
]
```

Nome e preço regular positivo são obrigatórios. Preços são em reais, nunca centavos; aceita número JSON ou texto como `16,69`. Os demais campos são opcionais. Preço de oferta comum não recebe selo Coopermais. Somente o campo de preço Coopermais recebe esse selo. Produtos indisponíveis, expirados ou inválidos são omitidos. Validade só com data é inclusiva até o fim do dia em São Paulo. Não há inferência de álcool/leite pelo nome: envie os flags. Esses flags reaproveitam os selos da biblioteca da folheteria; sem arte, o card mantém o aviso textual.

Não se infere URL a partir do EAN. Envie o endereço do produto. Cards com URL válida abrem o canal em outra aba; arrastar não navega. Imagens ausentes usam o fallback do card da folheteria.

## Operação

A rota pública `/api/home-offers?channel=delivery` (ou `pharmacy`) consulta apenas a integração cadastrada no servidor. Não aceita URLs arbitrárias do visitante. Mantém segredos no servidor, limita a resposta a 2 MB e a consulta a 8 segundos; retorna erro genérico sem expor dados da API. O navegador carrega ofertas quando a seção se aproxima da tela. Falhas/listas vazias não bloqueiam o conteúdo institucional nem seu CTA. Cache público de sucesso: 60 segundos. Sem cache de erro. Nenhuma alteração de schema/RLS ou autenticação.

Referência funcional analisada: https://empresa.coopercica.com.br/ (carrosséis separados por canal, navegação e preços regular/oferta). Cards visuais e comportamento vêm dos componentes compartilhados da folheteria.

Validação real do fornecedor depende de endpoint, contrato e credenciais do T.I. APIs com POST, OAuth, cabeçalhos especiais ou payloads não JSON precisam de um adaptador específico.
