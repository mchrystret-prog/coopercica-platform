export type MagazineHighlight = { label: string; text: string };
export type MagazineEditorial = { headline: string; summary: string; highlights: MagazineHighlight[] };
export const emptyMagazineEditorial: MagazineEditorial = { headline: "", summary: "", highlights: [] };
export function magazineEditorials(content: Record<string, string>): Record<string, MagazineEditorial> {
  try {
    const parsed: unknown = JSON.parse(content.editionDetails || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).flatMap(([id, value]) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return [];
      const item = value as Record<string, unknown>;
      const highlights = Array.isArray(item.highlights) ? item.highlights.flatMap(row => {
        if (!row || typeof row !== "object") return [];
        return [{ label: typeof row.label === "string" ? row.label.slice(0, 60) : "", text: typeof row.text === "string" ? row.text.slice(0, 200) : "" }];
      }).slice(0, 8) : [];
      return [[id, { headline: typeof item.headline === "string" ? item.headline.slice(0, 140) : "", summary: typeof item.summary === "string" ? item.summary.slice(0, 700) : "", highlights }]];
    }));
  } catch { return {}; }
}
