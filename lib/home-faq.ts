import { answerText } from "./faq-rich-text";
export type FaqItem = { id: string; question: string; answer: string; active: boolean; answerFormat?: "rich" };
export const faqDefaults: FaqItem[] = [
  { id: "lojas", question: "Onde encontro os endereços e horários das lojas?", answer: "Na seção Nossas Lojas, você pode consultar o endereço, os horários e o telefone de cada unidade da Coopercica.", active: true },
  { id: "compras", question: "Como faço minhas compras online?", answer: "Use o botão Compre Online para acessar o Delivery Coopercica e fazer suas compras.", active: true },
  { id: "ofertas", question: "Onde posso consultar os folhetos e ofertas?", answer: "Acesse a Folheteria Digital para consultar os folhetos vigentes e as condições de cada oferta.", active: true },
  { id: "vagas", question: "Como me candidato a uma vaga na Coopercica?", answer: "Acesse o portal Trabalhe Conosco, consulte as oportunidades disponíveis e envie sua candidatura pelo site.", active: true },
];
export function getFaqItems(value: Record<string, string>): FaqItem[] {
  if (value.items === undefined) return faqDefaults.map(item => ({ ...item }));
  try {
    const parsed: unknown = JSON.parse(value.items);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 30).filter(item => item && typeof item === "object").map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `faq-${index}`,
      question: typeof item.question === "string" ? item.question : "",
      answer: typeof item.answer === "string" ? item.answer : "",
      active: item.active !== false,
      ...(item.answerFormat === "rich" ? { answerFormat: "rich" as const } : {}),
    }));
  } catch { return []; }
}
export function validateFaq(value: Record<string, string>) {
  if (value.items !== undefined) {
    try { const parsed = JSON.parse(value.items); if (!Array.isArray(parsed) || parsed.length > 30) return "Cadastre no máximo 30 perguntas."; }
    catch { return "Não foi possível ler as perguntas. Revise o cadastro da FAQ."; }
  }
  if (value.enabled !== "false" && value.title !== undefined && !value.title.trim()) return "Informe o título da seção Perguntas Frequentes.";
  for (const [index, item] of getFaqItems(value).entries()) {
    if (item.active && (!item.question.trim() || !answerText(item.answer, item.answerFormat).trim())) return `Preencha a pergunta e a resposta do item ${index + 1}, ou oculte esse item.`;
    if (item.question.length > 200 || answerText(item.answer, item.answerFormat).length > 4000 || (item.answerFormat === "rich" && item.answer.length > 32000)) return `O item ${index + 1} excede o limite de texto.`;
  }
  return null;
}
