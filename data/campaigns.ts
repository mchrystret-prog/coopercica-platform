export interface Campaign {
  id: number;
  title: string;
  desktopImage: string;
  mobileImage: string;
  href: string;
  target?: "_self" | "_blank";
  active: boolean;
  order: number;
  backgroundColor?: string;
}

export const campaigns: Campaign[] = [
  {
    id: 1,
    title: "Arraiá de Ofertas",
    desktopImage: "/campaigns/arraia.jpg",
    mobileImage: "/campaigns/arraia.jpg",
    href: "/revista",
    target: "_self",
    active: true,
    order: 1,
    backgroundColor: "#f3f8f3",
  },
  {
    id: 2,
    title: "Mês do Cooperativismo",
    desktopImage: "/campaigns/cooperativismo.jpg",
    mobileImage: "/campaigns/cooperativismo.jpg",
    href: "/quem-somos",
    target: "_self",
    active: true,
    order: 2,
    backgroundColor: "#e8f2e9",
  },
  {
    id: 3,
    title: "Copa do Mundo",
    desktopImage: "/campaigns/copa.jpg",
    mobileImage: "/campaigns/copa.jpg",
    href: "/revista",
    target: "_self",
    active: true,
    order: 3,
    backgroundColor: "#eef7ef",
  },
];