import { historyItems, type HistoryItem } from "./history";

// Institutional references supplied by Coopercica, consulted on 2026-10-19:
// https://empresa.coopercica.com.br/coopercica/
// https://empresa.coopercica.com.br/coopercica/valores/index.html
// Preserve the Home timeline; enrich only the history shown on /quem-somos.
export const aboutHistoryItems: HistoryItem[] = historyItems.map(item => {
  if (item.id === "fundacao") return { ...item, eyebrow: "14 de abril de 1969", description: "62 funcionários da antiga Companhia Industrial de Conservas Alimentícias CICA fundaram a cooperativa em um espaço cedido pela fábrica. Eram 250 m², uma caixa registradora e cinco colaboradores, com o propósito de oferecer produtos de qualidade a preços justos." };
  if (item.id === "loja-1") return { ...item, eyebrow: "9 de novembro de 1978", description: "A construção da sede própria começou em 1974. Em 9 de novembro de 1978, foi inaugurada uma loja de 600 m² na Rua João Ferrara, endereço onde funciona a Loja 1." };
  return item;
});

export const aboutServices = [
  { title: "Lojas perto de você", description: "Estamos em Jundiaí, Várzea Paulista, Campo Limpo Paulista e Itupeva, oferecendo alimentos, produtos de limpeza, cuidados pessoais e utilidades para o dia a dia.", href: "/lojas", cta: "Encontre uma loja" },
  { title: "Coopercica Drogaria", description: "O cuidado com as pessoas também está nas unidades de Vila Rio Branco, Jardim São Vicente e Caxambu, com produtos e serviços voltados à saúde e ao bem-estar.", href: "https://www.coopercicadrogaria.com.br/", cta: "Conheça a Drogaria" },
  { title: "Delivery Coopercica", description: "Implantado em março de 2020, o Delivery ampliou as formas de comprar na cooperativa, levando a comodidade das compras online para a rotina dos cooperados.", href: "https://www.coopercicadelivery.com.br/", cta: "Conheça o Delivery" },
];
