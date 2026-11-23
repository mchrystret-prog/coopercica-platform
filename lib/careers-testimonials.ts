export type CareersTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  tenure: string;
  order: number;
  active: boolean;
};

export const careersTestimonialDefaults: CareersTestimonial[] = [
  {
    id: "cleo-moraes",
    quote: "Essa empresa não é só uma cooperativa, é uma família, que sempre valorizou as pessoas e enxergou cada cooperado como ser humano. Foi isso que me fez permanecer aqui.",
    name: "Cleo Moraes",
    role: "Gerente de Relacionamento",
    tenure: "49 anos de casa",
    order: 1,
    active: true,
  },
  {
    id: "marcia-santos",
    quote: "Na Coopercica somos uma família. Para mim, a Coopercica é muito mais do que um trabalho, é um lugar onde construí laços de respeito, amizade e parceria. São 23 anos de uma trajetória marcada por aprendizados, apoio e crescimento constante. Minha gratidão por fazer parte desta história e por compartilhar tantos momentos especiais ao longo dessa caminhada.",
    name: "Marcia Santos",
    role: "Auxiliar Administrativo",
    tenure: "23 anos de casa",
    order: 2,
    active: true,
  },
  {
    id: "maria-do-carmo",
    quote: "Com mais de 22 anos de casa, vejo a Coopercica como um exemplo de empresa unida e que dá a devida importância ao funcionário. Trabalhar aqui é bom demais.",
    name: "Maria do Carmo",
    role: "Operadora de Caixa",
    tenure: "22 anos de casa",
    order: 3,
    active: true,
  },
  {
    id: "israel-lemos",
    quote: "É uma grande satisfação fazer parte dessa história. São anos de dedicação, aprendizado e conquistas. Sou muito grato pela oportunidade, pela confiança e por todas as pessoas que fizeram parte dessa caminhada. Que venham muitos outros anos de sucesso!",
    name: "Israel Lemos",
    role: "Auxiliar de Criação",
    tenure: "13 anos de casa",
    order: 4,
    active: true,
  },
];

function parseEntries(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function parseCareersTestimonials(value: unknown): CareersTestimonial[] {
  if (value == null) return careersTestimonialDefaults.map((item) => ({ ...item }));
  const data = typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const entries = parseEntries(data.testimonials) ?? parseEntries(value);
  if (!entries) return careersTestimonialDefaults.map((item) => ({ ...item }));
  return entries
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item, index) => ({
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `testimonial-${index + 1}`,
      quote: typeof item.quote === "string" ? item.quote.trim().slice(0, 3000) : "",
      name: typeof item.name === "string" ? item.name.trim().slice(0, 160) : "",
      role: typeof item.role === "string" ? item.role.trim().slice(0, 160) : "",
      tenure: typeof item.tenure === "string" ? item.tenure.trim().slice(0, 100) : "",
      order: Number.isFinite(Number(item.order)) ? Math.max(1, Math.floor(Number(item.order))) : index + 1,
      active: item.active === true,
    }));
}

export function getActiveCareersTestimonials(value: unknown): CareersTestimonial[] {
  return parseCareersTestimonials(value)
    .filter((item) => item.active && item.quote && item.name)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
