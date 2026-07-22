import type { Campaign, Magazine, Store } from "@/types/content";

export const campaigns: Campaign[] = [
  { id: "julina", title: "Mió que essa tradição num tem", eyebrow: "Campanha vigente", image: "/placeholders/campaign-julina.svg", mobileImage: "/placeholders/campaign-julina.svg", href: "/revista", cta: "Confira a campanha", active: true, order: 1, accent: "#f5b82e" },
  { id: "delivery", title: "Suas compras, do nosso jeito, onde você estiver", eyebrow: "Coopercica Delivery", image: "/placeholders/campaign-delivery.svg", mobileImage: "/placeholders/campaign-delivery.svg", href: "https://www.coopercicadelivery.com.br/", cta: "Comprar agora", active: true, order: 2, accent: "#64b445" },
  { id: "coopermais", title: "Vantagens que acompanham a sua rotina", eyebrow: "Cliente Coopermais", image: "/placeholders/campaign-coopermais.svg", mobileImage: "/placeholders/campaign-coopermais.svg", href: "#coopermais", cta: "Conheça", active: true, order: 3, accent: "#0d5b32" }
];

export const stores: Store[] = [
  {
    id: "loja-1",
    name: "Loja 1",
    neighborhood: "Jardim Cica",
    city: "Jundiaí",
    address: "Rua João Ferrara, 233",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-01.jpg",
    mapsUrl: "https://maps.app.goo.gl/brDJneFt8p4KmMJJ9"
  },

  {
    id: "loja-2",
    name: "Loja 2",
    neighborhood: "Parque Residencial Eloy Chaves",
    city: "Jundiaí",
    address: "Rua Romeu Seckler Machado, 105",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-02.jpg",
    mapsUrl: ""
  },

  {
    id: "loja-3",
    name: "Loja 3",
    neighborhood: "Vila Rio Branco",
    city: "Jundiaí",
    address: "Av. Antônio Frederico Ozanan, 6001",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-03.jpg",
    mapsUrl: ""
  },

  {
    id: "loja-4",
    name: "Loja 4",
    neighborhood: "Jardim São Vicente",
    city: "Jundiaí",
    address: "Rua Hisashi Nagaoka, 3595",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-04.jpg",
    mapsUrl: ""
  },

  {
    id: "loja-5",
    name: "Loja 5",
    neighborhood: "Jardim Santa Lúcia",
    city: "Campo Limpo Paulista",
    address: "Rua Maria José Rodrigues, 90",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-05.jpg",
    mapsUrl: ""
  },

  {
    id: "loja-6",
    name: "Loja 6",
    neighborhood: "Caxambu",
    city: "Jundiaí",
    address: "Av. Humberto Cereser, 3805",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-06.jpg",
    mapsUrl: ""
  },

  {
    id: "loja-7",
    name: "Loja 7",
    neighborhood: "Jardim Promeca",
    city: "Várzea Paulista",
    address: "Av. Duque de Caxias, 2395",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-07.jpg",
    mapsUrl: ""
  },

  {
    id: "loja-8",
    name: "Loja 8",
    neighborhood: "Centro",
    city: "Várzea Paulista",
    address: "Av. Fernão Dias Paes Leme, 2211",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-08.jpg",
    mapsUrl: ""
  },

  {
    id: "loja-9",
    name: "Loja 9",
    neighborhood: "Centro",
    city: "Itupeva",
    address: "Av. José Tonoli, 336",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/loja-09.jpg",
    mapsUrl: ""
  }
];

export const magazines: Magazine[] = [
  {
    id: "ed-01",
    title: "Julho 2026",
    edition: "Mês do Cooperativismo",
    cover: "/images/magazines/edicao-atual.png",
    href: "#",
  },
  {
    id: "ed-02",
    title: "Junho 2026",
    edition: "Mês das Mães",
    cover: "/images/magazines/edicao-anterior.jpeg",
    href: "#",
  },
  {
    id: "ed-03",
    title: "Maio 2026",
    edition: "Arraiá de Ofertas",
    cover: "/images/magazines/especial.jpg",
    href: "#",
  },
];
