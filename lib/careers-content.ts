// Institutional copy: https://empresa.coopercica.com.br/coopercica/valores/index.html
// History: https://empresa.coopercica.com.br/coopercica/
export const careersDefaults = {
  heroTitle: "O próximo capítulo da nossa história pode ter você.",
  heroIntro: "Desde 1969, a Coopercica aproxima pessoas por meio da cooperação. Venha colocar seu talento a serviço de uma história que continua sendo construída todos os dias.",
  manifestoTitle: "O que nos une faz a diferença.",
  manifesto: "Nossa história começou com 62 pessoas que decidiram cooperar. Gente que encontrou no trabalho em conjunto uma forma de levar qualidade e preços justos às famílias.\n\nHoje, esse propósito continua vivo em cada atendimento, em cada cuidado com os produtos e em cada pessoa que faz a Coopercica acontecer.\n\nQueremos seguir escrevendo essa história com quem acredita no valor de fazer parte. Se você também acredita na força da cooperação, venha com a gente.",
  mission: "Buscar continuamente a satisfação dos Cooperados, oferecendo produtos de qualidade com excelência no atendimento e na prestação de serviços.",
  vision: "Ser reconhecida como referência em boas práticas de varejo no segmento de bens de consumo, promovendo a manutenção adequada das unidades existentes, expandindo de forma criteriosa, sustentável e organizada. Manter-se como uma rede altamente conceituada pelos seus Cooperados e Comunidade em geral.",
  respect: "Agir com consideração e respeito com toda a comunidade, cooperados, colaboradores e fornecedores.",
  ethics: "Agir seguindo os princípios morais com honestidade, responsabilidade, competência e sustentabilidade.",
  cooperation: "União de pessoas agindo em parceira uns com os outros tendo os mesmos objetivos. Praticar a solidariedade, estimulando a confiança, democracia e espírito de equipe, visando o bem comum.",
};
export type CareersContent = typeof careersDefaults;
export function getCareersContent(value: unknown): CareersContent {
  const data = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
  return Object.fromEntries(Object.entries(careersDefaults).map(([key, fallback]) => [
    key, typeof data[key] === "string" && data[key].trim()
      ? data[key].trim().slice(0, 5000) : fallback,
  ])) as CareersContent;
}
