export interface HistoryItem {
  id: string;
  year: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  theme: "light" | "soft" | "medium" | "dark";
}

export const historyItems: HistoryItem[] = [
  {
    id: "fundacao",
    year: "1969",
    eyebrow: "Abril de 1969",
    title: "Nasce a Coopercica.",
    description:
      "Tudo começou com a união de 62 colaboradores da CICA, que criaram uma cooperativa baseada em confiança, economia e compromisso com as pessoas.",
    image: "/history/1969.jpg",
    imageAlt: "Instalações da CICA em 1969",
    theme: "light",
  },
  {
    id: "loja-1",
    year: "1978",
    eyebrow: "Novembro de 1978",
    title: "A primeira loja própria.",
    description:
      "Na Rua João Ferrara, a Coopercica inaugurou sua primeira loja e iniciou uma nova fase de crescimento junto à comunidade.",
    image: "/history/1978.jpg",
    imageAlt: "Inauguração da Loja 1 da Coopercica em 1978",
    theme: "soft",
  },
  {
    id: "loja-2",
    year: "1991",
    eyebrow: "Abril de 1991",
    title: "A expansão ganha força.",
    description:
      "Com a inauguração da Loja 2, a Coopercica ampliou sua presença e ficou ainda mais próxima das famílias da região.",
    image: "/history/1991.jpg",
    imageAlt: "Inauguração da Loja 2 da Coopercica em 1991",
    theme: "medium",
  },
  {
    id: "loja-3",
    year: "1996",
    eyebrow: "Agosto de 1996",
    title: "Mais pessoas. Mais comunidade.",
    description:
      "A Loja 3 marcou um novo capítulo de expansão, fortalecendo a relação da cooperativa com seus clientes e cooperados.",
    image: "/history/1996.jpg",
    imageAlt: "Inauguração da Loja 3 da Coopercica em 1996",
    theme: "light",
  },
  {
    id: "loja-4",
    year: "2003",
    eyebrow: "Dezembro de 2003",
    title: "Uma nova fase.",
    description:
      "A inauguração da Loja 4 representou modernização, investimento e a continuidade de uma história construída com confiança.",
    image: "/history/2003.jpg",
    imageAlt: "Inauguração da Loja 4 da Coopercica em 2003",
    theme: "soft",
  },
  {
    id: "loja-5",
    year: "2008",
    eyebrow: "Dezembro de 2008",
    title: "O crescimento continua.",
    description:
      "Cada nova unidade reforçou o compromisso da Coopercica com qualidade, proximidade e atendimento às comunidades da região.",
    image: "/history/2008.jpg",
    imageAlt: "Inauguração da Loja 5 da Coopercica em 2008",
    theme: "medium",
  },
  {
    id: "loja-6",
    year: "2013",
    eyebrow: "Março de 2013",
    title: "Mais uma conquista.",
    description:
      "A Loja 6 ampliou a atuação da Coopercica e levou a experiência da cooperativa para ainda mais clientes.",
    image: "/history/2013.jpg",
    imageAlt: "Inauguração da Loja 6 da Coopercica em 2013",
    theme: "light",
  },
  {
    id: "drogaria",
    year: "2014",
    eyebrow: "Outubro de 2014",
    title: "Nasce a Coopercica Drogaria.",
    description:
      "A cooperativa deu mais um passo no cuidado com as pessoas, ampliando sua atuação para saúde, bem-estar e qualidade de vida.",
    image: "/history/2014.jpg",
    imageAlt: "Inauguração da Drogaria Coopercica em 2014",
    theme: "soft",
  },
  {
    id: "loja-7",
    year: "2018",
    eyebrow: "Dezembro de 2018",
    title: "Chegamos a Várzea Paulista.",
    description:
      "A inauguração da Loja 7 marcou a expansão regional e o início de uma nova relação com a comunidade de Várzea Paulista.",
    image: "/history/2018.jpg",
    imageAlt: "Inauguração da Loja 7 da Coopercica em 2018",
    theme: "medium",
  },
  {
    id: "loja-8",
    year: "2021",
    eyebrow: "Outubro de 2021",
    title: "Seguimos crescendo.",
    description:
      "A Loja 8 reforçou a presença da Coopercica na região e manteve vivo o propósito de estar sempre perto das pessoas.",
    image: "/history/2021.jpg",
    imageAlt: "Inauguração da Loja 8 da Coopercica em 2021",
    theme: "light",
  },
  {
    id: "loja-9",
    year: "2022",
    eyebrow: "Maio de 2022",
    title: "Chegamos a Itupeva.",
    description:
      "A Loja 9 levou a Coopercica a uma nova cidade, ampliando a rede e fortalecendo o compromisso com o desenvolvimento regional.",
    image: "/history/2022.jpg",
    imageAlt: "Inauguração da Loja 9 da Coopercica em 2022",
    theme: "soft",
  },
  {
    id: "hoje",
    year: "Hoje",
    eyebrow: "Uma história que continua",
    title: "Cooperar é crescer juntos.",
    description:
      "São 9 lojas, Drogaria, Delivery, Revista, Coopermais e milhares de histórias construídas ao lado das comunidades de Jundiaí e região.",
    image: "/history/hoje.jpg",
    imageAlt: "Coopercica atualmente",
    theme: "dark",
  },
];
