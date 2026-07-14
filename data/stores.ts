export interface Store {
  id: number;

  storeNumber: number;

  slug: string;

  name: string;

  city: string;

  neighborhood: string;

  address: string;

  phone: string;

  hours: string;

  image: string;

  maps: string;

  latitude?: number;

  longitude?: number;

  featured?: boolean;

  active: boolean;

  services: string[];
}

export const stores: Store[] = [
  {
    id: 1,
    storeNumber: 1,
    slug: "jardim-cica",
    name: "Jardim Cica",
    city: "Jundiaí",
    neighborhood: "Jardim Cica",
    address: "Rua João Ferrara, 233",
    phone: "(11) 3378-2800",
    hours: "Seg a Sáb: 07h às 22h | Dom: 07h às 20h",
    image: "/stores/jardim-cica.jpg",
    maps: "https://maps.app.goo.gl/brDJneFt8p4KmMJJ9",
    featured: true,
    active: true,
    services: ["Padaria", "Açougue", "Drogaria", "Delivery"]
  },

  {
    id: 2,
    storeNumber: 2,
    slug: "eloy-chaves",
    name: "Eloy Chaves",
    city: "Jundiaí",
    neighborhood: "Parque Residencial Eloy Chaves",
    address: "Rua Romeu Seckler Machado, 105",
    phone: "(11) 4581-9028",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/eloy-chaves.jpg",
    maps: "",
    featured: false,
    active: true,
    services: ["Padaria", "Açougue", "Delivery"]
  },

  {
    id: 3,
    storeNumber: 3,
    slug: "vila-rio-branco",
    name: "Vila Rio Branco",
    city: "Jundiaí",
    neighborhood: "Vila Rio Branco",
    address: "Av. Antônio Frederico Ozanan, 6001",
    phone: "(11) 3378-1666",
    hours: "Seg a Sáb: 07h às 22h | Dom: 07h às 20h",
    image: "/stores/vila-rio-branco.jpg",
    maps: "",
    featured: false,
    active: true,
    services: ["Padaria", "Açougue", "Drogaria", "Delivery"]
  },

  {
    id: 4,
    storeNumber: 4,
    slug: "jardim-sao-vicente",
    name: "Jardim São Vicente",
    city: "Jundiaí",
    neighborhood: "Jardim São Vicente",
    address: "Rua Hisashi Nagaoka, 3595",
    phone: "(11) 3308-6488",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/jardim-sao-vicente.jpg",
    maps: "",
    featured: false,
    active: true,
    services: ["Padaria", "Açougue", "Drogaria", "Delivery"]
  },

  {
    id: 5,
    storeNumber: 5,
    slug: "jardim-santa-lucia",
    name: "Jardim Santa Lúcia",
    city: "Campo Limpo Paulista",
    neighborhood: "Jardim Santa Lúcia",
    address: "Rua Maria José Rodrigues, 90",
    phone: "(11) 4812-9610",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/jardim-santa-lucia.jpg",
    maps: "",
    featured: false,
    active: true,
    services: ["Padaria", "Açougue", "Delivery"]
  },

  {
    id: 6,
    storeNumber: 6,
    slug: "caxambu",
    name: "Caxambu",
    city: "Jundiaí",
    neighborhood: "Caxambu",
    address: "Av. Humberto Cereser, 3805",
    phone: "(11) 4584-9530",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/caxambu.jpg",
    maps: "",
    featured: false,
    active: true,
    services: ["Padaria", "Açougue", "Drogaria", "Delivery", "Lotérica"]
  },

  {
    id: 7,
    storeNumber: 7,
    slug: "jardim-promeca",
    name: "Jardim Promeca",
    city: "Várzea Paulista",
    neighborhood: "Jardim Promeca",
    address: "Av. Duque de Caxias, 2395",
    phone: "(11) 3109-1434",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/jardim-promeca.jpg",
    maps: "",
    featured: false,
    active: true,
    services: ["Padaria", "Açougue", "Delivery"]
  },

  {
    id: 8,
    storeNumber: 8,
    slug: "centro-varzea",
    name: "Centro",
    city: "Várzea Paulista",
    neighborhood: "Centro",
    address: "Av. Fernão Dias Paes Leme, 2211",
    phone: "(11) 2923-8000",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/centro-varzea.jpg",
    maps: "",
    featured: false,
    active: true,
    services: ["Padaria", "Açougue", "Delivery"]
  },

  {
    id: 9,
    storeNumber: 9,
    slug: "itupeva",
    name: "Itupeva",
    city: "Itupeva",
    neighborhood: "Centro",
    address: "Av. José Tonoli, 336",
    phone: "(11) 4961-1999",
    hours: "Todos os dias • 07h às 22h",
    image: "/stores/itupeva.jpg",
    maps: "",
    featured: false,
    active: true,
    services: ["Padaria", "Açougue", "Delivery"]
  }
];