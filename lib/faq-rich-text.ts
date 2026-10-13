export type AnswerSegment = { text: string; bold?: boolean; italic?: boolean; href?: string };
export function answerLink(raw: string): string | null {
  const value = raw.trim();
  if (!value || /[\s\\\u0000-\u001f\u007f]/.test(value)) return null;
  if ((value.startsWith("/") && !value.startsWith("//")) || value.startsWith("#")) return value;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function answerSegments(answer: string, format?: string): AnswerSegment[] {
  if (format !== "rich") return [{ text: answer }];
  if (answer.length > 32000) return [];
  try {
    const parsed: unknown = JSON.parse(answer);
    if (!Array.isArray(parsed) || parsed.length > 1000) return [];
    return parsed.filter(item => item && typeof item.text === "string").map(item => ({
      text: item.text, bold: item.bold === true, italic: item.italic === true,
      href: typeof item.href === "string" ? answerLink(item.href) || undefined : undefined,
    }));
  } catch { return []; }
}
export function answerText(answer: string, format?: string) { return answerSegments(answer, format).map(item => item.text).join(""); }
