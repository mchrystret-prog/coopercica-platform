/** Layout-based suggestions only: never invent articles or infer body copy. */
export type PdfText = { str: string; width: number; height: number; transform: number[] };
export type PdfTextPage = { number: number; width: number; height: number; items: PdfText[] };
export type MagazinePdfSuggestion = {
  summary: string;
  highlights: { label: string; text: string; page: number }[];
  pagesRead: number;
  totalPages: number;
};
type Line = { text: string; x: number; y: number; width: number; size: number };
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const categories = ["Dicas da nutri", "Deu água na boca", "Do momento", "Fique bem", "É dia", "Receitas", "Saúde e bem-estar", "Bem-estar", "Sustentabilidade", "Cooperar", "Nossa gente"];

export function pdfTextLines(page: PdfTextPage): Line[] {
  const lines: Line[] = [];
  const items = page.items.filter(item => item.str.trim() && item.transform.length >= 6)
    .map(item => ({ text: item.str.replace(/\s+/g, " ").trim(), x: item.transform[4], y: item.transform[5], width: item.width, size: Math.abs(item.height) || Math.hypot(item.transform[2], item.transform[3]) }))
    .filter(item => Number.isFinite(item.x + item.y + item.size + item.width))
    .sort((a, b) => b.y - a.y || a.x - b.x);
  for (const item of items) {
    // Keep independent columns separate, even when their baselines coincide.
    const line = lines.find(row => Math.abs(row.y - item.y) <= Math.max(2, Math.min(row.size, item.size) * .2)
      && item.x >= row.x && item.x - (row.x + row.width) <= Math.max(16, item.size * 2));
    if (line) {
      line.text += " " + item.text;
      line.width = Math.max(line.width, item.x + item.width - line.x);
      line.size = Math.max(line.size, item.size);
    } else lines.push({ ...item });
  }
  return lines.sort((a, b) => b.y - a.y || a.x - b.x);
}

const cleanTitle = (text: string) => text.replace(/\s*\.{2,}\s*\d+\s*$/, "").replace(/\s+\d{1,3}\s*$/, "").replace(/^[\s:|–—-]+/, "").replace(/\s+/g, " ").trim();
const validTitle = (text: string) => text.length >= 5 && text.length <= 200 && /[a-zÀ-ÿ]/i.test(text)
  && !/(https?:|www\.|@|R\$|\d+[,.]\d{2}|\b(?:expediente|sumário|editorial)\b)/i.test(text);

export function suggestMagazineEditorial(pages: PdfTextPage[], totalPages = pages.length): MagazinePdfSuggestion {
  const highlights: MagazinePdfSuggestion["highlights"] = [];
  let textLength = 0;
  const seen = new Set<string>();
  for (const page of pages) {
    const lines = pdfTextLines(page);
    textLength += lines.reduce((sum, line) => sum + line.text.length, 0);
    const sizes = lines.map(line => line.size).sort((a, b) => a - b);
    const bodySize = sizes[Math.floor(sizes.length / 4)] || 12;
    for (const line of lines) {
      if (line.y < page.height * .08) continue;
      const normalized = normalize(line.text);
      const label = categories.find(name => normalized === normalize(name) || normalized.startsWith(normalize(name) + " ") || normalized.startsWith(normalize(name) + ":"));
      if (!label) continue;
      let title = cleanTitle(line.text.slice(label.length));
      if (!validTitle(title)) {
        const candidates = lines.filter(candidate => candidate.y < line.y - 3 && line.y - candidate.y < 180
          && candidate.y > page.height * .1 && Math.abs(candidate.x - line.x) < page.width * .18
          && candidate.size >= Math.max(12.5, bodySize * 1.2) && validTitle(cleanTitle(candidate.text))
          && !categories.some(name => normalize(candidate.text) === normalize(name)));
        const first = candidates[0];
        if (!first) continue;
        title = cleanTitle(first.text);
        const next = candidates[1];
        if (next && first.y - next.y <= first.size * 1.8 && Math.abs(next.size - first.size) < first.size * .15
          && title.length + next.text.length < 200) title = cleanTitle(title + " " + next.text);
      }
      const key = normalize(label + ":" + title);
      if (!validTitle(title) || seen.has(key)) continue;
      seen.add(key);
      if (highlights.length < 8) highlights.push({ label, text: title, page: page.number });
    }
  }
  if (textLength < 30) throw new Error("Este PDF não tem texto extraível suficiente. PDFs digitalizados ou com letras convertidas em desenho precisam de OCR. Preencha os campos manualmente ou envie uma versão com texto selecionável.");
  if (!highlights.length) throw new Error("O texto foi lido, mas não identificamos quadros e títulos com segurança. Preencha os destaques manualmente. O reconhecimento depende da organização do PDF.");
  const titles: string[] = [];
  for (const item of highlights) {
    if (("Nesta edição: " + [...titles, item.text].join("; ") + ".").length > 700) break;
    titles.push(item.text);
  }
  return { summary: "Nesta edição: " + titles.join("; ") + ".", highlights, pagesRead: pages.length, totalPages };
}
