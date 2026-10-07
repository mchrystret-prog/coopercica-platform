export type Partner = {
  title: string;
  description: string;
  href: string;
  theme: "red" | "green";
  icon: "bag" | "education" | "partnership";
  enabled: boolean;
};
export const defaultPartners: Partner[] = [
  { title: "Peça pelo iFood", description: "Encontre a Coopercica no iFood.", href: "https://www.ifood.com.br/", theme: "red", icon: "bag", enabled: true },
  { title: "Faculdades", description: "Cadastre a instituição e as condições da parceria antes de publicar.", href: "", theme: "green", icon: "education", enabled: false },
];
export function partnerRows(value: Record<string, string>): Partner[] {
  if (!value.items) return defaultPartners.map(item => ({ ...item }));
  try {
    const items: unknown = JSON.parse(value.items);
    if (!Array.isArray(items)) return [];
    return items.slice(0, 20).filter(item => item && typeof item === "object").map(item => ({
      title: typeof item.title === "string" ? item.title : "",
      description: typeof item.description === "string" ? item.description : "",
      href: typeof item.href === "string" ? item.href : "",
      theme: item.theme === "red" ? "red" : "green",
      icon: item.icon === "bag" || item.icon === "education" ? item.icon : "partnership",
      enabled: item.enabled === true,
    }));
  } catch { return []; }
}
export function validPartnerLink(href: string): boolean {
  try { const url = new URL(href); return url.protocol === "https:" && !url.username && !url.password; }
  catch { return false; }
}
export function validatePartners(value: Record<string, string>): string | null {
  if (value.items) {
    try { const parsed = JSON.parse(value.items); if (!Array.isArray(parsed) || parsed.length > 20 || parsed.some(item => !item || typeof item !== "object")) return "A lista de parceiros deve conter até 20 cards válidos."; }
    catch { return "Não foi possível ler a lista de parceiros."; }
  }
  for (const [index, item] of partnerRows(value).entries()) {
    if (!item.enabled) continue;
    if (!item.title.trim()) return `Informe o título do parceiro ${index + 1}.`;
    if (item.title.length > 100 || item.description.length > 240) return `Reduza o texto do parceiro ${index + 1} (título: 100; descrição: 240 caracteres).`;
    if (!validPartnerLink(item.href)) return `Informe um link HTTPS válido para o parceiro ${index + 1}.`;
  }
  return null;
}
