export interface AppShowcaseItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const appShowcaseItems: AppShowcaseItem[] = [
  {
    id: "home",
    eyebrow: "Aplicativo Coopercica",
    title: "Tudo em um só lugar.",
    description:
      "Acesse ofertas, Delivery, folhetos, Coopermais e muito mais em um único aplicativo.",
    image: "/app/home.png",
    imageAlt: "Tela inicial do aplicativo Coopercica",
  },
  {
    id: "delivery",
    eyebrow: "Delivery",
    title: "Compre onde estiver.",
    description:
      "Faça suas compras online e receba seus produtos com praticidade.",
    image: "/app/delivery.png",
    imageAlt: "Tela do Delivery",
  },
  {
    id: "ofertas",
    eyebrow: "Ofertas",
    title: "Economize todos os dias.",
    description:
      "Confira as melhores promoções e ofertas exclusivas para você.",
    image: "/app/ofertas.png",
    imageAlt: "Tela de ofertas",
  },
  {
    id: "folhetos",
    eyebrow: "Folhetos",
    title: "Ofertas sempre atualizadas.",
    description:
      "Consulte os tabloides digitais diretamente pelo aplicativo.",
    image: "/app/folhetos.png",
    imageAlt: "Tela de folhetos",
  },
  {
    id: "coopermais",
    eyebrow: "Cliente Coopermais",
    title: "Mais vantagens para você.",
    description:
      "Identifique-se pelo CPF e aproveite benefícios exclusivos.",
    image: "/app/coopermais.png",
    imageAlt: "Tela Coopermais",
  },
  {
    id: "pedidos",
    eyebrow: "Pedidos",
    title: "Acompanhe suas compras.",
    description:
      "Veja o histórico e acompanhe seus pedidos em tempo real.",
    image: "/app/pedidos.png",
    imageAlt: "Tela de pedidos",
  },
];