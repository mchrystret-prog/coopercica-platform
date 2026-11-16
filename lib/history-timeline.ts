import { historyItems, type HistoryItem } from "../data/history";

export type HistoryEntry = Partial<HistoryItem> & { id: string; active?: boolean };
const fields = ["year", "eyebrow", "title", "description", "image", "imageAlt"] as const;
export function historyEntries(settings: Record<string, string>): HistoryEntry[] {
  if (!settings.__timeline) return historyItems.map(({ id }) => ({ id }));
  try {
    const value: unknown = JSON.parse(settings.__timeline);
    if (!Array.isArray(value) || value.length > 80) throw new Error();
    const seen = new Set<string>();
    return value.map(entry => {
      if (!entry || typeof entry.id !== "string" || !/^[a-zA-Z0-9-]+$/.test(entry.id) || seen.has(entry.id)) throw new Error();
      seen.add(entry.id);
      const clean: HistoryEntry = { id: entry.id, active: entry.active !== false };
      for (const field of fields) if (typeof entry[field] === "string") clean[field] = entry[field];
      if (["light", "soft", "medium", "dark"].includes(entry.theme)) clean.theme = entry.theme;
      return clean;
    });
  } catch { return historyItems.map(({ id }) => ({ id })); }
}

export function resolveHistory(settings: Record<string, string>, defaults = historyItems, includeInactive = false): HistoryItem[] {
  return historyEntries(settings).filter(item => includeInactive || item.active !== false).map(entry => {
    const original = defaults.find(item => item.id === entry.id);
    const item = { year: "", eyebrow: "", title: "", description: "", image: "", imageAlt: "", theme: "light" as const, ...original, ...entry };
    return { ...item, image: settings[item.id] || item.image };
  });
}

export function validateHistory(settings: Record<string, string>): string | null {
  const entries = historyEntries(settings);
  for (const item of resolveHistory(settings)) {
    if (!item.year.trim() || item.year.length > 30 || !item.title.trim() || item.title.length > 160 || !item.description.trim() || item.description.length > 4000)
      return `Preencha ano, título e descrição do marco ${item.year || "novo"} (até 30, 160 e 4000 caracteres).`;
    if (!item.image || !item.imageAlt.trim()) return `Adicione uma imagem e sua descrição ao marco ${item.year}.`;
  }
  return entries.length > 80 ? "Use até 80 marcos na timeline." : null;
}
