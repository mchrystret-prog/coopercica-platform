export interface AppShowcaseItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const appShowcaseItems = [
  {
    id: "home",
    eyebrow: "APLICATIVO COOPERCICA",
    title: "TUDO EM UM SÓ LUGAR.",
    description:
      "Encontre ofertas, folhetos, revistas e muito mais em um único aplicativo.",
    image: "/app/home.jpeg",
    imageAlt: "Tela inicial do aplicativo Coopercica",
  },
  {
    id: "delivery",
    eyebrow: "DELIVERY",
    title: "COMPRE DE ONDE ESTIVER.",
    description:
      "Faça seu pedido pelo app com a mesma qualidade e confiança das nossas lojas.",
    image: "/app/delivery.jpeg",
    imageAlt: "Tela do Delivery Coopercica",
  },
  {
    id: "coopermais",
    eyebrow: "COOPERMAIS",
    title: "BENEFÍCIOS QUE ACOMPANHAM VOCÊ.",
    description:
      "Informe seu CPF de Cliente Coopermais e aproveite vantagens exclusivas em cada compra.",
    image: "/app/coopermais.jpeg",
    imageAlt: "Tela do programa Coopermais",
  },
];